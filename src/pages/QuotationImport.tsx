import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, MapPin } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import * as XLSX from 'xlsx';

interface ParsedData {
  headers: string[];
  data: any[][];
  mapping: { [key: string]: string };
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export default function QuotationImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: ValidationError[] } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Field mappings สำหรับระบบ
  const systemFields = {
    'quotation_number': 'เลขที่เอกสาร',
    'quotation_date': 'วัน/เดือน/ปี',
    'customer_name': 'ชื่อลูกค้า',
    'project_name': 'ชื่อโปรเจ็ค',
    'customer_tax_id': 'เลขผู้เสียภาษี',
    'customer_branch': 'สำนักงานใหญ่/สาขา',
    'subtotal': 'มูลค่า',
    'vat_amount': 'ภาษีมูลค่าเพิ่ม',
    'total_amount': 'ยอดรวมสุทธิ',
    'reference_document': 'เอกสารอ้างอิงในระบบ',
    'reference_number': 'เลขที่อ้างอิง',
    'status': 'สถานะ',
    'customer_phone': 'เบอร์โทรศัพท์',
    'customer_email': 'อีเมล',
    'customer_address': 'ที่อยู่',
    'valid_until': 'วันที่หมดอายุ',
    'notes': 'หมายเหตุ',
    'terms_conditions': 'เงื่อนไข'
  };

  const downloadTemplate = () => {
    const templateData = [
      Object.values(systemFields),
      ['QT202501001', '01/01/2025', 'บริษัท ตัวอย่าง จำกัด', 'โปรเจ็ค A', '0123456789012', 'สำนักงานใหญ่', '100000', '7000', '107000', '', '', 'draft', '02-123-4567', 'example@company.com', '123 ถนนสุขุมวิท กรุงเทพฯ', '15/01/2025', 'หมายเหตุ', 'เงื่อนไข 30 วัน']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
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
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length === 0) {
        throw new Error('ไฟล์ว่างเปล่า');
      }

      const headers = jsonData[0] as string[];
      const data = jsonData.slice(1);

      setParsedData({
        headers,
        data,
        mapping: {}
      });

      setStep('mapping');
      toast({
        title: "อ่านไฟล์สำเร็จ",
        description: `พบข้อมูล ${data.length} แถว`,
      });

    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  const handleMappingChange = (systemField: string, fileHeader: string) => {
    if (!parsedData) return;

    const newMapping = { ...parsedData.mapping };
    
    // Remove previous mapping of this file header
    Object.keys(newMapping).forEach(key => {
      if (newMapping[key] === fileHeader) {
        delete newMapping[key];
      }
    });

    // Set new mapping
    if (fileHeader !== 'skip') {
      newMapping[systemField] = fileHeader;
    } else {
      delete newMapping[systemField];
    }

    setParsedData({
      ...parsedData,
      mapping: newMapping
    });
  };

  const proceedToPreview = () => {
    if (!parsedData) return;

    // Validate that required fields are mapped
    const requiredFields = ['quotation_number', 'customer_name', 'total_amount'];
    const missingFields = requiredFields.filter(field => !parsedData.mapping[field]);

    if (missingFields.length > 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: `กรุณา mapping ฟิลด์ที่จำเป็น: ${missingFields.map(f => systemFields[f as keyof typeof systemFields]).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Transform data based on mapping
    const transformedData = parsedData.data.map((row, index) => {
      const quotationData: any = {};
      
      Object.entries(parsedData.mapping).forEach(([systemField, fileHeader]) => {
        const headerIndex = parsedData.headers.indexOf(fileHeader);
        if (headerIndex !== -1) {
          quotationData[systemField] = row[headerIndex];
        }
      });

      return quotationData;
    });

    const validationErrors = validateTransformedData(transformedData);
    setErrors(validationErrors);
    setStep('preview');
  };

  const validateTransformedData = (data: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      if (!row.quotation_number || row.quotation_number.toString().trim() === '') {
        errors.push({ row: index + 2, field: 'quotation_number', message: 'กรุณากรอกเลขที่เอกสาร' });
      }
      if (!row.customer_name || row.customer_name.toString().trim() === '') {
        errors.push({ row: index + 2, field: 'customer_name', message: 'กรุณากรอกชื่อลูกค้า' });
      }
      
      // ตรวจสอบ total_amount อย่างละเอียด
      let totalAmount = 0;
      if (row.total_amount !== null && row.total_amount !== undefined && row.total_amount !== '') {
        totalAmount = parseFloat(row.total_amount.toString().replace(/[^0-9.-]/g, ''));
      }
      
      if (isNaN(totalAmount) || totalAmount <= 0) {
        errors.push({ 
          row: index + 2, 
          field: 'total_amount', 
          message: 'ยอดรวมต้องมากกว่า 0', 
          value: row.total_amount 
        });
      }
    });

    return errors;
  };

  const importData = async () => {
    if (!parsedData) return;

    setStep('importing');
    setProgress(0);

    const validationErrors: ValidationError[] = [];
    const successfulImports: any[] = [];

    try {
      for (let i = 0; i < parsedData.data.length; i++) {
        const row = parsedData.data[i];
        const quotationData: any = {
          created_by: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Map data based on user's mapping
        Object.entries(parsedData.mapping).forEach(([systemField, fileHeader]) => {
          const headerIndex = parsedData.headers.indexOf(fileHeader);
          if (headerIndex !== -1) {
            const value = row[headerIndex];
            
            switch (systemField) {
              case 'quotation_date':
              case 'valid_until':
                if (value) {
                  let date;
                  if (typeof value === 'number') {
                    date = new Date((value - 25569) * 86400 * 1000);
                  } else {
                    date = new Date(value);
                  }
                  
                  if (!isNaN(date.getTime())) {
                    quotationData[systemField] = date.toISOString().split('T')[0];
                  }
                }
                break;
              
              case 'subtotal':
              case 'vat_amount':
              case 'total_amount':
                const numValue = parseFloat(value);
                quotationData[systemField] = isNaN(numValue) ? 0 : numValue;
                break;
              
              default:
                quotationData[systemField] = value || '';
                break;
            }
          }
        });

        // Set default values
        quotationData.quotation_number = quotationData.quotation_number || `IMPORT-${Date.now()}-${i + 1}`;
        quotationData.quotation_date = quotationData.quotation_date || new Date().toISOString().split('T')[0];
        quotationData.customer_name = quotationData.customer_name || '';
        quotationData.total_amount = quotationData.total_amount || 0;
        quotationData.subtotal = quotationData.subtotal || quotationData.total_amount;
        quotationData.vat_amount = quotationData.vat_amount || 0;
        quotationData.discount_amount = 0;
        quotationData.discount_percentage = 0;
        quotationData.withholding_tax_amount = 0;
        quotationData.status = quotationData.status || 'draft';
        quotationData.workflow_status = 'wait_for_approve';

        // Skip rows with validation errors but continue importing valid ones
        let hasValidationError = false;
        
        if (!quotationData.customer_name.trim()) {
          validationErrors.push({
            row: i + 2,
            field: 'customer_name',
            value: quotationData.customer_name,
            message: 'ชื่อลูกค้าไม่สามารถเป็นค่าว่างได้'
          });
          hasValidationError = true;
        }

        if (isNaN(quotationData.total_amount) || quotationData.total_amount <= 0) {
          validationErrors.push({
            row: i + 2,
            field: 'total_amount',
            value: quotationData.total_amount,
            message: 'ยอดรวมต้องมากกว่า 0'
          });
          hasValidationError = true;
        }

        // Skip this row if it has validation errors
        if (hasValidationError) {
          setProgress(((i + 1) / parsedData.data.length) * 100);
          continue;
        }

        try {
          const { data, error } = await supabase
            .from('quotations')
            .insert([quotationData])
            .select();

          if (error) {
            validationErrors.push({
              row: i + 2,
              field: 'database',
              value: JSON.stringify(quotationData),
              message: `Database error: ${error.message}`
            });
          } else if (data) {
            successfulImports.push(data[0]);
          }
        } catch (error: any) {
          validationErrors.push({
            row: i + 2,
            field: 'database',
            value: JSON.stringify(quotationData),
            message: `Import error: ${error.message}`
          });
        }

        setProgress(((i + 1) / parsedData.data.length) * 100);
      }

      setImportResults({
        success: successfulImports.length,
        failed: validationErrors.length,
        errors: validationErrors
      });

      setErrors(validationErrors);
      setStep('complete');

      const successMessage = successfulImports.length > 0 
        ? `นำเข้าสำเร็จ ${successfulImports.length} รายการ`
        : 'ไม่มีรายการที่สามารถนำเข้าได้';
      
      const errorMessage = validationErrors.length > 0 
        ? `, ข้ามรายการที่มีปัญหา ${validationErrors.length} รายการ`
        : '';

      toast({
        title: "Import เสร็จสิ้น",
        description: successMessage + errorMessage,
        variant: successfulImports.length > 0 ? "default" : "destructive",
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถ import ข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  const resetImport = () => {
    setFile(null);
    setParsedData(null);
    setErrors([]);
    setProgress(0);
    setStep('upload');
    setImportResults(null);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">นำเข้าข้อมูลใบเสนอราคา</h1>
            <p className="text-muted-foreground">อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลใบเสนอราคาพร้อม mapping หัวตาราง</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/quotations')}>
            <X className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {['upload', 'mapping', 'preview', 'importing', 'complete'].map((stepName, index) => {
            const stepLabels = {
              upload: 'อัปโหลดไฟล์',
              mapping: 'จับคู่ข้อมูล',
              preview: 'ตรวจสอบ',
              importing: 'นำเข้าข้อมูล',
              complete: 'เสร็จสิ้น'
            };
            
            const isActive = step === stepName;
            const isCompleted = ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) > index;
            
            return (
              <div key={stepName} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? 'bg-primary text-primary-foreground' : 
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${isActive ? 'font-medium' : 'text-gray-600'}`}>
                  {stepLabels[stepName as keyof typeof stepLabels]}
                </span>
                {index < 4 && <div className="w-8 h-px bg-gray-300 mx-4" />}
              </div>
            );
          })}
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

        {/* Mapping Section */}
        {step === 'mapping' && parsedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                จับคู่หัวตาราง
              </CardTitle>
              <CardDescription>
                เลือกหัวตารางจากไฟล์ของคุณที่ตรงกับข้อมูลในระบบ (ฟิลด์ที่มี * จำเป็นต้อง mapping)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(systemFields).map(([fieldKey, fieldLabel]) => {
                  const isRequired = ['quotation_number', 'customer_name', 'total_amount'].includes(fieldKey);
                  return (
                    <div key={fieldKey} className="space-y-2">
                      <Label className={isRequired ? 'text-red-600' : ''}>
                        {fieldLabel} {isRequired && '*'}
                      </Label>
                      <Select
                        value={parsedData.mapping[fieldKey] || ''}
                        onValueChange={(value) => handleMappingChange(fieldKey, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกหัวตาราง..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">ข้าม</SelectItem>
                          {parsedData.headers.map((header, index) => (
                            <SelectItem key={index} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">ตัวอย่างข้อมูลจากไฟล์:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        {parsedData.headers.map((header, index) => (
                          <th key={index} className="border border-gray-300 px-2 py-1 text-left">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.data.slice(0, 3).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell: any, cellIndex: number) => (
                            <td key={cellIndex} className="border border-gray-300 px-2 py-1">
                              {cell || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={resetImport}>
                  ย้อนกลับ
                </Button>
                <Button onClick={proceedToPreview}>
                  ถัดไป
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Section */}
        {step === 'preview' && parsedData && (
          <Card>
            <CardHeader>
              <CardTitle>ตัวอย่างข้อมูลที่จะนำเข้า</CardTitle>
              <CardDescription>
                ตรวจสอบข้อมูลก่อนการนำเข้า พบ {parsedData.data.length} รายการ
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
                      <TableHead>เลขที่เอกสาร</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>ยอดรวม</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.data.slice(0, 10).map((row, index) => {
                      const rowErrors = errors.filter(e => e.row === index + 2);
                      
                      // Get mapped values
                      const quotationNumber = parsedData.mapping['quotation_number'] ? 
                        row[parsedData.headers.indexOf(parsedData.mapping['quotation_number'])] : '';
                      const customerName = parsedData.mapping['customer_name'] ? 
                        row[parsedData.headers.indexOf(parsedData.mapping['customer_name'])] : '';
                      const totalAmount = parsedData.mapping['total_amount'] ? 
                        row[parsedData.headers.indexOf(parsedData.mapping['total_amount'])] : '';
                      
                      return (
                        <TableRow key={index} className={rowErrors.length > 0 ? 'bg-destructive/10' : ''}>
                          <TableCell>{index + 2}</TableCell>
                          <TableCell>{quotationNumber}</TableCell>
                          <TableCell>{customerName}</TableCell>
                          <TableCell>{totalAmount}</TableCell>
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
                {parsedData.data.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    และอีก {parsedData.data.length - 10} รายการ...
                  </p>
                )}
              </div>

              {errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">รายการข้อผิดพลาด:</h4>
                  <div className="max-h-48 overflow-auto space-y-2">
                    {errors.slice(0, 20).map((error, index) => (
                      <div key={index} className="p-2 bg-destructive/10 rounded text-sm">
                        <div className="font-medium text-destructive">
                          แถว {error.row} - {systemFields[error.field as keyof typeof systemFields] || error.field}:
                        </div>
                        <div className="text-destructive/80">{error.message}</div>
                        {error.value !== undefined && error.value !== null && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ค่าที่พบ: "{error.value}"
                          </div>
                        )}
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
                <Button onClick={() => setStep('mapping')} variant="outline">
                  ย้อนกลับ
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
                นำเข้าข้อมูลเสร็จสิ้น
              </CardTitle>
              <CardDescription>
                ผลการนำเข้าข้อมูลใบเสนอราคา
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importResults && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                    <div className="text-sm text-green-800">Import สำเร็จ</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                    <div className="text-sm text-red-800">Import ล้มเหลว</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResults.success + importResults.failed}
                    </div>
                    <div className="text-sm text-blue-800">รวมทั้งหมด</div>
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-red-600">รายการที่มีข้อผิดพลาด:</h4>
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