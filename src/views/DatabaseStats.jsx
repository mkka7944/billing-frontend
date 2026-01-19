import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
    Database, RefreshCw, CheckCircle2, AlertCircle,
    Users, CreditCard, Ticket, Map as MapIcon, Layers,
    Activity, Building2, Home, PowerOff, Globe
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function DatabaseStats() {
    const [stats, setStats] = useState({
        survey: { active: 0, domestic: 0, commercial: 0, archived: 0 },
        system: { staff: 0, bills: 0, tickets: 0, visits: 0, layers: 0 },
        cities: {}
    })
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)

    const baseParams = {
        p_district: null, p_tehsil: null, p_uc: null, p_surveyor: null,
        p_search: null, p_master_status: 'ALL', p_unit_type: null,
        p_sort_column: 'id_numeric', p_sort_direction: 'desc',
        p_page_size: 1, p_page_index: 0
    }

    const fetchSummedCount = useCallback(async (params) => {
        try {
            const [activeRes, newRes] = await Promise.all([
                supabase.rpc('get_hydrated_survey_stats', { ...baseParams, ...params, p_master_status: 'ACTIVE_BILLER' }),
                supabase.rpc('get_hydrated_survey_stats', { ...baseParams, ...params, p_master_status: 'NEW_SURVEY' })
            ])
            return (activeRes.data?.[0]?.total_result_count || 0) + (newRes.data?.[0]?.total_result_count || 0)
        } catch (e) { return 0 }
    }, [])

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true)
            const [
                { data: hData }, staffC, billsC, ticketsC, visitsC, layersC, archivedRes
            ] = await Promise.all([
                supabase.from('location_hierarchy').select('tehsil'),
                supabase.from('staff').select('*', { count: 'exact', head: true }),
                supabase.from('bills').select('*', { count: 'exact', head: true }),
                supabase.from('tickets').select('*', { count: 'exact', head: true }),
                supabase.from('compliance_visits').select('*', { count: 'exact', head: true }),
                supabase.from('location_layers').select('*', { count: 'exact', head: true }),
                supabase.rpc('get_hydrated_survey_stats', { ...baseParams, p_master_status: 'ARCHIVED' })
            ])

            const [totalA, domesticA, commercialA] = await Promise.all([
                fetchSummedCount({}),
                fetchSummedCount({ p_unit_type: 'Domestic' }),
                fetchSummedCount({ p_unit_type: 'Commercial' })
            ])

            const uniqueTehsils = [...new Set((hData || []).map(d => d.tehsil).filter(Boolean))].sort()
            let cityDist = {}
            await Promise.all(uniqueTehsils.map(async (tehsil) => {
                const count = await fetchSummedCount({ p_tehsil: tehsil })
                if (count > 0) cityDist[tehsil] = count
            }))

            setStats({
                survey: { active: totalA, domestic: domesticA, commercial: commercialA, archived: archivedRes.data?.[0]?.total_result_count || 0 },
                system: { staff: staffC.count || 0, bills: billsC.count || 0, tickets: ticketsC.count || 0, visits: visitsC.count || 0, layers: layersC.count || 0 },
                cities: cityDist
            })
            setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        } catch (err) { console.error(err) } finally { setLoading(false) }
    }, [fetchSummedCount])

    useEffect(() => { fetchAllData() }, [fetchAllData])

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-background selection:bg-primary/10">
            <div className="p-1.5 md:p-3 max-w-[1700px] mx-auto space-y-2.5 animate-fade-in pb-20">

                {/* Header View: Streamlined with Integrated City Density */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 mb-1">
                    <div className="flex flex-col shrink-0">
                        <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-foreground flex items-center gap-2">
                            <div className="p-1 rounded bg-primary/10 text-primary"><Database size={16} /></div>
                            Node<span className="text-primary">.</span>Explorer
                        </h1>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1">
                            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                            Live Telemetry Stream
                        </span>
                    </div>

                    {/* Regional Density moved to Header cluster to save space */}
                    <div className="flex flex-wrap items-center gap-1 sm:justify-end flex-1">
                        {loading ? (
                            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-20 rounded-md border border-border/40" />)
                        ) : (
                            Object.entries(stats.cities).map(([name, count]) => (
                                <div key={name} className="flex items-center gap-1.5 px-2 py-1 rounded border border-border/60 bg-card/60 hover:border-primary/40 transition-all cursor-default group shadow-sm">
                                    <span className="text-[9px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">{name}</span>
                                    <span className="text-[10px] font-black tabular-nums">{count.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                        <div className="h-5 w-px bg-border/60 mx-1 hidden md:block" />
                        <Button
                            onClick={fetchAllData}
                            variant="outline"
                            disabled={loading}
                            className="h-7 px-2.5 border-border font-black text-[9px] uppercase tracking-widest gap-1.5 bg-card hover:bg-muted shadow-sm transition-all active:scale-95"
                        >
                            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'SYNC' : 'REFRESH'}
                        </Button>
                    </div>
                </div>

                {/* 
                   Ultra-Streamlined Unified Matrix:
                   No more vertical grouping gaps. Everything in one tight flow.
                   Optimized for 12 columns.
                */}
                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-1.5 auto-rows-min">

                    {loading ? (
                        [...Array(10)].map((_, i) => <Skeleton key={i} className="h-[68px] col-span-1 rounded-xl border border-border/40" />)
                    ) : (
                        <>
                            {/* Survey Segment */}
                            <MetricCard label="Total Surveys" value={stats.survey.active} icon={<Activity size={15} />} color="primary" />
                            <MetricCard label="Domestic" value={stats.survey.domestic} icon={<Home size={15} />} color="blue" />
                            <MetricCard label="Commercial" value={stats.survey.commercial} icon={<Building2 size={15} />} color="purple" />
                            <MetricCard label="Archived" value={stats.survey.archived} icon={<PowerOff size={15} />} color="slate" badge="Static" />

                            {/* Operational Segment */}
                            <MetricCard label="Staffing" value={stats.system.staff} icon={<Users size={15} />} color="emerald" />
                            <MetricCard label="Billing" value={stats.system.bills} icon={<CreditCard size={15} />} color="amber" />
                            <MetricCard label="Ticketing" value={stats.system.tickets} icon={<Ticket size={15} />} color="rose" />
                            <MetricCard label="Audits" value={stats.system.visits} icon={<CheckCircle2 size={15} />} color="cyan" />
                            <MetricCard label="GIS Layers" value={stats.system.layers} icon={<Layers size={15} />} color="violet" />

                            {/* Future Capacity Fillers (Visual placeholders for empty space) */}
                            <div className="col-span-1 border border-dashed border-border/20 rounded-xl flex items-center justify-center h-[68px]">
                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Reserved</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Logistics Footer */}
                <div className="flex items-center justify-between px-2 pt-4 border-t border-border/20 opacity-40 mt-auto">
                    <span className="text-[8px] font-black uppercase tracking-widest">Secure Master Node Connection • v2.8.4</span>
                    <span className="text-[9px] font-black tracking-widest uppercase tabular-nums">Pulse: {lastUpdated || '--:--'}</span>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ label, value, icon, color, badge }) {
    const colorMap = {
        primary: "text-primary bg-primary/10 border-primary/20",
        indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        slate: "text-slate-500 bg-slate-500/10 border-slate-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        cyan: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
        violet: "text-violet-500 bg-violet-500/10 border-violet-500/20"
    }

    return (
        <Card className="col-span-1 border-border/50 bg-card/60 hover:bg-card hover:border-primary/30 transition-all shadow-sm group relative overflow-hidden flex flex-col items-start p-2 min-h-[68px] min-w-0">
            <div className="flex items-center gap-2 mb-1.5 w-full">
                <div className={`p-1.5 rounded-lg ${colorMap[color] || 'bg-muted'} group-hover:scale-105 transition-transform shrink-0`}>
                    {icon}
                </div>
                {badge && (
                    <span className="text-[7px] font-black uppercase bg-zinc-500/10 text-zinc-500 px-1 rounded-[2px] border border-zinc-500/20 ml-auto opacity-60">
                        {badge}
                    </span>
                )}
            </div>
            <div className="flex flex-col w-full min-w-0 text-left">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tight leading-none truncate w-full group-hover:text-foreground transition-colors mb-0.5">
                    {label}
                </span>
                <span className="text-sm md:text-base font-black tabular-nums tracking-tighter leading-none text-foreground truncate">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
            </div>
        </Card>
    )
}
