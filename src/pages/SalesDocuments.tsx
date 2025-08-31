import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, MoreHorizontal, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface Quotation {
  id: string;
  quotation_number: string;
  quotation_date: string;
  customer_name: string;
  total_amount: number;
  status: string;
  items?: any[];
}

export default function SalesDocuments() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
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
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'bill_created': return 'bg-purple-100 text-purple-800';
      case 'delivery_created': return 'bg-indigo-100 text-indigo-800';
      case 'tax_invoice_created': return 'bg-cyan-100 text-cyan-800';
      case 'purchase_order_created': return 'bg-orange-100 text-orange-800';
      case 'split_bill': return 'bg-pink-100 text-pink-800';
      case 'split_delivery': return 'bg-violet-100 text-violet-800';
      case 'split_tax_invoice': return 'bg-emerald-100 text-emerald-800';
      case 'deposit_bill': return 'bg-yellow-100 text-yellow-800';
      case 'deposit_delivery': return 'bg-lime-100 text-lime-800';
      case 'deposit_tax_invoice': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'ไม่อนุมัติ';
      case 'sent': return 'รออนุมัติ';
      case 'approved': return 'อนุมัติ';
      case 'rejected': return 'ปฏิเสธ';
      case 'bill_created': return 'สร้างใบวางบิล/ใบแจ้งหนี้';
      case 'delivery_created': return 'สร้างใบส่งสินค้า/ใบกำกับภาษี';
      case 'tax_invoice_created': return 'สร้างใบกำกับภาษี/ใบเสร็จรับเงิน (เงินสด)';
      case 'purchase_order_created': return 'สร้างใบสั่งซื้อ';
      case 'split_bill': return 'แบ่งจ่ายใบวางบิล/ใบแจ้งหนี้';
      case 'split_delivery': return 'แบ่งจ่ายใบส่งสินค้า/ใบกำกับภาษี';
      case 'split_tax_invoice': return 'แบ่งจ่ายใบกำกับภาษี/ใบเสร็จรับเงิน (เงินสด)';
      case 'deposit_bill': return 'มัดจำใบวางบิล/ใบแจ้งหนี้';
      case 'deposit_delivery': return 'มัดจำใบส่งสินค้า/ใบกำกับภาษี';
      case 'deposit_tax_invoice': return 'มัดจำใบกำกับภาษี/ใบเสร็จรับเงิน (เงินสด)';
      default: return status;
    }
  };

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
    window.location.href = '/quotations';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ใบเสนอราคา</h1>
              <div className="flex items-center text-sm text-muted-foreground space-x-1">
                <span>ใบเสนอราคา</span>
                <span>&gt;</span>
                <span>แสดงทั้งหมด</span>
              </div>
            </div>
          </div>
          
          <Button onClick={createNewQuotation} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            สร้างใหม่
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="แสดงทั้งหมด"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                ค้นหา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="bg-blue-600 text-white p-4">
              <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium">
                <div className="col-span-1 flex items-center">
                  <Checkbox 
                    checked={selectedItems.length === paginatedQuotations.length && paginatedQuotations.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                  />
                </div>
                <div className="col-span-2">วันที่</div>
                <div className="col-span-2">เลขที่เอกสาร</div>
                <div className="col-span-3">ชื่อลูกค้า/ชื่อโปรเจ็ค</div>
                <div className="col-span-2">ยอดรวมสุทธิ</div>
                <div className="col-span-2">สถานะ</div>
                <div className="col-span-1"></div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  กำลังโหลดข้อมูล...
                </div>
              ) : paginatedQuotations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  ไม่พบข้อมูลใบเสนอราคา
                </div>
              ) : (
                paginatedQuotations.map((quotation) => (
                  <div key={quotation.id} className="p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-12 gap-4 items-center text-sm">
                      <div className="col-span-1">
                        <Checkbox 
                          checked={selectedItems.includes(quotation.id)}
                          onCheckedChange={(checked) => handleSelectItem(quotation.id, checked as boolean)}
                        />
                      </div>
                      <div className="col-span-2">
                        {format(new Date(quotation.quotation_date), 'dd-MM-yyyy')}
                      </div>
                      <div className="col-span-2 font-medium">
                        {quotation.quotation_number}
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium">{quotation.customer_name}</div>
                        {quotation.items && quotation.items.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {quotation.items[0]?.product_name || 'ไม่ระบุรายการ'}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 font-medium">
                        {quotation.total_amount.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                      <div className="col-span-2">
                        <Badge variant="secondary" className={getStatusColor(quotation.status)}>
                          {getStatusText(quotation.status)}
                        </Badge>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">รายการต่อหน้า:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  แสดงยอดความดันค์หมด
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}