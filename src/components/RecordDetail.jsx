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
            {/* v4.7 Monolith Header: High-Precision Uniformity */}
            <div className="bg-white dark:bg-slate-900 relative z-20 shrink-0 overflow-hidden">
                <div className="flex items-stretch h-14 border-b border-slate-200 dark:border-white/5">
                    {/* ID Segment - Matching Close Button Style with Black Text */}
                    <div className="px-6 flex items-center bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shrink-0 font-display font-black tracking-tighter tabular-nums leading-none text-xl md:text-2xl">
                        {surveyId}
                    </div>

                    {/* Metadata Segment - Clean No-Margin Fill */}
                    <div className="flex-1 flex items-center px-4 gap-4 min-w-0 bg-slate-50/10 dark:bg-slate-900 border-x border-slate-200 dark:border-white/10">
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] md:text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-tight overflow-hidden break-words block max-h-8">
                                {data?.surveyor_name || 'AUTO'}
                            </span>
                        </div>

                        {/* Date/Time - Minimal Indigo Accents */}
                        <div className="flex flex-col items-end shrink-0 border-l border-slate-200 dark:border-white/10 pl-4 h-8 justify-center">
                            <span className="text-[11px] font-black text-indigo-500 tabular-nums leading-none mb-0.5">
                                {data?.survey_date || 'N/A'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tabular-nums leading-none">
                                {data?.survey_time || '--:--'}
                            </span>
                        </div>
                    </div>

                    {/* Integrated Close Action - Uniform Style */}
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
                    <span className="text-xs text-slate-500 font-medium font-display tracking-widest uppercase">Precision Tuning...</span>
                </div>
            ) : data ? (
                <>
                    <div className="flex-1 overflow-y-auto scrollbar-hide no-scrollbar">
                        {/* v4.7 Full-Width Seamless Hero */}
                        <div
                            className="relative h-64 md:h-80 overflow-hidden bg-white dark:bg-slate-900 group cursor-zoom-in"
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
                                            transition={{ duration: 0.3 }}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Regional Overlay */}
                                        <div className="absolute top-4 right-0 p-4 w-3/4 max-w-[220px] bg-gradient-to-bl from-black/80 via-black/50 to-transparent flex flex-col items-end pointer-events-none rounded-tl-2xl rounded-bl-2xl">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">
                                                {data?.city_district}
                                            </span>
                                            <span className="text-[11px] font-black text-white uppercase tracking-tight text-right leading-[1.2] break-words max-w-full">
                                                {data?.uc_name}
                                                <span className="block text-[8px] text-indigo-400 font-bold mt-1 tracking-widest">{data?.tehsil}</span>
                                            </span>
                                        </div>

                                        {/* Identity Overlay */}
                                        <div className="absolute bottom-4 left-0 p-5 bg-gradient-to-tr from-black/80 via-black/50 to-transparent flex flex-col gap-1 pointer-events-none rounded-tr-2xl rounded-br-2xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="bg-indigo-600/90 backdrop-blur-md text-[8px] font-black text-white px-2 py-1 rounded leading-none uppercase tracking-[0.2em]">
                                                    IMAGE {activeImage + 1} / {data.image_urls.length}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-white tracking-tight">{data.consumer_name || 'Anonymous Consumer'}</h3>
                                            <p className="text-[11px] font-medium text-white/80 flex items-center gap-1.5 leading-tight max-w-[240px]">
                                                <MapPin size={11} className="text-indigo-400 shrink-0" />
                                                {data.address || 'Address unverified'}
                                            </p>
                                        </div>

                                        <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                            <Maximize2 size={16} className="text-white" />
                                        </div>
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
                            {/* v4.7 Modern Filmstrip Gallery: High-Contrast Empty States */}
                            <div className="relative group">
                                <div
                                    id="gallery-container"
                                    className="flex gap-2.5 overflow-x-auto scrollbar-hide no-scrollbar snap-x py-1"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {/* Real Images */}
                                    {data.image_urls && data.image_urls.map((url, i) => (
                                        <button
                                            key={`img-${i}`}
                                            onClick={() => setActiveImage(i)}
                                            className="shrink-0 snap-start group/thumb relative transition-all"
                                        >
                                            <div className={`relative w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-300 ${i === activeImage ? 'border-indigo-500 scale-105 shadow-lg z-10' : 'border-transparent grayscale opacity-70 hover:opacity-100 hover:grayscale-0'}`}>
                                                <img src={url} className="w-full h-full object-cover" loading="lazy" />

                                                {/* Micro-Badge Overlay */}
                                                <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter backdrop-blur-md border ${i === activeImage ? 'bg-indigo-600/90 text-white border-white/20' : 'bg-black/60 text-white/70 border-white/10'}`}>
                                                    portal
                                                </div>

                                                {/* Selection Check Accent */}
                                                {i === activeImage && (
                                                    <div className="absolute top-1 left-1 bg-indigo-500/90 rounded-full p-0.5 border border-white/20">
                                                        <ImageIcon size={6} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                    {/* Darker Empty State Borders */}
                                    {[...Array(8)].map((_, i) => (
                                        <div key={`empty-${i}`} className="shrink-0 snap-start p-0.5 pointer-events-none">
                                            <div className="w-[72px] h-[72px] rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-slate-100/30 dark:bg-slate-800/20 flex flex-col items-center justify-center gap-1.5 opacity-40">
                                                <ImageIcon size={14} className="text-slate-400 dark:text-slate-500" />
                                                <span className="text-[6px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Void</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Floating Navigation */}
                                <div className="absolute top-1/2 -translate-y-1/2 -left-2 -right-2 flex justify-between pointer-events-none px-1">
                                    <button
                                        onClick={() => document.getElementById('gallery-container').scrollBy({ left: -220, behavior: 'smooth' })}
                                        className="w-9 h-9 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 rounded-full shadow-xl text-slate-500 hover:text-indigo-500 pointer-events-auto opacity-0 group-hover:opacity-100 transition-all border border-slate-200 dark:border-white/5"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => document.getElementById('gallery-container').scrollBy({ left: 220, behavior: 'smooth' })}
                                        className="w-9 h-9 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 rounded-full shadow-xl text-slate-500 hover:text-indigo-500 pointer-events-auto opacity-0 group-hover:opacity-100 transition-all border border-slate-200 dark:border-white/5"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Financial Bento Tiles */}
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

                            {/* Transaction Bento Module */}
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
                                                        <CurrencyText amount={bill.amount_due} />
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Paid</span>
                                                        <div className={bill.payment_status === 'PAID' ? 'text-emerald-500 font-bold' : 'text-slate-400 font-medium'}>
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

                    {/* v4.7 Floating Footer: Subtle Transparent Actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 z-30">
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-black transition-all border border-rose-100 dark:border-rose-500/20 active:scale-95 uppercase tracking-widest">
                                <AlertCircle size={14} /> Log Ticket
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-xl text-sky-600 dark:text-sky-400 text-xs font-black transition-all border border-sky-100 dark:border-sky-500/20 active:scale-95 uppercase tracking-widest">
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
