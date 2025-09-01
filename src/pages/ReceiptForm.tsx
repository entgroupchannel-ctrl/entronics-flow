import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Save, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/Sidebar";

interface ReceiptItem {
  id?: string;
  product_name: string;
  product_sku: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_type: 'amount' | 'percentage';
  line_total: number;
  is_software: boolean;
}

interface ReceiptForm {
  id?: string;
  receipt_number?: string;
  receipt_date: string;
  invoice_id?: string;
  tax_invoice_id: string;
  customer_id?: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  customer_email: string;
  payment_method: string;
  payment_reference: string;
  bank_name: string;
  bank_account: string;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  vat_amount: number;
  withholding_tax_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_change: number;
  payment_status: string;
  notes: string;
  terms_conditions: string;
  can_issue_receipt?: boolean;
  payment_record_id?: string;
}

export default function ReceiptForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [taxInvoices, setTaxInvoices] = useState<any[]>([]);

  const [formData, setFormData] = useState<ReceiptForm>({
    receipt_date: new Date().toISOString().split('T')[0],
    tax_invoice_id: "",
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    customer_email: "",
    payment_method: "เงินสด",
    payment_reference: "",
    bank_name: "",
    bank_account: "",
    subtotal: 0,
    discount_amount: 0,
    discount_percentage: 0,
    vat_amount: 0,
    withholding_tax_amount: 0,
    total_amount: 0,
    amount_paid: 0,
    amount_change: 0,
    payment_status: "paid",
    notes: "",
    terms_conditions: "",
    can_issue_receipt: false,
  });

  const [items, setItems] = useState<ReceiptItem[]>([
    {
      product_name: "",
      product_sku: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      discount_type: "amount",
      line_total: 0,
      is_software: false,
    },
  ]);

  useEffect(() => {
    const initializeData = async () => {
      await loadInitialData();
      
      // Load from location state if coming from tax invoice
      if (location.state) {
        const { taxInvoiceId, customerName, totalAmount } = location.state;
        if (taxInvoiceId) {
          // Check if this tax invoice can issue receipt
          const canIssueReceipt = await checkCanIssueReceipt(taxInvoiceId);
          setFormData(prev => ({
            ...prev,
            tax_invoice_id: taxInvoiceId,
            customer_name: customerName || "",
            total_amount: totalAmount || 0,
            can_issue_receipt: canIssueReceipt
          }));
        }
      }

      if (id && id !== "new") {
        await loadReceipt(id);
      }
    };

    initializeData();
  }, [id, location.state]);

  const checkCanIssueReceipt = async (taxInvoiceId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('can_issue_receipt_for_tax_invoice', {
        tax_invoice_id_param: taxInvoiceId
      });

      if (error) {
        console.error('Error checking receipt eligibility:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking receipt eligibility:', error);
      return false;
    }
  };

  const loadInitialData = async () => {
    try {
      // Load customers
      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (customersData) setCustomers(customersData);

      // Load invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('id, invoice_number, customer_name, total_amount')
        .order('created_at', { ascending: false });
      
      if (invoicesData) setInvoices(invoicesData);

      // Load tax invoices
      const { data: taxInvoicesData } = await supabase
        .from('tax_invoices')
        .select('id, tax_invoice_number, customer_name, total_amount')
        .order('created_at', { ascending: false });
      
      if (taxInvoicesData) setTaxInvoices(taxInvoicesData);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadReceipt = async (receiptId: string) => {
    try {
      setLoading(true);
      const { data: receipt, error } = await supabase
        .from('receipts')
        .select(`
          *,
          receipt_items (*)
        `)
        .eq('id', receiptId)
        .single();

      if (error) {
        console.error('Error loading receipt:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลใบเสร็จได้",
          variant: "destructive",
        });
        return;
      }

      if (receipt) {
        setFormData({
          ...receipt,
          receipt_date: receipt.receipt_date,
        });

        if (receipt.receipt_items && receipt.receipt_items.length > 0) {
          const mappedItems = receipt.receipt_items.map((item: any) => ({
            id: item.id,
            product_name: item.product_name || "",
            product_sku: item.product_sku || "",
            description: item.description || "",
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            discount_amount: item.discount_amount || 0,
            discount_type: (item.discount_type as 'amount' | 'percentage') || 'amount',
            line_total: item.line_total || 0,
            is_software: item.is_software || false,
          }));
          setItems(mappedItems);
        }
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const discountAmount = item.discount_type === 'percentage' 
        ? (itemTotal * item.discount_amount) / 100 
        : item.discount_amount;
      return sum + (itemTotal - discountAmount);
    }, 0);

    const discountAmount = formData.discount_percentage > 0 
      ? (subtotal * formData.discount_percentage) / 100 
      : formData.discount_amount;

    const afterDiscount = subtotal - discountAmount;
    const vatAmount = (afterDiscount * 7) / 100;
    const totalAmount = afterDiscount + vatAmount - formData.withholding_tax_amount;
    const amountChange = formData.amount_paid - totalAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      amount_change: Math.max(0, amountChange),
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [items, formData.discount_amount, formData.discount_percentage, formData.withholding_tax_amount, formData.amount_paid]);

  const updateItemTotal = (index: number, item: ReceiptItem) => {
    const itemTotal = item.quantity * item.unit_price;
    const discountAmount = item.discount_type === 'percentage' 
      ? (itemTotal * item.discount_amount) / 100 
      : item.discount_amount;
    const lineTotal = itemTotal - discountAmount;

    const updatedItems = [...items];
    updatedItems[index] = { ...item, line_total: lineTotal };
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product_name: "",
        product_sku: "",
        description: "",
        quantity: 1,
        unit_price: 0,
        discount_amount: 0,
        discount_type: "amount",
        line_total: 0,
        is_software: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "กรุณาเข้าสู่ระบบก่อน",
          variant: "destructive",
        });
        return;
      }

      // Prepare receipt data - remove undefined fields except for update
      let receiptData: any;
      
      if (id === "new" || !id) {
        // For new receipts, exclude id and receipt_number (will be auto-generated)
        const { id: _, receipt_number: __, ...dataToSave } = formData;
        receiptData = {
          ...dataToSave,
          created_by: user.id,
        };
      } else {
        // For updates, include all data
        receiptData = {
          ...formData,
          created_by: user.id,
        };
      }

      let receiptId = id;

      if (id === "new" || !id) {
        // Create new receipt
        const { data: newReceipt, error: receiptError } = await supabase
          .from('receipts')
          .insert(receiptData)
          .select()
          .single();

        if (receiptError) {
          throw receiptError;
        }

        receiptId = newReceipt.id;
      } else {
        // Update existing receipt
        const { error: receiptError } = await supabase
          .from('receipts')
          .update(receiptData)
          .eq('id', id);

        if (receiptError) {
          throw receiptError;
        }

        // Delete existing items
        await supabase
          .from('receipt_items')
          .delete()
          .eq('receipt_id', id);
      }

      // Insert items
      if (items.length > 0 && receiptId) {
        const itemsData = items.map(item => ({
          ...item,
          receipt_id: receiptId,
        }));

        const { error: itemsError } = await supabase
          .from('receipt_items')
          .insert(itemsData);

        if (itemsError) {
          throw itemsError;
        }
      }

      toast({
        title: "สำเร็จ",
        description: `${id === "new" || !id ? "สร้าง" : "อัปเดต"}ใบเสร็จเรียบร้อยแล้ว`,
      });

      navigate('/receipts');
    } catch (error) {
      console.error('Error saving receipt:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && id !== "new") {
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
              <h1 className="text-3xl font-bold">
                {id === "new" ? "สร้างใบเสร็จใหม่" : "แก้ไขใบเสร็จ"}
              </h1>
              <p className="text-muted-foreground">
                จัดการข้อมูลใบเสร็จรับเงิน
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/receipts')}>
                ยกเลิก
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลใบเสร็จ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receipt_date">วันที่ใบเสร็จ</Label>
                    <Input
                      id="receipt_date"
                      type="date"
                      value={formData.receipt_date}
                      onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                    />
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
                        <SelectItem value="เงินสด">เงินสด</SelectItem>
                        <SelectItem value="เช็ค">เช็ค</SelectItem>
                        <SelectItem value="โอนเงิน">โอนเงิน</SelectItem>
                        <SelectItem value="บัตรเครดิต">บัตรเครดิต</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.payment_method !== "เงินสด" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment_reference">เลขที่อ้างอิง</Label>
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
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount_paid">จำนวนเงินที่รับ</Label>
                    <Input
                      id="amount_paid"
                      type="number"
                      step="0.01"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount_change">เงินทอน</Label>
                    <Input
                      id="amount_change"
                      type="number"
                      step="0.01"
                      value={formData.amount_change}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลลูกค้า</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer_name">ชื่อลูกค้า</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer_address">ที่อยู่</Label>
                  <Textarea
                    id="customer_address"
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_phone">เบอร์โทร</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email">อีเมล</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>รายการสินค้า/บริการ</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มรายการ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อสินค้า/บริการ</TableHead>
                      <TableHead>รหัสสินค้า</TableHead>
                      <TableHead>จำนวน</TableHead>
                      <TableHead>ราคาต่อหน่วย</TableHead>
                      <TableHead>ส่วนลด</TableHead>
                      <TableHead>รวม</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.product_name}
                            onChange={(e) => {
                              const updatedItem = { ...item, product_name: e.target.value };
                              updateItemTotal(index, updatedItem);
                            }}
                            placeholder="ชื่อสินค้า/บริการ"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.product_sku}
                            onChange={(e) => {
                              const updatedItem = { ...item, product_sku: e.target.value };
                              updateItemTotal(index, updatedItem);
                            }}
                            placeholder="รหัสสินค้า"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const updatedItem = { ...item, quantity: parseInt(e.target.value) || 1 };
                              updateItemTotal(index, updatedItem);
                            }}
                            min="1"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => {
                              const updatedItem = { ...item, unit_price: parseFloat(e.target.value) || 0 };
                              updateItemTotal(index, updatedItem);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              step="0.01"
                              value={item.discount_amount}
                              onChange={(e) => {
                                const updatedItem = { ...item, discount_amount: parseFloat(e.target.value) || 0 };
                                updateItemTotal(index, updatedItem);
                              }}
                              className="w-20"
                            />
                            <Select
                              value={item.discount_type}
                              onValueChange={(value: 'amount' | 'percentage') => {
                                const updatedItem = { ...item, discount_type: value };
                                updateItemTotal(index, updatedItem);
                              }}
                            >
                              <SelectTrigger className="w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="amount">฿</SelectItem>
                                <SelectItem value="percentage">%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          ฿{item.line_total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>สรุปยอดเงิน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount_amount">ส่วนลดเพิ่มเติม</Label>
                      <Input
                        id="discount_amount"
                        type="number"
                        step="0.01"
                        value={formData.discount_amount}
                        onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="withholding_tax_amount">หัก ณ ที่จ่าย</Label>
                      <Input
                        id="withholding_tax_amount"
                        type="number"
                        step="0.01"
                        value={formData.withholding_tax_amount}
                        onChange={(e) => setFormData({ ...formData, withholding_tax_amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>ยอดรวมก่อนภาษี:</span>
                    <span>฿{formData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ส่วนลด:</span>
                    <span>฿{formData.discount_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ภาษีมูลค่าเพิ่ม (7%):</span>
                    <span>฿{formData.vat_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>หัก ณ ที่จ่าย:</span>
                    <span>฿{formData.withholding_tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>ยอดรวมสุทธิ:</span>
                    <span>฿{formData.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}