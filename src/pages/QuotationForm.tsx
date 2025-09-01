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
import { Plus, Trash2, Save, X, FileText, CalendarIcon, Edit } from 'lucide-react';
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
  customer_line_id?: string;
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

export default function QuotationForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      customer_line_id: '',
      subtotal: 0,
      discount_amount: 0,
      discount_percentage: 0,
      vat_amount: 0,
      withholding_tax_amount: 0,
      total_amount: 0,
      status: 'pending',
      notes: '',
      terms_conditions: ''
    };
  });
  
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [includeVat, setIncludeVat] = useState(true);
  const { toast } = useToast();

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
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const number = `QT${year}${month}${random}`;
    setQuotation(prev => ({ ...prev, quotation_number: number }));
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
    const vatAmount = includeVat ? priceAfterDiscount * 0.07 : 0;
    const softwareItems = items.filter(item => item.is_software);
    const softwareSubtotal = softwareItems.reduce((sum, item) => sum + item.line_total, 0);
    const withholdingTaxAmount = softwareSubtotal * 0.03;
    const totalAmount = priceAfterDiscount + vatAmount - withholdingTaxAmount;

    setQuotation(prev => ({
      ...prev,
      subtotal: rawSubtotal,
      discount_amount: totalDiscount,
      vat_amount: vatAmount,
      withholding_tax_amount: withholdingTaxAmount,
      total_amount: totalAmount
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [items, includeVat]);

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
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
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
      setItems(prevItems => prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            unit_price: product.price,
            description: `${product.brand ? product.brand + ' ' : ''}${product.name}`
          };
          
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
        customer_address: customer.address || '',
        customer_line_id: customer.line_id || ''
      }));
    }
  };

  const saveQuotation = async () => {
    try {
      const itemSubtotal = items.reduce((sum, item) => sum + item.line_total, 0);
      const vatAmount = itemSubtotal * 0.07;
      const totalAmount = itemSubtotal + vatAmount - quotation.withholding_tax_amount;

      const { data: savedQuotation, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          quotation_number: quotation.quotation_number,
          quotation_date: quotation.quotation_date,
          valid_until: quotation.valid_until,
          customer_id: quotation.customer_id,
          customer_name: quotation.customer_name,
          customer_email: quotation.customer_email,
          customer_phone: quotation.customer_phone,
          customer_address: quotation.customer_address,
          subtotal: itemSubtotal,
          discount_amount: quotation.discount_amount,
          discount_percentage: quotation.discount_percentage,
          vat_amount: vatAmount,
          withholding_tax_amount: quotation.withholding_tax_amount,
          total_amount: totalAmount,
          status: 'draft',
          notes: quotation.notes,
          terms_conditions: quotation.terms_conditions,
          created_by: user?.id
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      if (items.length > 0) {
        const itemsToSave = items.map(item => ({
          quotation_id: savedQuotation.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          discount_percentage: item.discount_type === 'percentage' ? item.discount_amount : 0,
          line_total: item.line_total,
          is_software: item.is_software
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(itemsToSave);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "บันทึกสำเร็จ",
        description: "ใบเสนอราคาได้รับการบันทึกเรียบร้อยแล้ว",
        variant: "default",
      });

      navigate('/quotations');
      
    } catch (error: any) {
      console.error('Error saving quotation:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกใบเสนอราคาได้",
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
          <button onClick={() => navigate('/quotations')} className="hover:text-foreground">
            ใบเสนอราคา
          </button>
          <span>/</span>
          <span className="text-foreground">สร้างใบเสนอราคาใหม่</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">สร้างใบเสนอราคาใหม่</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/quotations')}>
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button variant="default" size="sm" onClick={saveQuotation}>
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
                        value={quotation.customer_email} 
                        onChange={(e) => setQuotation(prev => ({ ...prev, customer_email: e.target.value }))}
                        className="mt-1 text-sm border-gray-300"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">เบอร์โทรศัพท์</Label>
                      <Input 
                        value={quotation.customer_phone} 
                        onChange={(e) => setQuotation(prev => ({ ...prev, customer_phone: e.target.value }))}
                        className="mt-1 text-sm border-gray-300"
                        placeholder="08x-xxx-xxxx"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Line ID</Label>
                      <Input 
                        value={quotation.customer_line_id || ''} 
                        onChange={(e) => setQuotation(prev => ({ ...prev, customer_line_id: e.target.value }))}
                        className="mt-1 text-sm border-gray-300"
                        placeholder="@lineid"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ที่อยู่</Label>
                    <Textarea 
                      value={quotation.customer_address} 
                      onChange={(e) => setQuotation(prev => ({ ...prev, customer_address: e.target.value }))}
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
                      <Label className="text-sm font-medium text-right">เลขที่เอกสาร</Label>
                    </div>
                    <Input 
                      value={quotation.quotation_number} 
                      onChange={(e) => setQuotation(prev => ({ ...prev, quotation_number: e.target.value }))}
                      className="text-right text-3xl font-extrabold border-2 border-gray-400 h-14"
                      placeholder="QT202400001"
                    />
                  </div>
                  <div className="w-full max-w-xs">
                    <Label className="text-sm font-medium block text-right mb-1">วันที่</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-right font-normal",
                            !quotation.quotation_date && "text-muted-foreground"
                          )}
                        >
                          {quotation.quotation_date ? (
                            format(new Date(quotation.quotation_date), "dd/MM/yyyy")
                          ) : (
                            <span>เลือกวันที่</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={quotation.quotation_date ? new Date(quotation.quotation_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setQuotation(prev => ({ ...prev, quotation_date: format(date, 'yyyy-MM-dd') }));
                            }
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="w-full max-w-xs">
                    <Label className="text-sm font-medium block text-right mb-1">วันที่หมดอายุ</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-right font-normal",
                            !quotation.valid_until && "text-muted-foreground"
                          )}
                        >
                          {quotation.valid_until ? (
                            format(new Date(quotation.valid_until), "dd/MM/yyyy")
                          ) : (
                            <span>เลือกวันที่</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={quotation.valid_until ? new Date(quotation.valid_until) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setQuotation(prev => ({ ...prev, valid_until: format(date, 'yyyy-MM-dd') }));
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
                      value={quotation.status} 
                      onValueChange={(value) => setQuotation(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">ร่าง</SelectItem>
                        <SelectItem value="pending">รอการอนุมัติ</SelectItem>
                        <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                        <SelectItem value="rejected">ถูกปฏิเสธ</SelectItem>
                        <SelectItem value="expired">หมดอายุ</SelectItem>
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
                    <TableHead className="w-16 text-primary-foreground font-semibold text-center">ลำดับ</TableHead>
                    <TableHead className="w-[30%] text-primary-foreground font-semibold">รายการสินค้า</TableHead>
                    <TableHead className="w-28 text-primary-foreground font-semibold text-center">จำนวน</TableHead>
                    <TableHead className="w-40 text-primary-foreground font-semibold text-center">ราคาต่อหน่วย</TableHead>
                    <TableHead className="w-36 text-primary-foreground font-semibold text-center">ส่วนลด</TableHead>
                    <TableHead className="w-24 text-primary-foreground font-semibold text-center">รวม</TableHead>
                    <TableHead className="w-12 text-primary-foreground"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="w-16 text-center">
                        <div className="flex items-center justify-center h-full">
                          <span className="font-medium text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[30%]">
                        <div className="space-y-2">
                          <Select onValueChange={(value) => selectProduct(item.id, value)}>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="เลือกสินค้า" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id} className="text-sm">
                                  {product.name} - {product.sku}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="รายละเอียดเพิ่มเติม (สามารถกรอกได้สูงสุด 1500 ตัวอักษร)"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="text-sm min-h-[60px] resize-y"
                            maxLength={1500}
                            rows={3}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="w-28">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          min="1"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell className="w-40">
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="text-right"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell className="w-36">
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={item.discount_amount}
                            onChange={(e) => updateItem(item.id, 'discount_amount', Number(e.target.value))}
                            min="0"
                            step="0.01"
                            className="text-right flex-1 min-w-[80px]"
                            placeholder="0"
                          />
                          <Select
                            value={item.discount_type}
                            onValueChange={(value: 'amount' | 'percentage') => updateItem(item.id, 'discount_type', value)}
                          >
                            <SelectTrigger className="w-16 bg-background border border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-lg z-50">
                              <SelectItem value="amount" className="hover:bg-accent">บาท</SelectItem>
                              <SelectItem value="percentage" className="hover:bg-accent">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="w-24 font-medium text-right">
                        {item.line_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="w-12">
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
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
                  <span>{quotation.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                </div>
                {quotation.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>ส่วนลดรวม:</span>
                    <span>-{quotation.discount_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ราคาหลังหักส่วนลด:</span>
                  <span>{(quotation.subtotal - quotation.discount_amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                </div>
                {includeVat && (
                  <div className="flex justify-between">
                    <span>ภาษีมูลค่าเพิ่ม 7%:</span>
                    <span>{quotation.vat_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                  </div>
                )}
                {quotation.withholding_tax_amount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>หักภาษี ณ ที่จ่าย:</span>
                    <span>-{quotation.withholding_tax_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>จำนวนเงินรวมทั้งสิ้น:</span>
                  <span>{quotation.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                </div>
              </div>
            </div>

            {/* Company Logo - Bottom Right */}
            <div className="flex justify-end mt-8">
              <div className="relative">
                <img 
                  src={entGroupLogo} 
                  alt="ENT GROUP" 
                  className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}