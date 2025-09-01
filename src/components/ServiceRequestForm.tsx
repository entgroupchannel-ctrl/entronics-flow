import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, MapPin, Wrench, AlertTriangle } from "lucide-react";

interface ServiceRequestFormProps {
  formData: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    customer_address: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    problem_description: string;
    priority: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ServiceRequestForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: ServiceRequestFormProps) {
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <User className="h-5 w-5" />
            ข้อมูลลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ชื่อลูกค้า *
              </Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="กรุณากรอกชื่อลูกค้า"
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                เบอร์โทรศัพท์ *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  placeholder="080-000-0000"
                  className="pl-10 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer_email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              อีเมล
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                placeholder="example@email.com"
                className="pl-10 bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <MapPin className="h-5 w-5" />
            ที่อยู่ในการให้บริการ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="customer_address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ที่อยู่เต็ม
            </Label>
            <Textarea
              id="customer_address"
              value={formData.customer_address}
              onChange={(e) => handleInputChange('customer_address', e.target.value)}
              placeholder="ที่อยู่, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
              rows={3}
              className="bg-white dark:bg-gray-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Wrench className="h-5 w-5" />
            ข้อมูลอุปกรณ์
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ประเภทอุปกรณ์ *
              </Label>
              <Select value={formData.device_type} onValueChange={(value) => handleInputChange('device_type', value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800">
                  <SelectValue placeholder="เลือกประเภทอุปกรณ์" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartphone">สมาร์ทโฟน</SelectItem>
                  <SelectItem value="tablet">แท็บเล็ต</SelectItem>
                  <SelectItem value="laptop">แล็ปท็อป</SelectItem>
                  <SelectItem value="desktop">คอมพิวเตอร์ตั้งโต๊ะ</SelectItem>
                  <SelectItem value="printer">เครื่องปริ้นท์</SelectItem>
                  <SelectItem value="camera">กล้อง</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="device_brand" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ยี่ห้อ
              </Label>
              <Input
                id="device_brand"
                value={formData.device_brand}
                onChange={(e) => handleInputChange('device_brand', e.target.value)}
                placeholder="เช่น Apple, Samsung"
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device_model" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                รุ่น
              </Label>
              <Input
                id="device_model"
                value={formData.device_model}
                onChange={(e) => handleInputChange('device_model', e.target.value)}
                placeholder="เช่น iPhone 15, Galaxy S24"
                className="bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem Description */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <AlertTriangle className="h-5 w-5" />
            รายละเอียดปัญหา
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="problem_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              อาการเสีย / ปัญหาที่พบ *
            </Label>
            <Textarea
              id="problem_description"
              value={formData.problem_description}
              onChange={(e) => handleInputChange('problem_description', e.target.value)}
              placeholder="กรุณาอธิบายปัญหาโดยละเอียด เช่น หน้าจอแตก, เปิดไม่ติด, ช้า"
              rows={4}
              className="bg-white dark:bg-gray-800"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ความเร่งด่วน
            </Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="เลือกระดับความเร่งด่วน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">ปกติ</SelectItem>
                <SelectItem value="medium">ปานกลาง</SelectItem>
                <SelectItem value="high">สูง</SelectItem>
                <SelectItem value="urgent">เร่งด่วน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          ยกเลิก
        </Button>
        <Button onClick={onSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? "กำลังบันทึก..." : "บันทึกแจ้งซ่อม"}
        </Button>
      </div>
    </div>
  );
}