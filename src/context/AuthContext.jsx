import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

const DEFAULT_PERMISSIONS = {
    user: {
        map: true,
        surveys: true,
        financials: false,
        performance: true,
        tickets: true,
        stats: false,
        settings: true,
        style_lab: false
    },
    admin: {
        map: true,
        surveys: true,
        financials: true,
        performance: true,
        tickets: true,
        stats: true,
        settings: true,
        style_lab: true
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [permissions, setPermissions] = useState(null)

    useEffect(() => {
        // Check for active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user)
                fetchProfile(session.user)
            } else {
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser(session.user)
                fetchProfile(session.user)
            } else {
                setUser(null)
                setProfile(null)
                setPermissions(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (authUser) => {
        if (!authUser) return
        try {
            // Attempt to fetch profile
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single()

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create it (mock logic for demo and resilience)
                const userEmail = authUser.email || ''
                const role = userEmail.includes('admin') ? 'admin' : 'user'
                const name = userEmail.split('@')[0].replace('.', ' ').toUpperCase()

                const fallbackProfile = {
                    id: authUser.id,
                    role: role,
                    full_name: name || 'System User',
                    permissions: DEFAULT_PERMISSIONS[role]
                }

                setProfile(fallbackProfile)
                setPermissions(fallbackProfile.permissions)
            } else if (data) {
                setProfile(data)
                setPermissions(data.permissions || DEFAULT_PERMISSIONS[data.role || 'user'])
            }
        } catch (err) {
            console.error('Error fetching profile:', err)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    const logout = async () => {
        try {
            // 1. Sign out from Supabase
            await supabase.auth.signOut()

            // 2. Clear local storage to prevent automatic re-login on refresh
            localStorage.clear()
            sessionStorage.clear()

            // 3. Clear local state
            setUser(null)
            setProfile(null)
            setPermissions(null)

            // 4. Force hard redirect to entry point to clear any lingering JS closures
            window.location.href = '/'
        } catch (error) {
            console.error('Logout error:', error)
            // Still clear state locally
            setUser(null)
            window.location.href = '/'
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            permissions,
            loading,
            login,
            logout,
            isAdmin: profile?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
