import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, DollarSign, Calendar, Building2 } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  supplier_country?: string;
  supplier_currency?: string;
}

interface SupplierPaymentHistoryProps {
  suppliers: Supplier[];
  onRefresh: () => void;
}

export function SupplierPaymentHistory({
  suppliers,
  onRefresh,
}: SupplierPaymentHistoryProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: paymentHistory, isLoading } = useQuery({
    queryKey: ["supplier-payment-history", selectedSupplier, searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("supplier_payment_history")
        .select(`
          *,
          supplier:supplier_id(name, supplier_country, supplier_currency),
          transfer_request:transfer_request_id(transfer_number, currency),
          created_by_profile:created_by(full_name)
        `)
        .order("payment_date", { ascending: false });

      if (selectedSupplier !== "all") {
        query = query.eq("supplier_id", selectedSupplier);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching payment history:", error);
        return [];
      }

      return data || [];
    },
  });

  const { data: transferRequests } = useQuery({
    queryKey: ["international-transfer-requests-for-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("international_transfer_requests")
        .select("id, transfer_number, supplier_name, transfer_amount, currency, status")
        .eq("status", "transferred");
      
      if (error) {
        console.error("Error fetching transfer requests:", error);
        return [];
      }
      return data || [];
    },
  });

  // Filter payment history based on search term
  const filteredPayments = paymentHistory?.filter((payment) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.reference_number?.toLowerCase().includes(searchLower) ||
      payment.supplier?.name?.toLowerCase().includes(searchLower) ||
      payment.transfer_request?.transfer_number?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Calculate statistics
  const stats = filteredPayments.reduce((acc, payment) => {
    acc.totalPayments += 1;
    acc.totalAmount += payment.amount || 0;
    acc.totalThbAmount += payment.thb_amount || 0;
    
    if (payment.status === "completed") {
      acc.completedPayments += 1;
    }
    
    return acc;
  }, {
    totalPayments: 0,
    totalAmount: 0,
    totalThbAmount: 0,
    completedPayments: 0,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "เสร็จสิ้น", variant: "default" as const },
      pending: { label: "รอดำเนินการ", variant: "secondary" as const },
      failed: { label: "ล้มเหลว", variant: "destructive" as const },
      cancelled: { label: "ยกเลิก", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status, variant: "secondary" as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การจ่ายทั้งหมด</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เสร็จสิ้นแล้ว</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่ารวม (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              ${stats.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่ารวม (THB)</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">
              ฿{stats.totalThbAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรองประวัติการจ่ายเงิน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="เลือก Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Supplier ทั้งหมด</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="ค้นหาเลขอ้างอิง, Supplier หรือเลข Transfer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="failed">ล้มเหลว</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการจ่ายเงิน</CardTitle>
          <CardDescription>
            {filteredPayments.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              กำลังโหลด...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบประวัติการจ่ายเงิน
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่จ่าย</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>เลขอ้างอิง</TableHead>
                    <TableHead>จำนวนเงิน</TableHead>
                    <TableHead>อัตราแลกเปลี่ยน</TableHead>
                    <TableHead>เทียบเท่าบาท</TableHead>
                    <TableHead>วิธีจ่าย</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>Transfer Request</TableHead>
                    <TableHead>ผู้บันทึก</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: th })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.supplier?.name || "ไม่ระบุ"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.supplier?.supplier_country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {payment.reference_number || "ไม่ระบุ"}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {payment.amount?.toLocaleString()} {payment.currency}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.exchange_rate ? (
                          <div className="text-sm">
                            1 {payment.currency} = {payment.exchange_rate} THB
                          </div>
                        ) : (
                          <span className="text-muted-foreground">ไม่ระบุ</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ฿{payment.thb_amount?.toLocaleString() || "ไม่ระบุ"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.payment_method || "ไม่ระบุ"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        {payment.transfer_request?.transfer_number ? (
                          <Badge variant="secondary">
                            {payment.transfer_request.transfer_number}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">ไม่เชื่อมโยง</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          ผู้บันทึก
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(payment.created_at), "dd MMM yyyy HH:mm", { locale: th })}
                        </div>
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