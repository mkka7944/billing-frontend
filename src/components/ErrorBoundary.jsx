import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-500/20 m-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                        <AlertCircle size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Intelligent Error Recovery</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
                        The component encountered a structural failure while reconstructing the data node.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20"
                    >
                        <RefreshCw size={14} /> REINITIALIZE APP
                    </button>
                    {import.meta.env.DEV && (
                        <pre className="mt-4 p-4 text-[10px] text-left bg-black text-red-400 overflow-auto max-w-full rounded-lg">
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}
