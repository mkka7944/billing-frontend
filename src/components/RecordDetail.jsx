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
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-white/5 animate-fade-in overflow-hidden transition-colors">
            {/* v3.1 Precision Header: Normalized Heights & Clean Pills */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/80 backdrop-blur-xl relative z-20 shrink-0">
                <div className="flex items-center gap-3 h-12">
                    {/* Survey ID */}
                    <h1 className="text-3xl font-display font-black text-slate-950 dark:text-white tracking-tighter tabular-nums drop-shadow-sm shrink-0 leading-none mr-1">
                        {surveyId}
                    </h1>

                    <div className="flex-1 flex items-center gap-2 min-w-0 h-full">
                        {/* Surveyor Name Pill - Dominant Width */}
                        <div className="flex-[2] min-w-0 h-full flex items-center px-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <span className="text-[10px] md:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-tight truncate">
                                {data?.surveyor_name || 'AUTO'}
                            </span>
                        </div>

                        {/* Combined Date & Time Pill - Compact Width */}
                        <div className="w-24 md:w-28 h-full flex flex-col justify-center items-center px-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/5 shrink-0 shadow-sm overflow-hidden">
                            <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 tabular-nums leading-none mb-0.5">
                                {data?.survey_date || 'N/A'}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tabular-nums leading-none">
                                {data?.survey_time || '--:--'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="h-12 w-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-slate-400 transition-all active:scale-90 border border-slate-200 dark:border-white/5 shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-medium">Reconstructing Records...</span>
                </div>
            ) : data ? (
                <>
                    <div className="flex-1 overflow-y-auto scrollbar-premium">
                        {/* v2.6 Modern Overlay Image (Regional info on image top-right) */}
                        <div className="p-4">
                            <div
                                className="relative h-48 md:h-64 rounded-panel overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 shadow-2zl group cursor-zoom-in"
                                onClick={() => setIsGalleryOpen(true)}
                            >
                                <AnimatePresence mode="wait">
                                    {data.image_urls && data.image_urls.length > 0 ? (
                                        <>
                                            <motion.img
                                                key={activeImage}
                                                src={data.image_urls[activeImage]}
                                                initial={{ opacity: 0, scale: 1.1 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4 }}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />

                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                                            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

                                            {/* Overlay Regional Hierarchy (Top Right) */}
                                            <div className="absolute top-3 right-3 flex flex-col items-end pointer-events-none">
                                                <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-right">
                                                    <span className="block text-[8px] font-black text-white/70 uppercase tracking-widest leading-none">
                                                        {data?.city_district}
                                                    </span>
                                                    <span className="block text-[11px] md:text-sm font-black text-white uppercase tracking-tight leading-tight mt-0.5 max-w-[140px] break-words">
                                                        {shortenAreaName(data?.uc_name, data?.city_district, data?.tehsil)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Overlay Identity Card (Bottom Left) */}
                                            <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1 text-white pointer-events-none">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-indigo-500/90 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-white/20">
                                                        IMAGE {activeImage + 1} / {data.image_urls.length}
                                                    </div>
                                                </div>
                                                <div className="space-y-0.5 mt-1">
                                                    <h3 className="text-sm font-black tracking-tight drop-shadow-md truncate">{data.consumer_name || 'Anonymous Consumer'}</h3>
                                                    <p className="text-[10px] font-medium opacity-90 drop-shadow flex items-center gap-1.5 truncate">
                                                        <MapPin size={10} className="text-white/70" />
                                                        {data.address || 'Address not recorded'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Maximize2 size={14} className="text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-800">
                                            <ImageIcon size={48} strokeWidth={1} />
                                            <span className="text-[9px] mt-3 font-black uppercase tracking-[0.2em]">No Field Imagery</span>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* v3.0 Scrollable Image Gallery with Navigation & Placeholders */}
                            <div className="relative mt-4 group">
                                <div id="gallery-container" className="flex gap-3 overflow-hidden pb-4 scroll-smooth snap-x">
                                    {/* Real Images from Portal */}
                                    {data.image_urls && data.image_urls.map((url, i) => (
                                        <div key={`img-${i}`} className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
                                            <button
                                                onClick={() => setActiveImage(i)}
                                                className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all border-2 ${i === activeImage ? 'border-indigo-500 scale-105 shadow-xl ring-4 ring-indigo-500/10' : 'border-slate-200 dark:border-white/5 opacity-70 hover:opacity-100 hover:border-slate-300'}`}
                                            >
                                                <img src={url} className="w-full h-full object-cover" loading="lazy" />
                                            </button>
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">from portal</span>
                                        </div>
                                    ))}

                                    {/* Empty Placeholder Slots */}
                                    {[...Array(8)].map((_, i) => (
                                        <div key={`empty-${i}`} className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
                                            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-center transition-colors">
                                                <ImageIcon size={20} className="text-slate-200 dark:text-slate-800" />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-tight">empty</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Custom Navigation Buttons (Visible when hovering or always on mobile touch) */}
                                <div className="absolute top-1/2 -translate-y-[22px] left-0 right-0 flex justify-between pointer-events-none px-1">
                                    <button
                                        onClick={() => document.getElementById('gallery-container').scrollBy({ left: -200, behavior: 'smooth' })}
                                        className="w-8 h-8 flex items-center justify-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => document.getElementById('gallery-container').scrollBy({ left: 200, behavior: 'smooth' })}
                                        className="w-8 h-8 flex items-center justify-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary Overlay Cards - Always visible */}
                        <div className="px-4 py-4 grid grid-cols-3 gap-2">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-sm flex flex-col items-center text-center">
                                <p className="text-[9px] font-bold text-indigo-500 opacity-70 uppercase tracking-tighter">Outstanding</p>
                                <div className="text-sm mt-0.5">
                                    <CurrencyText amount={financials.outstanding} />
                                </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm flex flex-col items-center text-center">
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Recovery</p>
                                <p className="text-sm font-display font-bold text-slate-800 dark:text-slate-100 mt-0.5 tabular-nums">
                                    {financials.recoveryRate.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm flex flex-col items-center text-center">
                                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">Last Paid</p>
                                <p className="text-[10px] font-display font-bold text-slate-800 dark:text-slate-100 mt-0.5 uppercase">
                                    {financials.lastPaidDate ? new Date(financials.lastPaidDate).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }) : 'NONE'}
                                </p>
                            </div>
                        </div>

                        {/* Transaction History - Always shown at bottom of scroll */}
                        <div className="px-6 py-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest inline-flex items-center gap-2">
                                    <CreditCard size={12} className="text-emerald-400" /> Transaction History
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tabular-nums">
                                    {bills.length} Records
                                </span>
                            </div>

                            {bills.length > 0 ? (
                                <div className="space-y-3">
                                    {bills.map(bill => (
                                        <div key={bill.bill_month} className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 shadow-sm space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bill.payment_status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                        <FileText size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase">{bill.bill_month}</div>
                                                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                            PSID: <span className="font-mono">{bill.psid}</span>
                                                            <CopyButton text={bill.psid} title="Copy PSID" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge
                                                    status={bill.payment_status}
                                                    variant={bill.payment_status === 'PAID' ? 'success' : 'warning'}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.03]">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">Amount Due</span>
                                                    <CurrencyText amount={bill.amount_due} />
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">
                                                        {bill.payment_status === 'PAID' ? 'Amount Paid' : 'Pending Fee'}
                                                    </span>
                                                    <div className={bill.payment_status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}>
                                                        <CurrencyText amount={bill.amount_paid || 0} currency={null} />
                                                    </div>
                                                </div>
                                            </div>

                                            {bill.paid_date && (
                                                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-medium bg-slate-50 dark:bg-slate-900/40 p-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                                                    <CheckCircle2 size={10} className="text-emerald-500" />
                                                    Reconciled on {new Date(bill.paid_date).toLocaleDateString('en-GB')} via {bill.payment_method || 'System'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-slate-50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                                    <AlertCircle size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <p className="text-xs text-slate-500 italic max-w-[200px] mx-auto">No historical financial transactions are currently linked to this survey unit.</p>
                                </div>
                            )}
                        </div>
                        <div className="h-20" /> {/* Bottom spacer for sticky nav */}
                    </div>

                    {/* Actions Sticky Footer */}
                    <div className="sticky bottom-0 left-0 right-0 p-4 pt-2 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:from-slate-900 to-transparent backdrop-blur-sm z-30 shrink-0">
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-white text-xs font-bold transition-all interactive-button shadow-xl shadow-indigo-600/20">
                                <AlertCircle size={14} /> LOG TICKET
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 text-xs font-bold transition-all interactive-button border border-slate-200 dark:border-white/5 shadow-sm">
                                <ExternalLink size={14} /> FIELD VISIT
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
                    Record not found or accessible.
                </div>
            )}

            {/* Full Screen Gallery Overlay */}
            <AnimatePresence>
                {isGalleryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
                    >
                        {/* Close & Controls */}
                        <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold border border-white/10 uppercase tracking-widest">
                                {activeImage + 1} / {data.image_urls.length}
                            </div>
                            <button
                                onClick={() => setIsGalleryOpen(false)}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90 border border-white/10"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 w-full max-w-7xl flex items-center justify-center relative">
                            {data.image_urls.length > 1 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev - 1 + data.image_urls.length) % data.image_urls.length); }}
                                    className="absolute left-0 md:left-4 p-4 text-white/50 hover:text-white transition-colors z-20 hover:bg-white/5 rounded-full"
                                >
                                    <ChevronLeft size={48} strokeWidth={1} />
                                </button>
                            )}

                            <motion.img
                                key={activeImage}
                                src={data.image_urls[activeImage]}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                drag
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                dragElastic={0.2}
                                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm select-none"
                            />

                            {data.image_urls.length > 1 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev + 1) % data.image_urls.length); }}
                                    className="absolute right-0 md:right-4 p-4 text-white/50 hover:text-white transition-colors z-20 hover:bg-white/5 rounded-full"
                                >
                                    <ChevronRight size={48} strokeWidth={1} />
                                </button>
                            )}
                        </div>

                        {/* Navigation Strip */}
                        {data.image_urls.length > 1 && (
                            <div className="h-20 w-full max-w-3xl mt-6 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {data.image_urls.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                                        className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all border-2 ${i === activeImage ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/50' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                                    >
                                        <img src={url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
