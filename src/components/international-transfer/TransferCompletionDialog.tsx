import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, Calendar } from "lucide-react";

interface TransferCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  onSuccess: () => void;
}

export function TransferCompletionDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: TransferCompletionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const transferSlipRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, fileType: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${request.transfer_number}_${fileType}_${Date.now()}.${fileExt}`;
    const filePath = `${request.transfer_number}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('transfer-documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    return filePath;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    fileType: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const filePath = await uploadFile(file, fileType);
      setUploadedFiles(prev => [...prev, filePath]);
      
      toast({
        title: "สำเร็จ",
        description: `อัปโหลดไฟล์ ${fileType} เรียบร้อยแล้ว`,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปโหลดไฟล์ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาอัปโหลดเอกสารอย่างน้อย 1 ไฟล์",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const updateData: any = {
        status: 'transferred',
        transfer_executed_at: new Date().toISOString(),
        actual_transfer_date: transferDate,
        transfer_evidence_urls: uploadedFiles,
        updated_at: new Date().toISOString(),
      };

      if (notes) {
        updateData.internal_notes = notes;
      }

      const { error } = await supabase
        .from("international_transfer_requests")
        .update(updateData)
        .eq("id", request.id);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "บันทึกการโอนเงินเรียบร้อยแล้ว",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error completing transfer:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการโอนเงินได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ยืนยันการโอนเงิน</DialogTitle>
          <DialogDescription>
            กรุณาอัปโหลดเอกสารประกอบการโอนเงิน สำหรับ {request?.transfer_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transfer Date */}
          <div className="space-y-2">
            <Label htmlFor="transfer-date">วันที่โอนเงินจริง</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="transfer-date"
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <div>
              <Label>หลักฐานการโอนเงิน / สลิป</Label>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => transferSlipRef.current?.click()}
                  disabled={loading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  อัปโหลดสลิปโอนเงิน
                </Button>
                <input
                  ref={transferSlipRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "transfer_slip")}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <Label>เอกสารยืนยันการโอน</Label>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => confirmationRef.current?.click()}
                  disabled={loading}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  อัปโหลดเอกสารยืนยัน
                </Button>
                <input
                  ref={confirmationRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "confirmation")}
                  className="hidden"
                />
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-700">
                  อัปโหลดไฟล์แล้ว: {uploadedFiles.length} ไฟล์
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุเพิ่มเติม (ถ้ามี)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="กรอกหมายเหตุเพิ่มเติมเกี่ยวกับการโอนเงิน..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleComplete}
            disabled={loading || uploadedFiles.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "กำลังบันทึก..." : "ยืนยันการโอน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}