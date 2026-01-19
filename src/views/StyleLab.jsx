import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'
import { Input } from '../components/ui/input'
import {
    Search, Bell, Mail, Trash, Save,
    Settings, Star, CheckCircle2, AlertCircle,
    ChevronRight, ArrowRight, Layers
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function StyleLab() {
    const { theme, toggleTheme } = useTheme()
    const [search, setSearch] = useState('')

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background text-foreground space-y-12 pb-32 no-scrollbar">
            {/* Header / Intro */}
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-border bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shadow-sm">
                        <Layers size={24} className="text-zinc-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase italic">
                            Style<span className="text-indigo-500">.</span>Lab
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium">Phase 2: Zinc Neutral Enterprise Design System</p>
                    </div>
                </div>
                <div className="h-px bg-border w-full opacity-50" />
                <div className="flex items-center gap-4">
                    <Button onClick={toggleTheme} variant="outline" size="sm" className="font-black uppercase tracking-widest h-8">
                        Toggle theme: <span className="text-indigo-500 ml-1">{theme}</span>
                    </Button>
                    <Badge variant="outline" className="border-indigo-500/20 text-indigo-500 font-black h-8 px-4">
                        READY FOR REVIEW
                    </Badge>
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Section: Buttons */}
                <Card className="shadow-sm border-border/60">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Buttons & Actions</CardTitle>
                        <CardDescription>Zinc variants for every operation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button className="font-bold">Primary Action</Button>
                            <Button variant="secondary" className="font-bold">Secondary</Button>
                            <Button variant="outline" className="font-bold">Outline</Button>
                            <Button variant="destructive" className="font-bold">Destructive</Button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button size="icon" variant="ghost"><Bell size={18} /></Button>
                            <Button size="icon" variant="outline"><Settings size={18} /></Button>
                            <Button variant="link" className="text-xs uppercase font-black tracking-widest">System Docs</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Section: Badges & Data Items */}
                <Card className="shadow-sm border-border/60">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Badges & Indicators</CardTitle>
                        <CardDescription>High-density status tagging.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge className="font-black">ACTIVE</Badge>
                            <Badge variant="secondary" className="font-black">PAID</Badge>
                            <Badge variant="outline" className="font-black">PENDING</Badge>
                            <Badge variant="destructive" className="font-black text-[10px] tracking-wider italic animate-pulse">ALARM</Badge>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-border space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Survey Capacity</span>
                                <span className="text-[10px] font-black text-indigo-500">92%</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[92%] rounded-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section: Forms & Input */}
                <Card className="shadow-sm border-border/60 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Inputs & Form Controls</CardTitle>
                        <CardDescription>Standardized Zinc input strategy.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Database</label>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                                    <Input
                                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 transition-all"
                                        placeholder="ID, PSID, OR NAME..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account PSID</label>
                                <Input disabled className="h-10 bg-zinc-100 dark:bg-zinc-900/30 border-dashed" value="PSID-9920-X12" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-border mt-4 justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground">Verification Pass: Manual</span>
                        <Button variant="outline" size="sm" className="h-8 font-black text-[10px] uppercase tracking-widest">
                            Discard Changes
                        </Button>
                    </CardFooter>
                </Card>

            </div>
        </div>
    )
}
