import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Star, MapPin, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Checkbox } from '../components/ui/checkbox'
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

interface SearchPageProps {
  query?: string
  onNavigate: (page: 'home' | 'search' | 'school' | 'compare', schoolId?: string, query?: string) => void
}

interface Filters {
  schoolType: string[]
  gradeLevel: string
  minRating: number
  sortBy: string
}

export function SearchPage({ query = '', onNavigate }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState(query)
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    schoolType: [],
    gradeLevel: '',
    minRating: 0,
    sortBy: 'rating'
  })

  const schoolTypes = ['public', 'private', 'charter']
  const gradeLevels = ['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)', 'K-12']
  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'name', label: 'Name A-Z' }
  ]

  const searchSchools = useCallback(async () => {
    setLoading(true)
    try {
      const whereClause: any = {}
      
      // Text search
      if (searchQuery.trim()) {
        whereClause.OR = [
          { name: { contains: searchQuery } },
          { city: { contains: searchQuery } },
          { address: { contains: searchQuery } }
        ]
      }

      // School type filter
      if (filters.schoolType.length > 0) {
        whereClause.school_type = { in: filters.schoolType }
      }

      // Grade level filter
      if (filters.gradeLevel) {
        whereClause.grade_levels = { contains: filters.gradeLevel }
      }

      // Rating filter
      if (filters.minRating > 0) {
        whereClause.overall_rating = { gte: filters.minRating }
      }

      // Sort order
      let orderBy: any = {}
      switch (filters.sortBy) {
        case 'rating':
          orderBy = { overall_rating: 'desc' }
          break
        case 'reviews':
          orderBy = { total_reviews: 'desc' }
          break
        case 'name':
          orderBy = { name: 'asc' }
          break
        default:
          orderBy = { overall_rating: 'desc' }
      }

      const results = await blink.db.schools.list({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        orderBy,
        limit: 50
      })

      setSchools(results.map(school => ({
        id: school.id,
        name: school.name,
        address: school.address,
        city: school.city,
        state: school.state,
        schoolType: school.school_type,
        gradeLevels: school.grade_levels,
        overallRating: school.overall_rating || 0,
        totalReviews: school.total_reviews || 0,
        imageUrl: school.image_url
      })))
    } catch (error) {
      console.error('Error searching schools:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters])

  useEffect(() => {
    searchSchools()
  }, [searchSchools])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchSchools()
  }

  const handleSchoolTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      schoolType: checked
        ? [...prev.schoolType, type]
        : prev.schoolType.filter(t => t !== type)
    }))
  }

  const clearFilters = () => {
    setFilters({
      schoolType: [],
      gradeLevel: '',
      minRating: 0,
      sortBy: 'rating'
    })
  }

  const renderStars = (rating: number) => {
    const safeRating = rating || 0
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(safeRating)
            ? 'text-accent fill-accent'
            : i < safeRating
            ? 'text-accent fill-accent/50'
            : 'text-muted-foreground'
        }`}
      />
    ))
  }

  const activeFiltersCount = 
    filters.schoolType.length + 
    (filters.gradeLevel ? 1 : 0) + 
    (filters.minRating > 0 ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Search Schools</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by school name, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
            <Button type="submit" className="sm:w-auto">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* School Type */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      School Type
                    </label>
                    <div className="space-y-2">
                      {schoolTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={filters.schoolType.includes(type)}
                            onCheckedChange={(checked) => 
                              handleSchoolTypeChange(type, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={type}
                            className="text-sm text-foreground capitalize cursor-pointer"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grade Level */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Grade Level
                    </label>
                    <Select
                      value={filters.gradeLevel}
                      onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, gradeLevel: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any grade level</SelectItem>
                        {gradeLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Minimum Rating */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Minimum Rating
                    </label>
                    <Select
                      value={filters.minRating.toString()}
                      onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, minRating: parseFloat(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any rating</SelectItem>
                        <SelectItem value="3">3+ stars</SelectItem>
                        <SelectItem value="4">4+ stars</SelectItem>
                        <SelectItem value="4.5">4.5+ stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Sort By
                    </label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, sortBy: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {loading ? 'Searching...' : `${schools.length} schools found`}
            </p>
          </div>
        </div>

        {/* Results */}
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
        ) : schools.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No schools found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find more results.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
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
                        {(school.overallRating || 0).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {school.totalReviews} reviews
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {school.gradeLevels}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {school.address}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}