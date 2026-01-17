import { useState } from 'react'
import { Check, Copy, ExternalLink, AlertCircle } from 'lucide-react'

/**
 * Enterprise Status Badge
 */
export const StatusBadge = ({ status, variant = 'default' }) => {
    const variants = {
        default: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        danger: 'bg-red-500/10 text-red-500 border-red-500/20',
        info: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    }

    const currentVariant = variants[variant] || variants.default

    return (
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${currentVariant}`}>
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
