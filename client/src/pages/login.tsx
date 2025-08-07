import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.signIn(email, password);
      
      if (rememberMe) {
        localStorage.setItem("auth_token", authService.getToken() || "");
      }
      
      toast({
        title: "Success",
        description: "Successfully signed in!",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.5) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgba(29, 78, 216, 0.5) 0%, transparent 50%)`
          }}
        />
        <div className="flex flex-col justify-center px-12 text-white relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">ReputaRank</h1>
            <p className="text-xl text-blue-100 mb-8">Transform client reviews into your competitive advantage</p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-3 text-green-300" />
              <span>Automated review collection</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-3 text-green-300" />
              <span>Professional testimonial display</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-3 text-green-300" />
              <span>Secure client management</span>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-blue-100">Client satisfaction</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">2.3x</div>
              <div className="text-sm text-blue-100">More referrals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-primary-600">ReputaRank</h1>
            <p className="text-slate-600">Real Estate Review Management</p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
                <p className="text-slate-600 mt-2">Sign in to your agent dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@realestate.com"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    data-testid="input-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                    />
                    <Label htmlFor="remember" className="text-sm text-slate-600">
                      Remember me
                    </Label>
                  </div>
                  <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  data-testid="button-sign-in"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                <p className="text-slate-600">
                  New to ReputaRank?{" "}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Create an account
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
