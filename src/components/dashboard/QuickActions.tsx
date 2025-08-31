import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  Package, 
  Users, 
  ShoppingCart,
  Wrench
} from "lucide-react";

const quickActions = [
  {
    title: "New Quotation",
    icon: FileText,
    description: "Create a new sales quotation",
    variant: "default" as const
  },
  {
    title: "Add Product",
    icon: Package,
    description: "Add new product to inventory",
    variant: "secondary" as const
  },
  {
    title: "New Customer",
    icon: Users,
    description: "Register new customer",
    variant: "secondary" as const
  },
  {
    title: "Service Ticket",
    icon: Wrench,
    description: "Create service request",
    variant: "secondary" as const
  }
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant={action.variant}
              className="w-full justify-start h-auto p-4"
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm opacity-70">{action.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}