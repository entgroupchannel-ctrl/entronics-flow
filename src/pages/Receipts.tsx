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
  project_name?: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  invoice_id?: string;
  tax_invoice_id?: string;
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

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      // จำลองข้อมูลใบเสร็จรับเงิน เนื่องจากยังไม่มีตารางในฐานข้อมูล
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
        return <Badge variant="destructive">ยกเลิก</Badge>;
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

    try {
      // Logic for deleting receipt would go here
      toast({
        title: "ลบสำเร็จ",
        description: `ลบใบเสร็จรับเงิน ${selectedReceiptToDelete.number} เรียบร้อยแล้ว`,
      });

      loadReceipts();
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
              
              <Button onClick={() => navigate('/receipts/new')} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                สร้างใบเสร็จรับเงิน
              </Button>
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
                           <TableCell onClick={(e) => e.stopPropagation()}>
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   className="bg-background border hover:bg-accent"
                                 >
                                   สถานะ
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent 
                                 align="center" 
                                 className="bg-background border shadow-lg z-[100]"
                               >
                                 <DropdownMenuItem onClick={() => {
                                   console.log('Set pending status', receipt.id);
                                 }}>
                                   <Clock className="w-4 h-4 mr-2" />
                                   รอดำเนินการ
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => {
                                   console.log('Set collected status', receipt.id);
                                 }}>
                                   <CheckCircle className="w-4 h-4 mr-2" />
                                   เก็บเงินแล้ว
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => {
                                   console.log('Set cancelled status', receipt.id);
                                 }}>
                                   <X className="w-4 h-4 mr-2" />
                                   ยกเลิก
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
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
                                  setDropdownOpen(null);
                                  navigate(`/receipts/${receipt.id}/edit`);
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
    </div>
  );
}