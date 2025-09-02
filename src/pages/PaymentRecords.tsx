import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Eye, CheckCircle, XCircle, Upload, Receipt, RotateCcw, Trash2, MoreHorizontal } from "lucide-react";
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
}

export default function PaymentRecords() {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [taxInvoices, setTaxInvoices] = useState<any[]>([]);
  const [selectedTaxInvoice, setSelectedTaxInvoice] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tax_invoice_id: "",
    payment_method: "โอนเงิน",
    payment_reference: "",
    bank_name: "",
    depositor_name: "",
    amount_received: 0,
    payment_notes: "",
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get tax invoice ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedTaxInvoiceId = urlParams.get('tax_invoice_id');

  useEffect(() => {
    loadPaymentRecords();
    loadTaxInvoices();
    
    // If there's a pre-selected tax invoice, set it in form data
    if (preSelectedTaxInvoiceId) {
      setFormData(prev => ({ ...prev, tax_invoice_id: preSelectedTaxInvoiceId }));
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
      
      if (preSelectedTaxInvoiceId && data) {
        const selectedInvoice = data.find(inv => inv.id === preSelectedTaxInvoiceId);
        if (selectedInvoice) {
          setSelectedTaxInvoice(selectedInvoice);
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

      setUploadedFile(file);
      
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
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
      
      if (uploadedFile) {
        paymentEvidenceUrl = await uploadFileToStorage(uploadedFile);
      }

      const { error } = await supabase
        .from('payment_records')
        .insert({
          ...formData,
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
        payment_reference: "",
        bank_name: "",
        depositor_name: "",
        amount_received: 0,
        payment_notes: "",
      });
      setUploadedFile(null);
      setPreviewUrl(null);
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const paymentRecord = paymentRecords.find(p => p.id === paymentId);
      if (!paymentRecord) return;

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
        toast({
          title: "สำเร็จ",
          description: "ปฏิเสธการชำระเงินเรียบร้อยแล้ว",
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

  const handleResetPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payment_records')
        .update({
          verification_status: 'pending',
          verified_by: null,
          verified_at: null,
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "รีเซ็ตสถานะการชำระเงินเรียบร้อยแล้ว",
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

  const handleDeletePayment = async (paymentId: string) => {
    try {
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
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรายการได้",
        variant: "destructive",
      });
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
            {paymentRecords.map((payment) => (
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
                      วันที่ชำระ: {new Date(payment.payment_date).toLocaleDateString('th-TH')}
                    </Badge>
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
                      {payment.verification_status === 'verified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateReceipt(payment)}
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          สร้างใบเสร็จ
                        </Button>
                      )}
                      {payment.verification_status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyPayment(payment.id, 'verified')}
                          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          สร้างใบเสร็จ
                        </Button>
                      )}
                      <Button
                        variant="outline" 
                        size="sm"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        ที่อื่น
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        ลบ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {paymentRecords.length === 0 && (
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">บันทึกการชำระเงิน</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tax_invoice_id">ใบกำกับภาษี</Label>
                    <Select
                      value={formData.tax_invoice_id}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, tax_invoice_id: value }));
                        const selected = taxInvoices.find(inv => inv.id === value);
                        setSelectedTaxInvoice(selected);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกใบกำกับภาษี" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxInvoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.tax_invoice_number} - {invoice.customer_name} (฿{invoice.total_amount.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTaxInvoice && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">ข้อมูลใบกำกับภาษี</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">เลขที่: </span>
                            {selectedTaxInvoice.tax_invoice_number}
                          </div>
                          <div>
                            <span className="text-muted-foreground">ลูกค้า: </span>
                            {selectedTaxInvoice.customer_name}
                          </div>
                          <div>
                            <span className="text-muted-foreground">จำนวนเงิน: </span>
                            ฿{selectedTaxInvoice.total_amount.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">สถานะ: </span>
                            <Badge variant={selectedTaxInvoice.status === 'paid' ? 'default' : 'secondary'}>
                              {selectedTaxInvoice.status === 'paid' ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment_method">วิธีการชำระ</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="โอนเงิน">โอนเงิน</SelectItem>
                          <SelectItem value="เงินสด">เงินสด</SelectItem>
                          <SelectItem value="เช็ค">เช็ค</SelectItem>
                          <SelectItem value="บัตรเครดิต">บัตรเครดิต</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="amount_received">จำนวนเงินที่รับ</Label>
                      <Input
                        id="amount_received"
                        type="number"
                        step="0.01"
                        value={formData.amount_received}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount_received: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment_reference">หมายเลขอ้างอิง</Label>
                      <Input
                        id="payment_reference"
                        value={formData.payment_reference}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_reference: e.target.value }))}
                        placeholder="หมายเลขการโอน หรืออ้างอิง"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bank_name">ธนาคาร</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                        placeholder="ชื่อธนาคาร"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="depositor_name">ชื่อผู้โอน</Label>
                    <Input
                      id="depositor_name"
                      value={formData.depositor_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositor_name: e.target.value }))}
                      placeholder="ชื่อผู้ทำรายการ"
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_notes">หมายเหตุ</Label>
                    <Textarea
                      id="payment_notes"
                      value={formData.payment_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_notes: e.target.value }))}
                      placeholder="หมายเหตุเพิ่มเติม"
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_evidence">หลักฐานการชำระเงิน</Label>
                    <Input
                      id="payment_evidence"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      อัปโหลดสลิปหรือหลักฐานการชำระเงิน (JPG, PNG, PDF สูงสุด 5MB)
                    </p>
                  </div>

                  {previewUrl && (
                    <div>
                      <Label>ตัวอย่างไฟล์</Label>
                      <img src={previewUrl} alt="Preview" className="max-w-full h-40 object-contain border rounded mt-1" />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      ยกเลิก
                    </Button>
                    <Button onClick={handleAddPayment}>
                      บันทึก
                    </Button>
                  </div>
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
        </div>
      </div>
    </div>
  );
}
