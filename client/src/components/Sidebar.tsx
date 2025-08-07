import { Link, useLocation } from "wouter";
import { Users, BarChart3, Send, Star, LogOut } from "lucide-react";
import { authService } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();

  const user = authService.getCurrentUser();

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!authService.getToken(),
  });

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setLocation("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      current: location === "/dashboard",
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Users,
      current: location === "/clients",
      count: stats?.totalClients,
    },
    {
      name: "Review Requests",
      href: "/requests",
      icon: Send,
      current: location === "/requests",
      count: stats?.pendingRequests,
      countColor: "bg-amber-100 text-amber-600",
    },
    {
      name: "Testimonials",
      href: "/testimonials",
      icon: Star,
      current: location === "/testimonials",
      count: stats?.reviewsReceived,
      countColor: "bg-success-100 text-success-600",
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-slate-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">ReputaRank</h1>
          <p className="text-sm text-slate-600">Agent Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                  {item.count !== undefined && (
                    <span
                      className={`ml-auto text-xs px-2 py-1 rounded-full ${
                        item.countColor || "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-900">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500">Real Estate Agent</p>
            </div>
            <button
              data-testid="button-logout"
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
