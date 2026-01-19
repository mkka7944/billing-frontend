import { NavLink } from 'react-router-dom'
import {
    Map as MapIcon, Database, Users, CreditCard,
    Ticket, Settings, Layers, LogOut, ChevronRight,
    BarChart3, FileText, Search, Zap,
    PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useUI } from '../context/UIContext'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'

export default function Sidebar() {
    const { setIsSidebarOpen } = useUI()
    const navItems = [
        {
            label: 'Map Explorer',
            path: '/',
            icon: <MapIcon size={18} />,
            category: 'GIS'
        },
        {
            label: 'Survey Management',
            path: '/surveys',
            icon: <FileText size={18} />,
            category: 'Operations'
        },
        {
            label: 'Financials',
            path: '/financials',
            icon: <CreditCard size={18} />,
            adminOnly: true,
            category: 'Operations'
        },
        {
            label: 'Staff Performance',
            path: '/performance',
            icon: <BarChart3 size={18} />,
            category: 'Intelligence'
        },
        {
            label: 'Complaints',
            path: '/tickets',
            icon: <Ticket size={18} />,
            category: 'Intelligence'
        },
        {
            label: 'Database Stats',
            path: '/stats',
            icon: <Database size={18} />,
            category: 'System'
        },
        {
            label: 'Settings',
            path: '/settings',
            icon: <Settings size={18} />,
            category: 'System'
        },
        {
            label: 'Style Lab',
            path: '/style-lab',
            icon: <Zap size={18} />,
            category: 'System'
        }
    ]

    const categories = ['GIS', 'Operations', 'Intelligence', 'System']
    const { isSidebarCollapsed, setIsSidebarCollapsed } = useUI()

    return (
        <div className={`flex flex-col h-full font-sans transition-all duration-300 bg-background border-r border-border animate-fade-in relative overflow-hidden ${isSidebarCollapsed ? 'items-center' : ''}`}>
            {/* Logo Section - Refined Zinc */}
            {/* Logo Section - Refined Zinc */}
            <div className={`h-14 flex items-center border-b border-border/40 mb-2 bg-slate-50/10 backdrop-blur-sm shrink-0 ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
                <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'w-auto' : ''}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-sm transition-transform hover:rotate-3 duration-500">
                        <Layers className="text-zinc-600 dark:text-zinc-400" size={18} />
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="overflow-hidden min-w-0">
                            <h1 className="text-lg font-black tracking-tight whitespace-nowrap text-zinc-900 dark:text-zinc-100 uppercase truncate">
                                Billing<span className="text-indigo-500">.</span>Map
                            </h1>
                        </div>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <button onClick={() => setIsSidebarCollapsed(true)} className="text-muted-foreground hover:text-foreground hidden md:block">
                        <PanelLeftClose size={16} />
                    </button>
                )}
                {isSidebarCollapsed && (
                    <button onClick={() => setIsSidebarCollapsed(false)} className="absolute top-4 right-[-100px] group-hover:right-4 text-muted-foreground">
                        {/* Hidden trigger managed via parent hover or explicit button */}
                    </button>
                )}
            </div>

            {/* Collapse Trigger for Mini Mode */}
            {isSidebarCollapsed && (
                <div className="absolute top-0 w-full h-14 flex items-center justify-center z-20 cursor-pointer" onClick={() => setIsSidebarCollapsed(false)} title="Expand Sidebar">
                </div>
            )}

            {/* Navigation - High Density */}
            <nav className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'px-2' : 'px-4'} py-2 space-y-8 no-scrollbar scrollbar-hide w-full`}>
                {categories.map(cat => {
                    const items = navItems.filter(i => i.category === cat)
                    if (items.length === 0) return null

                    return (
                        <div key={cat} className="space-y-1">
                            {!isSidebarCollapsed && (
                                <h3 className="px-4 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4">
                                    {cat}
                                </h3>
                            )}
                            {isSidebarCollapsed && (
                                <div className="h-px bg-border/50 mx-2 my-2" />
                            )}
                            {items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    title={isSidebarCollapsed ? item.label : ''}
                                    className={({ isActive }) => `
                                        flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-4 py-2.5'} rounded-lg transition-all group relative
                                        ${isActive
                                            ? 'bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10'
                                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.02] hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && !isSidebarCollapsed && (
                                                <motion.div
                                                    layoutId="active-indicator"
                                                    className="absolute left-0 w-0.5 h-4 bg-indigo-500 rounded-full"
                                                />
                                            )}
                                            <div className="flex items-center gap-3">
                                                <span className={`transition-all duration-300 ${isActive ? 'text-indigo-500 scale-110' : 'group-hover:text-zinc-900 dark:group-hover:text-zinc-100'}`}>{item.icon}</span>
                                                {!isSidebarCollapsed && (
                                                    <span className={`text-[13px] font-bold tracking-tight ${isActive ? 'font-black' : ''}`}>
                                                        {item.label}
                                                    </span>
                                                )}
                                            </div>
                                            {!isSidebarCollapsed && (
                                                <ChevronRight size={14} className={`opacity-0 group-hover:opacity-40 transition-opacity ${isActive ? 'text-indigo-500 opacity-60' : ''}`} />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    )
                })}
            </nav>

            {/* User Profile - Bento Style Neutral */}
            <div className={`mt-auto ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                <div className={`rounded-xl border border-border bg-white dark:bg-zinc-950 flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'justify-between p-3'} group cursor-pointer shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-border flex items-center justify-center overflow-hidden">
                                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">AD</span>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 rounded-full bg-emerald-500 border-white dark:border-zinc-950"></div>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="overflow-hidden">
                                <div className="text-[12px] font-black truncate text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">System Admin</div>
                                <div className="text-[9px] font-bold truncate text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">Sargodha HQ</div>
                            </div>
                        )}
                    </div>
                    <div className="p-2 rounded-lg transition-all shrink-0 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                        <LogOut size={16} />
                    </div>
                </div>
            </div>
        </div>
    )
}
