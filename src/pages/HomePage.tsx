import { useState, useEffect } from 'react'
import { Search, Star, TrendingUp, Users, Award, MapPin } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { blink } from '../blink/client'

interface School {
  id: string
  name: string
  address: string
  city: string
  state: string
  schoolType: string
  gradeLevels: string
  overallRating: number
  totalReviews: number
  imageUrl?: string
}

interface HomePageProps {
  onNavigate: (page: 'home' | 'search' | 'school' | 'compare', schoolId?: string, query?: string) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredSchools, setFeaturedSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)

  const loadFeaturedSchools = async () => {
    try {
      const schools = await blink.db.schools.list({
        orderBy: { overallRating: 'desc' },
        limit: 6
      })

      setFeaturedSchools(schools.map(school => ({
        id: school.id,
        name: school.name,
        address: school.address,
        city: school.city,
        state: school.state,
        schoolType: school.school_type,
        gradeLevels: school.grade_levels,
        overallRating: school.overall_rating,
        totalReviews: school.total_reviews,
        imageUrl: school.image_url
      })))
    } catch (error) {
      console.error('Error loading featured schools:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeaturedSchools()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onNavigate('search', undefined, searchQuery.trim())
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-accent fill-accent'
            : i < rating
            ? 'text-accent fill-accent/50'
            : 'text-muted-foreground'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Find the Perfect
              <span className="text-primary"> School</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover, compare, and review schools in your area. Make informed decisions with real insights from students, parents, and educators.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search by school name, city, or zip code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 h-14 text-lg"
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8">
                  Search Schools
                </Button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">1,200+</h3>
                <p className="text-muted-foreground">Schools Listed</p>
              </div>
              <div className="text-center">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">15,000+</h3>
                <p className="text-muted-foreground">Reviews Written</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">98%</h3>
                <p className="text-muted-foreground">Helpful Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schools */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Top Rated Schools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore highly-rated schools in your area based on real reviews from students, parents, and educators.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSchools.map((school) => (
                <Card
                  key={school.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => onNavigate('school', school.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {school.name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {school.city}, {school.state}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {school.schoolType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(school.overallRating)}
                        <span className="text-sm font-medium ml-2">
                          {school.overallRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {school.totalReviews} reviews
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {school.gradeLevels}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('search')}
              className="group"
            >
              View All Schools
              <TrendingUp className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How SchoolGrader Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Making school selection easier with comprehensive reviews and data-driven insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Search & Discover
              </h3>
              <p className="text-muted-foreground">
                Find schools by location, type, ratings, and specific criteria that matter to you and your family.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Read Reviews
              </h3>
              <p className="text-muted-foreground">
                Get insights from real students, parents, and educators about academics, facilities, teachers, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Make Decisions
              </h3>
              <p className="text-muted-foreground">
                Compare schools side-by-side and make informed decisions based on comprehensive data and reviews.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}