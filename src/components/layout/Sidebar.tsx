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
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
  onMenuClick?: (view: string) => void;
  currentView?: string;
}

const menuItems = [
  {
    title: "แดชบอร์ด",
    icon: LayoutDashboard,
    href: "/",
    active: true
  },
  {
    title: "ขาย & ใบเสนอราคา",
    icon: ShoppingCart,
    href: "/sales"
  },
  {
    title: "บริการ & ซ่อม",
    icon: Wrench,
    href: "/service-dashboard"
  },
  {
    title: "จัดการซัพพลายเออร์",
    icon: Building2,
    href: "/suppliers"
  },
  {
    title: "รายชื่อลูกค้า",
    icon: Users,
    href: "/customers"
  },
  {
    title: "คลังสินค้า",
    icon: Package,
    href: "/inventory",
    active: false
  },
  {
    title: "การเงิน",
    icon: DollarSign,
    href: "/financial"
  },
  {
    title: "วิเคราะห์ข้อมูล",
    icon: BarChart3,
    href: "/analytics"
  },
  {
    title: "รายงาน",
    icon: FileText,
    href: "/reports"
  },
  {
    title: "ตั้งค่า",
    icon: Settings,
    href: "/settings"
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
          const isInventory = item.title === "คลังสินค้า";
          const isCustomers = item.title === "รายชื่อลูกค้า";
          const isService = item.title === "บริการ & ซ่อม";
          const isDashboard = item.title === "แดชบอร์ด";
          
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
                onClick={() => window.location.href = '/inventory'}
              >
                <Icon className="mr-3 h-4 w-4" />
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
                onClick={() => window.location.href = '/customers'}
              >
                <Icon className="mr-3 h-4 w-4" />
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
                <Icon className="mr-3 h-4 w-4" />
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
                <Icon className="mr-3 h-4 w-4" />
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
              <Icon className="mr-3 h-4 w-4" />
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