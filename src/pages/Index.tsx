import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuotationsDashboard } from "@/components/dashboard/QuotationsDashboard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TrendingUp, Clipboard, Wrench, Users } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ</h1>
          <p className="text-gray-600">ENTGROUP Overview</p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="ยอดขาย YoY"
            value="34.6%"
            description="เปรียบเทียบยอดขายปีนี้กับปีที่แล้ว"
            icon={TrendingUp}
            change="+34.6%"
            changeType="positive"
          />
          <MetricCard
            title="การดำเนินการด่วน"
            value="การดำเนินการ"
            description="จัดการด่วน"
            icon={Clipboard}
          />
          <MetricCard
            title="แจ้งซ่อมใหม่"
            value="จัดการงานซ่อม"
            description=""
            icon={Wrench}
          />
          <MetricCard
            title="จัดการลูกค้า"
            value="รายชื่อลูกค้า"
            description=""
            icon={Users}
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ยอดขาย YoY</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>สร้างใบเสนอราคา</CardTitle>
            </CardHeader>
            <CardContent>
              <QuotationsDashboard />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>ข่าวสารและการประกาศ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">การอัปเดตระบบ</h3>
                <p className="text-sm text-gray-600">ระบบจะมีการอัปเดตใหม่ในวันที่ 15 มี.ค. 2568</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold">ฟีเจอร์ใหม่</h3>
                <p className="text-sm text-gray-600">เพิ่มระบบรายงานขั้นสูงสำหรับการวิเคราะห์ข้อมูล</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;