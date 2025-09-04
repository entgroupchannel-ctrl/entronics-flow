import { NavLink, useLocation } from "react-router-dom";
import { 
  Home,
  Users,
  FileText,
  Receipt,
  DollarSign,
  Package,
  TruckIcon,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Wrench,
  Building2,
  CreditCard,
  Globe,
  Calculator,
  PieChart,
  ChevronDown
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const mainItems = [
  { title: "แดชบอร์ด / Dashboard", url: "/", icon: Home },
];

const salesItems = [
  { title: "ใบเสนอราคา", url: "/quotations", icon: FileText },
  { title: "ใบสั่งสินค้า (PO)", url: "/purchase-orders", icon: Receipt },
  { title: "ใบวางบิล/ใบแจ้งหนี้", url: "/invoices", icon: Receipt },
  { title: "การชำระเงิน/ใบกำกับภาษี", url: "/tax-invoices", icon: Calculator },
  { title: "ใบส่งสินค้า/ใบกำกับภาษี", url: "/receipts", icon: Receipt },
  { title: "การชำระเงิน", url: "/payment-records", icon: CreditCard },
];

const operationItems = [
  { title: "แจ้งซ่อม / Service Ticket", url: "/service-request", icon: Wrench },
  { title: "ระบบจัดส่งสินค้า / Delivery", url: "/delivery", icon: TruckIcon },
  { title: "รายชื่อลูกค้า / Customers", url: "/customers", icon: Users },
  { title: "คลังสินค้า / Inventory", url: "/inventory", icon: Package },
];

const financialItems = [
  { title: "การเงิน / Financial", url: "/financial", icon: DollarSign },
  { title: "โอนเงินต่างประเทศ", url: "/international-transfer", icon: Globe },
];

const managementItems = [
  { title: "จัดการ Supplier", url: "/supplier-management", icon: Building2 },
  { title: "จัดการพนักงาน", url: "/staff-management", icon: Users },
];

const reportItems = [
  { title: "วิเคราะห์ข้อมูล / Analytics", url: "/analytics", icon: PieChart },
  { title: "รายงาน", url: "/reports", icon: FileSpreadsheet },
];

export function TopNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "text-black hover:bg-muted/50 hover:text-black font-medium";

  const MenuItem = ({ item }: { item: typeof mainItems[0] }) => (
    <NavLink to={item.url} end className={getNavCls}>
      <Button variant="ghost" className="h-auto p-2 font-medium">
        <item.icon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">{item.title}</span>
      </Button>
    </NavLink>
  );

  const DropdownMenuItemComponent = ({ item }: { item: typeof mainItems[0] }) => (
    <DropdownMenuItem asChild>
      <NavLink to={item.url} end className="flex items-center w-full p-2">
        <item.icon className="h-4 w-4 mr-2" />
        <span>{item.title}</span>
      </NavLink>
    </DropdownMenuItem>
  );

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-1">
            {/* Dashboard */}
            {mainItems.map((item) => (
              <MenuItem key={item.title} item={item} />
            ))}

            {/* Sales Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-medium">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">การขาย</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {salesItems.map((item) => (
                  <DropdownMenuItemComponent key={item.title} item={item} />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Operations Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-medium">
                  <Package className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">การดำเนินงาน</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {operationItems.map((item) => (
                  <DropdownMenuItemComponent key={item.title} item={item} />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Financial Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-medium">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">การเงิน</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {financialItems.map((item) => (
                  <DropdownMenuItemComponent key={item.title} item={item} />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Management Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-medium">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">การจัดการ</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {managementItems.map((item) => (
                  <DropdownMenuItemComponent key={item.title} item={item} />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reports Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-medium">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">รายงาน</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {reportItems.map((item) => (
                  <DropdownMenuItemComponent key={item.title} item={item} />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <MenuItem item={{ title: "ตั้งค่า", url: "/settings", icon: Settings }} />
          </div>

          {/* Company Name - moved to top right */}
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold">ENT GROUP</span>
            <span className="text-xs text-muted-foreground">Industrial PC ERP</span>
          </div>
        </div>
      </div>
    </nav>
  );
}