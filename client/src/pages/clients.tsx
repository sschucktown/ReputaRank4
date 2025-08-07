import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Send } from "lucide-react";
import Header from "@/components/Header";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertClientSchema } from "@shared/schema";
import { z } from "zod";

const clientFormSchema = insertClientSchema.extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface AddClientFormProps {
  onSuccess: () => void;
}

export function AddClientForm({ onSuccess }: AddClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone: "",
    clientType: "buyer",
    propertyType: "single-family",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const token = authService.getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Client added successfully!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add client",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = clientFormSchema.parse(formData);
      setErrors({});
      createClientMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          data-testid="input-client-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          data-testid="input-client-email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          data-testid="input-client-phone"
          value={formData.phone || ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="clientType">Client Type</Label>
        <Select
          value={formData.clientType}
          onValueChange={(value) => setFormData({ ...formData, clientType: value })}
        >
          <SelectTrigger data-testid="select-client-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="propertyType">Property Type</Label>
        <Select
          value={formData.propertyType}
          onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
        >
          <SelectTrigger data-testid="select-property-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single-family">Single Family Home</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
            <SelectItem value="multi-family">Multi-Family</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          data-testid="button-submit-client"
          disabled={createClientMutation.isPending}
          className="flex-1 bg-primary-600 hover:bg-primary-700"
        >
          {createClientMutation.isPending ? "Adding..." : "Add Client"}
        </Button>
      </div>
    </form>
  );
}

export default function ClientsPage() {
  const [showAddClient, setShowAddClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients, isLoading } = useQuery<Array<{
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

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-success-100 text-success-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "buyer":
        return "bg-green-100 text-green-800";
      case "seller":
        return "bg-purple-100 text-purple-800";
      case "both":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="ml-64 flex-1">
        <Header title="Clients" subtitle="Manage your client relationships" />
        <main className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-200 rounded-xl h-64"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ml-64 flex-1">
      <Header title="Clients" subtitle="Manage your client relationships" />
      
      <main className="p-6">
        <div className="space-y-6">
          {/* Header with Search and Add Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  data-testid="input-search-clients"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
            <Button
              data-testid="button-add-client"
              onClick={() => setShowAddClient(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>

          {/* Clients Grid */}
          {filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client: any) => (
                <Card key={client.id} data-testid={`card-client-${client.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {client.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-slate-900">{client.name}</h3>
                          <p className="text-sm text-slate-600">{client.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Type:</span>
                        <Badge className={getTypeColor(client.clientType)}>
                          {client.clientType}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Property:</span>
                        <span className="text-sm text-slate-900">{client.propertyType}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Status:</span>
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                      </div>
                      
                      {client.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Phone:</span>
                          <span className="text-sm text-slate-900">{client.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-6">
                      <Button
                        data-testid={`button-edit-${client.id}`}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        data-testid={`button-request-review-${client.id}`}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Request Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No clients found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm ? "No clients match your search." : "Get started by adding your first client."}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setShowAddClient(true)}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Client
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
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
