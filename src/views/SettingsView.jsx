
import { useTheme } from '../context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Check, Moon, Sun, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsView() {
    const { theme, setTargetTheme, colorTheme, setColorTheme, colors } = useTheme()

    return (
        <div className="flex-1 p-6 md:p-8 bg-background overflow-y-auto space-y-8 no-scrollbar">
            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight uppercase">Settings</h2>
                <p className="text-muted-foreground font-medium">Manage your interface preferences and system configurations.</p>
            </div>

            <div className="grid gap-6 max-w-4xl">
                {/* Appearance Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize the visual interface and color strategy.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Theme Mode</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <Button
                                    variant="outline"
                                    className={cn("justify-start gap-2 h-12 font-bold", theme === 'light' && "border-primary ring-1 ring-primary bg-primary/5")}
                                    onClick={() => setTargetTheme('light')}
                                >
                                    <Sun size={16} /> Light Mode
                                </Button>
                                <Button
                                    variant="outline"
                                    className={cn("justify-start gap-2 h-12 font-bold", theme === 'dark' && "border-primary ring-1 ring-primary bg-primary/5")}
                                    onClick={() => setTargetTheme('dark')}
                                >
                                    <Moon size={16} /> Dark Mode
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Interface Tint</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {Object.entries(colors).map(([name, values]) => {
                                    // Use the light theme primary color for valid representation in UI
                                    const hsl = values.light.primary
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => setColorTheme(name)}
                                            className={cn(
                                                "relative flex items-center gap-3 rounded-xl border border-border px-3 py-3 hover:bg-muted/50 transition-all text-left",
                                                colorTheme === name && "border-primary ring-1 ring-primary bg-primary/5"
                                            )}
                                        >
                                            <span
                                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/20"
                                                style={{ backgroundColor: `hsl(${hsl})` }}
                                            >
                                                {colorTheme === name && <Check size={12} className="text-white drop-shadow-md" strokeWidth={3} />}
                                            </span>
                                            <span className="text-xs font-bold capitalize truncate">{name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
