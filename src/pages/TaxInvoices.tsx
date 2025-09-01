import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Edit, Share2, Printer, Download, MoreHorizontal, History } from 'lucide-react';
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
  invoice?: {
    id: string;
    invoice_number: string;
  };
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
          invoices(id, invoice_number)
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
      case 'ดำเนินการแล้ว':
        return <Badge variant="default" className="bg-green-100 text-green-800">ดำเนินการแล้ว</Badge>;
      case 'ยกเลิก':
        return <Badge variant="destructive">ยกเลิก</Badge>;
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
    console.log(`Bulk action: ${action} for items:`, selectedItems);
    // Implement bulk actions here
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
                <CardTitle className="text-sm font-medium text-muted-foreground">ดำเนินการแล้ว</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {taxInvoices.filter(inv => inv.status === 'ดำเนินการแล้ว').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ยกเลิก</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {taxInvoices.filter(inv => inv.status === 'ยกเลิก').length}
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
                      <SelectItem value="ดำเนินการแล้ว">ดำเนินการแล้ว</SelectItem>
                      <SelectItem value="ยกเลิก">ยกเลิก</SelectItem>
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
                    <TableHead>เลขที่ใบส่งสินค้า/ใบกำกับภาษี</TableHead>
                    <TableHead>ใบวางบิลอ้างอิง</TableHead>
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
                      <TableCell>
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
                      <TableCell>
                        {taxInvoice.invoice ? (
                          <button 
                            onClick={() => navigate(`/invoices/${taxInvoice.invoice.id}`)}
                            className="text-primary hover:underline font-medium"
                          >
                            {taxInvoice.invoice.invoice_number}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{taxInvoice.customer_name}</TableCell>
                      <TableCell>
                        {taxInvoice.due_date ? format(new Date(taxInvoice.due_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ฿{taxInvoice.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(taxInvoice.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 border border-gray-300 rounded-md">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/tax-invoices/${taxInvoice.id}`)}>
                              <FileText className="w-4 h-4 mr-2" />
                              ดูรายละเอียด
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/tax-invoices/${taxInvoice.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              แชร์
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="w-4 h-4 mr-2" />
                              พิมพ์
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              ดาวน์โหลด PDF
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
    </div>
  );
}