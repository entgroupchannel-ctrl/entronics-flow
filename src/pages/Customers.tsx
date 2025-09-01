import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, MoreHorizontal, Phone, Mail, MapPin, Upload, Download, FileSpreadsheet, Edit, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { AddCustomerForm } from '@/components/customers/AddCustomerForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as XLSX from 'xlsx';

interface Customer {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  postal_code: string | null;
  tax_id: string | null;
  line_id: string | null;
  hq_branch: string | null;
  customer_type: string;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<{row: number, errors: string[]}[]>([]);
  const [validCustomers, setValidCustomers] = useState<any[]>([]);
  const [invalidCustomers, setInvalidCustomers] = useState<any[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch customers from database
  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers...');
      
      // ดึงข้อมูลทั้งหมดโดยไม่จำกัดจำนวน
      const { data, error, count } = await supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10000); // เพิ่ม limit สูงสุดเป็น 10,000

      console.log('Total customers in database:', count);
      console.log('Fetched customers:', data?.length);

      if (error) throw error;
      setCustomers(data || []);
      
      // Reset to first page when data is refreshed
      setCurrentPage(1);

      if (count && count > 10000) {
        toast({
          title: 'แจ้งเตือน',
          description: `พบข้อมูลลูกค้า ${count} รายการ แต่แสดงได้เพียง 10,000 รายการแรก`,
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลลูกค้าได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Download template function
  const downloadTemplate = () => {
    const templateData = [
      {
        'Company': 'บริษัท ตัวอย่าง จำกัด',
        'Address': '123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ',
        'postcode': '10110',
        'TaxID': '0123456789012',
        'HQ/Branch': 'สำนักงานใหญ่',
        'Contact': 'คุณสมชาย ใจดี',
        'Email': 'contact@example.com',
        'Mobile Phone': '02-123-4567',
        'Line ID': '@companyline'
      },
      {
        'Company': 'บริษัท ผู้จำหน่าย จำกัด',
        'Address': '456 ถนนพระราม 4 แขวงสุริยวงศ์ เขตบางรัก กรุงเทพฯ',
        'postcode': '10500',
        'TaxID': '9876543210987',
        'HQ/Branch': 'สาขาใหญ่',
        'Contact': 'คุณสมหญิง รักษ์ดี',
        'Email': 'supplier@example.com',
        'Mobile Phone': '02-987-6543',
        'Line ID': '@supplierline'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ลูกค้า Template');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Company
      { wch: 50 }, // Address
      { wch: 10 }, // postcode
      { wch: 15 }, // TaxID
      { wch: 15 }, // HQ/Branch
      { wch: 20 }, // Contact
      { wch: 25 }, // Email
      { wch: 15 }, // Mobile Phone
      { wch: 15 }  // Line ID
    ];
    
    XLSX.writeFile(wb, 'Customer_Template.xlsx');
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and separate valid/invalid data
        const errors: {row: number, errors: string[]}[] = [];
        const validData: any[] = [];
        const invalidData: any[] = [];
        const existingEmails = customers.map(c => c.email).filter(Boolean);

        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 2; // Account for header row
          const company = row.Company?.toString().trim() || "";
          const address = row.Address?.toString().trim() || "";
          const postcode = row.postcode?.toString().trim() || "";
          const taxId = row.TaxID?.toString().trim() || "";
          const hqBranch = row['HQ/Branch']?.toString().trim() || "";
          const contact = row.Contact?.toString().trim() || "";
          const email = row.Email?.toString().trim() || "";
          const mobilePhone = row['Mobile Phone']?.toString().trim() || "";
          const lineId = row['Line ID']?.toString().trim() || "";

          // Validation errors for this row
          const rowErrors: string[] = [];

          // เฉพาะฟิลด์ที่จำเป็นจริงๆ เท่านั้น
          if (!company && !contact) {
            rowErrors.push("ต้องระบุชื่อบริษัทหรือชื่อผู้ติดต่อ");
          }

          // ตรวจสอบชื่อบริษัทซ้ำ
          const existingCompanyNames = customers.map(c => c.name.toLowerCase().trim());
          if (company && existingCompanyNames.includes(company.toLowerCase().trim())) {
            rowErrors.push("ชื่อบริษัทซ้ำกับข้อมูลในระบบ");
          }

          // ตรวจสอบอีเมลซ้ำ เฉพาะกรณีที่มีอีเมล
          if (email && existingEmails.includes(email)) {
            rowErrors.push("อีเมลซ้ำกับข้อมูลในระบบ");
          }

          // ตรวจสอบ Tax ID format หากมีข้อมูล
          if (taxId && taxId.length !== 13) {
            rowErrors.push("เลขผู้เสียภาษีต้องมี 13 หลัก");
          }

          const customerData = {
            rowNumber: rowNum,
            name: company || contact || '',
            contact_person: contact,
            phone: mobilePhone,
            email: email,
            address: address,
            postal_code: postcode,
            customer_type: 'ลูกค้า',
            status: 'ปกติ',
            tax_id: taxId,
            line_id: lineId,
            hq_branch: hqBranch,
            company: company,
            originalRow: row
          };

          if (rowErrors.length > 0) {
            errors.push({ row: rowNum, errors: rowErrors });
            invalidData.push(customerData);
          } else {
            validData.push(customerData);
          }
        });

        setImportErrors(errors);
        setValidCustomers(validData);
        setInvalidCustomers(invalidData);
        setImportPreview([...validData, ...invalidData]);
      } catch (error) {
        console.error('Error reading file:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอ่านไฟล์ Excel ได้",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle import customers
  const handleImportCustomers = async () => {
    if (validCustomers.length === 0) {
      toast({
        title: "ไม่มีข้อมูลที่ถูกต้อง",
        description: "ไม่มีลูกค้าที่สามารถนำเข้าได้",
        variant: "destructive"
      });
      return;
    }

    try {
      const customersToInsert = validCustomers.map(customer => ({
        name: customer.name,
        contact_person: customer.contact_person || null,
        phone: customer.phone || null,
        email: customer.email || null,
        address: customer.address || null,
        postal_code: customer.postal_code || null,
        customer_type: customer.customer_type,
        status: customer.status,
        tax_id: customer.tax_id || null,
        line_id: customer.line_id || null,
        hq_branch: customer.hq_branch || null,
        person_type: 'นิติบุคคล',
        contact_type: 'ลูกค้า',
        notes: customer.notes || null,
        created_by: user?.id || null
      }));

      console.log('Attempting to insert customers:', customersToInsert.length);
      console.log('Sample customer data:', customersToInsert[0]);

      const { error } = await supabase
        .from('customers')
        .insert(customersToInsert);

      if (error) throw error;

      toast({
        title: "นำเข้าข้อมูลสำเร็จ",
        description: `นำเข้าลูกค้า ${validCustomers.length} รายการเรียบร้อยแล้ว`,
      });

      // Reset state and refresh data
      setShowImportDialog(false);
      setImportFile(null);
      setImportPreview([]);
      setImportErrors([]);
      setValidCustomers([]);
      setInvalidCustomers([]);
      fetchCustomers();

    } catch (error: any) {
      console.error('Error importing customers:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถนำเข้าข้อมูลลูกค้าได้",
        variant: "destructive"
      });
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      toast({
        title: "ลบข้อมูลสำเร็จ",
        description: "ลบข้อมูลลูกค้าเรียบร้อยแล้ว",
      });

      fetchCustomers();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลลูกค้าได้",
        variant: "destructive"
      });
    }
  };

  // Update customer
  const handleUpdateCustomer = async (customerData: any) => {
    try {
      // ตรวจสอบชื่อบริษัทซ้ำ (ยกเว้นของตัวเอง)
      const { data: existingCustomers, error: checkError } = await supabase
        .from('customers')
        .select('id, name')
        .ilike('name', customerData.name.trim())
        .neq('id', editingCustomer?.id);

      if (checkError) throw checkError;

      if (existingCustomers && existingCustomers.length > 0) {
        toast({
          title: 'พบชื่อบริษัทซ้ำ',
          description: `ชื่อบริษัท "${customerData.name}" มีอยู่ในระบบแล้ว`,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', editingCustomer?.id);

      if (error) throw error;

      toast({
        title: "อัปเดตข้อมูลสำเร็จ",
        description: "อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว",
      });

      setShowEditDialog(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตข้อมูลลูกค้าได้",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getFilteredData = () => {
    let filteredData = customers;
    
    // Filter by tab
    if (activeTab === "customers") {
      filteredData = customers.filter(c => c.customer_type === "ลูกค้า");
    } else if (activeTab === "suppliers") {
      filteredData = customers.filter(c => c.customer_type === "ผู้จำหน่าย");
    } else if (activeTab === "both") {
      filteredData = customers.filter(c => c.customer_type === "ผู้จำหน่าย/ลูกค้า");
    }
    
    // Filter by search term
    return filteredData.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.contact_person && item.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Get paginated data
  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, activeTab]);

  const getStatusBadge = (status?: string | null) => {
    if (!status || status === 'ปกติ') return null;
    return (
      <Badge variant={status === "สำคัญ" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ลูกค้า':
        return 'bg-blue-500';
      case 'ผู้จำหน่าย':
        return 'bg-orange-500';
      case 'ผู้จำหน่าย/ลูกค้า':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="p-6">
              <div className="text-center py-8">กำลังโหลด...</div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">รายชื่อลูกค้า</h1>
                  <p className="text-muted-foreground">จัดการข้อมูลลูกค้าและผู้จำหน่าย</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={downloadTemplate}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    ดาวน์โหลด Template
                  </Button>
                  <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        นำเข้า Excel
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>นำเข้าข้อมูลลูกค้าจาก Excel</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            รองรับไฟล์ .xlsx และ .xls เท่านั้น
                          </p>
                        </div>
                        
                        {importPreview.length > 0 && (
                          <div className="space-y-4">
                            {importErrors.length > 0 && (
                              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                <h4 className="font-semibold text-destructive mb-2">พบข้อผิดพลาด:</h4>
                                <div className="space-y-1 text-sm">
                                  {importErrors.map((error, index) => (
                                    <div key={index} className="text-destructive">
                                      แถว {error.row}: {error.errors.join(', ')}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="border rounded-lg">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>แถว</TableHead>
                                    <TableHead>บริษัท</TableHead>
                                    <TableHead>ที่อยู่</TableHead>
                                    <TableHead>รหัสไปรษณีย์</TableHead>
                                    <TableHead>เลขผู้เสียภาษี</TableHead>
                                    <TableHead>สาขา</TableHead>
                                    <TableHead>ชื่อผู้ติดต่อ</TableHead>
                                    <TableHead>อีเมล</TableHead>
                                    <TableHead>เบอร์โทร</TableHead>
                                    <TableHead>Line ID</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {importPreview.map((customer, index) => (
                                    <TableRow 
                                      key={index} 
                                      className={importErrors.some(e => e.row === customer.rowNumber) ? "bg-destructive/5" : ""}
                                    >
                                      <TableCell>{customer.rowNumber}</TableCell>
                                      <TableCell className="max-w-[150px] truncate" title={customer.company}>{customer.company || '-'}</TableCell>
                                      <TableCell className="max-w-[200px] truncate" title={customer.address}>{customer.address || '-'}</TableCell>
                                      <TableCell>{customer.postal_code || '-'}</TableCell>
                                      <TableCell>{customer.tax_id || '-'}</TableCell>
                                      <TableCell>{customer.hq_branch || '-'}</TableCell>
                                      <TableCell>{customer.contact_person || '-'}</TableCell>
                                      <TableCell>{customer.email || '-'}</TableCell>
                                      <TableCell>{customer.phone || '-'}</TableCell>
                                      <TableCell>{customer.line_id || '-'}</TableCell>
                                      <TableCell>
                                        {importErrors.some(e => e.row === customer.rowNumber) ? (
                                          <Badge variant="destructive">ข้อผิดพลาด</Badge>
                                        ) : (
                                          <Badge variant="secondary">ถูกต้อง</Badge>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-muted-foreground">
                                ข้อมูลที่ถูกต้อง: {validCustomers.length} รายการ | 
                                ข้อมูลที่ผิดพลาด: {invalidCustomers.length} รายการ
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                                  ยกเลิก
                                </Button>
                                <Button 
                                  onClick={handleImportCustomers}
                                  disabled={validCustomers.length === 0}
                                >
                                  นำเข้า {validCustomers.length} รายการ
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <AddCustomerForm onSuccess={() => {
                    fetchCustomers(); // รีเฟรชข้อมูลและ reset หน้าไป 1
                  }} />
                </div>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="ค้นหาชื่อ หรือผู้ติดต่อ"
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs and Content */}
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="customers" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        ลูกค้า ({customers.filter(c => c.customer_type === 'ลูกค้า').length})
                      </TabsTrigger>
                      <TabsTrigger value="suppliers" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        ผู้จำหน่าย ({customers.filter(c => c.customer_type === 'ผู้จำหน่าย').length})
                      </TabsTrigger>
                      <TabsTrigger value="both" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        ผู้จำหน่าย/ลูกค้า ({customers.filter(c => c.customer_type === 'ผู้จำหน่าย/ลูกค้า').length})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 rounded-t-lg font-medium text-sm">
                    <div className="col-span-3">รายชื่อ</div>
                    <div className="col-span-2">ชื่อผู้ติดต่อ</div>
                    <div className="col-span-2">เบอร์ติดต่อ</div>
                    <div className="col-span-2">อีเมล</div>
                    <div className="col-span-2">ประเภท</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">แสดงผล:</span>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="200">200</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">รายการต่อหน้า</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      รวม {getFilteredData().length} รายการ
                    </div>
                  </div>

                  {/* Table Content */}
                  <div className="divide-y divide-border">
                    {getPaginatedData().map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getTypeColor(item.customer_type)}`}></div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.status && item.status !== 'ปกติ' && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {getStatusBadge(item.status)}
                                </div>
                              )}
                              {item.address && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {item.address.substring(0, 30)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm">{item.contact_person || '-'}</div>
                        <div className="col-span-2 text-sm">
                          {item.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {item.phone}
                            </div>
                          ) : '-'}
                        </div>
                        <div className="col-span-2 text-sm">
                          {item.email ? (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {item.email}
                            </div>
                          ) : '-'}
                        </div>
                        <div className="col-span-2 text-sm">
                          <Badge variant="outline">{item.customer_type}</Badge>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingCustomer(item);
                                setShowEditDialog(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                แก้ไข
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    ลบ
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      คุณแน่ใจหรือไม่ที่จะลบ "{item.name}" ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCustomer(item.id)}>
                                      ลบ
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        หน้าแรก
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        ก่อนหน้า
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        หน้า {currentPage} จาก {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        ถัดไป
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        หน้าสุดท้าย
                      </Button>
                    </div>
                  )}

                  {getFilteredData().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูลที่ค้นหา
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Customer Dialog */}
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>แก้ไขข้อมูลลูกค้า</DialogTitle>
                  </DialogHeader>
                  {editingCustomer && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const customerData = {
                        name: formData.get('name') as string,
                        contact_person: formData.get('contact_person') as string || null,
                        phone: formData.get('phone') as string || null,
                        email: formData.get('email') as string || null,
                        address: formData.get('address') as string || null,
                        postal_code: formData.get('postal_code') as string || null,
                        customer_type: formData.get('customer_type') as string,
                        status: formData.get('status') as string,
                        tax_id: formData.get('tax_id') as string || null,
                        line_id: formData.get('line_id') as string || null,
                        hq_branch: formData.get('hq_branch') as string || null,
                        notes: formData.get('notes') as string || null,
                      };
                      handleUpdateCustomer(customerData);
                    }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">ชื่อบริษัท *</label>
                          <Input name="name" defaultValue={editingCustomer.name} required />
                        </div>
                        <div>
                          <label className="text-sm font-medium">ชื่อผู้ติดต่อ</label>
                          <Input name="contact_person" defaultValue={editingCustomer.contact_person || ''} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">เบอร์โทร</label>
                          <Input name="phone" defaultValue={editingCustomer.phone || ''} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">อีเมล</label>
                          <Input name="email" type="email" defaultValue={editingCustomer.email || ''} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium">ที่อยู่</label>
                          <Input name="address" defaultValue={editingCustomer.address || ''} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">รหัสไปรษณีย์</label>
                          <Input name="postal_code" defaultValue={editingCustomer.postal_code || ''} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">เลขผู้เสียภาษี</label>
                          <Input name="tax_id" defaultValue={editingCustomer.tax_id || ''} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">สาขา</label>
                          <Input name="hq_branch" defaultValue={editingCustomer.hq_branch || ''} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Line ID</label>
                          <Input name="line_id" defaultValue={editingCustomer.line_id || ''} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">ประเภท</label>
                          <Select name="customer_type" defaultValue={editingCustomer.customer_type}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ลูกค้า">ลูกค้า</SelectItem>
                              <SelectItem value="ผู้จำหน่าย">ผู้จำหน่าย</SelectItem>
                              <SelectItem value="ผู้จำหน่าย/ลูกค้า">ผู้จำหน่าย/ลูกค้า</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">สถานะ</label>
                          <Select name="status" defaultValue={editingCustomer.status || 'ปกติ'}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ปกติ">ปกติ</SelectItem>
                              <SelectItem value="สำคัญ">สำคัญ</SelectItem>
                              <SelectItem value="ระงับ">ระงับ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium">หมายเหตุ</label>
                          <Input name="notes" defaultValue={editingCustomer.notes || ''} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                          ยกเลิก
                        </Button>
                        <Button type="submit">
                          บันทึก
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}