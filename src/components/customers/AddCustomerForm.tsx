import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';

interface AddCustomerFormProps {
  onSuccess: () => void;
}

export function AddCustomerForm({ onSuccess }: AddCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const customerData = {
      name: formData.get('name') as string,
      contact_person: formData.get('contact_person') as string || null,
      phone: formData.get('phone') as string || null,
      email: formData.get('email') as string || null,
      address: formData.get('address') as string || null,
      customer_type: formData.get('customer_type') as string,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string || null,
      created_by: user.id,
    };

    const { error } = await supabase
      .from('customers')
      .insert([customerData]);

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'บันทึกสำเร็จ',
        description: 'เพิ่มข้อมูลลูกค้าเรียบร้อยแล้ว',
      });
      setOpen(false);
      onSuccess();
      // Reset form
      (event.target as HTMLFormElement).reset();
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มลูกค้าใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มลูกค้าใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลลูกค้าหรือผู้จำหน่าย
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อบริษัท/ร้าน *</Label>
              <Input
                id="name"
                name="name"
                placeholder="ชื่อบริษัทหรือร้านค้า"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_type">ประเภท *</Label>
              <Select name="customer_type" defaultValue="ลูกค้า" required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ลูกค้า">ลูกค้า</SelectItem>
                  <SelectItem value="ผู้จำหน่าย">ผู้จำหน่าย</SelectItem>
                  <SelectItem value="ผู้จำหน่าย/ลูกค้า">ผู้จำหน่าย/ลูกค้า</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">ชื่อผู้ติดต่อ</Label>
              <Input
                id="contact_person"
                name="contact_person"
                placeholder="ชื่อผู้ติดต่อ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="เบอร์โทรศัพท์"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="อีเมล"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select name="status" defaultValue="ปกติ">
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ปกติ">ปกติ</SelectItem>
                  <SelectItem value="สำคัญ">สำคัญ</SelectItem>
                  <SelectItem value="ระงับ">ระงับ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="ที่อยู่"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="หมายเหตุเพิ่มเติม"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}