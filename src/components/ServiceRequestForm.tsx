import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Phone, Mail, MapPin, Wrench, AlertTriangle, Package, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    service_type?: string;
    needs_onsite_service?: boolean;
    estimated_cost?: string;
    warranty_status?: string;
    urgency_reason?: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface DatabaseItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  sku?: string;
}

interface DeviceType {
  id: string;
  name: string;
}

interface DeviceBrand {
  id: string;
  name: string;
}

interface DeviceModel {
  id: string;
  name: string;
  brand_id?: string;
}

export function ServiceRequestForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: ServiceRequestFormProps) {
  const [products, setProducts] = useState<DatabaseItem[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [deviceBrands, setDeviceBrands] = useState<DeviceBrand[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [isCustomDevice, setIsCustomDevice] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      console.log('Starting to fetch dropdown data...');
      
      // Fetch products from inventory
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, brand, category, sku')
        .eq('status', 'In Stock')
        .order('name');
      
      if (productsError) {
        console.error('Products fetch error:', productsError);
      } else {
        console.log('Products fetched:', productsData?.length);
        if (productsData) setProducts(productsData);
      }

      // For now, use hardcoded data to prevent loading issues
      // TODO: Replace with database queries once stable
      const hardcodedTypes = [
        { id: '1', name: 'สมาร์ทโฟน' },
        { id: '2', name: 'แท็บเล็ต' },
        { id: '3', name: 'แล็ปท็อป' },
        { id: '4', name: 'คอมพิวเตอร์' },
        { id: '5', name: 'เครื่องปริ้นท์' },
        { id: '6', name: 'กล้อง' },
        { id: '7', name: 'อื่นๆ' }
      ];

      const hardcodedBrands = [
        { id: '1', name: 'Apple' },
        { id: '2', name: 'Samsung' },
        { id: '3', name: 'Huawei' },
        { id: '4', name: 'Dell' },
        { id: '5', name: 'HP' },
        { id: '6', name: 'Canon' },
        { id: '7', name: 'Sony' }
      ];

      setDeviceTypes(hardcodedTypes);
      setDeviceBrands(hardcodedBrands);
      setDeviceModels([]); // Empty for now
      
      console.log('Dropdown data loaded successfully');
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      
      // Fallback to minimal data
      setDeviceTypes([{ id: '1', name: 'อื่นๆ' }]);
      setDeviceBrands([{ id: '1', name: 'อื่นๆ' }]);
      setDeviceModels([]);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      handleInputChange('device_type', product.category || 'other');
      handleInputChange('device_brand', product.brand || '');
      handleInputChange('device_model', product.name || '');
    }
  };

  const filteredModels = deviceModels.filter(model => {
    const selectedBrand = deviceBrands.find(brand => brand.name === formData.device_brand);
    return selectedBrand ? model.brand_id === selectedBrand.id : true;
  });

  return (
    <div className="space-y-6">
      {/* Service Type Selection */}
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
            <Truck className="h-5 w-5" />
            ประเภทการให้บริการ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            value={formData.service_type || "send_in"} 
            onValueChange={(value) => handleInputChange('service_type', value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
              <RadioGroupItem value="send_in" id="send_in" />
              <Label htmlFor="send_in" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">ส่งเข้าซ่อม</div>
                    <div className="text-sm text-gray-500">ลูกค้าส่งอุปกรณ์มาที่ศูนย์บริการ</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors">
              <RadioGroupItem value="onsite" id="onsite" />
              <Label htmlFor="onsite" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">บริการนอกสถานที่</div>
                    <div className="text-sm text-gray-500">ช่างออกไปซ่อมที่ลูกค้า</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {formData.service_type === "onsite" && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">หมายเหตุการบริการนอกสถานที่</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                สำหรับบริการนอกสถานที่ อาจมีค่าใช้จ่ายในการเดินทางเพิ่มเติม และจะมีการประเมินความเป็นไปได้ก่อนยืนยันการบริการ
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
            {formData.service_type === "onsite" ? "ที่อยู่ในการให้บริการ" : "ที่อยู่ติดต่อ"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="customer_address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ที่อยู่เต็ม {formData.service_type === "onsite" ? "*" : ""}
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

      {/* Device/Product Selection */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Wrench className="h-5 w-5" />
            ข้อมูลอุปกรณ์
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product from inventory selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              เลือกจากสินค้าในคลัง (ถ้ามี)
            </Label>
            <Select value={selectedProduct} onValueChange={handleProductSelect}>
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="เลือกสินค้าจากคลัง..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 max-h-60">
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      <span className="text-xs text-gray-500">{product.brand} - {product.category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="custom_device" 
              checked={isCustomDevice}
              onCheckedChange={(checked) => setIsCustomDevice(checked === true)}
            />
            <Label htmlFor="custom_device" className="text-sm text-gray-600">
              กรอกข้อมูลอุปกรณ์เอง (สำหรับอุปกรณ์ที่ไม่มีในคลัง)
            </Label>
          </div>

          {(isCustomDevice || selectedProduct === "") && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="device_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ประเภทอุปกรณ์ *
                </Label>
                <Select value={formData.device_type} onValueChange={(value) => handleInputChange('device_type', value)}>
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue placeholder="เลือกประเภทอุปกรณ์" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                    {deviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                    ))}
                    <SelectItem value="other">อื่นๆ (ระบุ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="device_brand" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ยี่ห้อ
                </Label>
                <Select value={formData.device_brand} onValueChange={(value) => handleInputChange('device_brand', value)}>
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue placeholder="เลือกยี่ห้อ" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                    {deviceBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                    ))}
                    <SelectItem value="other">อื่นๆ (พิมพ์เอง)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.device_brand === "other" && (
                  <Input
                    placeholder="ระบุยี่ห้อ"
                    value={formData.device_brand === "other" ? "" : formData.device_brand}
                    onChange={(e) => handleInputChange('device_brand', e.target.value)}
                    className="mt-2 bg-white dark:bg-gray-800"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="device_model" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  รุ่น
                </Label>
                <Select value={formData.device_model} onValueChange={(value) => handleInputChange('device_model', value)}>
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue placeholder="เลือกรุ่น" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                    {filteredModels.map((model) => (
                      <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                    ))}
                    <SelectItem value="other">อื่นๆ (พิมพ์เอง)</SelectItem>
                  </SelectContent>
                </Select>
                {(formData.device_model === "other" || filteredModels.length === 0) && (
                  <Input
                    placeholder="ระบุรุ่น"
                    value={formData.device_model === "other" ? "" : formData.device_model}
                    onChange={(e) => handleInputChange('device_model', e.target.value)}
                    className="mt-2 bg-white dark:bg-gray-800"
                  />
                )}
              </div>
            </div>
          )}

          {/* Warranty Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              สถานะการรับประกัน
            </Label>
            <RadioGroup 
              value={formData.warranty_status || "unknown"} 
              onValueChange={(value) => handleInputChange('warranty_status', value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="under_warranty" id="under_warranty" />
                <Label htmlFor="under_warranty">ยังอยู่ในประกัน</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="out_of_warranty" id="out_of_warranty" />
                <Label htmlFor="out_of_warranty">หมดประกันแล้ว</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unknown" id="unknown" />
                <Label htmlFor="unknown">ไม่ทราบ</Label>
              </div>
            </RadioGroup>
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
              placeholder="กรุณาอธิบายปัญหาโดยละเอียด เช่น หน้าจอแตก, เปิดไม่ติด, ช้า, ใช้งานผิดปกติ"
              rows={4}
              className="bg-white dark:bg-gray-800"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ความเร่งด่วน *
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800">
                  <SelectValue placeholder="เลือกระดับความเร่งด่วน" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                  <SelectItem value="low">ปกติ (3-5 วันทำการ)</SelectItem>
                  <SelectItem value="medium">ปานกลาง (1-2 วันทำการ)</SelectItem>
                  <SelectItem value="high">สูง (ภายในวันเดียว)</SelectItem>
                  <SelectItem value="urgent">เร่งด่วน (ภายใน 4 ชั่วโมง)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_cost" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                งบประมาณซ่อม (ถ้าทราบ)
              </Label>
              <Input
                id="estimated_cost"
                value={formData.estimated_cost || ""}
                onChange={(e) => handleInputChange('estimated_cost', e.target.value)}
                placeholder="เช่น 1000-2000 บาท"
                className="bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {(formData.priority === "high" || formData.priority === "urgent") && (
            <div className="space-y-2">
              <Label htmlFor="urgency_reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                เหตุผลความเร่งด่วน
              </Label>
              <Textarea
                id="urgency_reason"
                value={formData.urgency_reason || ""}
                onChange={(e) => handleInputChange('urgency_reason', e.target.value)}
                placeholder="กรุณาระบุเหตุผลที่ต้องการซ่อมด่วน"
                rows={2}
                className="bg-white dark:bg-gray-800"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          ยกเลิก
        </Button>
        <Button onClick={onSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? "กำลังบันทึก..." : 
           formData.service_type === "onsite" ? "ขอบริการนอกสถานที่" : "บันทึกแจ้งซ่อม"}
        </Button>
      </div>
    </div>
  );
}