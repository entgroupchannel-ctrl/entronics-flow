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
import { Upload, FileText, Calendar, Clock, Check, Eye } from "lucide-react";

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
    new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm for datetime-local
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
        transfer_executed_at: new Date(transferDate).toISOString(),
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
          {/* Transfer Information Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">วันที่และเวลาการโอน</h3>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
              <Input
                id="transfer-date"
                type="datetime-local"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 focus:border-blue-500"
              />
            </div>
          </div>

          {/* File Upload Section - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transfer Slip Upload */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-orange-600" />
                <div>
                  <Label className="font-medium">สลิปการโอนเงิน</Label>
                  {uploadedFiles.some(f => f.includes('transfer_slip')) && (
                    <Check className="h-4 w-4 text-green-600 inline ml-2" />
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => transferSlipRef.current?.click()}
                disabled={loading}
                className="w-full h-10 border-dashed border-2 hover:border-orange-400 text-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                เลือกไฟล์สลิป
              </Button>
              
              {uploadedFiles.filter(f => f.includes('transfer_slip')).length > 0 && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-800 dark:text-green-200">อัปโหลดสำเร็จ</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(uploadedFiles.find(f => f.includes('transfer_slip')), '_blank')}
                      className="h-6 px-2 text-green-600"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              <input
                ref={transferSlipRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e, "transfer_slip")}
                className="hidden"
              />
            </div>

            {/* Confirmation Document Upload */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-purple-600" />
                <div>
                  <Label className="font-medium">เอกสารยืนยัน</Label>
                  {uploadedFiles.some(f => f.includes('confirmation')) && (
                    <Check className="h-4 w-4 text-green-600 inline ml-2" />
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => confirmationRef.current?.click()}
                disabled={loading}
                className="w-full h-10 border-dashed border-2 hover:border-purple-400 text-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                เลือกเอกสาร
              </Button>
              
              {uploadedFiles.filter(f => f.includes('confirmation')).length > 0 && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-800 dark:text-green-200">อัปโหลดสำเร็จ</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(uploadedFiles.find(f => f.includes('confirmation')), '_blank')}
                      className="h-6 px-2 text-green-600"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              <input
                ref={confirmationRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e, "confirmation")}
                className="hidden"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <Label htmlFor="notes" className="flex items-center gap-2 mb-2 font-medium">
              <FileText className="h-4 w-4 text-gray-600" />
              หมายเหตุเพิ่มเติม
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="กรอกหมายเหตุเพิ่มเติม..."
              rows={2}
              className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 resize-none"
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