import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Share, Download, Eye } from "lucide-react";
import Header from "@/components/Header";
import { authService } from "@/lib/auth";

export default function TestimonialsPage() {
  const [ratingFilter, setRatingFilter] = useState("all");

  const { data: testimonials, isLoading } = useQuery<Array<{
    id: string;
    clientId: string;
    content: string;
    rating: number;
    propertyType?: string;
    isPublic: boolean;
    createdAt: string;
  }>>({
    queryKey: ["/api/testimonials"],
    enabled: !!authService.getToken(),
  });

  const { data: clients } = useQuery<Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    clientType: string;
    propertyType: string;
    status: string;
    createdAt: string;
  }>>({
    queryKey: ["/api/clients"],
    enabled: !!authService.getToken(),
  });

  const filteredTestimonials = testimonials?.filter((testimonial) => {
    if (ratingFilter === "all") return true;
    if (ratingFilter === "5-star") return testimonial.rating === 5;
    if (ratingFilter === "4-star") return testimonial.rating === 4;
    return true;
  }) || [];

  const getClientName = (clientId: string) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300 fill-current"
        }`}
      />
    ));
  };

  const averageRating = (testimonials?.length || 0) > 0 
    ? (testimonials?.reduce((sum: number, t) => sum + t.rating, 0) || 0) / (testimonials?.length || 1)
    : 0;

  const ratingBreakdown = {
    5: testimonials?.filter((t) => t.rating === 5).length || 0,
    4: testimonials?.filter((t) => t.rating === 4).length || 0,
    3: testimonials?.filter((t) => t.rating === 3).length || 0,
    2: testimonials?.filter((t) => t.rating === 2).length || 0,
    1: testimonials?.filter((t) => t.rating === 1).length || 0,
  };

  const totalReviews = testimonials?.length || 0;

  if (isLoading) {
    return (
      <div className="ml-64 flex-1">
        <Header title="Testimonials" subtitle="Showcase your client success stories" />
        <main className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-200 rounded-xl h-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-48"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ml-64 flex-1">
      <Header title="Testimonials" subtitle="Showcase your client success stories" />
      
      <main className="p-6">
        <div className="space-y-6">
          {/* Header with Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger data-testid="select-rating-filter" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="5-star">5 Star</SelectItem>
                  <SelectItem value="4-star">4 Star</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              data-testid="button-export-testimonials"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Rating Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900">{averageRating.toFixed(1)}</div>
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-1">
                      {renderStars(Math.round(averageRating))}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">{totalReviews} reviews</div>
                </div>

                {/* Rating Breakdown */}
                <div className="flex-1 max-w-md mx-8">
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <span className="text-sm text-slate-600 w-8">{rating}★</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2 mx-3">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ 
                              width: totalReviews > 0 
                                ? `${(ratingBreakdown[rating as keyof typeof ratingBreakdown] / totalReviews) * 100}%` 
                                : '0%' 
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 w-8">
                          {ratingBreakdown[rating as keyof typeof ratingBreakdown]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials Grid */}
          {filteredTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTestimonials.map((testimonial: any) => (
                <Card key={testimonial.id} data-testid={`testimonial-${testimonial.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {getClientName(testimonial.clientId).split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-slate-900">{getClientName(testimonial.clientId)}</h4>
                          <p className="text-sm text-slate-600">{new Date(testimonial.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-4">{testimonial.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{testimonial.propertyType || "Property Transaction"}</span>
                      <div className="flex space-x-2">
                        <Button
                          data-testid={`button-share-${testimonial.id}`}
                          variant="outline"
                          size="sm"
                        >
                          <Share className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          data-testid={`button-export-${testimonial.id}`}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No testimonials found</h3>
                <p className="text-slate-600 mb-6">
                  {ratingFilter === "all" 
                    ? "Start collecting reviews to showcase your client success stories."
                    : `No testimonials match the "${ratingFilter}" filter.`}
                </p>
                {ratingFilter === "all" && (
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Clients
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
