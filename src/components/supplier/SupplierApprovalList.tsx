import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye, Calendar, Building2, MapPin, Phone, Mail, Globe, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface SupplierApprovalListProps {
  onSupplierUpdate: () => void;
}

export function SupplierApprovalList({ onSupplierUpdate }: SupplierApprovalListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Query for pending suppliers
  const { data: pendingSuppliers, isLoading, refetch } = useQuery({
    queryKey: ["pending-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("customer_type", "ผู้จำหน่าย")
        .in("supplier_registration_status", ["pending", "draft"])
        .order("supplier_application_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleApprove = async (supplierId: string) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          supplier_registration_status: "approved",
          supplier_approved_date: new Date().toISOString(),
          supplier_approved_by: user.id,
          supplier_rejection_reason: null,
        })
        .eq("id", supplierId);

      if (error) throw error;

      toast({
        title: "อนุมัติสำเร็จ",
        description: "อนุมัติ Supplier เรียบร้อยแล้ว",
      });

      refetch();
      onSupplierUpdate();
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอนุมัติได้: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (supplierId: string) => {
    if (!user || !rejectionReason.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาระบุเหตุผลการปฏิเสธ",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          supplier_registration_status: "rejected",
          supplier_rejection_reason: rejectionReason,
          supplier_approved_by: user.id,
          supplier_approved_date: new Date().toISOString(),
        })
        .eq("id", supplierId);

      if (error) throw error;

      toast({
        title: "ปฏิเสธสำเร็จ",
        description: "ปฏิเสธ Supplier เรียบร้อยแล้ว",
      });

      setRejectionReason("");
      setSelectedSupplier(null);
      refetch();
      onSupplierUpdate();
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถปฏิเสธได้: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      pending: "outline",
      approved: "default",
      rejected: "destructive"
    } as const;

    const labels = {
      draft: "ร่าง",
      pending: "รอการอนุมัติ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธ"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const renderStarRating = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">ไม่มีคะแนน</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-4">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Supplier รอการอนุมัติ ({pendingSuppliers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingSuppliers?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่มี Supplier รอการอนุมัติ
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อบริษัท</TableHead>
                  <TableHead>ประเทศ</TableHead>
                  <TableHead>ประเภทธุรกิจ</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>คะแนน</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.contact_person}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{supplier.supplier_country || "-"}</TableCell>
                    <TableCell>{supplier.business_type || "-"}</TableCell>
                    <TableCell>
                      {supplier.supplier_application_date
                        ? formatDistanceToNow(new Date(supplier.supplier_application_date), {
                            addSuffix: true,
                            locale: th,
                          })
                        : "-"
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(supplier.supplier_registration_status)}</TableCell>
                    <TableCell>
                      {renderStarRating(supplier.quality_rating)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>รายละเอียด Supplier</DialogTitle>
                              <DialogDescription>
                                ข้อมูลสำหรับการพิจารณาอนุมัติ
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Company Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    ข้อมูลบริษัท
                                  </Label>
                                  <div className="text-sm space-y-1">
                                    <div><strong>ชื่อ:</strong> {supplier.name}</div>
                                    <div><strong>เลขทะเบียน:</strong> {supplier.business_registration_number || "-"}</div>
                                    <div><strong>ประเภท:</strong> {supplier.business_type || "-"}</div>
                                    <div><strong>ปีที่ก่อตั้ง:</strong> {supplier.established_year || "-"}</div>
                                    <div><strong>เว็บไซต์:</strong> {supplier.website || "-"}</div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    ข้อมูลติดต่อ
                                  </Label>
                                  <div className="text-sm space-y-1">
                                    <div><strong>ผู้ติดต่อ:</strong> {supplier.contact_person || "-"}</div>
                                    <div><strong>โทร:</strong> {supplier.phone || "-"}</div>
                                    <div><strong>อีเมล:</strong> {supplier.email || "-"}</div>
                                    <div><strong>ประเทศ:</strong> {supplier.supplier_country || "-"}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Address */}
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  ที่อยู่
                                </Label>
                                <div className="text-sm">{supplier.address || "-"}</div>
                              </div>

                              {/* Banking */}
                              <div className="space-y-2">
                                <Label>ข้อมูลธนาคาร</Label>
                                <div className="text-sm space-y-1">
                                  <div><strong>ธนาคาร:</strong> {supplier.bank_name || "-"}</div>
                                  <div><strong>เลขบัญชี:</strong> {supplier.bank_account || "-"}</div>
                                  <div><strong>SWIFT:</strong> {supplier.swift_code || "-"}</div>
                                </div>
                              </div>

                              {/* Products */}
                              {supplier.main_products && supplier.main_products.length > 0 && (
                                <div className="space-y-2">
                                  <Label>สินค้าหลัก</Label>
                                  <div className="text-sm">
                                    {supplier.main_products.join(", ")}
                                  </div>
                                </div>
                              )}

                              {/* Certifications */}
                              {supplier.certifications && supplier.certifications.length > 0 && (
                                <div className="space-y-2">
                                  <Label>ใบรับรอง</Label>
                                  <div className="text-sm">
                                    {supplier.certifications.join(", ")}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {supplier.supplier_notes && (
                                <div className="space-y-2">
                                  <Label>หมายเหตุ</Label>
                                  <div className="text-sm">{supplier.supplier_notes}</div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(supplier.id)}
                          disabled={isProcessing}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setSelectedSupplier(supplier)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>ปฏิเสธ Supplier</DialogTitle>
                              <DialogDescription>
                                กรุณาระบุเหตุผลการปฏิเสธ {supplier.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>เหตุผลการปฏิเสธ *</Label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="กรุณาระบุเหตุผล..."
                                  rows={4}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSupplier(null);
                                    setRejectionReason("");
                                  }}
                                >
                                  ยกเลิก
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReject(supplier.id)}
                                  disabled={isProcessing || !rejectionReason.trim()}
                                >
                                  ปฏิเสธ
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}