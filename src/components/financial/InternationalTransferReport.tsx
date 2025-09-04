import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { th } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  FileBarChart
} from "lucide-react";

interface TransferSummary {
  totalAmount: number;
  totalCount: number;
  pendingAmount: number;
  pendingCount: number;
  approvedAmount: number;
  approvedCount: number;
  transferredAmount: number;
  transferredCount: number;
  rejectedAmount: number;
  rejectedCount: number;
}

export function InternationalTransferReport() {
  const [dateRange, setDateRange] = useState("thisMonth");
  const [status, setStatus] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Set default dates based on range
  useEffect(() => {
    const now = new Date();
    switch (dateRange) {
      case "thisMonth":
        setStartDate(format(startOfMonth(now), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
        break;
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        setStartDate(format(startOfMonth(lastMonth), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(lastMonth), "yyyy-MM-dd"));
        break;
      case "thisYear":
        setStartDate(format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd"));
        setEndDate(format(new Date(now.getFullYear(), 11, 31), "yyyy-MM-dd"));
        break;
      default:
        break;
    }
  }, [dateRange]);

  const { data: transferData, isLoading } = useQuery({
    queryKey: ["international-transfer-report", startDate, endDate, status, currency],
    queryFn: async () => {
      let query = supabase
        .from("international_transfer_requests")
        .select(`
          id,
          transfer_number,
          supplier_name,
          transfer_amount,
          currency,
          status,
          priority,
          requested_transfer_date,
          actual_transfer_date,
          created_at,
          requested_by
        `);

      if (startDate && endDate) {
        query = query
          .gte("created_at", startDate)
          .lte("created_at", endDate + "T23:59:59");
      }

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (currency !== "all") {
        query = query.eq("currency", currency);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      
      // Get profile data separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(req => req.requested_by).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name, username")
            .in("user_id", userIds);
          
          // Attach profile data to requests
          return data.map(request => ({
            ...request,
            profiles: profiles?.find(p => p.user_id === request.requested_by) || null
          }));
        }
      }
      
      return data || [];
    },
    enabled: !!startDate && !!endDate,
  });

  // Calculate summary statistics
  const summary: TransferSummary = transferData?.reduce(
    (acc, transfer) => {
      acc.totalAmount += transfer.transfer_amount || 0;
      acc.totalCount += 1;

      switch (transfer.status) {
        case "pending":
          acc.pendingAmount += transfer.transfer_amount || 0;
          acc.pendingCount += 1;
          break;
        case "approved":
          acc.approvedAmount += transfer.transfer_amount || 0;
          acc.approvedCount += 1;
          break;
        case "transferred":
          acc.transferredAmount += transfer.transfer_amount || 0;
          acc.transferredCount += 1;
          break;
        case "rejected":
          acc.rejectedAmount += transfer.transfer_amount || 0;
          acc.rejectedCount += 1;
          break;
      }

      return acc;
    },
    {
      totalAmount: 0,
      totalCount: 0,
      pendingAmount: 0,
      pendingCount: 0,
      approvedAmount: 0,
      approvedCount: 0,
      transferredAmount: 0,
      transferredCount: 0,
      rejectedAmount: 0,
      rejectedCount: 0,
    }
  ) || {
    totalAmount: 0,
    totalCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    approvedAmount: 0,
    approvedCount: 0,
    transferredAmount: 0,
    transferredCount: 0,
    rejectedAmount: 0,
    rejectedCount: 0,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "ร่าง", variant: "secondary" as const },
      pending: { label: "รออนุมัติ", variant: "default" as const },
      approved: { label: "อนุมัติแล้ว", variant: "default" as const },
      rejected: { label: "ถูกปฏิเสธ", variant: "destructive" as const },
      transferred: { label: "โอนแล้ว", variant: "default" as const },
      cancelled: { label: "ยกเลิก", variant: "secondary" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status, variant: "secondary" as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const exportToCSV = () => {
    if (!transferData?.length) return;

    const headers = [
      "เลขที่คำขอ",
      "Supplier",
      "จำนวนเงิน",
      "สกุลเงิน", 
      "สถานะ",
      "วันที่สร้าง",
      "วันที่โอน",
      "ผู้สร้าง"
    ];

    const csvData = transferData.map(transfer => [
      transfer.transfer_number,
      transfer.supplier_name,
      transfer.transfer_amount,
      transfer.currency,
      transfer.status,
      format(new Date(transfer.created_at), "dd/MM/yyyy"),
      transfer.actual_transfer_date ? format(new Date(transfer.actual_transfer_date), "dd/MM/yyyy") : "-",
      (transfer as any).profiles?.full_name || "ไม่ระบุ"
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `รายงานการโอนเงิน_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">รายงานการโอนเงินต่างประเทศ</h2>
          <p className="text-muted-foreground">
            รายงานสรุปและรายละเอียดการโอนเงิน
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={!transferData?.length}>
          <Download className="h-4 w-4 mr-2" />
          ส่งออก CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรอง</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>ช่วงเวลา</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">เดือนนี้</SelectItem>
                  <SelectItem value="lastMonth">เดือนที่แล้ว</SelectItem>
                  <SelectItem value="thisYear">ปีนี้</SelectItem>
                  <SelectItem value="custom">กำหนดเอง</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>สถานะ</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="draft">ร่าง</SelectItem>
                  <SelectItem value="pending">รออนุมัติ</SelectItem>
                  <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                  <SelectItem value="transferred">โอนแล้ว</SelectItem>
                  <SelectItem value="rejected">ถูกปฏิเสธ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>สกุลเงิน</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="CNY">CNY</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>วันที่เริ่มต้น</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>วันที่สิ้นสุด</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดรวมทั้งหมด</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalCount} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รออนุมัติ</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${summary.pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.pendingCount} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โอนแล้ว</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.transferredAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.transferredCount} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ถูกปฏิเสธ</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary.rejectedAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.rejectedCount} รายการ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดการโอนเงิน</CardTitle>
          <CardDescription>
            แสดงรายการโอนเงินตามเงื่อนไขที่เลือก
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">กำลังโหลดข้อมูล...</div>
          ) : transferData?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบข้อมูลการโอนเงิน
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เลขที่คำขอ</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>จำนวน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead>วันที่โอน</TableHead>
                    <TableHead>ผู้สร้าง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferData?.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">
                        {transfer.transfer_number}
                      </TableCell>
                      <TableCell>{transfer.supplier_name}</TableCell>
                      <TableCell>
                        {transfer.transfer_amount?.toLocaleString()} {transfer.currency}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transfer.status)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(transfer.created_at), "dd MMM yyyy", { locale: th })}
                      </TableCell>
                      <TableCell>
                        {transfer.actual_transfer_date 
                          ? format(new Date(transfer.actual_transfer_date), "dd MMM yyyy", { locale: th })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {(transfer as any).profiles?.full_name || "ไม่ระบุ"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}