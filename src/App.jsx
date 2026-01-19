import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SearchProvider } from './context/SearchContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { UIProvider, useUI } from './context/UIContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Map from './components/Map'
import RecordDetail from './components/RecordDetail'
import DatabaseStats from './views/DatabaseStats'
import SurveyStatsView from './views/SurveyStatsView'
import SettingsView from './views/SettingsView'
import StyleLab from './views/StyleLab'
import ErrorBoundary from './components/ErrorBoundary'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'


function Layout() {
  const { theme } = useTheme()
  const { selectedSurveyId, setSelectedSurveyId, isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed } = useUI()

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-background text-foreground transition-colors duration-300">
      {/* Main Navigation Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full shrink-0
          transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'w-[70px]' : 'w-72'}
          border-r border-border
        `}
      >
        <Sidebar onCloseMobile={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Primary View Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Routes>
            <Route path="/" element={
              <div className="w-full h-full relative">
                <Map />
              </div>
            } />
            <Route path="/surveys" element={<SurveyStatsView />} />
            <Route path="/query" element={<SurveyStatsView />} />
            <Route path="/financials" element={<SurveyStatsView />} />
            <Route path="/performance" element={<SurveyStatsView />} />
            <Route path="/tickets" element={<SurveyStatsView />} />
            <Route path="/stats" element={<DatabaseStats />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/style-lab" element={<StyleLab />} />
          </Routes>

          {/* Universal Record Detail (Always slide-over) */}
          <Sheet open={!!selectedSurveyId} onOpenChange={(open) => !open && setSelectedSurveyId(null)}>
            <SheetContent side="right" className="w-[100vw] sm:max-w-[480px] p-0 border-l border-border bg-background [&>button]:hidden">
              <div className="h-full w-full">
                <ErrorBoundary key={selectedSurveyId}>
                  <RecordDetail
                    surveyId={selectedSurveyId}
                    onClose={() => setSelectedSurveyId(null)}
                  />
                </ErrorBoundary>
              </div>
            </SheetContent>
          </Sheet>
        </main>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <UIProvider>
          <Router>
            <Layout />
          </Router>
        </UIProvider>
      </SearchProvider>
    </ThemeProvider>
  )
}

export default App
