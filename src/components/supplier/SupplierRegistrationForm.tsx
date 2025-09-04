import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Building2, MapPin, Phone, Mail, Globe, FileText, Shield, Award } from "lucide-react";

const supplierRegistrationSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อบริษัท"),
  supplier_code: z.string().optional(),
  business_registration_number: z.string().min(1, "กรุณากรอกเลขทะเบียนบริษัท"),
  business_type: z.string().min(1, "กรุณาเลือกประเภทธุรกิจ"),
  established_year: z.number().min(1900).max(new Date().getFullYear()),
  
  // Contact Information
  contact_person: z.string().min(1, "กรุณากรอกชื่อผู้ติดต่อ"),
  phone: z.string().min(1, "กรุณากรอกเบอร์โทร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  website: z.string().optional(),
  
  // Address
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
  supplier_country: z.string().min(1, "กรุณาเลือกประเทศ"),
  
  // Banking Information
  bank_name: z.string().min(1, "กรุณากรอกชื่อธนาคาร"),
  bank_account: z.string().min(1, "กรุณากรอกเลขบัญชี"),
  swift_code: z.string().optional(),
  bank_address: z.string().optional(),
  
  // Business Information
  main_products: z.array(z.string()).min(1, "กรุณาระบุสินค้าหลักอย่างน้อย 1 รายการ"),
  certifications: z.array(z.string()).optional(),
  
  supplier_notes: z.string().optional(),
});

type SupplierRegistrationData = z.infer<typeof supplierRegistrationSchema>;

interface SupplierRegistrationFormProps {
  editingSupplier?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SupplierRegistrationForm({
  editingSupplier,
  onSuccess,
  onCancel,
}: SupplierRegistrationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainProducts, setMainProducts] = useState<string[]>(
    editingSupplier?.main_products || [""]
  );
  const [certifications, setCertifications] = useState<string[]>(
    editingSupplier?.certifications || [""]
  );

  const form = useForm<SupplierRegistrationData>({
    resolver: zodResolver(supplierRegistrationSchema),
    defaultValues: editingSupplier ? {
      name: editingSupplier.name || "",
      supplier_code: editingSupplier.supplier_code || "",
      business_registration_number: editingSupplier.business_registration_number || "",
      business_type: editingSupplier.business_type || "",
      established_year: editingSupplier.established_year || new Date().getFullYear(),
      contact_person: editingSupplier.contact_person || "",
      phone: editingSupplier.phone || "",
      email: editingSupplier.email || "",
      website: editingSupplier.website || "",
      address: editingSupplier.address || "",
      supplier_country: editingSupplier.supplier_country || "",
      bank_name: editingSupplier.bank_name || "",
      bank_account: editingSupplier.bank_account || "",
      swift_code: editingSupplier.swift_code || "",
      bank_address: editingSupplier.bank_address || "",
      main_products: editingSupplier.main_products || [""],
      certifications: editingSupplier.certifications || [],
      supplier_notes: editingSupplier.supplier_notes || "",
    } : {
      name: "",
      supplier_code: "",
      business_registration_number: "",
      business_type: "",
      established_year: new Date().getFullYear(),
      contact_person: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      supplier_country: "",
      bank_name: "",
      bank_account: "",
      swift_code: "",
      bank_address: "",
      main_products: [""],
      certifications: [],
      supplier_notes: "",
    },
  });

  const businessTypes = [
    "Manufacturing", "Trading", "Service Provider", "Technology", "Consulting", 
    "Import/Export", "Retail", "Wholesale", "Distribution", "Other"
  ];

  const countries = [
    "China", "Japan", "South Korea", "Taiwan", "Singapore", "Malaysia", 
    "Vietnam", "Philippines", "Indonesia", "India", "Germany", "United States", 
    "United Kingdom", "Italy", "Other"
  ];

  const addMainProduct = () => {
    setMainProducts([...mainProducts, ""]);
  };

  const removeMainProduct = (index: number) => {
    const newProducts = mainProducts.filter((_, i) => i !== index);
    setMainProducts(newProducts);
    form.setValue("main_products", newProducts.filter(p => p.trim() !== ""));
  };

  const updateMainProduct = (index: number, value: string) => {
    const newProducts = [...mainProducts];
    newProducts[index] = value;
    setMainProducts(newProducts);
    form.setValue("main_products", newProducts.filter(p => p.trim() !== ""));
  };

  const addCertification = () => {
    setCertifications([...certifications, ""]);
  };

