import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
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
  Menu,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    view: "dashboard",
    iconColor: "text-blue-500"
  },
  {
    title: "ใบเสนอราคา / Quotation",
    icon: FileText,
    href: "/quotations",
    view: "quotations",
    iconColor: "text-green-500"
  },
  {
    title: "แจ้งซ่อม / Service Ticket",
    icon: Wrench,
    href: "/service-dashboard",
    view: "service",
    iconColor: "text-orange-500"
  },
  {
    title: "รายชื่อลูกค้า / Customers",
    icon: Users,
    href: "/customers",
    view: "customers",
    iconColor: "text-purple-500"
  },
  {
    title: "คลังสินค้า / Inventory",
    icon: Package,
    href: "/inventory",
    view: "inventory",
    iconColor: "text-cyan-500"
  },
  {
    title: "การเงิน / Financial",
    icon: DollarSign,
    href: "/financial",
    view: "financial",
    iconColor: "text-yellow-500"
  },
  {
    title: "วิเคราะห์ข้อมูล / Analytics",
    icon: BarChart3,
    href: "/analytics",
    view: "analytics",
    iconColor: "text-indigo-500"
  },
  {
    title: "รายงาน / Reports",
    icon: FileText,
    href: "/reports",
    view: "reports",
    iconColor: "text-teal-500"
  },
  {
    title: "ตั้งค่า / Settings",
    icon: Settings,
    href: "/settings",
    view: "settings",
    iconColor: "text-gray-500"
  }
];

export function Sidebar({ className, onMenuClick, currentView }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true); // เริ่มต้นให้หุบแล้ว
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (onMenuClick && item.view) {
      onMenuClick(item.view);
    } else {
      navigate(item.href);
    }
  };

  const isActive = (item: typeof menuItems[0]) => {
    if (currentView) {
      return currentView === item.view;
    }
    return currentPath === item.href;
  };

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "flex h-full flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Toggle Button */}
        <div className="flex h-16 items-center border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          
          {!collapsed && (
            <div className="flex items-center space-x-2 ml-2">
              <div className="h-8 w-8 rounded bg-gradient-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">ENT GROUP</h1>
                <p className="text-xs text-muted-foreground">Industrial PC ERP</p>
              </div>
            </div>
          )}
          
          {/* Logo E when collapsed */}
          {collapsed && (
            <div className="flex items-center justify-center flex-1">
              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-xl font-bold text-red-500">E</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            if (!collapsed) {
              // Expanded view
              return (
                <Button
                  key={item.href}
                  variant={active ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 px-3",
                    active 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  onClick={() => handleMenuClick(item)}
                >
                  <Icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
                  <span className="text-sm">{item.title}</span>
                </Button>
              );
            }

            // Collapsed view - only icons with tooltips
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "w-12 h-12 mx-auto",
                      active 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    onClick={() => handleMenuClick(item)}
                  >
                    <Icon className={cn("h-5 w-5", item.iconColor)} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User Info */}
        {!collapsed && (
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
        )}

        {/* Collapsed user avatar */}
        {collapsed && (
          <div className="border-t border-border p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center mx-auto cursor-pointer">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <p>Admin User</p>
                <p className="text-xs text-muted-foreground">admin@entgroup.com</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}