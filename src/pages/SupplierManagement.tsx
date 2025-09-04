import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, TrendingUp, Users, Star } from "lucide-react";
import { SupplierForm } from "@/components/supplier/SupplierForm";
import { SupplierList } from "@/components/supplier/SupplierList";
import { SupplierPaymentHistory } from "@/components/supplier/SupplierPaymentHistory";
import { useToast } from "@/hooks/use-toast";

export default function SupplierManagement() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const { toast } = useToast();

  const { data: suppliers, isLoading, refetch } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_summary")
        .select("*")
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
    preferred: suppliers.filter(s => s.is_preferred_supplier).length,
    recent_transfers: suppliers.reduce((sum, s) => sum + (s.recent_transfer_count || 0), 0),
    total_value: suppliers.reduce((sum, s) => sum + (s.recent_transfer_amount || 0), 0),
    high_rated: suppliers.filter(s => (s.quality_rating || 0) >= 4).length,
    active: suppliers.filter(s => s.compliance_status === 'approved').length
  } : { total: 0, preferred: 0, recent_transfers: 0, total_value: 0, high_rated: 0, active: 0 };

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
            จัดการข้อมูล Supplier และรายละเอียดการโอนเงิน
          </p>
        </div>
        <Button onClick={handleNewSupplier} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่ม Supplier ใหม่
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplier ทั้งหมด</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.high_rated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โอนล่าสุด</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.recent_transfers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่ารวม</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              ${stats.total_value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">รายการ Supplier</TabsTrigger>
          <TabsTrigger value="form">
            {editingSupplier ? "แก้ไข Supplier" : "เพิ่ม Supplier ใหม่"}
          </TabsTrigger>
          <TabsTrigger value="payments">ประวัติการจ่าย</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <SupplierList
            suppliers={suppliers || []}
            isLoading={isLoading}
            onEdit={handleEditSupplier}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingSupplier ? "แก้ไขข้อมูล Supplier" : "เพิ่ม Supplier ใหม่"}
              </CardTitle>
              <CardDescription>
                กรอกข้อมูล Supplier และรายละเอียดการโอนเงิน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierForm
                editingSupplier={editingSupplier}
                onSuccess={handleFormSuccess}
                onCancel={() => setActiveTab("list")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <SupplierPaymentHistory
            suppliers={suppliers || []}
            onRefresh={refetch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}