import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Eye, CheckCircle, XCircle, Upload, Receipt, RotateCcw, Trash2, MoreHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/Sidebar";

interface PaymentRecord {
  id: string;
  payment_number: string;
  tax_invoice_id: string;
  payment_date: string;
  payment_method: string;
  payment_reference?: string;
  bank_name?: string;
  depositor_name?: string;
  amount_received: number;
  verification_status: string;
  verified_by?: string;
  verified_at?: string;
  payment_notes?: string;
  tax_invoices?: {
    tax_invoice_number: string;
    customer_name: string;
    total_amount: number;
  };
  receipts?: Array<{
    id: string;
    receipt_number: string;
    receipt_date: string;
    total_amount: number;
    payment_status: string;
  }>;
}

export default function PaymentRecords() {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'reset' | 'reject';
    payment: PaymentRecord;
    onConfirm: () => void;
  } | null>(null);
  const [taxInvoices, setTaxInvoices] = useState<any[]>([]);
  const [selectedTaxInvoice, setSelectedTaxInvoice] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tax_invoice_id: "",
    payment_method: "โอนเงิน",
    payment_date: new Date().toISOString().slice(0, 16),
    payment_reference: "",
    bank_name: "",
    depositor_name: "",
    amount_received: 0,
    payment_notes: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [customBankName, setCustomBankName] = useState<string>('');

  // Get tax invoice ID from URL parameters
  const preSelectedTaxInvoiceId = searchParams.get('invoice');

  useEffect(() => {
    loadPaymentRecords();
    loadTaxInvoices();
    
    // If there's a pre-selected tax invoice, set it in form data and open add form
    if (preSelectedTaxInvoiceId) {
      setFormData(prev => ({ ...prev, tax_invoice_id: preSelectedTaxInvoiceId }));
      setShowAddForm(true);
    }
  }, [preSelectedTaxInvoiceId]);

  const loadPaymentRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_records')
        .select(`
          *,
          tax_invoices (
            tax_invoice_number,
            customer_name,
            total_amount
          ),
          receipts (
            id,
            receipt_number,
            receipt_date,
            total_amount,
            payment_status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentRecords(data || []);
    } catch (error) {
      console.error('Error loading payment records:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลการชำระเงินได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTaxInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_invoices')
        .select('id, tax_invoice_number, customer_name, total_amount, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaxInvoices(data || []);
      
      // Auto-fill form data if there's a preselected invoice
      if (preSelectedTaxInvoiceId && data) {
        const selectedInvoice = data.find(inv => inv.id === preSelectedTaxInvoiceId);
        if (selectedInvoice) {
          setSelectedTaxInvoice(selectedInvoice);
          // Auto-fill the amount with invoice total
          setFormData(prev => ({ 
            ...prev, 
            tax_invoice_id: preSelectedTaxInvoiceId,
            amount_received: selectedInvoice.total_amount 
          }));
        }
      }
    } catch (error) {
      console.error('Error loading tax invoices:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "ไฟล์ไม่ถูกต้อง",
          description: "กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, GIF) หรือ PDF",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ไฟล์ใหญ่เกินไป",
          description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl('');
      }
    }
  };

  const uploadFileToStorage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `payment-evidence/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-evidence')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      return filePath;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleAddPayment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "กรุณาเข้าสู่ระบบก่อน",
          variant: "destructive",
        });
        return;
      }

      let paymentEvidenceUrl = null;
      
      if (selectedFile) {
        paymentEvidenceUrl = await uploadFileToStorage(selectedFile);
      }

      const { error } = await supabase
        .from('payment_records')
        .insert({
          ...formData,
          bank_name: formData.bank_name === 'อื่นๆ' ? customBankName : formData.bank_name,
          payment_evidence_url: paymentEvidenceUrl,
          created_by: user.id,
        } as any);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "บันทึกการชำระเงินเรียบร้อยแล้ว",
      });

      setShowAddForm(false);
      setFormData({
        tax_invoice_id: "",
        payment_method: "โอนเงิน",
        payment_date: new Date().toISOString().slice(0, 16),
        payment_reference: "",
        bank_name: "",
        depositor_name: "",
        amount_received: 0,
        payment_notes: "",
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setCustomBankName('');
      loadPaymentRecords();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการชำระเงินได้",
        variant: "destructive",
      });
    }
  };

  const createReceiptFromPayment = async (paymentRecord: PaymentRecord) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: taxInvoice, error: taxInvoiceError } = await supabase
        .from('tax_invoices')
        .select('*')
        .eq('id', paymentRecord.tax_invoice_id)
        .single();

      if (taxInvoiceError) throw taxInvoiceError;

      const receiptData = {
        tax_invoice_id: paymentRecord.tax_invoice_id,
        payment_record_id: paymentRecord.id,
        customer_id: taxInvoice.customer_id,
        customer_name: taxInvoice.customer_name,
        customer_address: taxInvoice.customer_address,
        customer_phone: taxInvoice.customer_phone,
        customer_email: taxInvoice.customer_email,
        subtotal: taxInvoice.subtotal,
        discount_amount: taxInvoice.discount_amount,
        discount_percentage: taxInvoice.discount_percentage,
        vat_amount: taxInvoice.vat_amount,
        withholding_tax_amount: taxInvoice.withholding_tax_amount,
        total_amount: taxInvoice.total_amount,
        amount_paid: paymentRecord.amount_received,
        amount_change: Math.max(0, paymentRecord.amount_received - taxInvoice.total_amount),
        payment_method: paymentRecord.payment_method,
        payment_reference: paymentRecord.payment_reference,
        bank_name: paymentRecord.bank_name,
        can_issue_receipt: true,
        created_by: user.id,
      } as any;

      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert(receiptData)
        .select()
        .single();

      if (receiptError) throw receiptError;

      return receipt;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const paymentRecord = paymentRecords.find(p => p.id === paymentId);
    if (!paymentRecord) return;

    const executeVerification = async () => {
      try {
        // Check if rejecting a payment with existing receipts
        if (status === 'rejected' && paymentRecord.receipts && paymentRecord.receipts.length > 0) {
          // Cancel linked receipts
          for (const receipt of paymentRecord.receipts) {
            const { error: receiptError } = await supabase
              .from('receipts')
              .update({
                payment_status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', receipt.id);

            if (receiptError) {
              console.error('Error cancelling receipt:', receiptError);
              toast({
                title: "เกิดข้อผิดพลาด",
                description: `ไม่สามารถยกเลิกใบเสร็จ ${receipt.receipt_number} ได้`,
                variant: "destructive",
              });
              return;
            }
          }
        }

        const { error } = await supabase
          .from('payment_records')
          .update({
            verification_status: status,
            verified_by: user.id,
            verified_at: new Date().toISOString(),
          })
          .eq('id', paymentId);

        if (error) throw error;

        if (status === 'verified') {
          try {
            const receipt = await createReceiptFromPayment(paymentRecord);
            toast({
              title: "สำเร็จ",
              description: `ยืนยันการชำระเงินและสร้างใบเสร็จ ${receipt.receipt_number} เรียบร้อยแล้ว`,
            });
          } catch (receiptError) {
            console.error('Error creating receipt:', receiptError);
            toast({
              title: "ยืนยันการชำระเงินสำเร็จ",
              description: "แต่เกิดข้อผิดพลาดในการสร้างใบเสร็จ กรุณาสร้างใบเสร็จด้วยตนเอง",
              variant: "destructive",
            });
          }
        } else {
          const message = paymentRecord.receipts && paymentRecord.receipts.length > 0
            ? `ปฏิเสธการชำระเงินและยกเลิกใบเสร็จ ${paymentRecord.receipts[0].receipt_number} เรียบร้อยแล้ว`
            : "ปฏิเสธการชำระเงินเรียบร้อยแล้ว";

          toast({
            title: "สำเร็จ",
            description: message,
          });
        }

        loadPaymentRecords();
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถยืนยันการชำระเงินได้",
          variant: "destructive",
        });
      }
    };

    // Check if rejecting a payment with existing receipts and show confirmation
    if (status === 'rejected' && paymentRecord.receipts && paymentRecord.receipts.length > 0) {
      showConfirmation('reject', paymentRecord, executeVerification);
    } else {
      executeVerification();
    }
  };

  const handleCreateReceipt = async (paymentRecord: PaymentRecord) => {
    try {
      const receipt = await createReceiptFromPayment(paymentRecord);
      toast({
        title: "สำเร็จ",
        description: `สร้างใบเสร็จ ${receipt.receipt_number} เรียบร้อยแล้ว`,
      });
      loadPaymentRecords();
    } catch (error) {
      console.error('Error creating receipt:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างใบเสร็จได้",
        variant: "destructive",
      });
    }
  };

  const showConfirmation = (type: 'reset' | 'reject', payment: PaymentRecord, onConfirm: () => void) => {
    setConfirmAction({ type, payment, onConfirm });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction.onConfirm();
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  };

  const handleResetPayment = async (paymentId: string) => {
    const paymentRecord = paymentRecords.find(p => p.id === paymentId);
    if (!paymentRecord) return;

    const executeReset = async () => {
      try {
        // Check if there are linked receipts
        if (paymentRecord.receipts && paymentRecord.receipts.length > 0) {
          // Cancel linked receipts
          for (const receipt of paymentRecord.receipts) {
            const { error: receiptError } = await supabase
              .from('receipts')
              .update({
                payment_status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', receipt.id);

            if (receiptError) {
              console.error('Error cancelling receipt:', receiptError);
              toast({
                title: "เกิดข้อผิดพลาด",
                description: `ไม่สามารถยกเลิกใบเสร็จ ${receipt.receipt_number} ได้`,
                variant: "destructive",
              });
              return;
            }
          }
        }

        const { error } = await supabase
          .from('payment_records')
          .update({
            verification_status: 'pending',
            verified_by: null,
            verified_at: null,
          })
          .eq('id', paymentId);

        if (error) throw error;

        const message = paymentRecord.receipts && paymentRecord.receipts.length > 0
          ? `รีเซ็ตสถานะการชำระเงินและยกเลิกใบเสร็จ ${paymentRecord.receipts[0].receipt_number} เรียบร้อยแล้ว`
          : "รีเซ็ตสถานะการชำระเงินเรียบร้อยแล้ว";

        toast({
          title: "สำเร็จ",
          description: message,
        });
        loadPaymentRecords();
      } catch (error) {
        console.error('Error resetting payment:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถรีเซ็ตสถานะได้",
          variant: "destructive",
        });
      }
    };

    // Check if there are linked receipts and show confirmation
    if (paymentRecord.receipts && paymentRecord.receipts.length > 0) {
      showConfirmation('reset', paymentRecord, executeReset);
    } else {
      executeReset();
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      // First check if there are receipts referencing this payment
      const { data: receipts, error: checkError } = await supabase
        .from('receipts')
        .select('id')
        .eq('payment_record_id', paymentId);

      if (checkError) throw checkError;

      if (receipts && receipts.length > 0) {
        toast({
          title: "ไม่สามารถลบได้",
          description: "ไม่สามารถลบรายการชำระเงินนี้ได้เนื่องจากมีใบเสร็จที่เชื่อมโยงอยู่",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('payment_records')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "ลบรายการชำระเงินเรียบร้อยแล้ว",
      });
      loadPaymentRecords();
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      
      // Handle foreign key constraint errors specifically
      if (error.code === '23503') {
        toast({
          title: "ไม่สามารถลบได้",
          description: "ไม่สามารถลบรายการชำระเงินนี้ได้เนื่องจากมีข้อมูลที่เชื่อมโยงอยู่ (เช่น ใบเสร็จ)",
          variant: "destructive",
        });
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบรายการได้",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background relative">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">รายการชำระเงิน</h1>
              <p className="text-muted-foreground">
                จัดการและตรวจสอบการชำระเงินจากลูกค้า
              </p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              บันทึกการชำระเงิน
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">รออนุมัติ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentRecords.filter(p => p.verification_status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">รายการรอตรวจสอบ</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ยืนยันแล้ว</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentRecords.filter(p => p.verification_status === 'verified').length}
                </div>
                <p className="text-xs text-muted-foreground">รายการที่ยืนยันแล้ว</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ปฏิเสธ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentRecords.filter(p => p.verification_status === 'rejected').length}
                </div>
                <p className="text-xs text-muted-foreground">รายการที่ปฏิเสธ</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">รวมเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ฿{paymentRecords
                    .filter(p => p.verification_status === 'verified')
                    .reduce((sum, p) => sum + p.amount_received, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">เงินที่รับแล้ว</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Records Cards */}
          <div className="space-y-4">
            {paymentRecords
              .filter(payment => preSelectedTaxInvoiceId ? payment.tax_invoice_id === preSelectedTaxInvoiceId : true)
              .map((payment) => (
              <Card key={payment.id} className="p-0">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mb-4">
                    {/* Payment Number & Customer */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">หมายเลขการชำระ</div>
                      <div className="text-lg font-semibold text-blue-600 font-mono">
                        {payment.payment_number}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {payment.tax_invoices?.customer_name}
                      </div>
                    </div>

                    {/* Tax Invoice */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">ใบกำกับภาษี</div>
                      <div className="text-lg font-semibold font-mono">
                        {payment.tax_invoices?.tax_invoice_number}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {payment.payment_method}
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">จำนวนเงิน</div>
                      <div className="text-2xl font-bold text-green-600">
                        ฿{payment.amount_received.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {new Date(payment.payment_date).toLocaleDateString('th-TH')}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetailsPanel(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        ดูรายละเอียด
                      </Button>
                    </div>
                  </div>

                  {/* Payment Info Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      วิธีชำระ: {payment.payment_method}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      วันเวลาชำระ: {new Date(payment.payment_date).toLocaleDateString('th-TH')} {new Date(payment.payment_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                    {/* Receipt Link */}
                    {payment.receipts && payment.receipts.length > 0 && (
                      <Badge 
                        variant="outline" 
                        className={
                          payment.receipts[0].payment_status === 'cancelled'
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }
                      >
                        {payment.receipts[0].payment_status === 'cancelled' ? '❌' : '🧾'} 
                        {payment.receipts[0].payment_status === 'cancelled' ? 'ใบเสร็จยกเลิก' : 'เชื่อมโยงใบเสร็จ'}: {payment.receipts[0].receipt_number}
                      </Badge>
                    )}
                    <div className="ml-auto">
                      {payment.verification_status === 'verified' && (
                        <Badge className="bg-green-100 text-green-800 border border-green-200">
                          ยืนยันแล้ว
                        </Badge>
                      )}
                      {payment.verification_status === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                          รอตรวจสอบ
                        </Badge>
                      )}
                      {payment.verification_status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-800 border border-red-200">
                          ปฏิเสธ
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {/* Show different buttons based on status and receipt existence */}
                      {payment.verification_status === 'verified' && (!payment.receipts || payment.receipts.length === 0 || payment.receipts[0].payment_status === 'cancelled') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateReceipt(payment)}
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          {payment.receipts && payment.receipts.length > 0 && payment.receipts[0].payment_status === 'cancelled' 
                            ? 'สร้างใบเสร็จใหม่' 
                            : 'สร้างใบเสร็จ'}
                        </Button>
                      )}
                      
                      {payment.verification_status === 'verified' && payment.receipts && payment.receipts.length > 0 && payment.receipts[0].payment_status !== 'cancelled' && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ✅ สร้างใบเสร็จแล้ว: {payment.receipts[0].receipt_number}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            ({new Date(payment.receipts[0].receipt_date).toLocaleDateString('th-TH')})
                          </span>
                        </div>
                      )}
                      
                      {payment.verification_status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyPayment(payment.id, 'verified')}
                          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          ยืนยันและสร้างใบเสร็จ
                        </Button>
                      )}
                      
                      {payment.verification_status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyPayment(payment.id, 'rejected')}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          ปฏิเสธ
                        </Button>
                      )}
                      
                      {payment.verification_status !== 'pending' && (
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResetPayment(payment.id)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          รีเซ็ต
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={payment.receipts && payment.receipts.length > 0 && payment.receipts[0].payment_status !== 'cancelled'}
                        title={
                          payment.receipts && payment.receipts.length > 0 && payment.receipts[0].payment_status !== 'cancelled'
                            ? "ไม่สามารถลบได้เนื่องจากมีใบเสร็จที่เชื่อมโยงอยู่" 
                            : "ลบรายการชำระเงิน"
                        }
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        ลบ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {paymentRecords
              .filter(payment => preSelectedTaxInvoiceId ? payment.tax_invoice_id === preSelectedTaxInvoiceId : true)
              .length === 0 && (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center text-muted-foreground">
                    ไม่มีรายการชำระเงิน
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Add Payment Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
              <div className="bg-white rounded-lg p-3 w-full max-w-4xl max-h-[98vh] overflow-y-auto relative">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold">บันทึกการชำระเงิน</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="p-1 h-8 w-8 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="tax_invoice_id" className="text-sm font-semibold">ใบกำกับภาษี</Label>
                      <Select
                        value={formData.tax_invoice_id}
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, tax_invoice_id: value }));
                          const selected = taxInvoices.find(inv => inv.id === value);
                          if (selected) {
                            setSelectedTaxInvoice(selected);
                            // Auto-fill amount with invoice total
                            setFormData(prev => ({ ...prev, amount_received: selected.total_amount }));
                          }
                        }}
                      >
                        <SelectTrigger className="text-sm h-10 bg-gray-50 border-gray-200 hover:bg-gray-100">
                          <SelectValue placeholder="เลือกใบกำกับภาษี" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-[100]">
                          {taxInvoices.map((invoice) => (
                            <SelectItem key={invoice.id} value={invoice.id} className="text-sm py-2 bg-white hover:bg-gray-100">
                              {invoice.tax_invoice_number} - {invoice.customer_name} (฿{invoice.total_amount.toLocaleString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="payment_date" className="text-sm font-semibold">วันที่ชำระ</Label>
                        <Input
                          id="payment_date"
                          type="datetime-local"
                          value={formData.payment_date || new Date().toISOString().slice(0, 16)}
                          onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                          className="text-sm h-10 bg-gray-50 border-gray-200 hover:bg-gray-100"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="payment_method" className="text-sm font-semibold">วิธีการชำระ</Label>
                        <Select
                          value={formData.payment_method}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                        >
                          <SelectTrigger className="text-sm h-10 bg-gray-50 border-gray-200 hover:bg-gray-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border shadow-lg z-[100]">
                            <SelectItem value="โอนเงิน" className="text-sm py-2 bg-white hover:bg-gray-100">โอนเงิน</SelectItem>
                            <SelectItem value="เงินสด" className="text-sm py-2 bg-white hover:bg-gray-100">เงินสด</SelectItem>
                            <SelectItem value="เช็ค" className="text-sm py-2 bg-white hover:bg-gray-100">เช็ค</SelectItem>
                            <SelectItem value="บัตรเครดิต" className="text-sm py-2 bg-white hover:bg-gray-100">บัตรเครดิต</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="amount_received" className="text-sm font-semibold">
                        จำนวนเงินที่รับ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amount_received"
                        type="number"
                        step="0.01"
                        value={formData.amount_received}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount_received: parseFloat(e.target.value) || 0 }))}
                        required
                        className={`text-base font-bold h-12 bg-gray-50 border-gray-200 hover:bg-gray-100 ${formData.amount_received <= 0 ? "border-red-300 focus:border-red-500" : ""}`}
                        placeholder="0.00"
                      />
                      {formData.amount_received <= 0 && (
                        <p className="text-red-500 text-xs mt-1 font-medium">กรุณากรอกจำนวนเงินที่รับ</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="payment_reference" className="text-sm font-semibold">หมายเลขอ้างอิง</Label>
                        <Input
                          id="payment_reference"
                          value={formData.payment_reference}
                          onChange={(e) => setFormData(prev => ({ ...prev, payment_reference: e.target.value }))}
                          placeholder="หมายเลขการโอน หรืออ้างอิง"
                          className="text-sm h-10 bg-gray-50 border-gray-200 hover:bg-gray-100"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bank_name" className="text-sm font-semibold">ธนาคาร</Label>
                        <Select
                          value={formData.bank_name}
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, bank_name: value }));
                            if (value !== 'อื่นๆ') {
                              setCustomBankName('');
                            }
                          }}
                        >
                          <SelectTrigger className="text-sm h-10 bg-gray-50 border-gray-200 hover:bg-gray-100">
                            <SelectValue placeholder="เลือกธนาคาร" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border shadow-lg z-[100]">
                            <SelectItem value="กสิกรไทย" className="text-sm py-2 bg-white hover:bg-gray-100">ธ.กสิกรไทย</SelectItem>
                            <SelectItem value="กรุงเทพ" className="text-sm py-2 bg-white hover:bg-gray-100">ธ.กรุงเทพ</SelectItem>
                            <SelectItem value="ไทยพาณิชย์" className="text-sm py-2 bg-white hover:bg-gray-100">ธ.ไทยพาณิชย์</SelectItem>
                            <SelectItem value="กรุงไทย" className="text-sm py-2 bg-white hover:bg-gray-100">ธ.กรุงไทย</SelectItem>
                            <SelectItem value="กรุงศรีอยุธยา" className="text-sm py-2 bg-white hover:bg-gray-100">ธ.กรุงศรีอยุธยา</SelectItem>
                            <SelectItem value="อื่นๆ" className="text-sm py-2 bg-white hover:bg-gray-100">อื่นๆ (ระบุ)</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.bank_name === 'อื่นๆ' && (
                          <Input
                            value={customBankName}
                            onChange={(e) => setCustomBankName(e.target.value)}
                            placeholder="กรุณาระบุชื่อธนาคาร"
                            className="text-sm h-10 bg-gray-50 border-gray-200 hover:bg-gray-100 mt-2"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="depositor_name" className="text-sm font-semibold">ชื่อผู้โอน</Label>
                      <Input
                        id="depositor_name"
                        value={formData.depositor_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, depositor_name: e.target.value }))}
                        placeholder="ชื่อผู้ทำรายการ"
                        className="text-sm h-10 bg-gray-50 border-gray-200 hover:bg-gray-100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_notes" className="text-sm font-semibold">หมายเหตุ</Label>
                      <Textarea
                        id="payment_notes"
                        value={formData.payment_notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_notes: e.target.value }))}
                        placeholder="หมายเหตุเพิ่มเติม"
                        rows={2}
                        className="text-sm bg-gray-50 border-gray-200 hover:bg-gray-100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_evidence" className="text-sm font-semibold">หลักฐานการชำระเงิน</Label>
                      <Input
                        id="payment_evidence"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="mt-1 text-sm h-10 bg-gray-50 border-gray-200 hover:bg-gray-100"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        อัปโหลดสลิปหรือหลักฐานการชำระเงิน (JPG, PNG, PDF สูงสุด 5MB)
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Preview and Summary */}
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <h3 className="text-sm font-bold mb-2">ตัวอย่างหลักฐาน</h3>
                      {previewUrl ? (
                        <div className="space-y-1">
                          <div className="border rounded-lg overflow-hidden bg-white">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="w-full h-32 object-contain"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl('');
                              // Clear file input
                              const fileInput = document.getElementById('payment_evidence') as HTMLInputElement;
                              if (fileInput) fileInput.value = '';
                            }}
                            className="w-full text-xs h-7"
                          >
                            ลบไฟล์
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                          <div className="text-lg mb-1">📄</div>
                          <p className="text-xs font-medium">ยังไม่ได้เลือกไฟล์</p>
                          <p className="text-xs">อัปโหลดสลิปหรือหลักฐาน</p>
                        </div>
                      )}
                    </div>

                    {/* Summary Info */}
                    {selectedTaxInvoice && (
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                        <h3 className="text-sm font-bold mb-1 text-blue-800">ข้อมูลใบกำกับภาษี</h3>
                        <div className="space-y-1 text-xs">
                          <div><strong>เลขที่:</strong> <span className="font-mono">{selectedTaxInvoice.tax_invoice_number}</span></div>
                          <div><strong>ลูกค้า:</strong> {selectedTaxInvoice.customer_name}</div>
                          <div><strong>ยอดรวม:</strong> <span className="text-sm font-bold text-blue-600">฿{selectedTaxInvoice.total_amount.toLocaleString()}</span></div>
                          <div>
                            <strong>สถานะ:</strong> 
                            <Badge variant={selectedTaxInvoice.status === 'paid' ? 'default' : 'secondary'} className="ml-1 text-xs">
                              {selectedTaxInvoice.status === 'paid' ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.amount_received > 0 && selectedTaxInvoice && (
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                        <h3 className="text-sm font-bold mb-1 text-green-800">สรุปการชำระเงิน</h3>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>ยอดที่ต้องชำระ:</span>
                            <span className="font-bold">฿{selectedTaxInvoice.total_amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ยอดที่รับ:</span>
                            <span className="font-bold text-green-600">฿{formData.amount_received.toLocaleString()}</span>
                          </div>
                          <hr className="border-green-200" />
                          <div className="flex justify-between font-bold">
                            <span>ส่วนต่าง:</span>
                            <span className={formData.amount_received - selectedTaxInvoice.total_amount >= 0 ? "text-green-600" : "text-red-600"}>
                              ฿{(formData.amount_received - selectedTaxInvoice.total_amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t mt-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedFile(null);
                      setPreviewUrl('');
                      setSelectedTaxInvoice(null);
                      setCustomBankName('');
                    }}
                    className="text-sm px-4 py-2"
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    onClick={handleAddPayment}
                    disabled={formData.amount_received <= 0 || !formData.tax_invoice_id}
                    className="text-sm font-bold px-4 py-2"
                  >
                    บันทึก
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Details Panel */}
          {showDetailsPanel && selectedPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">รายละเอียดการชำระเงิน</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>หมายเลขการชำระ</Label>
                      <div className="font-mono text-blue-600">{selectedPayment.payment_number}</div>
                    </div>
                    <div>
                      <Label>ใบกำกับภาษี</Label>
                      <div className="font-mono">{selectedPayment.tax_invoices?.tax_invoice_number}</div>
                    </div>
                    <div>
                      <Label>ลูกค้า</Label>
                      <div>{selectedPayment.tax_invoices?.customer_name}</div>
                    </div>
                    <div>
                      <Label>จำนวนเงิน</Label>
                      <div className="font-bold text-green-600">฿{selectedPayment.amount_received.toLocaleString()}</div>
                    </div>
                    <div>
                      <Label>วิธีการชำระ</Label>
                      <div>{selectedPayment.payment_method}</div>
                    </div>
                    <div>
                      <Label>วันที่ชำระ</Label>
                      <div>{new Date(selectedPayment.payment_date).toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                  
                  {selectedPayment.payment_reference && (
                    <div>
                      <Label>หมายเลขอ้างอิง</Label>
                      <div>{selectedPayment.payment_reference}</div>
                    </div>
                  )}
                  
                  {selectedPayment.bank_name && (
                    <div>
                      <Label>ธนาคาร</Label>
                      <div>{selectedPayment.bank_name}</div>
                    </div>
                  )}
                  
                  {selectedPayment.depositor_name && (
                    <div>
                      <Label>ผู้โอน</Label>
                      <div>{selectedPayment.depositor_name}</div>
                    </div>
                  )}
                  
                  {selectedPayment.payment_notes && (
                    <div>
                      <Label>หมายเหตุ</Label>
                      <div>{selectedPayment.payment_notes}</div>
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setShowDetailsPanel(false)}>
                      ปิด
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Beautiful Confirmation Dialog */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-lg">
                  {confirmAction?.type === 'reset' ? (
                    <>
                      <RotateCcw className="w-5 h-5 text-orange-500" />
                      ยืนยันการรีเซ็ต
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      ยืนยันการปฏิเสธ
                    </>
                  )}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base space-y-3">
                  {confirmAction?.type === 'reset' ? (
                    <div className="space-y-2">
                      <p>การรีเซ็ตจะยกเลิกใบเสร็จที่เชื่อมโยงอยู่:</p>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="text-orange-800 font-medium">
                          📋 {confirmAction.payment.receipts?.[0]?.receipt_number}
                        </div>
                        <div className="text-orange-600 text-sm">
                          วันที่: {confirmAction.payment.receipts?.[0]?.receipt_date && new Date(confirmAction.payment.receipts[0].receipt_date).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                      <p className="text-gray-600">ต้องการดำเนินการต่อหรือไม่?</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>การปฏิเสธจะยกเลิกใบเสร็จที่เชื่อมโยงอยู่:</p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-red-800 font-medium">
                          📋 {confirmAction?.payment.receipts?.[0]?.receipt_number}
                        </div>
                        <div className="text-red-600 text-sm">
                          วันที่: {confirmAction?.payment.receipts?.[0]?.receipt_date && new Date(confirmAction.payment.receipts[0].receipt_date).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                      <p className="text-gray-600">ต้องการดำเนินการต่อหรือไม่?</p>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300">
                  ยกเลิก
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleConfirmAction}
                  className={
                    confirmAction?.type === 'reset' 
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }
                >
                  {confirmAction?.type === 'reset' ? 'ยืนยันรีเซ็ต' : 'ยืนยันปฏิเสธ'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
