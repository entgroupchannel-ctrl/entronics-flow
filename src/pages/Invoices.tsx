import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, FileText, Edit, Share2, Printer, Download, MoreHorizontal, History, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { Sidebar } from "@/components/layout/Sidebar";
import InvoiceStatusDropdown from "@/components/invoices/InvoiceStatusDropdown";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  total_amount: number;
  status: string;
  due_date?: string;
  paid_amount?: number;
  invoice_items?: any[];
  quotations?: { quotation_number: string } | null;
  tax_invoices?: { tax_invoice_number: string }[] | null;
}

export default function Invoices() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoiceToDelete, setSelectedInvoiceToDelete] = useState<{id: string, number: string} | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInvoices((data as any) || []);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายการใบแจ้งหนี้ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'รอวางบิล':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">รอวางบิล</Badge>;
      case 'วางบิลแล้ว':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">วางบิลแล้ว</Badge>;
      case 'เปิดบิลแล้ว':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">เปิดบิลแล้ว</Badge>;
      case 'สร้างใบส่งสินค้า/ใบกำกับภาษี':
        return <Badge variant="default" className="bg-green-100 text-green-800">สร้างใบส่งสินค้า/ใบกำกับภาษี</Badge>;
      case 'ยกเลิก':
        return <Badge variant="destructive">ยกเลิก</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredInvoices.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(currentItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, invoiceId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== invoiceId));
    }
  };

  const openDeleteDialog = (invoiceId: string, invoiceNumber: string) => {
    console.log('Opening delete dialog for:', invoiceNumber);
    // ปิด dropdown ทันที
    setDropdownOpen(null);
    // เปิด dialog หลังจาก dropdown ปิดแล้ว
    setTimeout(() => {
      setSelectedInvoiceToDelete({ id: invoiceId, number: invoiceNumber });
      setDeleteDialogOpen(true);
    }, 100);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvoiceToDelete) return;

    try {
      // ลบ invoice items ก่อน
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', selectedInvoiceToDelete.id);

      if (itemsError) throw itemsError;

      // ลบ invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', selectedInvoiceToDelete.id);

      if (invoiceError) throw invoiceError;

      toast({
        title: "ลบสำเร็จ",
        description: `ลบใบแจ้งหนี้ ${selectedInvoiceToDelete.number} เรียบร้อยแล้ว`,
      });

      // รีโหลดข้อมูล
      loadInvoices();

    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบใบแจ้งหนี้ได้",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedInvoiceToDelete(null);
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
                <FileText className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">ใบแจ้งหนี้ / ใบวางบิล</h1>
              </div>
              
              <Button onClick={() => navigate('/invoices/new')} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                สร้างใบแจ้งหนี้
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">ใบแจ้งหนี้ทั้งหมด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{invoices.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">รอวางบิล</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {invoices.filter(inv => inv.status === 'รอวางบิล').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">เปิดบิลแล้ว</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {invoices.filter(inv => inv.status === 'เปิดบิลแล้ว').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ฿{invoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}
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
                        placeholder="ค้นหาเลขที่ใบแจ้งหนี้หรือชื่อลูกค้า..."
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
                        <SelectItem value="รอวางบิล">รอวางบิล</SelectItem>
                        <SelectItem value="วางบิลแล้ว">วางบิลแล้ว</SelectItem>
                        <SelectItem value="เปิดบิลแล้ว">เปิดบิลแล้ว</SelectItem>
                        <SelectItem value="สร้างใบส่งสินค้า/ใบกำกับภาษี">สร้างใบส่งสินค้า/ใบกำกับภาษี</SelectItem>
                        <SelectItem value="ยกเลิก">ยกเลิก</SelectItem>
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
                      <TableHead>เลขที่ใบแจ้งหนี้</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>ยอดรวม</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>วันครบกำหนด</TableHead>
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
                          ไม่มีข้อมูลใบแจ้งหนี้
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((invoice) => (
                        <TableRow 
                          key={invoice.id} 
                          className="hover:bg-muted/50 cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            console.log('Row clicked for invoice:', invoice.invoice_number);
                            navigate(`/invoices/${invoice.id}`);
                          }}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedItems.includes(invoice.id)}
                              onCheckedChange={(checked) => handleSelectItem(invoice.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell>
                            {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>{invoice.customer_name}</TableCell>
                          <TableCell className="font-medium">
                            ฿{invoice.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <InvoiceStatusDropdown 
                              invoice={invoice} 
                              onStatusUpdate={loadInvoices}
                            />
                          </TableCell>
                          <TableCell>
                            {invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : '-'}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu 
                              open={dropdownOpen === invoice.id} 
                              onOpenChange={(isOpen) => {
                                console.log('Dropdown state change:', invoice.id, isOpen);
                                setDropdownOpen(isOpen ? invoice.id : null);
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-8 h-8 p-0 border border-border rounded-md hover:bg-accent"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Dropdown trigger clicked:', invoice.id);
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
                                  navigate(`/invoices/${invoice.id}`);
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
                                  console.log('Download', invoice.id);
                                }}>
                                  <Download className="w-4 h-4 mr-2" />
                                  ดาวน์โหลด
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setDropdownOpen(null);
                                  console.log('Share', invoice.id);
                                }}>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  แชร์
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Delete clicked for:', invoice.invoice_number);
                                    openDeleteDialog(invoice.id, invoice.invoice_number);
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
                  แสดง {startIndex + 1}-{Math.min(endIndex, filteredInvoices.length)} จาก {filteredInvoices.length} รายการ
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ก่อนหน้า
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                ยืนยันการลบใบแจ้งหนี้
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                คุณต้องการลบใบแจ้งหนี้{' '}
                <span className="font-medium text-foreground">
                  {selectedInvoiceToDelete?.number}
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
                  setSelectedInvoiceToDelete(null);
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
                ลบใบแจ้งหนี้
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}