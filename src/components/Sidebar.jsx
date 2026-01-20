import { NavLink } from 'react-router-dom'
import {
    Map as MapIcon, Database, Users, CreditCard,
    Ticket, Settings, Layers, LogOut, ChevronRight,
    BarChart3, FileText, Search, Zap,
    PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useUI } from '../context/UIContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function Sidebar() {
    const { profile, permissions, logout, isAdmin } = useAuth()
    const { isSidebarCollapsed, setIsSidebarCollapsed, setIsSidebarOpen } = useUI()

    const navItems = [
        {
            label: 'Map Explorer',
            id: 'map',
            path: '/',
            icon: <MapIcon size={18} />,
            category: 'GIS'
        },
        {
            label: 'Survey Management',
            id: 'surveys',
            path: '/surveys',
            icon: <FileText size={18} />,
            category: 'Operations'
        },
        {
            label: 'Financials',
            id: 'financials',
            path: '/financials',
            icon: <CreditCard size={18} />,
            category: 'Operations'
        },
        {
            label: 'Staff Performance',
            id: 'performance',
            path: '/performance',
            icon: <BarChart3 size={18} />,
            category: 'Intelligence'
        },
        {
            label: 'Complaints',
            id: 'tickets',
            path: '/tickets',
            icon: <Ticket size={18} />,
            category: 'Intelligence'
        },
        {
            label: 'Database Stats',
            id: 'stats',
            path: '/stats',
            icon: <Database size={18} />,
            category: 'System'
        },
        {
            label: 'Settings',
            id: 'settings',
            path: '/settings',
            icon: <Settings size={18} />,
            category: 'System'
        },
        {
            label: 'Style Lab',
            id: 'style_lab',
            path: '/style-lab',
            icon: <Zap size={18} />,
            category: 'System'
        }
    ]

    const categories = ['GIS', 'Operations', 'Intelligence', 'System']

    const filteredNavItems = navItems.filter(item => {
        // If no permissions loaded yet, or permission is explicitly true
        return permissions ? permissions[item.id] !== false : true
    })

    return (
        <div className={`flex flex-col h-full font-sans transition-all duration-300 bg-secondary border-r border-border animate-fade-in relative overflow-hidden ${isSidebarCollapsed ? 'items-center' : ''}`}>
            {/* Logo Section */}
            <div
                onClick={() => isSidebarCollapsed && setIsSidebarCollapsed(false)}
                className={`h-14 flex items-center border-b border-border/40 mb-2 bg-background/20 backdrop-blur-sm shrink-0 shadow-sm transition-all ${isSidebarCollapsed ? 'justify-center cursor-pointer hover:bg-background/40 w-full' : 'justify-between px-4'}`}
            >
                <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'w-auto' : ''}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-border bg-card shadow-sm transition-transform hover:rotate-3 duration-500">
                        <Layers className="text-primary" size={18} />
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="overflow-hidden min-w-0">
                            <h1 className="text-lg font-black tracking-tight whitespace-nowrap text-foreground uppercase truncate">
                                Billing<span className="text-primary">.</span>Map
                            </h1>
                        </div>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsSidebarCollapsed(true); }}
                        className="text-muted-foreground hover:text-foreground hidden md:block transition-colors p-1 rounded-md hover:bg-background/40"
                    >
                        <PanelLeftClose size={16} />
                    </button>
                )}
            </div>

            {/* Navigation - High Density */}
            <nav className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'px-2' : 'px-4'} py-2 space-y-8 no-scrollbar scrollbar-hide w-full`}>
                {categories.map(cat => {
                    const items = filteredNavItems.filter(i => i.category === cat)
                    if (items.length === 0) return null

                    return (
                        <div key={cat} className="space-y-1">
                            {!isSidebarCollapsed && (
                                <h3 className="px-4 text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-4">
                                    {cat}
                                </h3>
                            )}
                            {isSidebarCollapsed && (
                                <div className="h-px bg-border/20 mx-2 my-2" />
                            )}
                            {items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    title={isSidebarCollapsed ? item.label : ''}
                                    className={({ isActive }) => `
                                        flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-4 py-2.5'} rounded-lg transition-all group relative mb-0.5
                                        ${isActive
                                            ? 'bg-background/60 text-foreground border border-border shadow-sm'
                                            : 'text-muted-foreground hover:bg-background/20 hover:text-foreground border border-transparent'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && !isSidebarCollapsed && (
                                                <motion.div
                                                    layoutId="active-indicator"
                                                    className="absolute left-0 w-0.5 h-4 bg-primary rounded-full"
                                                />
                                            )}
                                            <div className="flex items-center gap-3">
                                                <span className={`transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'group-hover:text-foreground'} ${isSidebarCollapsed ? 'w-6 flex justify-center' : ''}`}>{item.icon}</span>
                                                {!isSidebarCollapsed && (
                                                    <span className={`text-[13px] font-bold tracking-tight ${isActive ? 'font-black' : ''}`}>
                                                        {item.label}
                                                    </span>
                                                )}
                                            </div>
                                            {!isSidebarCollapsed && (
                                                <ChevronRight size={14} className={`opacity-0 group-hover:opacity-40 transition-opacity ${isActive ? 'text-primary opacity-60' : ''}`} />
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
            <div className={`mt-auto ${isSidebarCollapsed ? 'p-1' : 'p-4'}`}>
                <div className={`rounded-xl ${isSidebarCollapsed ? 'border-none bg-transparent' : 'border border-border bg-card shadow-sm'} flex items-center ${isSidebarCollapsed ? 'justify-center p-1' : 'justify-between p-3'} group cursor-pointer transition-all`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                </span>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 rounded-full bg-emerald-500 border-card"></div>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="overflow-hidden">
                                <div className="text-[12px] font-black truncate text-foreground uppercase tracking-tight">{profile?.full_name || 'System User'}</div>
                                <div className="text-[9px] font-bold truncate text-muted-foreground uppercase tracking-wider">{isAdmin ? 'System Admin' : 'Field Operator'}</div>
                            </div>
                        )}
                    </div>
                    {!isSidebarCollapsed && (
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg transition-all shrink-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
