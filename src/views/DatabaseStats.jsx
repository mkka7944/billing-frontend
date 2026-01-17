import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
    Database, Table, RefreshCw, CheckCircle2, AlertCircle,
    Users, FileText, CreditCard, Ticket, Map as MapIcon, Layers,
    Activity, Building2, Home, PowerOff, Globe
} from 'lucide-react'
import { CurrencyText, StatusBadge } from '../components/common/UIComponents'

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
                { count: commercialCount },
                { count: billerCount }
            ] = await Promise.all([
                supabase.from('survey_units').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
                supabase.from('survey_units').select('*', { count: 'exact', head: true }).eq('status', 'ARCHIVED'),
                supabase.from('survey_units').select('*', { count: 'exact', head: true }).eq('unit_type', 'Domestic').eq('status', 'ACTIVE'),
                supabase.from('survey_units').select('*', { count: 'exact', head: true }).eq('unit_type', 'Commercial').eq('status', 'ACTIVE'),
                supabase.from('survey_units').select('*', { count: 'exact', head: true }).not('status', 'is', null) // Generic count for now
            ])

            // Fetch unique tehsils from hierarchy
            const { data: hierarchyData } = await supabase.from('location_hierarchy').select('tehsil')
            const uniqueTehsils = [...new Set((hierarchyData || []).map(d => d.tehsil).filter(Boolean))]

            // Fetch City Distribution for Active Records (Scalable approach - Grouping by Tehsil)
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
        <div className="h-full overflow-y-auto custom-scrollbar transition-colors duration-300">
            <div className="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold premium-gradient-text">System Intelligence</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 font-medium">
                            <Database size={16} /> Connection: <span className="text-emerald-500 font-bold">LIVE</span>
                        </p>
                    </div>
                    <button
                        onClick={fetchAllData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 transition-all active:scale-95 disabled:opacity-50 shadow-sm font-bold text-sm"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'REFRESHING...' : 'REFRESH INTEL'}
                    </button>
                </div>

                {/* Advanced Summary Row */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <SummaryCard
                            label="Live Active Surveys"
                            value={summary.total_active}
                            icon={<Activity size={20} />}
                            color="indigo"
                        />
                        <SummaryCard
                            label="Domestic (Live)"
                            value={summary.domestic}
                            icon={<Home size={20} />}
                            color="emerald"
                        />
                        <SummaryCard
                            label="Commercial (Live)"
                            value={summary.commercial}
                            icon={<Building2 size={20} />}
                            color="amber"
                        />
                        <SummaryCard
                            label="Archived Records"
                            value={summary.total_archived}
                            icon={<PowerOff size={20} />}
                            color="rose"
                        />
                        <SummaryCard
                            label="Total Census"
                            value={summary.total_active + summary.total_archived}
                            icon={<Users size={20} />}
                            color="slate"
                        />
                    </div>
                )}

                {/* City Distribution & Tables Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Distribution List */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-panel p-6 rounded-2xl border-white/5 shadow-2xl flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                                    <Globe size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">City Distribution</h2>
                            </div>

                            <div className="space-y-4 flex-1">
                                {summary && Object.entries(summary.city_distribution || {}).map(([city, count]) => (
                                    <div key={city} className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{city}</span>
                                            <span className="text-sm font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums">{count.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                                                style={{ width: `${(count / (summary.total_active || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Basic Tables Grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stats.map((table) => (
                            <div
                                key={table.name}
                                className="glass-panel p-6 rounded-2xl border-white/5 hover:border-indigo-500/30 transition-all group shadow-xl h-fit"
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-xl ${table.color === 'indigo' ? 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' : `bg-${table.color}-500/10 text-${table.color}-400 border border-${table.color}-500/20`}`}>
                                        {table.icon}
                                    </div>
                                    <StatusBadge
                                        status={table.status}
                                        variant={table.status === 'online' ? 'success' : 'error'}
                                    />
                                </div>

                                <div className="mt-6 space-y-1">
                                    <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{table.label}</h3>
                                    <div className="text-4xl font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                                        {loading ? '---' : table.count.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-2 py-6 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={14} />
                        Stats are synchronized in real-time with the production database view.
                    </div>
                    <div className="font-display font-bold text-slate-400">
                        LAST SYNC: {lastUpdated || 'WAITING...'}
                    </div>
                </div>
            </div>
        </div>
    )
}

function SummaryCard({ label, value, icon, color }) {
    const colorMap = {
        indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        slate: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    }

    return (
        <div className="glass-panel p-5 rounded-2xl border-white/5 shadow-xl transition-all hover:scale-[1.02]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colorMap[color]}`}>
                {icon}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
            <div className={`text-2xl font-display font-bold tabular-nums text-slate-900 dark:text-slate-100`}>
                {value?.toLocaleString() || '0'}
            </div>
        </div>
    )
}
