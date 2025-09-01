import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Upload } from 'lucide-react';

interface AddCustomerFormProps {
  onSuccess: () => void;
}

export function AddCustomerForm({ onSuccess }: AddCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [personType, setPersonType] = useState('นิติบุคคล');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const customerData = {
      name: formData.get('name') as string,
      person_type: personType,
      tax_id: personType === 'นิติบุคคล' ? formData.get('tax_id') as string : null,
      citizen_id: personType === 'บุคคลธรรมดา' ? formData.get('citizen_id') as string : null,
      contact_type: formData.get('contact_type') as string,
      customer_type: formData.get('customer_type') as string,
      contact_person: formData.get('contact_person') as string || null,
      contact_position: formData.get('contact_position') as string || null,
      phone: formData.get('phone') as string || null,
      email: formData.get('email') as string || null,
      address: formData.get('address') as string || null,
      province: formData.get('province') as string || null,
      district: formData.get('district') as string || null,
      sub_district: formData.get('sub_district') as string || null,
      postal_code: formData.get('postal_code') as string || null,
      bank_name: formData.get('bank_name') as string || null,
      bank_account: formData.get('bank_account') as string || null,
      bank_branch: formData.get('bank_branch') as string || null,
      swift_code: formData.get('swift_code') as string || null,
      bank_address: formData.get('bank_address') as string || null,
      website: formData.get('website') as string || null,
      line_id: formData.get('line_id') as string || null,
      facebook: formData.get('facebook') as string || null,
      hq_branch: formData.get('hq_branch') as string || null,
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
      setPersonType('นิติบุคคล');
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-blue-600">สร้างรายชื่อผู้ติดต่อ</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลลูกค้าหรือผู้จำหน่าย
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ซ้าย - ข้อมูลผู้ติดต่อ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">ข้อมูลผู้ติดต่อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ประเภทผู้ติดต่อ:</Label>
                  <RadioGroup value={personType} onValueChange={setPersonType} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="นิติบุคคล" id="corporation" />
                      <Label htmlFor="corporation">นิติบุคคล</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="บุคคลธรรมดา" id="individual" />
                      <Label htmlFor="individual">บุคคลธรรมดา</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>ประเภท:</Label>
                  <RadioGroup defaultValue="ลูกค้า" name="customer_type" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ลูกค้า" id="customer" />
                      <Label htmlFor="customer">ลูกค้า</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ผู้จำหน่าย" id="supplier" />
                      <Label htmlFor="supplier">ผู้จำหน่าย</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อบริษัท/ร้าน *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="ชื่อบริษัทหรือร้านค้า"
                    required
                  />
                </div>

                {personType === 'นิติบุคคล' ? (
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">TaxID (รหัสนิติบุคคล/หมายเลขผู้เสียภาษี 13 หลัก):</Label>
                    <Input
                      id="tax_id"
                      name="tax_id"
                      placeholder="หมายเลขผู้เสียภาษี 13 หลัก"
                      maxLength={13}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="citizen_id">เลขบัตรประจำตัวประชาชน:</Label>
                    <Input
                      id="citizen_id"
                      name="citizen_id"
                      placeholder="เลขบัตรประจำตัวประชาชน"
                      maxLength={13}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="contact_type">ประเภทการผูกความสัมพันธ์:</Label>
                  <Select name="contact_type" defaultValue="ลูกค้า">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ลูกค้า">ลูกค้า</SelectItem>
                      <SelectItem value="ผู้จำหน่าย">ผู้จำหน่าย</SelectItem>
                      <SelectItem value="พันธมิตร">พันธมิตร</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact (ชื่อผู้ติดต่อ):</Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    placeholder="ชื่อผู้ติดต่อ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_position">ตำแหน่ง:</Label>
                  <Input
                    id="contact_position"
                    name="contact_position"
                    placeholder="ตำแหน่ง"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Phone:</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="เบอร์โทรศัพท์มือถือ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล:</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="อีเมล"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">เว็บไซต์:</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line_id">Line ID:</Label>
                  <Input
                    id="line_id"
                    name="line_id"
                    placeholder="Line ID (เช่น @companyline)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hq_branch">HQ/Branch (สำนักงานใหญ่/สาขา):</Label>
                  <Select name="hq_branch">
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="สำนักงานใหญ่">สำนักงานใหญ่</SelectItem>
                      <SelectItem value="สาขาใหญ่">สาขาใหญ่</SelectItem>
                      <SelectItem value="สาขาย่อย">สาขาย่อย</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* ขวา - รายละเอียดผู้ติดต่อ */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">รายละเอียดผู้ติดต่อ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">สถานะ:</Label>
                    <Select name="status" defaultValue="ปกติ">
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

                  <div className="space-y-2">
                    <Label htmlFor="address">Address (ที่อยู่):</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="ที่อยู่สำนักงาน/บ้าน"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="province">จังหวัด:</Label>
                      <Input
                        id="province"
                        name="province"
                        placeholder="จังหวัด"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">อำเภอ:</Label>
                      <Input
                        id="district"
                        name="district"
                        placeholder="อำเภอ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sub_district">ตำบล:</Label>
                      <Input
                        id="sub_district"
                        name="sub_district"
                        placeholder="ตำบล"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">postcode (รหัสไปรษณีย์):</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        placeholder="รหัสไปรษณีย์"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">ข้อมูลธนาคาร</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">ธนาคาร:</Label>
                    <Select name="bank_name">
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกธนาคาร" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ</SelectItem>
                        <SelectItem value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย</SelectItem>
                        <SelectItem value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์</SelectItem>
                        <SelectItem value="ธนาคารกรุงไทย">ธนาคารกรุงไทย</SelectItem>
                        <SelectItem value="ธนาคารทหารไทย">ธนาคารทหารไทย</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_account">เลขที่บัญชี:</Label>
                    <Input
                      id="bank_account"
                      name="bank_account"
                      placeholder="เลขที่บัญชี"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_branch">สาขา:</Label>
                    <Input
                      id="bank_branch"
                      name="bank_branch"
                      placeholder="สาขา"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swift_code">Swift Code:</Label>
                    <Input
                      id="swift_code"
                      name="swift_code"
                      placeholder="Swift Code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_address">ที่อยู่ธนาคาร:</Label>
                    <Textarea
                      id="bank_address"
                      name="bank_address"
                      placeholder="ที่อยู่ธนาคาร"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">ข้อมูลเพิ่มเติม</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>แนบไฟล์:</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">คลิกเพื่อเลือกไฟล์หรือ QR code ที่ต้องการแนบ</p>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">หมายเหตุ:</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="หมายเหตุเพิ่มเติม"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
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