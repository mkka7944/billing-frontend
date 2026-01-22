import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { SearchProvider } from './context/SearchContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { UIProvider, useUI } from './context/UIContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Map from './components/Map'
import RecordDetail from './components/RecordDetail'
import DatabaseStats from './views/DatabaseStats'
import SurveyStatsView from './views/SurveyStatsView'
import FinanceView from './views/FinanceView'
import PerformanceView from './views/PerformanceView'
import ComplaintsView from './views/ComplaintsView'
import SettingsView from './views/SettingsView'
import StyleLab from './views/StyleLab'
import LoginView from './views/LoginView'
import ErrorBoundary from './components/ErrorBoundary'
import { Layers } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'

function Layout() {
  const { theme } = useTheme()
  const { user, loading, permissions } = useAuth()
  const { selectedSurveyId, setSelectedSurveyId, isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed } = useUI()

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-card border border-border animate-pulse flex items-center justify-center">
            <Layers className="text-primary animate-spin" size={24} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing.Terminal</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginView />
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-background text-foreground transition-colors duration-300">
      {/* Main Navigation Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full shrink-0
          transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'w-14' : 'w-72'}
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
            <Route path="/" element={<Map />} />
            <Route path="/surveys" element={<SurveyStatsView />} />
            <Route path="/query" element={<SurveyStatsView />} />
            <Route path="/financials" element={permissions?.financials ? <FinanceView /> : <div className="p-8">Access Denied</div>} />
            <Route path="/performance" element={<PerformanceView />} />
            <Route path="/tickets" element={<ComplaintsView />} />
            <Route path="/stats" element={permissions?.stats ? <DatabaseStats /> : <div className="p-8">Access Denied</div>} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/style-lab" element={permissions?.style_lab ? <StyleLab /> : <div className="p-8">Access Denied</div>} />
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
      <AuthProvider>
        <SearchProvider>
          <UIProvider>
            <Router>
              <Layout />
            </Router>
          </UIProvider>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
