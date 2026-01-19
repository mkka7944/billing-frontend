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
            <div className="space-y-1 px-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-1 bg-primary rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Interface Optimization Node</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Global<span className="text-primary">.</span>Configuration</h2>
                <p className="text-muted-foreground font-medium text-xs md:text-sm mt-3 max-w-2xl border-l border-primary/20 pl-4 py-1 italic opacity-80">
                    Advanced aesthetic engine. Adjust structural luminosity and visual response protocols for maximum operational comfort.
                </p>
            </div>

            <div className="flex flex-col gap-6 w-full">
                {/* 1. Appearance Section */}
                <Card className="border-border/60 shadow-xl shadow-black/5 overflow-hidden bg-card/40 backdrop-blur-md rounded-3xl transition-all duration-300">
                    <button
                        onClick={() => toggleSection('appearance')}
                        className="w-full text-left focus:outline-none group"
                    >
                        <CardHeader className="py-5 border-b border-border/20 flex flex-row items-center justify-between">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Sun size={20} />
                                    </div>
                                    <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tight">Appearance Profile</CardTitle>
                                </div>
                                <CardDescription className="text-[10px] ml-11 font-bold uppercase tracking-widest opacity-40 mt-1">Light vs Dark mode paradigms</CardDescription>
                            </div>
                            <div className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                                {openSections.appearance ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                            </div>
                        </CardHeader>
                    </button>
                    {openSections.appearance && (
                        <CardContent className="p-4 md:p-8 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTargetTheme('light')}
                                    className={cn(
                                        "group relative flex items-center justify-between px-6 py-5 rounded-3xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all duration-300",
                                        theme === 'light' && "ring-2 ring-primary border-primary bg-card shadow-lg shadow-primary/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2.5 rounded-2xl transition-all duration-500", theme === 'light' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-muted text-muted-foreground group-hover:text-amber-500")}>
                                            <Sun size={22} className={cn(theme === 'light' && "animate-spin-slow")} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-black uppercase tracking-tight">Daylight Nucleus</span>
                                            <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">High Contrast</span>
                                        </div>
                                    </div>
                                    {theme === 'light' && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg"><Check size={12} className="text-primary-foreground" strokeWidth={4} /></div>}
                                </button>

                                <button
                                    onClick={() => setTargetTheme('dark')}
                                    className={cn(
                                        "group relative flex items-center justify-between px-6 py-5 rounded-3xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all duration-300",
                                        theme === 'dark' && "ring-2 ring-primary border-primary bg-card shadow-lg shadow-primary/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2.5 rounded-2xl transition-all duration-500", theme === 'dark' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-muted text-muted-foreground group-hover:text-indigo-400")}>
                                            <Moon size={22} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-black uppercase tracking-tight">Void Darkness</span>
                                            <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Low Straing</span>
                                        </div>
                                    </div>
                                    {theme === 'dark' && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg"><Check size={12} className="text-primary-foreground" strokeWidth={4} /></div>}
                                </button>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* 2. Surface Palette Section */}
                <Card className="border-border/60 shadow-xl shadow-black/5 overflow-hidden bg-card/40 backdrop-blur-md rounded-3xl transition-all duration-300">
                    <button
                        onClick={() => toggleSection('surface')}
                        className="w-full text-left focus:outline-none group"
                    >
                        <CardHeader className="py-5 border-b border-border/20 flex flex-row items-center justify-between">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Layout size={20} />
                                    </div>
                                    <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tight">Surface Architecture</CardTitle>
                                </div>
                                <CardDescription className="text-[10px] ml-11 font-bold uppercase tracking-widest opacity-40 mt-1">Background DNA and structural shades</CardDescription>
                            </div>
                            <div className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                                {openSections.surface ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                            </div>
                        </CardHeader>
                    </button>
                    {openSections.surface && (
                        <CardContent className="p-4 md:p-8 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                                {Object.entries(palettes).map(([id, palette]) => {
                                    const activeSurface = theme === 'dark' ? palette.dark : palette.light
                                    const isSelected = surfacePalette === id

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setSurfacePalette(id)}
                                            className={cn(
                                                "group relative flex flex-col p-5 rounded-3xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all duration-300 text-left min-h-[120px]",
                                                isSelected && "ring-2 ring-primary border-primary bg-card shadow-lg shadow-black/10"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-auto">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[12px] font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{palette.name}</span>
                                                    <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mt-1 shrink-0">CORE.{id}</span>
                                                </div>
                                                {isSelected && <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shrink-0"><Check size={10} className="text-primary-foreground" strokeWidth={4} /></div>}
                                            </div>

                                            <div className="flex items-center gap-1 w-full mt-5 h-8 rounded-xl overflow-hidden border border-border/40 shadow-inner group-hover:scale-[1.02] transition-transform">
                                                <div className="flex-1 h-full" style={{ backgroundColor: `hsl(${activeSurface.background})` }} title="Back" />
                                                <div className="flex-1 h-full" style={{ backgroundColor: `hsl(${activeSurface.secondary})` }} title="Side" />
                                                <div className="flex-1 h-full" style={{ backgroundColor: `hsl(${activeSurface.card})` }} title="Card" />
                                                <div className="flex-[0.5] h-full" style={{ backgroundColor: `hsl(${activeSurface.border})` }} title="Edge" />
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* 3. Button & Accent Color Section */}
                <Card className="border-border/60 shadow-xl shadow-black/5 overflow-hidden bg-card/40 backdrop-blur-md rounded-3xl transition-all duration-300">
                    <button
                        onClick={() => toggleSection('accent')}
                        className="w-full text-left focus:outline-none group"
                    >
                        <CardHeader className="py-5 border-b border-border/20 flex flex-row items-center justify-between">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <MousePointer2 size={20} />
                                    </div>
                                    <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tight">Component Tints</CardTitle>
                                </div>
                                <CardDescription className="text-[10px] ml-11 font-bold uppercase tracking-widest opacity-40 mt-1">Button colors and active indicators</CardDescription>
                            </div>
                            <div className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                                {openSections.accent ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                            </div>
                        </CardHeader>
                    </button>
                    {openSections.accent && (
                        <CardContent className="p-4 md:p-8 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7 gap-3">
                                {Object.entries(accents).map(([id, accent]) => {
                                    const activeAccent = theme === 'dark' ? accent.dark : accent.light
                                    const isSelected = accentColor === id

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setAccentColor(id)}
                                            className={cn(
                                                "group flex items-center gap-3 p-3 rounded-2xl border border-border bg-card/50 hover:bg-card transition-all duration-300 text-left",
                                                isSelected && "ring-2 ring-primary border-primary bg-card shadow-lg"
                                            )}
                                        >
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md border border-white/10 group-hover:scale-110 transition-transform duration-500"
                                                style={{ backgroundColor: `hsl(${activeAccent.primary})` }}
                                            >
                                                {isSelected && <Check size={14} style={{ color: `hsl(${activeAccent.foreground})` }} strokeWidth={4} />}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-black uppercase tracking-tighter truncate group-hover:text-primary transition-colors">{accent.name.replace('Quantum ', '').replace('Cyan ', '')}</span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Footer Section */}
                <div className="px-4 flex flex-col md:flex-row justify-between items-center gap-6 py-10 opacity-40 hover:opacity-100 transition-opacity duration-700">
                    <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Telemetry Link Est.</span>
                            <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1">Sargodha HQ Protocol</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] block">Unified Aesthetic Core v4.2</span>
                            <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1 text-primary">Secure Multi-Cluster Env</span>
                        </div>
                        <div className="h-8 w-[1px] bg-primary/20" />
                    </div>
                </div>
            </div>
        </div>
    )
}
