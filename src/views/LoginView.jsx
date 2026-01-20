import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Layers, Lock, Mail, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginView() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            await login(email.toLowerCase().trim(), password)
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden font-sans">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-700" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[400px] p-8 relative z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-2xl flex items-center justify-center mb-6 rotate-3">
                        <Layers className="text-primary" size={28} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
                        Billing<span className="text-primary">.</span>Node
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Operational Intelligence Terminal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Identity.Credentials</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <Input
                                type="email"
                                placeholder="access_email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-12 bg-card/40 border-border/40 focus:border-primary/40 focus:ring-primary/10 transition-all rounded-xl font-bold text-xs tracking-wide"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Security.Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 h-12 bg-card/40 border-border/40 focus:border-primary/40 focus:ring-primary/10 transition-all rounded-xl font-bold"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl flex items-center gap-3 text-destructive"
                        >
                            <AlertCircle size={16} className="shrink-0" />
                            <p className="text-[10px] font-bold uppercase leading-tight">{error}</p>
                        </motion.div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.1em] text-xs shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            "Initiate Protocol"
                        )}
                    </Button>
                </form>

                <div className="mt-12 text-center opacity-40">
                    <p className="text-[7px] font-black uppercase tracking-[0.2em]">Encrypted Session. Sargodha Security Protocol v4.0</p>
                </div>
            </motion.div>
        </div>
    )
}
