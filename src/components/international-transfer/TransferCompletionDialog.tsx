import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Upload, X, FileText } from "lucide-react";
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

interface TransferCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    id: string;
    transfer_number: string;
    supplier_name: string;
    transfer_amount: number;
    currency: string;
  };
  onSuccess: () => void;
}

export function TransferCompletionDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: TransferCompletionDialogProps) {
  const { toast } = useToast();
  const [actualTransferDate, setActualTransferDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [actualAmount, setActualAmount] = useState(request.transfer_amount);
  const [actualExchangeRate, setActualExchangeRate] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    url: string;
    type: string;
  }>>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${request.transfer_number}_${Date.now()}.${fileExt}`;
        const filePath = `${request.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('transfer-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('transfer-documents')
          .getPublicUrl(filePath);

        return {
          name: file.name,
          url: publicUrl,
          type: file.type.startsWith('image/') ? 'image' : 'document',
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...results]);

      toast({
        title: "สำเร็จ",
        description: `อัปโหลดเอกสาร ${files.length} ไฟล์เรียบร้อยแล้ว`,
      });
    } catch (error: any) {
      console.error("Error uploading files:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปโหลดเอกสารได้",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (index: number) => {
    const file = uploadedFiles[index];
    try {
      // Extract file path from URL
      const urlParts = file.url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get "id/filename"

      await supabase.storage
        .from('transfer-documents')
        .remove([filePath]);

      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error removing file:", error);
    }
  };

  const handleComplete = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาอัปโหลดเอกสารประกอบการโอนเงิน",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("international_transfer_requests")
        .update({
          status: "transferred",
          transfer_executed_at: new Date().toISOString(),
          actual_transfer_date: actualTransferDate,
          actual_transfer_amount: actualAmount,
          actual_exchange_rate: actualExchangeRate || null,
          transfer_evidence_urls: uploadedFiles.map(f => f.url),
          internal_notes: notes,
          updated_at: new Date().toISOString(),
        })
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
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ยืนยันการโอนเงิน</DialogTitle>
          <DialogDescription>
            บันทึกข้อมูลการโอนเงินสำหรับคำขอ {request.transfer_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transfer Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">ข้อมูลการโอน</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Supplier:</span>
                <p className="font-medium">{request.supplier_name}</p>
              </div>
              <div>
                <span className="text-gray-600">จำนวนเงิน:</span>
                <p className="font-medium">{request.transfer_amount.toLocaleString()} {request.currency}</p>
              </div>
            </div>
          </div>

          {/* Actual Transfer Details */}
          <div className="space-y-4">
            <h3 className="font-medium">ข้อมูลการโอนจริง</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transferDate">วันที่โอนจริง</Label>
                <Input
                  id="transferDate"
                  type="date"
                  value={actualTransferDate}
                  onChange={(e) => setActualTransferDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="actualAmount">จำนวนเงินที่โอนจริง ({request.currency})</Label>
                <Input
                  id="actualAmount"
                  type="number"
                  step="0.01"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="exchangeRate">อัตราแลกเปลี่ยนจริง (ไม่บังคับ)</Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.00001"
                value={actualExchangeRate}
                onChange={(e) => setActualExchangeRate(e.target.value ? Number(e.target.value) : "")}
                placeholder="เช่น 35.25"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="font-medium">เอกสารประกอบการโอน</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <Label htmlFor="fileUpload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700">
                  คลิกเพื่อเลือกไฟล์
                </span>
                <span className="text-gray-600"> หรือลากไฟล์มาวางที่นี่</span>
              </Label>
              <Input
                id="fileUpload"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-2">
                รองรับไฟล์: รูปภาพ, PDF, Word (สูงสุด 10MB ต่อไฟล์)
              </p>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">ไฟล์ที่อัปโหลดแล้ว:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">หมายเหตุ (ไม่บังคับ)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="บันทึกเพิ่มเติมเกี่ยวกับการโอนเงิน..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleComplete}
            disabled={saving || uploading || uploadedFiles.length === 0}
          >
            {saving ? "กำลังบันทึก..." : "ยืนยันการโอน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}