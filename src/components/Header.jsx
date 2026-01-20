import { Search, Command, Bell, User, Sun, Moon, Zap, Menu } from 'lucide-react'
import { useSearch } from '../context/SearchContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function Header({ onMenuClick }) {
    const { query, setQuery } = useSearch()
    const { theme, toggleTheme } = useTheme()
    const { profile, isAdmin } = useAuth()

    return (
        <header className="h-14 border-b border-border bg-background/95 flex items-center justify-between px-4 md:px-6 z-40 transition-all backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Mobile Menu Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="md:hidden -ml-2 mr-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <Menu size={20} />
            </Button>

            {/* Universal Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="text"
                        className="pl-10 pr-12 h-9 bg-secondary/50 border-transparent focus:border-primary/20 transition-all font-medium"
                        placeholder="Power Search (Survey ID, PSID, or Consumer Name)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1">
                        <Badge variant="outline" className="h-5 px-1 bg-background text-[10px] font-black opacity-30 border-border">
                            <Command size={10} className="mr-0.5" /> K
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 ml-6">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="text-muted-foreground hover:text-primary transition-all duration-300"
                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </Button>

                <div className="h-4 w-px bg-border/40 mx-1"></div>

                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
                </Button>

                <div className="h-4 w-px bg-border/40 mx-1"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <div className="text-[11px] font-black text-foreground uppercase tracking-tight">
                            {profile?.full_name || 'System User'}
                        </div>
                        <div className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5 group flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                            {isAdmin ? 'System Admin' : 'Field Operator'}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-primary shadow-sm hover:border-primary/40 transition-all">
                        <User size={16} />
                    </div>
                </div>
            </div>
        </header>
    )
}
