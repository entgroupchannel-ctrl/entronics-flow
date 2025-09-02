import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Eye, CheckCircle, XCircle, Upload } from "lucide-react";
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
      console.log('Tax invoices loaded:', data); // Debug log
      setTaxInvoices(data || []);
      
      // If there's a pre-selected tax invoice, find and set the selected invoice
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
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "ไฟล์ไม่ถูกต้อง",
          description: "กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, GIF) หรือ PDF",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ไฟล์ใหญ่เกินไป",
          description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      
      // Create preview URL for images
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
      
      // Upload file if selected
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

      // Get tax invoice details
      const { data: taxInvoice, error: taxInvoiceError } = await supabase
        .from('tax_invoices')
        .select('*')
        .eq('id', paymentRecord.tax_invoice_id)
        .single();

      if (taxInvoiceError) throw taxInvoiceError;

      // Create receipt (without receipt_number - it will be auto-generated by trigger)
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

      // Get tax invoice items to create receipt items
      const { data: taxInvoiceItems, error: itemsError } = await supabase
        .from('tax_invoice_items')
        .select('*')
        .eq('tax_invoice_id', paymentRecord.tax_invoice_id);

      if (itemsError) throw itemsError;

      // Create receipt items based on tax invoice items
      if (taxInvoiceItems && taxInvoiceItems.length > 0) {
        const receiptItems = taxInvoiceItems.map((item, index) => ({
          receipt_id: receipt.id,
          sequence_number: index + 1,
          document_number: taxInvoice.tax_invoice_number,
          document_date: taxInvoice.tax_invoice_date,
          due_date: taxInvoice.tax_invoice_date, // Same as invoice date for receipts
          subtotal_before_tax: item.line_total,
          payment_amount: item.line_total,
        }));

        const { error: receiptItemsError } = await supabase
          .from('receipt_items')
          .insert(receiptItems);

        if (receiptItemsError) throw receiptItemsError;
      }

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

      // Find the payment record
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

      // If payment is verified, automatically create receipt
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">ยืนยันแล้ว</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">ปฏิเสธ</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">รอตรวจสอบ</Badge>;
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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">การชำระเงิน</h1>
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
                <CardTitle className="text-sm font-medium">ยอดรวมวันนี้</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{paymentRecords
                    .filter(p => p.verification_status === 'verified' && 
                      new Date(p.payment_date).toDateString() === new Date().toDateString())
                    .reduce((sum, p) => sum + p.amount_received, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">เงินที่รับวันนี้</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ยอดรวมเดือน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{paymentRecords
                    .filter(p => p.verification_status === 'verified' && 
                      new Date(p.payment_date).getMonth() === new Date().getMonth())
                    .reduce((sum, p) => sum + p.amount_received, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">เงินที่รับเดือนนี้</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>รายการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>หมายเลขการชำระ</TableHead>
                      <TableHead>ใบกำกับภาษี</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>วิธีการชำระ</TableHead>
                      <TableHead>จำนวนเงิน</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>วันที่ชำระ</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRecords.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.payment_number}
                        </TableCell>
                        <TableCell>
                          {payment.tax_invoices?.tax_invoice_number}
                        </TableCell>
                        <TableCell>
                          {payment.tax_invoices?.customer_name}
                        </TableCell>
                        <TableCell>{payment.payment_method}</TableCell>
                        <TableCell>฿{payment.amount_received.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(payment.verification_status)}</TableCell>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {payment.verification_status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVerifyPayment(payment.id, 'verified')}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVerifyPayment(payment.id, 'rejected')}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Add Payment Form Dialog */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>บันทึกการชำระเงิน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Display selected tax invoice information instead of dropdown */}
                    {selectedTaxInvoice ? (
                      <div className="md:col-span-3">
                        <Label>ข้อมูลใบกำกับภาษี</Label>
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="font-medium">เลขที่:</span> 
                              <span className="text-blue-600 font-bold text-lg ml-2">{selectedTaxInvoice.tax_invoice_number}</span>
                            </div>
                            <div>
                              <span className="font-medium">ลูกค้า:</span> {selectedTaxInvoice.customer_name}
                            </div>
                            <div>
                              <span className="font-medium">จำนวนเงิน:</span> ฿{selectedTaxInvoice.total_amount?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="tax_invoice_id">ใบกำกับภาษี</Label>
                        <Select
                          value={formData.tax_invoice_id}
                          onValueChange={(value) => setFormData({ ...formData, tax_invoice_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกใบกำกับภาษี" />
                          </SelectTrigger>
                          <SelectContent>
                            {taxInvoices.map((invoice) => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                {invoice.tax_invoice_number} - {invoice.customer_name} 
                                (฿{invoice.total_amount.toLocaleString()})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="payment_method">วิธีการชำระเงิน</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-300">
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
                        onChange={(e) => setFormData({ ...formData, amount_received: parseFloat(e.target.value) || 0 })}
                        required
                        className="bg-slate-50 border-slate-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_reference">เลขที่อ้างอิง/Ref</Label>
                      <Input
                        id="payment_reference"
                        value={formData.payment_reference}
                        onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                        className="bg-slate-50 border-slate-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bank_name">ธนาคาร</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="bg-slate-50 border-slate-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="depositor_name">ชื่อผู้โอน</Label>
                      <Input
                        id="depositor_name"
                        value={formData.depositor_name}
                        onChange={(e) => setFormData({ ...formData, depositor_name: e.target.value })}
                        className="bg-slate-50 border-slate-300"
                      />
                    </div>

                    {/* File upload section */}
                    <div className="md:col-span-3">
                      <Label htmlFor="payment_evidence">หลักฐานการชำระเงิน</Label>
                      <div className="mt-2">
                        <Input
                          id="payment_evidence"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="bg-slate-50 border-slate-300"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          รองรับไฟล์รูปภาพ (JPG, PNG, GIF) และ PDF ขนาดไม่เกิน 5MB
                        </p>
                      </div>
                      
                      {/* Preview section */}
                      {previewUrl && (
                        <div className="mt-4">
                          <Label>ตัวอย่างหลักฐาน</Label>
                          <div className="mt-2 border border-slate-300 rounded-lg p-4 bg-slate-50">
                            <img 
                              src={previewUrl} 
                              alt="Payment evidence preview" 
                              className="max-w-full h-auto max-h-64 object-contain rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                      
                      {uploadedFile && !previewUrl && (
                        <div className="mt-4">
                          <Label>ไฟล์ที่เลือก</Label>
                          <div className="mt-2 p-3 bg-slate-50 border border-slate-300 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Upload className="w-4 h-4 text-slate-600" />
                              <span className="text-sm font-medium">{uploadedFile.name}</span>
                              <span className="text-xs text-slate-500">
                                ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <Label htmlFor="payment_notes">หมายเหตุ</Label>
                      <Textarea
                        id="payment_notes"
                        value={formData.payment_notes}
                        onChange={(e) => setFormData({ ...formData, payment_notes: e.target.value })}
                        rows={2}
                        className="bg-slate-50 border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-6">
                    <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                      ยกเลิก
                    </Button>
                    <Button onClick={handleAddPayment} className="flex-1">
                      บันทึก
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Details Dialog */}
          {selectedPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>รายละเอียดการชำระเงิน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>หมายเลขการชำระ</Label>
                      <div className="font-medium">{selectedPayment.payment_number}</div>
                    </div>
                    <div>
                      <Label>สถานะ</Label>
                      <div>{getStatusBadge(selectedPayment.verification_status)}</div>
                    </div>
                  </div>

                  <div>
                    <Label>ใบกำกับภาษี</Label>
                    <div className="font-medium">{selectedPayment.tax_invoices?.tax_invoice_number}</div>
                  </div>

                  <div>
                    <Label>ลูกค้า</Label>
                    <div className="font-medium">{selectedPayment.tax_invoices?.customer_name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>วิธีการชำระ</Label>
                      <div className="font-medium">{selectedPayment.payment_method}</div>
                    </div>
                    <div>
                      <Label>จำนวนเงิน</Label>
                      <div className="font-medium">฿{selectedPayment.amount_received.toLocaleString()}</div>
                    </div>
                  </div>

                  {selectedPayment.payment_reference && (
                    <div>
                      <Label>เลขที่อ้างอิง</Label>
                      <div className="font-medium">{selectedPayment.payment_reference}</div>
                    </div>
                  )}

                  {selectedPayment.bank_name && (
                    <div>
                      <Label>ธนาคาร</Label>
                      <div className="font-medium">{selectedPayment.bank_name}</div>
                    </div>
                  )}

                  {selectedPayment.depositor_name && (
                    <div>
                      <Label>ชื่อผู้โอน</Label>
                      <div className="font-medium">{selectedPayment.depositor_name}</div>
                    </div>
                  )}

                  {selectedPayment.payment_notes && (
                    <div>
                      <Label>หมายเหตุ</Label>
                      <div className="font-medium">{selectedPayment.payment_notes}</div>
                    </div>
                  )}

                  <div>
                    <Label>วันที่บันทึก</Label>
                    <div className="font-medium">
                      {new Date(selectedPayment.payment_date).toLocaleString('th-TH')}
                    </div>
                  </div>

                  {selectedPayment.verified_at && (
                    <div>
                      <Label>วันที่ตรวจสอบ</Label>
                      <div className="font-medium">
                        {new Date(selectedPayment.verified_at).toLocaleString('th-TH')}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button onClick={() => setSelectedPayment(null)} className="w-full">
                      ปิด
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}