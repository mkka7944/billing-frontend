import { NavLink } from 'react-router-dom'
import {
    Map as MapIcon, Database, Users, CreditCard,
    Ticket, Settings, Layers, LogOut, ChevronRight,
    BarChart3, FileText, Search, Zap
} from 'lucide-react'
import { useUI } from '../context/UIContext'
import { useTheme } from '../context/ThemeContext'

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
        }
    ]

    const categories = ['GIS', 'Operations', 'Intelligence', 'System']

    return (
        <div className="flex flex-col h-full font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 animate-fade-in">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-200 dark:border-white/5 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20">
                        <Layers className="text-white" size={22} />
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="text-xl font-bold tracking-tight whitespace-nowrap premium-gradient-text">
                            Billing Map
                        </h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            v4.0 Enterprise
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar">
                {categories.map(cat => {
                    const items = navItems.filter(i => i.category === cat)
                    if (items.length === 0) return null

                    return (
                        <div key={cat} className="space-y-1">
                            <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">
                                {cat}
                            </h3>
                            {items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                                        ${isActive
                                            ? 'bg-indigo-600 dark:bg-indigo-500/10 text-white dark:text-indigo-400 shadow-md shadow-indigo-600/10 dark:shadow-none'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-slate-200 border border-transparent'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </div>
                                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    )
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 mt-auto">
                <div className="p-3 rounded-2xl border flex items-center justify-between group cursor-pointer shadow-sm transition-all bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="relative w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-emerald-500">
                                <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900">
                                    <span className="text-xs font-bold uppercase tracking-tighter text-indigo-600 dark:text-white">AD</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 rounded-full bg-emerald-500 border-white dark:border-slate-900"></div>
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-xs font-bold truncate font-display text-slate-800 dark:text-slate-200">Admin User</div>
                            <div className="text-[10px] font-medium truncate text-slate-500">Sargodha HQ</div>
                        </div>
                    </div>
                    <div className="p-2 rounded-lg transition-all shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10">
                        <LogOut size={16} />
                    </div>
                </div>
            </div>
        </div>
    )
}
