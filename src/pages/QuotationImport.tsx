import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import * as XLSX from 'xlsx';

interface ImportData {
  quotation_number: string;
  quotation_date: string;
  valid_until?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  discount_type?: 'amount' | 'percentage';
  description?: string;
  notes?: string;
  terms_conditions?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function QuotationImport() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ImportData[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const downloadTemplate = () => {
    const templateData = [
      {
        quotation_number: 'QT202501001',
        quotation_date: '2025-01-01',
        valid_until: '2025-01-15',
        customer_name: 'บริษัท ตัวอย่าง จำกัด',
        customer_email: 'example@company.com',
        customer_phone: '02-123-4567',
        customer_address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
        product_name: 'คอมพิวเตอร์ตั้งโต๊ะ',
        product_sku: 'PC001',
        quantity: 1,
        unit_price: 25000,
        discount_amount: 0,
        discount_type: 'amount',
        description: 'คอมพิวเตอร์ Intel Core i5',
        notes: 'หมายเหตุใบเสนอราคา',
        terms_conditions: 'เงื่อนไขการชำระเงิน 30 วัน'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'quotation_import_template.xlsx');

    toast({
      title: "ดาวน์โหลดสำเร็จ",
      description: "ไฟล์ template ได้ถูกดาวน์โหลดแล้ว",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const processedData: ImportData[] = jsonData.map((row, index) => ({
        quotation_number: row['quotation_number'] || '',
        quotation_date: row['quotation_date'] || '',
        valid_until: row['valid_until'] || '',
        customer_name: row['customer_name'] || '',
        customer_email: row['customer_email'] || '',
        customer_phone: row['customer_phone'] || '',
        customer_address: row['customer_address'] || '',
        product_name: row['product_name'] || '',
        product_sku: row['product_sku'] || '',
        quantity: Number(row['quantity']) || 1,
        unit_price: Number(row['unit_price']) || 0,
        discount_amount: Number(row['discount_amount']) || 0,
        discount_type: (row['discount_type'] as 'amount' | 'percentage') || 'amount',
        description: row['description'] || '',
        notes: row['notes'] || '',
        terms_conditions: row['terms_conditions'] || ''
      }));

      const validationErrors = validateData(processedData);
      setData(processedData);
      setErrors(validationErrors);
      setStep('preview');

    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  const validateData = (data: ImportData[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      if (!row.quotation_number) {
        errors.push({ row: index + 1, field: 'quotation_number', message: 'กรุณากรอกหมายเลขใบเสนอราคา' });
      }
      if (!row.quotation_date) {
        errors.push({ row: index + 1, field: 'quotation_date', message: 'กรุณากรอกวันที่ใบเสนอราคา' });
      }
      if (!row.customer_name) {
        errors.push({ row: index + 1, field: 'customer_name', message: 'กรุณากรอกชื่อลูกค้า' });
      }
      if (!row.product_name) {
        errors.push({ row: index + 1, field: 'product_name', message: 'กรุณากรอกชื่อสินค้า' });
      }
      if (row.quantity <= 0) {
        errors.push({ row: index + 1, field: 'quantity', message: 'จำนวนต้องมากกว่า 0' });
      }
      if (row.unit_price < 0) {
        errors.push({ row: index + 1, field: 'unit_price', message: 'ราคาต่อหน่วยต้องไม่ติดลบ' });
      }
    });

    return errors;
  };

  const groupByQuotation = (data: ImportData[]) => {
    const grouped = data.reduce((acc: any, item) => {
      if (!acc[item.quotation_number]) {
        acc[item.quotation_number] = {
          quotation: {
            quotation_number: item.quotation_number,
            quotation_date: item.quotation_date,
            valid_until: item.valid_until,
            customer_name: item.customer_name,
            customer_email: item.customer_email,
            customer_phone: item.customer_phone,
            customer_address: item.customer_address,
            notes: item.notes,
            terms_conditions: item.terms_conditions
          },
          items: []
        };
      }
      
      acc[item.quotation_number].items.push({
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        discount_type: item.discount_type,
        description: item.description
      });

      return acc;
    }, {});

    return Object.values(grouped) as Array<{
      quotation: {
        quotation_number: string;
        quotation_date: string;
        valid_until?: string;
        customer_name: string;
        customer_email?: string;
        customer_phone?: string;
        customer_address?: string;
        notes?: string;
        terms_conditions?: string;
      };
      items: Array<{
        product_name: string;
        product_sku?: string;
        quantity: number;
        unit_price: number;
        discount_amount?: number;
        discount_type?: 'amount' | 'percentage';
        description?: string;
      }>;
    }>;
  };

  const importData = async () => {
    if (errors.length > 0) {
      toast({
        title: "ไม่สามารถนำเข้าข้อมูลได้",
        description: "กรุณาแก้ไขข้อผิดพลาดก่อนนำเข้าข้อมูล",
        variant: "destructive",
      });
      return;
    }

    setStep('importing');
    setProgress(0);

    try {
      const groupedData = groupByQuotation(data);
      const total = groupedData.length;

      for (let i = 0; i < groupedData.length; i++) {
        const { quotation, items } = groupedData[i];

        // Calculate totals
        const subtotal = items.reduce((sum: number, item: any) => 
          sum + (item.quantity * item.unit_price), 0);
        const totalDiscount = items.reduce((sum: number, item: any) => {
          if (item.discount_type === 'percentage') {
            return sum + ((item.quantity * item.unit_price) * (item.discount_amount / 100));
          }
          return sum + item.discount_amount;
        }, 0);
        const vatAmount = (subtotal - totalDiscount) * 0.07;
        const totalAmount = subtotal - totalDiscount + vatAmount;

        // Insert quotation
        const { data: savedQuotation, error: quotationError } = await supabase
          .from('quotations')
          .insert({
            quotation_number: quotation.quotation_number,
            quotation_date: quotation.quotation_date,
            valid_until: quotation.valid_until || null,
            customer_name: quotation.customer_name,
            customer_email: quotation.customer_email,
            customer_phone: quotation.customer_phone,
            customer_address: quotation.customer_address,
            subtotal,
            discount_amount: totalDiscount,
            vat_amount: vatAmount,
            total_amount: totalAmount,
            status: 'draft',
            notes: quotation.notes,
            terms_conditions: quotation.terms_conditions,
            created_by: user?.id
          })
          .select()
          .single();

        if (quotationError) throw quotationError;

        // Insert quotation items
        const itemsToInsert = items.map((item: any) => ({
          quotation_id: savedQuotation.id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          discount_percentage: item.discount_type === 'percentage' ? item.discount_amount : 0,
          line_total: (item.quantity * item.unit_price) - 
            (item.discount_type === 'percentage' 
              ? ((item.quantity * item.unit_price) * (item.discount_amount / 100))
              : item.discount_amount)
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        setProgress(((i + 1) / total) * 100);
      }

      setStep('complete');
      toast({
        title: "นำเข้าข้อมูลสำเร็จ",
        description: `นำเข้าใบเสนอราคา ${groupedData.length} รายการสำเร็จ`,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถนำเข้าข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      setStep('preview');
    }
  };

  const resetImport = () => {
    setFile(null);
    setData([]);
    setErrors([]);
    setProgress(0);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">นำเข้าข้อมูลใบเสนอราคา</h1>
            <p className="text-muted-foreground">อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลใบเสนอราคาเป็นจำนวนมาก</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/quotations')}>
            <X className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </div>

        {/* Upload Section */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                อัปโหลดไฟล์ข้อมูล
              </CardTitle>
              <CardDescription>
                รองรับไฟล์ Excel (.xlsx, .xls) และ CSV ขนาดไม่เกิน 10MB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  แนะนำให้ใช้ template เพื่อความถูกต้องของข้อมูล
                </span>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-lg font-medium">คลิกเพื่อเลือกไฟล์</span>
                    <br />
                    <span className="text-sm text-muted-foreground">หรือลากไฟล์มาวางที่นี่</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">กำลังประมวลผลไฟล์...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview Section */}
        {step === 'preview' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ตัวอย่างข้อมูลที่จะนำเข้า</CardTitle>
                <CardDescription>
                  ตรวจสอบข้อมูลก่อนการนำเข้า พบ {data.length} รายการ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errors.length > 0 && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      พบข้อผิดพลาด {errors.length} รายการ กรุณาแก้ไขก่อนนำเข้าข้อมูล
                    </AlertDescription>
                  </Alert>
                )}

                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>แถว</TableHead>
                        <TableHead>หมายเลขใบเสนอราคา</TableHead>
                        <TableHead>ลูกค้า</TableHead>
                        <TableHead>สินค้า</TableHead>
                        <TableHead>จำนวน</TableHead>
                        <TableHead>ราคา</TableHead>
                        <TableHead>สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.slice(0, 10).map((row, index) => {
                        const rowErrors = errors.filter(e => e.row === index + 1);
                        return (
                          <TableRow key={index} className={rowErrors.length > 0 ? 'bg-destructive/10' : ''}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{row.quotation_number}</TableCell>
                            <TableCell>{row.customer_name}</TableCell>
                            <TableCell>{row.product_name}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            <TableCell>{row.unit_price.toLocaleString()}</TableCell>
                            <TableCell>
                              {rowErrors.length > 0 ? (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {data.length > 10 && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      และอีก {data.length - 10} รายการ...
                    </p>
                  )}
                </div>

                {errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">รายการข้อผิดพลาด:</h4>
                    <div className="max-h-32 overflow-auto space-y-1">
                      {errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm text-destructive">
                          แถว {error.row}: {error.message}
                        </div>
                      ))}
                      {errors.length > 10 && (
                        <div className="text-sm text-muted-foreground">
                          และอีก {errors.length - 10} ข้อผิดพลาด...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button onClick={resetImport} variant="outline">
                    เลือกไฟล์ใหม่
                  </Button>
                  <Button 
                    onClick={importData} 
                    disabled={errors.length > 0}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    นำเข้าข้อมูล
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Importing Section */}
        {step === 'importing' && (
          <Card>
            <CardHeader>
              <CardTitle>กำลังนำเข้าข้อมูล</CardTitle>
              <CardDescription>
                กรุณารอสักครู่ ระบบกำลังประมวลผลข้อมูล...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  {Math.round(progress)}% เสร็จสิ้น
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Section */}
        {step === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                นำเข้าข้อมูลสำเร็จ
              </CardTitle>
              <CardDescription>
                ข้อมูลได้ถูกนำเข้าสู่ระบบเรียบร้อยแล้ว
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/quotations')}>
                  ดูรายการใบเสนอราคา
                </Button>
                <Button onClick={resetImport} variant="outline">
                  นำเข้าข้อมูลอีกครั้ง
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}