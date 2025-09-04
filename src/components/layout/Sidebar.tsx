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
  RefreshCw,
  Receipt,
  Building
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
    view: "dashboard"
  },
  {
    title: "เอกสารการขาย / Sale Docs",
    icon: FileText,
    href: "/quotations",
    view: "sales-documents",
    submenu: [
      {
        title: "ใบเสนอราคา",
        icon: FileText,
        href: "/quotations",
        view: "quotations"
      },
      {
        title: "ใบวางบิล/ใบแจ้งหนี้",
        icon: FileText,
        href: "/invoices",
        view: "invoices"
      },
      {
        title: "การชำระเงิน/ใบกำกับภาษี",
        icon: FileText,
        href: "/tax-invoices",
        view: "tax-invoices",
        submenu: [
          {
            title: "ใบส่งสินค้า/ใบกำกับภาษี",
            icon: FileText,
            href: "/tax-invoices",
            view: "tax-invoices"
          },
          {
            title: "การชำระเงิน",
            icon: CreditCard,
            href: "/payment-records",
            view: "payment-records"
          }
        ]
      },
      {
        title: "ใบเสร็จรับเงิน",
        icon: Receipt,
        href: "/receipts",
        view: "receipts"
      }
    ]
  },
  {
    title: "แจ้งซ่อม / Service Ticket",
    icon: Wrench,
    href: "/service-dashboard",
    view: "service"
  },
  {
    title: "ระบบจัดส่งสินค้า / Delivery",
    icon: Truck,
    href: "/delivery",
    view: "delivery"
  },
  {
    title: "รายชื่อลูกค้า / Customers",
    icon: Users,
    href: "/customers",
    view: "customers"
  },
  {
    title: "คลังสินค้า / Inventory",
    icon: Package,
    href: "/inventory",
    view: "inventory",
    submenu: [
      {
        title: "จัดการ Supplier",
        icon: Building,
        href: "/supplier-management",
        view: "supplier-management"
      }
    ]
  },
  {
    title: "การเงิน / Financial",
    icon: DollarSign,
    href: "/financial",
    view: "financial",
    submenu: [
      {
        title: "รายการรับเงิน",
        icon: CreditCard,
        href: "/payment-records",
        view: "payment-records"
      },
      {
        title: "โอนต่างประเทศ",
        icon: DollarSign,
        href: "/international-transfer",
        view: "international-transfer"
      }
    ]
  },
  {
    title: "วิเคราะห์ข้อมูล / Analytics",
    icon: BarChart3,
    href: "/analytics",
    view: "analytics"
  },
  {
    title: "รายงาน / Reports",
    icon: FileText,
    href: "/reports",
    view: "reports"
  },
  {
    title: "ตั้งค่า / Settings",
    icon: Settings,
    href: "/settings",
    view: "settings"
  }
];

export function Sidebar({ className, onMenuClick, currentView, onLogoClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false); // เปิดไซด์บาร์เป็นค่าเริ่มต้น
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    'sales-documents': true, // เปิดเมนูเอกสารการขายไว้เป็น default
    'tax-invoices': true, // เปิดเมนูใบส่งสินค้า/ใบกำกับภาษีไว้เป็น default
    'inventory': false // เปิดเมนูคลังสินค้าเมื่อมี submenu
  });
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
    // First check exact path match for precise routing
    if (currentPath === item.href) {
      return true;
    }
    
    // Fallback to view matching if provided
    if (currentView && currentView === item.view) {
      return true;
    }
    
    return false;
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
                ? "bg-sidebar-primary text-sidebar-primary-foreground border border-sidebar-primary" 
                : "text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent hover:border hover:border-sidebar-accent"
            )}
            onClick={() => handleMenuClick(item)}
          >
            <Icon className="mr-3 h-4 w-4" />
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
                ? "bg-sidebar-primary text-sidebar-primary-foreground border border-sidebar-primary" 
                : "text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent hover:border hover:border-sidebar-accent"
            )}
            onClick={() => handleMenuClick(item)}
          >
            <Icon className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2 bg-sidebar-primary text-sidebar-primary-foreground">
          <div>
            <p>{item.title}</p>
            {hasSubmenu && (
              <div className="mt-2 space-y-1">
                {item.submenu.map((subItem: any) => (
                  <p key={subItem.view} className="text-xs text-sidebar-primary-foreground/80">
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
          "flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Toggle Button */}
        <div className="flex h-16 items-center border-b border-sidebar-border">
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
              <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">ENT GROUP</h1>
                <p className="text-xs text-sidebar-foreground/70">Industrial PC ERP</p>
              </div>
            </div>
          )}
          
          {/* Logo E when collapsed */}
          {collapsed && (
            <div className="flex items-center justify-center flex-1">
              <button 
                onClick={onLogoClick}
                className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                title="ข้อมูลบริษัท"
              >
                <span className="text-xl font-bold text-sidebar-primary-foreground">E</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 bg-sidebar">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* User Info */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4 bg-sidebar">
            <button 
              onClick={onLogoClick}
              className="w-full hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
              title="ข้อมูลบริษัท"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                  <Users className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">admin@entgroup.com</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Collapsed user avatar */}
        {collapsed && (
          <div className="border-t border-sidebar-border p-2 bg-sidebar">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={onLogoClick}
                  className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center mx-auto cursor-pointer hover:scale-105 transition-transform"
                  title="ข้อมูลบริษัท"
                >
                  <Users className="h-5 w-5 text-sidebar-primary-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2 bg-sidebar-primary text-sidebar-primary-foreground">
                <p>Admin User</p>
                <p className="text-xs text-sidebar-primary-foreground/80">admin@entgroup.com</p>
                <p className="text-xs text-sidebar-primary-foreground/80 mt-1">คลิกเพื่อดูข้อมูลบริษัท</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}