import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const serviceRequestSchema = z.object({
  customerName: z.string().min(1, "กรุณาระบุชื่อ"),
  customerPhone: z.string().min(10, "กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง"),
  customerEmail: z.string().email("กรุณาระบุอีเมลที่ถูกต้อง"),
  customerAddress: z.string().min(10, "กรุณาระบุที่อยู่"),
  deviceTypeId: z.string().min(1, "กรุณาเลือกประเภทอุปกรณ์"),
  deviceBrandId: z.string().min(1, "กรุณาเลือกยี่ห้อ"),
  deviceModelId: z.string().min(1, "กรุณาเลือกรุ่น"),
  problemDescription: z.string().min(10, "กรุณาอธิบายปัญหาอย่างละเอียด"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

interface DeviceType {
  id: string;
  name: string;
  description?: string;
}

interface DeviceBrand {
  id: string;
  name: string;
  description?: string;
}

interface DeviceModel {
  id: string;
  name: string;
  brand_id: string;
  type_id: string;
  description?: string;
}

export default function ServiceRequest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [ticketNumber, setTicketNumber] = useState<string>("");
  
  // Device options state
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [deviceBrands, setDeviceBrands] = useState<DeviceBrand[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<DeviceModel[]>([]);
  
  // Add new item states
  const [showAddType, setShowAddType] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const form = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  const selectedTypeId = form.watch("deviceTypeId");
  const selectedBrandId = form.watch("deviceBrandId");

  useEffect(() => {
    fetchDeviceOptions();
  }, []);

  useEffect(() => {
    // Filter models based on selected type and brand
    if (selectedTypeId && selectedBrandId) {
      const filtered = deviceModels.filter(
        model => model.type_id === selectedTypeId && model.brand_id === selectedBrandId
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels([]);
    }
    // Reset model selection when type or brand changes
    form.setValue("deviceModelId", "");
  }, [selectedTypeId, selectedBrandId, deviceModels, form]);

  const fetchDeviceOptions = async () => {
    try {
      const [typesRes, brandsRes, modelsRes] = await Promise.all([
        supabase.from('device_types').select('*').eq('is_active', true).order('name'),
        supabase.from('device_brands').select('*').eq('is_active', true).order('name'),
        supabase.from('device_models').select('*').eq('is_active', true).order('name')
      ]);

      if (typesRes.data) setDeviceTypes(typesRes.data);
      if (brandsRes.data) setDeviceBrands(brandsRes.data);
      if (modelsRes.data) setDeviceModels(modelsRes.data);
    } catch (error) {
      console.error('Error fetching device options:', error);
    }
  };

  const addNewDeviceType = async () => {
    if (!newItemName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('device_types')
        .insert({ name: newItemName.trim() })
        .select()
        .single();

      if (error) throw error;

      setDeviceTypes(prev => [...prev, data]);
      form.setValue("deviceTypeId", data.id);
      setNewItemName("");
      setShowAddType(false);
      toast({ title: "เพิ่มประเภทอุปกรณ์สำเร็จ" });
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addNewDeviceBrand = async () => {
    if (!newItemName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('device_brands')
        .insert({ name: newItemName.trim() })
        .select()
        .single();

      if (error) throw error;

      setDeviceBrands(prev => [...prev, data]);
      form.setValue("deviceBrandId", data.id);
      setNewItemName("");
      setShowAddBrand(false);
      toast({ title: "เพิ่มยี่ห้อสำเร็จ" });
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addNewDeviceModel = async () => {
    if (!newItemName.trim() || !selectedTypeId || !selectedBrandId) return;
    
    try {
      const { data, error } = await supabase
        .from('device_models')
        .insert({ 
          name: newItemName.trim(),
          type_id: selectedTypeId,
          brand_id: selectedBrandId
        })
        .select()
        .single();

      if (error) throw error;

      setDeviceModels(prev => [...prev, data]);
      form.setValue("deviceModelId", data.id);
      setNewItemName("");
      setShowAddModel(false);
      toast({ title: "เพิ่มรุ่นสำเร็จ" });
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files).filter(file => file.type.startsWith('image/'));
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    
    setUploadedImages(prev => [...prev, ...newImages]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ServiceRequestForm) => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบเพื่อสร้างคำขอซ่อม",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get device details for storage
      const selectedType = deviceTypes.find(t => t.id === data.deviceTypeId);
      const selectedBrand = deviceBrands.find(b => b.id === data.deviceBrandId);
      const selectedModel = deviceModels.find(m => m.id === data.deviceModelId);

      // Insert service request
      const { data: serviceRequest, error } = await supabase
        .from('service_requests')
        .insert({
          ticket_number: '', // Will be auto-generated by trigger
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          customer_email: data.customerEmail,
          customer_address: data.customerAddress,
          device_type: selectedType?.name || '',
          device_brand: selectedBrand?.name || '',
          device_model: selectedModel?.name || '',
          problem_description: data.problemDescription,
          priority: data.priority,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTicketNumber(serviceRequest.ticket_number);

      // Upload images if any
      if (uploadedImages.length > 0) {
        await supabase.functions.invoke('upload-service-images', {
          body: {
            serviceRequestId: serviceRequest.id,
            images: await Promise.all(
              uploadedImages.map(async (file) => ({
                base64: await fileToBase64(file),
                filename: file.name,
                mimeType: file.type,
              }))
            ),
          },
        });
      }

      // Send confirmation email
      await supabase.functions.invoke('send-service-confirmation', {
        body: {
          serviceRequest,
          customerEmail: data.customerEmail,
        },
      });

      // Auto-assign technician
      await supabase.rpc('auto_assign_technician', {
        request_id: serviceRequest.id,
      });

      toast({
        title: "สร้างคำขอซ่อมสำเร็จ!",
        description: `หมายเลขใบซ่อม: ${serviceRequest.ticket_number}`,
      });

      // Reset form
      form.reset();
      setUploadedImages([]);
      setPreviewUrls([]);
      
    } catch (error: any) {
      console.error('Error creating service request:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้างคำขอซ่อมได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  if (ticketNumber) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-2xl">
          <Card className="border-success">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-success">
                ✅ แจ้งซ่อมเรียบร้อยแล้ว
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">
                {ticketNumber}
              </div>
              <p className="text-muted-foreground">
                หมายเลขใบซ่อมของคุณ
              </p>
              <p className="text-sm text-muted-foreground">
                เราได้ส่งอีเมลยืนยันไปยังที่อยู่อีเมลของคุณแล้ว<br />
                ทีมช่างจะติดต่อกลับภายใน 24 ชั่วโมง
              </p>
              <Button 
                onClick={() => {
                  setTicketNumber("");
                  window.location.reload();
                }}
                className="mt-6"
              >
                แจ้งซ่อมใหม่
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">แจ้งซ่อมออนไลน์</CardTitle>
            <p className="text-muted-foreground">
              กรุณากรอกข้อมูลให้ครบถ้วนเพื่อให้เราสามารถให้บริการได้อย่างรวดเร็ว
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อ-นามสกุล *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="กรุณาระบุชื่อ-นามสกุล" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เบอร์โทรศัพท์ *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="08X-XXX-XXXX" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>อีเมล *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="your@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ความเร่งด่วน</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกความเร่งด่วน" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">ปกติ</SelectItem>
                            <SelectItem value="medium">ปานกลาง</SelectItem>
                            <SelectItem value="high">สูง</SelectItem>
                            <SelectItem value="urgent">เร่งด่วนมาก</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ที่อยู่ *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="ระบุที่อยู่สำหรับติดต่อหรือส่งมอบ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="deviceTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ประเภทอุปกรณ์ *</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกประเภทอุปกรณ์" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {deviceTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Dialog open={showAddType} onOpenChange={setShowAddType}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="icon">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>เพิ่มประเภทอุปกรณ์ใหม่</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  placeholder="ชื่อประเภทอุปกรณ์"
                                />
                                <div className="flex gap-2">
                                  <Button onClick={addNewDeviceType}>เพิ่ม</Button>
                                  <Button variant="outline" onClick={() => setShowAddType(false)}>
                                    ยกเลิก
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deviceBrandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ยี่ห้อ *</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกยี่ห้อ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {deviceBrands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Dialog open={showAddBrand} onOpenChange={setShowAddBrand}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="icon">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>เพิ่มยี่ห้อใหม่</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  placeholder="ชื่อยี่ห้อ"
                                />
                                <div className="flex gap-2">
                                  <Button onClick={addNewDeviceBrand}>เพิ่ม</Button>
                                  <Button variant="outline" onClick={() => setShowAddBrand(false)}>
                                    ยกเลิก
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deviceModelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รุ่น *</FormLabel>
                        <div className="flex gap-2">
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!selectedTypeId || !selectedBrandId}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกรุ่น" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredModels.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Dialog open={showAddModel} onOpenChange={setShowAddModel}>
                            <DialogTrigger asChild>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                disabled={!selectedTypeId || !selectedBrandId}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>เพิ่มรุ่นใหม่</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  placeholder="ชื่อรุ่น"
                                />
                                <div className="flex gap-2">
                                  <Button onClick={addNewDeviceModel}>เพิ่ม</Button>
                                  <Button variant="outline" onClick={() => setShowAddModel(false)}>
                                    ยกเลิก
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="problemDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อธิบายปัญหา *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="อธิบายปัญหาที่พบและอาการต่างๆ ให้ละเอียดที่สุด"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Label>รูปภาพประกอบ (ไม่บังคับ)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <div className="text-center space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        ลากไฟล์มาวางที่นี่ หรือ
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        <label className="cursor-pointer">
                          เลือกรูปภาพ
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleImageUpload(e.target.files)}
                          />
                        </label>
                      </Button>
                    </div>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังส่งคำขอ..." : "ส่งคำขอซ่อม"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}