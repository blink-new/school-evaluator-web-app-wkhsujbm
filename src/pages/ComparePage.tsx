import { useState, useEffect } from 'react'
import { Search, Plus, X, Star, MapPin, Phone, Globe } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { blink } from '../blink/client'

interface School {
  id: string
  name: string
  address: string
  city: string
  state: string
  phone?: string
  website?: string
  schoolType: string
  gradeLevels: string
  overallRating: number
  academicsRating: number
  facilitiesRating: number
  teachersRating: number
  safetyRating: number
  extracurricularsRating: number
  totalReviews: number
}

interface ComparePageProps {
  onNavigate: (page: 'home' | 'search' | 'school' | 'compare', schoolId?: string, query?: string) => void
}

export function ComparePage({ onNavigate }: ComparePageProps) {
  const [selectedSchools, setSelectedSchools] = useState<School[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const searchSchools = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const results = await blink.db.schools.list({
        where: {
          OR: [
            { name: { contains: searchQuery } },
            { city: { contains: searchQuery } },
            { address: { contains: searchQuery } }
          ]
        },
        orderBy: { overall_rating: 'desc' },
        limit: 10
      })

      const schools = results.map(school => ({
        id: school.id,
        name: school.name,
        address: school.address,
        city: school.city,
        state: school.state,
        phone: school.phone,
        website: school.website,
        schoolType: school.school_type,
        gradeLevels: school.grade_levels,
        overallRating: school.overall_rating,
        academicsRating: school.academics_rating,
        facilitiesRating: school.facilities_rating,
        teachersRating: school.teachers_rating,
        safetyRating: school.safety_rating,
        extracurricularsRating: school.extracurriculars_rating,
        totalReviews: school.total_reviews
      }))

      setSearchResults(schools.filter(school => 
        !selectedSchools.some(selected => selected.id === school.id)
      ))
    } catch (error) {
      console.error('Error searching schools:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSchools()
    }, 300)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const addSchool = (school: School) => {
    if (selectedSchools.length < 4 && !selectedSchools.some(s => s.id === school.id)) {
      setSelectedSchools([...selectedSchools, school])
      setSearchResults(searchResults.filter(s => s.id !== school.id))
      setSearchQuery('')
      setShowSearch(false)
    }
  }

  const removeSchool = (schoolId: string) => {
    setSelectedSchools(selectedSchools.filter(s => s.id !== schoolId))
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

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-green-500'
    if (rating >= 3.5) return 'text-yellow-500'
    if (rating >= 3.0) return 'text-orange-500'
    return 'text-red-500'
  }

  const getHighestRating = (category: keyof School) => {
    if (selectedSchools.length === 0) return 0
    return Math.max(...selectedSchools.map(school => school[category] as number))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Compare Schools</h1>
          <p className="text-lg text-muted-foreground">
            Add up to 4 schools to compare their ratings, features, and details side by side.
          </p>
        </div>

        {/* Add School Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add Schools to Compare</span>
              <span className="text-sm font-normal text-muted-foreground">
                {selectedSchools.length}/4 schools selected
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSchools.length < 4 && (
              <div className="mb-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search schools to add..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setShowSearch(true)
                      }}
                      onFocus={() => setShowSearch(true)}
                      className="pl-10 pr-4"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {showSearch && searchQuery && (
                  <div className="mt-4 border border-border rounded-md bg-card max-h-64 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No schools found
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {searchResults.map((school) => (
                          <div
                            key={school.id}
                            className="p-4 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => addSchool(school)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-foreground">
                                  {school.name}
                                </h4>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {school.city}, {school.state}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {renderStars(school.overallRating)}
                                  <span className="text-sm font-medium">
                                    {school.overallRating.toFixed(1)}
                                  </span>
                                </div>
                                <Badge variant="secondary">
                                  {school.schoolType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Selected Schools */}
            {selectedSchools.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3">Selected Schools:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedSchools.map((school) => (
                    <div
                      key={school.id}
                      className="border border-border rounded-lg p-4 relative group"
                    >
                      <button
                        onClick={() => removeSchool(school.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <h5 className="font-medium text-foreground mb-2 pr-8">
                        {school.name}
                      </h5>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {school.city}, {school.state}
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(school.overallRating)}
                        <span className="text-sm font-medium ml-1">
                          {school.overallRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedSchools.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>School Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Category</TableHead>
                      {selectedSchools.map((school) => (
                        <TableHead key={school.id} className="text-center min-w-48">
                          <div>
                            <div className="font-semibold text-foreground">
                              {school.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-normal">
                              {school.city}, {school.state}
                            </div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Basic Info */}
                    <TableRow>
                      <TableCell className="font-medium">School Type</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          <Badge variant="secondary">{school.schoolType}</Badge>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Grade Levels</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          {school.gradeLevels}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Reviews</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          {school.totalReviews}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Ratings */}
                    <TableRow>
                      <TableCell className="font-medium">Overall Rating</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className={`font-semibold ${
                              school.overallRating === getHighestRating('overallRating')
                                ? 'text-green-600'
                                : getRatingColor(school.overallRating)
                            }`}>
                              {school.overallRating.toFixed(1)}
                            </span>
                            <div className="flex space-x-0.5">
                              {renderStars(school.overallRating)}
                            </div>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Academics</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          <span className={`font-semibold ${
                            school.academicsRating === getHighestRating('academicsRating')
                              ? 'text-green-600'
                              : getRatingColor(school.academicsRating)
                          }`}>
                            {school.academicsRating.toFixed(1)}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Teachers</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          <span className={`font-semibold ${
                            school.teachersRating === getHighestRating('teachersRating')
                              ? 'text-green-600'
                              : getRatingColor(school.teachersRating)
                          }`}>
                            {school.teachersRating.toFixed(1)}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Facilities</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          <span className={`font-semibold ${
                            school.facilitiesRating === getHighestRating('facilitiesRating')
                              ? 'text-green-600'
                              : getRatingColor(school.facilitiesRating)
                          }`}>
                            {school.facilitiesRating.toFixed(1)}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Safety</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          <span className={`font-semibold ${
                            school.safetyRating === getHighestRating('safetyRating')
                              ? 'text-green-600'
                              : getRatingColor(school.safetyRating)
                          }`}>
                            {school.safetyRating.toFixed(1)}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Extracurriculars</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          <span className={`font-semibold ${
                            school.extracurricularsRating === getHighestRating('extracurricularsRating')
                              ? 'text-green-600'
                              : getRatingColor(school.extracurricularsRating)
                          }`}>
                            {school.extracurricularsRating.toFixed(1)}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Contact Info */}
                    <TableRow>
                      <TableCell className="font-medium">Phone</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          {school.phone ? (
                            <a href={`tel:${school.phone}`} className="text-primary hover:underline">
                              {school.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Website</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          {school.website ? (
                            <a
                              href={school.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Visit Site
                            </a>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Actions */}
                    <TableRow>
                      <TableCell className="font-medium">Actions</TableCell>
                      {selectedSchools.map((school) => (
                        <TableCell key={school.id} className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('school', school.id)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {selectedSchools.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No schools selected
                </h3>
                <p className="text-muted-foreground mb-6">
                  Search and add schools above to start comparing their ratings, features, and details.
                </p>
                <Button onClick={() => onNavigate('search')}>
                  Browse Schools
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSchools.length === 1 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Add more schools to compare
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add at least one more school to see a detailed comparison table.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Click outside to close search */}
      {showSearch && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}