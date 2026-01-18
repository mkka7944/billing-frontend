import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
    X, User, MapPin, Calendar, Clock, Image as ImageIcon,
    CreditCard, ExternalLink, AlertCircle, FileText, CheckCircle2,
    RotateCcw, Maximize2, ZoomIn, ZoomOut, Move, ChevronLeft, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { shortenAreaName, formatLocationLabel } from '../lib/utils'
import { StatusBadge, CopyButton, CurrencyText, ErrorNode } from './common/UIComponents'

export default function RecordDetail({ surveyId, onClose }) {
    const [data, setData] = useState(null)
    const [bills, setBills] = useState([])
    const [financials, setFinancials] = useState({ totalDue: 0, totalPaid: 0, outstanding: 0, recoveryRate: 0, lastPaidDate: null })
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (surveyId) {
            // Reset states before fetching new unit
            setData(null)
            setBills([])
            setFinancials({ totalDue: 0, totalPaid: 0, outstanding: 0, recoveryRate: 0, lastPaidDate: null })
            setZoom(1)
            setPosition({ x: 0, y: 0 })
            fetchData()
        }
    }, [surveyId])

    const handleReset = () => {
        setZoom(1)
        setPosition({ x: 0, y: 0 })
    }

    // Handle Keyboard Navigation for Gallery
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isGalleryOpen) return
            if (e.key === 'Escape') setIsGalleryOpen(false)
            if (e.key === 'ArrowRight') setActiveImage(prev => (prev + 1) % (data?.image_urls?.length || 1))
            if (e.key === 'ArrowLeft') setActiveImage(prev => (prev - 1 + (data?.image_urls?.length || 1)) % (data?.image_urls?.length || 1))
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isGalleryOpen, data])

    async function fetchData() {
        if (!surveyId) return

        try {
            setLoading(true)

            // 1. Fetch Survey Unit Basic Info
            const { data: surveyData, error: surveyError } = await supabase
                .from('survey_units')
                .select('*')
                .eq('survey_id', surveyId)
                .single()

            if (surveyError) throw surveyError
            if (!surveyData) throw new Error('No record found for the provided ID')

            setData(surveyData)

            // 2. Fetch Billing History
            const { data: billingData, error: billingError } = await supabase
                .from('bills')
                .select('*')
                .eq('survey_id', surveyId)
                .order('bill_month', { ascending: false })

            if (billingError) throw billingError

            // Calculate Financial Summary
            const history = billingData || []
            setBills(history)

            const summary = history.reduce((acc, bill) => {
                acc.totalDue += (bill.amount_due || 0)
                acc.totalPaid += (bill.amount_paid || 0)
                if (bill.payment_status !== 'PAID') {
                    acc.outstanding += (bill.amount_due || 0)
                }
                if (bill.payment_status === 'PAID') {
                    if (!acc.lastPaidDate || new Date(bill.paid_date) > new Date(acc.lastPaidDate)) {
                        acc.lastPaidDate = bill.paid_date
                    }
                }
                return acc
            }, { totalDue: 0, totalPaid: 0, outstanding: 0, lastPaidDate: null })

            summary.recoveryRate = summary.totalDue > 0
                ? (summary.totalPaid / summary.totalDue) * 100
                : 0

            setFinancials(summary)

        } catch (err) {
            console.error('Error fetching detail:', err)
            // We can optionally set an error state here to show in UI
        } finally {
            setLoading(false)
        }
    }

    if (!surveyId) return null

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-white/5 animate-fade-in overflow-hidden transition-colors font-sans">
            {/* v4.12 Calibrated Header */}
            <div className="bg-white dark:bg-slate-900 relative z-30 shrink-0">
                <div className="flex items-stretch h-14 border-b border-slate-200 dark:border-white/5">
                    {/* ID Segment - Reverted size */}
                    <div className="px-6 flex items-center bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shrink-0 font-display font-black tracking-tighter tabular-nums leading-none text-xl md:text-2xl">
                        {surveyId}
                    </div>

                    {/* Metadata Segment - Calibrated Typography */}
                    <div className="flex-1 flex items-center px-4 gap-4 min-w-0 bg-slate-50/10 dark:bg-slate-900 border-x border-slate-200 dark:border-white/10">
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] md:text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-tight overflow-hidden break-words block max-h-8">
                                {data?.surveyor_name || 'AUTO'}
                            </span>
                        </div>

                        {/* Date/Time - Calibrated */}
                        <div className="flex flex-col items-end shrink-0 border-l border-slate-200 dark:border-white/10 pl-4 h-8 justify-center">
                            <span className="text-[11px] font-black text-indigo-500 tabular-nums leading-none mb-0.5">
                                {data?.survey_date || 'N/A'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tabular-nums leading-none">
                                {data?.survey_time || '--:--'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-14 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all active:scale-95 shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-medium font-display tracking-widest uppercase">Calibrating Scale...</span>
                </div>
            ) : data ? (
                <>
                    <div className="flex-1 overflow-y-auto scrollbar-hide no-scrollbar">
                        {/* v4.10 Compact Hero + Navigation Restoration */}
                        <div
                            className="relative h-[340px] overflow-hidden bg-white dark:bg-slate-900 group cursor-zoom-in"
                            onClick={() => setIsGalleryOpen(true)}
                        >
                            <AnimatePresence mode="wait">
                                {data.image_urls && data.image_urls.length > 0 ? (
                                    <>
                                        <motion.img
                                            key={activeImage}
                                            src={data.image_urls[activeImage]}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* v4.20 Legibility Scrim - Soft top gradient for text contrast */}
                                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none z-10" />

                                        {/* v4.20 Moved Zoom Button - Top Left Integrated */}
                                        <div
                                            className="absolute top-20 left-4 bg-white/10 backdrop-blur-xl p-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-40 shadow-xl cursor-pointer hover:bg-white/20 active:scale-95"
                                            onClick={(e) => { e.stopPropagation(); setIsGalleryOpen(true); }}
                                        >
                                            <Maximize2 size={16} className="text-white drop-shadow-md" />
                                        </div>

                                        {/* v4.19 Ultra-Subtle Overlays - Edge-Touching & Transparent */}
                                        <div className="absolute top-0 left-0 right-0 px-0 flex justify-between items-start pointer-events-none z-20">
                                            {/* Identity Overlay */}
                                            <div className="p-4 max-w-[260px] bg-black/5 backdrop-blur-[2px] flex flex-col gap-0.5 pointer-events-none rounded-br-2xl border-r border-b border-white/5">
                                                <div className="bg-white/10 backdrop-blur-sm text-[7px] font-black text-white px-1.5 py-0.5 rounded leading-none uppercase tracking-[0.2em] w-fit mb-1 border border-white/5">
                                                    IMAGE {activeImage + 1} / {data.image_urls.length}
                                                </div>
                                                <h3 className="text-base font-bold text-white tracking-tight leading-none mb-0.5 drop-shadow-lg">{data.consumer_name || 'Anonymous'}</h3>
                                                <p className="text-[10px] font-medium text-white/70 flex items-center gap-1.5 leading-tight max-w-[220px] drop-shadow-md">
                                                    <MapPin size={10} className="text-white/40 shrink-0" />
                                                    {data.address || 'Address unverified'}
                                                </p>
                                            </div>

                                            {/* Regional Overlay */}
                                            <div className="p-4 max-w-[200px] bg-black/5 backdrop-blur-[2px] flex flex-col items-end pointer-events-none rounded-bl-2xl border-l border-b border-white/5">
                                                <span className="text-[11px] font-black text-white/90 uppercase tracking-tight text-right leading-tight break-words max-w-full drop-shadow-lg">
                                                    {data?.uc_name}
                                                    <span className="block text-[8px] text-white/40 font-bold mt-1 tracking-widest drop-shadow-md">{data?.tehsil}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* v4.19 Fixed-Navigation Filmstrip - 3-Column Layout & Compact Geometry */}
                                        <div className="absolute bottom-2 left-0 right-0 p-1 bg-black/5 backdrop-blur-[2px] rounded-2xl z-30 border border-white/5 mx-2 flex items-center">
                                            {/* Fixed Left Navigation */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); document.getElementById('gallery-container').scrollBy({ left: -220, behavior: 'smooth' }); }}
                                                className="w-8 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all rounded-l-xl border-r border-white/5 shrink-0"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>

                                            {/* Scrollable Gallery Lane */}
                                            <div className="flex-1 relative overflow-hidden h-14 flex items-center">
                                                <div
                                                    id="gallery-container"
                                                    className="flex gap-3 overflow-x-auto scrollbar-hide no-scrollbar snap-x py-1 px-12 items-center h-full"
                                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                                >
                                                    {/* v4.20 Geometry Fix: Start Spacer */}
                                                    <div className="shrink-0 w-6" />
                                                    {data.image_urls.map((url, i) => (
                                                        <button
                                                            key={`img-${i}`}
                                                            onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                                                            className="shrink-0 snap-start relative transition-all"
                                                        >
                                                            <div className={`relative w-[48px] h-[48px] rounded-lg overflow-hidden border transition-all duration-300 ${i === activeImage ? 'border-white scale-110 z-10' : 'border-white/10 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 hover:border-white/30'}`}>
                                                                <img src={url} className="w-full h-full object-cover" loading="lazy" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {/* Compact Empty States */}
                                                    {[...Array(8)].map((_, i) => (
                                                        <div key={`empty-${i}`} className="shrink-0 snap-start opacity-10">
                                                            <div className="w-[48px] h-[48px] rounded-lg border border-dashed border-white/30 flex items-center justify-center bg-white/5">
                                                                <ImageIcon size={8} className="text-white/40" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {/* v4.20 Geometry Fix: End Spacer */}
                                                    <div className="shrink-0 w-6" />
                                                </div>
                                            </div>

                                            {/* Fixed Right Navigation */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); document.getElementById('gallery-container').scrollBy({ left: 220, behavior: 'smooth' }); }}
                                                className="w-8 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all rounded-r-xl border-l border-white/5 shrink-0"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>

                                        {/* Zoom Button removed from here (v4.20) */}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 dark:text-slate-800">
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <span className="text-[10px] mt-3 font-black uppercase tracking-widest opacity-50">No Evidence Captured</span>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Financial Bento Tiles - Calibrated */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm space-y-1">
                                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">Outstanding</span>
                                    <div className="text-base font-bold text-slate-900 dark:text-white">
                                        <CurrencyText amount={financials.outstanding} />
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm space-y-1">
                                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">Recovery</span>
                                    <div className="text-base font-bold text-emerald-500 tabular-nums">
                                        {financials.recoveryRate.toFixed(1)}%
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm space-y-1">
                                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">Last Paid</span>
                                    <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                        {financials.lastPaidDate ? new Date(financials.lastPaidDate).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }) : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Bento Module - Calibrated */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm flex flex-col overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-50 dark:border-white/[0.03] flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <CreditCard size={12} className="text-indigo-400" /> Transaction History
                                    </h4>
                                    <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase tracking-tighter">
                                        {bills.length} Records
                                    </span>
                                </div>

                                {bills.length > 0 ? (
                                    <div className="divide-y divide-slate-50 dark:divide-white/[0.03]">
                                        {bills.map(bill => (
                                            <div key={bill.bill_month} className="p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${bill.payment_status === 'PAID' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20'}`}>
                                                            <FileText size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{bill.bill_month}</div>
                                                            <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1 opacity-80 mt-0.5">
                                                                #{bill.psid}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <StatusBadge
                                                        status={bill.payment_status}
                                                        variant={bill.payment_status === 'PAID' ? 'success' : 'warning'}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Amount Due</span>
                                                        <div className="text-sm font-bold"><CurrencyText amount={bill.amount_due} /></div>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Paid</span>
                                                        <div className={`text-sm ${bill.payment_status === 'PAID' ? 'text-emerald-500 font-bold' : 'text-slate-400 font-medium'}`}>
                                                            <CurrencyText amount={bill.amount_paid || 0} currency={null} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center text-slate-400 text-[10px] font-medium italic opacity-60">
                                        No linked transactions found.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="h-24" />
                    </div>

                    {/* v4.12 Floating Footer - Calibrated */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 z-40">
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-black transition-all border border-rose-200/50 dark:border-rose-500/20 active:scale-95 uppercase tracking-widest shadow-sm">
                                <AlertCircle size={14} /> Log Ticket
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-transparent hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-2xl text-sky-600 dark:text-sky-400 text-xs font-black transition-all border border-sky-200/50 dark:border-sky-500/20 active:scale-95 uppercase tracking-widest shadow-sm">
                                <ExternalLink size={14} /> Site Visit
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
                    Record not found.
                </div>
            )}

            {/* Gallery Portal */}
            <AnimatePresence>
                {isGalleryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8"
                        onClick={() => setIsGalleryOpen(false)}
                    >
                        <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
                            <div className="bg-white/10 px-3 py-1.5 rounded-lg text-white text-[10px] font-black border border-white/10 uppercase tracking-[0.2em]">
                                {activeImage + 1} / {data?.image_urls?.length}
                            </div>
                            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 w-full flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
                            {data?.image_urls?.length > 1 && (
                                <button
                                    onClick={() => setActiveImage(prev => (prev - 1 + data.image_urls.length) % data.image_urls.length)}
                                    className="absolute left-0 p-6 text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all"
                                >
                                    <ChevronLeft size={64} strokeWidth={1} />
                                </button>
                            )}

                            <motion.img
                                key={activeImage}
                                src={data.image_urls[activeImage]}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-xl"
                            />

                            {data?.image_urls?.length > 1 && (
                                <button
                                    onClick={() => setActiveImage(prev => (prev + 1) % data.image_urls.length)}
                                    className="absolute right-0 p-6 text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all"
                                >
                                    <ChevronRight size={64} strokeWidth={1} />
                                </button>
                            )}
                        </div>

                        <div className="absolute bottom-10 text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
                            Use arrow keys to navigate
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
