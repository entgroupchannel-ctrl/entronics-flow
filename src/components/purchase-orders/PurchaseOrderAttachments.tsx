import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, File, Download, Trash2, FileText, Image, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface PurchaseOrderAttachmentsProps {
  purchaseOrderId: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  uploaded_by: string;
}

export function PurchaseOrderAttachments({ purchaseOrderId }: PurchaseOrderAttachmentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<Attachment | null>(null);

  const { data: attachments, isLoading } = useQuery({
    queryKey: ["po-attachments", purchaseOrderId],
    queryFn: async () => {
      if (!purchaseOrderId) return [];
      
      const { data, error } = await supabase
        .from("purchase_order_attachments")
        .select("*")
        .eq("purchase_order_id", purchaseOrderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Attachment[];
    },
    enabled: !!purchaseOrderId,
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "ข้อผิดพลาด",
            description: `ไฟล์ ${file.name} มีขนาดใหญ่เกิน 50MB`,
            variant: "destructive",
          });
          continue;
        }

        // Create unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${purchaseOrderId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        // Upload file to storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("purchase-orders")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save attachment record
        const { error: dbError } = await supabase
          .from("purchase_order_attachments")
          .insert({
            purchase_order_id: purchaseOrderId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user.id,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "สำเร็จ",
        description: "อัปโหลดไฟล์เรียบร้อยแล้ว",
      });

      // Refresh attachments list
      queryClient.invalidateQueries({ queryKey: ["po-attachments", purchaseOrderId] });
      
      // Reset file input
      event.target.value = '';
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปโหลดไฟล์ได้: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from("purchase-orders")
        .download(attachment.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดาวน์โหลดไฟล์ได้: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบไฟล์ "${attachment.file_name}"?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("purchase-orders")
        .remove([attachment.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("purchase_order_attachments")
        .delete()
        .eq("id", attachment.id);

      if (dbError) throw dbError;

      toast({
        title: "สำเร็จ",
        description: "ลบไฟล์เรียบร้อยแล้ว",
      });

      // Refresh attachments list
      queryClient.invalidateQueries({ queryKey: ["po-attachments", purchaseOrderId] });
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถลบไฟล์ได้: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else {
      return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canPreview = (attachment: Attachment) => {
    return attachment.file_type.startsWith('image/') || attachment.file_type === 'application/pdf';
  };

  const openPreview = (attachment: Attachment) => {
    setSelectedPreview(attachment);
  };

  if (!purchaseOrderId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>เอกสารแนบ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">กรุณาบันทึก PO ก่อนแนบเอกสาร</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="w-5 h-5" />
          เอกสารแนบ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="flex items-center gap-2">
          <Input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={uploading}
            className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <Button disabled={uploading} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-1" />
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          รองรับไฟล์: PDF, Word, Excel, รูปภาพ (JPG, PNG) ขนาดไม่เกิน 50MB
        </p>

        {/* Attachments List */}
        {isLoading ? (
          <p className="text-center py-4">กำลังโหลด...</p>
        ) : attachments && attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(attachment.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.file_size)} • 
                      {format(new Date(attachment.created_at), "dd/MM/yyyy HH:mm", { locale: th })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {canPreview(attachment) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPreview(attachment)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">ยังไม่มีเอกสารแนบ</p>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!selectedPreview} onOpenChange={() => setSelectedPreview(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                ตัวอย่างไฟล์: {selectedPreview?.file_name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center min-h-[400px]">
              {selectedPreview?.file_type.startsWith('image/') ? (
                <img 
                  src={`https://coezszrbeaweaoufkpsq.supabase.co/storage/v1/object/public/purchase-orders/${selectedPreview.file_path}`}
                  alt={selectedPreview.file_name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : selectedPreview?.file_type === 'application/pdf' ? (
                <iframe
                  src={`https://coezszrbeaweaoufkpsq.supabase.co/storage/v1/object/public/purchase-orders/${selectedPreview.file_path}`}
                  className="w-full h-[70vh] rounded-lg"
                  title={selectedPreview.file_name}
                />
              ) : (
                <div className="text-center">
                  <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">ไม่สามารถแสดงตัวอย่างได้</p>
                  <p className="text-muted-foreground">รูปแบบไฟล์นี้ไม่รองรับการแสดงตัวอย่าง</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}