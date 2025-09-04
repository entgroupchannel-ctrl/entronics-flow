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

        <div className="space-y-8">
          {/* Transfer Information Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">วันที่และเวลาการโอน</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">กรุณาระบุเวลาที่ทำการโอนเงินจริง</p>
              </div>
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
              <Input
                id="transfer-date"
                type="datetime-local"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="pl-12 h-12 bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">เอกสารประกอบการโอน</h3>
                <p className="text-sm text-green-700 dark:text-green-300">อัปโหลดหลักฐานการโอนเงิน</p>
              </div>
            </div>

            {/* Transfer Slip Upload */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">สลิปการโอนเงิน</Label>
                    <p className="text-sm text-muted-foreground">หลักฐานการโอนเงินจากธนาคาร</p>
                  </div>
                </div>
                {uploadedFiles.some(f => f.includes('transfer_slip')) && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">อัปโหลดแล้ว</span>
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => transferSlipRef.current?.click()}
                disabled={loading}
                className="w-full h-12 border-dashed border-2 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                เลือกไฟล์สลิปโอนเงิน
              </Button>
              
              {uploadedFiles.filter(f => f.includes('transfer_slip')).length > 0 && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        สลิปโอนเงิน - อัปโหลดสำเร็จ
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(uploadedFiles.find(f => f.includes('transfer_slip')), '_blank')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Eye className="h-4 w-4" />
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
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">เอกสารยืนยันการโอน</Label>
                    <p className="text-sm text-muted-foreground">เอกสารอื่น ๆ ที่เกี่ยวข้องกับการโอน</p>
                  </div>
                </div>
                {uploadedFiles.some(f => f.includes('confirmation')) && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">อัปโหลดแล้ว</span>
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => confirmationRef.current?.click()}
                disabled={loading}
                className="w-full h-12 border-dashed border-2 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                เลือกเอกสารยืนยัน
              </Button>
              
              {uploadedFiles.filter(f => f.includes('confirmation')).length > 0 && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        เอกสารยืนยัน - อัปโหลดสำเร็จ
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(uploadedFiles.find(f => f.includes('confirmation')), '_blank')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Eye className="h-4 w-4" />
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
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <Label htmlFor="notes" className="text-base font-medium">หมายเหตุเพิ่มเติม</Label>
                <p className="text-sm text-muted-foreground">ข้อมูลเพิ่มเติมเกี่ยวกับการโอนเงิน (ถ้ามี)</p>
              </div>
            </div>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="กรอกหมายเหตุเพิ่มเติมเกี่ยวกับการโอนเงิน..."
              rows={4}
              className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
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