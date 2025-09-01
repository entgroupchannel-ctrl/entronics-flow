import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddRepairedItemFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  serviceRequestId: string;
  onItemAdded?: () => void;
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

export function AddRepairedItemForm({ 
  isOpen, 
  onOpenChange, 
  serviceRequestId, 
  onItemAdded 
}: AddRepairedItemFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    brand: "",
    price: 0,
    stock: 1,
    description: "",
    repair_notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.name) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอก SKU และชื่อสินค้า",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if SKU already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('sku', formData.sku)
        .single();

      if (existingProduct) {
        toast({
          title: "SKU ซ้ำ",
          description: "SKU นี้มีอยู่ในระบบแล้ว",
          variant: "destructive"
        });
        return;
      }

      // Add repaired item to inventory
      const { error } = await supabase
        .from('products')
        .insert({
          sku: formData.sku,
          name: formData.name,
          category: formData.category || null,
          brand: formData.brand || null,
          price: formData.price,
          stock: formData.stock,
          status: formData.stock > 5 ? "In Stock" : formData.stock > 0 ? "Low Stock" : "Out of Stock",
          description: formData.description || null,
          item_condition: "repaired",
          service_request_id: serviceRequestId,
          repaired_date: new Date().toISOString(),
          repair_notes: formData.repair_notes || null
        });

      if (error) throw error;

      toast({
        title: "เพิ่มสินค้าซ่อมแซมสำเร็จ",
        description: `เพิ่มสินค้า ${formData.name} เข้าสู่คลังสินค้าแล้ว`
      });

      // Reset form
      setFormData({
        sku: "",
        name: "",
        category: "",
        brand: "",
        price: 0,
        stock: 1,
        description: "",
        repair_notes: ""
      });

      onOpenChange(false);
      onItemAdded?.();
      
    } catch (error) {
      console.error('Error adding repaired item:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสินค้าได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มสินค้าซ่อมแซมเข้าคลัง</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="รหัสสินค้า"
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">จำนวน</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="name">ชื่อสินค้า *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ชื่อเต็มของสินค้า"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">หมวดหมู่</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="ยี่ห้อสินค้า"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="price">ราคาขาย</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="description">รายละเอียดสินค้า</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="รายละเอียดสินค้า"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="repair_notes">บันทึกการซ่อม</Label>
            <Textarea
              id="repair_notes"
              value={formData.repair_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, repair_notes: e.target.value }))}
              placeholder="บันทึกรายละเอียดการซ่อมแซม"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "กำลังเพิ่ม..." : "เพิ่มสินค้า"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}