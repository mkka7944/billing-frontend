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
import ErrorBoundary from './components/ErrorBoundary'
import { Menu } from 'lucide-react'


function Layout() {
  const { theme } = useTheme()
  const { selectedSurveyId, setSelectedSurveyId, isSidebarOpen, setIsSidebarOpen } = useUI()

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-50 transition-colors duration-300">
      {/* Main Navigation Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full w-72 shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          border-r border-slate-200 dark:border-white/5
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
            <Route path="/settings" element={<SurveyStatsView />} />
          </Routes>

          {/* Universal Record Detail (Always slide-over) */}
          <div
            className={`
              fixed top-0 right-0 z-[1001] h-full w-full md:w-[480px]
              transform transition-transform duration-500 ease-out shadow-2xl
              ${selectedSurveyId ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
            <ErrorBoundary key={selectedSurveyId}>
              <RecordDetail
                surveyId={selectedSurveyId}
                onClose={() => setSelectedSurveyId(null)}
              />
            </ErrorBoundary>
          </div>
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
