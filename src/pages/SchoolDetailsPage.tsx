import { useState, useEffect } from 'react'
import { ArrowLeft, Star, MapPin, Phone, Globe, Users, Award, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Progress } from '../components/ui/progress'
import { blink } from '../blink/client'

interface School {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode?: string
  phone?: string
  website?: string
  schoolType: string
  gradeLevels: string
  description?: string
  imageUrl?: string
  overallRating: number
  academicsRating: number
  facilitiesRating: number
  teachersRating: number
  safetyRating: number
  extracurricularsRating: number
  totalReviews: number
}

interface Review {
  id: string
  overallRating: number
  academicsRating: number
  facilitiesRating: number
  teachersRating: number
  safetyRating: number
  extracurricularsRating: number
  title: string
  content: string
  pros?: string
  cons?: string
  wouldRecommend: boolean
  graduationYear?: number
  relationship: string
  createdAt: string
  userId: string
}

interface SchoolDetailsPageProps {
  schoolId: string
  onNavigate: (page: 'home' | 'search' | 'school' | 'compare', schoolId?: string, query?: string) => void
}

export function SchoolDetailsPage({ schoolId, onNavigate }: SchoolDetailsPageProps) {
  const [school, setSchool] = useState<School | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)

  const loadSchoolDetails = async () => {
    try {
      const schools = await blink.db.schools.list({
        where: { id: schoolId },
        limit: 1
      })

      if (schools.length > 0) {
        const schoolData = schools[0]
        setSchool({
          id: schoolData.id,
          name: schoolData.name,
          address: schoolData.address,
          city: schoolData.city,
          state: schoolData.state,
          zipCode: schoolData.zip_code,
          phone: schoolData.phone,
          website: schoolData.website,
          schoolType: schoolData.school_type,
          gradeLevels: schoolData.grade_levels,
          description: schoolData.description,
          imageUrl: schoolData.image_url,
          overallRating: schoolData.overall_rating || 0,
          academicsRating: schoolData.academics_rating || 0,
          facilitiesRating: schoolData.facilities_rating || 0,
          teachersRating: schoolData.teachers_rating || 0,
          safetyRating: schoolData.safety_rating || 0,
          extracurricularsRating: schoolData.extracurriculars_rating || 0,
          totalReviews: schoolData.total_reviews || 0
        })
      }
    } catch (error) {
      console.error('Error loading school details:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const reviewsData = await blink.db.reviews.list({
        where: { school_id: schoolId },
        orderBy: { created_at: 'desc' },
        limit: 20
      })

      setReviews(reviewsData.map(review => ({
        id: review.id,
        overallRating: review.overall_rating || 0,
        academicsRating: review.academics_rating || 0,
        facilitiesRating: review.facilities_rating || 0,
        teachersRating: review.teachers_rating || 0,
        safetyRating: review.safety_rating || 0,
        extracurricularsRating: review.extracurriculars_rating || 0,
        title: review.title,
        content: review.content,
        pros: review.pros,
        cons: review.cons,
        wouldRecommend: Number(review.would_recommend) > 0,
        graduationYear: review.graduation_year,
        relationship: review.relationship,
        createdAt: review.created_at,
        userId: review.user_id
      })))
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    loadSchoolDetails()
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId])

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const safeRating = rating || 0
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < Math.floor(safeRating)
            ? 'text-accent fill-accent'
            : i < safeRating
            ? 'text-accent fill-accent/50'
            : 'text-muted-foreground'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-muted rounded mb-6"></div>
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              </div>
              <div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">School Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The school you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => onNavigate('search')}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('search')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* School Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {school.name}
                  </h1>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {school.address}, {school.city}, {school.state} {school.zipCode}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">{school.schoolType}</Badge>
                    <Badge variant="outline">{school.gradeLevels}</Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {school.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${school.phone}`} className="hover:text-primary">
                      {school.phone}
                    </a>
                  </div>
                )}
                {school.website && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 mr-2" />
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {school.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {school.description}
                </p>
              )}
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Reviews ({school.totalReviews})
                </h2>
                <Button>Write a Review</Button>
              </div>

              {reviewsLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }, (_, i) => (
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
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to share your experience with this school.
                    </p>
                    <Button>Write the First Review</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-2">
                              {review.title}
                            </CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="capitalize">{review.relationship}</span>
                              {review.graduationYear && (
                                <span>Class of {review.graduationYear}</span>
                              )}
                              <span>{formatDate(review.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.overallRating)}
                            <span className="text-sm font-medium ml-2">
                              {review.overallRating}/5
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground mb-4 leading-relaxed">
                          {review.content}
                        </p>

                        {(review.pros || review.cons) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {review.pros && (
                              <div>
                                <div className="flex items-center text-green-600 mb-2">
                                  <ThumbsUp className="h-4 w-4 mr-2" />
                                  <span className="font-medium">Pros</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {review.pros}
                                </p>
                              </div>
                            )}
                            {review.cons && (
                              <div>
                                <div className="flex items-center text-red-600 mb-2">
                                  <ThumbsDown className="h-4 w-4 mr-2" />
                                  <span className="font-medium">Cons</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {review.cons}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center text-sm">
                            {review.wouldRecommend ? (
                              <span className="text-green-600 font-medium">
                                ✓ Recommends this school
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                ✗ Does not recommend this school
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overall Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Overall Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {(school.overallRating || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {renderStars(school.overallRating, 'md')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {school.totalReviews} reviews
                  </p>
                </div>

                <Separator className="mb-6" />

                {/* Rating Breakdown */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Academics</span>
                      <span className="text-sm text-muted-foreground">
                        {(school.academicsRating || 0).toFixed(1)}
                      </span>
                    </div>
                    <Progress value={(school.academicsRating || 0) * 20} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Teachers</span>
                      <span className="text-sm text-muted-foreground">
                        {(school.teachersRating || 0).toFixed(1)}
                      </span>
                    </div>
                    <Progress value={(school.teachersRating || 0) * 20} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Facilities</span>
                      <span className="text-sm text-muted-foreground">
                        {(school.facilitiesRating || 0).toFixed(1)}
                      </span>
                    </div>
                    <Progress value={(school.facilitiesRating || 0) * 20} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Safety</span>
                      <span className="text-sm text-muted-foreground">
                        {(school.safetyRating || 0).toFixed(1)}
                      </span>
                    </div>
                    <Progress value={(school.safetyRating || 0) * 20} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Extracurriculars</span>
                      <span className="text-sm text-muted-foreground">
                        {(school.extracurricularsRating || 0).toFixed(1)}
                      </span>
                    </div>
                    <Progress value={(school.extracurricularsRating || 0) * 20} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">Write a Review</Button>
                <Button variant="outline" className="w-full">
                  Add to Compare
                </Button>
                <Button variant="outline" className="w-full">
                  Save School
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}