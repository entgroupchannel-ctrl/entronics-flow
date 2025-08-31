import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const salesData = [
  { month: "Jan", sales: 65000, target: 60000 },
  { month: "Feb", sales: 78000, target: 70000 },
  { month: "Mar", sales: 52000, target: 65000 },
  { month: "Apr", sales: 89000, target: 75000 },
  { month: "May", sales: 94000, target: 80000 },
  { month: "Jun", sales: 76000, target: 85000 },
];

export function SalesChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Sales Performance</CardTitle>
        <CardDescription>
          Monthly sales vs targets (THB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="month" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
              tickFormatter={(value) => `${value / 1000}K`}
            />
            <Tooltip 
              formatter={(value: number) => [`₿${value.toLocaleString()}`, ""]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}