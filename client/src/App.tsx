import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ClientsPage from "@/pages/clients";
import RequestsPage from "@/pages/requests";
import TestimonialsPage from "@/pages/testimonials";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      {/* Protected routes with sidebar */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <DashboardPage />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/clients">
        <ProtectedRoute>
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <ClientsPage />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/requests">
        <ProtectedRoute>
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <RequestsPage />
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/testimonials">
        <ProtectedRoute>
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <TestimonialsPage />
          </div>
        </ProtectedRoute>
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/">
        <ProtectedRoute>
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <DashboardPage />
          </div>
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
