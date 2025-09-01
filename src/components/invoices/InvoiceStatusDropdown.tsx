import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  Send,
  XCircle,
  ChevronDown
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  status: string;
}

interface InvoiceStatusDropdownProps {
  invoice: Invoice;
  onStatusUpdate: () => void;
}

const InvoiceStatusDropdown: React.FC<InvoiceStatusDropdownProps> = ({ invoice, onStatusUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'รอวางบิล':
        return { 
          label: 'รอวางบิล', 
          color: 'bg-blue-100 text-blue-800',
          icon: <Clock className="w-4 h-4" />
        };
      case 'วางบิลแล้ว':
        return { 
          label: 'วางบิลแล้ว', 
          color: 'bg-purple-100 text-purple-800',
          icon: <Send className="w-4 h-4" />
        };
      case 'เปิดบิลแล้ว':
        return { 
          label: 'เปิดบิลแล้ว', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: <FileText className="w-4 h-4" />
        };
      case 'สร้างใบส่งสินค้า/ใบกำกับภาษี':
        return { 
          label: 'สร้างใบส่งสินค้า/ใบกำกับภาษี', 
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'ยกเลิก':
        return { 
          label: 'ยกเลิก', 
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4" />
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-800',
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const statusOptions = [
    { value: 'รอวางบิล', label: 'รอวางบิล', icon: <Clock className="w-4 h-4" /> },
    { value: 'วางบิลแล้ว', label: 'วางบิลแล้ว', icon: <Send className="w-4 h-4" /> },
    { value: 'เปิดบิลแล้ว', label: 'เปิดบิลแล้ว', icon: <FileText className="w-4 h-4" /> },
    { value: 'สร้างใบส่งสินค้า/ใบกำกับภาษี', label: 'สร้างใบส่งสินค้า/ใบกำกับภาษี', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'ยกเลิก', label: 'ยกเลิก', icon: <XCircle className="w-4 h-4" /> }
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === invoice.status) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('invoices' as any)
        .update({ status: newStatus })
        .eq('id', invoice.id);

      if (error) throw error;

      toast({
        title: "อัปเดตสถานะสำเร็จ",
        description: `เปลี่ยนสถานะเป็น "${getStatusInfo(newStatus).label}" เรียบร้อยแล้ว`
      });

      onStatusUpdate();

    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStatusInfo = getStatusInfo(invoice.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} className="h-8 text-xs">
          {currentStatusInfo.icon}
          <span className="ml-1">{currentStatusInfo.label}</span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white border shadow-lg z-50" align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`flex items-center gap-2 cursor-pointer hover:bg-gray-100 ${
              option.value === invoice.status ? 'bg-blue-50' : ''
            }`}
          >
            {option.icon}
            <span className={option.value === invoice.status ? 'font-medium' : ''}>
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InvoiceStatusDropdown;