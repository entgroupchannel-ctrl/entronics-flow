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
import { Plus, Trash2, Save, X, FileText, CalendarIcon, Edit, MoreHorizontal, Clock, Printer, Share, Download, Check, ChevronsUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from 'react-router-dom';
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

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  total_amount: number;
  status: string;
  invoice_items?: InvoiceItem[];
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
  line_total: number;
  is_software: boolean;
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

interface TaxInvoice {
  id?: string;
  tax_invoice_number: string;
  tax_invoice_date: string;
  due_date?: string;
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
  payment_terms?: string;
  project_name?: string;
  po_number?: string;
  invoice_id?: string;
}

export default function TaxInvoiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [invoiceSearchOpen, setInvoiceSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [customerSearchValue, setCustomerSearchValue] = useState('');
  const [invoiceSearchValue, setInvoiceSearchValue] = useState('');
  const [productSearchValue, setProductSearchValue] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [items, setItems] = useState<TaxInvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<TaxInvoiceItem>({
    id: '',
    product_name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    discount_type: 'amount',
    line_total: 0,
    is_software: false
  });
  const [taxInvoice, setTaxInvoice] = useState<TaxInvoice>(() => {
    const today = new Date();
    const dueDate = addDays(today, 30);
    
    return {
      tax_invoice_number: '',
      tax_invoice_date: format(today, 'yyyy-MM-dd'),
      due_date: format(dueDate, 'yyyy-MM-dd'),
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
      terms_conditions: 'ขอให้ชำระเงินภายใน 30 วัน นับจากวันที่ในใบกำกับภาษี\nกรณีชำระเงินเกินกำหนด ขอสงวนสิทธิ์เรียกดอกเบี้ยในอัตราร้อยละ 1.5 ต่อเดือน',
      payment_terms: '30 วัน',
      project_name: '',
      po_number: ''
    };
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      await loadInvoices();
      await loadCustomers();
      await loadProducts();
      
      if (id) {
        // For editing mode, load existing tax invoice data
        // Implementation needed for loadTaxInvoice function
      } else {
        generateTaxInvoiceNumber();
        loadInvoiceData();
      }
    };
    loadData();
  }, [id]);

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้",
        variant: "destructive",
      });
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

  const selectInvoice = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      
      // อัปเดตข้อมูลใบกำกับภาษีจากใบแจ้งหนี้
      setTaxInvoice(prev => ({
        ...prev,
        invoice_id: invoice.id,
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name,
        customer_email: invoice.customer_email || '',
        customer_phone: invoice.customer_phone || '',
        customer_address: invoice.customer_address || ''
      }));

      // อัปเดตรายการสินค้าจากใบแจ้งหนี้
      if (invoice.invoice_items && invoice.invoice_items.length > 0) {
        const invoiceItems = invoice.invoice_items.map(item => ({
          id: Math.random().toString(36).substr(2, 9),
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku || '',
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          discount_type: 'amount' as const,
          line_total: item.line_total,
          is_software: item.is_software
        }));
        setItems(invoiceItems);
      }

      // ค้นหาและตั้งค่าลูกค้าที่เลือก
      if (invoice.customer_id) {
        const customer = customers.find(c => c.id === invoice.customer_id);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }
    }
  };

  const selectCustomer = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setTaxInvoice(prev => ({
        ...prev,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email || '',
        customer_phone: customer.phone || '',
        customer_address: customer.address || ''
      }));
    }
  };

  const saveTaxInvoice = async () => {
    if (!selectedInvoice && !id) {
      toast({
        title: "กรุณาเลือกใบแจ้งหนี้",
        description: "ต้องเลือกใบแจ้งหนี้ก่อนเพื่อสร้างใบกำกับภาษี",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemSubtotal = items.reduce((sum, item) => sum + item.line_total, 0);
      const vatAmount = itemSubtotal * 0.07;
      const totalAmount = itemSubtotal + vatAmount - taxInvoice.withholding_tax_amount;

      if (id) {
        // Update existing tax invoice
        const { error: taxInvoiceError } = await supabase
          .from('tax_invoices')
          .update({
            tax_invoice_number: taxInvoice.tax_invoice_number,
            tax_invoice_date: taxInvoice.tax_invoice_date,
            due_date: taxInvoice.due_date || null,
            customer_id: taxInvoice.customer_id || null,
            customer_name: taxInvoice.customer_name,
            customer_email: taxInvoice.customer_email || null,
            customer_phone: taxInvoice.customer_phone || null,
            customer_address: taxInvoice.customer_address || null,
            subtotal: itemSubtotal,
            discount_amount: taxInvoice.discount_amount,
            discount_percentage: taxInvoice.discount_percentage,
            vat_amount: vatAmount,
            withholding_tax_amount: taxInvoice.withholding_tax_amount,
            total_amount: totalAmount,
            status: taxInvoice.status,
            notes: taxInvoice.notes || null,
            terms_conditions: taxInvoice.terms_conditions || null,
            payment_terms: taxInvoice.payment_terms || null,
            project_name: taxInvoice.project_name || null,
            po_number: taxInvoice.po_number || null,
            invoice_id: taxInvoice.invoice_id || null
          })
          .eq('id', id);

        if (taxInvoiceError) throw taxInvoiceError;

        // Delete existing items
        const { error: deleteError } = await supabase
          .from('tax_invoice_items')
          .delete()
          .eq('tax_invoice_id', id);

        if (deleteError) throw deleteError;

        // Insert updated items
        if (items.length > 0) {
          const itemsToSave = items.map(item => ({
            tax_invoice_id: id,
            product_id: item.product_id || null,
            product_name: item.product_name,
            product_sku: item.product_sku || null,
            description: item.description || null,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: item.discount_amount,
            discount_type: item.discount_type,
            line_total: item.line_total,
            is_software: item.is_software
          }));

          const { error: itemsError } = await supabase
            .from('tax_invoice_items')
            .insert(itemsToSave);

          if (itemsError) throw itemsError;
        }

        toast({
          title: "อัปเดตสำเร็จ",
          description: "ใบส่งสินค้า/ใบกำกับภาษีได้รับการอัปเดตเรียบร้อยแล้ว",
          variant: "default",
        });
      } else {
        // Create new tax invoice
        const { data: savedTaxInvoice, error: taxInvoiceError } = await supabase
          .from('tax_invoices')
          .insert({
            tax_invoice_number: taxInvoice.tax_invoice_number,
            tax_invoice_date: taxInvoice.tax_invoice_date,
            due_date: taxInvoice.due_date || null,
            customer_id: taxInvoice.customer_id || null,
            customer_name: taxInvoice.customer_name,
            customer_email: taxInvoice.customer_email || null,
            customer_phone: taxInvoice.customer_phone || null,
            customer_address: taxInvoice.customer_address || null,
            subtotal: itemSubtotal,
            discount_amount: taxInvoice.discount_amount,
            discount_percentage: taxInvoice.discount_percentage,
            vat_amount: vatAmount,
            withholding_tax_amount: taxInvoice.withholding_tax_amount,
            total_amount: totalAmount,
            status: 'draft',
            notes: taxInvoice.notes || null,
            terms_conditions: taxInvoice.terms_conditions || null,
            payment_terms: taxInvoice.payment_terms || null,
            project_name: taxInvoice.project_name || null,
            po_number: taxInvoice.po_number || null,
            invoice_id: taxInvoice.invoice_id || null,
            created_by: user?.id
          })
          .select()
          .single();

        if (taxInvoiceError) throw taxInvoiceError;

        if (items.length > 0) {
          const itemsToSave = items.map(item => ({
            tax_invoice_id: savedTaxInvoice.id,
            product_id: item.product_id || null,
            product_name: item.product_name,
            product_sku: item.product_sku || null,
            description: item.description || null,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: item.discount_amount,
            discount_type: item.discount_type,
            line_total: item.line_total,
            is_software: item.is_software
          }));

          const { error: itemsError } = await supabase
            .from('tax_invoice_items')
            .insert(itemsToSave);

          if (itemsError) throw itemsError;
        }

        toast({
          title: "บันทึกสำเร็จ",
          description: "ใบส่งสินค้า/ใบกำกับภาษีถูกสร้างเรียบร้อยแล้ว",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error saving tax invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกใบส่งสินค้า/ใบกำกับภาษีได้",
        variant: "destructive",
      });
    }
  };

  const saveAndClose = async () => {
    if (!selectedInvoice && !id) {
      toast({
        title: "กรุณาเลือกใบแจ้งหนี้",
        description: "ต้องเลือกใบแจ้งหนี้ก่อนเพื่อสร้างใบกำกับภาษี",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveTaxInvoice();
      navigate('/tax-invoices');
    } catch (error) {
      console.error('Error saving and closing:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
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

  const loadInvoiceData = () => {
    const invoiceFromQuotation = sessionStorage.getItem('tax_invoice_from_invoice');
    if (invoiceFromQuotation) {
      try {
        const data = JSON.parse(invoiceFromQuotation);
        setTaxInvoice(prev => ({
          ...prev,
          ...data
        }));
        sessionStorage.removeItem('tax_invoice_from_invoice');
      } catch (error) {
        console.error('Error parsing invoice data:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 p-6 bg-card rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <img src={entGroupLogo} alt="ENT Group Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">สร้างใบส่งสินค้า / ใบกำกับภาษี</h1>
              <p className="text-sm text-muted-foreground">
                {id ? `แก้ไขใบกำกับภาษี #${taxInvoice.tax_invoice_number}` : 'สร้างใบกำกับภาษีใหม่'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate('/tax-invoices')}>
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button onClick={saveTaxInvoice}>
              <Save className="w-4 h-4 mr-2" />
              บันทึก
            </Button>
            <Button onClick={saveAndClose}>
              <Check className="w-4 h-4 mr-2" />
              บันทึกและปิด
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Printer className="w-4 h-4 mr-2" />
                  พิมพ์
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  แชร์
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  ส่งออก PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Selection */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">เลือกใบแจ้งหนี้อ้างอิง</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice">เลือกใบแจ้งหนี้ (BL)</Label>
                    <Popover open={invoiceSearchOpen} onOpenChange={setInvoiceSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={invoiceSearchOpen}
                          className="w-full justify-between"
                          disabled={!!id}
                        >
                          {selectedInvoice
                            ? `${selectedInvoice.invoice_number} - ${selectedInvoice.customer_name}`
                            : "เลือกใบแจ้งหนี้..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="ค้นหาใบแจ้งหนี้..." 
                            value={invoiceSearchValue}
                            onValueChange={setInvoiceSearchValue}
                          />
                          <CommandEmpty>ไม่พบใบแจ้งหนี้</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {invoices.map((invoice) => (
                                <CommandItem
                                  key={invoice.id}
                                  value={`${invoice.invoice_number} ${invoice.customer_name}`}
                                  onSelect={() => {
                                    selectInvoice(invoice.id);
                                    setInvoiceSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedInvoice?.id === invoice.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{invoice.invoice_number}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {invoice.customer_name} - {formatCurrency(invoice.total_amount)}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {!selectedInvoice && !id && (
                      <p className="text-sm text-muted-foreground">
                        กรุณาเลือกใบแจ้งหนี้ก่อนเพื่อสร้างใบกำกับภาษี
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information - แสดงเมื่อเลือกใบแจ้งหนี้แล้ว */}
            {(selectedInvoice || id) && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">ข้อมูลลูกค้า</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_name">ชื่อลูกค้า</Label>
                      <Input
                        id="customer_name"
                        value={taxInvoice.customer_name}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, customer_name: e.target.value }))}
                        placeholder="ชื่อลูกค้า"
                        disabled={!!selectedInvoice}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer_phone">เบอร์โทร</Label>
                      <Input
                        id="customer_phone"
                        value={taxInvoice.customer_phone}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, customer_phone: e.target.value }))}
                        placeholder="เบอร์โทรศัพท์"
                        disabled={!!selectedInvoice}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_email">อีเมล</Label>
                      <Input
                        id="customer_email"
                        value={taxInvoice.customer_email}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, customer_email: e.target.value }))}
                        placeholder="อีเมล"
                        disabled={!!selectedInvoice}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer_address">ที่อยู่</Label>
                      <Textarea
                        id="customer_address"
                        value={taxInvoice.customer_address}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, customer_address: e.target.value }))}
                        placeholder="ที่อยู่ลูกค้า"
                        rows={3}
                        disabled={!!selectedInvoice}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Product Items - แสดงเมื่อเลือกใบแจ้งหนี้แล้ว */}
            {(selectedInvoice || id) && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">รายการสินค้า</h3>
                {items.length > 0 && (
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead>รายการ</TableHead>
                          <TableHead className="text-center">จำนวน</TableHead>
                          <TableHead className="text-right">ราคาต่อหน่วย</TableHead>
                          <TableHead className="text-right">ส่วนลด</TableHead>
                          <TableHead className="text-right">รวม</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.product_name}</div>
                                {item.description && (
                                  <div className="text-sm text-muted-foreground">{item.description}</div>
                                )}
                                {item.product_sku && (
                                  <div className="text-xs text-muted-foreground">SKU: {item.product_sku}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.discount_amount)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(item.line_total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tax Invoice Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">ข้อมูลใบกำกับภาษี</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_invoice_number">เลขที่ใบกำกับภาษี</Label>
                    <Input
                      id="tax_invoice_number"
                      value={taxInvoice.tax_invoice_number}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax_invoice_date">วันที่</Label>
                      <Input
                        id="tax_invoice_date"
                        type="date"
                        value={taxInvoice.tax_invoice_date}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, tax_invoice_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due_date">วันครบกำหนด</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={taxInvoice.due_date}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="project_name">ชื่อโครงการ</Label>
                      <Input
                        id="project_name"
                        value={taxInvoice.project_name}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, project_name: e.target.value }))}
                        placeholder="ชื่อโครงการ (ถ้ามี)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="po_number">เลขที่ใบสั่งซื้อ</Label>
                      <Input
                        id="po_number"
                        value={taxInvoice.po_number}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, po_number: e.target.value }))}
                        placeholder="เลขที่ใบสั่งซื้อ (ถ้ามี)"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">สรุปยอดรวม</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>ยอดรวม</span>
                    <span>{formatCurrency(items.reduce((sum, item) => sum + item.line_total, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT 7%</span>
                    <span>{formatCurrency(items.reduce((sum, item) => sum + item.line_total, 0) * 0.07)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>หัก ณ ที่จ่าย</span>
                    <span>-{formatCurrency(taxInvoice.withholding_tax_amount)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>ยอดรวมสุทธิ</span>
                      <span>{formatCurrency(
                        items.reduce((sum, item) => sum + item.line_total, 0) + 
                        (items.reduce((sum, item) => sum + item.line_total, 0) * 0.07) - 
                        taxInvoice.withholding_tax_amount
                      )}</span>
                    </div>
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