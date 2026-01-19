import { useTheme } from '../context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Check, Moon, Sun, Palette, Layout, MousePointer2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsView() {
    const {
        theme, setTargetTheme,
        surfacePalette, setSurfacePalette, palettes,
        accentColor, setAccentColor, accents
    } = useTheme()

    return (
        <div className="flex-1 p-6 md:p-8 bg-background overflow-y-auto space-y-8 no-scrollbar selection:bg-primary/20">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-1 bg-primary rounded-full transition-all" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">System Customization</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Settings<span className="text-primary">.</span>Dashboard</h2>
                <p className="text-muted-foreground font-medium text-sm mt-2 max-w-xl">Deep tailoring of the administrative environment. Configure surface architecture and structural tints.</p>
            </div>

            <div className="grid gap-6 max-w-6xl">
                {/* Visual Identity Card */}
                <Card className="border-border/60 shadow-xl shadow-black/5 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4 border-b border-border/40">
                        <div className="flex items-center gap-2 px-1">
                            <Palette size={18} className="text-primary" />
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Interface Anatomy</CardTitle>
                        </div>
                        <CardDescription className="text-xs font-bold uppercase tracking-wider opacity-60">Architect the luminosity and color profile of the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-12 pt-8">

                        {/* 1. Theme Mode Toggle */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                                <Sun size={10} /> Luminosity Profile
                            </label>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                <button
                                    onClick={() => setTargetTheme('light')}
                                    className={cn(
                                        "group flex items-center justify-between px-5 py-4 rounded-2xl border border-border bg-card/40 hover:bg-card hover:border-primary/30 transition-all",
                                        theme === 'light' && "ring-1 ring-primary border-primary bg-card"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl transition-colors", theme === 'light' ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground")}>
                                            <Sun size={20} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-black uppercase tracking-tight">Standard Light</span>
                                            <span className="text-[9px] font-bold opacity-40 uppercase">High Visibility</span>
                                        </div>
                                    </div>
                                    {theme === 'light' && <Check size={16} className="text-primary" strokeWidth={3} />}
                                </button>

                                <button
                                    onClick={() => setTargetTheme('dark')}
                                    className={cn(
                                        "group flex items-center justify-between px-5 py-4 rounded-2xl border border-border bg-card/40 hover:bg-card hover:border-primary/30 transition-all",
                                        theme === 'dark' && "ring-1 ring-primary border-primary bg-card"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl transition-colors", theme === 'dark' ? "bg-indigo-500/10 text-indigo-500" : "bg-muted text-muted-foreground")}>
                                            <Moon size={20} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-black uppercase tracking-tight">Dark Mode</span>
                                            <span className="text-[9px] font-bold opacity-40 uppercase">Low Strain</span>
                                        </div>
                                    </div>
                                    {theme === 'dark' && <Check size={16} className="text-primary" strokeWidth={3} />}
                                </button>
                            </div>
                        </div>

                        {/* 2. Surface Architecture (Backgrounds) */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                                <Layout size={10} /> Surface Palette (App Structure)
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {Object.entries(palettes).map(([id, palette]) => {
                                    const activeSurface = theme === 'dark' ? palette.dark : palette.light
                                    const isSelected = surfacePalette === id

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setSurfacePalette(id)}
                                            className={cn(
                                                "group relative flex flex-col p-4 rounded-2xl border border-border bg-card/40 hover:bg-card hover:border-primary/40 transition-all text-left min-h-[100px]",
                                                isSelected && "ring-1 ring-primary border-primary bg-card shadow-lg shadow-black/5"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-auto">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-black uppercase tracking-tight truncate">{palette.name}</span>
                                                    <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest mt-0.5">Surface.{id}</span>
                                                </div>
                                                {isSelected && <Check size={14} className="text-primary shrink-0" strokeWidth={3} />}
                                            </div>

                                            <div className="flex items-center gap-0.5 w-full mt-4 h-6 rounded-lg overflow-hidden border border-border/40 shadow-inner">
                                                <div className="flex-1 h-full" style={{ backgroundColor: `hsl(${activeSurface.background})` }} />
                                                <div className="flex-1 h-full" style={{ backgroundColor: `hsl(${activeSurface.secondary})` }} />
                                                <div className="flex-1 h-full" style={{ backgroundColor: `hsl(${activeSurface.card})` }} />
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* 3. Component Tint (Tints / Accents) */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                                <MousePointer2 size={10} /> Button & Accent Color
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                                {Object.entries(accents).map(([id, accent]) => {
                                    const activeAccent = theme === 'dark' ? accent.dark : accent.light
                                    const isSelected = accentColor === id

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setAccentColor(id)}
                                            className={cn(
                                                "group flex items-center gap-3 p-2 rounded-xl border border-border bg-card/40 hover:bg-card transition-all text-left",
                                                isSelected && "ring-1 ring-primary border-primary bg-card"
                                            )}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/10 transition-transform group-hover:scale-110"
                                                style={{ backgroundColor: `hsl(${activeAccent.primary})` }}
                                            >
                                                {isSelected && <Check size={12} style={{ color: `hsl(${activeAccent.foreground})` }} strokeWidth={4} />}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-black uppercase tracking-tighter truncate">{accent.name.split(' ')[1] || accent.name}</span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* Footer Section */}
                <div className="px-2 flex flex-col sm:flex-row justify-between items-center gap-4 py-8 border-t border-border/30 opacity-40">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Telemetry Link Established</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Build Protocol v3.0 // Unified Aesthetics</span>
                </div>
            </div>
        </div>
    )
}
