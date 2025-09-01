import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, X, FileText, CalendarIcon, Edit, MoreHorizontal, Clock, Printer, Share, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from 'date-fns';
import { cn } from "@/lib/utils";
import entGroupLogo from "@/assets/ent-group-logo.png";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  line_id?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category?: string;
  brand?: string;
  is_software?: boolean;
}

interface InvoiceItem {
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

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [includeVat, setIncludeVat] = useState(true);
  const { toast } = useToast();

  const [invoice, setInvoice] = useState({
    invoice_number: '',
    invoice_date: new Date(),
    due_date: addDays(new Date(), 30),
    customer_name: '',
    customer_address: '',
    customer_phone: '',
    customer_email: '',
    customer_line_id: '',
    subtotal: 0,
    discount_percentage: 0,
    discount_amount: 0,
    vat_amount: 0,
    withholding_tax_amount: 0,
    total_amount: 0,
    partial_payment_amount: 0,
    partial_payment_percentage: 60,
    taxable_amount: 0,
    non_taxable_amount: 0,
    notes: '',
    terms_conditions: 'ชำระเงินภายใน 30 วัน นับจากวันที่ออกใบแจ้งหนี้\nกรณีชำระเงินช้ากว่ากำหนด ทางบริษัทฯ ขอสงวนสิทธิ์ในการคิดดอกเบี้ยในอัตราร้อยละ 1.25 ต่อเดือน',
    status: 'รอวางบิล'
  });

  useEffect(() => {
    loadCustomers();
    loadProducts();
    generateInvoiceNumber();
    loadQuotationData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items, includeVat]);

