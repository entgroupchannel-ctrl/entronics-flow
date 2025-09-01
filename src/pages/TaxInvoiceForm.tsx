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

interface TaxInvoiceItem {
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

export default function TaxInvoiceForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [taxInvoice, setTaxInvoice] = useState({
    tax_invoice_number: '',
    tax_invoice_date: new Date(),
    due_date: addDays(new Date(), 30),
    customer_id: '',
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
    terms_conditions: 'ชำระเงินภายใน 30 วัน นับจากวันที่ออกใบส่งสินค้า/ใบกำกับภาษี\nกรณีชำระเงินช้ากว่ากำหนด ทางบริษัทฯ ขอสงวนสิทธิ์ในการคิดดอกเบี้ยในอัตราร้อยละ 1.25 ต่อเดือน',
    status: 'ดำเนินการแล้ว',
    payment_terms: '30 วัน',
    project_name: '',
    po_number: '',
    invoice_id: ''
  });

  const [items, setItems] = useState<TaxInvoiceItem[]>([
    {
      id: '1',
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      discount_type: 'amount',
      line_total: 0,
      is_software: false
    }
  ]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [includeVat, setIncludeVat] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDueDatePickerOpen, setIsDueDatePickerOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadProducts();
    generateTaxInvoiceNumber();
    loadDataFromSessionStorage();
  }, []);

  const loadDataFromSessionStorage = () => {
    const sessionData = sessionStorage.getItem('tax_invoice_from_invoice');
    if (sessionData) {
      try {
        const data = JSON.parse(sessionData);
        setTaxInvoice(prev => ({
          ...prev,
          customer_name: data.customer_name,
          customer_address: data.customer_address,
          customer_phone: data.customer_phone,
          customer_email: data.customer_email,
          subtotal: data.subtotal,
          discount_amount: data.discount_amount,
          discount_percentage: data.discount_percentage,
          vat_amount: data.vat_amount,
          withholding_tax_amount: data.withholding_tax_amount,
          total_amount: data.total_amount,
          notes: data.notes,
          terms_conditions: data.terms_conditions,
          payment_terms: data.payment_terms,
          project_name: data.project_name,
          po_number: data.po_number,
          invoice_id: data.invoice_id
        }));
        
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        }
        
        sessionStorage.removeItem('tax_invoice_from_invoice');
      } catch (error) {
        console.error('Error loading data from session storage:', error);
      }
    }
  };

  const generateTaxInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_tax_invoice_number');
      if (error) throw error;
      setTaxInvoice(prev => ({ ...prev, tax_invoice_number: data }));
    } catch (error) {
      console.error('Error generating tax invoice number:', error);
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
    } catch (error) {
      console.error('Error loading customers:', error);
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
    }
  };

  const updateTaxInvoice = (field: string, value: any) => {
    setTaxInvoice(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    const newItem: TaxInvoiceItem = {
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

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'unit_price' || field === 'discount_amount' || field === 'discount_type') {
          const quantity = updatedItem.quantity;
          const unitPrice = updatedItem.unit_price;
          const discountAmount = updatedItem.discount_amount;
          const discountType = updatedItem.discount_type;
          
          let lineTotal = quantity * unitPrice;
          
          if (discountType === 'percentage') {
            lineTotal = lineTotal - (lineTotal * discountAmount / 100);
          } else {
            lineTotal = lineTotal - discountAmount;
          }
          
          updatedItem.line_total = Math.max(0, lineTotal);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      updateTaxInvoice('customer_id', customerId);
      updateTaxInvoice('customer_name', customer.name);
      updateTaxInvoice('customer_address', customer.address || '');
      updateTaxInvoice('customer_phone', customer.phone || '');
      updateTaxInvoice('customer_email', customer.email || '');
    }
  };

  const handleProductSelect = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateItem(itemId, 'product_id', productId);
      updateItem(itemId, 'product_name', product.name);
      updateItem(itemId, 'product_sku', product.sku);
      updateItem(itemId, 'unit_price', product.price);
      updateItem(itemId, 'is_software', product.is_software || false);
    }
  };

  const saveTaxInvoice = async () => {
    try {
      if (!taxInvoice.tax_invoice_number || !taxInvoice.customer_name) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกเลขที่ใบส่งสินค้า/ใบกำกับภาษีและเลือกลูกค้า",
          variant: "destructive",
        });
        return;
      }

      if (items.length === 0) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ",
          variant: "destructive",
        });
        return;
      }

      // Save tax invoice to database
      const { data: taxInvoiceData, error: taxInvoiceError } = await supabase
        .from('tax_invoices' as any)
        .insert({
          invoice_id: taxInvoice.invoice_id || null,
          customer_id: taxInvoice.customer_id || null,
          customer_name: taxInvoice.customer_name,
          customer_address: taxInvoice.customer_address || null,
          customer_phone: taxInvoice.customer_phone || null,
          customer_email: taxInvoice.customer_email || null,
          tax_invoice_date: taxInvoice.tax_invoice_date.toISOString().split('T')[0],
          due_date: taxInvoice.due_date.toISOString().split('T')[0],
          subtotal: taxInvoice.subtotal,
          discount_amount: taxInvoice.discount_amount,
          discount_percentage: taxInvoice.discount_percentage,
          vat_amount: taxInvoice.vat_amount,
          withholding_tax_amount: taxInvoice.withholding_tax_amount,
          total_amount: taxInvoice.total_amount,
          status: 'ดำเนินการแล้ว',
          notes: taxInvoice.notes || null,
          terms_conditions: taxInvoice.terms_conditions || null,
          payment_terms: taxInvoice.payment_terms || '30 วัน',
          project_name: taxInvoice.project_name || null,
          po_number: taxInvoice.po_number || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (taxInvoiceError) {
        throw taxInvoiceError;
      }

      // Save tax invoice items
      const taxInvoiceItems = items.map(item => ({
        tax_invoice_id: (taxInvoiceData as any).id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        discount_type: item.discount_type,
        line_total: item.line_total,
        is_software: item.is_software
      }));

      const { error: itemsError } = await supabase
        .from('tax_invoice_items' as any)
        .insert(taxInvoiceItems);

      if (itemsError) {
        throw itemsError;
      }

      toast({
        title: "บันทึกสำเร็จ",
        description: `ใบส่งสินค้า/ใบกำกับภาษีเลขที่ ${taxInvoice.tax_invoice_number} ได้รับการบันทึกเรียบร้อยแล้ว`,
        variant: "default",
      });

      navigate('/tax-invoices');
      
    } catch (error: any) {
      console.error('Error saving tax invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกใบส่งสินค้า/ใบกำกับภาษีได้",
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
          <button onClick={() => navigate('/tax-invoices')} className="hover:text-foreground">
            ใบส่งสินค้า/ใบกำกับภาษี
          </button>
          <span>/</span>
          <span className="text-foreground">สร้างใบส่งสินค้า/ใบกำกับภาษีใหม่</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">สร้างใบส่งสินค้า/ใบกำกับภาษีใหม่</h1>
            <p className="text-muted-foreground mt-1">จัดการข้อมูลใบส่งสินค้า/ใบกำกับภาษี</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/tax-invoices')}>
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button onClick={saveTaxInvoice}>
              <Save className="w-4 h-4 mr-2" />
              บันทึก
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tax Invoice Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img src={entGroupLogo} alt="ENT Group Logo" className="w-16 h-16" />
                  <div>
                    <h2 className="text-xl font-bold">ใบส่งสินค้า/ใบกำกับภาษี</h2>
                    <p className="text-sm text-muted-foreground">เลขที่: {taxInvoice.tax_invoice_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_invoice_number">เลขที่ใบส่งสินค้า/ใบกำกับภาษี</Label>
                    <Input
                      id="tax_invoice_number"
                      value={taxInvoice.tax_invoice_number}
                      onChange={(e) => updateTaxInvoice('tax_invoice_number', e.target.value)}
                      placeholder="เลขที่ใบส่งสินค้า/ใบกำกับภาษี"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_invoice_date">วันที่ออกใบส่งสินค้า/ใบกำกับภาษี</Label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="tax_invoice_date"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !taxInvoice.tax_invoice_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {taxInvoice.tax_invoice_date ? format(taxInvoice.tax_invoice_date, "dd/MM/yyyy") : "เลือกวันที่"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={taxInvoice.tax_invoice_date}
                          onSelect={(date) => {
                            if (date) {
                              updateTaxInvoice('tax_invoice_date', date);
                              setIsDatePickerOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
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
                        <TableCell className="text-center font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Select onValueChange={(value) => handleProductSelect(item.id, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกสินค้า" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
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
                            {item.is_software && (
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
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={item.unit_price === 0 ? '' : item.unit_price.toString()}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                updateItem(item.id, 'unit_price', value === '' ? 0 : parseFloat(value) || 0);
                              }
                            }}
                            onFocus={(e) => {
                              if (e.target.value === '0') {
                                e.target.select();
                              }
                            }}
                            placeholder="0"
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
                        <TableCell className="text-right font-medium">
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Customer & Summary */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">ข้อมูลลูกค้า</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">เลือกลูกค้า</Label>
                    <Select onValueChange={handleCustomerSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกลูกค้า" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_name">ชื่อลูกค้า</Label>
                    <Input
                      id="customer_name"
                      value={taxInvoice.customer_name}
                      onChange={(e) => updateTaxInvoice('customer_name', e.target.value)}
                      placeholder="ชื่อลูกค้า"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_address">ที่อยู่</Label>
                    <Textarea
                      id="customer_address"
                      value={taxInvoice.customer_address}
                      onChange={(e) => updateTaxInvoice('customer_address', e.target.value)}
                      placeholder="ที่อยู่ลูกค้า"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">เบอร์โทร</Label>
                    <Input
                      id="customer_phone"
                      value={taxInvoice.customer_phone}
                      onChange={(e) => updateTaxInvoice('customer_phone', e.target.value)}
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_email">อีเมล</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={taxInvoice.customer_email}
                      onChange={(e) => updateTaxInvoice('customer_email', e.target.value)}
                      placeholder="อีเมล"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">สรุปยอดเงิน</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>ยอดรวม (ไม่รวมภาษี)</span>
                    <span>฿{items.reduce((sum, item) => sum + item.line_total, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {includeVat && (
                    <div className="flex justify-between text-sm">
                      <span>ภาษีมูลค่าเพิ่ม 7%</span>
                      <span>฿{(items.reduce((sum, item) => sum + item.line_total, 0) * 0.07).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  <hr />
                  
                  <div className="flex justify-between font-semibold">
                    <span>ยอดรวมทั้งสิ้น</span>
                    <span>฿{(items.reduce((sum, item) => sum + item.line_total, 0) * (includeVat ? 1.07 : 1)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}