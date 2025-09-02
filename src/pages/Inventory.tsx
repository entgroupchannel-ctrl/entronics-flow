import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Package, 
  Search, 
  Filter,
  Upload,
  Download,
  Edit,
  Trash2,
  Eye,
  AlertTriangle
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string;
  brand?: string;
  price: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  description?: string;
  created_at?: string;
  updated_at?: string;
  item_condition?: string;
  repair_order_id?: string;
  service_request_id?: string;
  repaired_date?: string;
  repair_notes?: string;
  is_software: boolean;
}

const categories = [
  "อุปกรณ์ต่อพ่วงคอมพิวเตอร์",
  "ซอฟแวร์", 
  "Mini PC",
  "Computers",
  "Tablets",
  "Monitors",
  "Components",
  "Accessories",
  "อุปกรณ์ซ่อมแซม"
];

const itemConditions = [
  "new",
  "refurbished", 
  "repaired",
  "used"
];

const brands = [
  "TechBrand",
  "RuggedTech",
  "DisplayPro",
  "EmbedTech",
  "InputTech",
  "Other"
];

const Inventory = () => {
  const [currentView, setCurrentView] = useState('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<{row: number, errors: string[]}[]>([]);
  const [validProducts, setValidProducts] = useState<any[]>([]);
  const [invalidProducts, setInvalidProducts] = useState<any[]>([]);
  const { toast } = useToast();
  const { canManageInventory, loading: roleLoading } = useUserRole();

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    sku: "",
    name: "",
    category: "",
    brand: "",
    price: 0,
    stock: 0,
    status: "In Stock",
    description: "",
    is_software: false
  });

  // Load products from Supabase
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
          variant: "destructive"
        });
        return;
      }

      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.sku || !newProduct.name) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอก SKU และชื่อสินค้า",
        variant: "destructive"
      });
      return;
    }

    try {
      // Determine status based on stock
      let status = "In Stock";
      if (newProduct.stock === 0) {
        status = "Out of Stock";
      } else if (newProduct.stock && newProduct.stock <= 5) {
        status = "Low Stock";
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          sku: newProduct.sku,
          name: newProduct.name,
          category: newProduct.category || null,
          brand: newProduct.brand || null,
          price: newProduct.price || 0,
          stock: newProduct.stock || 0,
          status: status,
          description: newProduct.description || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเพิ่มสินค้าได้",
          variant: "destructive"
        });
        return;
      }

      // Reload products to get the updated list
      await loadProducts();
      
      setNewProduct({
        sku: "",
        name: "",
        category: "",
        brand: "",
        price: 0,
        stock: 0,
        status: "In Stock",
        description: "",
        is_software: false
      });
      setShowAddForm(false);
      
      toast({
        title: "เพิ่มสินค้าสำเร็จ",
        description: `เพิ่มสินค้า ${newProduct.name} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสินค้าได้",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !editingProduct.sku || !editingProduct.name) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอก SKU และชื่อสินค้า",
        variant: "destructive"
      });
      return;
    }

    try {
      // Determine status based on stock
      let status = "In Stock";
      if (editingProduct.stock === 0) {
        status = "Out of Stock";
      } else if (editingProduct.stock <= 5) {
        status = "Low Stock";
      }

      const { error } = await supabase
        .from('products')
        .update({
          sku: editingProduct.sku,
          name: editingProduct.name,
          category: editingProduct.category || null,
          brand: editingProduct.brand || null,
          price: editingProduct.price || 0,
          stock: editingProduct.stock || 0,
          status: status,
          description: editingProduct.description || null
        })
        .eq('id', editingProduct.id);

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอัพเดทสินค้าได้",
          variant: "destructive"
        });
        return;
      }

      await loadProducts();
      setEditingProduct(null);
      setShowEditDialog(false);
      
      toast({
        title: "อัพเดทสินค้าสำเร็จ",
        description: `อัพเดทสินค้า ${editingProduct.name} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสินค้าได้",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบสินค้าได้",
          variant: "destructive"
        });
        return;
      }

      await loadProducts();
      
      toast({
        title: "ลบสินค้าสำเร็จ",
        description: `ลบสินค้า ${productName} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสินค้าได้",
        variant: "destructive"
      });
    }
  };

  const [updateStockProduct, setUpdateStockProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [showStockUpdateDialog, setShowStockUpdateDialog] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesCondition = selectedCondition === "all" || product.item_condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge variant="default">มีสต๊อค</Badge>;
      case "Low Stock":
        return <Badge variant="secondary">สต๊อคต่ำ</Badge>;
      case "Out of Stock":
        return <Badge variant="destructive">หมดสต๊อค</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "new":
        return <Badge variant="default">ใหม่</Badge>;
      case "refurbished":
        return <Badge variant="secondary">ปรับสภาพ</Badge>;
      case "repaired":
        return <Badge variant="outline">ซ่อมแซม</Badge>;
      case "used":
        return <Badge variant="secondary">มือสอง</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const handleUpdateStock = async () => {
    if (!updateStockProduct) return;

    try {
      // Determine new status based on stock
      let status = "In Stock";
      if (newStockValue === 0) {
        status = "Out of Stock";
      } else if (newStockValue <= 5) {
        status = "Low Stock";
      }

      const { error } = await supabase
        .from('products')
        .update({
          stock: newStockValue,
          status: status
        })
        .eq('id', updateStockProduct.id);

      if (error) {
        console.error('Error updating stock:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอัพเดทสต๊อกได้",
          variant: "destructive"
        });
        return;
      }

      await loadProducts();
      setUpdateStockProduct(null);
      setShowStockUpdateDialog(false);
      
      toast({
        title: "อัพเดทสต๊อกสำเร็จ",
        description: `อัพเดทสต๊อกสินค้า ${updateStockProduct.name} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสต๊อกได้",
        variant: "destructive"
      });
    }
  };

  const openStockUpdate = (product: Product) => {
    setUpdateStockProduct(product);
    setNewStockValue(product.stock);
    setShowStockUpdateDialog(true);
  };

  const downloadTemplate = () => {
    try {
      // Create sample data for template
      const templateData = [
        {
          'ProductCode': 'ADV-PPC-3150',
          'Name': 'Advantech PPC-3150 15 inch Panel PC',
          'Unit': 'เครื่อง',
          'Category': 'Computers',
          'Description': 'อุตสาหกรรมคอมพิวเตอร์ขนาด 15 นิ้ว สำหรับใช้งานในสภาพแวดล้อมที่เข้มงวด',
          'UnitPrice': 45000,
          'Stock': 12
        },
        {
          'ProductCode': 'TBR-TAB-101',
          'Name': 'TechBrand Rugged Tablet 10.1 inch',
          'Unit': 'เครื่อง',
          'Category': 'Tablets',
          'Description': 'แท็บเล็ตทนทานขนาด 10.1 นิ้ว สำหรับงานภาคสนาม',
          'UnitPrice': 25000,
          'Stock': 8
        },
        {
          'ProductCode': 'DPR-MON-24',
          'Name': 'DisplayPro 24 inch Industrial Monitor',
          'Unit': 'เครื่อง',
          'Category': 'Monitors',
          'Description': 'จอมอนิเตอร์อุตสาหกรรมขนาด 24 นิ้ว คุณภาพสูง',
          'UnitPrice': 18000,
          'Stock': 15
        }
      ];

      // Create instructions sheet
      const instructions = [
        ['คำแนะนำการใช้งาน Template การนำเข้าสินค้า'],
        [''],
        ['คอลัมน์ที่จำเป็น:'],
        ['- ProductCode: รหัสสินค้า (ห้ามซ้ำ)'],
        ['- Name: ชื่อเต็มของสินค้า'],
        ['- Unit: หน่วยนับ (เช่น เครื่อง, ชิ้น, ชุด)'],
        ['- Category: หมวดหมู่สินค้า (' + categories.join(', ') + ')'],
        ['- Description: รายละเอียดสินค้า'],
        ['- UnitPrice: ราคาขายต่อหน่วย (ตัวเลขเท่านั้น)'],
        ['- Stock: จำนวนสต๊อค (ตัวเลขเท่านั้น, เป็นทางเลือก)'],
        [''],
        [''],
        ['หมายเหตุ:'],
        ['- สถานะสินค้าจะถูกกำหนดอัตโนมัติ ตามจำนวนสต๊อค'],
        ['- สต๊อค 0 = หมดสต๊อค, สต๊อค 1-5 = สต๊อคต่ำ, สต๊อค >5 = มีสต๊อค'],
        ['- ลบแถวตัวอย่างออกก่อนนำเข้าข้อมูลจริง']
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add instructions sheet
      const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'คำแนะนำ');

      // Add template sheet
      const wsTemplate = XLSX.utils.json_to_sheet(templateData);
      XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template สินค้า');

      // Set column widths for template sheet
      const colWidths = [
        { wch: 15 }, // SKU
        { wch: 40 }, // ชื่อสินค้า
        { wch: 15 }, // หมวดหมู่
        { wch: 15 }, // ยี่ห้อ
        { wch: 18 }, // ราคาขาย
        { wch: 15 }  // จำนวนสต๊อค
      ];
      wsTemplate['!cols'] = colWidths;

      // Set column widths for instructions sheet
      wsInstructions['!cols'] = [{ wch: 60 }];

      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const filename = `Product_Import_Template_${dateStr}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast({
        title: "ดาวน์โหลดสำเร็จ",
        description: `ดาวน์โหลด ${filename} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้าง Template ได้",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportErrors([]);
    setImportPreview([]);
    setValidProducts([]);
    setInvalidProducts([]);

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
        const existingSkus = products.map(p => p.sku);

        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 2; // Account for header row
          const productCode = row.ProductCode?.toString().trim();
          const name = row.Name?.toString().trim();
          const category = row.Category?.toString().trim();
          const description = row.Description?.toString().trim() || "";
          const unitPrice = parseFloat(row.UnitPrice) || 0;
          const stock = parseInt(row.Stock || row.Quantity || 0) || 0;

          // Validation errors for this row
          const rowErrors: string[] = [];

          if (!productCode) {
            rowErrors.push("ต้องระบุ ProductCode");
          } else if (existingSkus.includes(productCode)) {
            rowErrors.push("ProductCode ซ้ำกับข้อมูลในระบบ");
          }
          
          if (!name) {
            rowErrors.push("ต้องระบุ Name");
          }
          
          // Allow any category, don't validate against predefined list
          // if (category && !categories.includes(category)) {
          //   rowErrors.push(`หมวดหมู่ '${category}' ไม่ถูกต้อง`);
          // }

          if (isNaN(unitPrice) || unitPrice < 0) {
            rowErrors.push("ราคาต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0");
          }

          if (isNaN(stock) || stock < 0) {
            rowErrors.push("จำนวนสต๊อคต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0");
          }

          // Determine status based on stock
          let status = "In Stock";
          if (stock === 0) {
            status = "Out of Stock";
          } else if (stock <= 5) {
            status = "Low Stock";
          }

          const productData = {
            rowNumber: rowNum,
            sku: productCode || '',
            name: name || '',
            category: category || null,
            description: description || null,
            price: unitPrice,
            stock: stock,
            status: status,
            originalRow: row
          };

          if (rowErrors.length > 0) {
            errors.push({ row: rowNum, errors: rowErrors });
            invalidData.push(productData);
          } else {
            validData.push(productData);
          }
        });

        setImportErrors(errors);
        setValidProducts(validData);
        setInvalidProducts(invalidData);
        setImportPreview([...validData, ...invalidData]);
        setShowImportDialog(true);
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

  const handleImportProducts = async () => {
    if (validProducts.length === 0) {
      toast({
        title: "ไม่มีข้อมูลที่ถูกต้อง",
        description: "ไม่มีสินค้าที่สามารถนำเข้าได้",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare data for import (remove metadata fields)
      const productsToImport = validProducts.map(p => ({
        sku: p.sku,
        name: p.name,
        category: p.category,
        description: p.description,
        price: p.price,
        stock: p.stock,
        status: p.status
      }));

      const { data, error } = await supabase
        .from('products')
        .insert(productsToImport);

      if (error) {
        console.error('Error importing products:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถนำเข้าสินค้าได้",
          variant: "destructive"
        });
        return;
      }

      await loadProducts();
      setShowImportDialog(false);
      setImportFile(null);
      setImportPreview([]);
      setImportErrors([]);
      setValidProducts([]);
      setInvalidProducts([]);

      const successMessage = invalidProducts.length > 0 
        ? `นำเข้าสินค้า ${validProducts.length} รายการสำเร็จ (ข้าม ${invalidProducts.length} รายการที่มีข้อผิดพลาด)`
        : `นำเข้าสินค้า ${validProducts.length} รายการเรียบร้อยแล้ว`;

      toast({
        title: "นำเข้าสำเร็จ",
        description: successMessage
      });
    } catch (error) {
      console.error('Error importing products:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถนำเข้าสินค้าได้",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onMenuClick={setCurrentView} currentView={currentView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">คลังสินค้า</h1>
            <p className="text-muted-foreground mt-2">
              จัดการสินค้า Industrial Computer และติดตามสต๊อค
            </p>
          </div>

          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList>
              <TabsTrigger value="reports">รายงานคลัง</TabsTrigger>
              <TabsTrigger value="products">รายการสินค้า</TabsTrigger>
              <TabsTrigger value="import">นำเข้าสินค้า</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              {/* Search and Filter Bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="ค้นหาสินค้า SKU, ชื่อ, ยี่ห้อ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="เลือกหมวดหมู่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                     </Select>
                     
                     <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="เลือกสภาพ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทุกสภาพ</SelectItem>
                        <SelectItem value="new">ใหม่</SelectItem>
                        <SelectItem value="refurbished">ปรับสภาพ</SelectItem>
                        <SelectItem value="repaired">ซ่อมแซม</SelectItem>
                        <SelectItem value="used">มือสอง</SelectItem>
                      </SelectContent>
                     </Select>
                     {canManageInventory() && (
                       <Button onClick={() => setShowAddForm(true)} className="whitespace-nowrap">
                         <Plus className="h-4 w-4 mr-2" />
                         เพิ่มสินค้า
                       </Button>
                     )}
                   </div>
                 </CardContent>
               </Card>

               {/* Add Product Form */}
               {showAddForm && canManageInventory() && (
                <Card>
                  <CardHeader>
                    <CardTitle>เพิ่มสินค้าใหม่</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="sku">SKU *</Label>
                          <Input
                            id="sku"
                            value={newProduct.sku}
                            onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                            placeholder="ADV-PPC-3150"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="name">ชื่อสินค้า *</Label>
                          <Input
                            id="name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            placeholder="Advantech PPC-3150 15 inch Panel PC"
                          />
                        </div>

                        <div>
                          <Label htmlFor="category">หมวดหมู่ *</Label>
                          <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกหมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="brand">ยี่ห้อ</Label>
                          <Select value={newProduct.brand} onValueChange={(value) => setNewProduct({...newProduct, brand: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกยี่ห้อ" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map(brand => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="price">ราคาขาย (บาท)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                            placeholder="45000"
                          />
                        </div>

                         <div>
                           <Label htmlFor="stock">จำนวนสต๊อค</Label>
                           <Input
                             id="stock"
                             type="number"
                             value={newProduct.stock}
                             onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                             placeholder="12"
                           />
                         </div>
                       </div>
                     </div>

                     <div className="col-span-full">
                       <Label htmlFor="description">รายละเอียดสินค้า</Label>
                       <Textarea
                         id="description"
                         value={newProduct.description || ""}
                         onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                         placeholder="รายละเอียดเพิ่มเติมของสินค้า..."
                         rows={3}
                       />
                      </div>

                      {/* Checkbox สำหรับระบุซอฟต์แวร์ */}
                      <div className="col-span-full">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_software"
                            checked={newProduct.is_software || false}
                            onCheckedChange={(checked) => setNewProduct({...newProduct, is_software: checked as boolean})}
                          />
                          <Label htmlFor="is_software" className="text-sm font-medium">
                            สินค้าซอฟต์แวร์ (หัก ณ ที่จ่าย 3%)
                          </Label>
                        </div>
                      </div>

                    <div className="flex gap-4">
                      <Button onClick={handleAddProduct}>
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มสินค้า
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        ยกเลิก
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Edit Product Dialog */}
              {canManageInventory() && (
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>แก้ไขสินค้า</DialogTitle>
                      <DialogDescription>
                        แก้ไขข้อมูลสินค้าในระบบ
                      </DialogDescription>
                    </DialogHeader>
                     {editingProduct && (
                       <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                             <div>
                               <Label htmlFor="edit-sku">SKU *</Label>
                               <Input
                                 id="edit-sku"
                                 value={editingProduct.sku}
                                 onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                                 placeholder="ADV-PPC-3150"
                               />
                             </div>
                             
                             <div>
                               <Label htmlFor="edit-name">ชื่อสินค้า *</Label>
                               <Input
                                 id="edit-name"
                                 value={editingProduct.name}
                                 onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                 placeholder="Advantech PPC-3150 15 inch Panel PC"
                               />
                             </div>

                             <div>
                               <Label htmlFor="edit-category">หมวดหมู่</Label>
                               <Select value={editingProduct.category || ""} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
                                 <SelectTrigger>
                                   <SelectValue placeholder="เลือกหมวดหมู่" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {categories.map(category => (
                                     <SelectItem key={category} value={category}>{category}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </div>

                             <div>
                               <Label htmlFor="edit-brand">ยี่ห้อ</Label>
                               <Select value={editingProduct.brand || ""} onValueChange={(value) => setEditingProduct({...editingProduct, brand: value})}>
                                 <SelectTrigger>
                                   <SelectValue placeholder="เลือกยี่ห้อ" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {brands.map(brand => (
                                     <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </div>
                           </div>

                           <div className="space-y-4">
                             <div>
                               <Label htmlFor="edit-price">ราคาขาย (บาท)</Label>
                               <Input
                                 id="edit-price"
                                 type="number"
                                 value={editingProduct.price}
                                 onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                                 placeholder="45000"
                               />
                             </div>

                             <div>
                               <Label htmlFor="edit-stock">จำนวนสต๊อค</Label>
                               <Input
                                 id="edit-stock"
                                 type="number"
                                 value={editingProduct.stock}
                                 onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                                 placeholder="12"
                               />
                             </div>
                           </div>
                         </div>

                         <div className="space-y-2">
                           <Label htmlFor="edit-description">รายละเอียดสินค้า</Label>
                           <Textarea
                             id="edit-description"
                             value={editingProduct.description || ""}
                             onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                             placeholder="รายละเอียดเพิ่มเติมของสินค้า..."
                             rows={3}
                            />
                          </div>

                          {/* Checkbox สำหรับระบุซอฟต์แวร์ในฟอร์มแก้ไข */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="edit-is_software"
                                checked={editingProduct.is_software || false}
                                onCheckedChange={(checked) => setEditingProduct({...editingProduct, is_software: checked as boolean})}
                              />
                              <Label htmlFor="edit-is_software" className="text-sm font-medium">
                                สินค้าซอฟต์แวร์ (หัก ณ ที่จ่าย 3%)
                              </Label>
                            </div>
                          </div>
                       </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                        ยกเลิก
                      </Button>
                      <Button onClick={handleEditProduct}>
                        บันทึกการเปลี่ยนแปลง
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

               {/* Products Grid */}
               <div className="space-y-4">
                 {loading ? (
                   <div className="flex items-center justify-center py-8">
                     <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
                   </div>
                 ) : filteredProducts.length === 0 ? (
                   <Card>
                     <CardContent className="text-center py-8 text-muted-foreground">
                       {searchTerm || selectedCategory !== "all" || selectedCondition !== "all" ? "ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีสินค้าในระบบ"}
                     </CardContent>
                   </Card>
                 ) : (
                   filteredProducts.map((product) => (
                     <Card key={product.id} className="border border-border">
                       <CardContent className="p-6">
                         <div className="flex items-start justify-between">
                           {/* Left side - Status and product info */}
                           <div className="flex gap-4 flex-1">
                             <div className="flex flex-col items-center gap-2 min-w-[120px]">
                               <div className="text-sm font-medium text-muted-foreground">สถานะสินค้า</div>
                               {getStatusBadge(product.status)}
                               <div className="text-xs text-muted-foreground text-center">
                                 {product.status === "In Stock" && "พร้อมขาย"}
                                 {product.status === "Low Stock" && "สต๊อกต่ำ"}
                                 {product.status === "Out of Stock" && "หมดสต๊อก"}
                               </div>
                             </div>
                             
                              <div className="flex-1 space-y-3">
                                <div>
                                  <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">ยี่ห้อ:</span>
                                    <div className="font-medium">{product.brand || "-"}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">ราคาขาย:</span>
                                    <div className="font-medium">฿{product.price.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">สภาพ:</span>
                                    <div>{getConditionBadge(product.item_condition || "new")}</div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    ดูรายละเอียด
                                  </Button>
                                </div>
                               
                               {product.description && (
                                 <div className="text-sm text-muted-foreground">
                                   {product.description}
                                 </div>
                               )}
                               
                               {product.repair_notes && (
                                 <div className="text-xs p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                                   <strong>บันทึกการซ่อม:</strong> {product.repair_notes}
                                   {product.repaired_date && (
                                     <div className="mt-1">
                                       ซ่อมเมื่อ: {new Date(product.repaired_date).toLocaleDateString('th-TH')}
                                     </div>
                                   )}
                                 </div>
                               )}
                             </div>
                           </div>
                           
                           {/* Right side - Stock update */}
                           <div className="flex flex-col items-end gap-4 min-w-[200px]">
                             <div className="text-center">
                               <div className="text-sm font-medium text-muted-foreground">จำนวนสต๊อกปัจจุบัน</div>
                               <div className="flex items-center justify-center gap-2 mt-1">
                                 <span className="text-2xl font-bold">{product.stock}</span>
                                 <span className="text-sm text-muted-foreground">ชิ้น</span>
                                 {product.stock <= 5 && (
                                   <AlertTriangle className="h-5 w-5 text-warning" />
                                 )}
                               </div>
                             </div>
                             
                             <div className="flex gap-2">
                               {canManageInventory() && (
                                 <>
                                   <Button 
                                     variant="outline" 
                                     size="sm"
                                     onClick={() => openStockUpdate(product)}
                                   >
                                     <Package className="h-4 w-4 mr-2" />
                                     อัพเดทสต๊อก
                                   </Button>
                                   
                                   <Button 
                                     variant="ghost" 
                                     size="sm"
                                     onClick={() => {
                                       setEditingProduct(product);
                                       setShowEditDialog(true);
                                     }}
                                   >
                                     <Edit className="h-4 w-4" />
                                   </Button>
                                   
                                   <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                       <Button variant="ghost" size="sm">
                                         <Trash2 className="h-4 w-4" />
                                       </Button>
                                     </AlertDialogTrigger>
                                     <AlertDialogContent>
                                       <AlertDialogHeader>
                                         <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
                                         <AlertDialogDescription>
                                           คุณแน่ใจหรือไม่ที่จะลบสินค้า "{product.name}" นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                                         </AlertDialogDescription>
                                       </AlertDialogHeader>
                                       <AlertDialogFooter>
                                         <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                         <AlertDialogAction
                                           onClick={() => handleDeleteProduct(product.id, product.name)}
                                           className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                         >
                                           ลบสินค้า
                                         </AlertDialogAction>
                                       </AlertDialogFooter>
                                     </AlertDialogContent>
                                   </AlertDialog>
                                 </>
                               )}
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   ))
                 )}
               </div>
               
               {/* Stock Update Dialog */}
               {canManageInventory() && (
                 <Dialog open={showStockUpdateDialog} onOpenChange={setShowStockUpdateDialog}>
                   <DialogContent className="sm:max-w-[400px]">
                     <DialogHeader>
                       <DialogTitle>อัพเดทสต๊อกสินค้า</DialogTitle>
                       <DialogDescription>
                         ปรับปรุงจำนวนสต๊อกสินค้า "{updateStockProduct?.name}"
                       </DialogDescription>
                     </DialogHeader>
                     {updateStockProduct && (
                       <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                             <span className="text-muted-foreground">SKU:</span>
                             <div className="font-medium">{updateStockProduct.sku}</div>
                           </div>
                           <div>
                             <span className="text-muted-foreground">สต๊อกปัจจุบัน:</span>
                             <div className="font-medium">{updateStockProduct.stock} ชิ้น</div>
                           </div>
                         </div>
                         
                         <div className="space-y-2">
                           <Label htmlFor="new-stock">จำนวนสต๊อกใหม่</Label>
                           <Input
                             id="new-stock"
                             type="number"
                             min="0"
                             value={newStockValue}
                             onChange={(e) => setNewStockValue(Number(e.target.value))}
                             placeholder="0"
                           />
                           <div className="text-xs text-muted-foreground">
                             {newStockValue === 0 && "สถานะ: หมดสต๊อก"}
                             {newStockValue > 0 && newStockValue <= 5 && "สถานะ: สต๊อกต่ำ"}
                             {newStockValue > 5 && "สถานะ: มีสต๊อก"}
                           </div>
                         </div>
                       </div>
                     )}
                     <DialogFooter>
                       <Button variant="outline" onClick={() => setShowStockUpdateDialog(false)}>
                         ยกเลิก
                       </Button>
                       <Button onClick={handleUpdateStock}>
                         อัพเดทสต๊อก
                       </Button>
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
               )}
             </TabsContent>

            <TabsContent value="import" className="space-y-6">
              {showAddForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>เพิ่มสินค้าใหม่</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="sku">SKU *</Label>
                          <Input
                            id="sku"
                            value={newProduct.sku}
                            onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                            placeholder="ADV-PPC-3150"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="name">ชื่อสินค้า *</Label>
                          <Input
                            id="name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            placeholder="Advantech PPC-3150 15 inch Panel PC"
                          />
                        </div>

                        <div>
                          <Label htmlFor="category">หมวดหมู่ *</Label>
                          <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกหมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="brand">ยี่ห้อ</Label>
                          <Select value={newProduct.brand} onValueChange={(value) => setNewProduct({...newProduct, brand: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกยี่ห้อ" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map(brand => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="price">ราคาขาย (บาท)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                            placeholder="45000"
                          />
                        </div>

                         <div>
                           <Label htmlFor="stock">จำนวนสต๊อค</Label>
                           <Input
                             id="stock"
                             type="number"
                             value={newProduct.stock}
                             onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                             placeholder="12"
                           />
                         </div>

                      </div>
                    </div>


                    <div className="flex gap-4">
                      <Button onClick={handleAddProduct}>
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มสินค้า
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        ยกเลิก
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!showAddForm && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]">
                      <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">เพิ่มสินค้าใหม่</h3>
                      <p className="text-muted-foreground mb-4">
                        เพิ่มสินค้า Industrial Computer ใหม่เข้าสู่ระบบ
                      </p>
                      <Button onClick={() => setShowAddForm(true)}>
                        เริ่มเพิ่มสินค้า
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]">
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">นำเข้าจาก Excel</h3>
                      <p className="text-muted-foreground mb-4">
                        อัปโหลดไฟล์ Excel เพื่อนำเข้าสินค้าจำนวนมาก
                      </p>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="excel-upload"
                      />
                      <Button variant="outline" onClick={() => document.getElementById('excel-upload')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        เลือกไฟล์
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]">
                      <Download className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">ดาวน์โหลด Template</h3>
                      <p className="text-muted-foreground mb-4">
                        ดาวน์โหลด Excel template สำหรับนำเข้าสินค้า
                      </p>
                      <Button variant="outline" onClick={downloadTemplate}>
                        <Download className="h-4 w-4 mr-2" />
                        ดาวน์โหลด Template
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">สินค้าทั้งหมด</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                      </div>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                         <p className="text-sm text-muted-foreground">มูลค่าสต๊อค</p>
                         <p className="text-2xl font-bold">
                           ฿{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
                         </p>
                      </div>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                         <p className="text-sm text-muted-foreground">สินค้าใกล้หมด</p>
                         <p className="text-2xl font-bold text-warning">
                           {products.filter(p => p.stock <= 5).length}
                         </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">สินค้าหมด</p>
                        <p className="text-2xl font-bold text-destructive">
                          {products.filter(p => p.stock === 0).length}
                        </p>
                      </div>
                      <Package className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Import Preview Dialog */}
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ตรวจสอบข้อมูลก่อนนำเข้า</DialogTitle>
                <DialogDescription>
                  ตรวจสอบข้อมูลสินค้าที่จะนำเข้า - สินค้าที่ถูกต้องจะถูกนำเข้า สินค้าที่มีข้อผิดพลาดจะถูกข้าม
                </DialogDescription>
              </DialogHeader>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="text-green-800 font-medium">สินค้าที่สามารถนำเข้าได้</div>
                  <div className="text-2xl font-bold text-green-600">{validProducts.length}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-red-800 font-medium">สินค้าที่มีข้อผิดพลาด</div>
                  <div className="text-2xl font-bold text-red-600">{invalidProducts.length}</div>
                </div>
              </div>

              {/* Errors */}
              {importErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-destructive">รายการข้อผิดพลาด:</h4>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 max-h-32 overflow-y-auto">
                    <ul className="text-sm text-destructive space-y-1">
                      {importErrors.map((errorItem, index) => (
                        <li key={index}>
                          <strong>แถว {errorItem.row}:</strong> {errorItem.errors.join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Valid Products */}
              {validProducts.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-green-700">สินค้าที่จะนำเข้า ({validProducts.length} รายการ):</h4>
                  <div className="border border-green-200 rounded-md max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>แถว</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>ชื่อสินค้า</TableHead>
                          <TableHead>หมวดหมู่</TableHead>
                          <TableHead>ราคาขาย</TableHead>
                          <TableHead>สต๊อค</TableHead>
                          <TableHead>สถานะ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validProducts.map((product, index) => (
                          <TableRow key={index} className="bg-green-50/50">
                            <TableCell className="font-medium">{product.rowNumber}</TableCell>
                            <TableCell className="font-medium">{product.sku}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category || "-"}</TableCell>
                            <TableCell>฿{product.price.toLocaleString()}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              <Badge variant={product.status === "In Stock" ? "default" : product.status === "Low Stock" ? "secondary" : "destructive"}>
                                {product.status === "In Stock" ? "มีสต๊อค" : product.status === "Low Stock" ? "สต๊อคต่ำ" : "หมดสต๊อค"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Invalid Products */}
              {invalidProducts.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-red-700">สินค้าที่จะถูกข้าม ({invalidProducts.length} รายการ):</h4>
                  <div className="border border-red-200 rounded-md max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>แถว</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>ชื่อสินค้า</TableHead>
                          <TableHead>หมวดหมู่</TableHead>
                          <TableHead>ราคาขาย</TableHead>
                          <TableHead>สต๊อค</TableHead>
                          <TableHead>ข้อผิดพลาด</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invalidProducts.map((product, index) => {
                          const errorItem = importErrors.find(e => e.row === product.rowNumber);
                          return (
                            <TableRow key={index} className="bg-red-50/50">
                              <TableCell className="font-medium">{product.rowNumber}</TableCell>
                              <TableCell className="font-medium">{product.sku || "-"}</TableCell>
                              <TableCell>{product.name || "-"}</TableCell>
                              <TableCell>{product.category || "-"}</TableCell>
                              <TableCell>฿{product.price.toLocaleString()}</TableCell>
                              <TableCell>{product.stock}</TableCell>
                              <TableCell className="text-red-600 text-xs">
                                {errorItem?.errors.join(', ') || "ข้อผิดพลาดไม่ทราบสาเหตุ"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                  ยกเลิก
                </Button>
                <Button 
                  onClick={handleImportProducts}
                  disabled={validProducts.length === 0}
                  className={validProducts.length > 0 ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  นำเข้าสินค้าที่ถูกต้อง ({validProducts.length} รายการ)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Inventory;