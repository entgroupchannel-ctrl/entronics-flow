import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  CreditCard, 
  RefreshCw, 
  ShoppingCart,
  Clock,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  total_amount: number;
  workflow_status: string;
  process_type?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

interface QuotationWorkflowProps {
  quotation: Quotation;
  onStatusUpdate: () => void;
}

const QuotationWorkflow: React.FC<QuotationWorkflowProps> = ({ quotation, onStatusUpdate }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processType, setProcessType] = useState<string>('standard');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { 
          label: 'ร่าง', 
          color: 'bg-gray-100 text-gray-800',
          icon: <FileText className="w-4 h-4" />
        };
      case 'wait_for_approve':
        return { 
          label: 'รออนุมัติ', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />
        };
      case 'approved':
        return { 
          label: 'อนุมัติแล้ว', 
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'rejected':
        return { 
          label: 'ไม่อนุมัติ', 
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4" />
        };
      case 'invoice_created':
        return { 
          label: 'สร้างใบแจ้งหนี้แล้ว', 
          color: 'bg-blue-100 text-blue-800',
          icon: <FileText className="w-4 h-4" />
        };
      case 'downpayment_invoice':
        return { 
          label: 'มัดจำใบแจ้งหนี้', 
          color: 'bg-purple-100 text-purple-800',
          icon: <CreditCard className="w-4 h-4" />
        };
      case 'conversion_invoice':
        return { 
          label: 'แปลงเป็นใบแจ้งหนี้', 
          color: 'bg-indigo-100 text-indigo-800',
          icon: <RefreshCw className="w-4 h-4" />
        };
      case 'purchase_order_created':
        return { 
          label: 'สร้างใบสั่งซื้อแล้ว', 
          color: 'bg-orange-100 text-orange-800',
          icon: <ShoppingCart className="w-4 h-4" />
        };
      case 'completed':
        return { 
          label: 'เสร็จสิ้น', 
          color: 'bg-green-200 text-green-900',
          icon: <CheckCircle className="w-4 h-4" />
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-800',
          icon: <FileText className="w-4 h-4" />
        };
    }
  };

  const getAvailableActions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft':
        return [
          { id: 'send_for_approval', label: 'ส่งเพื่อขออนุมัติ', icon: <ArrowRight className="w-4 h-4" /> }
        ];
      case 'wait_for_approve':
        return [
          { id: 'approve', label: '✅ อนุมัติ', icon: <CheckCircle className="w-4 h-4" /> },
          { id: 'reject', label: '❌ ไม่อนุมัติ', icon: <XCircle className="w-4 h-4" /> }
        ];
      case 'approved':
        return [
          { id: 'create_invoice', label: '📄 สร้างใบวางบิล/ใบแจ้งหนี้', icon: <FileText className="w-4 h-4" /> },
          { id: 'downpayment_invoice', label: '💰 มัดจำใบวางบิล/ใบแจ้งหนี้', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'conversion_invoice', label: '🔄 แปลงเป็นใบวางบิล/ใบแจ้งหนี้', icon: <RefreshCw className="w-4 h-4" /> },
          { id: 'create_purchase_order', label: '🛒 สร้างใบสั่งซื้อ', icon: <ShoppingCart className="w-4 h-4" /> }
        ];
      default:
        return [];
    }
  };

  const handleAction = async (actionType: string, needsInput: boolean = false) => {
    if (needsInput) {
      setIsDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      let newStatus = quotation.workflow_status;
      let updateData: any = {};

      switch (actionType) {
        case 'send_for_approval':
          newStatus = 'wait_for_approve';
          break;
        case 'approve':
          newStatus = 'approved';
          updateData.approved_at = new Date().toISOString();
          updateData.approved_by = (await supabase.auth.getUser()).data.user?.id;
          break;
        case 'reject':
          newStatus = 'rejected';
          updateData.rejected_at = new Date().toISOString();
          updateData.rejected_by = (await supabase.auth.getUser()).data.user?.id;
          updateData.rejection_reason = notes;
          break;
        case 'create_invoice':
          newStatus = 'invoice_created';
          updateData.process_type = processType;
          break;
        case 'downpayment_invoice':
          newStatus = 'downpayment_invoice';
          updateData.process_type = 'downpayment';
          break;
        case 'conversion_invoice':
          newStatus = 'conversion_invoice';
          updateData.process_type = 'conversion';
          break;
        case 'create_purchase_order':
          newStatus = 'purchase_order_created';
          updateData.process_type = 'purchase_order';
          break;
      }

      const { error } = await supabase
        .from('quotations')
        .update({
          workflow_status: newStatus,
          ...updateData
        })
        .eq('id', quotation.id);

      if (error) throw error;

      toast({
        title: "อัปเดตสถานะสำเร็จ",
        description: `เปลี่ยนสถานะเป็น "${getStatusInfo(newStatus).label}" เรียบร้อยแล้ว`
      });

      setIsDialogOpen(false);
      setNotes('');
      setProcessType('standard');
      onStatusUpdate();

    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogConfirm = () => {
    setIsDialogOpen(false);
    // The actual action will be handled by handleAction
  };

  const statusInfo = getStatusInfo(quotation.workflow_status);
  const availableActions = getAvailableActions(quotation.workflow_status);

  return (
    <div className="flex items-center gap-2">
      <Badge className={statusInfo.color}>
        {statusInfo.icon}
        <span className="ml-1">{statusInfo.label}</span>
      </Badge>

      {availableActions.length > 0 && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading}>
                จัดการ
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {availableActions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => {
                    const needsInput = action.id === 'reject' || action.id === 'approve' || action.id === 'create_invoice';
                    if (needsInput) {
                      setIsDialogOpen(true);
                    } else {
                      handleAction(action.id);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>จัดการใบเสนอราคา {quotation.quotation_number}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">ประเภทกระบวนการ</label>
                  <Select value={processType} onValueChange={setProcessType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Process</SelectItem>
                      <SelectItem value="downpayment">Down Payment Process</SelectItem>
                      <SelectItem value="conversion">Conversion Process</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">หมายเหตุ</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="หมายเหตุเพิ่มเติม..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleDialogConfirm}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default QuotationWorkflow;