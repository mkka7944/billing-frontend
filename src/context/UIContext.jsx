import { createContext, useContext, useState } from 'react'

const UIContext = createContext()

export function UIProvider({ children }) {
    const [selectedSurveyId, setSelectedSurveyId] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Helper to clear selection
    const clearSelection = () => setSelectedSurveyId(null)

    // Robust selection function that ensures we don't 'freeze' on rapid clicks
    const selectSurvey = (id) => {
        if (!id) {
            setSelectedSurveyId(null)
            return
        }
        // If it's already selected, maybe we want to 'refresh' or just leave it
        setSelectedSurveyId(id)
    }

    return (
        <UIContext.Provider value={{
            selectedSurveyId,
            setSelectedSurveyId: selectSurvey,
            clearSelection,
            isSidebarOpen,
            setIsSidebarOpen
        }}>
            {children}
        </UIContext.Provider>
    )
}

export function useUI() {
    const context = useContext(UIContext)
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider')
    }
    return context
}
