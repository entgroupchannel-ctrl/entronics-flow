import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FileText, TrendingUp, CheckCircle, Clock, DollarSign, Target, Activity, Calendar, PieChart } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Cell, Pie, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';

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
  dailyTrend: Array<{
    date: string;
    quotations: number;
    amount: number;
    approved: number;
  }>;
  weeklyTrend: Array<{
    week: string;
    quotations: number;
    amount: number;
    approved: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyComparison: Array<{
    month: string;
    current: number;
    previous: number;
  }>;
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
    dailyTrend: [],
    weeklyTrend: [],
    statusDistribution: [],
    monthlyComparison: [],
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
        .select('total_amount, status, created_at')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      // Weekly metrics
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      
      const { data: weeklyQuotations } = await supabase
        .from('quotations')
        .select('total_amount, status, created_at')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      // Monthly metrics
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      const { data: monthlyQuotations } = await supabase
        .from('quotations')
        .select('total_amount, status, created_at')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      // Get daily trend for last 7 days
      const dailyTrendData = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const { data: dayQuotations } = await supabase
          .from('quotations')
          .select('total_amount, status')
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());

        dailyTrendData.push({
          date: format(date, 'MM/dd'),
          quotations: dayQuotations?.length || 0,
          amount: dayQuotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0,
          approved: dayQuotations?.filter(q => q.status === 'approved').length || 0,
        });
      }

      // Get weekly trend for last 4 weeks
      const weeklyTrendData = [];
      for (let i = 3; i >= 0; i--) {
        const weekDate = subWeeks(now, i);
        const wStart = startOfWeek(weekDate);
        const wEnd = endOfWeek(weekDate);
        
        const { data: weekQuotations } = await supabase
          .from('quotations')
          .select('total_amount, status')
          .gte('created_at', wStart.toISOString())
          .lte('created_at', wEnd.toISOString());

        weeklyTrendData.push({
          week: `สัปดาห์ ${i === 0 ? 'นี้' : i + 1}`,
          quotations: weekQuotations?.length || 0,
          amount: Math.round((weekQuotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0) / 1000),
          approved: weekQuotations?.filter(q => q.status === 'approved').length || 0,
        });
      }

      // Get status distribution
      const statusCounts = {
        draft: monthlyQuotations?.filter(q => q.status === 'draft').length || 0,
        sent: monthlyQuotations?.filter(q => q.status === 'sent').length || 0,
        approved: monthlyQuotations?.filter(q => q.status === 'approved').length || 0,
        rejected: monthlyQuotations?.filter(q => q.status === 'rejected').length || 0,
      };

      const statusDistribution = [
        { name: 'ร่าง', value: statusCounts.draft, color: '#94a3b8' },
        { name: 'ส่งแล้ว', value: statusCounts.sent, color: '#3b82f6' },
        { name: 'อนุมัติ', value: statusCounts.approved, color: '#10b981' },
        { name: 'ปฏิเสธ', value: statusCounts.rejected, color: '#ef4444' },
      ].filter(item => item.value > 0);

      // Monthly comparison (current month vs previous month)
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));
      
      const { data: prevMonthQuotations } = await supabase
        .from('quotations')
        .select('total_amount')
        .gte('created_at', prevMonthStart.toISOString())
        .lte('created_at', prevMonthEnd.toISOString());

      const monthlyComparison = [
        {
          month: 'เดือนก่อน',
          current: Math.round((prevMonthQuotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0) / 1000),
          previous: 0,
        },
        {
          month: 'เดือนนี้',
          current: Math.round((monthlyQuotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0) / 1000),
          previous: Math.round((prevMonthQuotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0) / 1000),
        }
      ];

      // Calculate basic metrics
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
        dailyTrend: dailyTrendData,
        weeklyTrend: weeklyTrendData,
        statusDistribution,
        monthlyComparison,
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

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6">
        {/* Daily Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              แนวโน้มรายวัน (7 วันล่าสุด)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name) => [
                    name === 'quotations' ? `${value} ใบ` : 
                    name === 'approved' ? `${value} ใบ` : 
                    formatCurrency(Number(value)),
                    name === 'quotations' ? 'จำนวนใบเสนอราคา' :
                    name === 'approved' ? 'อนุมัติแล้ว' :
                    'ยอดเงิน'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="quotations" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="approved" 
                  stackId="2"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              สัดส่วนสถานะ (เดือนนี้)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={metrics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} ใบ`, 'จำนวน']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => value}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6">
        {/* Weekly Trend Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              เปรียบเทียบรายสัปดาห์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name) => [
                    name === 'quotations' ? `${value} ใบ` : 
                    name === 'approved' ? `${value} ใบ` : 
                    `${value}K บาท`,
                    name === 'quotations' ? 'จำนวนใบเสนอราคา' :
                    name === 'approved' ? 'อนุมัติแล้ว' :
                    'ยอดเงิน (พัน)'
                  ]}
                />
                <Bar dataKey="quotations" fill="hsl(var(--primary))" />
                <Bar dataKey="approved" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              เปรียบเทียบรายเดือน (ยอดขาย)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value) => [`${value}K บาท`, 'ยอดขาย (พัน)']}
                />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}