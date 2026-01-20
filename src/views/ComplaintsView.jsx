import React from 'react'

export default function ComplaintsView() {
    return (
        <div className="flex-1 p-8 bg-background overflow-y-auto animate-fade-in">
            <div className="space-y-0.5 mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-1 bg-primary rounded-full" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">Operations.Support</span>
                </div>
                <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Tickets<span className="text-primary">.</span>Complaints</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-md">
                    <p className="text-xs text-muted-foreground uppercase font-black mb-2">Coming Soon</p>
                    <p className="text-sm">Integrated ticketing system for consumer complaints and field resolution tracking.</p>
                </div>
            </div>
        </div>
    )
}
