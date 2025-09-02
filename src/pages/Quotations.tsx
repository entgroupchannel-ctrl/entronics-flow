import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, FileText, Edit, Share2, Printer, Download, MoreHorizontal, History, Trash2, Copy, Files, Receipt, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { Sidebar } from "@/components/layout/Sidebar";
import QuotationWorkflow from "@/components/quotations/QuotationWorkflow";

interface Quotation {
  id: string;
  quotation_number: string;
  quotation_date: string;
  customer_name: string;
  total_amount: number;
  status: string;
  workflow_status: string;
  process_type?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  quotation_items?: any[];
  related_invoices?: Array<{
    id: string;
    invoice_number: string;
    status: string;
    total_amount: number;
  }>;
}

export default function Quotations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState('quotations');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuotationToDelete, setSelectedQuotationToDelete] = useState<{id: string, number: string} | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('quotations');

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      
      // Load quotations first
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*)
        `)
        .order('created_at', { ascending: false });

      if (quotationsError) throw quotationsError;

      // Load related invoices separately
      const quotationIds = quotationsData?.map(q => q.id) || [];
      let invoicesData: any[] = [];
      
      if (quotationIds.length > 0) {
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('id, invoice_number, status, total_amount, quotation_id')
          .in('quotation_id', quotationIds);

        if (!invoicesError && invoices) {
          invoicesData = invoices;
        }
      }

      // Combine data
      const quotationsWithInvoices = quotationsData?.map(quotation => ({
        ...quotation,
        related_invoices: invoicesData.filter(invoice => invoice.quotation_id === quotation.id)
      })) || [];

      setQuotations(quotationsWithInvoices as Quotation[]);
    } catch (error: any) {
      console.error('Error loading quotations:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลใบเสนอราคาได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'ร่าง';
      case 'sent':
        return 'ส่งแล้ว';
      case 'approved':
        return 'อนุมัติ';
      case 'rejected':
        return 'ปฏิเสธ';
      default:
        return status;
    }
  };

  // Filter and pagination logic
  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotations = filteredQuotations.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedQuotations.map(q => q.id));
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

  const createNewQuotation = () => {
    navigate('/quotations/new');
  };

  const createInvoiceFromQuotation = async (quotation: Quotation) => {
    try {
      // Load full quotation data with items
      const { data: quotationData, error } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*)
        `)
        .eq('id', quotation.id)
        .single();

      if (error) throw error;

      if (!quotationData) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่พบข้อมูลใบเสนอราคา",
          variant: "destructive",
        });
        return;
      }

      // Store quotation data in session storage for invoice form
      const invoiceData = {
        quotation_id: quotationData.id,
        quotation_number: quotationData.quotation_number,
        customer_id: quotationData.customer_id,
        customer_name: quotationData.customer_name,
        customer_address: quotationData.customer_address,
        customer_phone: quotationData.customer_phone,
        customer_email: quotationData.customer_email,
        subtotal: quotationData.subtotal,
        discount_amount: quotationData.discount_amount,
        discount_percentage: quotationData.discount_percentage,
        vat_amount: quotationData.vat_amount,
        withholding_tax_amount: quotationData.withholding_tax_amount,
        total_amount: quotationData.total_amount,
        notes: quotationData.notes,
        terms_conditions: quotationData.terms_conditions,
        items: quotationData.quotation_items || []
      };

      sessionStorage.setItem('invoice_from_quotation', JSON.stringify(invoiceData));
      
      // Navigate to invoice creation page
      navigate('/invoices/new');

    } catch (error: any) {
      console.error('Error creating invoice from quotation:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างใบแจ้งหนี้จากใบเสนอราคาได้",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (quotationId: string, quotationNumber: string) => {
    console.log('Opening delete dialog for:', quotationNumber);
    // ปิด dropdown ทันที
    setDropdownOpen(null);
    // เปิด dialog หลังจาก dropdown ปิดแล้ว
    setTimeout(() => {
      setSelectedQuotationToDelete({ id: quotationId, number: quotationNumber });
      setDeleteDialogOpen(true);
    }, 100);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuotationToDelete) return;

    try {
      // ลบ quotation items ก่อน
      const { error: itemsError } = await supabase
        .from('quotation_items')
        .delete()
        .eq('quotation_id', selectedQuotationToDelete.id);

      if (itemsError) throw itemsError;

      // ลบ quotation workflow history
      const { error: historyError } = await supabase
        .from('quotation_workflow_history')
        .delete()
        .eq('quotation_id', selectedQuotationToDelete.id);

      if (historyError) throw historyError;

      // ลบ quotation
      const { error: quotationError } = await supabase
        .from('quotations')
        .delete()
        .eq('id', selectedQuotationToDelete.id);

      if (quotationError) throw quotationError;

      toast({
        title: "ลบสำเร็จ",
        description: `ลบใบเสนอราคา ${selectedQuotationToDelete.number} เรียบร้อยแล้ว`,
      });

      // รีโหลดข้อมูล
      loadQuotations();

    } catch (error: any) {
      console.error('Error deleting quotation:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบใบเสนอราคาได้",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedQuotationToDelete(null);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedItems.length === 0) return;

    try {
      for (const quotationId of selectedItems) {
        // ลบ quotation items ก่อน
        await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', quotationId);

        // ลบ quotation workflow history
        await supabase
          .from('quotation_workflow_history')
          .delete()
          .eq('quotation_id', quotationId);

        // ลบ quotation
        await supabase
          .from('quotations')
          .delete()
          .eq('id', quotationId);
      }

      toast({
        title: "ลบสำเร็จ",
        description: `ลบใบเสนอราคา ${selectedItems.length} รายการเรียบร้อยแล้ว`,
      });

      // Clear selections and reload data
      setSelectedItems([]);
      loadQuotations();

    } catch (error: any) {
      console.error('Error bulk deleting quotations:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบใบเสนอราคาได้",
        variant: "destructive",
      });
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  // This function is no longer needed as we're using tabs

  return (
    <div className="flex h-screen">
      {/* Remove fixed width to allow sidebar to resize itself */}
      <Sidebar onMenuClick={setCurrentView} currentView={currentView} />
      
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border bg-card" />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">ใบเสนอราคา / Quotation</h1>
                    <p className="text-sm text-muted-foreground">รายงานและจัดการใบเสนอราคา</p>
                  </div>
                </div>
                
                <Button onClick={createNewQuotation} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างใบเสนอราคา
                </Button>
              </div>


              <TabsContent value="quotations" className="space-y-6">
                {/* Search and Filter Section */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-2 flex-1">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="ค้นหาเลขที่เอกสาร หรือ ชื่อลูกค้า..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="max-w-md"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="สถานะ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            <SelectItem value="draft">ร่าง</SelectItem>
                            <SelectItem value="sent">ส่งแล้ว</SelectItem>
                            <SelectItem value="approved">อนุมัติ</SelectItem>
                            <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {selectedItems.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                การดำเนินการ ({selectedItems.length})
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => console.log('Bulk print')}>
                                <Printer className="w-4 h-4 mr-2" />
                                พิมพ์
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log('Bulk export')}>
                                <Download className="w-4 h-4 mr-2" />
                                ส่งออก
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setBulkDeleteDialogOpen(true)}
                                className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                ลบที่เลือก
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Table */}
                <Card>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-primary hover:bg-primary">
                            <TableHead className="text-primary-foreground w-12 text-center">
                              <Checkbox
                                checked={selectedItems.length === paginatedQuotations.length && paginatedQuotations.length > 0}
                                onCheckedChange={handleSelectAll}
                                className="mx-auto"
                              />
                            </TableHead>
                            <TableHead className="text-primary-foreground">วันที่</TableHead>
                            <TableHead className="text-primary-foreground">เลขที่เอกสาร</TableHead>
                            <TableHead className="text-primary-foreground">ชื่อลูกค้า/ชื่อโปรเจ็ค</TableHead>
                            <TableHead className="text-primary-foreground text-right">ยอดรวมสุทธิ</TableHead>
                            <TableHead className="text-primary-foreground text-center">สถานะ</TableHead>
                            <TableHead className="text-primary-foreground text-center w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedQuotations.map((quotation) => (
                            <TableRow 
                              key={quotation.id} 
                              className="hover:bg-muted/50"
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedItems.includes(quotation.id)}
                                  onCheckedChange={(checked) => handleSelectItem(quotation.id, checked as boolean)}
                                />
                              </TableCell>
                              <TableCell onClick={() => navigate(`/quotations/${quotation.id}/edit`)}>
                                {format(new Date(quotation.quotation_date), 'dd-MM-yyyy')}
                              </TableCell>
                              <TableCell className="font-medium" onClick={() => navigate(`/quotations/${quotation.id}/edit`)}>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span>{quotation.quotation_number}</span>
                                  {quotation.related_invoices && quotation.related_invoices.length > 0 && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                          }}
                                        >
                                          <FileText className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="start"
                                        className="bg-background border shadow-lg z-[100] min-w-[200px]"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                                          เอกสารที่เกี่ยวข้อง
                                        </div>
                                        <div className="px-3 py-1 text-xs text-muted-foreground">
                                          เอกสารอ้างอิง
                                        </div>
                                        {quotation.related_invoices.map((invoice) => (
                                          <DropdownMenuItem
                                            key={invoice.id}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              navigate(`/invoices/${invoice.id}`);
                                            }}
                                            className="hover:bg-accent cursor-pointer"
                                          >
                                            <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                                            <span className="text-blue-600 hover:underline">
                                              {invoice.invoice_number}
                                            </span>
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell onClick={() => navigate(`/quotations/${quotation.id}/edit`)}>
                                <div>
                                  <div className="font-medium">{quotation.customer_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {quotation.quotation_items && quotation.quotation_items.length > 0 
                                      ? quotation.quotation_items[0].description || quotation.quotation_items[0].product_name
                                      : 'ไม่มีรายการสินค้า'
                                    }
                                  </div>
                                </div>
                              </TableCell>
                               <TableCell className="text-right font-medium" onClick={() => navigate(`/quotations/${quotation.id}/edit`)}>
                                 <span className="whitespace-nowrap">
                                   ฿{quotation.total_amount.toLocaleString('th-TH', { 
                                     minimumFractionDigits: 2,
                                     maximumFractionDigits: 2 
                                   })}
                                 </span>
                               </TableCell>
                              <TableCell className="text-center">
                                <QuotationWorkflow 
                                  quotation={quotation} 
                                  onStatusUpdate={loadQuotations}
                                />
                              </TableCell>
                               <TableCell>
                                 <DropdownMenu 
                                   open={dropdownOpen === quotation.id} 
                                   onOpenChange={(isOpen) => {
                                     console.log('Dropdown state change:', quotation.id, isOpen);
                                     setDropdownOpen(isOpen ? quotation.id : null);
                                   }}
                                 >
                                   <DropdownMenuTrigger asChild>
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="h-8 w-8 p-0 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         console.log('Dropdown trigger clicked:', quotation.id);
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
                                       setDropdownOpen(null);
                                       navigate(`/quotations/${quotation.id}/edit`);
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
                                        console.log('Share:', quotation.id);
                                      }}>
                                        <Share2 className="w-4 h-4 mr-2" />
                                        แชร์
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        setDropdownOpen(null);
                                        console.log('Download:', quotation.id);
                                      }}>
                                        <Download className="w-4 h-4 mr-2" />
                                        ดาวน์โหลด
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        setDropdownOpen(null);
                                        console.log('Print sales doc:', quotation.id);
                                      }}>
                                        <Files className="w-4 h-4 mr-2" />
                                        พิมพ์จำหน่ายทอง
                                      </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => {
                                         setDropdownOpen(null);
                                         createInvoiceFromQuotation(quotation);
                                       }}>
                                         <Receipt className="w-4 h-4 mr-2" />
                                         สร้างใบแจ้งหนี้
                                       </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => {
                                         setDropdownOpen(null);
                                         console.log('Duplicate:', quotation.id);
                                       }}>
                                         <Copy className="w-4 h-4 mr-2" />
                                         สร้างซ้ำ
                                      </DropdownMenuItem>
                                     <DropdownMenuSeparator />
                                     <DropdownMenuItem 
                                       onClick={(e) => {
                                         e.preventDefault();
                                         e.stopPropagation();
                                         console.log('Delete clicked for:', quotation.quotation_number);
                                         openDeleteDialog(quotation.id, quotation.quotation_number);
                                       }}
                                       className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                                     >
                                       <Trash2 className="w-4 h-4 mr-2" />
                                       ลบ
                                     </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">แสดง</span>
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
                    <span className="text-sm text-muted-foreground">
                      รายการ จากทั้งหมด {filteredQuotations.length} รายการ
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      ก่อนหน้า
                    </Button>
                    
                    <span className="text-sm">
                      หน้า {currentPage} จาก {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      ถัดไป
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                ยืนยันการลบใบเสนอราคา
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                คุณต้องการลบใบเสนอราคา{' '}
                <span className="font-medium text-foreground">
                  {selectedQuotationToDelete?.number}
                </span>{' '}
                ใช่หรือไม่?
                <br />
                <span className="text-sm text-destructive mt-2 block">
                  ⚠️ การกระทำนี้ไม่สามารถยกเลิกได้ และข้อมูลจะถูกลบถาวร
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedQuotationToDelete(null);
                }}
                className="bg-secondary hover:bg-secondary/80"
              >
                ยกเลิก
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบใบเสนอราคา
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
                ยืนยันการลบใบเสนอราคาหลายรายการ
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                คุณต้องการลบใบเสนอราคา {selectedItems.length} รายการต่อไปนี้ใช่หรือไม่?
                <div className="mt-4 max-h-60 overflow-y-auto border rounded-md bg-muted/30 p-3">
                  <div className="space-y-2">
                    {selectedItems.map((itemId) => {
                      const quotation = quotations.find(q => q.id === itemId);
                      return quotation ? (
                        <div key={itemId} className="flex items-center justify-between p-2 bg-background rounded border">
                          <div>
                            <span className="font-medium">{quotation.quotation_number}</span>
                            <span className="text-sm text-muted-foreground ml-2">- {quotation.customer_name}</span>
                          </div>
                          <span className="text-sm font-medium">
                            ฿{quotation.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
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
      </div>
    </div>
  );
}