import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart, LineChart, TrendingUp } from "lucide-react";

const Analytics = () => {
  const [currentView, setCurrentView] = useState('analytics');

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        currentView={currentView} 
        onMenuClick={(view) => setCurrentView(view)}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">วิเคราะห์ข้อมูล / Analytics</h1>
              <p className="text-muted-foreground">รายงานและการวิเคราะห์ข้อมูล</p>
            </div>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายรวม</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">เดือนนี้</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าใหม่</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">เดือนนี้</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราการซ่อมสำเร็จ</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">เดือนนี้</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ความพึงพอใจ</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/5</div>
            <p className="text-xs text-muted-foreground">คะแนนเฉลี่ย</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ระบบวิเคราะห์ข้อมูล</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">ระบบวิเคราะห์ข้อมูลกำลังพัฒนา</h3>
            <p className="text-muted-foreground">
              ระบบรายงานและการวิเคราะห์ข้อมูลจะพร้อมใช้งานเร็วๆ นี้
            </p>
          </div>
        </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Analytics;