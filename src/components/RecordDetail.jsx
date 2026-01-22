import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
    X, MapPin, Calendar, Clock, Image as ImageIcon,
    CreditCard, ExternalLink, AlertCircle, FileText,
    ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { shortenAreaName } from '../lib/utils'
import { CurrencyText, StatusBadge } from './common/UIComponents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function RecordDetail({ surveyId, onClose, onNext, onPrev, hasNext, hasPrev }) {
    const [data, setData] = useState(null)
    const [bills, setBills] = useState([])
    const [financials, setFinancials] = useState({ totalDue: 0, totalPaid: 0, outstanding: 0, recoveryRate: 0, lastPaidDate: null })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeImage, setActiveImage] = useState(0)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)

    useEffect(() => {
        if (surveyId) {
            setData(null)
            setBills([])
            setFinancials({ totalDue: 0, totalPaid: 0, outstanding: 0, recoveryRate: 0, lastPaidDate: null })
            setActiveImage(0) // Reset image on record change
            fetchData()
        }
    }, [surveyId])

    // Keyboard Navigation for Gallery Modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Priority 0: Don't capture if typing
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            // Gallery Modal (Full Screen) - BLOCK ALL OTHER LISTENERS
            if (isGalleryOpen) {
                if (e.key === 'Escape') {
                    setIsGalleryOpen(false);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    if (data?.image_urls?.length > 1) {
                        if (e.key === 'ArrowRight') setActiveImage(prev => (prev + 1) % data.image_urls.length);
                        if (e.key === 'ArrowLeft') setActiveImage(prev => (prev - 1 + data.image_urls.length) % data.image_urls.length);
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                }
                // When gallery is open, we consume all arrow keys to prevent parent navigation
                if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                    e.stopImmediatePropagation();
                }
            }
        }
        // Use capturing phase to beat the parent listener in SurveyStatsView
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isGalleryOpen, data])

    async function fetchData() {
        if (!surveyId) return
        try {
            setLoading(true)
            setError(null)
            const { data: rawResult, error: rpcError } = await supabase.rpc('get_unit_history_360', { p_survey_id: surveyId })
            if (rpcError) throw rpcError

            const rpcData = Array.isArray(rawResult) ? rawResult[0] : rawResult
            if (!rpcData || !rpcData.unit) throw new Error('No record found for the provided ID')

            setData(rpcData.unit)
            setBills(rpcData.bills || [])
            const stats = rpcData.stats || { total_due: 0, total_paid: 0, outstanding: 0, last_paid_date: null }
            setFinancials({
                totalDue: Number(stats.total_due),
                totalPaid: Number(stats.total_paid),
                outstanding: Number(stats.outstanding),
                lastPaidDate: stats.last_paid_date,
                recoveryRate: stats.total_due > 0 ? (stats.total_paid / stats.total_due) * 100 : 0
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!surveyId) return null

    // Unify Badge Styling with SurveyStatsView
    const renderStatusBadge = () => {
        if (!data) return null
        if (data.status === 'ARCHIVED') return <StatusBadge status="Archived" variant="archived" className="h-5" />
        if (data.is_biller) return <StatusBadge status="Active" variant="active" className="h-5" />
        return <StatusBadge status="New Survey" variant="pending" className="h-5" />
    }

    // Consumer Type Color Coding (Domestic / Commercial Correction)
    const getConsumerTypeBadge = () => {
        const rawType = data?.unit_type || data?.consumer_type || data?.property_type || data?.consumer_category || data?.type || ''
        const type = rawType.toLowerCase()

        if (type.includes('residen') || type.includes('domest') || type.includes('home')) {
            return <StatusBadge status="Domestic" variant="domestic" className="h-4.5" />
        }

        if (type.includes('commer') || type.includes('shop') || type.includes('office')) {
            return <StatusBadge status="Commercial" variant="commercial" className="h-4.5" />
        }

        return <StatusBadge status={rawType || 'General'} variant="default" className="h-4.5" />
    }

    return (
        <motion.div
            className="flex flex-col h-full w-full bg-background font-sans"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x
                const threshold = 100
                if (swipe < -threshold) onNext?.()
                if (swipe > threshold) onPrev?.()
            }}
        >
            {/* Header - Compact Metadata View */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black tabular-nums tracking-tighter leading-none text-primary">
                            {surveyId}
                        </h2>
                        <div className="h-8 w-px bg-border/50" />
                        <div className="flex flex-col gap-0.5">
                            <span className="badge-subtext text-primary/80">
                                {data?.surveyor_name || 'System Auto'}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="badge-subtext font-mono tracking-normal text-foreground/80">{data?.survey_date || 'N/A'}</span>
                                <span className="badge-subtext font-mono tracking-normal text-foreground/80">{data?.survey_time || '--:--'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Record Navigation Arrows (Desktop) */}
                <div className="flex items-center gap-1 border-l border-border/50 pl-3 ml-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full transition-colors ${!hasPrev ? 'opacity-20 cursor-not-allowed' : 'hover:bg-muted opacity-100'}`}
                        onClick={(e) => { e.stopPropagation(); if (hasPrev && onPrev) onPrev(); }}
                        disabled={!hasPrev}
                        title="Previous Record (Left Arrow)"
                    >
                        <ChevronLeft size={18} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full transition-colors ${!hasNext ? 'opacity-20 cursor-not-allowed' : 'hover:bg-muted opacity-100'}`}
                        onClick={(e) => { e.stopPropagation(); if (hasNext && onNext) onNext(); }}
                        disabled={!hasNext}
                        title="Next Record (Right Arrow)"
                    >
                        <ChevronRight size={18} />
                    </Button>

                    <div className="h-6 w-px bg-border/50 mx-1" />

                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0">
                        <X size={20} />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Data...</span>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-2">
                        <AlertCircle size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg">Unable to Load Record</h3>
                        <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                    <Button variant="outline" onClick={fetchData} className="mt-4">Retry Connection</Button>
                </div>
            ) : data ? (
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {/* Image Gallery Hero - Reduced Margin & Subtle Arrows */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted group border border-border/50 shadow-sm">
                            {data.image_urls && data.image_urls.length > 0 ? (
                                <>
                                    <img
                                        src={data.image_urls[activeImage]}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                                        alt="Evidence"
                                        onClick={() => setIsGalleryOpen(true)}
                                    />

                                    {/* Subtle Arrows (Gallery Nav) */}
                                    {data.image_urls.length > 1 && (
                                        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 border-0 backdrop-blur-md pointer-events-auto"
                                                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev - 1 + data.image_urls.length) % data.image_urls.length); }}
                                            >
                                                <ChevronLeft size={16} />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 border-0 backdrop-blur-md pointer-events-auto"
                                                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev + 1) % data.image_urls.length); }}
                                            >
                                                <ChevronRight size={16} />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                                    {/* Info Overlay */}
                                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white pointer-events-none">
                                        <div className="space-y-1">
                                            <div className="badge-subtext bg-black/20 backdrop-blur-[2px] text-white/90 px-2 py-0.5 rounded-md border-none">
                                                Image {activeImage + 1} of {data.image_urls.length}
                                            </div>
                                            <div className="flex">
                                                <span className="badge-subtext bg-black/20 backdrop-blur-[2px] text-white/90 px-2 py-0.5 rounded-md border-none font-bold">
                                                    <MapPin size={8} className="mr-1 inline" />
                                                    {shortenAreaName(data.uc_name, data.city_district, data.tehsil)}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 border-0 text-white backdrop-blur-md pointer-events-auto"
                                            onClick={() => setIsGalleryOpen(true)}
                                        >
                                            <Maximize2 size={12} />
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <ImageIcon size={32} className="opacity-20 mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">No Evidence</span>
                                </div>
                            )}
                        </div>

                        {/* Customer Info Card - Compact */}
                        <Card className="shadow-none border-border/60 bg-card/50">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="badge-subtext mb-1">Identity Profile</p>
                                    <h3 className="text-base font-bold leading-tight truncate pr-4">{data.consumer_name || 'Anonymous'}</h3>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                        {getConsumerTypeBadge()}
                                        <span className="badge-subtext normal-case tracking-normal font-medium bg-transparent border-none text-muted-foreground/80 lowercase italic">{data.address || 'No Verified Address'}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    {renderStatusBadge()}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Stats - Super Compact */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2.5 rounded-xl border border-border/40 bg-card/30">
                                <p className="badge-subtext mb-1 opacity-60">Demand</p>
                                <p className="text-xs font-bold text-foreground tabular-nums"><CurrencyText amount={financials.outstanding} /></p>
                            </div>
                            <div className="p-2.5 rounded-xl border border-border/40 bg-card/30">
                                <p className="badge-subtext mb-1 opacity-60">Paid</p>
                                <p className="text-xs font-bold text-emerald-600 tabular-nums"><CurrencyText amount={financials.totalPaid} /></p>
                            </div>
                            <div className="p-2.5 rounded-xl border border-border/40 bg-card/30">
                                <p className="badge-subtext mb-1 opacity-60">Recovery</p>
                                <p className="text-xs font-bold text-indigo-600 tabular-nums">{financials.recoveryRate.toFixed(0)}%</p>
                            </div>
                        </div>

                        {/* Transaction History - Density Adjusted */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Billing History</h4>
                                <span className="text-[9px] font-bold opacity-50">{bills.length} Records</span>
                            </div>

                            <div className="space-y-1.5">
                                {bills.length > 0 ? bills.map((bill, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/30 hover:bg-card transition-colors group">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded flex items-center justify-center border ${bill.payment_status === 'PAID' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-orange-500/10 border-orange-500/20 text-orange-600'}`}>
                                                <FileText size={12} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase leading-none">{bill.bill_month}</p>
                                                <span className="badge-subtext font-mono tracking-normal bg-transparent border-none p-0 mt-0.5 opacity-50">#{bill.psid}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[11px] font-bold tabular-nums ${bill.payment_status === 'PAID' ? 'text-emerald-600' : 'text-foreground'}`}>
                                                <CurrencyText amount={bill.amount_paid > 0 ? bill.amount_paid : bill.amount_due} />
                                            </div>
                                            <StatusBadge
                                                status={bill.payment_status}
                                                variant={bill.payment_status === 'PAID' ? 'success' : 'warning'}
                                                className="h-3.5"
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-6 text-center text-[10px] text-muted-foreground italic border border-dashed border-border rounded-xl opacity-60">
                                        No linked transactions found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            ) : null}

            {/* Footer Actions */}
            <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm shrink-0 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full text-xs font-black uppercase tracking-widest border-dashed">
                    <AlertCircle size={14} className="mr-2 text-destructive" />
                    Report Issue
                </Button>
                <Button className="w-full text-xs font-black uppercase tracking-widest">
                    <ExternalLink size={14} className="mr-2" />
                    Open In GIS
                </Button>
            </div>

            {/* Immersive Gallery Modal */}
            <AnimatePresence>
                {isGalleryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4"
                        onClick={() => setIsGalleryOpen(false)}
                    >
                        <div className="absolute top-4 right-4 z-50">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => setIsGalleryOpen(false)}>
                                <X size={24} />
                            </Button>
                        </div>

                        <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                            {data?.image_urls?.length > 1 && (
                                <Button variant="ghost" size="icon" className="absolute left-4 text-white hover:bg-white/10 h-12 w-12 rounded-full" onClick={() => setActiveImage(prev => (prev - 1 + data.image_urls.length) % data.image_urls.length)}>
                                    <ChevronLeft size={32} />
                                </Button>
                            )}

                            <motion.img
                                key={activeImage}
                                src={data.image_urls[activeImage]}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            />

                            {data?.image_urls?.length > 1 && (
                                <Button variant="ghost" size="icon" className="absolute right-4 text-white hover:bg-white/10 h-12 w-12 rounded-full" onClick={() => setActiveImage(prev => (prev + 1) % data.image_urls.length)}>
                                    <ChevronRight size={32} />
                                </Button>
                            )}
                        </div>

                        <div className="absolute bottom-6 text-white/50 text-xs font-black uppercase tracking-widest">
                            {activeImage + 1} / {data.image_urls.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
