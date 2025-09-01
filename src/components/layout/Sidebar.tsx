import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Wrench, 
  DollarSign,
  Settings,
  Building2,
  BarChart3,
  FileText,
  Bell,
 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
  onMenuClick?: (view: string) => void;
  currentView?: string;
}


const menuItems = [
  {
    title: "แดชบอร์ด / Dashboard",
    icon: LayoutDashboard,
    href: "/",
    active: true,
    iconColor: "text-blue-500"
  },
  {
    title: "ใบเสนอราคา / Quotation",
    icon: FileText,
    href: "/quotations",
    iconColor: "text-green-500"
  },
  {
    title: "แจ้งซ่อม / Service Ticket",
    icon: Wrench,
    href: "/service-dashboard",
    iconColor: "text-orange-500"
  },
  {
    title: "รายชื่อลูกค้า / Customers",
    icon: Users,
    href: "/customers",
    iconColor: "text-purple-500"
  },
  {
    title: "คลังสินค้า / Inventory",
    icon: Package,
    href: "/inventory",
    active: false,
    iconColor: "text-cyan-500"
  },
  {
    title: "การเงิน / Financial",
    icon: DollarSign,
    href: "/financial",
    iconColor: "text-yellow-500"
  },
  {
    title: "วิเคราะห์ข้อมูล / Analytics",
    icon: BarChart3,
    href: "/analytics",
    iconColor: "text-indigo-500"
  },
  {
    title: "รายงาน / Reports",
    icon: FileText,
    href: "/reports",
    iconColor: "text-teal-500"
  },
  {
    title: "ตั้งค่า / Settings",
    icon: Settings,
    href: "/settings",
    iconColor: "text-gray-500"
  }
];

export function Sidebar({ className, onMenuClick, currentView }: SidebarProps) {
  return (
    <div className={cn("flex h-full w-64 flex-col bg-card border-r border-border", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-gradient-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">ENT GROUP</h1>
            <p className="text-xs text-muted-foreground">Industrial PC ERP</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isInventory = item.title.includes("คลังสินค้า");
          const isCustomers = item.title.includes("รายชื่อลูกค้า");
          const isQuotations = item.title.includes("ใบเสนอราคา");
          const isService = item.title.includes("แจ้งซ่อม");
          const isDashboard = item.title.includes("แดชบอร์ด");
          const isSettings = item.title.includes("ตั้งค่า");
          
          const isActive = (isDashboard && currentView === 'dashboard') || 
                          (isService && currentView === 'service') ||
                          (!isDashboard && !isService && item.active);
          
          if (isInventory) {
            return (
              <Button
                key={item.href}
                variant={item.active ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  item.active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => {
                  // Use React Router navigation instead of page reload
                  if (onMenuClick) {
                    onMenuClick('inventory');
                  } else {
                    window.location.href = '/inventory';
                  }
                }}
              >
                <Icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
                {item.title}
              </Button>
            );
          }
          
          if (isCustomers) {
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  item.active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => {
                  // Use React Router navigation instead of page reload  
                  if (onMenuClick) {
                    onMenuClick('customers');
                  } else {
                    window.location.href = '/customers';
                  }
                }}
              >
                <Icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
                {item.title}
              </Button>
            );
          }

          if (isQuotations) {
            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3",
                  "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => {
                  // Use React Router navigation instead of page reload
                  if (onMenuClick) {
                    onMenuClick('quotations');
                  } else {
                    window.location.href = '/quotations';
                  }
                }}
              >
                <Icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
                {item.title}
              </Button>
            );
          }

          if (isService) {
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => onMenuClick?.('service')}
              >
                <Icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
                {item.title}
              </Button>
            );
          }

          if (isDashboard) {
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => onMenuClick?.('dashboard')}
              >
                <Icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
                {item.title}
              </Button>
            );
          }

          
          if (isSettings) {
            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3",
                  "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => {
                  // Use React Router navigation instead of page reload
                  if (onMenuClick) {
                    onMenuClick('settings');
                  } else {
                    window.location.href = '/settings';
                  }
                }}
              >
                <Icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
                {item.title}
              </Button>
            );
          }

          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start h-10 px-3",
                "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              >
                <Icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
                {item.title}
              </Button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@entgroup.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}