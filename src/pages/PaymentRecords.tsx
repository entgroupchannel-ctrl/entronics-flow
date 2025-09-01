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

  useEffect(() => {
    loadPaymentRecords();
    loadTaxInvoices();
  }, []);

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
        .select('id, tax_invoice_number, customer_name, total_amount')
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaxInvoices(data || []);
    } catch (error) {
      console.error('Error loading tax invoices:', error);
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

      const { error } = await supabase
        .from('payment_records')
        .insert({
          ...formData,
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

  const handleVerifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('payment_records')
        .update({
          verification_status: status,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: `${status === 'verified' ? 'ยืนยัน' : 'ปฏิเสธ'}การชำระเงินเรียบร้อยแล้ว`,
      });

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
              <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>บันทึกการชำระเงิน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div>
                    <Label htmlFor="payment_method">วิธีการชำระเงิน</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
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
                      onChange={(e) => setFormData({ ...formData, amount_received: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_reference">เลขที่อ้างอิง/Ref</Label>
                    <Input
                      id="payment_reference"
                      value={formData.payment_reference}
                      onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bank_name">ธนาคาร</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="depositor_name">ชื่อผู้โอน</Label>
                    <Input
                      id="depositor_name"
                      value={formData.depositor_name}
                      onChange={(e) => setFormData({ ...formData, depositor_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_notes">หมายเหตุ</Label>
                    <Textarea
                      id="payment_notes"
                      value={formData.payment_notes}
                      onChange={(e) => setFormData({ ...formData, payment_notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
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