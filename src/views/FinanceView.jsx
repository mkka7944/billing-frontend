import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
    Search, Filter, MapPin, User, Calendar,
    ChevronDown, ChevronUp, Check, MoreHorizontal, ArrowUpDown,
    Download, FileSpreadsheet, Eye, UserCheck,
    ArrowLeft, X, CreditCard, BarChart3, AlertCircle,
    CheckCircle2, Printer, Layers, RefreshCw, Users,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    History, TrendingUp, DollarSign, Wallet
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

const PAGE_SIZE = 50

export default function FinanceView() {
    const { setSelectedSurveyId } = useUI()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pageIndex, setPageIndex] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [recordHistory, setRecordHistory] = useState(null)

    const [historyLoading, setHistoryLoading] = useState(false)

    // Summary Data State
    const [summaryData, setSummaryData] = useState({
        grand_totals: { total_revenue: 0, total_bills_paid: 0, total_demand: 0, total_units: 0, total_transactions: 0 },
        tehsils: [],
        mcucs: [],
        categories: []
    })
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [summaryError, setSummaryError] = useState(null)

    const [filters, setFilters] = useState({
        district: '',
        tehsil: '',
        uc: '',
        surveyor: '',
        unitType: 'ALL',
        month: 'ALL',
        search: ''
    })

    const [openSections, setOpenSections] = useState({
        tehsil: true,
        mcuc: true,
        category: true
    })

    const { districts, tehsils, ucs } = useLocationHierarchy(filters)
    const [surveyors, setSurveyors] = useState([])
    const [sortConfig, setSortConfig] = useState({ key: 'id_numeric', direction: 'desc' })

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }


    // Fetch Summary Metrics (RPC #1)
    const fetchSummaryMetrics = useCallback(async () => {
        try {
            setSummaryLoading(true)
            setSummaryError(null)

            // Normalize month name to "MMM-YYYY" for RPC snapshot logic
            let snapshotMonth = 'Dec-2025' // Default
            if (filters.month !== 'ALL') {
                const [month, year] = filters.month.split(' ')
                if (month && year) {
                    snapshotMonth = `${month.substring(0, 3)}-${year}`
                }
            }

            // Log outgoing params
            const params = {
                p_district: filters.district || null,
                p_tehsil: filters.tehsil || null,
                p_bill_month: snapshotMonth
            }
            console.log("Fetching Summary with Params:", params)

            const { data, error } = await supabase.rpc('get_finance_summary_metrics', params)

            if (error) {
                console.error("RPC Error (Summary):", error)
                setSummaryError(error.message)
                return
            }

            if (!data) {
                console.warn("Summary RPC returned no data.")
                return
            }

            console.log("Finance Metrics Data Received:", data)
            setSummaryData({
                grand_totals: data.grand_totals || { total_revenue: 0, total_bills_paid: 0, total_demand: 0, total_units: 0, total_transactions: 0 },
                tehsils: (data.tehsil_stats || []).map(i => ({
                    name: i.name || 'UNKNOWN',
                    units: i.total_units || 0,
                    paid: i.total_paid || 0,
                    transactions: i.total_transactions || 0,
                    amount: i.total_collected || 0
                })),
                mcucs: (data.uc_stats || []).map(i => ({
                    name: i.name || 'UNKNOWN',
                    units: i.total_units || 0,
                    paid: i.total_paid || 0,
                    transactions: i.total_transactions || 0,
                    amount: i.total_collected || 0
                })),
                categories: (data.category_stats || []).map(i => ({
                    name: i.name || 'UNKNOWN',
                    units: i.count || 0,
                    paid: i.total_paid || 0,
                    transactions: i.total_transactions || 0,
                    amount: i.potential_revenue || 0
                }))
            })
        } catch (err) {
            console.error("Critical Summary Error:", err)
            setSummaryError(err.message)
        } finally {
            setSummaryLoading(false)
        }
    }, [filters.district, filters.tehsil, filters.month])

    // Debounced Summary Fetch
    useEffect(() => {
        const timeout = setTimeout(fetchSummaryMetrics, 300)
        return () => clearTimeout(timeout)
    }, [fetchSummaryMetrics])

    const columns = useMemo(() => [
        {
            accessorKey: "survey_id",
            header: "Survey ID",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black text-primary tabular-nums leading-none">
                        {row.original.survey_id}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">
                        {row.original.surveyor_name || 'System'}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "consumer_name",
            header: "Identity",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold truncate max-w-[150px]">
                        {row.original.consumer_name || 'Anonymous'}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                        {row.original.address || 'No Address'}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const record = row.original
                if (record.is_biller) return <Badge variant="secondary" className="uppercase text-[8px] font-black tracking-widest px-1.5 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none">Active</Badge>
                return <Badge variant="outline" className="uppercase text-[8px] font-black tracking-widest px-1.5 h-4 text-amber-600 border-amber-500/50 bg-amber-500/10">Pending</Badge>
            }
        }
    ], [])

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_hydrated_survey_stats', {
                p_district: filters.district || null,
                p_tehsil: filters.tehsil || null,
                p_uc: filters.uc || null,
                p_surveyor: filters.surveyor || null,
                p_search: filters.search || null,
                p_master_status: 'ACTIVE_BILLER', // Focus on active billers for finance
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
    }, [filters, pageIndex, sortConfig])

    const fetchRecordHistory = async (record) => {
        try {
            setHistoryLoading(true)
            setSelectedRecord(record)
            const { data, error } = await supabase.rpc('get_unit_history_360', { p_survey_id: record.survey_id })
            if (error) throw error
            setRecordHistory(Array.isArray(data) ? data[0] : data)
        } catch (err) {
            console.error('History Error:', err)
        } finally {
            setHistoryLoading(false)
        }
    }

    useEffect(() => {
        const timeout = setTimeout(fetchData, 500)
        return () => clearTimeout(timeout)
    }, [fetchData])

    // Months for filter (Current and previous 11)
    const monthOptions = useMemo(() => {
        const options = []
        const date = new Date()
        for (let i = 0; i < 12; i++) {
            const m = date.toLocaleString('default', { month: 'long', year: 'numeric' })
            options.push(m)
            date.setMonth(date.getMonth() - 1)
        }
        return options
    }, [])

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-card/30 backdrop-blur-md shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-xl font-black tracking-tight uppercase leading-none">Finance Center</h1>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Billing & Recovery Audit</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black tracking-widest uppercase gap-2 bg-card">
                        <Download size={12} />
                        Export Ledger
                    </Button>
                    <Button onClick={() => { fetchData(); fetchSummaryMetrics(); }} variant="outline" size="icon" className="h-8 w-8 bg-card">
                        <RefreshCw size={14} className={loading || summaryLoading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            {/* Main Content: 3-Section Layout (Resizable) */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">

                    {/* Left Section: Aggregated Summaries */}
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                        <aside className="h-full flex flex-col bg-secondary/10 border-r border-border">
                            <div className="p-3 border-b border-border bg-card/20">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                                    <TrendingUp size={14} className="text-primary" />
                                    Financial Summaries
                                </h2>
                                <div className="space-y-2">
                                    {summaryError ? (
                                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                                            <p className="text-[9px] font-black text-destructive uppercase mb-2">Sync Error</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-[8px] font-black uppercase w-full"
                                                onClick={fetchSummaryMetrics}
                                            >
                                                Retry Sync
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-2 rounded-lg bg-background border border-border/50 relative overflow-hidden">
                                                {summaryLoading && <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 animate-pulse" />}
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Total Potential (Demand)</span>
                                                    <span className="text-3xl md:text-4xl font-black tabular-nums tracking-tighter text-purple-500 font-mono">
                                                        <CurrencyText amount={summaryData.grand_totals.total_demand} />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-4 relative overflow-hidden">
                                                {summaryLoading && <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 animate-pulse" />}
                                                <div className="p-3 rounded-xl bg-background border border-border/50 shadow-sm">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Total Recovery</span>
                                                    <span className="text-xl font-black tabular-nums text-emerald-500 font-mono">
                                                        <CurrencyText amount={summaryData.grand_totals.total_revenue} />
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="p-3 rounded-xl bg-background border border-border/50 shadow-sm">
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Units</span>
                                                        <span className="text-sm font-black tabular-nums text-blue-500">
                                                            {summaryData.grand_totals.total_units.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-background border border-border/50 shadow-sm">
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Receipts</span>
                                                        <span className="text-sm font-black tabular-nums text-amber-500">
                                                            {summaryData.grand_totals.total_transactions.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <ScrollArea className="flex-1 p-2">
                                <div className="space-y-2">
                                    {/* Tehsil List */}
                                    <SummaryCollapsible
                                        title="Tehsil Wise Paid"
                                        isOpen={openSections.tehsil}
                                        onToggle={() => toggleSection('tehsil')}
                                        items={summaryData.tehsils}
                                    />
                                    {/* MC/UC List */}
                                    <SummaryCollapsible
                                        title="MC/UC Wise Paid"
                                        isOpen={openSections.mcuc}
                                        onToggle={() => toggleSection('mcuc')}
                                        items={summaryData.mcucs}
                                    />
                                    {/* Category List */}
                                    <SummaryCollapsible
                                        title="Major Categories"
                                        isOpen={openSections.category}
                                        onToggle={() => toggleSection('category')}
                                        items={summaryData.categories}
                                        color="purple"
                                        label="Potential"
                                    />
                                </div>
                            </ScrollArea>
                        </aside>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Middle Section: Records List */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <main className="h-full flex flex-col min-w-0 bg-background">
                            {/* Filters Strip */}
                            <div className="px-4 py-2 bg-muted/20 border-b border-border flex flex-wrap items-center gap-2">
                                <div className="relative group w-40">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={12} />
                                    <Input
                                        placeholder="SURVEY ID / NAME"
                                        className="h-8 pl-8 bg-card text-[10px] font-bold uppercase border-border/50"
                                        value={filters.search}
                                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                    />
                                </div>
                                <Select value={filters.month} onValueChange={(val) => setFilters(f => ({ ...f, month: val }))}>
                                    <SelectTrigger className="h-8 w-32 bg-card text-[10px] font-bold uppercase border-border/50">
                                        <SelectValue placeholder="MONTH" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">ALL MONTHS</SelectItem>
                                        {monthOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.district || "ALL"} onValueChange={(val) => setFilters(f => ({ ...f, district: val === "ALL" ? "" : val, tehsil: '', uc: '' }))}>
                                    <SelectTrigger className="h-8 w-28 bg-card text-[10px] font-bold uppercase border-border/50">
                                        <SelectValue placeholder="DISTRICT" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">ALL DISTRICTS</SelectItem>
                                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.tehsil || "ALL"} onValueChange={(val) => setFilters(f => ({ ...f, tehsil: val === "ALL" ? "" : val, uc: '' }))}>
                                    <SelectTrigger className="h-8 w-28 bg-card text-[10px] font-bold uppercase border-border/50">
                                        <SelectValue placeholder="TEHSIL" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">ALL TEHSILS</SelectItem>
                                        {tehsils.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-[10px] font-bold uppercase text-muted-foreground hover:text-destructive"
                                    onClick={() => setFilters({ district: '', tehsil: '', uc: '', surveyor: '', unitType: 'ALL', month: 'ALL', search: '' })}
                                >
                                    Reset
                                </Button>
                            </div>

                            <div className="flex-1 overflow-auto no-scrollbar">
                                <DataTable
                                    columns={columns}
                                    data={records}
                                    loading={loading}
                                    onRowClick={fetchRecordHistory}
                                />
                            </div>
                            {/* Pagination */}
                            <div className="p-2 border-t border-border flex items-center justify-between bg-card/10">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2">
                                    Showing {records.length} of {totalCount.toLocaleString()} Entries
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={pageIndex === 0} onClick={() => setPageIndex(p => p - 1)}><ChevronLeft size={14} /></Button>
                                    <span className="text-[10px] font-bold px-2 tabular-nums">{pageIndex + 1}</span>
                                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={(pageIndex + 1) * PAGE_SIZE >= totalCount} onClick={() => setPageIndex(p => p + 1)}><ChevronRight size={14} /></Button>
                                </div>
                            </div>
                        </main>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Right Section: Record Details & History */}
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                        <aside className="h-full flex flex-col bg-secondary/10 border-l border-border">
                            {!selectedRecord ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                        <History size={24} />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">No Selection</h3>
                                    <p className="text-[10px] font-bold uppercase mt-2 leading-relaxed">Select a record from the list<br />to view transaction health.</p>
                                </div>
                            ) : (
                                <ScrollArea className="flex-1">
                                    <div className="p-4 space-y-6">
                                        {/* Record Header */}
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h2 className="text-3xl font-black tracking-tighter text-primary leading-none">
                                                        {selectedRecord.survey_id}
                                                    </h2>
                                                    <p className="text-sm font-black uppercase tracking-tight truncate leading-tight">
                                                        {selectedRecord.consumer_name || 'Anonymous Consumer'}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => setSelectedSurveyId(selectedRecord.survey_id)}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    View Profile
                                                </Button>
                                            </div>

                                            {/* Financial Pulse */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <Card className="shadow-none bg-background border-border/50 overflow-hidden">
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500"><DollarSign size={12} /></div>
                                                            <span className="text-[9px] font-black text-muted-foreground uppercase">Paid Volume</span>
                                                        </div>
                                                        <div className="text-lg font-black tabular-nums leading-none">
                                                            <CurrencyText amount={recordHistory?.stats?.total_paid || 0} />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card className="shadow-none bg-background border-border/50 overflow-hidden">
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500"><AlertCircle size={12} /></div>
                                                            <span className="text-[9px] font-black text-muted-foreground uppercase">Outstanding</span>
                                                        </div>
                                                        <div className="text-lg font-black tabular-nums leading-none text-rose-500">
                                                            <CurrencyText amount={recordHistory?.stats?.outstanding || 0} />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>

                                        <Separator className="bg-border/40" />

                                        {/* Payment History Timeline */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Payment Timeline</h3>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase bg-muted/30">
                                                    {recordHistory?.bills?.length || 0} Cycles
                                                </Badge>
                                            </div>

                                            <div className="space-y-2 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border/60">
                                                {historyLoading ? (
                                                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                                                ) : recordHistory?.bills && recordHistory.bills.length > 0 ? (
                                                    recordHistory.bills.map((bill, i) => (
                                                        <div key={i} className="relative pl-7 group">
                                                            <div className={cn(
                                                                "absolute left-2 top-2 w-2 h-2 rounded-full border-2 border-background ring-4 ring-background z-10 transition-all group-hover:scale-125",
                                                                bill.payment_status === 'PAID' ? "bg-emerald-500 " : "bg-rose-500"
                                                            )} />
                                                            <div className="p-3 rounded-xl border border-border/50 bg-background hover:bg-muted/30 transition-all cursor-default group-hover:border-primary/20">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-[10px] font-black uppercase tracking-tight">{bill.bill_month}</span>
                                                                    <span className="text-[9px] font-bold text-muted-foreground tabular-nums">#{bill.psid}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1 rounded bg-secondary text-muted-foreground"><Wallet size={10} /></div>
                                                                        <span className="text-[9px] font-bold uppercase opacity-60">{bill.payment_channel || 'DIRECT'}</span>
                                                                    </div>
                                                                    <span className={cn(
                                                                        "text-xs font-black tabular-nums",
                                                                        bill.payment_status === 'PAID' ? "text-emerald-500" : "text-foreground"
                                                                    )}>
                                                                        <CurrencyText amount={bill.amount_paid > 0 ? bill.amount_paid : bill.amount_due} />
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-12 text-center text-muted-foreground">
                                                        <p className="text-[9px] font-bold uppercase italic opacity-40">No transaction records found.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            )}
                        </aside>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div >
    )
}

function SummaryCollapsible({ title, isOpen, onToggle, items, color = "blue", label }) {
    return (
        <div className="rounded-xl border border-border/50 bg-background/50 overflow-hidden transition-all">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-1.5 h-6 rounded-full transition-colors",
                        color === 'blue' ? "bg-blue-500" : "bg-purple-500"
                    )} />
                    <span className="text-[12px] font-black uppercase tracking-widest text-foreground/90">{title}</span>
                </div>
                {isOpen ? <ChevronUp size={14} className="text-muted-foreground/60" /> : <ChevronDown size={14} className="text-muted-foreground/60" />}
            </button>

            <div className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-[500px]" : "max-h-0"
            )}>
                <div className="p-1 space-y-1">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/10 hover:border-border/60 hover:bg-card/80 transition-all group">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-bold group-hover:text-primary transition-colors leading-tight">{item.name}</span>
                                <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto no-scrollbar pb-0.5">
                                    <span className="badge-subtext bg-emerald-500/20 text-emerald-600 border-emerald-500/30">{item.paid} Paid</span>
                                    {item.transactions > item.paid && (
                                        <span className="badge-subtext bg-amber-500/20 text-amber-600 border-amber-500/30">({item.transactions} RC)</span>
                                    )}
                                    <span className="badge-subtext">{item.units} {label === 'Potential' ? 'Units' : 'Bills'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end text-right">
                                <span className={cn(
                                    "text-[13px] font-bold tabular-nums tracking-tighter",
                                    color === 'blue' ? "text-blue-500" : "text-purple-500"
                                )}>
                                    <CurrencyText amount={item.amount} />
                                </span>
                                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mt-1">{label || 'COLLECTED'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
