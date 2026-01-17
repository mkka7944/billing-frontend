
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
    Search, Filter, MapPin, User, Calendar,
    ChevronDown, Check, MoreHorizontal, ArrowUpDown,
    Download, FileSpreadsheet, Eye, UserCheck,
    ArrowLeft, X, CreditCard, BarChart3, AlertCircle,
    CheckCircle2, Printer, Layers, RefreshCw, Users,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import { useUI } from '../context/UIContext'
import { shortenAreaName, formatLocationLabel } from '../lib/utils'
import { StatusBadge, CurrencyText } from '../components/common/UIComponents'
import ModernDropdown from '../components/common/ModernDropdown'
import { useLocationHierarchy } from '../lib/locationHooks'

const PAGE_SIZE = 50

export default function SurveyStatsView() {
    const { setSelectedSurveyId } = useUI()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pageIndex, setPageIndex] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

    const [stats, setStats] = useState({
        totalSurveys: 0,
        activeSurveys: 0,
        archivedRecords: 0,
        totalDue: 0,
        totalPaid: 0,
        recoveryRate: 0
    })

    const [filters, setFilters] = useState({
        district: '',  // No default - show all
        tehsil: '',
        uc: '',
        surveyor: '',
        masterStatus: 'ALL',  // Default to ALL
        search: ''
    })

    const { districts, tehsils, ucs } = useLocationHierarchy(filters)

    const [surveyors, setSurveyors] = useState([])
    const [sortConfig, setSortConfig] = useState({ key: 'id_numeric', direction: 'desc' })  // id_numeric for perfect numeric/chronological order

    const [isFilterOpen, setIsFilterOpen] = useState(true)
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

    // Load surveyors - Reactive to location filters
    useEffect(() => {
        const fetchSurveyors = async () => {
            const { data, error } = await supabase.rpc('get_distinct_surveyors', {
                p_district: filters.district || null,
                p_tehsil: filters.tehsil || null,
                p_uc: filters.uc || null
            })

            if (!error && data) {
                const names = data.map(item => item.surveyor_name)
                setSurveyors(names)
            } else if (error) {
                console.error('Error fetching surveyors:', error)
            }
        }
        fetchSurveyors()
    }, [filters.district, filters.tehsil, filters.uc])

    // Reset page on filter change
    useEffect(() => {
        setPageIndex(0)
    }, [filters])

    // Single fetch trigger
    useEffect(() => {
        const timeout = setTimeout(fetchData, 500)
        return () => clearTimeout(timeout)
    }, [filters, pageIndex, sortConfig])

    async function fetchData() {
        try {
            setLoading(true)
            setError(null)

            // 1. SIMPLE COUNT (fast head-only query on the VIEW)
            let countQuery = supabase.from('survey_units_with_stats')
                .select('survey_id', { count: 'exact', head: true })

            // Apply location filters
            if (filters.district) countQuery = countQuery.eq('city_district', filters.district)
            if (filters.tehsil) countQuery = countQuery.eq('tehsil', filters.tehsil)
            if (filters.uc) countQuery = countQuery.eq('uc_name', filters.uc)
            if (filters.surveyor) countQuery = countQuery.eq('surveyor_name', filters.surveyor)
            if (filters.search) countQuery = countQuery.or(`survey_id.ilike.%${filters.search}%,consumer_name.ilike.%${filters.search}%`)

            // Apply status filters using the view columns
            if (filters.masterStatus === 'ARCHIVED') {
                countQuery = countQuery.eq('status', 'ARCHIVED')
            } else if (filters.masterStatus === 'ACTIVE_BILLER') {
                countQuery = countQuery.eq('status', 'ACTIVE').eq('is_biller', true)
            } else if (filters.masterStatus === 'NEW_SURVEY') {
                countQuery = countQuery.eq('status', 'ACTIVE').eq('is_biller', false)
            } else if (filters.masterStatus !== 'ALL') {
                countQuery = countQuery.eq('status', 'ACTIVE')
            }

            const { count: currentCountResult } = await countQuery
            const currentCount = currentCountResult || 0
            setTotalCount(currentCount)

            // 2. DATA QUERY - Step 1: Base Survey Fetch (Fast)
            let query = supabase.from('survey_units_with_stats').select(`
                survey_id, consumer_name, city_district, tehsil, uc_name, 
                status, surveyor_name, survey_date, created_at, is_biller
            `)

            // Apply same location filters
            if (filters.district) query = query.eq('city_district', filters.district)
            if (filters.tehsil) query = query.eq('tehsil', filters.tehsil)
            if (filters.uc) query = query.eq('uc_name', filters.uc)
            if (filters.surveyor) query = query.eq('surveyor_name', filters.surveyor)
            if (filters.search) query = query.or(`survey_id.ilike.%${filters.search}%,consumer_name.ilike.%${filters.search}%`)

            // Apply status filters
            if (filters.masterStatus === 'ARCHIVED') {
                query = query.eq('status', 'ARCHIVED')
            } else if (filters.masterStatus === 'ACTIVE_BILLER') {
                query = query.eq('status', 'ACTIVE').eq('is_biller', true)
            } else if (filters.masterStatus === 'NEW_SURVEY') {
                query = query.eq('status', 'ACTIVE').eq('is_biller', false)
            } else if (filters.masterStatus !== 'ALL') {
                query = query.eq('status', 'ACTIVE')
            }

            // Pagination - Simple pagination since filtering is now server-side
            const from = pageIndex * PAGE_SIZE
            const to = from + PAGE_SIZE - 1

            // Apply sort and range (leveraging the new functional index on id_numeric)
            const { data, error } = await query
                .range(from, to)
                .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })

            if (error) throw error

            // 3. Step 2: Bill Hydration (Pluck bills for only these 50 records)
            const surveyIds = (data || []).map(r => r.survey_id)
            let billsData = []

            if (surveyIds.length > 0) {
                const { data: bData, error: bError } = await supabase.from('bills')
                    .select('survey_id, amount_due, amount_paid, payment_status, is_issued, bill_month')
                    .in('survey_id', surveyIds)

                if (!bError) billsData = bData
            }

            // 4. Process records (Merge and Calculate)
            const processed = (data || []).map(row => {
                const bills = billsData.filter(b => b.survey_id === row.survey_id)
                const isBiller = row.is_biller

                // Skip detailed bill processing for NEW_SURVEY if not needed, 
                // but usually we want to see available bills if any
                if (filters.masterStatus === 'NEW_SURVEY' && bills.length === 0) {
                    return { ...row, total_due: 0, total_paid: 0, is_biller: isBiller, history: [] }
                }

                // Full processing
                const sortedBills = bills.sort((a, b) => (b.bill_month || '').localeCompare(a.bill_month || ''))
                const totalDue = sortedBills.reduce((sum, b) => sum + (b.amount_due || 0), 0)
                const totalPaid = sortedBills.reduce((sum, b) => sum + (b.amount_paid || 0), 0)

                const months = ['DEC2025', 'NOV2025', 'OCT2025', 'SEP2025']
                const history = months.map(m => {
                    const b = sortedBills.find(bill => bill.bill_month === m)
                    return { month: m, paid: b ? b.payment_status === 'PAID' : null, issued: b ? b.is_issued : null }
                })

                return { ...row, total_due: totalDue, total_paid: totalPaid, is_biller: isBiller, history }
            })

            setRecords(processed)

            // 4. Stats calculation
            const visibleDue = processed.reduce((s, r) => s + (r.total_due || 0), 0)
            const visiblePaid = processed.reduce((s, r) => s + (r.total_paid || 0), 0)

            // If we are in 'ACTIVE_BILLER' mode, the totalCount IS the number of active surveys
            const totalActiveSurveys = filters.masterStatus === 'ACTIVE_BILLER' ? currentCount : processed.filter(r => r.is_biller).length

            setStats({
                totalSurveys: currentCount || 0,
                activeSurveys: totalActiveSurveys,
                archivedRecords: filters.masterStatus === 'ARCHIVED' ? (currentCount || 0) : 0,
                totalDue: visibleDue,
                totalPaid: visiblePaid,
                recoveryRate: visibleDue > 0 ? (visiblePaid / visibleDue) * 100 : 0
            })

        } catch (err) {
            console.error('Fetch error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }))
    }


    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
            {/* Header Section */}
            <div className="p-2 md:p-3 md:px-6 pb-2 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 gap-1.5 md:gap-4 shrink-0">
                <div className="flex items-center gap-1.5 md:gap-3 min-w-0 flex-1">
                    <div className="p-1.5 md:p-3 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0 hidden sm:block">
                        <BarChart3 size={18} className="md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-slate-900 dark:text-slate-100 font-display uppercase tracking-tight truncate leading-tight">
                            {filters.uc || filters.tehsil || filters.district || 'Global Dataset'}
                        </h1>
                        <p className="text-slate-500 text-[8.5px] md:text-[11px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1 md:gap-2 opacity-80">
                            <span className="text-indigo-500 truncate max-w-[60px] md:max-w-none">
                                {filters.uc ? 'UC' : filters.tehsil ? 'Tehsil' : 'District'}
                            </span>
                            <span className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-slate-300"></span>
                            <span className="whitespace-nowrap">{totalCount.toLocaleString()} Recs</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                    {/* Unified Control Toolbar */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg overflow-hidden h-8 md:h-10 border border-slate-200 dark:border-white/5 shadow-sm">
                        {[
                            { id: 'ALL', label: 'ALL' },
                            { id: 'ACTIVE_BILLER', label: 'ACTIVE' },
                            { id: 'NEW_SURVEY', label: 'NEW' },
                            { id: 'ARCHIVED', label: 'ARCHIVED' }
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setFilters(prev => ({ ...prev, masterStatus: s.id }))}
                                className={`px-2 md:px-4 h-full text-[7px] md:text-[10px] font-black tracking-widest transition-all ${filters.masterStatus === s.id ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {s.label}
                            </button>
                        ))}

                        <div className="w-px h-4 bg-slate-200 dark:bg-white/10"></div>

                        <button
                            onClick={() => {
                                if (window.innerWidth < 768) {
                                    setIsMobileFilterOpen(true)
                                } else {
                                    setIsFilterOpen(!isFilterOpen)
                                }
                            }}
                            className={`flex items-center justify-center h-full px-3 md:px-4 text-[8px] md:text-[10px] font-black transition-all ${isFilterOpen || isMobileFilterOpen ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
                            title="Toggle Filters"
                        >
                            <Filter size={14} /> <span className="hidden lg:inline ml-1.5">FILTERS</span>
                        </button>

                        <button className="flex items-center justify-center h-full px-3 md:px-4 text-[8px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all">
                            <FileSpreadsheet size={14} /> <span className="hidden lg:inline ml-1.5">EXPORT</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            {/* Unifed Table Container including Filters */}
            <div className="flex-1 flex flex-col overflow-hidden relative gap-0">
                <div className="glass-panel overflow-hidden border-t border-slate-200 dark:border-white/5 flex-1 flex flex-col bg-white dark:bg-slate-900/50 min-h-0">

                    {/* Integrated Filter Bar (Desktop) */}
                    <div className="hidden md:block px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                        {isFilterOpen ? (
                            <div className="flex flex-col md:flex-row gap-3 items-center">
                                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <div className="md:col-span-1 relative group h-[42px]">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10" size={16} />
                                        <input
                                            type="text"
                                            placeholder="SEARCH..."
                                            className="w-full h-full pl-11 pr-4 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                            value={filters.search}
                                            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                        />
                                    </div>

                                    <ModernDropdown
                                        options={districts}
                                        value={filters.district}
                                        onChange={(val) => setFilters(f => ({ ...f, district: val, tehsil: '', uc: '' }))}
                                        placeholder="DISTRICT"
                                    />

                                    <ModernDropdown
                                        options={tehsils}
                                        value={filters.tehsil}
                                        onChange={(val) => setFilters(f => ({ ...f, tehsil: val, uc: '' }))}
                                        placeholder="TEHSIL"
                                    />

                                    <ModernDropdown
                                        options={ucs}
                                        value={filters.uc}
                                        onChange={(val) => setFilters(f => ({ ...f, uc: val }))}
                                        placeholder="UC / AREA"
                                    />

                                    <ModernDropdown
                                        options={surveyors}
                                        value={filters.surveyor}
                                        onChange={(val) => setFilters(f => ({ ...f, surveyor: val }))}
                                        placeholder="SURVEYOR"
                                    />
                                </div>

                                <button
                                    onClick={() => { setFilters({ district: 'SARGODHA', tehsil: '', uc: '', surveyor: '', search: '', billerStatus: 'ALL' }); setPageIndex(0); }}
                                    className="h-[42px] px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-bold text-[10px] tracking-[0.1em] rounded-lg transition-all active:scale-95 border border-slate-200 dark:border-white/5 shrink-0"
                                >
                                    RESET
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Filters Hidden</span>
                                <button className="text-xs font-bold text-indigo-500" onClick={() => setIsFilterOpen(true)}>SHOW FILTERS</button>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-6 mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
                            <AlertCircle size={20} />
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest block">Query Logic Failure</span>
                                <span className="text-[10px] opacity-80">{error}</span>
                            </div>
                        </div>
                    )}


                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-0 py-3 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 sticky top-0 z-10 shadow-sm">
                        <div
                            className={`col-span-2 md:col-span-2 lg:col-span-1 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 pl-6 group/sort ${sortConfig.key === 'id_numeric' ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => toggleSort('id_numeric')}
                        >
                            ID <ArrowUpDown size={12} className={`transition-transform duration-300 ${sortConfig.key === 'id_numeric' && sortConfig.direction === 'asc' ? 'rotate-180 text-indigo-500' : 'opacity-40 group-hover/sort:opacity-100'}`} />
                        </div>
                        <div className="col-span-7 md:col-span-4 lg:col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Identity</div>
                        <div className="col-span-3 md:col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</div>
                        <div className="hidden md:block md:col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Finance</div>
                        <div className="hidden lg:block lg:col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Billing</div>
                        <div className="hidden md:block md:col-span-2 lg:col-span-1 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-4">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="flex-1 overflow-y-auto scrollbar-premium">
                        <div className="divide-y divide-slate-200/60 dark:divide-white/[0.02]">
                            {loading ? (
                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                    <RefreshCw className="text-indigo-500 animate-spin" size={40} />
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Syncing with Supabase...</span>
                                </div>
                            ) : records.length > 0 ? (
                                records.map(record => (
                                    <div key={record.survey_id} className="grid grid-cols-12 gap-0 hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-colors items-center border-b border-slate-200/60 dark:border-white/[0.02] last:border-0">
                                        <div className="col-span-2 md:col-span-2 lg:col-span-1 pl-6 py-2.5 pr-2">
                                            <span className="text-base font-black text-indigo-500 tabular-nums drop-shadow-sm flex justify-center md:justify-start">{record.survey_id}</span>
                                        </div>
                                        <div className="col-span-7 md:col-span-4 lg:col-span-3 pl-2 py-2.5" onClick={() => setSelectedSurveyId(record.survey_id)}>
                                            <div className="flex flex-col cursor-pointer">
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px] md:max-w-none">{record.consumer_name || 'Anonymous'}</span>
                                                <span className="hidden sm:flex text-[10px] text-slate-500 items-center gap-1 mt-1 font-medium italic opacity-80">
                                                    <MapPin size={10} className="text-indigo-500/50" />
                                                    {shortenAreaName(record.uc_name, record.city_district, record.tehsil)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-span-3 md:col-span-2 px-4 py-2.5 flex flex-col items-center justify-center gap-1 border-x border-slate-200/60 dark:border-white/5">
                                            {record.status === 'ARCHIVED' ? (
                                                <div className="px-2 py-0.5 rounded text-[8px] font-black bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">ARCHIVED</div>
                                            ) : record.is_biller ? (
                                                <div className="px-2 py-0.5 rounded text-[8px] font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">ACTIVE</div>
                                            ) : (
                                                <div className="px-2 py-0.5 rounded text-[8px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-white/10 shadow-[0_0_8px_rgba(100,116,139,0.1)]">NEW SURVEY</div>
                                            )}
                                        </div>
                                        <div className="hidden md:flex md:col-span-2 px-6 py-2.5 flex flex-col items-center">
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                                                <CurrencyText amount={record.total_paid} />
                                            </div>
                                            <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                                                of <CurrencyText amount={record.total_due} />
                                            </div>
                                        </div>
                                        <div className="hidden lg:flex lg:col-span-2 px-6 py-2.5 items-center justify-center gap-4">
                                            {record.history.map((h, hi) => (
                                                <div key={hi} className="flex flex-col items-center gap-1.5 p-1.5 rounded-xl border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <div className={`w-2.5 h-1.5 rounded-full ${h.paid === null ? 'bg-slate-200 dark:bg-slate-800' : h.paid ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-400'}`} />
                                                        <div className={`${h.issued === null ? 'text-slate-200 dark:text-slate-800' : h.issued ? 'text-indigo-500' : 'text-slate-300'}`}>
                                                            <Printer size={10} strokeWidth={h.issued ? 3 : 2} />
                                                        </div>
                                                    </div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase">{h.month.substring(0, 3)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="hidden md:flex md:col-span-2 lg:col-span-1 px-6 py-2.5 justify-end">
                                            <button
                                                onClick={() => setSelectedSurveyId(record.survey_id)}
                                                className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center opacity-50">
                                    <Search className="mx-auto text-slate-300 mb-4" size={48} />
                                    <div className="text-sm font-bold text-slate-400">NO RECORDS IN THIS SECTOR</div>
                                    <div className="text-xs text-slate-500 mt-1">Try resetting filters to show all districts</div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Pagination & Status Footer */}
                    <div className="py-2.5 px-4 md:px-6 pb-safe bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 flex items-center justify-between z-30 shrink-0">
                        <div className="hidden md:flex text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest items-center gap-4">
                            <span className="bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">PAGE {pageIndex + 1} OF {Math.ceil(totalCount / PAGE_SIZE)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>SHOWING {records.length} OF {totalCount.toLocaleString()} TOTAL RECORDS</span>
                        </div>
                        <div className="flex md:hidden flex-col">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">PAGE {pageIndex + 1} / {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em]">{totalCount.toLocaleString()} TOTAL</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                disabled={pageIndex === 0}
                                onClick={() => setPageIndex(0)}
                                className="p-2 md:p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
                                title="First Page"
                            >
                                <ChevronsLeft size={16} className="md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                                disabled={pageIndex === 0}
                                onClick={() => setPageIndex(p => p - 1)}
                                className="p-2 md:p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
                                title="Previous Page"
                            >
                                <ChevronLeft size={16} className="md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                                disabled={(pageIndex + 1) * PAGE_SIZE >= totalCount}
                                onClick={() => setPageIndex(p => p + 1)}
                                className="p-2 md:p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
                                title="Next Page"
                            >
                                <ChevronRight size={16} className="md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                                disabled={(pageIndex + 1) * PAGE_SIZE >= totalCount}
                                onClick={() => setPageIndex(Math.max(0, Math.ceil(totalCount / PAGE_SIZE) - 1))}
                                className="p-2 md:p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
                                title="Last Page"
                            >
                                <ChevronsRight size={16} className="md:w-3.5 md:h-3.5" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <div className={`fixed inset-0 z-[2000] md:hidden transition-all duration-300 ${isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsMobileFilterOpen(false)}></div>

                {/* Drawer Content */}
                <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-white/5 transition-transform duration-500 ease-out shadow-2xl ${isMobileFilterOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="p-6 pb-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <Filter size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">Filters</h2>
                            </div>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="SEARCH BY ID OR NAME..."
                                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-bold text-slate-800 dark:text-slate-100 transition-all outline-none focus:border-indigo-500"
                                    value={filters.search}
                                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Location Strategy</p>
                                    <div className="space-y-3">
                                        <ModernDropdown options={districts} value={filters.district} onChange={(val) => setFilters(f => ({ ...f, district: val, tehsil: '', uc: '' }))} placeholder="DISTRICT" />
                                        <ModernDropdown options={tehsils} value={filters.tehsil} onChange={(val) => setFilters(f => ({ ...f, tehsil: val, uc: '' }))} placeholder="TEHSIL" />
                                        <ModernDropdown options={ucs} value={filters.uc} onChange={(val) => setFilters(f => ({ ...f, uc: val }))} placeholder="UC / AREA" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Attribution</p>
                                    <ModernDropdown options={surveyors} value={filters.surveyor} onChange={(val) => setFilters(f => ({ ...f, surveyor: val }))} placeholder="SURVEYOR" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => { setFilters({ district: 'SARGODHA', tehsil: '', uc: '', surveyor: '', search: '', masterStatus: 'ALL' }); setIsMobileFilterOpen(false); }}
                                    className="flex-1 h-14 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-xs tracking-widest rounded-2xl border border-slate-200 dark:border-white/5 transition-all active:scale-95"
                                >
                                    RESET ALL
                                </button>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="flex-[2] h-14 bg-indigo-600 text-white font-black text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                                >
                                    APPLY FILTERS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
