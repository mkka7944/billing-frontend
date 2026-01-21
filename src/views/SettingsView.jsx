import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Check, Moon, Sun, Palette, Layout, MousePointer2, ChevronDown, ChevronUp, Lock, AlertCircle, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        appearance: true,
        surface: true,
        accent: true,
        typography: true,
        controls: true,
        permissions: true
    })

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
            <div className="space-y-0.5 px-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-1 bg-primary rounded-full transition-all duration-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">System.Optics</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">Global<span className="text-primary">.</span>Config</h2>
            </div>

            {/* Deterministic Multi-Column Layout for Absolute Vertical Independence */}
            <div className="flex flex-col md:flex-row gap-6 w-full pb-32 items-start">

                {/* Column 1: Core Aesthetics */}
                <div className="settings-column-container md:w-1/3">
                    {/* 1. Appearance Section */}
                    <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                        <button
                            onClick={(e) => toggleSection('appearance', e)}
                            className="w-full text-left focus:outline-none group px-3 py-2 border-b border-border/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Sun size={14} className="text-primary" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Appearance Profile</span>
                            </div>
                            {openSections.appearance ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                        </button>
                        {openSections.appearance && (
                            <CardContent className="p-2 animate-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setTargetTheme('light')}
                                        className={cn(
                                            "group relative flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card/50 hover:bg-card transition-all duration-200",
                                            theme === 'light' && "ring-1 ring-primary border-primary bg-card"
                                        )}
                                    >
                                        <Sun size={14} className={cn(theme === 'light' ? "text-amber-500" : "text-muted-foreground")} />
                                        <span className="text-[11px] font-black uppercase tracking-tight">Daylight</span>
                                    </button>

                                    <button
                                        onClick={() => setTargetTheme('dark')}
                                        className={cn(
                                            "group relative flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card/50 hover:bg-card transition-all duration-200",
                                            theme === 'dark' && "ring-1 ring-primary border-primary bg-card"
                                        )}
                                    >
                                        <Moon size={14} className={cn(theme === 'dark' ? "text-indigo-400" : "text-muted-foreground")} />
                                        <span className="text-[11px] font-black uppercase tracking-tight">Void</span>
                                    </button>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* 2. Surface Palette Section */}
                    <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                        <button
                            onClick={(e) => toggleSection('surface', e)}
                            className="w-full text-left focus:outline-none group px-3 py-2 border-b border-border/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Layout size={14} className="text-primary" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Surface Architecture</span>
                            </div>
                            {openSections.surface ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                        </button>
                        {openSections.surface && (
                            <CardContent className="p-2 animate-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(palettes).map(([id, palette]) => {
                                        const activeSurface = theme === 'dark' ? palette.dark : palette.light
                                        const isSelected = surfacePalette === id

                                        return (
                                            <button
                                                key={id}
                                                onClick={() => setSurfacePalette(id)}
                                                className={cn(
                                                    "group relative flex flex-col p-2 rounded-lg border border-border bg-card/50 hover:bg-card transition-all duration-200 text-left",
                                                    isSelected && "ring-1 ring-primary border-primary bg-card"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[10px] font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{palette.name}</span>
                                                    {isSelected && <Check size={8} className="text-primary" strokeWidth={4} />}
                                                </div>

                                                <div className="flex items-center gap-0.5 w-full h-2.5 rounded overflow-hidden border border-border/40">
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
                </div>

                {/* Column 2: Typography & Sizing */}
                <div className="settings-column-container md:w-1/3">
                    {/* 4. Font Architecture Section */}
                    <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                        <button
                            onClick={(e) => toggleSection('typography', e)}
                            className="w-full text-left focus:outline-none group px-3 py-2 border-b border-border/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Type size={14} className="text-primary" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Typography Architecture</span>
                            </div>
                            {openSections.typography ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                        </button>
                        {openSections.typography && (
                            <CardContent className="p-2 animate-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-1 gap-1.5 mb-2">
                                    {Object.entries(fonts).map(([id, font]) => {
                                        const isDraft = tempFont === id
                                        const isSaved = fontFamily === id

                                        return (
                                            <button
                                                key={id}
                                                onClick={() => {
                                                    setTempFont(id)
                                                    applyFontPreview(id)
                                                }}
                                                className={cn(
                                                    "group relative flex flex-col p-2.5 rounded-lg border border-border bg-card/50 hover:bg-card transition-all duration-200 text-left",
                                                    isDraft && "ring-1 ring-primary border-primary bg-card/80"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{font.name}</span>
                                                        {isSaved && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black uppercase">Active</span>}
                                                    </div>
                                                    {isDraft && <Check size={8} className="text-primary" strokeWidth={4} />}
                                                </div>
                                                <p className="text-[11px] opacity-70 truncate font-semibold" style={{ fontFamily: font.sans }}>
                                                    Testing font: The quick brown fox jumps...
                                                </p>
                                            </button>
                                        )
                                    })}
                                </div>

                                {tempFont !== fontFamily && (
                                    <Button
                                        onClick={() => setFontFamily(tempFont)}
                                        className="w-full h-8 text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300 shadow-lg shadow-primary/20"
                                    >
                                        Apply Configuration
                                    </Button>
                                )}
                            </CardContent>
                        )}
                    </Card>

                    {/* 5. Display Mastery - Granular Size Controls */}
                    <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                        <button
                            onClick={(e) => toggleSection('controls', e)}
                            className="w-full text-left focus:outline-none group px-3 py-2 border-b border-border/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Layout size={14} className="text-primary" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Granular Sizing</span>
                            </div>
                            {openSections.controls ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                        </button>
                        {openSections.controls && (
                            <CardContent className="p-3 animate-in slide-in-from-top-4 duration-500 space-y-4">
                                {/* Heading Size */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Main Headings</span>
                                        <span className="text-[10px] font-mono text-primary">{(headingSize * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setHeadingSize(Math.max(0.5, headingSize - 0.05))} className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs">-</button>
                                        <div className="flex-1 h-1 bg-muted rounded-full relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${((headingSize - 0.5) / 1) * 100}%` }} />
                                        </div>
                                        <button onClick={() => setHeadingSize(Math.min(1.5, headingSize + 0.05))} className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs">+</button>
                                    </div>
                                </div>

                                {/* Base Text Size */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base Elements</span>
                                        <span className="text-[10px] font-mono text-primary">{(baseSize * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setBaseSize(Math.max(0.5, baseSize - 0.05))} className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs">-</button>
                                        <div className="flex-1 h-1 bg-muted rounded-full relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${((baseSize - 0.5) / 1) * 100}%` }} />
                                        </div>
                                        <button onClick={() => setBaseSize(Math.min(1.5, baseSize + 0.05))} className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs">+</button>
                                    </div>
                                </div>

                                {/* Subtext Size */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Badge Subtexts</span>
                                        <span className="text-[10px] font-mono text-primary">{(subtextSize * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setSubtextSize(Math.max(0.5, subtextSize - 0.05))} className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs">-</button>
                                        <div className="flex-1 h-1 bg-muted rounded-full relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${((subtextSize - 0.5) / 1) * 100}%` }} />
                                        </div>
                                        <button onClick={() => setSubtextSize(Math.min(1.5, subtextSize + 0.05))} className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs">+</button>
                                    </div>
                                </div>

                                {/* Contrast Profile */}
                                <div className="space-y-2 pt-2 border-t border-border/10">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Color Profile</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setTextContrast('charcoal')}
                                            className={cn(
                                                "flex items-center gap-2 p-1.5 rounded-lg border border-border transition-all",
                                                textContrast === 'charcoal' ? "bg-primary/15 border-primary text-primary" : "bg-card/50 text-muted-foreground"
                                            )}
                                        >
                                            <div className="w-3 h-3 bg-[#232529] rounded" />
                                            <span className="text-[9px] font-black uppercase">Charcoal</span>
                                        </button>
                                        <button
                                            onClick={() => setTextContrast('black')}
                                            className={cn(
                                                "flex items-center gap-2 p-1.5 rounded-lg border border-border transition-all",
                                                textContrast === 'black' ? "bg-primary/15 border-primary text-primary" : "bg-card/50 text-muted-foreground"
                                            )}
                                        >
                                            <div className="w-3 h-3 bg-black rounded" />
                                            <span className="text-[9px] font-black uppercase">Black</span>
                                        </button>
                                        <button
                                            onClick={() => setTextContrast('zinc')}
                                            className={cn(
                                                "flex items-center gap-2 p-1.5 rounded-lg border border-border transition-all",
                                                textContrast === 'zinc' ? "bg-primary/15 border-primary text-primary" : "bg-card/50 text-muted-foreground"
                                            )}
                                        >
                                            <div className="w-3 h-3 bg-[#404040] rounded" />
                                            <span className="text-[9px] font-black uppercase">Zinc</span>
                                        </button>
                                        <button
                                            onClick={() => setTextContrast('slate')}
                                            className={cn(
                                                "flex items-center gap-2 p-1.5 rounded-lg border border-border transition-all",
                                                textContrast === 'slate' ? "bg-primary/15 border-primary text-primary" : "bg-card/50 text-muted-foreground"
                                            )}
                                        >
                                            <div className="w-3 h-3 bg-[#334155] rounded" />
                                            <span className="text-[9px] font-black uppercase">Slate</span>
                                        </button>
                                        <button
                                            onClick={() => setTextContrast('midnight')}
                                            className={cn(
                                                "flex items-center gap-2 p-1.5 rounded-lg border border-border transition-all border-dashed",
                                                textContrast === 'midnight' ? "bg-primary/15 border-primary text-primary" : "bg-card/50 text-muted-foreground"
                                            )}
                                        >
                                            <div className="w-3 h-3 bg-[#0f172a] rounded" />
                                            <span className="text-[9px] font-black uppercase">Midnight</span>
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>

                {/* Column 3: Tints & Controls */}
                <div className="settings-column-container md:w-1/3">
                    {/* 3. Button & Accent Color Section */}
                    <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                        <button
                            onClick={(e) => toggleSection('accent', e)}
                            className="w-full text-left focus:outline-none group px-3 py-2 border-b border-border/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <MousePointer2 size={14} className="text-primary" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Component Tints</span>
                            </div>
                            {openSections.accent ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                        </button>
                        {openSections.accent && (
                            <CardContent className="p-2 animate-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-4 gap-2">
                                    {Object.entries(accents).map(([id, accent]) => {
                                        const activeAccent = theme === 'dark' ? accent.dark : accent.light
                                        const isSelected = accentColor === id

                                        return (
                                            <button
                                                key={id}
                                                onClick={() => setAccentColor(id)}
                                                className={cn(
                                                    "group flex flex-col items-center gap-1 p-1.5 rounded-lg border border-border bg-card/50 hover:bg-card transition-all duration-200",
                                                    isSelected && "ring-1 ring-primary border-primary bg-card"
                                                )}
                                                title={accent.name}
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 shadow-sm border border-white/5"
                                                    style={{ backgroundColor: `hsl(${activeAccent.primary})` }}
                                                >
                                                    {isSelected && <Check size={8} style={{ color: `hsl(${activeAccent.foreground})` }} strokeWidth={4} />}
                                                </div>
                                                <span className="text-[8px] font-bold uppercase tracking-tighter truncate w-full text-center">{accent.name.split(' ')[0]}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* 6. User Access Control (Admin Only) */}
                    {isAdmin && (
                        <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300 w-full">
                            <button
                                onClick={(e) => toggleSection('permissions', e)}
                                className="w-full text-left focus:outline-none group px-3 py-2 border-b border-border/10 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <Lock size={14} className="text-primary" />
                                    <span className="text-[11px] font-black uppercase tracking-tight">Access Control Protocol</span>
                                </div>
                                {openSections.permissions ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                            </button>
                            {openSections.permissions && (
                                <CardContent className="p-2 animate-in slide-in-from-top-4 duration-500">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <div className="space-y-0.5 max-w-[60%]">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary truncate">Composite Permissions</h4>
                                                <p className="text-[9px] text-muted-foreground uppercase font-bold truncate">Baseline accessibility</p>
                                            </div>
                                            <Button size="sm" className="h-6 px-2 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shrink-0">
                                                Sync
                                            </Button>
                                        </div>

                                        <div className="rounded-lg border border-border/40 bg-card/20 overflow-hidden shadow-inner overflow-x-auto no-scrollbar">
                                            <table className="w-full text-left border-collapse min-w-[300px] md:min-w-full">
                                                <thead>
                                                    <tr className="bg-muted/30 border-b border-border/40">
                                                        <th className="p-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">ID</th>
                                                        <th className="p-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center hidden sm:table-cell">Status</th>
                                                        <th className="p-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Access</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/20">
                                                    {[
                                                        { id: 'map', name: 'Map' },
                                                        { id: 'surveys', name: 'Surveys' },
                                                        { id: 'financials', name: 'Finance' },
                                                        { id: 'performance', name: 'Staff' },
                                                        { id: 'tickets', name: 'Tickets' },
                                                        { id: 'stats', name: 'Stats' },
                                                        { id: 'style_lab', name: 'Style' }
                                                    ].map((comp) => (
                                                        <tr key={comp.id} className="hover:bg-white/5 transition-colors group">
                                                            <td className="p-2">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-1 h-2.5 bg-primary/40 rounded-full group-hover:bg-primary transition-colors shrink-0" />
                                                                    <span className="text-[10px] font-black uppercase tracking-tight truncate">{comp.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-2 text-center hidden sm:table-cell">
                                                                <span className={cn(
                                                                    "text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-widest",
                                                                    permissions?.[comp.id] !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                                                )}>
                                                                    {permissions?.[comp.id] !== false ? "OK" : "NO"}
                                                                </span>
                                                            </td>
                                                            <td className="p-2 text-right">
                                                                <div className="inline-flex items-center p-0.5 rounded-lg border border-border bg-background/40">
                                                                    <button
                                                                        className={cn(
                                                                            "p-1 rounded-md transition-all",
                                                                            permissions?.[comp.id] !== false ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground hover:bg-emerald-500/10"
                                                                        )}
                                                                    >
                                                                        <Check size={8} strokeWidth={4} />
                                                                    </button>
                                                                    <button
                                                                        className={cn(
                                                                            "p-1 rounded-md transition-all",
                                                                            permissions?.[comp.id] === false ? "bg-rose-500 text-white shadow-lg" : "text-muted-foreground hover:bg-rose-500/10"
                                                                        )}
                                                                    >
                                                                        <Lock size={8} strokeWidth={4} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )}
                </div>
            </div>

            {/* Footer Section - FIXED Outside Main Flow */}
            <div className="fixed bottom-4 right-8 opacity-30 pointer-events-none z-10 pointer-events-none text-right">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Billing.Map.Node v4.5</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Sargodha HQ</span>
                </div>
            </div>
        </div>
    )
}
