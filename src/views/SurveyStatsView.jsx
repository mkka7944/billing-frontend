import { useState, useEffect, useMemo } from 'react'
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
import { CurrencyText } from '../components/common/UIComponents'
import { useLocationHierarchy } from '../lib/locationHooks'
import { DataTable } from '../components/common/DataTable'
import RecordDetail from '../components/RecordDetail'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const PAGE_SIZE = 50

export default function SurveyStatsView() {
    const { selectedSurveyId, setSelectedSurveyId } = useUI()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pageIndex, setPageIndex] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

    const [filters, setFilters] = useState({
        district: '',
        tehsil: '',
        uc: '',
        surveyor: '',
        unitType: 'ALL', // Domestic/Commercial
        masterStatus: 'ALL',
        search: ''
    })

    const { districts, tehsils, ucs } = useLocationHierarchy(filters)
    const [surveyors, setSurveyors] = useState([])
    const [sortConfig, setSortConfig] = useState({ key: 'id_numeric', direction: 'desc' })
    const [isFilterOpen, setIsFilterOpen] = useState(true)
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    // Columns Definition
    const columns = useMemo(() => [
        {
            accessorKey: "survey_id",
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setSortConfig(prev => ({
                        key: 'id_numeric',
                        direction: prev.key === 'id_numeric' && prev.direction === 'desc' ? 'asc' : 'desc'
                    }))}
                >
                    ID <ArrowUpDown size={12} className="opacity-50" />
                </div>
            ),
            cell: ({ row }) => {
                const record = row.original
                // Extensive fallback check for building types (Domestic/Commercial)
                // We check every possible field that might carry this info in bridge/raw/hydrated views
                const rawType = record.unit_type || record.consumer_type || record.property_type || record.consumer_category || record.type || ''
                const type = rawType.toLowerCase()

                let badge = null
                if (type.includes('residen') || type.includes('domest') || type.includes('home')) {
                    badge = <Badge variant="outline" className="h-3.5 px-1 text-[8px] uppercase tracking-tighter font-black bg-blue-500/10 text-blue-600 border-blue-500/30 whitespace-nowrap">Domestic</Badge>
                } else if (type.includes('commer') || type.includes('shop') || type.includes('office')) {
                    badge = <Badge variant="outline" className="h-3.5 px-1 text-[8px] uppercase tracking-tighter font-black bg-purple-500/10 text-purple-600 border-purple-500/30 whitespace-nowrap">Commercial</Badge>
                }

                return (
                    <div className="flex flex-col gap-1 min-w-[80px]">
                        <span className="text-sm font-black text-indigo-500 tabular-nums leading-none">
                            {record.survey_id}
                        </span>
                        <div className="flex">
                            {badge && <div className="w-fit">{badge}</div>}
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "consumer_name",
            header: "Identity",
            cell: ({ row }) => {
                const record = row.original
                return (
                    <div
                        className="flex flex-col group"
                    >
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {record.consumer_name || 'Anonymous'}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium opacity-70">
                            <MapPin size={10} className="text-indigo-500/50" />
                            {shortenAreaName(record.uc_name, record.city_district, record.tehsil)}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const record = row.original
                if (record.status === 'ARCHIVED') return <Badge variant="destructive" className="uppercase text-[8px] font-black tracking-widest px-1.5 h-5 whitespace-nowrap">Archived</Badge>
                if (record.is_biller) return <Badge variant="secondary" className="uppercase text-[8px] font-black tracking-widest px-1.5 h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none hover:bg-emerald-500/15 whitespace-nowrap">Active</Badge>
                return <Badge variant="outline" className="uppercase text-[8px] font-black tracking-widest px-1.5 h-5 text-amber-600 border-amber-500/50 bg-amber-500/10 whitespace-nowrap">New Survey</Badge>
            },
        },
        {
            meta: { className: "hidden md:table-cell" },
            header: "Finance",
            cell: ({ row }) => (
                <div className="flex flex-col items-center">
                    <CurrencyText amount={row.original.total_paid} />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter opacity-70">
                        of <CurrencyText amount={row.original.total_due} />
                    </span>
                </div>
            ),
        },
        {
            meta: { className: "hidden md:table-cell" },
            header: "Billing History",
            cell: ({ row }) => (
                <div className="flex items-end gap-2 justify-center h-full pb-1">
                    {row.original.history.map((h, hi) => (
                        <div key={hi} className="flex flex-col items-center gap-1.5 min-w-[18px]">
                            <div className={`w-2 h-2 rounded-full transition-all ring-2 ring-offset-2 ring-transparent ${h.paid === null ? 'bg-muted ring-muted/20' : h.paid ? 'bg-emerald-500 shadow-emerald-500/20 shadow-sm' : 'bg-rose-500 shadow-rose-500/20 shadow-sm'}`} title={h.month} />
                            <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-tight leading-none">
                                {h.month.substring(0, 3)}
                            </span>
                        </div>
                    ))}
                </div>
            ),
        },
    ], [setSelectedSurveyId, sortConfig])

    // Fetch surveyors
    useEffect(() => {
        const fetchSurveyors = async () => {
            const { data, error } = await supabase.rpc('get_distinct_surveyors', {
                p_district: filters.district || null,
                p_tehsil: filters.tehsil || null,
                p_uc: filters.uc || null
            })
            if (!error && data) setSurveyors(data.map(item => item.surveyor_name))
        }
        fetchSurveyors()
    }, [filters.district, filters.tehsil, filters.uc])

    // --- Centralized Keyboard Navigation for Records ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only navigate if a record is selected and we aren't typing
            if (!selectedSurveyId) return;
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            const currentIdx = records.findIndex(r => r && String(r.survey_id).trim() === String(selectedSurveyId).trim());
            if (currentIdx === -1) return;

            if (e.key === 'ArrowRight') {
                const nextId = currentIdx < records.length - 1 ? records[currentIdx + 1].survey_id : null;
                if (nextId !== null && nextId !== undefined) {
                    setSelectedSurveyId(nextId);
                    e.preventDefault();
                }
            }
            if (e.key === 'ArrowLeft') {
                const prevId = currentIdx > 0 ? records[currentIdx - 1].survey_id : null;
                if (prevId !== null && prevId !== undefined) {
                    setSelectedSurveyId(prevId);
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedSurveyId, records]);

    useEffect(() => {
        const timeout = setTimeout(fetchData, 500)
        return () => clearTimeout(timeout)
    }, [filters, pageIndex, sortConfig])

    async function fetchData() {
        try {
            setLoading(true)
            setError(null)
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_hydrated_survey_stats', {
                p_district: filters.district || null,
                p_tehsil: filters.tehsil || null,
                p_uc: filters.uc || null,
                p_surveyor: filters.surveyor || null,
                p_search: filters.search || null,
                p_master_status: filters.masterStatus,
                p_unit_type: filters.unitType === 'ALL' ? null : filters.unitType,
                p_sort_column: sortConfig.key,
                p_sort_direction: sortConfig.direction,
                p_page_size: PAGE_SIZE,
                p_page_index: pageIndex
            })

            if (rpcError) throw rpcError
            const { total_result_count, hydrated_records } = rpcData?.[0] || { total_result_count: 0, hydrated_records: [] }
            setTotalCount(Number(total_result_count))
            setRecords(hydrated_records || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-colors duration-300 overflow-hidden">
            {/* Standardized Header */}
            <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/30 backdrop-blur-md shrink-0">
                <div className="min-w-0 flex-1 flex flex-col items-start gap-1">
                    <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase truncate leading-none w-full">
                        {filters.uc || filters.tehsil || filters.district || 'Global Operations'}
                    </h1>
                    <Badge variant="outline" className="text-[10px] py-0 h-5 border-indigo-500/20 text-indigo-500 bg-indigo-500/5 tabular-nums whitespace-nowrap">
                        {totalCount.toLocaleString()} DATA POINTS
                    </Badge>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <div className="hidden md:flex items-center bg-muted/50 p-1 rounded-xl border border-border/50">
                        {['ALL', 'ACTIVE_BILLER', 'NEW_SURVEY', 'ARCHIVED'].map(s => (
                            <Button
                                key={s}
                                variant={filters.masterStatus === s ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setFilters(prev => ({ ...prev, masterStatus: s }))}
                                className={`h-8 px-3 text-[10px] font-black tracking-widest uppercase transition-all ${filters.masterStatus === s ? 'bg-card' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {s.split('_')[0]}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            if (window.innerWidth < 768) {
                                setMobileFiltersOpen(true)
                            } else {
                                setIsFilterOpen(!isFilterOpen)
                            }
                        }}
                        className={`h-10 w-10 rounded-xl transition-all ${isFilterOpen ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 hover:bg-primary/90' : 'bg-card/50'}`}
                    >
                        <Filter size={18} />
                    </Button>
                </div>
            </div>

            {/* View Shell */}
            <div className="flex-1 flex flex-col p-4 gap-4 min-h-0 overflow-hidden">
                {/* Ultra-Responsive Filter Matrix (Desktop/Tablet) */}
                {isFilterOpen && (
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 2xl:flex 2xl:flex-nowrap 2xl:items-center gap-2 p-2 bg-muted/30 border border-border/40 rounded-xl animate-in slide-in-from-top-2 duration-300">
                        <div className="relative group w-full xl:w-48 shrink-0">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                            <Input
                                placeholder="SEARCH..."
                                className="h-9 pl-8 bg-card/50 border-border/50 font-bold uppercase tracking-widest text-[10px]"
                                value={filters.search}
                                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full xl:w-fit">
                            <Select value={filters.district || "ALL_DISTRICTS"} onValueChange={(val) => setFilters(f => ({ ...f, district: val === "ALL_DISTRICTS" ? "" : val, tehsil: '', uc: '' }))}>
                                <SelectTrigger className="h-9 w-full xl:w-[120px] bg-card/50 text-[10px] font-bold uppercase tracking-wide">
                                    <SelectValue placeholder="DISTRICT" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL_DISTRICTS">ALL DISTRICTS</SelectItem>
                                    {districts.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.tehsil || "ALL_TEHSILS"} onValueChange={(val) => setFilters(f => ({ ...f, tehsil: val === "ALL_TEHSILS" ? "" : val, uc: '' }))}>
                                <SelectTrigger className="h-9 w-full xl:w-[120px] bg-card/50 text-[10px] font-bold uppercase tracking-wide">
                                    <SelectValue placeholder="TEHSIL" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL_TEHSILS">ALL TEHSILS</SelectItem>
                                    {tehsils.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 w-full xl:w-fit">
                            <Select value={filters.uc || "ALL_UCS"} onValueChange={(val) => setFilters(f => ({ ...f, uc: val === "ALL_UCS" ? "" : val }))}>
                                <SelectTrigger className="h-9 w-full xl:w-[120px] bg-card/50 text-[10px] font-bold uppercase tracking-wide text-left">
                                    <SelectValue placeholder="UC" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL_UCS">ALL UCS</SelectItem>
                                    {ucs.map((u) => (
                                        <SelectItem key={u} value={u}>{u}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.surveyor || "ALL_SURVEYORS"} onValueChange={(val) => setFilters(f => ({ ...f, surveyor: val === "ALL_SURVEYORS" ? "" : val }))}>
                                <SelectTrigger className="h-9 w-full xl:w-[120px] bg-card/50 text-[10px] font-bold uppercase tracking-wide">
                                    <SelectValue placeholder="SURVEYOR" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL_SURVEYORS">ALL SURVEYORS</SelectItem>
                                    {surveyors.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 w-full xl:w-fit">
                            <Select value={filters.unitType || "ALL"} onValueChange={(val) => setFilters(f => ({ ...f, unitType: val }))}>
                                <SelectTrigger className="h-9 w-full xl:w-[120px] bg-card/50 text-[10px] font-bold uppercase tracking-wide">
                                    <SelectValue placeholder="TYPE" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">ALL TYPES</SelectItem>
                                    <SelectItem value="Domestic">DOMESTIC</SelectItem>
                                    <SelectItem value="Commercial">COMMERCIAL</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 ml-auto xl:ml-0"
                                onClick={() => setFilters({ district: 'SARGODHA', tehsil: '', uc: '', surveyor: '', unitType: 'ALL', search: '', masterStatus: 'ALL' })}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error Logic Gating */}
                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-left-2 shadow-sm">
                        <AlertCircle size={20} />
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest block">Operational Failure</span>
                            <span className="text-[10px] font-bold opacity-80">{error}</span>
                        </div>
                    </div>
                )}

                {/* Data Matrix */}
                <div className="flex-1 min-h-0 overflow-auto no-scrollbar flex flex-col rounded-xl border border-border/50 bg-card/30">
                    <DataTable
                        columns={columns}
                        data={records}
                        loading={loading}
                        onRowClick={(row) => setSelectedSurveyId(row.survey_id)}
                    />
                </div>

                {/* Standardized Operational Footer */}
                <div className="pt-4 flex items-center justify-between border-t border-border shrink-0">
                    <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                        <span className="bg-muted px-2 py-1 rounded-md text-foreground/80">Page {pageIndex + 1} of {Math.ceil(totalCount / PAGE_SIZE)}</span>
                        <span>Showing {records.length} of {totalCount.toLocaleString()} Entries</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={pageIndex === 0}
                            onClick={() => setPageIndex(0)}
                            className="hidden md:flex h-9 w-9 bg-card/50 hover:bg-muted disabled:opacity-30 rounded-xl"
                        >
                            <ChevronsLeft size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={pageIndex === 0}
                            onClick={() => setPageIndex(p => p - 1)}
                            className="h-9 w-9 bg-card/50 hover:bg-muted disabled:opacity-30 rounded-xl"
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={(pageIndex + 1) * PAGE_SIZE >= totalCount}
                            onClick={() => setPageIndex(p => p + 1)}
                            className="h-9 w-9 bg-card/50 hover:bg-muted disabled:opacity-30 rounded-xl"
                        >
                            <ChevronRight size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={(pageIndex + 1) * PAGE_SIZE >= totalCount}
                            onClick={() => setPageIndex(Math.max(0, Math.ceil(totalCount / PAGE_SIZE) - 1))}
                            className="hidden md:flex h-9 w-9 bg-card/50 hover:bg-muted disabled:opacity-30 rounded-xl"
                        >
                            <ChevronsRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
            {/* Mobile Filter Sheet */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetContent side="bottom" className="rounded-t-3xl pt-6 bg-background/95 backdrop-blur-xl border-t border-border/50">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="uppercase font-black tracking-widest text-lg">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 pb-8">
                        <div className="flex items-center bg-muted/50 p-1.5 rounded-xl border border-border/50 w-full">
                            {['ALL', 'ACTIVE_BILLER', 'NEW_SURVEY', 'ARCHIVED'].map(s => (
                                <Button
                                    key={s}
                                    variant={filters.masterStatus === s ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setFilters(prev => ({ ...prev, masterStatus: s }))}
                                    className={`flex-1 h-8 px-0 text-[9px] font-black tracking-widest uppercase transition-all ${filters.masterStatus === s ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {s.split('_')[0]}
                                </Button>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={16} />
                                <Input
                                    placeholder="SEARCH DATASET..."
                                    className="h-11 pl-10 bg-card/50 border-border/50 font-bold uppercase tracking-widest text-xs"
                                    value={filters.search}
                                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <Select value={filters.district || "ALL_DISTRICTS"} onValueChange={(val) => setFilters(f => ({ ...f, district: val === "ALL_DISTRICTS" ? "" : val, tehsil: '', uc: '' }))}>
                                    <SelectTrigger className="h-11 bg-card/50 text-xs font-bold uppercase tracking-wide">
                                        <SelectValue placeholder="DISTRICT" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL_DISTRICTS">ALL DISTRICTS</SelectItem>
                                        {districts.map((d) => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filters.tehsil || "ALL_TEHSILS"} onValueChange={(val) => setFilters(f => ({ ...f, tehsil: val === "ALL_TEHSILS" ? "" : val, uc: '' }))}>
                                    <SelectTrigger className="h-11 bg-card/50 text-xs font-bold uppercase tracking-wide">
                                        <SelectValue placeholder="TEHSIL" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL_TEHSILS">ALL TEHSILS</SelectItem>
                                        {tehsils.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filters.uc || "ALL_UCS"} onValueChange={(val) => setFilters(f => ({ ...f, uc: val === "ALL_UCS" ? "" : val }))}>
                                    <SelectTrigger className="h-11 bg-card/50 text-xs font-bold uppercase tracking-wide">
                                        <SelectValue placeholder="UC / AREA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL_UCS">ALL UCS</SelectItem>
                                        {ucs.map((u) => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filters.surveyor || "ALL_SURVEYORS"} onValueChange={(val) => setFilters(f => ({ ...f, surveyor: val === "ALL_SURVEYORS" ? "" : val }))}>
                                    <SelectTrigger className="h-11 bg-card/50 text-xs font-bold uppercase tracking-wide">
                                        <SelectValue placeholder="SURVEYOR" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL_SURVEYORS">ALL SURVEYORS</SelectItem>
                                        {surveyors.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 border-dashed border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 font-black uppercase tracking-widest"
                                onClick={() => {
                                    setFilters({ district: 'SARGODHA', tehsil: '', uc: '', surveyor: '', unitType: 'ALL', search: '', masterStatus: 'ALL' })
                                    setMobileFiltersOpen(false)
                                }}
                            >
                                Reset
                            </Button>
                            <Button className="flex-[2] h-12 font-black uppercase tracking-widest" onClick={() => setMobileFiltersOpen(false)}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Record Detail Sheet - Detail View */}
            <Sheet open={!!selectedSurveyId} onOpenChange={(open) => !open && setSelectedSurveyId(null)}>
                <SheetContent side="right" className="w-[100vw] sm:w-[540px] p-0 border-l border-border/50 bg-background sm:rounded-l-3xl overflow-hidden shadow-2xl">
                    {selectedSurveyId && (() => {
                        // Pre-calculate target IDs during render for stable, stateless navigation
                        const currentIdx = records.findIndex(r => r && String(r.survey_id).trim() === String(selectedSurveyId).trim());

                        const prevId = currentIdx > 0 ? records[currentIdx - 1].survey_id : null;
                        const nextId = (currentIdx !== -1 && currentIdx < records.length - 1) ? records[currentIdx + 1].survey_id : null;

                        return (
                            <RecordDetail
                                key={`detail-${selectedSurveyId}`}
                                surveyId={selectedSurveyId}
                                onClose={() => setSelectedSurveyId(null)}
                                hasNext={nextId !== null && nextId !== undefined}
                                hasPrev={prevId !== null && prevId !== undefined}
                                onNext={nextId !== null && nextId !== undefined ? () => setSelectedSurveyId(nextId) : null}
                                onPrev={prevId !== null && prevId !== undefined ? () => setSelectedSurveyId(prevId) : null}
                            />
                        )
                    })()}
                </SheetContent>
            </Sheet>
        </div >
    )
}
