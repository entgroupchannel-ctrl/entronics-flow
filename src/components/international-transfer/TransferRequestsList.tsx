import { useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MoreHorizontal, Eye, Edit, Trash2, Download, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransferRequest {
  id: string;
  transfer_number: string;
  supplier_name: string;
  transfer_amount: number;
  currency: string;
  status: string;
  priority: string;
  requested_transfer_date: string;
  created_at: string;
  supplier?: { name: string; bank_name: string; bank_account: string };
  customer?: { name: string };
  requested_by_profile?: { full_name: string };
}

interface TransferRequestsListProps {
  requests: TransferRequest[];
  isLoading: boolean;
  onEdit: (request: TransferRequest) => void;
  onRefresh: () => void;
}

export function TransferRequestsList({
  requests,
  isLoading,
  onEdit,
  onRefresh,
}: TransferRequestsListProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Filter requests based on search and filters
  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.transfer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: "ต่ำ", variant: "secondary" as const },
      normal: { label: "ปกติ", variant: "outline" as const },
      high: { label: "สูง", variant: "default" as const },
      urgent: { label: "เร่งด่วน", variant: "destructive" as const },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || 
      { label: priority, variant: "outline" as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from("international_transfer_requests")
        .delete()
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "ลบคำขอโอนเงินเรียบร้อยแล้ว",
      });

      onRefresh();
    } catch (error: any) {
      console.error("Error deleting transfer request:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถลบคำขอโอนเงินได้",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleStatusUpdate = async (request: TransferRequest, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("international_transfer_requests")
        .update({ status: newStatus })
        .eq("id", request.id);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: `อัปเดตสถานะเป็น ${getStatusLabel(newStatus)} เรียบร้อยแล้ว`,
      });

      onRefresh();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: "ร่าง",
      pending: "รออนุมัติ",
      approved: "อนุมัติแล้ว",
      rejected: "ถูกปฏิเสธ",
      transferred: "โอนแล้ว",
      cancelled: "ยกเลิก",
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">กำลังโหลด...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="ค้นหาเลขที่คำขอหรือชื่อ Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="draft">ร่าง</SelectItem>
                <SelectItem value="pending">รออนุมัติ</SelectItem>
                <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                <SelectItem value="rejected">ถูกปฏิเสธ</SelectItem>
                <SelectItem value="transferred">โอนแล้ว</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ความสำคัญ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ความสำคัญทั้งหมด</SelectItem>
                <SelectItem value="low">ต่ำ</SelectItem>
                <SelectItem value="normal">ปกติ</SelectItem>
                <SelectItem value="high">สูง</SelectItem>
                <SelectItem value="urgent">เร่งด่วน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการคำขอโอนเงิน</CardTitle>
          <CardDescription>
            {filteredRequests.length} รายการจากทั้งหมด {requests.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบข้อมูลคำขอโอนเงิน
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เลขที่คำขอ</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>จำนวน</TableHead>
                    <TableHead>วันที่โอน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>ความสำคัญ</TableHead>
                    <TableHead>ผู้สร้าง</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead className="text-right">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.transfer_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.supplier_name}</div>
                          {request.supplier && (
                            <div className="text-sm text-muted-foreground">
                              {request.supplier.bank_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {request.transfer_amount?.toLocaleString()} {request.currency}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.requested_transfer_date), "dd MMM yyyy", { locale: th })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(request.priority)}
                      </TableCell>
                      <TableCell>
                        {request.requested_by_profile?.full_name || "ไม่ระบุ"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.created_at), "dd MMM yyyy", { locale: th })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(request)}>
                              <Edit className="mr-2 h-4 w-4" />
                              แก้ไข
                            </DropdownMenuItem>
                            
                            {request.status === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(request, 'approved')}
                                  className="text-green-600"
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  อนุมัติ
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(request, 'rejected')}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  ปฏิเสธ
                                </DropdownMenuItem>
                              </>
                            )}

                            {request.status === 'approved' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(request, 'transferred')}
                                className="text-blue-600"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                ทำการโอน
                              </DropdownMenuItem>
                            )}

                            {(request.status === 'draft' || request.status === 'rejected') && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                ลบ
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบคำขอโอนเงิน {selectedRequest?.transfer_number}? 
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}