import { useState, useEffect } from "react";
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
  Edit2,
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [updateStockProduct, setUpdateStockProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [showStockUpdateDialog, setShowStockUpdateDialog] = useState(false);
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

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">การจัดการสินค้าคงคลัง</h1>
      </div>

          <Tabs defaultValue="reports" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reports">รายงานคลัง</TabsTrigger>
              <TabsTrigger value="inventory">รายการสินค้า ({products.length} รายการ)</TabsTrigger>
            </TabsList>

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
                         <p className="text-sm text-muted-foreground">สินค้าหมดสต๊อค</p>
                         <p className="text-2xl font-bold text-destructive">
                           {products.filter(p => p.stock === 0).length}
                         </p>
                      </div>
                      <Package className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>สินค้าที่ต้องเฝ้าระวัง</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>ชื่อสินค้า</TableHead>
                        <TableHead>สต๊อคปัจจุบัน</TableHead>
                        <TableHead>สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.filter(p => p.stock <= 5).map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.sku}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.stock} ชิ้น</TableCell>
                          <TableCell>{getStatusBadge(product.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาด้วย SKU, ชื่อสินค้า หรือยี่ห้อ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="เลือกสภาพ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">สภาพทั้งหมด</SelectItem>
                    {itemConditions.map(condition => (
                      <SelectItem key={condition} value={condition}>
                        {condition === "new" ? "ใหม่" : 
                         condition === "refurbished" ? "ปรับสภาพ" :
                         condition === "repaired" ? "ซ่อมแซม" : "มือสอง"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {canManageInventory && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มสินค้า
                  </Button>
                )}
              </div>

              {/* Product List */}
              <div className="space-y-4">
                {loading ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูลสินค้า...</p>
                    </CardContent>
                  </Card>
                ) : filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                      {searchTerm || selectedCategory !== "all" || selectedCondition !== "all" ? "ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีสินค้าในระบบ"}
                    </CardContent>
                  </Card>
                ) : (
                  filteredProducts.map((product) => (
                    <Card key={product.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          {/* Left side - Status and basic info only */}
                          <div className="flex gap-4 flex-1">
                            <div className="flex flex-col items-center gap-2 min-w-[120px]">
                              <div className="text-sm font-medium text-muted-foreground">สถานะสินค้า</div>
                              {getStatusBadge(product.status)}
                            </div>
                            
                             <div className="flex-1 space-y-2">
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
                             </div>
                          </div>
                          
                          {/* Right side - Stock and Actions */}
                          <div className="flex items-center gap-4 min-w-[250px]">
                            <div className="text-center">
                              <div className="text-sm font-medium text-muted-foreground">จำนวนสต๊อก</div>
                              <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="text-2xl font-bold">{product.stock}</span>
                                <span className="text-sm text-muted-foreground">ชิ้น</span>
                                {product.stock <= 5 && (
                                  <AlertTriangle className="h-5 w-5 text-warning" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    ดูรายละเอียด
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>รายละเอียดสินค้า</DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column - Basic Info */}
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">สถานะสินค้า</Label>
                                          <div className="mt-1">
                                            {getStatusBadge(product.status)}
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">SKU</Label>
                                          <p className="mt-1 font-medium">{product.sku}</p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">จำนวนสต๊อก</Label>
                                          <p className="mt-1 text-2xl font-bold text-primary">{product.stock} ชิ้น</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">ยี่ห้อ</Label>
                                          <p className="mt-1">{product.brand || "-"}</p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">ราคาขาย</Label>
                                          <p className="mt-1 text-xl font-semibold text-green-600">
                                            ฿{product.price?.toLocaleString() || "0"}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">สภาพ</Label>
                                          <div className="mt-1">
                                            {product.item_condition ? getConditionBadge(product.item_condition) : "-"}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Column - Additional Details */}
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">ชื่อสินค้า</Label>
                                        <p className="mt-1 font-medium">{product.name}</p>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">หมวดหมู่</Label>
                                        <p className="mt-1">{product.category || "-"}</p>
                                      </div>

                                      {product.description && (
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">รายละเอียด</Label>
                                          <p className="mt-1 text-sm leading-relaxed">{product.description}</p>
                                        </div>
                                      )}

                                      {product.repair_notes && (
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">หมายเหตุการซ่อม</Label>
                                          <p className="mt-1 text-sm leading-relaxed bg-amber-50 p-2 rounded border-l-4 border-amber-200">
                                            {product.repair_notes}
                                          </p>
                                        </div>
                                      )}

                                      {product.repaired_date && (
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">วันที่ซ่อมแซม</Label>
                                          <p className="mt-1">{new Date(product.repaired_date).toLocaleDateString('th-TH')}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <DialogFooter className="flex justify-between pt-6">
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => openStockUpdate(product)}
                                        className="flex items-center space-x-2"
                                      >
                                        <Package className="w-4 h-4" />
                                        <span>อัพเดทสต๊อก</span>
                                      </Button>
                                      
                                      {canManageInventory && (
                                        <Button 
                                          variant="outline" 
                                          onClick={() => {
                                            setEditingProduct(product);
                                            setShowEditDialog(true);
                                          }}
                                          className="flex items-center space-x-2"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                          <span>แก้ไข</span>
                                        </Button>
                                      )}
                                    </div>

                                    {canManageInventory && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="destructive" className="flex items-center space-x-2">
                                            <Trash2 className="w-4 h-4" />
                                            <span>ลบสินค้า</span>
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              คุณแน่ใจหรือไม่ที่จะลบสินค้า "{product.name}" การดำเนินการนี้ไม่สามารถยกเลิกได้
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
                                    )}
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Add Product Dialog */}
          {canManageInventory && (
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
                  <DialogDescription>
                    กรอกข้อมูลสินค้าที่ต้องการเพิ่มเข้าสู่ระบบ
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sku">รหัสสินค้า (SKU) *</Label>
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
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">รายละเอียดสินค้า</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="รายละเอียดเพิ่มเติม..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleAddProduct}>
                    เพิ่มสินค้า
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Product Dialog */}
          {canManageInventory && editingProduct && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>แก้ไขข้อมูลสินค้า</DialogTitle>
                  <DialogDescription>
                    แก้ไขข้อมูลสินค้า "{editingProduct.name}"
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-sku">รหัสสินค้า (SKU) *</Label>
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
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-description">รายละเอียดสินค้า</Label>
                      <Textarea
                        id="edit-description"
                        value={editingProduct.description || ""}
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                        placeholder="รายละเอียดเพิ่มเติม..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleEditProduct}>
                    บันทึกการแก้ไข
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Stock Update Dialog */}
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
    </div>
  );
};

export default Inventory;