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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Save, X, FileText, CalendarIcon, Edit, Printer, Share, Download, MoreHorizontal, Check, ChevronsUpDown, ChevronUp, ChevronDown, Search, Upload, Eye, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from 'date-fns';
import { cn } from "@/lib/utils";
import entGroupLogo from "@/assets/ent-group-logo.png";
import QuotationPreview from "@/components/quotations/QuotationPreview";
import { useQuotationPDF, generateQuotationFilename } from "@/components/quotations/QuotationPDF";
import CompanySettings from "@/components/settings/CompanySettings";
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
  const { id } = useParams();
  const { user } = useAuth();
  const { exportToPDF: exportQuotationToPDF, printQuotation: printQuotationPDF } = useQuotationPDF();
  
  // State for preview and company settings
  const [previewOpen, setPreviewOpen] = useState(false);
  const [companySettingsOpen, setCompanySettingsOpen] = useState(false);
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
  const [items, setItems] = useState<QuotationItem[]>(() => {
    // Initialize with one empty item for better user experience
    return [{
      id: Date.now().toString(),
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      discount_type: 'amount',
      line_total: 0,
      is_software: false
    }];
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [includeVat, setIncludeVat] = useState(true);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchValue, setCustomerSearchValue] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [globalProductSearchOpen, setGlobalProductSearchOpen] = useState(false);
  const [globalProductSearchValue, setGlobalProductSearchValue] = useState("");
  const [govDocAgreement, setGovDocAgreement] = useState(false);
  const [companyNotes, setCompanyNotes] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const loadData = async () => {
      await loadCustomers();
      await loadProducts();
      if (id) {
        await loadQuotation(id);
      } else {
        generateQuotationNumber();
      }
    };
    loadData();
  }, [id]);
  const loadCustomers = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลลูกค้าได้",
        variant: "destructive"
      });
    }
  };
  const loadProducts = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
        variant: "destructive"
      });
    }
  };
  const loadQuotation = async (quotationId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('quotations').select(`
          *,
          quotation_items (*)
        `).eq('id', quotationId).single();
      if (error) throw error;
      if (data) {
        setQuotation({
          id: data.id,
          quotation_number: data.quotation_number,
          quotation_date: data.quotation_date,
          valid_until: data.valid_until,
          customer_id: data.customer_id,
          customer_name: data.customer_name,
          customer_email: data.customer_email || '',
          customer_phone: data.customer_phone || '',
          customer_address: data.customer_address || '',
          customer_line_id: data.customer_phone || '',
          subtotal: data.subtotal,
          discount_amount: data.discount_amount,
          discount_percentage: data.discount_percentage,
          vat_amount: data.vat_amount,
          withholding_tax_amount: data.withholding_tax_amount,
          total_amount: data.total_amount,
          status: data.status,
          notes: data.notes || '',
          terms_conditions: data.terms_conditions || ''
        });
        if (data.quotation_items) {
          const loadedItems = data.quotation_items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: item.discount_amount,
            discount_type: (item.discount_percentage > 0 ? 'percentage' : 'amount') as 'amount' | 'percentage',
            line_total: item.line_total,
            is_software: item.is_software || false
          }));
          setItems(loadedItems);
        }

        // Set customer if available - need to wait for customers to be loaded
        if (data.customer_id) {
          // Load the customer specifically if not in the current list
          const {
            data: customerData,
            error: customerError
          } = await supabase.from('customers').select('*').eq('id', data.customer_id).single();
          if (!customerError && customerData) {
            setSelectedCustomer(customerData);
            setCustomerSearchValue(customerData.name);
          }
        }
      }
    } catch (error) {
      console.error('Error loading quotation:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลใบเสนอราคาได้",
        variant: "destructive"
      });
    }
  };
  const generateQuotationNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const number = `QT${year}${month}${random}`;
    setQuotation(prev => ({
      ...prev,
      quotation_number: number
    }));
  };
  const calculateTotals = () => {
    const rawSubtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const totalDiscount = items.reduce((sum, item) => {
      if (item.discount_type === 'percentage') {
        return sum + item.quantity * item.unit_price * (item.discount_amount / 100);
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
        const updatedItem = {
          ...item,
          [field]: value
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
  };
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  const moveItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    let newIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < items.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }
    const newItems = [...items];
    [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];
    setItems(newItems);
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
            description: `ชื่อสินค้า: ${product.name}${product.brand ? '\nแบรนด์: ' + product.brand : ''}${product.sku ? '\nรหัสสินค้า (SKU): ' + product.sku : ''}${product.category ? '\nหมวดหมู่: ' + product.category : ''}${product.price ? '\nราคาต่อหน่วย: ' + product.price.toLocaleString('th-TH') + ' บาท' : ''}${product.brand || product.category ? '\n\nรายละเอียดเพิ่มเติม: ' : ''}`
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

  const addItemFromSearch = (product: Product) => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      description: `ชื่อสินค้า: ${product.name}${product.brand ? '\nแบรนด์: ' + product.brand : ''}${product.sku ? '\nรหัสสินค้า (SKU): ' + product.sku : ''}${product.category ? '\nหมวดหมู่: ' + product.category : ''}${product.price ? '\nราคาต่อหน่วย: ' + product.price.toLocaleString('th-TH') + ' บาท' : ''}\n\nรายละเอียดเพิ่มเติม: `,
      quantity: 1,
      unit_price: product.price,
      discount_amount: 0,
      discount_type: 'amount',
      line_total: product.price,
      is_software: false
    };
    setItems(prev => [...prev, newItem]);
    toast({
      title: "เพิ่มสินค้าสำเร็จ",
      description: `เพิ่ม ${product.name} ลงในรายการแล้ว`,
    });
  };
  const saveQuotation = async () => {
    try {
      const itemSubtotal = items.reduce((sum, item) => sum + item.line_total, 0);
      const vatAmount = itemSubtotal * 0.07;
      const totalAmount = itemSubtotal + vatAmount - quotation.withholding_tax_amount;
      if (id) {
        // Update existing quotation
        const {
          error: quotationError
        } = await supabase.from('quotations').update({
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
          status: quotation.status,
          notes: quotation.notes,
          terms_conditions: quotation.terms_conditions
        }).eq('id', id);
        if (quotationError) throw quotationError;

        // Delete existing items
        const {
          error: deleteError
        } = await supabase.from('quotation_items').delete().eq('quotation_id', id);
        if (deleteError) throw deleteError;

        // Insert updated items
        if (items.length > 0) {
          const itemsToSave = items.map(item => ({
            quotation_id: id,
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
          const {
            error: itemsError
          } = await supabase.from('quotation_items').insert(itemsToSave);
          if (itemsError) throw itemsError;
        }
        toast({
          title: "อัปเดตสำเร็จ",
          description: "ใบเสนอราคาได้รับการอัปเดตเรียบร้อยแล้ว",
          variant: "default"
        });
      } else {
        // Create new quotation
        const {
          data: savedQuotation,
          error: quotationError
        } = await supabase.from('quotations').insert({
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
        }).select().single();
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
          const {
            error: itemsError
          } = await supabase.from('quotation_items').insert(itemsToSave);
          if (itemsError) throw itemsError;
        }
        toast({
          title: "บันทึกสำเร็จ",
          description: "ใบเสนอราคาได้รับการบันทึกเรียบร้อยแล้ว",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Error saving quotation:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกใบเสนอราคาได้",
        variant: "destructive"
      });
    }
  };
  const saveAndClose = async () => {
    try {
      await saveQuotation();
      navigate('/quotations');
    } catch (error) {
      // Error handling is already done in saveQuotation
    }
  };
  const handleExportToPDF = async () => {
    // ตรวจสอบข้อมูลก่อน export
    if (!quotation.quotation_number) {
      toast({
        title: "ไม่สามารถส่งออก PDF ได้",
        description: "กรุณากรอกหมายเลขใบเสนอราคาก่อน",
        variant: "destructive"
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: "ไม่สามารถส่งออก PDF ได้",
        description: "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ",
        variant: "destructive"
      });
      return;
    }

    // เตรียมข้อมูลสำหรับ PDF
    const quotationData = {
      ...quotation,
      items: items
    };

    const companyInfo = {
      name: "บริษัท อี เอ็น ที กรุ๊ป จำกัด (สำนักงานใหญ่)",
      address: "เลขที่ 70/5 หมู่บ้านเมทโทร บิซทาวน์แจ้งวัฒนะ 2 หมูที่ 4 ตำบลคลองพราอุดม อำเภอปากเกร็ด จังหวัดนนทบุรี 11120",
      taxId: "0135558013167",
      phone: "02-045-6104",
      mobile: "095-7391053, 082-2497922",
      fax: "02-045-6105",
      website: "www.entgroup.co.th",
      email: "sales@entgroup.co.th"
    };

    // เรียกใช้ฟังก์ชั่น export ใหม่
    await exportQuotationToPDF({
      filename: generateQuotationFilename(quotation.quotation_number),
      quotationData,
      companyInfo
    });
  };
  const printQuotation = () => {
    window.print();
  };
  const shareQuotation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ใบเสนอราคา ${quotation.quotation_number}`,
          text: `ใบเสนอราคาจาก ENT GROUP สำหรับ ${quotation.customer_name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback สำหรับเบราว์เซอร์ที่ไม่รองรับ Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "คัดลอกลิงก์แล้ว",
        description: "ลิงก์ใบเสนอราคาได้ถูกคัดลอกไปยังคลิปบอร์ดแล้ว"
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
          <span className="text-foreground">สร้างใบเสนอราคาใหม่/แก้ไข</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">สร้างใบเสนอราคาใหม่/แก้ไข</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* เมนูส่งออกและพิมพ์ */}
            <div className="flex items-center space-x-1 border-r pr-2">
              <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(true)} title="ดูตัวอย่าง">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={shareQuotation} title="แชร์">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={printQuotation} title="พิมพ์">
                <Printer className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExportToPDF} title="ดาวน์โหลด PDF">
                <Download className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" title="เพิ่มเติม">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setPreviewOpen(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    ดูตัวอย่าง
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportToPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    ส่งออก PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={printQuotation}>
                    <Printer className="w-4 h-4 mr-2" />
                    พิมพ์เอกสาร
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareQuotation}>
                    <Share className="w-4 h-4 mr-2" />
                    แชร์เอกสาร
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCompanySettingsOpen(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    ตั้งค่าบริษัท
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => navigate('/quotations')}>
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button variant="outline" size="sm" onClick={saveQuotation}>
              <Save className="w-4 h-4 mr-2" />
              บันทึก
            </Button>
            <Button variant="default" size="sm" onClick={saveAndClose}>
              <Save className="w-4 h-4 mr-2" />
              บันทึกและปิด
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
                    <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={customerSearchOpen} className="w-full justify-between mt-1 border-gray-300 bg-background" onClick={() => {
                        console.log('Customer dropdown clicked');
                        setCustomerSearchOpen(!customerSearchOpen);
                      }}>
                          {selectedCustomer ? selectedCustomer.name : "เลือกลูกค้า..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[500px] p-0 bg-background border shadow-lg z-[1000]" align="start">
                        <Command className="bg-background">
                          <CommandInput 
                            placeholder="พิมพ์เพื่อค้นหาลูกค้า..." 
                            value={customerSearchValue} 
                            onValueChange={value => {
                              console.log('Search value:', value);
                              setCustomerSearchValue(value);
                            }} 
                            className="bg-background h-12 text-base px-4" 
                          />
                          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                            ไม่พบลูกค้าที่ค้นหา
                          </CommandEmpty>
                          <CommandGroup className="bg-background">
                            <CommandList className="max-h-64 overflow-y-auto bg-background">
                              {customers.filter(customer => {
                              const searchLower = customerSearchValue.toLowerCase();
                              return customer.name.toLowerCase().includes(searchLower) || customer.tax_id && customer.tax_id.includes(searchLower) || customer.phone && customer.phone.includes(searchLower);
                            }).map(customer => <CommandItem key={customer.id} value={customer.name} onSelect={() => {
                              console.log('Selected customer:', customer.name);
                              selectCustomer(customer.id);
                              setCustomerSearchOpen(false);
                              setCustomerSearchValue("");
                            }} className="cursor-pointer hover:bg-accent hover:text-accent-foreground bg-background">
                                    <Check className={cn("mr-2 h-4 w-4", selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{customer.name}</span>
                                      {customer.tax_id && <span className="text-xs text-muted-foreground">
                                          เลขประจำตัวผู้เสียภาษี: {customer.tax_id}
                                        </span>}
                                      {customer.phone && <span className="text-xs text-muted-foreground">
                                          โทร: {customer.phone}
                                        </span>}
                                    </div>
                                  </CommandItem>)}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {selectedCustomer && <div className="mt-2 p-2 bg-muted rounded-md">
                        <Label className="text-xs font-medium text-muted-foreground">หมายเลขผู้เสียภาษี / TAX ID</Label>
                        <div className="text-sm font-mono font-medium">
                          {selectedCustomer.tax_id || 'ไม่มีข้อมูลหมายเลขผู้เสียภาษี'}
                        </div>
                      </div>}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm font-medium">อีเมล</Label>
                      <Input value={quotation.customer_email} onChange={e => setQuotation(prev => ({
                      ...prev,
                      customer_email: e.target.value
                    }))} className="mt-1 text-sm border-gray-300" placeholder="email@example.com" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">เบอร์โทรศัพท์</Label>
                      <Input value={quotation.customer_phone} onChange={e => setQuotation(prev => ({
                      ...prev,
                      customer_phone: e.target.value
                    }))} className="mt-1 text-sm border-gray-300" placeholder="08x-xxx-xxxx" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Line ID</Label>
                      <Input value={quotation.customer_line_id || ''} onChange={e => setQuotation(prev => ({
                      ...prev,
                      customer_line_id: e.target.value
                    }))} className="mt-1 text-sm border-gray-300" placeholder="@lineid" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ที่อยู่</Label>
                    <Textarea value={quotation.customer_address} onChange={e => setQuotation(prev => ({
                    ...prev,
                    customer_address: e.target.value
                  }))} className="mt-1 border-gray-300" rows={3} placeholder="ที่อยู่ลูกค้า" />
                  </div>
                </div>

                <div className="space-y-3 flex flex-col items-end">
                  <div className="w-full max-w-xs">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <Edit className="w-4 h-4 text-gray-500" />
                      <Label className="text-sm font-medium text-right">เลขที่เอกสาร</Label>
                    </div>
                    <Input value={quotation.quotation_number} onChange={e => setQuotation(prev => ({
                    ...prev,
                    quotation_number: e.target.value
                  }))} className="text-right text-4xl font-extrabold text-blue-600 border-0 shadow-none bg-transparent h-16 focus:ring-0 focus:border-0" placeholder="QT202400001" />
                  </div>
                  <div className="w-full max-w-xs">
                    <Label className="text-sm font-medium block text-right mb-1">วันที่</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-between text-right font-normal", !quotation.quotation_date && "text-muted-foreground")}>
                          {quotation.quotation_date ? format(new Date(quotation.quotation_date), "dd/MM/yyyy") : <span>เลือกวันที่</span>}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar mode="single" selected={quotation.quotation_date ? new Date(quotation.quotation_date) : undefined} onSelect={date => {
                        if (date) {
                          setQuotation(prev => ({
                            ...prev,
                            quotation_date: format(date, 'yyyy-MM-dd')
                          }));
                        }
                      }} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="w-full max-w-xs">
                    <Label className="text-sm font-medium block text-right mb-1">วันที่หมดอายุ</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-between text-right font-normal", !quotation.valid_until && "text-muted-foreground")}>
                          {quotation.valid_until ? format(new Date(quotation.valid_until), "dd/MM/yyyy") : <span>B</span>}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar mode="single" selected={quotation.valid_until ? new Date(quotation.valid_until) : undefined} onSelect={date => {
                        if (date) {
                          setQuotation(prev => ({
                            ...prev,
                            valid_until: format(date, 'yyyy-MM-dd')
                          }));
                        }
                      }} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="w-full max-w-xs">
                    <Label className="text-sm font-medium block text-right mb-1">สถานะเอกสาร</Label>
                    <Select value={quotation.status} onValueChange={value => setQuotation(prev => ({
                    ...prev,
                    status: value
                  }))}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={4}>
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

            {/* Product Search and Add */}
            <div className="border border-gray-200 rounded-lg mb-4">
              <div className="p-4 bg-gray-50/50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">ค้นหาและเพิ่มสินค้า</h3>
              </div>
              <div className="p-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Popover open={globalProductSearchOpen} onOpenChange={setGlobalProductSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          role="combobox" 
                          aria-expanded={globalProductSearchOpen} 
                          className="w-full justify-between"
                        >
                          <div className="flex items-center">
                            <Search className="w-4 h-4 mr-2" />
                            {globalProductSearchValue || "ค้นหาสินค้าเพื่อเพิ่มลงรายการ..."}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[600px] p-0 bg-background border shadow-lg z-[1000]" align="start">
                        <Command className="bg-background">
                          <CommandInput 
                            placeholder="พิมพ์ชื่อสินค้า, SKU, หรือแบรนด์..." 
                            value={globalProductSearchValue} 
                            onValueChange={setGlobalProductSearchValue}
                            className="bg-background h-12 text-base px-4" 
                          />
                          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                            ไม่พบสินค้าที่ค้นหา
                          </CommandEmpty>
                          <CommandGroup className="bg-background">
                            <CommandList className="max-h-64 overflow-y-auto bg-background">
                              {products.filter(product => {
                                const searchLower = globalProductSearchValue.toLowerCase();
                                return product.name.toLowerCase().includes(searchLower) || 
                                       product.sku.toLowerCase().includes(searchLower) ||
                                       (product.brand && product.brand.toLowerCase().includes(searchLower));
                              }).map(product => (
                                <CommandItem 
                                  key={product.id} 
                                  value={product.name} 
                                  onSelect={() => {
                                    addItemFromSearch(product);
                                    setGlobalProductSearchValue('');
                                    setGlobalProductSearchOpen(false);
                                  }}
                                  className="hover:bg-accent cursor-pointer p-3"
                                >
                                  <div className="w-full">
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      SKU: {product.sku} | ราคา: ฿{product.price.toLocaleString('th-TH')}
                                    </div>
                                    {product.brand && (
                                      <div className="text-sm text-muted-foreground">แบรนด์: {product.brand}</div>
                                    )}
                                    {product.category && (
                                      <div className="text-sm text-muted-foreground">หมวดหมู่: {product.category}</div>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button onClick={addItem} variant="outline" size="default">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มรายการใหม่
                  </Button>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">รายการสินค้าในใบเสนอราคา</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[400px] max-w-[500px]">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="กรองสินค้าในดรอปดาวน์..." 
                      value={productFilter} 
                      onChange={e => setProductFilter(e.target.value)} 
                      className="text-sm bg-background border-2 focus:border-primary" 
                    />
                    {productFilter && (
                      <Button variant="ghost" size="sm" onClick={() => setProductFilter('')} className="px-2">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {productFilter ? (
                      <>พบ {products.filter(product => 
                        product.name.toLowerCase().includes(productFilter.toLowerCase()) || 
                        product.sku.toLowerCase().includes(productFilter.toLowerCase()) || 
                        (product.brand && product.brand.toLowerCase().includes(productFilter.toLowerCase()))
                      ).length} รายการ จากการกรอง</>
                    ) : (
                      <>ทั้งหมด {products.length} รายการ</>
                    )}
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <TableHead className="w-16 text-primary-foreground font-semibold text-center align-middle">ลำดับ</TableHead>
                    <TableHead className="w-[40%] text-primary-foreground font-semibold align-middle">รายการสินค้า</TableHead>
                    <TableHead className="w-28 text-primary-foreground font-semibold text-center align-middle">จำนวน</TableHead>
                    <TableHead className="w-40 text-primary-foreground font-semibold text-center align-middle">ราคาต่อหน่วย</TableHead>
                    <TableHead className="w-36 text-primary-foreground font-semibold text-center align-middle">ส่วนลด</TableHead>
                    <TableHead className="w-24 text-primary-foreground font-semibold text-center align-middle">รวม</TableHead>
                    <TableHead className="w-20 text-primary-foreground align-middle"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                  const filteredProducts = products.filter(product => productFilter === "" || product.name.toLowerCase().includes(productFilter.toLowerCase()) || product.sku.toLowerCase().includes(productFilter.toLowerCase()) || product.brand && product.brand.toLowerCase().includes(productFilter.toLowerCase()));
                  return <TableRow key={item.id}>
                        <TableCell className="w-16 text-center">
                          <div className="flex flex-col items-center gap-1 h-full">
                            <span className="font-medium text-muted-foreground">
                              {index + 1}
                            </span>
                            <div className="flex flex-col gap-1">
                              <Button variant="ghost" size="sm" onClick={() => moveItem(item.id, 'up')} disabled={index === 0} className="h-6 w-6 p-0 hover:bg-accent">
                                <ChevronUp className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => moveItem(item.id, 'down')} disabled={index === items.length - 1} className="h-6 w-6 p-0 hover:bg-accent bg-slate-100 hover:bg-slate-200">
                                <ChevronDown className="w-3 h-3 text-slate-600" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[40%]">
                          <div className="space-y-2">
                            <Select key={`product-${item.id}`} onValueChange={value => selectProduct(item.id, value)}>
                              <SelectTrigger className="text-sm text-left">
                                <SelectValue placeholder="เลือกสินค้า" />
                              </SelectTrigger>
                              <SelectContent 
                                className="bg-background border border-border shadow-lg z-50"
                                position="popper"
                                sideOffset={4}
                              >
                                {filteredProducts.length === 0 ? (
                                  <div className="py-6 text-center text-sm text-muted-foreground">
                                    {productFilter ? `ไม่พบสินค้าที่ค้นหา "${productFilter}"` : 'ไม่มีสินค้าในระบบ'}
                                  </div>
                                ) : (
                                  filteredProducts.map(product => (
                                    <SelectItem key={product.id} value={product.id} className="text-sm text-left hover:bg-accent">
                                      <div className="text-left">
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-xs text-muted-foreground">SKU: {product.sku} | ราคา: {product.price.toLocaleString('th-TH')} บาท</div>
                                        {product.brand && <div className="text-xs text-muted-foreground">แบรนด์: {product.brand}</div>}
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            

                            <div>
                              <Textarea placeholder="รายละเอียดสินค้าจะแสดงที่นี่เมื่อเลือกสินค้า..." value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="text-sm text-left min-h-[60px] max-h-[400px] resize-y w-full mt-1" rows={3} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-28 align-top">
                          <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} min="1" className="text-center" />
                        </TableCell>
                        <TableCell className="w-40 align-top">
                          <Input type="number" value={item.unit_price} onChange={e => updateItem(item.id, 'unit_price', Number(e.target.value))} min="0" step="0.01" className="text-right w-32" placeholder="0.00" />
                        </TableCell>
                        <TableCell className="w-36 align-top">
                          <div className="flex gap-1">
                            <Input type="number" value={item.discount_amount} onChange={e => updateItem(item.id, 'discount_amount', Number(e.target.value))} min="0" step="0.01" className="text-right flex-1 min-w-[80px]" placeholder="0" />
                            <Select 
                              key={`discount-${item.id}`} 
                              value={item.discount_type} 
                              onValueChange={(value: 'amount' | 'percentage') => updateItem(item.id, 'discount_type', value)}
                            >
                              <SelectTrigger className="w-16 bg-background border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent 
                                className="bg-background border border-border shadow-lg z-50"
                                position="popper"
                                sideOffset={4}
                              >
                                <SelectItem value="percentage" className="hover:bg-accent">
                                  <span className="text-sm">%</span>
                                </SelectItem>
                                <SelectItem value="amount" className="hover:bg-accent">
                                  <span className="text-sm">฿</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="w-24 font-medium text-right align-top">
                          {item.line_total.toLocaleString('th-TH', {
                        minimumFractionDigits: 2
                      })}
                        </TableCell>
                        <TableCell className="w-20">
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>;
                })}
                </TableBody>
              </Table>
            </div>

            {/* VAT Toggle */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="vat-toggle" checked={includeVat} onCheckedChange={checked => setIncludeVat(checked as boolean)} />
                <Label htmlFor="vat-toggle" className="text-sm">คิด VAT 7%</Label>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end mt-6">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span>รวมเป็นเงิน:</span>
                  <span>{quotation.subtotal.toLocaleString('th-TH', {
                    minimumFractionDigits: 2
                  })} บาท</span>
                </div>
                {quotation.discount_amount > 0 && <div className="flex justify-between text-red-600">
                    <span>ส่วนลดรวม:</span>
                    <span>-{quotation.discount_amount.toLocaleString('th-TH', {
                    minimumFractionDigits: 2
                  })} บาท</span>
                  </div>}
                <div className="flex justify-between">
                  <span>ราคาหลังหักส่วนลด:</span>
                  <span>{(quotation.subtotal - quotation.discount_amount).toLocaleString('th-TH', {
                    minimumFractionDigits: 2
                  })} บาท</span>
                </div>
                {includeVat && <div className="flex justify-between">
                    <span>ภาษีมูลค่าเพิ่ม 7%:</span>
                    <span>{quotation.vat_amount.toLocaleString('th-TH', {
                    minimumFractionDigits: 2
                  })} บาท</span>
                  </div>}
                {quotation.withholding_tax_amount > 0 && <div className="flex justify-between text-orange-600">
                    <span>หักภาษี ณ ที่จ่าย:</span>
                    <span>-{quotation.withholding_tax_amount.toLocaleString('th-TH', {
                    minimumFractionDigits: 2
                  })} บาท</span>
                  </div>}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>จำนวนเงินรวมทั้งสิ้น:</span>
                  <span>{quotation.total_amount.toLocaleString('th-TH', {
                    minimumFractionDigits: 2
                  })} บาท</span>
                </div>
              </div>
            </div>

            {/* Electronic Signature and Company Stamp Section */}
            <div className="mt-8 border-t pt-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Notes and Agreement */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/50 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="gov-doc-agreement" checked={govDocAgreement} onCheckedChange={checked => setGovDocAgreement(checked as boolean)} />
                    <Label htmlFor="gov-doc-agreement" className="text-sm font-medium">
                      ลายเซ็นอิเล็กทรอนิกส์และตรายาง
                    </Label>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">หมายเหตุ:</Label>
                    <Textarea placeholder="หมายเหตุเพิ่มเติม..." value={quotation.notes || ''} onChange={e => setQuotation(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))} className="text-sm border-gray-300 bg-white" rows={4} />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">โน๊ตภายในบริษัท:</Label>
                    <Textarea placeholder="เนื้อหานี้จะแสดงเฉพาะใช้ภายในบริษัท" value={companyNotes} onChange={e => setCompanyNotes(e.target.value)} className="text-sm border-gray-300 bg-white" rows={4} />
                  </div>
                </div>

                {/* Right Column - Signature Upload */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                  <h4 className="text-lg font-semibold mb-4 text-center">ลายเซ็นผู้เสนอราคา</h4>
                  
                  {/* Signature Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors bg-white">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      คลิกเพื่ออัพโหลดไฟล์ หรือลากไฟล์มาวางที่นี่
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 5MB)
                    </p>
                    <input type="file" accept=".jpg,.jpeg,.png" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast({
                          title: "ไฟล์ใหญ่เกินไป",
                          description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
                          variant: "destructive"
                        });
                        return;
                      }
                      setSignatureFile(file);
                    }
                  }} className="hidden" id="signature-upload" />
                    <Label htmlFor="signature-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" type="button" asChild>
                        <span>เลือกไฟล์</span>
                      </Button>
                    </Label>
                    {signatureFile && <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700 font-medium">
                          ✓ ไฟล์ที่เลือก: {signatureFile.name}
                        </p>
                      </div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Logo - Bottom Right */}
            <div className="flex justify-end mt-8">
              <div className="relative">
                <img src={entGroupLogo} alt="ENT GROUP" className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ตัวอย่างใบเสนอราคา</DialogTitle>
            <DialogDescription>
              ตรวจสอบความถูกต้องของข้อมูลก่อนบันทึกหรือส่งออก
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => printQuotationPDF('quotation-preview')}
              >
                <Printer className="w-4 h-4 mr-2" />
                พิมพ์
              </Button>
              <Button 
                size="sm" 
                onClick={handleExportToPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                ส่งออก PDF
              </Button>
            </div>
            
            <QuotationPreview 
              quotationData={{
                ...quotation,
                items: items
              }}
              printMode={false}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Settings Dialog */}
      <Dialog open={companySettingsOpen} onOpenChange={setCompanySettingsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ตั้งค่าข้อมูลบริษัท</DialogTitle>
            <DialogDescription>
              จัดการข้อมูลบริษัทที่จะแสดงในใบเสนอราคา
            </DialogDescription>
          </DialogHeader>
          
          <CompanySettings />
        </DialogContent>
      </Dialog>
    </div>
  );
}