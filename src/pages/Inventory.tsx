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
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string;
  brand?: string;
  price: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  created_at?: string;
  updated_at?: string;
}

const categories = [
  "Computers",
  "Tablets", 
  "Monitors",
  "Components",
  "Accessories"
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
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    sku: "",
    name: "",
    category: "",
    brand: "",
    price: 0,
    stock: 0,
    status: "In Stock"
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
          status: status
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
        status: "In Stock"
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
          status: status
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
    return matchesSearch && matchesCategory;
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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">คลังสินค้า</h1>
            <p className="text-muted-foreground mt-2">
              จัดการสินค้า Industrial Computer และติดตามสต๊อค
            </p>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">รายการสินค้า</TabsTrigger>
              <TabsTrigger value="import">นำเข้าสินค้า</TabsTrigger>
              <TabsTrigger value="reports">รายงานคลัง</TabsTrigger>
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
                    <Button onClick={() => setShowAddForm(true)} className="whitespace-nowrap">
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มสินค้า
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Add Product Form */}
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

              {/* Edit Product Dialog */}
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

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    รายการสินค้า ({filteredProducts.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>ชื่อสินค้า</TableHead>
                          <TableHead>หมวดหมู่</TableHead>
                          <TableHead>ยี่ห้อ</TableHead>
                          <TableHead className="text-right">ราคาขาย</TableHead>
                          <TableHead className="text-right">สต๊อค</TableHead>
                          <TableHead>สถานะ</TableHead>
                          <TableHead className="text-center">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              {searchTerm || selectedCategory !== "all" ? "ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีสินค้าในระบบ"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.sku}</TableCell>
                              <TableCell>
                                <div className="font-medium">{product.name}</div>
                              </TableCell>
                              <TableCell>{product.category || "-"}</TableCell>
                              <TableCell>{product.brand || "-"}</TableCell>
                              <TableCell className="text-right">฿{product.price.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span>{product.stock}</span>
                                  {product.stock <= 5 && (
                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(product.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
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
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
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
                      <Button variant="outline">
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
                      <Button variant="outline">
                        ดาวน์โหลด
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
        </main>
      </div>
    </div>
  );
};

export default Inventory;