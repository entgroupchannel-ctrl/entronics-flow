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
  const [products, setProducts] = useState<Product[]>([]);
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
      terms_conditions: 'ชำระเงินภายใน 30 วัน นับจากวันที่ออกใบส่งสินค้า/ใบกำกับภาษี\nกรณีชำระเงินช้ากว่ากำหนด ทางบริษัทฯ ขอสงวนสิทธิ์ในการคิดดอกเบี้ยในอัตราร้อยละ 1.25 ต่อเดือน',
      payment_terms: '30 วัน',
      project_name: '',
      po_number: ''
    };
  });
  
  const [items, setItems] = useState<TaxInvoiceItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [includeVat, setIncludeVat] = useState(true);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchValue, setCustomerSearchValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      await loadCustomers();
      await loadProducts();
      
      if (id) {
        await loadTaxInvoice(id);
      } else {
        generateTaxInvoiceNumber();
        loadInvoiceData();
      }
    };
    loadData();
  }, [id]);

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

  const loadTaxInvoice = async (taxInvoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('tax_invoices')
        .select(`
          *,
          tax_invoice_items (*)
        `)
        .eq('id', taxInvoiceId)
        .single();

      if (error) throw error;

      if (data) {
        setTaxInvoice({
          id: data.id,
          tax_invoice_number: data.tax_invoice_number,
          tax_invoice_date: data.tax_invoice_date,
          due_date: data.due_date,
          customer_id: data.customer_id,
          customer_name: data.customer_name,
          customer_email: data.customer_email || '',
          customer_phone: data.customer_phone || '',
          customer_address: data.customer_address || '',
          subtotal: data.subtotal,
          discount_amount: data.discount_amount,
          discount_percentage: data.discount_percentage,
          vat_amount: data.vat_amount,
          withholding_tax_amount: data.withholding_tax_amount,
          total_amount: data.total_amount,
          status: data.status,
          notes: data.notes || '',
          terms_conditions: data.terms_conditions || '',
          payment_terms: data.payment_terms || '30 วัน',
          project_name: data.project_name || '',
          po_number: data.po_number || '',
          invoice_id: data.invoice_id || ''
        });

        if (data.tax_invoice_items) {
          const loadedItems = data.tax_invoice_items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: item.discount_amount,
            discount_type: (item.discount_amount > 0 ? 'amount' : 'percentage') as 'amount' | 'percentage',
            line_total: item.line_total,
            is_software: item.is_software || false
          }));
          setItems(loadedItems);
        }

        // Set customer if available
        if (data.customer_id) {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', data.customer_id)
            .single();
          
          if (!customerError && customerData) {
            setSelectedCustomer(customerData);
            setCustomerSearchValue(customerData.name);
          }
        }
      }
    } catch (error) {
      console.error('Error loading tax invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลใบส่งสินค้า/ใบกำกับภาษีได้",
        variant: "destructive",
      });
    }
  };

  const generateTaxInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const number = `INV${year}${month}${random}`;
    setTaxInvoice(prev => ({ ...prev, tax_invoice_number: number }));
  };

  const loadInvoiceData = () => {
    try {
      const invoiceData = sessionStorage.getItem('tax_invoice_from_invoice');
      if (invoiceData) {
        const data = JSON.parse(invoiceData);
        
        setTaxInvoice(prev => ({
          ...prev,
          invoice_id: data.invoice_id || '',
          customer_id: data.customer_id || '',
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
          terms_conditions: data.terms_conditions || '',
          payment_terms: data.payment_terms || '30 วัน',
          project_name: data.project_name || '',
          po_number: data.po_number || ''
        }));

        if (data.items) {
          setItems(data.items);
        }

        toast({
          title: "นำเข้าข้อมูลสำเร็จ",
          description: `นำเข้าข้อมูลจากใบแจ้งหนี้ ${data.invoice_number} เรียบร้อยแล้ว`,
        });

        sessionStorage.removeItem('tax_invoice_from_invoice');
      }
    } catch (error) {
      console.error('Error loading invoice data:', error);
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
    const vatAmount = includeVat ? priceAfterDiscount * 0.07 : 0;
    const softwareItems = items.filter(item => item.is_software);
    const softwareSubtotal = softwareItems.reduce((sum, item) => sum + item.line_total, 0);
    const withholdingTaxAmount = softwareSubtotal * 0.03;
    const totalAmount = priceAfterDiscount + vatAmount - withholdingTaxAmount;

    setTaxInvoice(prev => ({
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

  const updateItem = (id: string, field: keyof TaxInvoiceItem, value: any) => {
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
            description: `${product.brand ? product.brand + ' ' : ''}${product.name}`,
            is_software: product.is_software || false
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
          description: "ใบส่งสินค้า/ใบกำกับภาษีได้รับการบันทึกเรียบร้อยแล้ว",
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
    try {
      await saveTaxInvoice();
      navigate('/tax-invoices');
    } catch (error) {
      console.error('Error saving and closing:', error);
    }
  };

  const exportPDF = async () => {
    if (!taxInvoice.tax_invoice_number) {
      toast({
        title: "ไม่สามารถส่งออก PDF ได้",
        description: "กรุณากรอกหมายเลขใบส่งสินค้า/ใบกำกับภาษีก่อน",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "ไม่สามารถส่งออก PDF ได้", 
        description: "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ",
        variant: "destructive",
      });
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      doc.save(`TaxInvoice_${taxInvoice.tax_invoice_number}.pdf`);
      
      toast({
        title: "ส่งออกสำเร็จ",
        description: "ใบส่งสินค้า/ใบกำกับภาษีได้รับการส่งออกเป็น PDF เรียบร้อยแล้ว",
      });
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออก PDF ได้",
        variant: "destructive",
      });
    }
  };

  const printTaxInvoice = () => {
    window.print();
  };

  const shareTaxInvoice = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ใบส่งสินค้า/ใบกำกับภาษี ${taxInvoice.tax_invoice_number}`,
          text: `ใบส่งสินค้า/ใบกำกับภาษีจาก ENT GROUP สำหรับ ${taxInvoice.customer_name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "คัดลอกลิงก์แล้ว",
        description: "ลิงก์ใบส่งสินค้า/ใบกำกับภาษีได้ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
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
          <span className="text-foreground">สร้างใบส่งสินค้า/ใบกำกับภาษีใหม่/แก้ไข</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">สร้างใบส่งสินค้า/ใบกำกับภาษีใหม่/แก้ไข</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* เมนูส่งออกและพิมพ์ */}
            <div className="flex items-center space-x-1 border-r pr-2">
              <Button variant="ghost" size="sm" onClick={shareTaxInvoice} title="แชร์">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={printTaxInvoice} title="พิมพ์">
                <Printer className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={exportPDF} title="ดาวน์โหลด PDF">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            {/* เมนูการดำเนินการ */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/tax-invoices')}>
                <X className="w-4 h-4 mr-2" />
                ยกเลิก
              </Button>
              <Button variant="outline" onClick={saveTaxInvoice}>
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </Button>
              <Button onClick={saveAndClose}>
                <Save className="w-4 h-4 mr-2" />
                บันทึกและปิด
              </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img src={entGroupLogo} alt="ENT GROUP" className="w-16 h-16 object-contain" />
                    <div>
                      <h2 className="text-xl font-bold text-primary">บริษัท อีเอ็นที กรุ๊ป จำกัด</h2>
                      <p className="text-sm text-muted-foreground">ENT GROUP CO., LTD.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        เลขประจำตัวผู้เสียภาษี: 0135558013167
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold text-primary">ใบส่งสินค้า/ใบกำกับภาษี</h3>
                    <p className="text-sm text-muted-foreground">Tax Invoice / Delivery Note</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Invoice Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">รายละเอียดใบส่งสินค้า/ใบกำกับภาษี</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_invoice_number">เลขที่ใบส่งสินค้า/ใบกำกับภาษี</Label>
                    <Input
                      id="tax_invoice_number"
                      value={taxInvoice.tax_invoice_number}
                      onChange={(e) => setTaxInvoice(prev => ({ ...prev, tax_invoice_number: e.target.value }))}
                      placeholder="เลขที่ใบส่งสินค้า/ใบกำกับภาษี"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tax_invoice_date">วันที่ออกใบส่งสินค้า/ใบกำกับภาษี</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !taxInvoice.tax_invoice_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {taxInvoice.tax_invoice_date ? format(new Date(taxInvoice.tax_invoice_date), 'dd/MM/yyyy') : "เลือกวันที่"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={taxInvoice.tax_invoice_date ? new Date(taxInvoice.tax_invoice_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setTaxInvoice(prev => ({ ...prev, tax_invoice_date: format(date, 'yyyy-MM-dd') }));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="due_date">วันครบกำหนด</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !taxInvoice.due_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {taxInvoice.due_date ? format(new Date(taxInvoice.due_date), 'dd/MM/yyyy') : "เลือกวันที่"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={taxInvoice.due_date ? new Date(taxInvoice.due_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setTaxInvoice(prev => ({ ...prev, due_date: format(date, 'yyyy-MM-dd') }));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
              </CardContent>
            </Card>

            {/* Customer Selection */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">ข้อมูลลูกค้า</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">เลือกลูกค้า</Label>
                    <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={customerSearchOpen}
                          className="w-full justify-between"
                        >
                          {selectedCustomer
                            ? selectedCustomer.name
                            : "เลือกลูกค้า..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="ค้นหาลูกค้า..." 
                            value={customerSearchValue}
                            onValueChange={setCustomerSearchValue}
                          />
                          <CommandEmpty>ไม่พบลูกค้า</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {customers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.name}
                                  onSelect={() => {
                                    selectCustomer(customer.id);
                                    setCustomerSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {customer.name}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_name">ชื่อลูกค้า</Label>
                      <Input
                        id="customer_name"
                        value={taxInvoice.customer_name}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, customer_name: e.target.value }))}
                        placeholder="ชื่อลูกค้า"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer_phone">เบอร์โทร</Label>
                      <Input
                        id="customer_phone"
                        value={taxInvoice.customer_phone}
                        onChange={(e) => setTaxInvoice(prev => ({ ...prev, customer_phone: e.target.value }))}
                        placeholder="เบอร์โทรศัพท์"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer_email">อีเมล</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={taxInvoice.customer_email}
                      onChange={(e) => setTaxInvoice(prev => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="อีเมล"
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">รายการสินค้า</h3>
                  <Button onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มรายการ
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">รายการ</TableHead>
                        <TableHead className="w-[100px]">จำนวน</TableHead>
                        <TableHead className="w-[120px]">ราคาต่อหน่วย</TableHead>
                        <TableHead className="w-[100px]">ส่วนลด</TableHead>
                        <TableHead className="w-[120px]">รวม</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="space-y-2">
                              <Select 
                                value={item.product_id || ""} 
                                onValueChange={(value) => selectProduct(item.id, value)}
                              >
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
                                value={item.product_name}
                                onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                                placeholder="ชื่อสินค้า"
                              />
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                placeholder="รายละเอียด"
                                rows={2}
                              />
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`software-${item.id}`}
                                  checked={item.is_software}
                                  onCheckedChange={(checked) => updateItem(item.id, 'is_software', checked)}
                                />
                                <Label htmlFor={`software-${item.id}`} className="text-sm">
                                  Software (หัก 3% ภาษี ณ ที่จ่าย)
                                </Label>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Select
                                value={item.discount_type}
                                onValueChange={(value: 'amount' | 'percentage') => updateItem(item.id, 'discount_type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="amount">บาท</SelectItem>
                                  <SelectItem value="percentage">%</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                value={item.discount_amount}
                                onChange={(e) => updateItem(item.id, 'discount_amount', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              ฿{item.line_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
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

            {/* Notes and Terms */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">หมายเหตุและเงื่อนไข</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea
                      id="notes"
                      value={taxInvoice.notes}
                      onChange={(e) => setTaxInvoice(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="หมายเหตุเพิ่มเติม"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="terms_conditions">เงื่อนไขการชำระเงิน</Label>
                    <Textarea
                      id="terms_conditions"
                      value={taxInvoice.terms_conditions}
                      onChange={(e) => setTaxInvoice(prev => ({ ...prev, terms_conditions: e.target.value }))}
                      placeholder="เงื่อนไขการชำระเงิน"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">ระยะเวลาชำระเงิน</Label>
                    <Input
                      id="payment_terms"
                      value={taxInvoice.payment_terms}
                      onChange={(e) => setTaxInvoice(prev => ({ ...prev, payment_terms: e.target.value }))}
                      placeholder="เช่น 30 วัน"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">สรุปยอดเงิน</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>ยอดรวม (ไม่รวมภาษี)</span>
                    <span>฿{taxInvoice.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>ส่วนลด</span>
                    <span>฿{taxInvoice.discount_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeVat"
                        checked={includeVat}
                        onCheckedChange={(checked) => setIncludeVat(checked === true)}
                      />
                      <Label htmlFor="includeVat">ภาษีมูลค่าเพิ่ม 7%</Label>
                    </div>
                    <span>฿{taxInvoice.vat_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>หัก ณ ที่จ่าย 3%</span>
                    <span>฿{taxInvoice.withholding_tax_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>ยอดรวมทั้งสิ้น</span>
                    <span>฿{taxInvoice.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">สถานะ</h3>
                <Select
                  value={taxInvoice.status}
                  onValueChange={(value) => setTaxInvoice(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">ร่าง</SelectItem>
                    <SelectItem value="sent">ส่งแล้ว</SelectItem>
                    <SelectItem value="paid">ชำระเงินแล้ว</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}