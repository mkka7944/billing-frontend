import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabaseClient'
import { Loader2, Map as MapIcon, Image as ImageIcon } from 'lucide-react'
import { useSearch } from '../context/SearchContext'
import { useUI } from '../context/UIContext'
import { shortenAreaName, formatLocationLabel } from '../lib/utils'
import L from 'leaflet'

// Helper to determine cluster size class
const getClusterClass = (count) => {
    if (count < 10) return 'custom-cluster-icon-small'
    if (count < 100) return 'custom-cluster-icon-medium'
    return 'custom-cluster-icon-large'
}

// Custom Cluster Icon Generator
const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount()
    const sizeClass = getClusterClass(count)

    return L.divIcon({
        html: `<span>${count}</span>`,
        className: `custom-cluster-icon ${sizeClass}`,
        iconSize: L.point(40, 40, true),
    })
}

// Functional component to handle map center/zoom changes when a selection occurs
function MapController({ selectedId, markers }) {
    const map = useMap()

    useEffect(() => {
        if (selectedId && markers.length > 0) {
            const marker = markers.find(m => m.survey_id === selectedId)
            if (marker && marker.lat && marker.lng) {
                map.setView([marker.lat, marker.lng], 18, { animate: true })
            }
        }
    }, [selectedId, markers, map])

    return null
}

export default function Map() {
    const { query: searchQuery } = useSearch()
    const { selectedSurveyId, setSelectedSurveyId } = useUI()
    const [markers, setMarkers] = useState([])
    const [loading, setLoading] = useState(true)
    const [mapType, setMapType] = useState('roads')

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMarkers()
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    async function fetchMarkers() {
        try {
            setLoading(true)
            let query = supabase
                .from('survey_units')
                .select('survey_id, lat, lng, consumer_name, status, city_district, tehsil, uc_name')
                .order('created_at', { ascending: false })

            if (searchQuery) {
                query = query.or(`survey_id.ilike.%${searchQuery}%,consumer_name.ilike.%${searchQuery}%,city_district.ilike.%${searchQuery}%`)
            } else {
                query = query
                    .eq('city_district', 'SARGODHA')
                    .eq('tehsil', 'SARGODHA')
                    .ilike('uc_name', 'MC-1%')
            }

            const { data, error } = await query.limit(5000)
            if (error) throw error
            setMarkers(data || [])
        } catch (err) {
            console.error('Error fetching markers:', err)
        } finally {
            setLoading(false)
        }
    }

    const tileLayers = {
        roads: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        satellite: "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
    }

    return (
        <div className="w-full h-full bg-slate-50 relative">
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => setMapType(mapType === 'roads' ? 'satellite' : 'roads')}
                    className="p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all group"
                    title="Toggle Map Layer"
                >
                    {mapType === 'roads' ? <ImageIcon size={20} className="group-hover:text-indigo-500" /> : <MapIcon size={20} className="group-hover:text-emerald-500" />}
                </button>
            </div>

            {loading && (
                <div className="absolute inset-0 z-[1001] bg-slate-100/20 backdrop-blur-[2px] flex items-center justify-center animate-fade-in transition-colors">
                    <div className="glass-panel p-4 rounded-xl flex items-center gap-3 shadow-2xl border-white/5">
                        <Loader2 className="text-indigo-600 animate-spin" size={20} />
                        <span className="text-xs font-bold premium-gradient-text tracking-widest uppercase">Syncing Map Data</span>
                    </div>
                </div>
            )}

            <MapContainer
                center={[32.0740, 72.6861]}
                zoom={13}
                className="w-full h-full z-0"
                zoomControl={false}
                preferCanvas={true}
            >
                <TileLayer
                    url={tileLayers[mapType]}
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution='&copy; Google Maps'
                    maxZoom={20}
                />

                <MapController selectedId={selectedSurveyId} markers={markers} />

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    disableClusteringAtZoom={17}
                    iconCreateFunction={createClusterCustomIcon}
                    showCoverageOnHover={false}
                    spiderfyOnMaxZoom={true}
                >
                    {markers.map(m => (
                        m.lat && m.lng ? (
                            <CircleMarker
                                key={m.survey_id}
                                center={[m.lat, m.lng]}
                                radius={m.survey_id === selectedSurveyId ? 8 : 4}
                                pathOptions={{
                                    fillColor: m.survey_id === selectedSurveyId ? '#ef4444' : '#6366f1',
                                    fillOpacity: 0.6,
                                    color: m.survey_id === selectedSurveyId ? '#fff' : '#fff',
                                    weight: m.survey_id === selectedSurveyId ? 3 : 1,
                                    stroke: true
                                }}
                                eventHandlers={{
                                    click: () => setSelectedSurveyId(m.survey_id),
                                }}
                            >
                                <Popup className="premium-popup">
                                    <div className="p-1">
                                        <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1">Survey Record</div>
                                        <div className="font-bold text-slate-900 dark:text-slate-200">{m.consumer_name || 'No Name Found'}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-500">ID: {m.survey_id}</div>
                                        <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-1">
                                            {formatLocationLabel(m.city_district, shortenAreaName(m.uc_name, m.city_district, m.tehsil))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/5 text-[10px] text-indigo-600 dark:text-indigo-300 flex items-center gap-1 font-extrabold uppercase tracking-tight cursor-pointer" onClick={() => setSelectedSurveyId(m.survey_id)}>
                                            <MapIcon size={10} /> View Full Report
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ) : null
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    )
}
