import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, AlertCircle, Shield } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

// ข้อมูลยอดขาย YoY comparison
const salesData = [
  { month: "ม.ค.", thisYear: 850000, lastYear: 650000 },
  { month: "ก.พ.", thisYear: 920000, lastYear: 780000 },
  { month: "มี.ค.", thisYear: 780000, lastYear: 720000 },
  { month: "เม.ย.", thisYear: 1200000, lastYear: 890000 },
  { month: "พ.ค.", thisYear: 1350000, lastYear: 940000 },
  { month: "มิ.ย.", thisYear: 1150000, lastYear: 760000 },
  { month: "ก.ค.", thisYear: 1420000, lastYear: 850000 },
  { month: "ส.ค.", thisYear: 1280000, lastYear: 920000 },
  { month: "ก.ย.", thisYear: 1450000, lastYear: 1100000 },
  { month: "ต.ค.", thisYear: 1650000, lastYear: 1250000 },
  { month: "พ.ย.", thisYear: 1520000, lastYear: 1180000 },
  { month: "ธ.ค.", thisYear: 1890000, lastYear: 1450000 },
];

// คำนวณการเติบโต
const currentYearTotal = salesData.reduce((sum, item) => sum + item.thisYear, 0);
const lastYearTotal = salesData.reduce((sum, item) => sum + item.lastYear, 0);
const growthRate = ((currentYearTotal - lastYearTotal) / lastYearTotal * 100).toFixed(1);
const isPositiveGrowth = parseFloat(growthRate) > 0;

export function SalesChart() {
  const { canManageInventory } = useUserRole();

  // ตรวจสอบสิทธิ์การเข้าถึงข้อมูลยอดขาย
  if (!canManageInventory()) {
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                ยอดขาย YoY
              </CardTitle>
              <CardDescription className="text-sm">
                ข้อมูลสำหรับผู้บริหารเท่านั้น
              </CardDescription>
            </div>
            <Badge variant="secondary">จำกัดการเข้าถึง</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-center h-64 text-muted-foreground bg-muted/30 rounded-lg">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold mb-2">ข้อมูลถูกจำกัดการเข้าถึง</h3>
              <p className="text-sm mb-1">ข้อมูลยอดขายเป็นความลับทางธุรกิจ</p>
              <p className="text-xs">เฉพาะผู้ที่มีสิทธิ์ admin หรือ accountant เท่านั้น</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">ยอดขาย YoY</CardTitle>
            <CardDescription className="text-sm">
              เปรียบเทียบยอดขายปีนี้กับปีที่แล้ว
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 text-sm font-medium ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveGrowth ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {growthRate}%
            </div>
            <div className="text-xs text-muted-foreground">การเติบโต</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="thisYear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="lastYear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
            <XAxis 
              dataKey="month" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              domain={['dataMin * 0.8', 'dataMax * 1.1']}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `฿${value.toLocaleString()}`, 
                name === 'thisYear' ? '2568' : '2567'
              ]}
              labelFormatter={(label) => `เดือน ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area 
              type="monotone" 
              dataKey="lastYear" 
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth={2}
              fill="url(#lastYear)" 
              strokeDasharray="5 5"
            />
            <Area 
              type="monotone" 
              dataKey="thisYear" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fill="url(#thisYear)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* สรุปยอดขายรวม */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              ฿{(currentYearTotal / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-muted-foreground">2568 (ปีนี้)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-muted-foreground">
              ฿{(lastYearTotal / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-muted-foreground">2567 (ปีที่แล้ว)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}