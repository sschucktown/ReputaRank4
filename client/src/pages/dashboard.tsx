import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Star, Clock, TrendingUp, Plus, Send, Eye } from "lucide-react";
import Header from "@/components/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddClientForm } from "./clients";
import { authService } from "@/lib/auth";

export default function DashboardPage() {
  const [showAddClient, setShowAddClient] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalClients: number;
    reviewsReceived: number;
    pendingRequests: number;
    avgRating: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!authService.getToken(),
  });

  const { data: recentTestimonials } = useQuery<Array<{
    id: string;
    clientName: string;
    rating: number;
    content: string;
    createdAt: string;
  }>>({
    queryKey: ["/api/testimonials"],
    enabled: !!authService.getToken(),
  });

  const user = authService.getCurrentUser();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300 fill-current"
        }`}
      />
    ));
  };

  if (statsLoading) {
    return (
      <div className="ml-64 flex-1">
        <Header 
          title="Dashboard" 
          subtitle={`Welcome back, ${user?.name || 'Agent'}`}
          onAddClient={() => setShowAddClient(true)} 
        />
        <main className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ml-64 flex-1">
      <Header 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.name || 'Agent'}`}
        onAddClient={() => setShowAddClient(true)} 
      />
      
      <main className="p-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Clients</p>
                    <p className="text-3xl font-bold text-slate-900">{stats?.totalClients || 0}</p>
                  </div>
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success-600 font-medium">+12%</span>
                  <span className="text-slate-600 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Reviews Received</p>
                    <p className="text-3xl font-bold text-slate-900">{stats?.reviewsReceived || 0}</p>
                  </div>
                  <div className="bg-success-100 p-3 rounded-full">
                    <Star className="w-6 h-6 text-success-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success-600 font-medium">+25%</span>
                  <span className="text-slate-600 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending Requests</p>
                    <p className="text-3xl font-bold text-slate-900">{stats?.pendingRequests || 0}</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-amber-600 font-medium">2 this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg. Rating</p>
                    <p className="text-3xl font-bold text-slate-900">{stats?.avgRating || 0}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="flex space-x-1">
                    {renderStars(Math.round(stats?.avgRating || 0))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Reviews */}
            <div className="lg:col-span-2">
              <Card>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Reviews</h3>
                  <p className="text-sm text-slate-600">Latest client feedback</p>
                </div>
                <CardContent className="p-6">
                  {recentTestimonials && recentTestimonials.length > 0 ? (
                    <div className="space-y-4">
                      {recentTestimonials.slice(0, 3).map((testimonial: any) => (
                        <div key={testimonial.id} className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {testimonial.clientName?.split(" ").map((n: string) => n[0]).join("") || "C"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-slate-900">{testimonial.clientName || "Client"}</h4>
                              <div className="flex items-center">
                                <div className="flex space-x-1">
                                  {renderStars(testimonial.rating)}
                                </div>
                                <span className="ml-2 text-xs text-slate-500">
                                  {new Date(testimonial.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">{testimonial.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No reviews yet</p>
                      <p className="text-sm text-slate-400">Start collecting reviews from your clients</p>
                    </div>
                  )}
                </CardContent>
                {recentTestimonials && recentTestimonials.length > 0 && (
                  <div className="px-6 py-4 border-t border-slate-200">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      View all reviews →
                    </button>
                  </div>
                )}
              </Card>
            </div>

            {/* Quick Actions & Tasks */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      data-testid="button-add-client-quick"
                      onClick={() => setShowAddClient(true)}
                      className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Client
                    </Button>
                    <Button
                      data-testid="button-send-review-request"
                      variant="outline"
                      className="w-full justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Review Request
                    </Button>
                    <Button
                      data-testid="button-view-testimonials"
                      variant="outline"
                      className="w-full justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Testimonials
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Tasks</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Follow up with recent clients</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Send weekly review requests</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Update testimonial display</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add Client Dialog */}
        <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <AddClientForm onSuccess={() => setShowAddClient(false)} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