  const removeCertification = (index: number) => {
    const newCerts = certifications.filter((_, i) => i !== index);
    setCertifications(newCerts);
    form.setValue("certifications", newCerts.filter(c => c.trim() !== ""));
  };

  const updateCertification = (index: number, value: string) => {
    const newCerts = [...certifications];
    newCerts[index] = value;
    setCertifications(newCerts);
    form.setValue("certifications", newCerts.filter(c => c.trim() !== ""));
  };

  const onSubmit = async (data: SupplierRegistrationData) => {
    if (!user) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเข้าสู่ระบบก่อน",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        name: data.name,
        supplier_code: data.supplier_code,
        business_registration_number: data.business_registration_number,
        business_type: data.business_type,
        established_year: data.established_year,
        contact_person: data.contact_person,
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        supplier_country: data.supplier_country,
        bank_name: data.bank_name,
        bank_account: data.bank_account,
        swift_code: data.swift_code,
        bank_address: data.bank_address,
        supplier_notes: data.supplier_notes,
        customer_type: "ผู้จัดจำหน่าย",
        supplier_registration_status: editingSupplier ? editingSupplier.supplier_registration_status : "pending",
        supplier_application_date: editingSupplier ? editingSupplier.supplier_application_date : new Date().toISOString(),
        created_by: user.id,
        main_products: data.main_products.filter(p => p.trim() !== ""),
        certifications: data.certifications?.filter(c => c.trim() !== "") || [],
      };

      if (editingSupplier) {
        const { error } = await supabase
          .from("customers")
          .update(submitData)
          .eq("id", editingSupplier.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("customers")
          .insert([submitData]);

        if (error) throw error;
      }

      toast({
        title: "สำเร็จ",
        description: editingSupplier 
          ? "แก้ไขข้อมูล Supplier เรียบร้อยแล้ว" 
          : "ลงทะเบียน Supplier เรียบร้อยแล้ว รอการอนุมัติ",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error submitting supplier registration:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      pending: "outline",
      approved: "default",
      rejected: "destructive"
    } as const;

    const labels = {
      draft: "ร่าง",
      pending: "รอการอนุมัติ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธ"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Display */}
        {editingSupplier && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  สถานะการสมัคร
                </CardTitle>
                {getStatusBadge(editingSupplier.supplier_registration_status)}
              </div>
              {editingSupplier.supplier_rejection_reason && (
                <CardDescription className="text-destructive">
                  เหตุผลการปฏิเสธ: {editingSupplier.supplier_rejection_reason}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        )}

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              ข้อมูลบริษัท
            </CardTitle>
            <CardDescription>ข้อมูลพื้นฐานของบริษัท</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อบริษัท *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัส Supplier</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="จะสร้างอัตโนมัติถ้าไม่กรอก" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="business_registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เลขทะเบียนบริษัท *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ประเภทธุรกิจ *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="established_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ปีที่ก่อตั้ง *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    เว็บไซต์
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://www.example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              ข้อมูลการติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อผู้ติดต่อ *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทร *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    อีเมล *
                  </FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      ที่อยู่ *
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ประเทศ *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเทศ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Banking Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลธนาคาร</CardTitle>
            <CardDescription>สำหรับการโอนเงิน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อธนาคาร *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เลขบัญชี *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="swift_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SWIFT Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ที่อยู่ธนาคาร</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Products & Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              ผลิตภัณฑ์และใบรับรอง
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Products */}
            <div className="space-y-4">
              <Label>สินค้าหลัก *</Label>
              {mainProducts.map((product, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={product}
                    onChange={(e) => updateMainProduct(index, e.target.value)}
                    placeholder="ระบุสินค้าหลัก"
                  />
                  {mainProducts.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeMainProduct(index)}
                    >
                      ลบ
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addMainProduct}>
                + เพิ่มสินค้า
              </Button>
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <Label>ใบรับรอง (ถ้ามี)</Label>
              {certifications.map((cert, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={cert}
                    onChange={(e) => updateCertification(index, e.target.value)}
                    placeholder="เช่น ISO 9001, CE, FDA"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeCertification(index)}
                  >
                    ลบ
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addCertification}>
                + เพิ่มใบรับรอง
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              หมายเหตุเพิ่มเติม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="supplier_notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="หมายเหตุเพิ่มเติม..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? "กำลังบันทึก..." 
              : editingSupplier 
                ? "บันทึกการแก้ไข" 
                : "ลงทะเบียน"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}