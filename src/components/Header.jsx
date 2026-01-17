import { Search, Command, Bell, User, Sun, Moon, Zap, Menu } from 'lucide-react'
import { useSearch } from '../context/SearchContext'
import { useTheme } from '../context/ThemeContext'

export default function Header({ onMenuClick }) {
    const { query, setQuery } = useSearch()
    const { theme, toggleTheme } = useTheme()

    return (
        <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between px-4 md:px-6 z-40 transition-colors backdrop-blur-md">
            {/* Mobile Menu Toggle */}
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-indigo-500 transition-colors"
            >
                <Menu size={24} />
            </button>

            {/* Universal Search Bar */}
            <div className="flex-1 max-w-2xl">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-3 text-sm transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                        placeholder="Power Search (Survey ID, PSID, or Consumer Name)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                            <Command size={10} /> K
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-4 ml-6">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300"
                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>
                <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>
                <div className="flex items-center gap-2 md:gap-3 pl-1">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">System Admin</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest">Active</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    )
}
