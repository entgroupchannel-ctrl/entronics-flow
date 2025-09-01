import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Wrench, 
  Truck,
  DollarSign,
  Settings,
  Building2,
  BarChart3,
  FileText,
  Bell,
  Menu,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CreditCard,
  RefreshCw
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
  onLogoClick?: () => void;
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
    iconColor: "text-green-500",
    submenu: [
      {
        title: "ใบวางบิล/ใบแจ้งหนี้",
        icon: FileText,
        href: "/invoices",
        view: "invoices",
        iconColor: "text-blue-500",
        submenu: [
          {
            title: "สร้างใบวางบิล/ใบแจ้งหนี้",
            icon: FileText,
            href: "/invoices/create",
            view: "create-invoice",
            iconColor: "text-blue-500"
          },
          {
            title: "มัดจำใบวางบิล/ใบแจ้งหนี้",
            icon: CreditCard,
            href: "/invoices/downpayment",
            view: "downpayment-invoice",
            iconColor: "text-purple-500"
          },
          {
            title: "แบ่งจ่ายใบวางบิล/ใบแจ้งหนี้",
            icon: RefreshCw,
            href: "/invoices/split-payment",
            view: "split-payment-invoice",
            iconColor: "text-orange-500"
          }
        ]
      }
    ]
  },
  {
    title: "แจ้งซ่อม / Service Ticket",
    icon: Wrench,
    href: "/service-dashboard",
    view: "service",
    iconColor: "text-orange-500"
  },
  {
    title: "ระบบจัดส่งสินค้า / Delivery",
    icon: Truck,
    href: "/delivery",
    view: "delivery",
    iconColor: "text-blue-600"
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

export function Sidebar({ className, onMenuClick, currentView, onLogoClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true); // เริ่มต้นให้หุบแล้ว
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleMenuClick = (item: any) => {
    // If item has submenu, toggle it instead of navigating
    if (item.submenu && !collapsed) {
      toggleMenu(item.view);
      return;
    }
    
    // Always use navigate for consistent behavior
    navigate(item.href);
    
    // Also call onMenuClick if provided (for legacy support)
    if (onMenuClick && item.view) {
      onMenuClick(item.view);
    }
  };

  const isActive = (item: any) => {
    if (currentView) {
      return currentView === item.view;
    }
    return currentPath === item.href;
  };

  const renderMenuItem = (item: any, level = 0) => {
    const Icon = item.icon;
    const active = isActive(item);
    const isExpanded = expandedMenus[item.view];
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    
    if (!collapsed) {
      // Expanded view
      return (
        <div key={item.href}>
          <Button
            variant={active ? "default" : "ghost"}
            className={cn(
              "w-full justify-start h-10 px-3",
              level > 0 && "ml-4 w-[calc(100%-1rem)]",
              level > 1 && "ml-8 w-[calc(100%-2rem)]",
              active 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            onClick={() => handleMenuClick(item)}
          >
            <Icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
            <span className="text-sm flex-1 text-left">{item.title}</span>
            {hasSubmenu && (
              isExpanded ? 
                <ChevronDown className="h-4 w-4 ml-2" /> : 
                <ChevronRight className="h-4 w-4 ml-2" />
            )}
          </Button>
          
          {hasSubmenu && isExpanded && (
            <div className="mt-1 space-y-1">
              {item.submenu.map((subItem: any) => renderMenuItem(subItem, level + 1))}
            </div>
          )}
        </div>
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
          <div>
            <p>{item.title}</p>
            {hasSubmenu && (
              <div className="mt-2 space-y-1">
                {item.submenu.map((subItem: any) => (
                  <p key={subItem.view} className="text-xs text-muted-foreground">
                    • {subItem.title}
                  </p>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
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
              <button 
                onClick={onLogoClick}
                className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                title="ข้อมูลบริษัท"
              >
                <span className="text-xl font-bold text-red-500">E</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* User Info */}
        {!collapsed && (
          <div className="border-t border-border p-4">
            <button 
              onClick={onLogoClick}
              className="w-full hover:bg-accent/50 rounded-lg p-2 transition-colors"
              title="ข้อมูลบริษัท"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                  <p className="text-xs text-muted-foreground truncate">admin@entgroup.com</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Collapsed user avatar */}
        {collapsed && (
          <div className="border-t border-border p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={onLogoClick}
                  className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center mx-auto cursor-pointer hover:scale-105 transition-transform"
                  title="ข้อมูลบริษัท"
                >
                  <Users className="h-5 w-5 text-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <p>Admin User</p>
                <p className="text-xs text-muted-foreground">admin@entgroup.com</p>
                <p className="text-xs text-muted-foreground mt-1">คลิกเพื่อดูข้อมูลบริษัท</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}