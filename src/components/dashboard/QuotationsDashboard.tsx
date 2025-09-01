import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FileText, TrendingUp, CheckCircle, Clock, DollarSign, Target, Activity } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface QuotationMetrics {
  todayOpened: number;
  todayAmount: number;
  todayApproved: number;
  approvalRate: number;
  weeklyOpened: number;
  weeklyAmount: number;
  monthlyOpened: number;
  monthlyAmount: number;
  avgQuotationValue: number;
}

interface QuotationsDashboardProps {
  className?: string;
}

export function QuotationsDashboard({ className }: QuotationsDashboardProps) {
  const [metrics, setMetrics] = useState<QuotationMetrics>({
    todayOpened: 0,
    todayAmount: 0,
    todayApproved: 0,
    approvalRate: 0,
    weeklyOpened: 0,
    weeklyAmount: 0,
    monthlyOpened: 0,
    monthlyAmount: 0,
    avgQuotationValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const now = new Date();
      
      // Today's metrics
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      
      const { data: todayQuotations } = await supabase
        .from('quotations')
        .select('total_amount, status')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      // Weekly metrics
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      
      const { data: weeklyQuotations } = await supabase
        .from('quotations')
        .select('total_amount, status')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      // Monthly metrics
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      const { data: monthlyQuotations } = await supabase
        .from('quotations')
        .select('total_amount, status')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      // Calculate metrics
      const todayOpened = todayQuotations?.length || 0;
      const todayAmount = todayQuotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0;
      const todayApproved = todayQuotations?.filter(q => q.status === 'approved').length || 0;
      
      const weeklyOpened = weeklyQuotations?.length || 0;
      const weeklyAmount = weeklyQuotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0;
      
      const monthlyOpened = monthlyQuotations?.length || 0;
      const monthlyAmount = monthlyQuotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0;
      
      const approvalRate = todayOpened > 0 ? (todayApproved / todayOpened) * 100 : 0;
      const avgQuotationValue = monthlyOpened > 0 ? monthlyAmount / monthlyOpened : 0;

      setMetrics({
        todayOpened,
        todayAmount,
        todayApproved,
        approvalRate,
        weeklyOpened,
        weeklyAmount,
        monthlyOpened,
        monthlyAmount,
        avgQuotationValue,
      });
    } catch (error) {
      console.error('Error loading quotation metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">รายงานใบเสนอราคาประจำวัน</h2>
        <p className="text-sm text-muted-foreground">
          ข้อมูล ณ วันที่ {format(new Date(), 'dd MMMM yyyy')}
        </p>
      </div>

      {/* Daily Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="เปิดใบเสนอราคาวันนี้"
          value={metrics.todayOpened}
          icon={FileText}
          description={`รวม ${metrics.todayOpened} ใบ`}
          change={metrics.todayOpened > 0 ? `+${metrics.todayOpened} ใบใหม่` : 'ยังไม่มีใบใหม่'}
          changeType={metrics.todayOpened > 0 ? 'positive' : 'neutral'}
        />
        
        <MetricCard
          title="ยอดเสนอราคาวันนี้"
          value={formatCurrency(metrics.todayAmount)}
          icon={DollarSign}
          description="ยอดรวมทั้งหมด"
          change={metrics.todayAmount > 0 ? `เฉลี่ย ${formatCurrency(metrics.todayAmount / Math.max(metrics.todayOpened, 1))} ต่อใบ` : 'ไม่มียอดขาย'}
          changeType={metrics.todayAmount > 0 ? 'positive' : 'neutral'}
        />
        
        <MetricCard
          title="อนุมัติวันนี้"
          value={metrics.todayApproved}
          icon={CheckCircle}
          description={`จาก ${metrics.todayOpened} ใบ`}
          change={`${metrics.approvalRate.toFixed(1)}% อัตราการอนุมัติ`}
          changeType={metrics.approvalRate > 50 ? 'positive' : metrics.approvalRate > 25 ? 'neutral' : 'negative'}
        />
        
        <MetricCard
          title="ค่าเฉลี่ยต่อใบ"
          value={formatCurrency(metrics.avgQuotationValue)}
          icon={TrendingUp}
          description="เฉลี่ยรายเดือน"
          change={`${metrics.monthlyOpened} ใบ เดือนนี้`}
          changeType="neutral"
        />
      </div>

      {/* Weekly & Monthly Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              สรุปสัปดาห์นี้
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">จำนวนใบ</span>
              <span className="font-medium">{metrics.weeklyOpened} ใบ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ยอดรวม</span>
              <span className="font-medium">{formatCurrency(metrics.weeklyAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">เฉลี่ยต่อวัน</span>
              <span className="font-medium">{(metrics.weeklyOpened / 7).toFixed(1)} ใบ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              สรุปเดือนนี้
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">จำนวนใบ</span>
              <span className="font-medium">{metrics.monthlyOpened} ใบ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ยอดรวม</span>
              <span className="font-medium">{formatCurrency(metrics.monthlyAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">เฉลี่ยต่อวัน</span>
              <span className="font-medium">{(metrics.monthlyOpened / 30).toFixed(1)} ใบ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              ข้อเสนอแนะ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {metrics.approvalRate > 70 ? (
              <p className="text-success">✅ อัตราการอนุมัติดีมาก!</p>
            ) : metrics.approvalRate > 40 ? (
              <p className="text-warning">⚠️ ควรปรับปรุงอัตราการอนุมัติ</p>
            ) : (
              <p className="text-destructive">❌ ต้องปรับปรุงกลยุทธ์การขาย</p>
            )}
            
            {metrics.avgQuotationValue > 50000 ? (
              <p className="text-success">💰 มูลค่าเฉลี่ยสูง</p>
            ) : (
              <p className="text-muted-foreground">📈 ลองเพิ่มสินค้า/บริการเสริม</p>
            )}
            
            {metrics.todayOpened === 0 && (
              <p className="text-warning">🎯 ยังไม่มีใบเสนอราคาวันนี้</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}