import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit3, Save, X, FileText, Share2, Printer, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category?: string;
  brand?: string;
}

interface QuotationItem {
  id: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_type: 'amount' | 'percentage';
  line_total: number;
  is_software: boolean;
}

interface Quotation {
  id?: string;
  quotation_number: string;
  quotation_date: string;
  valid_until?: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  vat_amount: number;
  withholding_tax_amount: number;
  total_amount: number;
  status: string;
  notes?: string;
  terms_conditions?: string;
}

export default function Quotations() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotation, setQuotation] = useState<Quotation>(() => {
    const today = new Date();
    const validUntil = addDays(today, 15);
    
    return {
      quotation_number: '',
      quotation_date: format(today, 'yyyy-MM-dd'),
      valid_until: format(validUntil, 'yyyy-MM-dd'),
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      subtotal: 0,
      discount_amount: 0,
      discount_percentage: 0,
      vat_amount: 0,
      withholding_tax_amount: 0,
      total_amount: 0,
      status: 'draft',
      notes: '',
      terms_conditions: ''
    };
  });
  
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditingQuotationNumber, setIsEditingQuotationNumber] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [salesperson, setSalesperson] = useState('ผู้เสนอราคา');
  const [isEditingSalesperson, setIsEditingSalesperson] = useState(false);
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    loadCustomers();
    loadProducts();
    generateQuotationNumber();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลลูกค้าได้",
        variant: "destructive",
      });
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
        variant: "destructive",
      });
    }
  };

  const generateQuotationNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const number = `QT${year}${month}${random}`;
    setQuotation(prev => ({ ...prev, quotation_number: number }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const vatAmount = subtotal * 0.07; // 7% VAT
    const softwareItems = items.filter(item => item.is_software);
    const softwareTotal = softwareItems.reduce((sum, item) => sum + item.line_total, 0);
    const withholdingTaxAmount = softwareTotal * 0.03; // 3% withholding tax for software
    const totalAmount = subtotal + vatAmount - withholdingTaxAmount;

    setQuotation(prev => ({
      ...prev,
      subtotal,
      vat_amount: vatAmount,
      withholding_tax_amount: withholdingTaxAmount,
      total_amount: totalAmount
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      discount_type: 'amount',
      line_total: 0,
      is_software: false
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate line total
        const subtotal = updatedItem.quantity * updatedItem.unit_price;
        let discountAmount = updatedItem.discount_amount;
        
        if (updatedItem.discount_type === 'percentage') {
          discountAmount = subtotal * (updatedItem.discount_amount / 100);
        }
        
        updatedItem.line_total = subtotal - discountAmount;
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const selectProduct = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateItem(itemId, 'product_id', product.id);
      updateItem(itemId, 'product_name', product.name);
      updateItem(itemId, 'product_sku', product.sku);
      updateItem(itemId, 'unit_price', product.price);
      updateItem(itemId, 'description', `${product.brand ? product.brand + ' ' : ''}${product.name}`);
    }
  };

  const selectCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setQuotation(prev => ({
        ...prev,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email || '',
        customer_phone: customer.phone || '',
        customer_address: customer.address || ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">ใบเสนอราคา</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              แชร์
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              ดาวน์โหลด PDF
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            {/* Top Section */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Left - Customer Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">ชื่อลูกค้า</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Select onValueChange={selectCustomer}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="เลือกลูกค้า" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingCustomer(true)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Customer Details */}
                {(isEditingCustomer || selectedCustomer) && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">รายละเอียดลูกค้า</Label>
                      {isEditingCustomer && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingCustomer(false)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingCustomer(false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-xs">อีเมล</Label>
                        <Input
                          value={quotation.customer_email}
                          onChange={(e) => setQuotation(prev => ({ ...prev, customer_email: e.target.value }))}
                          disabled={!isEditingCustomer}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">โทรศัพท์</Label>
                        <Input
                          value={quotation.customer_phone}
                          onChange={(e) => setQuotation(prev => ({ ...prev, customer_phone: e.target.value }))}
                          disabled={!isEditingCustomer}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">ที่อยู่</Label>
                        <Textarea
                          value={quotation.customer_address}
                          onChange={(e) => setQuotation(prev => ({ ...prev, customer_address: e.target.value }))}
                          disabled={!isEditingCustomer}
                          className="text-sm resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Salesperson */}
                <div>
                  <Label className="text-sm font-medium">ผู้เสนอราคา</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {isEditingSalesperson ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          value={salesperson}
                          onChange={(e) => setSalesperson(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingSalesperson(false)}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingSalesperson(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="flex-1 p-2 border rounded bg-background">{salesperson}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingSalesperson(true)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right - Quote Info */}
              <div className="space-y-4">
                {/* Quotation Number */}
                <div className="text-right">
                  <Label className="text-sm font-medium">หมายเลขใบเสนอราคา</Label>
                  <div className="flex items-center justify-end space-x-2 mt-1">
                    {isEditingQuotationNumber ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={quotation.quotation_number}
                          onChange={(e) => setQuotation(prev => ({ ...prev, quotation_number: e.target.value }))}
                          className="text-right font-bold text-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingQuotationNumber(false)}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingQuotationNumber(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          {quotation.quotation_number}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingQuotationNumber(true)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="text-right bg-primary/5 p-4 rounded-lg">
                  <Label className="text-sm font-medium">จำนวนเงินรวมทั้งสิ้น</Label>
                  <div className="text-3xl font-bold text-primary mt-1">
                    {quotation.total_amount.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">บาท</div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">วันที่</Label>
                    <Input
                      type="date"
                      value={quotation.quotation_date}
                      onChange={(e) => setQuotation(prev => ({ ...prev, quotation_date: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">ครบกำหนด</Label>
                    <Input
                      type="date"
                      value={quotation.valid_until}
                      onChange={(e) => setQuotation(prev => ({ ...prev, valid_until: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">รายการสินค้า</h3>
                <Button onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มรายการ
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary text-primary-foreground">
                      <TableHead className="text-center w-16 text-primary-foreground">ลำดับ</TableHead>
                      <TableHead className="w-80 text-primary-foreground">ชื่อสินค้า</TableHead>
                      <TableHead className="text-center w-20 text-primary-foreground">จำนวน</TableHead>
                      <TableHead className="text-center w-20 text-primary-foreground">หน่วย</TableHead>
                      <TableHead className="text-center w-32 text-primary-foreground">ราคาต่อหน่วย</TableHead>
                      <TableHead className="text-center w-32 text-primary-foreground">ส่วนลด (฿)</TableHead>
                      <TableHead className="text-center w-32 text-primary-foreground">ราคารวม</TableHead>
                      <TableHead className="text-center w-20 text-primary-foreground">Software</TableHead>
                      <TableHead className="text-center w-16 text-primary-foreground">ลบ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <TableRow>
                          <TableCell className="text-center font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Select onValueChange={(value) => selectProduct(item.id, value)}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="เลือกสินค้า" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(product => (
                                    <SelectItem key={product.id} value={product.id}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{product.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                          {product.sku} - ฿{product.price.toLocaleString()}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {item.product_name && (
                                <div className="text-sm text-muted-foreground">
                                  {item.product_sku}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="text-center"
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">ชิ้น</span>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="text-right"
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  value={item.discount_amount}
                                  onChange={(e) => updateItem(item.id, 'discount_amount', parseFloat(e.target.value) || 0)}
                                  className="text-right flex-1"
                                  min="0"
                                  step="0.01"
                                />
                                <Select
                                  value={item.discount_type}
                                  onValueChange={(value) => updateItem(item.id, 'discount_type', value)}
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
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ฿{item.line_total.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={item.is_software}
                              onChange={(e) => updateItem(item.id, 'is_software', e.target.checked)}
                              className="w-4 h-4"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell colSpan={5} className="bg-muted/30 p-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">รายละเอียด</Label>
                              <Textarea
                                value={item.description || ''}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                placeholder="รายละเอียดเพิ่มเติม"
                                className="w-full text-sm"
                                rows={3}
                              />
                            </div>
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end mt-6">
              <div className="w-80 space-y-3">
                <div className="flex justify-between">
                  <span>ยอดรวม:</span>
                  <span className="font-medium">
                    ฿{quotation.subtotal.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT 7%:</span>
                  <span className="font-medium">
                    ฿{quotation.vat_amount.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
                {quotation.withholding_tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>หักภาษี ณ ที่จ่าย 3%:</span>
                    <span className="font-medium text-destructive">
                      -฿{quotation.withholding_tax_amount.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>รวมทั้งสิ้น:</span>
                  <span className="text-primary">
                    ฿{quotation.total_amount.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div>
                <Label className="text-sm font-medium">หมายเหตุ</Label>
                <Textarea
                  value={quotation.notes}
                  onChange={(e) => setQuotation(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="หมายเหตุเพิ่มเติม"
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">เงื่อนไขและข้อกำหนด</Label>
                <Textarea
                  value={quotation.terms_conditions}
                  onChange={(e) => setQuotation(prev => ({ ...prev, terms_conditions: e.target.value }))}
                  placeholder="เงื่อนไขการชำระเงิน และข้อกำหนดอื่นๆ"
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-8">
              <Button variant="outline">
                บันทึกร่าง
              </Button>
              <Button>
                บันทึกใบเสนอราคา
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}