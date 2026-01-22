import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Check, Moon, Sun, Palette, Layout, MousePointer2, ChevronDown, ChevronUp, Lock, Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge, CurrencyText, CopyButton, ErrorNode } from '../components/common/UIComponents'
import { Badge } from '@/components/ui/badge'

export default function SettingsView() {
    const {
        theme, setTargetTheme,
        surfacePalette, setSurfacePalette, palettes,
        accentColor, setAccentColor, accents,
        fontFamily, setFontFamily, fonts, applyFontPreview,
        headingSize, setHeadingSize,
        subtextSize, setSubtextSize,
        baseSize, setBaseSize,
        textContrast, setTextContrast
    } = useTheme()

    const { isAdmin, permissions } = useAuth()
    const [tempFont, setTempFont] = useState(fontFamily)

    // State for collapsible sections
    const [openSections, setOpenSections] = useState({
        appearance: false,
        surface: false,
        accent: false,
        typography: false,
        controls: false,
        permissions: false,
        lab: false
    })

    const toggleAll = (state) => {
        const newState = Object.keys(openSections).reduce((acc, key) => {
            acc[key] = state;
            return acc;
        }, {});
        setOpenSections(newState);
    }

    const toggleSection = (section, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    return (
        <div className="flex-1 p-4 md:p-8 bg-background overflow-y-auto space-y-8 no-scrollbar selection:bg-primary/20 w-full animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 w-1 bg-primary rounded-full transition-all duration-500" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">System.Optics</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">Global<span className="text-primary">.</span>Config</h2>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAll(true)}
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest bg-card/40 border-border/40 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAll(false)}
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest bg-card/40 border-border/40 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        Collapse All
                    </Button>
                </div>
            </div>

            {/* Main Configuration Stack - Single Column Flex Layout */}
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-32">

                {/* 1. Appearance Profile */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                    <button
                        onClick={(e) => toggleSection('appearance', e)}
                        className="w-full text-left focus:outline-none group px-4 py-3 border-b border-border/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Sun size={14} className="text-primary" />
                            <span className="text-[11px] font-black uppercase tracking-tight">Appearance Profile</span>
                        </div>
                        {openSections.appearance ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </button>
                    {openSections.appearance && (
                        <CardContent className="p-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setTargetTheme('light')}
                                    className={cn(
                                        "group relative flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-card transition-all duration-200",
                                        theme === 'light' && "ring-1 ring-primary border-primary bg-card"
                                    )}
                                >
                                    <Sun size={16} className={cn(theme === 'light' ? "text-amber-500" : "text-muted-foreground")} />
                                    <span className="text-[11px] font-black uppercase tracking-tight">Daylight</span>
                                </button>

                                <button
                                    onClick={() => setTargetTheme('dark')}
                                    className={cn(
                                        "group relative flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-card transition-all duration-200",
                                        theme === 'dark' && "ring-1 ring-primary border-primary bg-card"
                                    )}
                                >
                                    <Moon size={16} className={cn(theme === 'dark' ? "text-indigo-400" : "text-muted-foreground")} />
                                    <span className="text-[11px] font-black uppercase tracking-tight">Void</span>
                                </button>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* 2. Surface Architecture */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                    <button
                        onClick={(e) => toggleSection('surface', e)}
                        className="w-full text-left focus:outline-none group px-4 py-3 border-b border-border/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Layout size={14} className="text-primary" />
                            <span className="text-[11px] font-black uppercase tracking-tight">Surface Architecture</span>
                        </div>
                        {openSections.surface ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </button>
                    {openSections.surface && (
                        <CardContent className="p-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Object.entries(palettes).map(([id, palette]) => {
                                    const activeSurface = theme === 'dark' ? palette.dark : palette.light
                                    const isSelected = surfacePalette === id

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setSurfacePalette(id)}
                                            className={cn(
                                                "group relative flex flex-col p-3 rounded-xl border border-border bg-card/50 hover:bg-card transition-all duration-200 text-left",
                                                isSelected && "ring-1 ring-primary border-primary bg-card"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{palette.name}</span>
                                                {isSelected && <Check size={10} className="text-primary" strokeWidth={4} />}
                                            </div>

                                            <div className="flex items-center gap-1 w-full h-3 rounded-md overflow-hidden border border-border/40">
                                                <div className="flex-1 h-full" style={{ backgroundColor: `hsl(${activeSurface.background})` }} />
                                                <div className="flex-1 h-full" style={{ backgroundColor: `hsl(${activeSurface.secondary})` }} />
                                                <div className="flex-1 h-full" style={{ backgroundColor: `hsl(${activeSurface.card})` }} />
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* 3. Component Tints */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                    <button
                        onClick={(e) => toggleSection('accent', e)}
                        className="w-full text-left focus:outline-none group px-4 py-3 border-b border-border/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <MousePointer2 size={14} className="text-primary" />
                            <span className="text-[11px] font-black uppercase tracking-tight">Component Tints</span>
                        </div>
                        {openSections.accent ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </button>
                    {openSections.accent && (
                        <CardContent className="p-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                                {Object.entries(accents).map(([id, accent]) => {
                                    const activeAccent = theme === 'dark' ? accent.dark : accent.light
                                    const isSelected = accentColor === id

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setAccentColor(id)}
                                            className={cn(
                                                "group flex flex-col items-center gap-1.5 p-2 rounded-xl border border-border bg-card/50 hover:bg-card transition-all duration-200",
                                                isSelected && "ring-1 ring-primary border-primary bg-card"
                                            )}
                                            title={accent.name}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/5"
                                                style={{ backgroundColor: `hsl(${activeAccent.primary})` }}
                                            >
                                                {isSelected && <Check size={10} style={{ color: `hsl(${activeAccent.foreground})` }} strokeWidth={4} />}
                                            </div>
                                            <span className="text-[8px] font-bold uppercase tracking-tighter truncate w-full text-center">{accent.name.split(' ')[0]}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* 4. Typography Architecture */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                    <button
                        onClick={(e) => toggleSection('typography', e)}
                        className="w-full text-left focus:outline-none group px-4 py-3 border-b border-border/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Type size={14} className="text-primary" />
                            <span className="text-[11px] font-black uppercase tracking-tight">Typography Architecture</span>
                        </div>
                        {openSections.typography ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </button>
                    {openSections.typography && (
                        <CardContent className="p-4 animate-in slide-in-from-top-4 duration-500 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(fonts).map(([id, font]) => (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            setTempFont(id)
                                            applyFontPreview(id)
                                        }}
                                        className={cn(
                                            "group relative flex flex-col p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-all duration-200 text-left",
                                            tempFont === id && "ring-1 ring-primary border-primary bg-card/80"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{font.name}</span>
                                            {fontFamily === id && <Badge variant="secondary" className="text-[8px] h-4 px-1.5 font-black uppercase">Active</Badge>}
                                        </div>
                                        <p className="text-[12px] opacity-70 truncate font-semibold" style={{ fontFamily: font.sans }}>
                                            The quick brown fox jumps over the lazy dog.
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {tempFont !== fontFamily && (
                                <Button
                                    onClick={() => setFontFamily(tempFont)}
                                    className="w-full h-10 text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300"
                                >
                                    Apply Typography Profile
                                </Button>
                            )}
                        </CardContent>
                    )}
                </Card>

                {/* 5. Granular Sizing */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                    <button
                        onClick={(e) => toggleSection('controls', e)}
                        className="w-full text-left focus:outline-none group px-4 py-3 border-b border-border/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Layout size={14} className="text-primary" />
                            <span className="text-[11px] font-black uppercase tracking-tight">Granular Sizing</span>
                        </div>
                        {openSections.controls ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </button>
                    {openSections.controls && (
                        <CardContent className="p-4 animate-in slide-in-from-top-4 duration-500 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Heading Size */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Headings</span>
                                        <span className="text-[10px] font-mono text-primary">{(headingSize * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setHeadingSize(Math.max(0.5, headingSize - 0.05))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs hover:bg-muted/80">-</button>
                                        <div className="flex-1 h-1.5 bg-muted rounded-full relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${((headingSize - 0.5) / 1) * 100}%` }} />
                                        </div>
                                        <button onClick={() => setHeadingSize(Math.min(1.5, headingSize + 0.05))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs hover:bg-muted/80">+</button>
                                    </div>
                                </div>

                                {/* Base Text Size */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base Elements</span>
                                        <span className="text-[10px] font-mono text-primary">{(baseSize * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setBaseSize(Math.max(0.5, baseSize - 0.05))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs hover:bg-muted/80">-</button>
                                        <div className="flex-1 h-1.5 bg-muted rounded-full relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${((baseSize - 0.5) / 1) * 100}%` }} />
                                        </div>
                                        <button onClick={() => setBaseSize(Math.min(1.5, baseSize + 0.05))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs hover:bg-muted/80">+</button>
                                    </div>
                                </div>

                                {/* Subtext Size */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Badge Subtexts</span>
                                        <span className="text-[10px] font-mono text-primary">{(subtextSize * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setSubtextSize(Math.max(0.5, subtextSize - 0.05))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs hover:bg-muted/80">-</button>
                                        <div className="flex-1 h-1.5 bg-muted rounded-full relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${((subtextSize - 0.5) / 1) * 100}%` }} />
                                        </div>
                                        <button onClick={() => setSubtextSize(Math.min(1.5, subtextSize + 0.05))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs hover:bg-muted/80">+</button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* 6. User Access Control (Admin Only) */}
                {isAdmin && (
                    <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300 w-full">
                        <button
                            onClick={(e) => toggleSection('permissions', e)}
                            className="w-full text-left focus:outline-none group px-4 py-3 border-b border-border/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Lock size={14} className="text-primary" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Access Control Protocol</span>
                            </div>
                            {openSections.permissions ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                        </button>
                        {openSections.permissions && (
                            <CardContent className="p-2 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-1">
                                    {[
                                        { id: 'map', name: 'Map Interface' },
                                        { id: 'surveys', name: 'Survey Registry' },
                                        { id: 'financials', name: 'Finance Hub' },
                                        { id: 'performance', name: 'Staff Metrics' },
                                        { id: 'tickets', name: 'Complaint Desk' },
                                        { id: 'stats', name: 'System Statistics' }
                                    ].map((comp) => (
                                        <div key={comp.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                                    permissions?.[comp.id] !== false ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                                )} />
                                                <span className="text-[10px] font-black uppercase tracking-tight">{comp.name}</span>
                                            </div>
                                            <span className={cn(
                                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                                                permissions?.[comp.id] !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                            )}>
                                                {permissions?.[comp.id] !== false ? "Authorized" : "Locked"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* 7. UI Lab - Live Component Registry */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300 w-full">
                    <button
                        onClick={(e) => toggleSection('lab', e)}
                        className="w-full text-left focus:outline-none group px-4 py-4 border-b border-border/10 flex items-center justify-between bg-primary/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1 px-2 rounded-md bg-primary/20 text-primary">
                                <Palette size={16} strokeWidth={3} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[12px] font-black uppercase tracking-tight">UI Lab: Component Registry</span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Live aesthetics & visual feedback</span>
                            </div>
                        </div>
                        {openSections.lab ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                    </button>
                    {openSections.lab && (
                        <CardContent className="p-6 md:p-8 animate-in slide-in-from-top-4 duration-500 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

                                {/* Panel: Status Indicators */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1.5">Status Architecture</h4>
                                    <div className="flex flex-wrap gap-2.5 pt-1">
                                        <StatusBadge status="Active System" variant="active" />
                                        <StatusBadge status="Sync Pending" variant="pending" />
                                        <StatusBadge status="Node Archived" variant="archived" />
                                        <StatusBadge status="Protocol Success" variant="success" />
                                        <StatusBadge status="Access Warning" variant="warning" />
                                        <StatusBadge status="Critical Error" variant="danger" />
                                        <StatusBadge status="Domestic" variant="domestic" />
                                        <StatusBadge status="Commercial" variant="commercial" />
                                    </div>
                                </div>

                                {/* Panel: Financial Suite */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1.5">Financial Module</h4>
                                    <div className="space-y-3 pt-1">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-secondary/20 shadow-inner">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Gross Revenue</span>
                                            <CurrencyText amount={124500} />
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 shadow-inner">
                                            <span className="text-[10px] font-black uppercase text-rose-500/70 tracking-tighter">Liability GAP</span>
                                            <div className="text-rose-500 font-bold">
                                                <CurrencyText amount={15200} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Panel: Interaction Lab */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1.5">Interactions</h4>
                                    <div className="flex flex-col gap-3 pt-1">
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                                Primary Action
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-card/30">
                                                Ghost State
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-border/40">
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Node Identifier:</span>
                                            <div className="flex items-center gap-2">
                                                <code className="text-[10px] font-mono bg-muted/50 px-2 py-0.5 rounded text-primary">ID_59284_X</code>
                                                <CopyButton text="ID_59284_X" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel: Messaging & Typography Stress Test */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4 border-t border-border/10">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1.5">System Messaging</h4>
                                    <div className="space-y-3 pt-1">
                                        <ErrorNode message="Critical Database Initialization Failure: Segment 0xF2" />
                                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                                            <Palette size={14} className="text-primary mt-0.5 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black uppercase tracking-tight leading-none text-primary">Aesthetics Applied</p>
                                                <p className="text-[10px] font-semibold opacity-70 leading-tight">Current profile synchronized across all active nodes.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1.5">Typography Architecture Test</h4>
                                    <div className="p-5 rounded-2xl border border-border/40 bg-card/20 space-y-4 shadow-inner">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
                                            The <span className="text-primary">Master Heading</span> Architecture
                                        </h3>
                                        <p className="text-sm opacity-80 leading-relaxed font-semibold">
                                            This stress test verifies point-size legibility across your chosen font family. The weight should feel balanced across both light and dark backgrounds.
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 pt-2">
                                            <span className="badge-subtext">Address line subtext</span>
                                            <span className="badge-subtext text-primary font-black uppercase tracking-widest">Protocol.Active</span>
                                            <span className="badge-subtext opacity-50 italic">Secondary instruction</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* Background Branding - Static */}
            <div className="fixed bottom-6 right-10 opacity-20 pointer-events-none z-0 hidden lg:block">
                <div className="flex flex-col items-end gap-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Billing.Map.Engine v4.5</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sargodha HQ</span>
                </div>
            </div>
        </div>
    )
}
