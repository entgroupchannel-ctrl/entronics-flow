import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Download, Eye, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface SupplierDocumentFormProps {
  suppliers: any[];
}

export function SupplierDocumentForm({ suppliers }: SupplierDocumentFormProps) {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ["supplier-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get supplier names separately
      const docsWithSuppliers = await Promise.all(
        (data || []).map(async (doc) => {
          const { data: supplier } = await supabase
            .from("customers")
            .select("name")
            .eq("id", doc.supplier_id)
            .single();

          const { data: uploader } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", doc.uploaded_by)
            .single();

          return {
            ...doc,
            supplier_name: supplier?.name,
            uploader_name: uploader?.full_name
          };
        })
      );

      return docsWithSuppliers;
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!selectedSupplier || !documentType) {
        throw new Error("กรุณาเลือก Supplier และประเภทเอกสาร");
      }

      setUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `supplier-documents/${selectedSupplier}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save document record
      const { data, error } = await supabase
        .from("supplier_documents")
        .insert({
          supplier_id: selectedSupplier,
          document_type: documentType,
          document_number: documentNumber || null,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          description: description || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-documents"] });
      setDocumentNumber("");
      setDescription("");
      toast({
        title: "สำเร็จ",
        description: "อัปโหลดเอกสารเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast({
        title: "ข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("supplier_documents")
        .update({
          status,
          notes: notes || null,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-documents"] });
      toast({
        title: "สำเร็จ",
        description: "อัปเดตสถานะเอกสารเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast({
        title: "ข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />อนุมัติ</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />ปฏิเสธ</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />รอตรวจสอบ</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      PI: "Proforma Invoice",
      CI: "Commercial Invoice",
      AWB: "Air Waybill",
      packing_list: "Packing List",
      certificate: "Certificate",
      other: "อื่นๆ"
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            อัปโหลดเอกสาร PI, CI, AWB
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">เลือก Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือก Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.supplier_registration_status === 'approved').map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="documentType">ประเภทเอกสาร</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทเอกสาร" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PI">Proforma Invoice</SelectItem>
                  <SelectItem value="CI">Commercial Invoice</SelectItem>
                  <SelectItem value="AWB">Air Waybill</SelectItem>
                  <SelectItem value="packing_list">Packing List</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="documentNumber">หมายเลขเอกสาร (ถ้ามี)</Label>
              <Input
                id="documentNumber"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="เช่น PI-2024-001"
              />
            </div>

            <div>
              <Label htmlFor="file">เลือกไฟล์</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
                disabled={!selectedSupplier || !documentType || uploading}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">รายละเอียดเพิ่มเติม (ถ้ามี)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับเอกสาร"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการเอกสารที่อัปโหลด</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">กำลังโหลด...</div>
          ) : documents?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ยังไม่มีเอกสารที่อัปโหลด
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>ประเภทเอกสาร</TableHead>
                    <TableHead>หมายเลขเอกสาร</TableHead>
                    <TableHead>ชื่อไฟล์</TableHead>
                    <TableHead>วันที่อัปโหลด</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>ผู้อัปโหลด</TableHead>
                    <TableHead>การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents?.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        {doc.supplier_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDocumentTypeLabel(doc.document_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.document_number || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {doc.file_name}
                      </TableCell>
                      <TableCell>
                        {format(new Date(doc.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(doc.status)}
                      </TableCell>
                      <TableCell>{doc.uploader_name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {doc.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => updateStatusMutation.mutate({ 
                                  id: doc.id, 
                                  status: "approved" 
                                })}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => updateStatusMutation.mutate({ 
                                  id: doc.id, 
                                  status: "rejected" 
                                })}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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