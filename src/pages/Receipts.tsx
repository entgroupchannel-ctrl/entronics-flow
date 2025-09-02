import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Receipt, Edit, Share2, Printer, Download, MoreHorizontal, History, Trash2, FileText, ExternalLink, Clock, CheckCircle, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { Sidebar } from "@/components/layout/Sidebar";

interface ReceiptInterface {
  id: string;
  receipt_number: string;
  receipt_date: string;
  customer_name: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  project_name?: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  bank_name?: string;
  bank_account?: string;
  invoice_id?: string;
  tax_invoice_id?: string;
  subtotal?: number;
  discount_amount?: number;
  discount_percentage?: number;
  vat_amount?: number;
  withholding_tax_amount?: number;
  amount_paid?: number;
  amount_change?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export default function Receipts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<ReceiptInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReceiptToDelete, setSelectedReceiptToDelete] = useState<{id: string, number: string} | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReceiptToEdit, setSelectedReceiptToEdit] = useState<ReceiptInterface | null>(null);
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    customer_address: '',
    customer_phone: '',
    customer_email: '',
    payment_method: 'โอนเงิน',
    payment_reference: '',
    bank_name: '',
    bank_account: '',
    subtotal: 0,
    discount_amount: 0,
    discount_percentage: 0,
    vat_amount: 0,
    withholding_tax_amount: 0,
    amount_paid: 0,
    amount_change: 0,
    notes: ''
  });

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      
      // ลองเชื่อมต่อกับฐานข้อมูลก่อน หากไม่สำเร็จจะใช้ข้อมูล mock
      try {
        const { data: receiptsData, error } = await supabase
          .from('receipts')
          .select(`
            *,
            payment_records (
              id,
              payment_number,
              verification_status
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.log('ตาราง receipts ยังไม่มี หรือมีปัญหากับการเชื่อมต่อ:', error.message);
          throw error;
        }

        // หากมีข้อมูลจากฐานข้อมูล ให้แปลงเป็นรูปแบบที่ interface ต้องการ
        if (receiptsData && receiptsData.length > 0) {
          const formattedReceipts = receiptsData.map((receipt: any) => ({
            id: receipt.id,
            receipt_number: receipt.receipt_number,
            receipt_date: receipt.receipt_date,
            customer_name: receipt.customer_name,
            project_name: receipt.project_name || undefined,
            total_amount: receipt.total_amount,
            status: receipt.payment_status || 'pending', // ใช้ payment_status หรือ default เป็น pending
            payment_method: receipt.payment_method || undefined,
            invoice_id: receipt.invoice_id || undefined,
            tax_invoice_id: receipt.tax_invoice_id || undefined,
            created_by: receipt.created_by || undefined,
            created_at: receipt.created_at,
            updated_at: receipt.updated_at
          }));
          setReceipts(formattedReceipts);
          return;
        }
      } catch (dbError) {
        console.log('ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', dbError);
      }
      
      // แสดงข้อมูล mock
      const mockReceipts = [
        {
          id: '1',
          receipt_number: 'RC202509001',
          receipt_date: '2025-09-01',
          customer_name: 'บริษัท ABC จำกัด',
          project_name: 'โครงการ XYZ',
          total_amount: 100000,
          status: 'paid',
          payment_method: 'เงินสด',
          invoice_id: 'inv-1',
          created_at: '2025-09-01T10:00:00Z',
          updated_at: '2025-09-01T10:00:00Z'
        },
        {
          id: '2',
          receipt_number: 'RC202509002',
          receipt_date: '2025-09-01',
          customer_name: 'บริษัท DEF จำกัด',
          total_amount: 75000,
          status: 'pending',
          payment_method: 'โอนเงิน',
          tax_invoice_id: 'inv-2',
          created_at: '2025-09-01T11:00:00Z',
          updated_at: '2025-09-01T11:00:00Z'
        },
        {
          id: '3',
          receipt_number: 'RC202509003',
          receipt_date: '2025-09-02',
          customer_name: '101TRAINING COMPANY LIMITED',
          project_name: 'ซื้อคอมพิวเตอร์',
          total_amount: 21817.3,
          status: 'paid',
          payment_method: 'โอนเงิน',
          tax_invoice_id: 'inv-3',
          created_at: '2025-09-02T08:00:00Z',
          updated_at: '2025-09-02T08:00:00Z'
        }
      ];
      setReceipts(mockReceipts);
      
    } catch (error: any) {
      console.error('Error loading receipts:', error);
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายการใบเสร็จรับเงินได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">ชำระแล้ว</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">รอชำระ</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">❌ ยกเลิก</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredReceipts.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(currentItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (receiptId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, receiptId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== receiptId));
    }
  };

  const openDeleteDialog = (receiptId: string, receiptNumber: string) => {
    setDropdownOpen(null);
    setTimeout(() => {
      setSelectedReceiptToDelete({ id: receiptId, number: receiptNumber });
      setDeleteDialogOpen(true);
    }, 100);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReceiptToDelete) return;

    // Check if this is mock data first
    const isMockData = selectedReceiptToDelete.id === '1' || selectedReceiptToDelete.id === '2' || selectedReceiptToDelete.id === '3';
    
    try {
      if (isMockData) {
        // Handle mock data deletion
        setReceipts(prev => prev.filter(receipt => receipt.id !== selectedReceiptToDelete.id));
        setSelectedItems(prev => prev.filter(id => id !== selectedReceiptToDelete.id));
        
        toast({
          title: "ลบสำเร็จ",
          description: `ลบใบเสร็จรับเงิน ${selectedReceiptToDelete.number} เรียบร้อยแล้ว (ข้อมูลตัวอย่าง)`,
        });
      } else {
        // Handle real database deletion
        const { error } = await supabase
          .from('receipts')
          .delete()
          .eq('id', selectedReceiptToDelete.id);

        if (error) {
          console.error('Supabase delete error:', error);
          throw error;
        }

        // ลบออกจาก state ท้องถิ่นแทนการโหลดใหม่
        setReceipts(prev => prev.filter(receipt => receipt.id !== selectedReceiptToDelete.id));
        setSelectedItems(prev => prev.filter(id => id !== selectedReceiptToDelete.id));

        toast({
          title: "ลบสำเร็จ",
          description: `ลบใบเสร็จรับเงิน ${selectedReceiptToDelete.number} เรียบร้อยแล้ว`,
        });
      }
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบใบเสร็จรับเงินได้",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReceiptToDelete(null);
    }
  };

  const openEditDialog = async (receipt: ReceiptInterface) => {
    setDropdownOpen(null);
    try {
      // ดึงข้อมูลใบเสร็จแบบเต็ม
      const { data: fullReceipt, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('id', receipt.id)
        .single();

      if (error) {
        console.error('Error fetching receipt:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลใบเสร็จได้",
          variant: "destructive",
        });
        return;
      }

      if (fullReceipt) {
        setSelectedReceiptToEdit({
          ...fullReceipt,
          status: fullReceipt.payment_status || 'pending'
        });
        setEditFormData({
          customer_name: fullReceipt.customer_name || '',
          customer_address: fullReceipt.customer_address || '',
          customer_phone: fullReceipt.customer_phone || '',
          customer_email: fullReceipt.customer_email || '',
          payment_method: fullReceipt.payment_method || 'โอนเงิน',
          payment_reference: fullReceipt.payment_reference || '',
          bank_name: fullReceipt.bank_name || '',
          bank_account: fullReceipt.bank_account || '',
          subtotal: fullReceipt.subtotal || 0,
          discount_amount: fullReceipt.discount_amount || 0,
          discount_percentage: fullReceipt.discount_percentage || 0,
          vat_amount: fullReceipt.vat_amount || 0,
          withholding_tax_amount: fullReceipt.withholding_tax_amount || 0,
          amount_paid: fullReceipt.amount_paid || 0,
          amount_change: fullReceipt.amount_change || 0,
          notes: fullReceipt.notes || ''
        });
        setEditDialogOpen(true);
      }
    } catch (error) {
      console.error('Error in openEditDialog:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปิดหน้าแก้ไขได้",
        variant: "destructive",
      });
    }
  };

  const handleEditConfirm = async () => {
    if (!selectedReceiptToEdit) return;

    try {
      // คำนวณยอดรวมใหม่
      const calculatedTotal = editFormData.subtotal + editFormData.vat_amount - editFormData.discount_amount - editFormData.withholding_tax_amount;
      const calculatedChange = editFormData.amount_paid - calculatedTotal;

      const { error } = await supabase
        .from('receipts')
        .update({
          customer_name: editFormData.customer_name,
          customer_address: editFormData.customer_address,
          customer_phone: editFormData.customer_phone,
          customer_email: editFormData.customer_email,
          payment_method: editFormData.payment_method,
          payment_reference: editFormData.payment_reference,
          bank_name: editFormData.bank_name,
          bank_account: editFormData.bank_account,
          subtotal: editFormData.subtotal,
          discount_amount: editFormData.discount_amount,
          discount_percentage: editFormData.discount_percentage,
          vat_amount: editFormData.vat_amount,
          withholding_tax_amount: editFormData.withholding_tax_amount,
          total_amount: calculatedTotal,
          amount_paid: editFormData.amount_paid,
          amount_change: calculatedChange,
          notes: editFormData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReceiptToEdit.id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // อัพเดต state ท้องถิ่น
      setReceipts(prev => prev.map(receipt => 
        receipt.id === selectedReceiptToEdit.id 
          ? { 
              ...receipt, 
              customer_name: editFormData.customer_name,
              payment_method: editFormData.payment_method,
              total_amount: calculatedTotal,
              updated_at: new Date().toISOString()
            }
          : receipt
      ));

      toast({
        title: "แก้ไขสำเร็จ",
        description: `แก้ไขใบเสร็จรับเงิน ${selectedReceiptToEdit.receipt_number} เรียบร้อยแล้ว`,
      });

      setEditDialogOpen(false);
      setSelectedReceiptToEdit(null);
      // รีเซ็ตฟอร์ม
      setEditFormData({
        customer_name: '',
        customer_address: '',
        customer_phone: '',
        customer_email: '',
        payment_method: 'โอนเงิน',
        payment_reference: '',
        bank_name: '',
        bank_account: '',
        subtotal: 0,
        discount_amount: 0,
        discount_percentage: 0,
        vat_amount: 0,
        withholding_tax_amount: 0,
        amount_paid: 0,
        amount_change: 0,
        notes: ''
      });

    } catch (error: any) {
      console.error('Error updating receipt:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขใบเสร็จรับเงินได้",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Receipt className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">ใบเสร็จรับเงิน</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate('/payment-records')} 
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  การชำระเงิน
                </Button>
                
                <Button onClick={() => navigate('/receipts/new')} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างใบเสร็จรับเงิน
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">ใบเสร็จทั้งหมด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{receipts.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">ชำระแล้ว</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {receipts.filter(receipt => receipt.status === 'paid').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">รอชำระ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {receipts.filter(receipt => receipt.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ฿{receipts.reduce((sum, receipt) => sum + receipt.total_amount, 0).toLocaleString()}
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
                        placeholder="ค้นหาเลขที่ใบเสร็จหรือชื่อลูกค้า..."
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
                        <SelectItem value="paid">ชำระแล้ว</SelectItem>
                        <SelectItem value="pending">รอชำระ</SelectItem>
                        <SelectItem value="cancelled">ยกเลิก</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">แสดง:</span>
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
                    <span className="text-sm text-muted-foreground">รายการ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
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
                      <TableHead>วิธีชำระ</TableHead>
                      <TableHead>ยอดรวมสุทธิ</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          กำลังโหลดข้อมูล...
                        </TableCell>
                      </TableRow>
                    ) : currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          ไม่มีข้อมูลใบเสร็จรับเงิน
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((receipt) => (
                        <TableRow 
                          key={receipt.id} 
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => navigate(`/receipts/${receipt.id}`)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedItems.includes(receipt.id)}
                              onCheckedChange={(checked) => handleSelectItem(receipt.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(receipt.receipt_date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>{receipt.receipt_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{receipt.customer_name}</div>
                              {receipt.project_name && (
                                <div className="text-sm text-muted-foreground">{receipt.project_name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {receipt.payment_method || '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            ฿{receipt.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </TableCell>
                           <TableCell>
                             {getStatusBadge(receipt.status)}
                           </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu 
                              open={dropdownOpen === receipt.id} 
                              onOpenChange={(isOpen) => {
                                setDropdownOpen(isOpen ? receipt.id : null);
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-8 h-8 p-0 border border-border rounded-md hover:bg-accent"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
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
                                  openEditDialog(receipt);
                                }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  แก้ไข
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
                                }}>
                                  <Download className="w-4 h-4 mr-2" />
                                  ดาวน์โหลด PDF
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(receipt.id, receipt.receipt_number)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  ลบ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  แสดง {startIndex + 1} ถึง {Math.min(endIndex, filteredReceipts.length)} จาก {filteredReceipts.length} รายการ
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ก่อนหน้า
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบใบเสร็จรับเงิน {selectedReceiptToDelete?.number}? 
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Receipt Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              แก้ไขใบเสร็จรับเงิน {selectedReceiptToEdit?.receipt_number}
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* ข้อมูลลูกค้า */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">ข้อมูลลูกค้า</h3>
              
              <div>
                <label className="text-sm font-medium">ชื่อลูกค้า *</label>
                <Input
                  value={editFormData.customer_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">ที่อยู่</label>
                <textarea
                  value={editFormData.customer_address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">เบอร์โทร</label>
                  <Input
                    value={editFormData.customer_phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">อีเมล</label>
                  <Input
                    type="email"
                    value={editFormData.customer_email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลการชำระเงิน */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">ข้อมูลการชำระเงิน</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">วิธีการชำระ</label>
                  <Select 
                    value={editFormData.payment_method}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="เงินสด">เงินสด</SelectItem>
                      <SelectItem value="โอนเงิน">โอนเงิน</SelectItem>
                      <SelectItem value="เช็ค">เช็ค</SelectItem>
                      <SelectItem value="บัตรเครดิต">บัตรเครดิต</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">หมายเลขอ้างอิง</label>
                  <Input
                    value={editFormData.payment_reference}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, payment_reference: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">ธนาคาร</label>
                  <Input
                    value={editFormData.bank_name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">เลขที่บัญชี</label>
                  <Input
                    value={editFormData.bank_account}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, bank_account: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลการเงิน */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-primary">ข้อมูลการเงิน</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium">ยอดรวมย่อย</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.subtotal}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, subtotal: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ส่วนลด</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.discount_amount}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">VAT 7%</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.vat_amount}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, vat_amount: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">หัก ณ ที่จ่าย</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.withholding_tax_amount}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, withholding_tax_amount: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">ยอดรวมสุทธิ</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.subtotal + editFormData.vat_amount - editFormData.discount_amount - editFormData.withholding_tax_amount}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">จำนวนเงินที่รับ</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.amount_paid}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, amount_paid: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">เงินทอน</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.amount_paid - (editFormData.subtotal + editFormData.vat_amount - editFormData.discount_amount - editFormData.withholding_tax_amount)}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">หมายเหตุ</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md min-h-[80px]"
                  placeholder="หมายเหตุเพิ่มเติม..."
                />
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEditConfirm}
              className="bg-primary hover:bg-primary/90"
            >
              บันทึกการแก้ไข
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}