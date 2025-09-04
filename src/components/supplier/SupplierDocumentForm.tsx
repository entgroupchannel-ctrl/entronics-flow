import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const documentSchema = z.object({
  document_type: z.enum(["PI", "CI", "AWB", "packing_list", "certificate", "other"]),
  document_number: z.string().optional(),
  description: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface SupplierDocumentFormProps {
  supplierId: string;
  onSuccess?: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  uploading?: boolean;
}

export function SupplierDocumentForm({ supplierId, onSuccess }: SupplierDocumentFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      document_type: "PI",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: DocumentFormData & { files: File[] }) => {
      const results = [];
      
      for (const file of data.files) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `supplier-documents/${supplierId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Save document record
        const { data: docData, error: dbError } = await supabase
          .from('supplier_documents')
          .insert({
            supplier_id: supplierId,
            document_type: data.document_type,
            document_number: data.document_number,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            description: data.description,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (dbError) {
          throw new Error(`Failed to save document record: ${dbError.message}`);
        }

        results.push(docData);
      }

      return results;
    },
    onSuccess: () => {
      toast({
        title: "สำเร็จ",
        description: "อัปโหลดเอกสารเรียบร้อยแล้ว",
      });
      form.reset();
      setUploadedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["supplier-documents", supplierId] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "ข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      PI: 'Proforma Invoice',
      CI: 'Commercial Invoice',
      AWB: 'Air Waybill',
      packing_list: 'Packing List',
      certificate: 'Certificate',
      other: 'เอกสารอื่นๆ',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const onSubmit = (data: DocumentFormData) => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "กรุณาเลือกไฟล์",
        description: "กรุณาเลือกไฟล์เอกสารที่ต้องการอัปโหลด",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      ...data,
      files: uploadedFiles.map(f => f.file),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          อัปโหลดเอกสาร
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Document Type Selection */}
            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเภทเอกสาร</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทเอกสาร" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PI">PI - Proforma Invoice</SelectItem>
                      <SelectItem value="CI">CI - Commercial Invoice</SelectItem>
                      <SelectItem value="AWB">AWB - Air Waybill</SelectItem>
                      <SelectItem value="packing_list">Packing List</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="other">เอกสารอื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Number */}
            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเลขเอกสาร</FormLabel>
                  <FormControl>
                    <Input placeholder="ระบุหมายเลขเอกสาร (ถ้ามี)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียด</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="รายละเอียดเพิ่มเติม..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-4">
              <Label>ไฟล์เอกสาร</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  รองรับไฟล์ PDF, Word, Excel, รูปภาพ (สูงสุด 50MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <Label>ไฟล์ที่เลือก ({uploadedFiles.length} ไฟล์)</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((fileData, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {getFileIcon(fileData.file.type)}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{fileData.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(fileData.file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {fileData.preview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(fileData.preview, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={uploadMutation.isPending || uploadedFiles.length === 0}
                className="min-w-[120px]"
              >
                {uploadMutation.isPending ? "กำลังอัปโหลด..." : "อัปโหลดเอกสาร"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}