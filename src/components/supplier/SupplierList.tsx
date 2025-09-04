import { useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash2, Eye, Star, Building2, Phone, Mail, MapPin } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Supplier {
  id: string;
  name: string;
  supplier_code?: string;
  supplier_category?: string;
  supplier_country?: string;
  supplier_currency?: string;
  bank_name?: string;
  bank_account?: string;
  banking_swift_code?: string;
  contact_person?: string;
  contact_person_finance?: string;
  email?: string;
  contact_email_finance?: string;
  phone?: string;
  quality_rating?: number;
  delivery_rating?: number;
  price_rating?: number;
  compliance_status?: string;
  is_preferred_supplier?: boolean;
  recent_transfer_count?: number;
  recent_transfer_amount?: number;
  total_orders_count?: number;
  total_orders_value?: number;
  created_at: string;
  updated_at: string;
}

interface SupplierListProps {
  suppliers: Supplier[];
  isLoading: boolean;
  onEdit: (supplier: Supplier) => void;
  onRefresh: () => void;
}

export function SupplierList({
  suppliers,
  isLoading,
  onEdit,
  onRefresh,
}: SupplierListProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique values for filters
  const categories = [...new Set(suppliers.map(s => s.supplier_category).filter(Boolean))];
  const countries = [...new Set(suppliers.map(s => s.supplier_country).filter(Boolean))];

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.supplier_code || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || supplier.supplier_category === categoryFilter;
    const matchesCountry = countryFilter === "all" || supplier.supplier_country === countryFilter;
    const matchesStatus = statusFilter === "all" || supplier.compliance_status === statusFilter;

    return matchesSearch && matchesCategory && matchesCountry && matchesStatus;
  });

  const getComplianceStatusBadge = (status?: string) => {
    const statusConfig = {
      pending: { label: "รอตรวจสอบ", variant: "secondary" as const },
      approved: { label: "อนุมัติแล้ว", variant: "default" as const },
      rejected: { label: "ไม่อนุมัติ", variant: "destructive" as const },
      under_review: { label: "กำลังตรวจสอบ", variant: "outline" as const },
      suspended: { label: "ระงับชั่วคราว", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status || "ไม่ระบุ", variant: "secondary" as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground">ไม่ระบุ</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm">({rating})</span>
      </div>
    );
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", selectedSupplier.id);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "ลบ Supplier เรียบร้อยแล้ว",
      });

      onRefresh();
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถลบ Supplier ได้",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSupplier(null);
    }
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewDialogOpen(true);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="ค้นหาชื่อหรือรหัส Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ประเทศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ประเทศทั้งหมด</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="pending">รอตรวจสอบ</SelectItem>
                <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                <SelectItem value="rejected">ไม่อนุมัติ</SelectItem>
                <SelectItem value="under_review">กำลังตรวจสอบ</SelectItem>
                <SelectItem value="suspended">ระงับชั่วคราว</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการ Supplier</CardTitle>
          <CardDescription>
            {filteredSuppliers.length} รายการจากทั้งหมด {suppliers.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบข้อมูล Supplier
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead>ประเทศ</TableHead>
                    <TableHead>ธนาคาร</TableHead>
                    <TableHead>คะแนนเฉลี่ย</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>โอนล่าสุด</TableHead>
                    <TableHead>วันที่เพิ่ม</TableHead>
                    <TableHead className="text-right">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => {
                    const avgRating = supplier.quality_rating && supplier.delivery_rating && supplier.price_rating
                      ? ((supplier.quality_rating + supplier.delivery_rating + supplier.price_rating) / 3).toFixed(1)
                      : null;

                    return (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {supplier.name}
                                {supplier.is_preferred_supplier && (
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {supplier.supplier_code || "ไม่มีรหัส"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {supplier.supplier_category || "ไม่ระบุ"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {supplier.supplier_country || "ไม่ระบุ"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{supplier.bank_name || "ไม่ระบุ"}</div>
                            <div className="text-sm text-muted-foreground">
                              {supplier.bank_account || "ไม่ระบุเลขบัญชี"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {avgRating ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{avgRating}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">ไม่ประเมิน</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getComplianceStatusBadge(supplier.compliance_status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {supplier.recent_transfer_count || 0} ครั้ง
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${(supplier.recent_transfer_amount || 0).toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(supplier.created_at), "dd MMM yyyy", { locale: th })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(supplier)}>
                                <Eye className="mr-2 h-4 w-4" />
                                ดูรายละเอียด
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(supplier)}>
                                <Edit className="mr-2 h-4 w-4" />
                                แก้ไข
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSupplier(supplier);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                ลบ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              รายละเอียด Supplier: {selectedSupplier?.name}
              {selectedSupplier?.is_preferred_supplier && (
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              )}
            </DialogTitle>
            <DialogDescription>
              ข้อมูลครบถ้วนของ Supplier
            </DialogDescription>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="grid grid-cols-2 gap-6 max-h-96 overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">ข้อมูลพื้นฐาน</h4>
                <div className="space-y-2">
                  <div><strong>รหัส:</strong> {selectedSupplier.supplier_code || "ไม่มี"}</div>
                  <div><strong>หมวดหมู่:</strong> {selectedSupplier.supplier_category || "ไม่ระบุ"}</div>
                  <div><strong>ประเทศ:</strong> {selectedSupplier.supplier_country || "ไม่ระบุ"}</div>
                  <div><strong>สกุลเงิน:</strong> {selectedSupplier.supplier_currency || "USD"}</div>
                  <div><strong>สถานะ:</strong> {getComplianceStatusBadge(selectedSupplier.compliance_status)}</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">ข้อมูลติดต่อ</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedSupplier.phone || "ไม่ระบุ"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedSupplier.email || "ไม่ระบุ"}
                  </div>
                  <div><strong>ผู้ติดต่อ:</strong> {selectedSupplier.contact_person || "ไม่ระบุ"}</div>
                  <div><strong>ผู้ติดต่อการเงิน:</strong> {selectedSupplier.contact_person_finance || "ไม่ระบุ"}</div>
                  <div><strong>อีเมลการเงิน:</strong> {selectedSupplier.contact_email_finance || "ไม่ระบุ"}</div>
                </div>
              </div>

              {/* Banking Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">ข้อมูลธนาคาร</h4>
                <div className="space-y-2">
                  <div><strong>ธนาคาร:</strong> {selectedSupplier.bank_name || "ไม่ระบุ"}</div>
                  <div><strong>เลขบัญชี:</strong> {selectedSupplier.bank_account || "ไม่ระบุ"}</div>
                  <div><strong>SWIFT:</strong> {selectedSupplier.banking_swift_code || "ไม่ระบุ"}</div>
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">การประเมิน</h4>
                <div className="space-y-2">
                  <div><strong>คุณภาพ:</strong> {renderStars(selectedSupplier.quality_rating)}</div>
                  <div><strong>การส่งมอบ:</strong> {renderStars(selectedSupplier.delivery_rating)}</div>
                  <div><strong>ราคา:</strong> {renderStars(selectedSupplier.price_rating)}</div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-4 col-span-2">
                <h4 className="font-semibold text-lg">สถิติการทำงาน</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>การโอนล่าสุด (30 วัน):</strong> {selectedSupplier.recent_transfer_count || 0} ครั้ง</div>
                  <div><strong>มูลค่าโอนล่าสุด:</strong> ${(selectedSupplier.recent_transfer_amount || 0).toLocaleString()}</div>
                  <div><strong>คำสั่งซื้อทั้งหมด:</strong> {selectedSupplier.total_orders_count || 0} ครั้ง</div>
                  <div><strong>มูลค่าทั้งหมด:</strong> ${(selectedSupplier.total_orders_value || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบ Supplier "{selectedSupplier?.name}"? 
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