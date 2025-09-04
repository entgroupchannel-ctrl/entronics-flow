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
  Globe
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
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "หน้าหลัก", url: "/", icon: Home },
  { title: "ลูกค้า", url: "/customers", icon: Users },
  { title: "ใบเสนอราคา", url: "/quotations", icon: FileText },
  { title: "ใบแจ้งหนี้", url: "/invoices", icon: Receipt },
  { title: "ใบกำกับภาษี", url: "/tax-invoices", icon: FileText },
  { title: "ใบเสร็จ", url: "/receipts", icon: Receipt },
];

const operationItems = [
  { title: "คลังสินค้า", url: "/inventory", icon: Package },
  { title: "จัดส่ง", url: "/delivery", icon: TruckIcon },
  { title: "บริการ", url: "/service-request", icon: Wrench },
  { title: "แดชบอร์ดบริการ", url: "/service-dashboard", icon: BarChart3 },
];

const financialItems = [
  { title: "การเงิน", url: "/financial", icon: DollarSign },
  { title: "บันทึกการชำระ", url: "/payment-records", icon: CreditCard },
  { title: "โอนเงินต่างประเทศ", url: "/international-transfer", icon: Globe },
];

const managementItems = [
  { title: "จัดการ Supplier", url: "/supplier-management", icon: Building2 },
  { title: "จัดการพนักงาน", url: "/staff-management", icon: Users },
];

const reportItems = [
  { title: "รายงาน", url: "/reports", icon: FileSpreadsheet },
  { title: "วิเคราะห์", url: "/analytics", icon: BarChart3 },
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
      <SidebarContent>
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations */}
        <SidebarGroup>
          <SidebarGroupLabel>การดำเนินงาน</SidebarGroupLabel>
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
          <SidebarGroupLabel>การเงิน</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financialItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>การจัดการ</SidebarGroupLabel>
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
          <SidebarGroupLabel>รายงาน</SidebarGroupLabel>
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