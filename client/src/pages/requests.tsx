import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Eye, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReviewRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/review-requests"],
    enabled: !!authService.getToken(),
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
    enabled: !!authService.getToken(),
  });

  const resendRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const token = authService.getToken();
      if (!token) throw new Error("Not authenticated");

      // In a real app, this would create a new request or resend the existing one
      const response = await apiRequest("PUT", `/api/review-requests/${requestId}/status`, {
        status: "pending"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-requests"] });
      toast({
        title: "Success",
        description: "Review request resent successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend request",
        variant: "destructive",
      });
    },
  });

  const filteredRequests = requests?.filter((request: any) => {
    if (statusFilter === "all") return true;
    return request.status === statusFilter;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-success-100 text-success-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients?.find((c: any) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const getClientEmail = (clientId: string) => {
    const client = clients?.find((c: any) => c.id === clientId);
    return client?.email || "";
  };

  const requestStats = {
    total: requests?.length || 0,
    pending: requests?.filter((r: any) => r.status === "pending").length || 0,
    completed: requests?.filter((r: any) => r.status === "completed").length || 0,
    responseRate: requests?.length > 0 
      ? Math.round((requests.filter((r: any) => r.status === "completed").length / requests.length) * 100)
      : 0,
  };

  if (isLoading) {
    return (
      <div className="ml-64 flex-1">
        <Header title="Review Requests" subtitle="Track and manage review requests" />
        <main className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-24"></div>
              ))}
            </div>
            <div className="bg-gray-200 rounded-xl h-64"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ml-64 flex-1">
      <Header title="Review Requests" subtitle="Track and manage review requests" />
      
      <main className="p-6">
        <div className="space-y-6">
          {/* Header with Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              data-testid="button-send-new-request"
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send New Request
            </Button>
          </div>

          {/* Request Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-slate-900">{requestStats.total}</div>
                <div className="text-sm text-slate-600">Total Sent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-amber-600">{requestStats.pending}</div>
                <div className="text-sm text-slate-600">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-success-600">{requestStats.completed}</div>
                <div className="text-sm text-slate-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-slate-900">{requestStats.responseRate}%</div>
                <div className="text-sm text-slate-600">Response Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <Card>
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Recent Requests</h3>
            </div>
            <CardContent className="p-0">
              {filteredRequests.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {filteredRequests.map((request: any) => (
                    <div key={request.id} data-testid={`request-${request.id}`} className="p-6 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {getClientName(request.clientId).split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-slate-900">{getClientName(request.clientId)}</h4>
                            <p className="text-sm text-slate-600">{getClientEmail(request.clientId)}</p>
                            <p className="text-xs text-slate-500">
                              Sent {new Date(request.sentAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button
                              data-testid={`button-view-${request.id}`}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              data-testid={`button-resend-${request.id}`}
                              variant="outline"
                              size="sm"
                              onClick={() => resendRequestMutation.mutate(request.id)}
                              disabled={resendRequestMutation.isPending}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Resend
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pl-16">
                        <p className="text-sm text-slate-600">"{request.message}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No review requests found</h3>
                  <p className="text-slate-600 mb-6">
                    {statusFilter === "all" 
                      ? "Start collecting reviews by sending your first request."
                      : `No requests with "${statusFilter}" status found.`}
                  </p>
                  {statusFilter === "all" && (
                    <Button className="bg-primary-600 hover:bg-primary-700">
                      <Send className="w-4 h-4 mr-2" />
                      Send First Request
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
