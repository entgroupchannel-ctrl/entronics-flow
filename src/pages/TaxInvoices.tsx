import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, FileText, Edit, Share2, Printer, Download, MoreHorizontal, History, Trash2, Receipt, X, RotateCcw, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { Sidebar } from "@/components/layout/Sidebar";

interface TaxInvoice {
  id: string;
  tax_invoice_number: string;
  tax_invoice_date: string;
  customer_name: string;
  total_amount: number;
  status: string;
  due_date?: string;
  invoice_id?: string;
  tax_invoice_items?: any[];
  payments_verified?: boolean;
  can_issue_receipt?: boolean;
  invoice?: {
    id: string;
    invoice_number: string;
  };
  payment_records?: Array<{
    id: string;
    verification_status: string;
    amount_received: number;
    payment_number: string;
  }>;
}

export default function TaxInvoices() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [taxInvoices, setTaxInvoices] = useState<TaxInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaxInvoiceToDelete, setSelectedTaxInvoiceToDelete] = useState<{id: string, number: string} | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  
  // Payment verification states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTaxInvoiceForPayment, setSelectedTaxInvoiceForPayment] = useState<TaxInvoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'โอนเงิน',
    amount_received: 0,
    payment_reference: '',
    bank_name: '',
    depositor_name: '',
    payment_notes: '',
    payment_evidence_file: null as File | null
  });

  useEffect(() => {
    loadTaxInvoices();
  }, []);

  const loadTaxInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tax_invoices' as any)
        .select(`
          *,
          tax_invoice_items (*),
          invoices(id, invoice_number),
          payment_records(
            id,
            verification_status,
            amount_received,
            payment_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTaxInvoices((data as any) || []);
    } catch (error: any) {
      console.error('Error loading tax invoices:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายการใบส่งสินค้า/ใบกำกับภาษีได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'รอเก็บเงิน':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">รอเก็บเงิน</Badge>;
      case 'สร้างใบเสร็จรับเงิน':
        return <Badge variant="default" className="bg-green-100 text-green-800">สร้างใบเสร็จรับเงิน</Badge>;
      case 'สร้างใบวางบิลรวม':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">สร้างใบวางบิลรวม</Badge>;
      case 'สร้างใบเสร็จรวม':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">สร้างใบเสร็จรวม</Badge>;
      case 'แบ่งรับชำระเงิน':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">แบ่งรับชำระเงิน</Badge>;
      case 'ยกเลิก':
        return <Badge variant="destructive">ยกเลิก</Badge>;
      case 'รีเซ็ต':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">รีเซ็ต</Badge>;
      case 'ดำเนินการแล้ว':
        return <Badge variant="default" className="bg-green-100 text-green-800">ดำเนินการแล้ว</Badge>;
      case 'draft':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 h-6 px-2 text-xs"
              >
                สร้างใบเสร็จรับเงิน
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 bg-white border border-gray-200 shadow-lg" align="start">
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">
                <Receipt className="w-4 h-4 mr-2" />
                สร้างใบเสร็จรับเงิน
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">
                <FileText className="w-4 h-4 mr-2" />
                สร้างใบวางบิลรวม
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">
                <Receipt className="w-4 h-4 mr-2" />
                สร้างใบเสร็จรวม
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">
                <div className="flex items-center text-orange-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  แบ่งรับชำระเงิน
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTaxInvoices = taxInvoices.filter(taxInvoice => {
    const matchesSearch = taxInvoice.tax_invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxInvoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || taxInvoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTaxInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredTaxInvoices.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(currentItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (action === 'delete') {
      setBulkDeleteDialogOpen(true);
    } else {
      console.log(`Bulk action: ${action} for items:`, selectedItems);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      for (const taxInvoiceId of selectedItems) {
        // ลบ tax invoice items ก่อน
        await supabase
          .from('tax_invoice_items')
          .delete()
          .eq('tax_invoice_id', taxInvoiceId);

        // ลบ tax invoice
        await supabase
          .from('tax_invoices' as any)
          .delete()
          .eq('id', taxInvoiceId);
      }

      toast({
        title: "ลบสำเร็จ",
        description: `ลบใบส่งสินค้า/ใบกำกับภาษี ${selectedItems.length} รายการเรียบร้อยแล้ว`,
      });

      // Clear selections and reload data
      setSelectedItems([]);
      loadTaxInvoices();

    } catch (error: any) {
      console.error('Error bulk deleting tax invoices:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบใบส่งสินค้า/ใบกำกับภาษีได้",
        variant: "destructive",
      });
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (taxInvoiceId: string, taxInvoiceNumber: string) => {
    // ปิด dropdown ทันที
    setDropdownOpen(null);
    // เปิด dialog หลังจาก dropdown ปิดแล้ว
    setTimeout(() => {
      setSelectedTaxInvoiceToDelete({ id: taxInvoiceId, number: taxInvoiceNumber });
      setDeleteDialogOpen(true);
    }, 100);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTaxInvoiceToDelete) return;

    try {
      // ลบ tax invoice items ก่อน
      const { error: itemsError } = await supabase
        .from('tax_invoice_items')
        .delete()
        .eq('tax_invoice_id', selectedTaxInvoiceToDelete.id);

      if (itemsError) throw itemsError;

      // ลบ tax invoice
      const { error: taxInvoiceError } = await supabase
        .from('tax_invoices' as any)
        .delete()
        .eq('id', selectedTaxInvoiceToDelete.id);

      if (taxInvoiceError) throw taxInvoiceError;

      toast({
        title: "ลบสำเร็จ",
        description: `ลบใบส่งสินค้า/ใบกำกับภาษี ${selectedTaxInvoiceToDelete.number} เรียบร้อยแล้ว`,
      });

      // รีโหลดข้อมูล
      loadTaxInvoices();

    } catch (error: any) {
      console.error('Error deleting tax invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบใบส่งสินค้า/ใบกำกับภาษีได้",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTaxInvoiceToDelete(null);
    }
  };

  // Check if tax invoice has verified payments
  const checkPaymentStatus = async (taxInvoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_records')
        .select('amount_received')
        .eq('tax_invoice_id', taxInvoiceId)
        .eq('verification_status', 'verified');

      if (error) throw error;

      const totalVerifiedPayments = data?.reduce((sum, payment) => sum + payment.amount_received, 0) || 0;
      return totalVerifiedPayments;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return 0;
    }
  };

  // Check if tax invoice has verified payments
  const getPaymentStatus = (taxInvoice: TaxInvoice) => {
    if (!taxInvoice.payment_records || taxInvoice.payment_records.length === 0) {
      return { hasVerifiedPayments: false, totalVerified: 0, verifiedPayments: [] };
    }
    
    const verifiedPayments = taxInvoice.payment_records.filter(p => p.verification_status === 'verified');
    const totalVerified = verifiedPayments.reduce((sum, p) => sum + p.amount_received, 0);
    const hasVerifiedPayments = totalVerified >= taxInvoice.total_amount;
    
    return { hasVerifiedPayments, totalVerified, verifiedPayments };
  };

  // Get payment status badge
  const getPaymentStatusBadge = (taxInvoice: TaxInvoice) => {
    const { hasVerifiedPayments, verifiedPayments } = getPaymentStatus(taxInvoice);
    
    if (hasVerifiedPayments && verifiedPayments.length > 0) {
      return (
        <div className="space-y-1">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            ✅ ยืนยันชำระเงิน
          </Badge>
          <button
            onClick={() => navigate(`/payment-records?invoice=${taxInvoice.id}`)}
            className="block text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            ดูการชำระเงิน ({verifiedPayments.length} รายการ)
          </button>
        </div>
      );
    }
    
    return getStatusBadge(taxInvoice.status);
  };

  // Handle receipt creation with payment verification
  const handleCreateReceipt = async (taxInvoice: TaxInvoice) => {
    try {
      const verifiedAmount = await checkPaymentStatus(taxInvoice.id);
      
      if (verifiedAmount < taxInvoice.total_amount) {
        // Show payment dialog if no sufficient verified payments
        setSelectedTaxInvoiceForPayment(taxInvoice);
        setPaymentForm(prev => ({
          ...prev,
          amount_received: taxInvoice.total_amount - verifiedAmount
        }));
        setPaymentDialogOpen(true);
      } else {
        // Proceed to receipt creation
        navigate(`/receipts/new?tax_invoice_id=${taxInvoice.id}`);
      }
    } catch (error) {
      console.error('Error handling receipt creation:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบสถานะการชำระเงินได้",
        variant: "destructive",
      });
    }
  };

  // Handle payment verification
  const handleVerifyPayment = async (taxInvoiceId: string) => {
    navigate(`/payment-records?tax_invoice_id=${taxInvoiceId}`);
  };

  // Handle payment evidence upload
  const handlePaymentSubmit = async () => {
    if (!selectedTaxInvoiceForPayment || !paymentForm.payment_evidence_file) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาแนบหลักฐานการชำระเงิน",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload payment evidence file
      const fileName = `${user.id}/${Date.now()}_${paymentForm.payment_evidence_file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-evidence')
        .upload(fileName, paymentForm.payment_evidence_file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('payment-evidence')
        .getPublicUrl(fileName);

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payment_records')
        .insert({
          tax_invoice_id: selectedTaxInvoiceForPayment.id,
          payment_method: paymentForm.payment_method,
          amount_received: paymentForm.amount_received,
          payment_reference: paymentForm.payment_reference,
          bank_name: paymentForm.bank_name,
          depositor_name: paymentForm.depositor_name,
          payment_notes: paymentForm.payment_notes,
          payment_evidence_url: publicUrl,
          created_by: user.id,
          verification_status: 'pending'
        } as any);

      if (paymentError) throw paymentError;

      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกหลักฐานการชำระเงินเรียบร้อยแล้ว รอการยืนยันจากผู้ดูแลระบบ",
      });

      // Reset form and close dialog
      setPaymentDialogOpen(false);
      setSelectedTaxInvoiceForPayment(null);
      setPaymentForm({
        payment_method: 'โอนเงิน',
        amount_received: 0,
        payment_reference: '',
        bank_name: '',
        depositor_name: '',
        payment_notes: '',
        payment_evidence_file: null
      });

    } catch (error: any) {
      console.error('Error submitting payment:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกหลักฐานการชำระเงินได้",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">กำลังโหลด...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">ใบส่งสินค้า/ใบกำกับภาษี</h1>
              <p className="text-muted-foreground mt-1">จัดการใบส่งสินค้า/ใบกำกับภาษีทั้งหมด</p>
            </div>
            <Button onClick={() => navigate('/tax-invoices/new')}>
              <Plus className="w-4 h-4 mr-2" />
              สร้างใบส่งสินค้า/ใบกำกับภาษีใหม่
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {taxInvoices.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">รอเก็บเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {taxInvoices.filter(inv => inv.status === 'รอเก็บเงิน').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">สร้างใบเสร็จรับเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {taxInvoices.filter(inv => inv.status === 'สร้างใบเสร็จรับเงิน').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{taxInvoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="ค้นหาเลขที่ใบส่งสินค้า/ใบกำกับภาษีหรือชื่อลูกค้า..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="รอเก็บเงิน">รอเก็บเงิน</SelectItem>
                      <SelectItem value="สร้างใบเสร็จรับเงิน">สร้างใบเสร็จรับเงิน</SelectItem>
                      <SelectItem value="สร้างใบวางบิลรวม">สร้างใบวางบิลรวม</SelectItem>
                      <SelectItem value="สร้างใบเสร็จรวม">สร้างใบเสร็จรวม</SelectItem>
                      <SelectItem value="แบ่งรับชำระเงิน">แบ่งรับชำระเงิน</SelectItem>
                      <SelectItem value="ดำเนินการแล้ว">ดำเนินการแล้ว</SelectItem>
                      <SelectItem value="ยกเลิก">ยกเลิก</SelectItem>
                      <SelectItem value="รีเซ็ต">รีเซ็ต</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  {selectedItems.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          การดำเนินการ ({selectedItems.length})
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent>
                         <DropdownMenuItem onClick={() => handleBulkAction('print')}>
                           <Printer className="w-4 h-4 mr-2" />
                           พิมพ์
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                           <Download className="w-4 h-4 mr-2" />
                           ส่งออก
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem 
                           onClick={() => handleBulkAction('delete')}
                           className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                         >
                           <Trash2 className="w-4 h-4 mr-2" />
                           ลบที่เลือก
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Invoices Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>วันที่</TableHead>
                    <TableHead>เลขที่เอกสาร</TableHead>
                    <TableHead>ชื่อลูกค้า/ชื่อโปรเจ็ค</TableHead>
                    <TableHead>วันครบกำหนด</TableHead>
                    <TableHead className="text-right">ยอดรวมสุทธิ</TableHead>
                    <TableHead className="text-center">สถานะ</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((taxInvoice) => (
                    <TableRow key={taxInvoice.id} className="hover:bg-muted/50">
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems.includes(taxInvoice.id)}
                          onCheckedChange={(checked) => handleSelectItem(taxInvoice.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(taxInvoice.tax_invoice_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        <button 
                          onClick={() => navigate(`/tax-invoices/${taxInvoice.id}`)}
                          className="text-primary hover:underline"
                        >
                          {taxInvoice.tax_invoice_number}
                        </button>
                      </TableCell>
                      <TableCell>{taxInvoice.customer_name}</TableCell>
                      <TableCell>
                        {taxInvoice.due_date ? format(new Date(taxInvoice.due_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ฿{taxInvoice.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </TableCell>
                       <TableCell className="text-center">
                         {getPaymentStatusBadge(taxInvoice)}
                        </TableCell>
                       <TableCell>
                         <DropdownMenu 
                           open={dropdownOpen === taxInvoice.id} 
                           onOpenChange={(isOpen) => {
                             setDropdownOpen(isOpen ? taxInvoice.id : null);
                           }}
                         >
                           <DropdownMenuTrigger asChild>
                             <Button 
                               variant="outline" 
                               size="sm" 
                               className="h-8 w-8 p-0 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground"
                               onClick={(e) => e.stopPropagation()}
                             >
                               <MoreHorizontal className="w-4 h-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent 
                             align="end" 
                             className="bg-background border shadow-lg z-[100]"
                             onCloseAutoFocus={(e) => e.preventDefault()}
                           >
                             <DropdownMenuItem onClick={() => {
                               setDropdownOpen(null);
                               navigate(`/tax-invoices/${taxInvoice.id}`);
                             }}>
                               <FileText className="w-4 h-4 mr-2" />
                               ดูรายละเอียด
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => {
                               setDropdownOpen(null);
                               navigate(`/tax-invoices/${taxInvoice.id}/edit`);
                             }}>
                               <Edit className="w-4 h-4 mr-2" />
                               แก้ไข
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => {
                               setDropdownOpen(null);
                               console.log('Share', taxInvoice.id);
                             }}>
                               <Share2 className="w-4 h-4 mr-2" />
                               แชร์
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => {
                               setDropdownOpen(null);
                               window.print();
                             }}>
                               <Printer className="w-4 h-4 mr-2" />
                               พิมพ์
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => {
                               setDropdownOpen(null);
                               console.log('Download', taxInvoice.id);
                             }}>
                               <Download className="w-4 h-4 mr-2" />
                               ดาวน์โหลด PDF
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem 
                               onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 openDeleteDialog(taxInvoice.id, taxInvoice.tax_invoice_number);
                               }}
                               className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                             >
                               <Trash2 className="w-4 h-4 mr-2" />
                               ลบข้อมูล
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </TableCell>
                     </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredTaxInvoices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  ไม่พบข้อมูลใบส่งสินค้า/ใบกำกับภาษี
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                แสดง {startIndex + 1}-{Math.min(endIndex, filteredTaxInvoices.length)} จาก {filteredTaxInvoices.length} รายการ
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                ยืนยันการลบใบส่งสินค้า/ใบกำกับภาษี
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                คุณต้องการลบใบส่งสินค้า/ใบกำกับภาษี{' '}
                <span className="font-medium text-foreground">
                  {selectedTaxInvoiceToDelete?.number}
                </span>{' '}
                ใช่หรือไม่?
                <br />
                <span className="text-sm text-destructive mt-2 block">
                  ⚠️ การกระทำนี้ไม่สามารถยกเลิกได้ และข้อมูลจะถูกลบถาวร
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบข้อมูล
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                ยืนยันการลบใบส่งสินค้า/ใบกำกับภาษีหลายรายการ
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                คุณต้องการลบใบส่งสินค้า/ใบกำกับภาษี {selectedItems.length} รายการต่อไปนี้ใช่หรือไม่?
                <div className="mt-4 max-h-60 overflow-y-auto border rounded-md bg-muted/30 p-3">
                  <div className="space-y-2">
                    {selectedItems.map((itemId) => {
                      const taxInvoice = taxInvoices.find(inv => inv.id === itemId);
                      return taxInvoice ? (
                        <div key={itemId} className="flex items-center justify-between p-2 bg-background rounded border">
                          <div>
                            <span className="font-medium">{taxInvoice.tax_invoice_number}</span>
                            <span className="text-sm text-muted-foreground ml-2">- {taxInvoice.customer_name}</span>
                          </div>
                          <span className="text-sm font-medium">
                            ฿{taxInvoice.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                <span className="text-sm text-destructive mt-3 block">
                  ⚠️ การกระทำนี้ไม่สามารถยกเลิกได้ และข้อมูลจะถูกลบถาวร
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel 
                onClick={() => setBulkDeleteDialogOpen(false)}
                className="bg-secondary hover:bg-secondary/80"
              >
                ยกเลิก
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบ {selectedItems.length} รายการ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payment Evidence Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>ยืนยันรับเงิน</DialogTitle>
              <DialogDescription>
                กรุณาแนบหลักฐานการชำระเงิน
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* แสดงข้อมูลใบกำกับภาษีที่เลือก */}
              {selectedTaxInvoiceForPayment && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">ข้อมูลใบกำกับภาษี</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>เลขที่: <span className="font-medium">{selectedTaxInvoiceForPayment.tax_invoice_number}</span></div>
                    <div>ลูกค้า: <span className="font-medium">{selectedTaxInvoiceForPayment.customer_name}</span></div>
                    <div>จำนวนเงิน: <span className="font-medium">฿{selectedTaxInvoiceForPayment.total_amount?.toLocaleString()}</span></div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="payment_method">วิธีการชำระเงิน</Label>
                <Select
                  value={paymentForm.payment_method}
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, payment_method: value }))}
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
                  value={paymentForm.amount_received}
                  onChange={(e) => setPaymentForm(prev => ({ 
                    ...prev, 
                    amount_received: parseFloat(e.target.value) || 0 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="payment_reference">เลขที่อ้างอิง/Ref</Label>
                <Input
                  id="payment_reference"
                  value={paymentForm.payment_reference}
                  onChange={(e) => setPaymentForm(prev => ({ 
                    ...prev, 
                    payment_reference: e.target.value 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="bank_name">ธนาคาร</Label>
                <Input
                  id="bank_name"
                  value={paymentForm.bank_name}
                  onChange={(e) => setPaymentForm(prev => ({ 
                    ...prev, 
                    bank_name: e.target.value 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="depositor_name">ชื่อผู้โอน</Label>
                <Input
                  id="depositor_name"
                  value={paymentForm.depositor_name}
                  onChange={(e) => setPaymentForm(prev => ({ 
                    ...prev, 
                    depositor_name: e.target.value 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="payment_evidence">หลักฐานการชำระเงิน (สลิป/ใบเสร็จ) *</Label>
                <Input
                  id="payment_evidence"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPaymentForm(prev => ({ ...prev, payment_evidence_file: file }));
                  }}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  รองรับไฟล์: JPG, PNG, PDF (ขนาดไม่เกิน 10MB)
                </p>
              </div>

              <div>
                <Label htmlFor="payment_notes">หมายเหตุ</Label>
                <Textarea
                  id="payment_notes"
                  value={paymentForm.payment_notes}
                  onChange={(e) => setPaymentForm(prev => ({ 
                    ...prev, 
                    payment_notes: e.target.value 
                  }))}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={!paymentForm.payment_evidence_file}
              >
                <Upload className="w-4 h-4 mr-2" />
                บันทึกหลักฐาน
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }