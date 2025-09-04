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

  const { data: purchaseOrders, isLoading, refetch } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data: poData, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          customer:customers(name),
          quotation:quotations(quotation_number)
        `)
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
    refetch();
    toast({
      title: "สำเร็จ",
      description: editingPO ? "อัปเดต PO เรียบร้อยแล้ว" : "สร้าง PO เรียบร้อยแล้ว",
    });
  };

  const handleEdit = (po: any) => {
    setEditingPO(po);
    setShowForm(true);
  };

  const handleNewPO = () => {
    setEditingPO(null);
    setShowForm(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">จัดการใบสั่งซื้อที่ได้รับจากลูกค้า</p>
          </div>
          <Button onClick={handleNewPO}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่ม PO ใหม่
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการ Purchase Orders</CardTitle>
            <CardDescription>
              ใบสั่งซื้อทั้งหมดที่ได้รับจากลูกค้า
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">กำลังโหลด...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>เลขที่ PO (ระบบ)</TableHead>
                      <TableHead>เลขที่ PO (ลูกค้า)</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>พนักงานขาย</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>วันส่งมอบ</TableHead>
                      <TableHead>จำนวนเงิน</TableHead>
                      <TableHead>เอกสารแนบ</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders?.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.po_number}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {po.customer_po_number || "-"}
                        </TableCell>
                        <TableCell>{po.customer_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {po.sales_person_name || "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(po.po_date), "dd/MM/yyyy", { locale: th })}
                        </TableCell>
                        <TableCell>
                          {po.delivery_date
                            ? format(new Date(po.delivery_date), "dd/MM/yyyy", { locale: th })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          ฿{po.total_amount?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{po.attachment_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(po.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(po)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(po.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {purchaseOrders?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    ยังไม่มี Purchase Orders
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPO ? "แก้ไข Purchase Order" : "เพิ่ม Purchase Order ใหม่"}
              </DialogTitle>
            </DialogHeader>
            <PurchaseOrderForm
              editingPO={editingPO}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}