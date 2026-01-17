import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

/**
 * Hook to manage location hierarchy state (Districts, Tehsils, UCs)
 * @param {Object} activeFilters - Object containing current selection (district, tehsil)
 */
export function useLocationHierarchy(activeFilters = {}) {
    const [districts, setDistricts] = useState([])
    const [tehsils, setTehsils] = useState([])
    const [ucs, setUcs] = useState([])
    const [loading, setLoading] = useState(false)

    // Initial Load: Districts
    useEffect(() => {
        fetchDistricts()
    }, [])

    // Cascade: District -> Tehsil
    useEffect(() => {
        if (activeFilters.district) {
            fetchTehsils(activeFilters.district)
        } else {
            setTehsils([])
        }
    }, [activeFilters.district])

    // Cascade: Tehsil -> UC
    useEffect(() => {
        if (activeFilters.tehsil) {
            fetchUCs(activeFilters.tehsil)
        } else {
            setUcs([])
        }
    }, [activeFilters.tehsil])

    async function fetchDistricts() {
        try {
            const { data } = await supabase.from('location_hierarchy').select('city_district')
            if (data) {
                const unique = [...new Set(data.map(i => i.city_district?.toUpperCase().trim()).filter(Boolean))].sort()
                setDistricts(unique)
            }
        } catch (e) {
            console.error('Error fetching districts:', e)
        }
    }

    async function fetchTehsils(district) {
        if (!district) return
        try {
            const { data } = await supabase.from('location_hierarchy').select('tehsil').eq('city_district', district)
            if (data) {
                const unique = [...new Set(data.map(i => i.tehsil?.toUpperCase().trim()).filter(Boolean))].sort()
                setTehsils(unique)
            }
        } catch (e) {
            console.error('Error fetching tehsils:', e)
        }
    }

    async function fetchUCs(tehsil) {
        if (!tehsil) return
        try {
            const { data } = await supabase.from('location_hierarchy').select('uc_name').eq('tehsil', tehsil)
            if (data) {
                const unique = [...new Set(data.map(i => i.uc_name?.trim().toUpperCase()).filter(Boolean))].sort()
                setUcs(unique)
            }
        } catch (e) {
            console.error('Error fetching UCs:', e)
        }
    }

    return {
        districts,
        tehsils,
        ucs,
        refreshDistricts: fetchDistricts
    }
}
