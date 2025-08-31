import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  status: "active" | "inactive" | "outofstock";
  description: string;
  specifications: Record<string, string>;
}

const categories = [
  "Panel PC",
  "Box PC", 
  "Embedded PC",
  "Mini PC",
  "Industrial Motherboard",
  "Industrial Monitor",
  "Accessories"
];

const brands = [
  "Advantech",
  "AAEON",
  "NEXCOM",
  "IEI",
  "Kontron",
  "Axiomtek",
  "Other"
];

const sampleProducts: Product[] = [
  {
    id: "1",
    sku: "ADV-PPC-3150",
    name: "Advantech PPC-3150 15\" Panel PC",
    category: "Panel PC",
    brand: "Advantech",
    model: "PPC-3150",
    price: 45000,
    cost: 38000,
    stock: 12,
    minStock: 5,
    status: "active",
    description: "15\" XGA TFT LCD Panel Computer with Intel Atom processor",
    specifications: {
      "CPU": "Intel Atom N2600 1.6GHz",
      "RAM": "2GB DDR3",
      "Storage": "32GB SSD",
      "Display": "15\" XGA 1024x768",
      "I/O": "2x USB, 2x COM, 1x LAN"
    }
  },
  {
    id: "2", 
    sku: "NEX-NISE-3500",
    name: "NEXCOM NISE 3500 Fanless Box PC",
    category: "Box PC",
    brand: "NEXCOM",
    model: "NISE-3500",
    price: 32000,
    cost: 27000,
    stock: 8,
    minStock: 3,
    status: "active",
    description: "Compact fanless box PC for industrial applications",
    specifications: {
      "CPU": "Intel Celeron J1900 2.0GHz",
      "RAM": "4GB DDR3L",
      "Storage": "64GB mSATA",
      "I/O": "4x USB, 2x COM, 2x LAN",
      "Operating Temp": "-10°C to +60°C"
    }
  }
];

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    sku: "",
    name: "",
    category: "",
    brand: "",
    model: "",
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    status: "active",
    description: "",
    specifications: {}
  });

  const handleAddProduct = () => {
    if (!newProduct.sku || !newProduct.name || !newProduct.category) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอก SKU, ชื่อสินค้า และหมวดหมู่",
        variant: "destructive"
      });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      sku: newProduct.sku!,
      name: newProduct.name!,
      category: newProduct.category!,
      brand: newProduct.brand || "",
      model: newProduct.model || "",
      price: newProduct.price || 0,
      cost: newProduct.cost || 0,
      stock: newProduct.stock || 0,
      minStock: newProduct.minStock || 5,
      status: newProduct.status as "active" | "inactive" | "outofstock" || "active",
      description: newProduct.description || "",
      specifications: newProduct.specifications || {}
    };

    setProducts([...products, product]);
    setNewProduct({
      sku: "",
      name: "",
      category: "",
      brand: "",
      model: "",
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
      status: "active",
      description: "",
      specifications: {}
    });
    setShowAddForm(false);
    
    toast({
      title: "เพิ่มสินค้าสำเร็จ",
      description: `เพิ่มสินค้า ${product.name} เรียบร้อยแล้ว`
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string, stock: number, minStock: number) => {
    if (stock <= 0) return <Badge variant="destructive">หมด</Badge>;
    if (stock <= minStock) return <Badge variant="secondary">ใกล้หมด</Badge>;
    if (status === "active") return <Badge variant="default">ปกติ</Badge>;
    return <Badge variant="outline">ไม่ใช้งาน</Badge>;
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

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    รายการสินค้า ({filteredProducts.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.sku}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.model}</div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell className="text-right">฿{product.price.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span>{product.stock}</span>
                              {product.stock <= product.minStock && (
                                <AlertTriangle className="h-4 w-4 text-warning" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(product.status, product.stock, product.minStock)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

                        <div>
                          <Label htmlFor="model">รุ่น</Label>
                          <Input
                            id="model"
                            value={newProduct.model}
                            onChange={(e) => setNewProduct({...newProduct, model: e.target.value})}
                            placeholder="PPC-3150"
                          />
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
                          <Label htmlFor="cost">ต้นทุน (บาท)</Label>
                          <Input
                            id="cost"
                            type="number"
                            value={newProduct.cost}
                            onChange={(e) => setNewProduct({...newProduct, cost: Number(e.target.value)})}
                            placeholder="38000"
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

                        <div>
                          <Label htmlFor="minStock">สต๊อคขั้นต่ำ</Label>
                          <Input
                            id="minStock"
                            type="number"
                            value={newProduct.minStock}
                            onChange={(e) => setNewProduct({...newProduct, minStock: Number(e.target.value)})}
                            placeholder="5"
                          />
                        </div>

                        <div>
                          <Label htmlFor="status">สถานะ</Label>
                          <Select value={newProduct.status} onValueChange={(value) => setNewProduct({...newProduct, status: value as any})}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">ใช้งาน</SelectItem>
                              <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">รายละเอียดสินค้า</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="15 inch XGA TFT LCD Panel Computer with Intel Atom processor"
                        rows={3}
                      />
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
                          ฿{products.reduce((sum, p) => sum + (p.cost * p.stock), 0).toLocaleString()}
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
                          {products.filter(p => p.stock <= p.minStock).length}
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