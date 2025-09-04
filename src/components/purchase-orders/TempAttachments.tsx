import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, File, X, FileText, Image } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface TempAttachment {
  file: File;
  id: string;
}

interface TempAttachmentsProps {
  attachments: TempAttachment[];
  onAttachmentsChange: (attachments: TempAttachment[]) => void;
}

export function TempAttachments({ attachments, onAttachmentsChange }: TempAttachmentsProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const newAttachments: TempAttachment[] = [];

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

        newAttachments.push({
          file,
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      }

      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments]);
        toast({
          title: "สำเร็จ",
          description: `เพิ่มไฟล์เรียบร้อยแล้ว (${newAttachments.length} ไฟล์)`,
        });
      }

      // Reset file input
      event.target.value = '';
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มไฟล์ได้: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (attachmentId: string) => {
    onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
    toast({
      title: "ลบไฟล์เรียบร้อยแล้ว",
      description: "ไฟล์ถูกลบออกจากรายการแนบ",
    });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="w-5 h-5" />
          เอกสารแนบ PO จากลูกค้า
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
            {uploading ? "กำลังเพิ่ม..." : "เพิ่มไฟล์"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          รองรับไฟล์: PDF, Word, Excel, รูปภาพ (JPG, PNG) ขนาดไม่เกิน 50MB
        </p>

        {/* Attachments List */}
        {attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(attachment.file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.file.size)} • เพิ่มเมื่อ {format(new Date(), "HH:mm", { locale: th })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(attachment.id)}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            แนบเอกสาร PO จากลูกค้าได้ทันที ไม่ต้องบันทึกก่อน
          </p>
        )}
      </CardContent>
    </Card>
  );
}