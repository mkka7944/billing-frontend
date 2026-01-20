import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ipegpbgcektdtbnfvhvc.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZWdwYmdjZWt0ZHRibmZ2aHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTYzNjMsImV4cCI6MjA4MDY3MjM2M30.FHe6qYLmqvvTjRbKQQqHWNpsDbCBCeT9hPMgnAyE2bE"

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    const users = [
        { email: 'billing.admin@gmail.com', password: 'password123', role: 'admin', name: 'System Administrator' },
        { email: 'billing.user@gmail.com', password: 'password123', role: 'user', name: 'Field Operator' }
    ]

    console.log('--- STARTING SEED PROTOCOL ---')

    for (const u of users) {
        console.log(`Target: ${u.email}`)
        const { data, error } = await supabase.auth.signUp({
            email: u.email,
            password: u.password
        })

        if (error) {
            if (error.message.includes('already registered')) {
                console.log(`[INFO] ${u.email} is already registered. Attempting profile update...`)
                // If already registered, we try to log in to get the ID (if possible) or just skip
                // Without service role, we can't get the ID easily unless we log in
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: u.email,
                    password: u.password
                })

                if (signInError) {
                    console.error(`[ERROR] Unable to access existing user ${u.email}:`, signInError.message)
                    continue
                }

                if (signInData.user) {
                    await createProfile(signInData.user, u)
                }
            } else {
                console.error(`[ERROR] Registration failed for ${u.email}:`, error.message)
            }
            continue
        }

        if (data.user) {
            console.log(`[SUCCESS] User registered: ${data.user.id}`)
            await createProfile(data.user, u)
        }
    }

    console.log('--- SEED PROTOCOL COMPLETE ---')
}

async function createProfile(user, u) {
    const permissions = u.role === 'admin' ? {
        map: true, surveys: true, financials: true, performance: true,
        tickets: true, stats: true, settings: true, style_lab: true
    } : {
        map: true, surveys: true, financials: false, performance: true,
        tickets: true, stats: false, settings: true, style_lab: false
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            role: u.role,
            full_name: u.name,
            permissions: permissions
        })

    if (profileError) {
        console.error(`[ERROR] Profile sync failed for ${u.email}:`, profileError.message)
        console.log(`[HINT] Ensure a 'profiles' table exists in public schema with columns: id (uuid), role (text), full_name (text), permissions (jsonb)`)
    } else {
        console.log(`[SUCCESS] Profile synced for ${u.email} (Role: ${u.role})`)
    }
}

seed()
