import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  AlertTriangle
} from "lucide-react";

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Executive Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's what's happening at ENT GROUP today.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard
              title="Monthly Revenue"
              value="฿2,145,000"
              change="+12.5% from last month"
              changeType="positive"
              icon={DollarSign}
            />
            <MetricCard
              title="Sales Orders"
              value="156"
              change="+8.2% from last month"
              changeType="positive"
              icon={ShoppingCart}
            />
            <MetricCard
              title="Inventory Value"
              value="฿8,920,000"
              change="-2.1% from last month"
              changeType="negative"
              icon={Package}
            />
            <MetricCard
              title="Active Customers"
              value="1,247"
              change="+5.3% from last month"
              changeType="positive"
              icon={Users}
            />
          </div>

          {/* Charts and Analytics */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <SalesChart />
            <QuickActions />
          </div>

          {/* Activity and Alerts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentActivity />
            
            {/* System Alerts */}
            <div className="space-y-4">
              <MetricCard
                title="System Health"
                value="98.5%"
                description="All systems operational"
                icon={TrendingUp}
                className="border-success/20 bg-success/5"
              />
              <MetricCard
                title="Pending Approvals"
                value="7"
                description="Price requests awaiting approval"
                icon={AlertTriangle}
                className="border-warning/20 bg-warning/5"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
