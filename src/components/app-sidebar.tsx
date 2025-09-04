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
  PieChart
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "แดชบอร์ด / Dashboard", url: "/", icon: Home },
];

const salesItems = [
  { title: "เอกสารการขาย / Sale Docs", url: "/quotations", icon: FileText },
  { title: "ใบเสนอราคา", url: "/quotations", icon: FileText },
  { title: "ใบวางบิล/ใบแจ้งหนี้", url: "/invoices", icon: Receipt },
  { title: "การชำระเงิน/ใบกำกับภาษี", url: "/tax-invoices", icon: Calculator },
  { title: "ใบส่งสินค้า/ใบกำกับภาษี", url: "/receipts", icon: Receipt },
  { title: "การชำระเงิน", url: "/payment-records", icon: CreditCard },
];

const operationItems = [
  { title: "ใบเสร็จรับเงิน", url: "/receipts", icon: Receipt },
  { title: "แจ้งซ่อม / Service Ticket", url: "/service-request", icon: Wrench },
  { title: "ระบบจัดส่งสินค้า / Delivery", url: "/delivery", icon: TruckIcon },
  { title: "รายชื่อลูกค้า / Customers", url: "/customers", icon: Users },
  { title: "คลังสินค้า / Inventory", url: "/inventory", icon: Package },
];

const financialItems = [
  { title: "การเงิน / Financial", url: "/financial", icon: DollarSign },
  { title: "วิเคราะห์ข้อมูล / Analytics", url: "/analytics", icon: PieChart },
];

const managementItems = [
  { title: "จัดการ Supplier", url: "/supplier-management", icon: Building2 },
  { title: "จัดการพนักงาน", url: "/staff-management", icon: Users },
];

const reportItems = [
  { title: "รายงาน", url: "/reports", icon: FileSpreadsheet },
  { title: "เอกสารขาย", url: "/sales-documents", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  const MenuItem = ({ item }: { item: typeof mainItems[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink to={item.url} end className={getNavCls}>
          <item.icon className="h-4 w-4" />
          {state !== "collapsed" && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">ENT GROUP</span>
              <span className="text-xs text-muted-foreground">Industrial PC ERP</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {/* Main Dashboard */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            การดำเนินงาน
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sales Documents */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {salesItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Financial */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {financialItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
              <MenuItem item={{ title: "โอนเงินต่างประเทศ", url: "/international-transfer", icon: Globe }} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            การจัดการ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Reports */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            รายงาน
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuItem item={{ title: "ตั้งค่า", url: "/settings", icon: Settings }} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}