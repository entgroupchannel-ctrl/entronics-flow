import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  Wrench, 
  DollarSign,
  Clock
} from "lucide-react";

const activities = [
  {
    id: 1,
    type: "sale",
    icon: ShoppingCart,
    title: "New order from ABC Manufacturing",
    description: "Industrial PC Kit - ฿45,000",
    time: "2 minutes ago",
    status: "success"
  },
  {
    id: 2,
    type: "inventory",
    icon: Package,
    title: "Low stock alert",
    description: "Motherboard MSI-H610 - 5 units remaining",
    time: "15 minutes ago",
    status: "warning"
  },
  {
    id: 3,
    type: "service",
    icon: Wrench,
    title: "Service ticket completed",
    description: "Repair work for XYZ Company",
    time: "1 hour ago",
    status: "success"
  },
  {
    id: 4,
    type: "payment",
    icon: DollarSign,
    title: "Payment received",
    description: "Invoice #INV-2024-001 - ฿78,500",
    time: "2 hours ago",
    status: "success"
  }
];

const statusColors = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20"
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${statusColors[activity.status as keyof typeof statusColors]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}