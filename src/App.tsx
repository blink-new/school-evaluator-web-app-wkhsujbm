import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { HomePage } from './pages/HomePage'
import { SchoolDetailsPage } from './pages/SchoolDetailsPage'
import { SearchPage } from './pages/SearchPage'
import { ComparePage } from './pages/ComparePage'
import { Header } from './components/layout/Header'
import { Toaster } from './components/ui/toaster'

type Page = 'home' | 'search' | 'school' | 'compare'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const navigateTo = (page: Page, schoolId?: string, query?: string) => {
    setCurrentPage(page)
    if (schoolId) setSelectedSchoolId(schoolId)
    if (query !== undefined) setSearchQuery(query)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SchoolGrader...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">SchoolGrader</h1>
            <p className="text-lg text-muted-foreground">
              Find and review the best schools in your area
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to SchoolGrader</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to start exploring schools, reading reviews, and sharing your experiences.
            </p>
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />
      case 'search':
        return <SearchPage query={searchQuery} onNavigate={navigateTo} />
      case 'school':
        return selectedSchoolId ? (
          <SchoolDetailsPage schoolId={selectedSchoolId} onNavigate={navigateTo} />
        ) : (
          <HomePage onNavigate={navigateTo} />
        )
      case 'compare':
        return <ComparePage onNavigate={navigateTo} />
      default:
        return <HomePage onNavigate={navigateTo} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        currentPage={currentPage}
        onNavigate={navigateTo}
        onSearch={(query) => navigateTo('search', undefined, query)}
      />
      <main>
        {renderPage()}
      </main>
      <Toaster />
    </div>
  )
}

export default App