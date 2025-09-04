import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, Mail, Phone, MapPin, Star, MoreHorizontal, Plus, RefreshCw, Filter, Package, MessageCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { SupplierForm } from "@/components/supplier/SupplierForm";

interface Supplier {
  id: string;
  company_name: string;
  company_name_en?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  wechat?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  supplier_grade: string;
  quality_score?: number;
  price_competitiveness?: number;
  reliability_score?: number;
  business_license?: string;
  certification_iso?: string;
  certification_ce?: boolean;
  certification_fcc?: boolean;
  product_categories?: string[];
  specializations?: string[];
  total_orders?: number;
  successful_orders?: number;
  is_active?: boolean;
  is_preferred?: boolean;
  payment_terms?: string;
  minimum_order_amount?: number;
  currency?: string;
  erp_sync_status?: string;
  last_synced_at?: string;
  erp_supplier_code?: string;
  created_at: string;
  updated_at: string;
}

export default function SupplierCRM() {
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Fetch suppliers
  const { data: suppliers, isLoading, refetch } = useQuery({
    queryKey: ["suppliers-crm"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Supplier[];
    },
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["supplier-stats"],
    queryFn: async () => {
      const [suppliersCount, productsCount, inquiriesCount, responsesCount] = await Promise.all([
        supabase.from("suppliers").select("id", { count: "exact" }),
        supabase.from("supplier_products").select("id", { count: "exact" }),
        supabase.from("product_inquiries").select("id", { count: "exact" }),
        supabase.from("supplier_responses").select("id", { count: "exact" }),
      ]);

      return {
        totalSuppliers: suppliersCount.count || 0,
        totalProducts: productsCount.count || 0,
        totalInquiries: inquiriesCount.count || 0,
        totalResponses: responsesCount.count || 0,
      };
    },
  });

  const filteredSuppliers = suppliers?.filter((supplier) => {
    const matchesSearch = 
      supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = gradeFilter === "all" || supplier.supplier_grade === gradeFilter;
    const matchesActive = activeFilter === "all" || 
      (activeFilter === "active" && supplier.is_active) ||
      (activeFilter === "inactive" && !supplier.is_active);
    
    return matchesSearch && matchesGrade && matchesActive;
  });

  const handleSyncToERP = async (supplierId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-to-erp', {
        body: {
          entityType: 'supplier',
          entityId: supplierId,
          syncDirection: 'to_erp'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("ซิงค์ข้อมูลซัพพลายเออร์สำเร็จ");
        refetch();
      } else {
        toast.error(data.message || "เกิดข้อผิดพลาดในการซิงค์");
      }
    } catch (error) {
      console.error('Error syncing supplier:', error);
      toast.error("เกิดข้อผิดพลาดในการซิงค์ข้อมูล");
    }
  };

  const handleBulkSync = async () => {
    try {
      toast.info("กำลังซิงค์ข้อมูลซัพพลายเออร์ทั้งหมด...");
      
      const { data, error } = await supabase.functions.invoke('sync-to-erp/bulk-sync');

      if (error) throw error;

      toast.success(data.message);
      refetch();
    } catch (error) {
      console.error('Error bulk syncing suppliers:', error);
      toast.error("เกิดข้อผิดพลาดในการซิงค์ข้อมูลทั้งหมด");
    }
  };

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setActiveTab("form");
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setActiveTab("form");
  };

  const handleFormSuccess = () => {
    setActiveTab("list");
    setEditingSupplier(null);
    refetch();
    toast.success("บันทึกข้อมูลซัพพลายเออร์สำเร็จ");
  };

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'A+': return 'default';
      case 'A': return 'secondary';
      case 'B+': return 'outline';
      case 'B': return 'outline';
      case 'C': return 'destructive';
      default: return 'outline';
    }
  };

  const getSyncStatusBadge = (status?: string) => {
    switch (status) {
      case 'synced':
        return <Badge variant="default" className="bg-green-100 text-green-800">ซิงค์แล้ว</Badge>;
      case 'pending':
        return <Badge variant="secondary">รอซิงค์</Badge>;
      case 'failed':
        return <Badge variant="destructive">ซิงค์ไม่สำเร็จ</Badge>;
      default:
        return <Badge variant="outline">ยังไม่ซิงค์</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ระบบจัดการซัพพลายเออร์</h1>
          <p className="text-muted-foreground">จัดการข้อมูลซัพพลายเออร์และซิงค์กับระบบ ERP</p>
        </div>
        <Button onClick={handleNewSupplier}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มซัพพลายเออร์ใหม่
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ซัพพลายเออร์ทั้งหมด</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSuppliers || 0}</div>
            <p className="text-xs text-muted-foreground">รายการที่ลงทะเบียน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">รายการสินค้า</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใบสอบราคา</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInquiries || 0}</div>
            <p className="text-xs text-muted-foreground">คำขอราคา</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การตอบกลับ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalResponses || 0}</div>
            <p className="text-xs text-muted-foreground">ใบเสนอราคา</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">รายการซัพพลายเออร์</TabsTrigger>
          <TabsTrigger value="form">
            {editingSupplier ? "แก้ไขซัพพลายเออร์" : "เพิ่มซัพพลายเออร์"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    รายการซัพพลายเออร์
                  </CardTitle>
                  <CardDescription>
                    จัดการข้อมูลซัพพลายเออร์และซิงค์กับระบบ ERP
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleBulkSync}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  ซิงค์ทั้งหมด
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="ค้นหาชื่อบริษัท, อีเมล, หรือผู้ติดต่อ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="เกรด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">เกรดทั้งหมด</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={activeFilter} onValueChange={setActiveFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Suppliers Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>บริษัท</TableHead>
                      <TableHead>ติดต่อ</TableHead>
                      <TableHead>เกรด</TableHead>
                      <TableHead>คะแนน</TableHead>
                      <TableHead>สถานะ ERP</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers?.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{supplier.company_name}</div>
                            {supplier.company_name_en && (
                              <div className="text-sm text-muted-foreground">{supplier.company_name_en}</div>
                            )}
                            {supplier.address && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {supplier.city}, {supplier.country}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {supplier.contact_person && (
                              <div className="text-sm">{supplier.contact_person}</div>
                            )}
                            {supplier.email && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {supplier.email}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getGradeBadgeVariant(supplier.supplier_grade)}>
                            {supplier.supplier_grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm">คุณภาพ: {supplier.quality_score || 0}/5</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ราคา: {supplier.price_competitiveness || 0}/5
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ความน่าเชื่อถือ: {supplier.reliability_score || 0}/5
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSyncStatusBadge(supplier.erp_sync_status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={supplier.is_active ? "default" : "secondary"}>
                              {supplier.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
                            </Badge>
                            {supplier.is_preferred && (
                              <Badge variant="outline" className="text-blue-600">แนะนำ</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>การดำเนินการ</DropdownMenuLabel>
                              <DropdownMenuItem>ดูรายละเอียด</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>
                                แก้ไข
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleSyncToERP(supplier.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                ซิงค์กับ ERP
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredSuppliers?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || gradeFilter !== "all" || activeFilter !== "all" 
                    ? "ไม่พบซัพพลายเออร์ที่ตรงกับเงื่อนไขการค้นหา" 
                    : "ยังไม่มีข้อมูลซัพพลายเออร์"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingSupplier ? "แก้ไขซัพพลายเออร์" : "เพิ่มซัพพลายเออร์ใหม่"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">ฟอร์มจัดการซัพพลายเออร์จะพัฒนาในขั้นตอนถัดไป</p>
              <Button variant="outline" onClick={() => setActiveTab("list")} className="mt-4">
                กลับไปรายการ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}