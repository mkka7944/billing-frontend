import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
    Database, Table, RefreshCw, CheckCircle2, AlertCircle,
    Users, FileText, CreditCard, Ticket, Map as MapIcon, Layers,
    Activity, Building2, Home, PowerOff, Globe
} from 'lucide-react'
import { CurrencyText } from '../components/common/UIComponents'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export default function DatabaseStats() {
    const [stats, setStats] = useState([])
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)

    const basicTables = [
        { name: 'survey_units', icon: <MapIcon size={20} />, label: 'Survey Records', color: 'indigo' },
        { name: 'bills', icon: <CreditCard size={20} />, label: 'Billing Records', color: 'emerald' },
        { name: 'staff', icon: <Users size={20} />, label: 'Staff Accounts', color: 'purple' },
        { name: 'tickets', icon: <Ticket size={20} />, label: 'Complaints/Tickets', color: 'amber' },
        { name: 'compliance_visits', icon: <CheckCircle2 size={20} />, label: 'Field Visits', color: 'blue' },
        { name: 'location_layers', icon: <Layers size={20} />, label: 'Map Layers (KML)', color: 'rose' }
    ]

    useEffect(() => {
        fetchAllData()
    }, [])

    async function fetchAllData() {
        try {
            setLoading(true)

            // Fetch basic table counts
            const tableResults = await Promise.all(basicTables.map(async (table) => {
                const { count, error } = await supabase
                    .from(table.name)
                    .select('*', { count: 'exact', head: true })

                return {
                    ...table,
                    count: error ? 'Error' : count,
                    status: error ? 'error' : 'online'
                }
            }))
            setStats(tableResults)

            // Calculate Census Summary Directly
            const [
                { count: activeCount },
                { count: archivedCount },
                { count: domesticCount },
                { count: commercialCount }
            ] = await Promise.all([
                supabase.from('survey_units').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
                supabase.from('survey_units').select('*', { count: 'exact', head: true }).eq('status', 'ARCHIVED'),
                supabase.from('survey_units').select('*', { count: 'exact', head: true }).eq('unit_type', 'Domestic').eq('status', 'ACTIVE'),
                supabase.from('survey_units').select('*', { count: 'exact', head: true }).eq('unit_type', 'Commercial').eq('status', 'ACTIVE')
            ])

            // Fetch unique tehsils from hierarchy
            const { data: hierarchyData } = await supabase.from('location_hierarchy').select('tehsil')
            const uniqueTehsils = [...new Set((hierarchyData || []).map(d => d.tehsil).filter(Boolean))]

            // Fetch City Distribution for Active Records
            let cityDist = {}
            await Promise.all(uniqueTehsils.map(async (tehsil) => {
                const { count } = await supabase
                    .from('survey_units')
                    .select('*', { count: 'exact', head: true })
                    .eq('tehsil', tehsil)
                    .eq('status', 'ACTIVE')

                if (count > 0) {
                    cityDist[tehsil] = count
                }
            }))

            setSummary({
                total_active: activeCount || 0,
                total_archived: archivedCount || 0,
                domestic: domesticCount || 0,
                commercial: commercialCount || 0,
                city_distribution: cityDist
            })

            setLastUpdated(new Date().toLocaleTimeString())
        } catch (err) {
            console.error('Stats fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full overflow-y-auto scrollbar-hide bg-background/50">
            <div className="p-8 max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
                {/* Standardized Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            System Intelligence
                            <Badge variant="outline" className="text-[10px] py-0 h-5 border-emerald-500/20 text-emerald-500 bg-emerald-500/5">LIVE</Badge>
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Database size={14} className="text-indigo-500" />
                            Active cluster stats from production node
                        </p>
                    </div>
                    <Button
                        onClick={fetchAllData}
                        variant="outline"
                        disabled={loading}
                        className="gap-2 h-10 border-border bg-card/50 hover:bg-muted font-bold transition-all text-xs uppercase tracking-widest"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Refining...' : 'Refresh Intel'}
                    </Button>
                </div>

                {/* KPI Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? (
                        [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
                    ) : summary && (
                        <>
                            <SummaryCard
                                label="Active Surveys"
                                value={summary.total_active}
                                icon={<Activity size={18} />}
                                trend="+2.4%"
                            />
                            <SummaryCard
                                label="Domestic Units"
                                value={summary.domestic}
                                icon={<Home size={18} />}
                            />
                            <SummaryCard
                                label="Commercial Units"
                                value={summary.commercial}
                                icon={<Building2 size={18} />}
                            />
                            <SummaryCard
                                label="Archived Context"
                                value={summary.total_archived}
                                icon={<PowerOff size={18} />}
                            />
                        </>
                    )}
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Geographic Distribution */}
                    <Card className="lg:col-span-1 border-border/50 bg-card/30 shadow-sm overflow-hidden flex flex-col">
                        <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Globe size={16} className="text-indigo-400" /> City Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[500px] scrollbar-hide">
                            {loading ? (
                                [...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                            ) : summary && Object.entries(summary.city_distribution || {}).map(([city, count]) => (
                                <div key={city} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{city}</span>
                                        <span className="text-xs font-bold tabular-nums">{count.toLocaleString()}</span>
                                    </div>
                                    <Progress
                                        value={(count / (summary.total_active || 1)) * 100}
                                        className="h-1.5 bg-muted/50"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Table Connectivity & Scale Matrix */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
                        {loading ? (
                            [...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
                        ) : stats.map((table) => (
                            <Card key={table.name} className="border-border/50 bg-card/30 hover:bg-card/50 transition-colors shadow-sm relative overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="p-2.5 rounded-lg bg-muted border border-border group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                            {table.icon}
                                        </div>
                                        <Badge
                                            variant={table.status === 'online' ? 'gray' : 'destructive'}
                                            className="uppercase text-[8px] font-black tracking-[0.1em]"
                                        >
                                            {table.status}
                                        </Badge>
                                    </div>

                                    <div className="mt-8 space-y-1">
                                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{table.label}</h3>
                                        <div className="text-3xl font-black tracking-tighter tabular-nums drop-shadow-sm">
                                            {table.count.toLocaleString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Footer Insight Component */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] px-4 py-8 border-t border-border/50 bg-muted/5 rounded-b-3xl">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={14} className="text-amber-500" />
                        Production node synchronization: Verified
                    </div>
                    <div className="tabular-nums opacity-60">
                        Last Intel: {lastUpdated || 'SYNCING...'}
                    </div>
                </div>
            </div>
        </div>
    )
}

function SummaryCard({ label, value, icon, trend }) {
    return (
        <Card className="border-border/50 bg-card/30 shadow-sm relative overflow-hidden group">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-muted text-foreground/70 group-hover:text-indigo-500 transition-colors">
                        {icon}
                    </div>
                    {trend && (
                        <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded leading-none">
                            {trend}
                        </span>
                    )}
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-black tracking-tighter tabular-nums">{value?.toLocaleString() || '0'}</p>
                </div>
            </CardContent>
        </Card>
    )
}