  const generateInvoiceNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999) + 1;
    const invoiceNumber = `INV${year}${month}${String(random).padStart(4, '0')}`;
    setInvoice(prev => ({ ...prev, invoice_number: invoiceNumber }));
  };

  const loadQuotationData = () => {
    try {
      const quotationData = sessionStorage.getItem('invoice_from_quotation');
      if (quotationData) {
        const data = JSON.parse(quotationData);
        
        // Set invoice data from quotation
        setInvoice(prev => ({
          ...prev,
          customer_name: data.customer_name || '',
          customer_address: data.customer_address || '',
          customer_phone: data.customer_phone || '',
          customer_email: data.customer_email || '',
          subtotal: data.subtotal || 0,
          discount_amount: data.discount_amount || 0,
          discount_percentage: data.discount_percentage || 0,
          vat_amount: data.vat_amount || 0,
          withholding_tax_amount: data.withholding_tax_amount || 0,
          total_amount: data.total_amount || 0,
          notes: data.notes || '',
          terms_conditions: data.terms_conditions || 'ชำระเงินภายใน 30 วัน นับจากวันที่ออกใบแจ้งหนี้\nกรณีชำระเงินช้ากว่ากำหนด ทางบริษัทฯ ขอสงวนสิทธิ์ในการคิดดอกเบี้ยในอัตราร้อยละ 1.25 ต่อเดือน'
        }));

        // Set items from quotation
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        }

        // Show notification
        toast({
          title: "นำเข้าข้อมูลจากใบเสนอราคาสำเร็จ",
          description: `นำเข้าข้อมูลจากใบเสนอราคา ${data.quotation_number} เรียบร้อยแล้ว`,
        });

        // Clear the session storage after loading
        sessionStorage.removeItem('invoice_from_quotation');
      }
    } catch (error) {
      console.error('Error loading quotation data:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({
        title: "เกิดข้อผิดพลาด", 
        description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
        variant: "destructive",
      });
    }
  };

  const selectCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setInvoice(prev => ({
        ...prev,
        customer_name: customer.name,
        customer_address: customer.address || '',
        customer_phone: customer.phone || '',
        customer_email: customer.email || '',
        customer_line_id: customer.line_id || ''
      }));
    }
  };

  const calculateTotals = () => {
    const rawSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const totalDiscount = items.reduce((sum, item) => {
      if (item.discount_type === 'percentage') {
        return sum + ((item.quantity * item.unit_price) * (item.discount_amount / 100));
      } else {
        return sum + item.discount_amount;
      }
    }, 0);
    
    const priceAfterDiscount = rawSubtotal - totalDiscount;
    
    // คำนวณมูลค่าที่มีภาษีและไม่มีภาษี ให้ใช้ line_total หลังหักส่วนลดแล้ว
    const nonTaxableAmount = items
      .filter(item => !item.is_software) // สินค้าที่ไม่เสียภาษี
      .reduce((sum, item) => sum + item.line_total, 0);
    const taxableAmount = items
      .filter(item => item.is_software) // สินค้าที่เสียภาษี (ซอฟต์แวร์)
      .reduce((sum, item) => sum + item.line_total, 0);
    
    // คำนวณ VAT 7% จากมูลค่าที่เสียภาษีเท่านั้น
    const vatAmount = includeVat ? taxableAmount * 0.07 : 0;
    
    // คำนวณหัก ณ ที่จ่าย 3% จากซอฟต์แวร์เท่านั้น
    const withholdingTaxAmount = taxableAmount * 0.03;
    
    // ยอดรวมสุดท้าย = มูลค่าหลังหักส่วนลด + VAT - หัก ณ ที่จ่าย
    const totalAmount = priceAfterDiscount + vatAmount - withholdingTaxAmount;
    
    // คำนวณแบ่งชำระจากยอดสุดท้าย (หลัง VAT และหัก ณ ที่จ่าย)
    const partialPaymentAmount = totalAmount * (invoice.partial_payment_percentage / 100);

    setInvoice(prev => ({
      ...prev,
      subtotal: rawSubtotal,
      discount_amount: totalDiscount,
      vat_amount: vatAmount,
      withholding_tax_amount: withholdingTaxAmount,
      taxable_amount: taxableAmount,
      non_taxable_amount: nonTaxableAmount,
      total_amount: totalAmount,
      partial_payment_amount: partialPaymentAmount
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `temp-${Date.now()}`,
      product_name: '',
      product_sku: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      discount_type: 'amount',
      line_total: 0,
      is_software: false
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate line total
        let lineTotal = updatedItem.quantity * updatedItem.unit_price;
        if (updatedItem.discount_type === 'percentage') {
          lineTotal = lineTotal - (lineTotal * (updatedItem.discount_amount / 100));
        } else {
          lineTotal = lineTotal - updatedItem.discount_amount;
        }
        updatedItem.line_total = Math.max(0, lineTotal);
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const selectProduct = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateItem(itemId, 'product_id', productId);
      updateItem(itemId, 'product_name', product.name);
      updateItem(itemId, 'product_sku', product.sku);
      updateItem(itemId, 'unit_price', product.price);
      updateItem(itemId, 'is_software', product.is_software || false);
    }
  };

  const saveInvoice = async () => {
    try {
      if (!invoice.invoice_number || !invoice.customer_name) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกเลขที่ใบแจ้งหนี้และเลือกลูกค้า",
          variant: "destructive",
        });
        return;
      }

      // TODO: Save to database when invoice table is created
      console.log('Saving invoice:', invoice);
      console.log('Invoice items:', items);

      toast({
        title: "บันทึกสำเร็จ",
        description: "ใบแจ้งหนี้ได้รับการบันทึกเรียบร้อยแล้ว",
        variant: "default",
      });

      navigate('/invoices');
      
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกใบแจ้งหนี้ได้",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('/')} className="hover:text-foreground">
            หน้าหลัก
          </button>
          <span>/</span>
          <button onClick={() => navigate('/invoices')} className="hover:text-foreground">
            ใบแจ้งหนี้
          </button>
          <span>/</span>
          <span className="text-foreground">สร้างใบแจ้งหนี้ใหม่</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">สร้างใบแจ้งหนี้ใหม่</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/invoices')}>
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button variant="default" size="sm" onClick={saveInvoice}>
              <Save className="w-4 h-4 mr-2" />
              บันทึกเอกสาร
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-4">
            {/* Customer and Document Info */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">ชื่อลูกค้า</Label>
                    <Select onValueChange={selectCustomer}>
                      <SelectTrigger className="mt-1 border-gray-300">
                        <SelectValue placeholder="เลือกลูกค้า" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex flex-col">
                              <span>{customer.name}</span>
                              {customer.tax_id && (
                                <span className="text-xs text-muted-foreground">
                                  เลขประจำตัวผู้เสียภาษี: {customer.tax_id}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedCustomer && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <Label className="text-xs font-medium text-muted-foreground">หมายเลขผู้เสียภาษี / TAX ID</Label>
                        <div className="text-sm font-mono font-medium">
                          {selectedCustomer.tax_id || 'ไม่มีข้อมูลหมายเลขผู้เสียภาษี'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm font-medium">อีเมล</Label>
                      <Input 
                        value={invoice.customer_email} 
                        onChange={(e) => setInvoice(prev => ({ ...prev, customer_email: e.target.value }))}
                        className="mt-1 text-sm border-gray-300"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">เบอร์โทรศัพท์</Label>
                      <Input 
                        value={invoice.customer_phone} 
                        onChange={(e) => setInvoice(prev => ({ ...prev, customer_phone: e.target.value }))}
                        className="mt-1 text-sm border-gray-300"
                        placeholder="08x-xxx-xxxx"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Line ID</Label>
                      <Input 
                        value={invoice.customer_line_id || ''} 
                        onChange={(e) => setInvoice(prev => ({ ...prev, customer_line_id: e.target.value }))}
                        className="mt-1 text-sm border-gray-300"
                        placeholder="@lineid"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ที่อยู่</Label>
                    <Textarea 
                      value={invoice.customer_address} 
                      onChange={(e) => setInvoice(prev => ({ ...prev, customer_address: e.target.value }))}
                      className="mt-1 border-gray-300"
                      rows={3}
                      placeholder="ที่อยู่ลูกค้า"
                    />
                  </div>
                </div>

                <div className="space-y-3 flex flex-col items-end">
                  <div className="w-full max-w-xs">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <Edit className="w-4 h-4 text-gray-500" />
                      <Label className="text-sm font-medium text-right">เลขที่ใบแจ้งหนี้</Label>
                    </div>
                    <Input 
                      value={invoice.invoice_number} 
                      onChange={(e) => setInvoice(prev => ({ ...prev, invoice_number: e.target.value }))}
                      className="text-right text-3xl font-extrabold text-blue-600 border-0 shadow-none bg-transparent h-14 focus:ring-0 focus:border-0"
                      placeholder="INV202400001"
                    />
                  </div>
                  <div className="w-full max-w-xs">
                    <Label className="text-sm font-medium block text-right mb-1">วันที่</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-right font-normal border-gray-300",
                            !invoice.invoice_date && "text-muted-foreground"
                          )}
                        >
                          {invoice.invoice_date ? (
                            format(new Date(invoice.invoice_date), "dd/MM/yyyy")
                          ) : (
                            <span>เลือกวันที่</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={invoice.invoice_date ? new Date(invoice.invoice_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setInvoice(prev => ({ ...prev, invoice_date: date }));
                            }
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="w-full max-w-xs">
                    <Label className="text-sm font-medium block text-right mb-1">วันครบกำหนดชำระ</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-right font-normal border-gray-300",
                            !invoice.due_date && "text-muted-foreground"
                          )}
                        >
                          {invoice.due_date ? (
                            format(new Date(invoice.due_date), "dd/MM/yyyy")
                          ) : (
                            <span>เลือกวันที่</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={invoice.due_date ? new Date(invoice.due_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setInvoice(prev => ({ ...prev, due_date: date }));
                            }
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="w-full max-w-xs">
                    <Label className="text-sm font-medium block text-right mb-1">สถานะเอกสาร</Label>
                    <Select 
                      value={invoice.status} 
                      onValueChange={(value) => setInvoice(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="รอวางบิล">รอวางบิล</SelectItem>
                        <SelectItem value="วางบิลแล้ว">วางบิลแล้ว</SelectItem>
                        <SelectItem value="เปิดบิลแล้ว">เปิดบิลแล้ว</SelectItem>
                        <SelectItem value="สร้างใบสั่งสินค้า/ใบกำกับภาษี">สร้างใบสั่งสินค้า/ใบกำกับภาษี</SelectItem>
                        <SelectItem value="ยกเลิก">ยกเลิก</SelectItem>
                      </SelectContent>
                    </Select>
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

              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <TableHead className="text-primary-foreground w-12">ลำดับ</TableHead>
                    <TableHead className="text-primary-foreground w-80">รายการสินค้า</TableHead>
                    <TableHead className="text-primary-foreground w-20">จำนวน</TableHead>
                    <TableHead className="text-primary-foreground w-24">ราคาต่อหน่วย</TableHead>
                    <TableHead className="text-primary-foreground w-20">ส่วนลด</TableHead>
                    <TableHead className="text-primary-foreground w-24">รวม</TableHead>
                    <TableHead className="text-primary-foreground w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Select onValueChange={(value) => selectProduct(item.id, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสินค้า" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="flex flex-col">
                                    <span>{product.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      SKU: {product.sku} | ราคา: ฿{product.price}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="รายละเอียดเพิ่มเติม"
                            value={item.description || ''}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="text-sm"
                          />
                          {/* แสดง checkbox ซอฟต์แวร์เฉพาะเมื่อสินค้าเป็นซอฟต์แวร์ หรือมีการเลือกสินค้าแล้ว */}
                          {(item.is_software || item.product_name) && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`software-${item.id}`}
                                checked={item.is_software}
                                onCheckedChange={(checked) => updateItem(item.id, 'is_software', checked)}
                              />
                              <Label htmlFor={`software-${item.id}`} className="text-xs">
                                ซอฟต์แวร์ (หัก ณ ที่จ่าย 3%)
                              </Label>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={item.discount_amount === 0 ? '' : item.discount_amount.toString()}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                updateItem(item.id, 'discount_amount', value === '' ? 0 : parseFloat(value) || 0);
                              }
                            }}
                            onFocus={(e) => {
                              if (e.target.value === '0') {
                                e.target.select();
                              }
                            }}
                            placeholder="0"
                            className="w-20 text-right"
                          />
                          <Select
                            value={item.discount_type}
                            onValueChange={(value: 'amount' | 'percentage') => updateItem(item.id, 'discount_type', value)}
                          >
                            <SelectTrigger className="w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="amount">บาท</SelectItem>
                              <SelectItem value="percentage">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="w-24 font-medium text-right">
                        {item.line_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="w-12">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                            <DropdownMenuItem onClick={() => {}}>
                              <Edit className="w-4 h-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}>
                              <Clock className="w-4 h-4 mr-2" />
                              ประวัติการเปลี่ยนแปลง
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="w-4 h-4 mr-2" />
                              พิมพ์
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}>
                              <Share className="w-4 h-4 mr-2" />
                              แชร์
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}>
                              <Download className="w-4 h-4 mr-2" />
                              ดาวน์โหลด PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => removeItem(item.id)}>
                              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                              ลบรายการ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* VAT Toggle */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="vat-toggle" 
                  checked={includeVat}
                  onCheckedChange={(checked) => setIncludeVat(checked as boolean)}
                />
                <Label htmlFor="vat-toggle" className="text-sm">คิด VAT 7%</Label>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end mt-6">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span>รวมเป็นเงิน:</span>
                  <span>{invoice.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>ส่วนลดรวม:</span>
                    <span>-{invoice.discount_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ราคาหลังหักส่วนลด:</span>
                  <span>{(invoice.subtotal - invoice.discount_amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                </div>
                
                <hr />
                
                {/* แบ่งชำระ */}
                <div className="flex justify-between items-center">
                  <span>แบ่งชำระ:</span>
                  <div className="flex items-center gap-2">
                    <Select value="percentage">
                      <SelectTrigger className="w-32 text-sm border-gray-300">
                        <SelectValue placeholder="เปอร์เซ็นต์ %" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">เปอร์เซ็นต์ %</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={invoice.partial_payment_percentage}
                      onChange={(e) => setInvoice(prev => ({ ...prev, partial_payment_percentage: parseFloat(e.target.value) || 0 }))}
                      className="w-20 text-right text-sm border-gray-300"
                      placeholder="60.00"
                      step="0.01"
                    />
                   </div>
                 </div>
                 
                 {/* แสดงยอดแบ่งชำระ */}
                 {invoice.partial_payment_percentage > 0 && (
                   <div className="flex justify-between text-blue-600">
                     <span>ยอดแบ่งชำระ ({invoice.partial_payment_percentage}%):</span>
                     <span>{invoice.partial_payment_amount?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00'} บาท</span>
                   </div>
                 )}
                
                 <div className="flex justify-between">
                   <span>มูลค่าที่คำนวณภาษี:</span>
                   <span>{invoice.taxable_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                 </div>
                
                {includeVat && (
                  <div className="flex justify-between">
                    <span>ภาษีมูลค่าเพิ่ม:</span>
                    <span>{invoice.vat_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                  </div>
                )}
                
                {invoice.withholding_tax_amount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>หักภาษี ณ ที่จ่าย:</span>
                    <span>-{invoice.withholding_tax_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                  </div>
                )}
                
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>จำนวนเงินรวมทั้งสิ้น:</span>
                  <span>{invoice.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                </div>
              </div>
            </div>

            {/* Company Logo - Bottom Right */}
            <div className="flex justify-end mt-8">
              <div className="relative">
                <img 
                  src={entGroupLogo} 
                  alt="ENT GROUP" 
                  className="h-16 opacity-20"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6 space-y-4">
              <div>
                <Label className="text-sm font-medium">หมายเหตุ</Label>
                <Textarea
                  value={invoice.notes}
                  onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 border-gray-300"
                  rows={3}
                  placeholder="หมายเหตุเพิ่มเติม..."
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">เงื่อนไขการชำระเงิน</Label>
                <Textarea
                  value={invoice.terms_conditions}
                  onChange={(e) => setInvoice(prev => ({ ...prev, terms_conditions: e.target.value }))}
                  className="mt-1 border-gray-300"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}