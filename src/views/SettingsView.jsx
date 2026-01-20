import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Check, Moon, Sun, Palette, Layout, MousePointer2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsView() {
    const {
        theme, setTargetTheme,
        surfacePalette, setSurfacePalette, palettes,
        accentColor, setAccentColor, accents
    } = useTheme()

    // State for collapsible sections
    const [openSections, setOpenSections] = useState({
        appearance: true,
        surface: true,
        accent: true
    })

    const toggleSection = (section) => {
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

            <div className="flex flex-col gap-3 w-full">
                {/* 1. Appearance Section */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                    <button
                        onClick={() => toggleSection('appearance')}
                        className="w-full text-left focus:outline-none group px-3 py-2 border-b border-border/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Sun size={14} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-tight">Appearance Profile</span>
                        </div>
                        {openSections.appearance ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </button>
                    {openSections.appearance && (
                        <CardContent className="p-2 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
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
                        onClick={() => toggleSection('surface')}
                        className="w-full text-left focus:outline-none group px-3 py-2 border-b border-border/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Layout size={14} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-tight">Surface Architecture</span>
                        </div>
                        {openSections.surface ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </button>
                    {openSections.surface && (
                        <CardContent className="p-2 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{palette.name}</span>
                                                {isSelected && <Check size={8} className="text-primary" strokeWidth={4} />}
                                            </div>

                                            <div className="flex items-center gap-0.5 w-full h-3 rounded overflow-hidden border border-border/40">
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

                {/* 3. Button & Accent Color Section */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/40 backdrop-blur-md rounded-xl transition-all duration-300">
                    <button
                        onClick={() => toggleSection('accent')}
                        className="w-full text-left focus:outline-none group px-3 py-2 border-b border-border/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <MousePointer2 size={14} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-tight">Component Tints</span>
                        </div>
                        {openSections.accent ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </button>
                    {openSections.accent && (
                        <CardContent className="p-2 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-1.5">
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

                {/* Footer Section */}
                <div className="px-2 flex justify-between items-center py-2 opacity-30">
                    <span className="text-[7px] font-black uppercase tracking-[0.2em]">Billing.Map.Node v4.5</span>
                    <span className="text-[7px] font-black uppercase tracking-[0.2em]">Sargodha HQ</span>
                </div>
            </div>
        </div>
    )
}
