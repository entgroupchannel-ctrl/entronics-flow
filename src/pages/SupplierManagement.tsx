import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, TrendingUp, Users, Star, Shield, Clock } from "lucide-react";
import { SupplierRegistrationForm } from "@/components/supplier/SupplierRegistrationForm";
import { SupplierApprovalList } from "@/components/supplier/SupplierApprovalList";
import { SupplierList } from "@/components/supplier/SupplierList";
import { SupplierPaymentHistory } from "@/components/supplier/SupplierPaymentHistory";
import { useToast } from "@/hooks/use-toast";

export default function SupplierManagement() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const { toast } = useToast();

  // Query for all suppliers with different statuses
  const { data: suppliers, isLoading, refetch } = useQuery({
    queryKey: ["all-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("customer_type", "ผู้จัดจำหน่าย")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching suppliers:", error);
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูล Supplier ได้",
          variant: "destructive",
        });
        throw error;
      }
      return data || [];
    },
  });

  // Calculate statistics
  const stats = suppliers ? {
    total: suppliers.length,
    pending: suppliers.filter(s => s.supplier_registration_status === 'pending').length,
    approved: suppliers.filter(s => s.supplier_registration_status === 'approved').length,
    rejected: suppliers.filter(s => s.supplier_registration_status === 'rejected').length,
    draft: suppliers.filter(s => s.supplier_registration_status === 'draft').length,
    preferred: suppliers.filter(s => s.is_preferred_supplier).length,
    high_rated: suppliers.filter(s => (s.quality_rating || 0) >= 4).length,
  } : { total: 0, pending: 0, approved: 0, rejected: 0, draft: 0, preferred: 0, high_rated: 0 };

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setActiveTab("form");
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setActiveTab("form");
  };

  const handleFormSuccess = () => {
    refetch();
    setActiveTab("list");
    setEditingSupplier(null);
    toast({
      title: "สำเร็จ",
      description: editingSupplier ? "แก้ไขข้อมูล Supplier เรียบร้อยแล้ว" : "เพิ่ม Supplier ใหม่เรียบร้อยแล้ว",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการ Supplier</h1>
          <p className="text-muted-foreground">
            ระบบลงทะเบียนและจัดการคู่ค้าต่างประเทศ
          </p>
        </div>
        <Button onClick={handleNewSupplier} className="gap-2">
          <Plus className="h-4 w-4" />
          ลงทะเบียน Supplier ใหม่
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ทั้งหมด</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอการอนุมัติ</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ปฏิเสธ</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ร่าง</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferred</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.preferred}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คะแนนสูง</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.high_rated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">รอการอนุมัติ</TabsTrigger>
          <TabsTrigger value="list">รายการ Supplier</TabsTrigger>
          <TabsTrigger value="form">
            {editingSupplier ? "แก้ไข Supplier" : "ลงทะเบียน Supplier"}
          </TabsTrigger>
          <TabsTrigger value="payments">ประวัติการจ่าย</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <SupplierApprovalList onSupplierUpdate={refetch} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <SupplierList
            suppliers={suppliers?.filter(s => s.supplier_registration_status === 'approved') || []}
            isLoading={isLoading}
            onEdit={handleEditSupplier}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingSupplier ? "แก้ไขข้อมูล Supplier" : "ลงทะเบียน Supplier ใหม่"}
              </CardTitle>
              <CardDescription>
                {editingSupplier 
                  ? "แก้ไขข้อมูล Supplier และรายละเอียดการโอนเงิน"
                  : "ลงทะเบียน Supplier ใหม่สำหรับการเป็นคู่ค้าต่างประเทศ"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierRegistrationForm
                editingSupplier={editingSupplier}
                onSuccess={handleFormSuccess}
                onCancel={() => setActiveTab("list")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <SupplierPaymentHistory
            suppliers={suppliers?.filter(s => s.supplier_registration_status === 'approved') || []}
            onRefresh={refetch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}