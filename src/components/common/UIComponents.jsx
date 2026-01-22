import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, Copy, ExternalLink, AlertCircle } from 'lucide-react'

/**
 * Enterprise Status Badge
 */
export const StatusBadge = ({ status, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        active: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
        warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30 font-black',
        danger: 'bg-red-500/10 text-red-500 border-red-500/20',
        archived: 'bg-red-500/15 text-red-600 border-red-500/30',
        info: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        domestic: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        commercial: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    }

    const currentVariant = variants[variant.toLowerCase()] || variants.default

    return (
        <span className={cn("status-pill", currentVariant, className)}>
            {status}
        </span>
    )
}

/**
 * Intelligent Copy Button with Success State
 */
export const CopyButton = ({ text, title = "Copy" }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className={`p-1 rounded transition-all ${copied ? 'text-emerald-500 bg-emerald-500/10' : 'text-indigo-500 hover:bg-indigo-500/10'}`}
            title={copied ? "Copied!" : title}
        >
            {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
    )
}

/**
 * Standardized Currency Formatter Component
 */
export const CurrencyText = ({ amount, currency = 'Rs.' }) => {
    const formatted = new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0)

    return (
        <span className="font-display font-bold tabular-nums">
            <span className="text-[10px] text-slate-400 mr-1 uppercase font-medium">{currency}</span>
            {formatted}
        </span>
    )
}

/**
 * Modular Error Display
 */
export const ErrorNode = ({ message }) => (
    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-3 text-red-500 animate-fade-in">
        <AlertCircle size={18} />
        <span className="text-xs font-bold uppercase tracking-tight">{message || 'System Logic Error'}</span>
    </div>
)
