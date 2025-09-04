import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { PurchaseOrderForm } from "@/components/purchase-orders/PurchaseOrderForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function PurchaseOrders() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingPO, setEditingPO] = useState<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { data: purchaseOrders, isLoading, refetch } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data: poData, error } = await supabase
        .from("purchase_orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Get sales person info and attachments count
      if (poData && poData.length > 0) {
        const salesPersonIds = [...new Set(poData.map(po => po.sales_person_id).filter(Boolean))];
        const poIds = poData.map(po => po.id);
        
        // Get sales person names
        let profilesData = [];
        if (salesPersonIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", salesPersonIds);
          profilesData = profiles || [];
        }
        
        // Get attachments count for each PO
        const { data: attachmentCounts } = await supabase
          .from("purchase_order_attachments")
          .select("purchase_order_id")
          .in("purchase_order_id", poIds);
        
        // Merge data
        return poData.map(po => ({
          ...po,
          sales_person_name: profilesData?.find(p => p.user_id === po.sales_person_id)?.full_name || null,
          attachment_count: attachmentCounts?.filter(a => a.purchase_order_id === po.id).length || 0
        }));
      }
      
      return poData?.map(po => ({ ...po, sales_person_name: null, attachment_count: 0 })) || [];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบ PO นี้?")) return;

    try {
      const { error } = await supabase
        .from("purchase_orders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "ลบ PO เรียบร้อยแล้ว",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถลบ PO ได้: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      received: { label: "ได้รับแล้ว", variant: "default" },
      processing: { label: "กำลังดำเนินการ", variant: "secondary" },
      completed: { label: "เสร็จสิ้น", variant: "outline" },
      cancelled: { label: "ยกเลิก", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPO(null);
    setIsFullScreen(false);
    refetch();
    toast({
      title: "สำเร็จ",
      description: editingPO ? "อัปเดต PO เรียบร้อยแล้ว" : "สร้าง PO เรียบร้อยแล้ว",
    });
  };

  const handleEdit = (po: any) => {
    setEditingPO(po);
    setShowForm(true);
    setIsFullScreen(false);
  };

  const handleNewPO = () => {
    setEditingPO(null);
    setShowForm(true);
    setIsFullScreen(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPO(null);
    setIsFullScreen(false);
  };

  // Show full screen form for new PO
  if (showForm && isFullScreen) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleCancel}>
              ← กลับ
            </Button>
            <div>
              <h1 className="text-2xl font-bold">เพิ่ม Purchase Order ใหม่</h1>
              <p className="text-sm text-muted-foreground">กรอกข้อมูลใบสั่งซื้อจากลูกค้า</p>
            </div>
          </div>
          
          <PurchaseOrderForm
            editingPO={editingPO}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Purchase Orders</h1>
            <p className="text-sm text-muted-foreground">จัดการใบสั่งซื้อจากลูกค้า</p>
          </div>
          <Button onClick={handleNewPO} className="h-9 px-3">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่ม PO ใหม่
          </Button>
        </div>

        {/* PO Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8">กำลังโหลด...</div>
            ) : purchaseOrders?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="mb-4">ยังไม่มี Purchase Orders</div>
                <Button onClick={handleNewPO} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่ม PO แรก
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[120px]">เลขที่ PO</TableHead>
                      <TableHead className="w-[200px]">ลูกค้า</TableHead>
                      <TableHead className="w-[120px]">วันที่</TableHead>
                      <TableHead className="w-[120px]">ส่งมอบ</TableHead>
                      <TableHead className="w-[100px] text-right">ยอดเงิน</TableHead>
                      <TableHead className="w-[80px] text-center">แนบ</TableHead>
                      <TableHead className="w-[100px]">สถานะ</TableHead>
                      <TableHead className="w-[80px] text-center">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders?.map((po) => (
                      <TableRow key={po.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{po.po_number}</div>
                            {po.customer_po_number && (
                              <div className="text-xs text-muted-foreground">
                                {po.customer_po_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{po.customer_name}</div>
                            {po.sales_person_name && (
                              <div className="text-xs text-muted-foreground">
                                โดย {po.sales_person_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(po.po_date), "dd/MM/yy", { locale: th })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {po.delivery_date
                            ? format(new Date(po.delivery_date), "dd/MM/yy", { locale: th })
                            : "-"
                          }
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ฿{(po.total_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {po.attachment_count > 0 && (
                            <Badge variant="secondary" className="h-6 w-6 p-0 rounded-full">
                              {po.attachment_count}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(po.status)}
                            {po.payment_terms_type && po.payment_terms_type !== 'credit' && (
                              <div className="text-xs text-blue-600">
                                {po.payment_terms_type === 'advance' && 'ชำระล่วงหน้า'}
                                {po.payment_terms_type === 'cod' && 'COD'}
                                {po.payment_terms_type === 'installment' && `ผ่อน ${po.installment_count}งวด`}
                                {po.payment_terms_type === 'partial_advance' && `มัดจำ ${po.advance_payment_percentage}%`}
                              </div>
                            )}
                            {po.source_system === 'crm' && (
                              <Badge variant="outline" className="text-xs h-5">CRM</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(po)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(po.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
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

        {/* Edit Dialog */}
        <Dialog open={showForm && !isFullScreen} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>แก้ไข Purchase Order</DialogTitle>
            </DialogHeader>
            <PurchaseOrderForm
              editingPO={editingPO}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}