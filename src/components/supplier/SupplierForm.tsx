import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const supplierFormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ Supplier"),
  supplier_code: z.string().optional(),
  supplier_category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  supplier_country: z.string().min(1, "กรุณากรอกประเทศ"),
  supplier_currency: z.string().default("USD"),
  
  // Contact Information
  contact_person: z.string().optional(),
  contact_person_finance: z.string().optional(),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  contact_email_finance: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  phone: z.string().optional(),
  contact_phone_finance: z.string().optional(),
  address: z.string().optional(),
  
  // Banking Information
  bank_name: z.string().min(1, "กรุณากรอกชื่อธนาคาร"),
  bank_account: z.string().min(1, "กรุณากรอกเลขที่บัญชี"),
  banking_swift_code: z.string().optional(),
  banking_correspondent_bank: z.string().optional(),
  banking_routing_number: z.string().optional(),
  banking_iban: z.string().optional(),
  bank_address: z.string().optional(),
  
  // Business Terms
  payment_terms: z.string().optional(),
  minimum_order_amount: z.number().optional(),
  credit_limit: z.number().optional(),
  preferred_payment_method: z.string().optional(),
  
  // Ratings and Status
  quality_rating: z.number().min(1).max(5).optional(),
  delivery_rating: z.number().min(1).max(5).optional(),
  price_rating: z.number().min(1).max(5).optional(),
  compliance_status: z.string().default("pending"),
  is_preferred_supplier: z.boolean().default(false),
  
  // Additional Information
  tax_id: z.string().optional(),
  citizen_id: z.string().optional(),
  supplier_notes: z.string().optional(),
  tax_certificate_url: z.string().optional(),
  business_license_url: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  editingSupplier?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SupplierForm({
  editingSupplier,
  onSuccess,
  onCancel,
}: SupplierFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: editingSupplier ? {
      name: editingSupplier.name || "",
      supplier_code: editingSupplier.supplier_code || "",
      supplier_category: editingSupplier.supplier_category || "",
      supplier_country: editingSupplier.supplier_country || "",
      supplier_currency: editingSupplier.supplier_currency || "USD",
      contact_person: editingSupplier.contact_person || "",
      contact_person_finance: editingSupplier.contact_person_finance || "",
      email: editingSupplier.email || "",
      contact_email_finance: editingSupplier.contact_email_finance || "",
      phone: editingSupplier.phone || "",
      contact_phone_finance: editingSupplier.contact_phone_finance || "",
      address: editingSupplier.address || "",
      bank_name: editingSupplier.bank_name || "",
      bank_account: editingSupplier.bank_account || "",
      banking_swift_code: editingSupplier.banking_swift_code || "",
      banking_correspondent_bank: editingSupplier.banking_correspondent_bank || "",
      banking_routing_number: editingSupplier.banking_routing_number || "",
      banking_iban: editingSupplier.banking_iban || "",
      bank_address: editingSupplier.bank_address || "",
      payment_terms: editingSupplier.payment_terms || "",
      minimum_order_amount: editingSupplier.minimum_order_amount || 0,
      credit_limit: editingSupplier.credit_limit || 0,
      preferred_payment_method: editingSupplier.preferred_payment_method || "",
      quality_rating: editingSupplier.quality_rating || undefined,
      delivery_rating: editingSupplier.delivery_rating || undefined,
      price_rating: editingSupplier.price_rating || undefined,
      compliance_status: editingSupplier.compliance_status || "pending",
      is_preferred_supplier: editingSupplier.is_preferred_supplier || false,
      tax_id: editingSupplier.tax_id || "",
      citizen_id: editingSupplier.citizen_id || "",
      supplier_notes: editingSupplier.supplier_notes || "",
      tax_certificate_url: editingSupplier.tax_certificate_url || "",
      business_license_url: editingSupplier.business_license_url || "",
    } : {
      name: "",
      supplier_code: "",
      supplier_category: "",
      supplier_country: "",
      supplier_currency: "USD",
      contact_person: "",
      contact_person_finance: "",
      email: "",
      contact_email_finance: "",
      phone: "",
      contact_phone_finance: "",
      address: "",
      bank_name: "",
      bank_account: "",
      banking_swift_code: "",
      banking_correspondent_bank: "",
      banking_routing_number: "",
      banking_iban: "",
      bank_address: "",
      payment_terms: "",
      minimum_order_amount: 0,
      credit_limit: 0,
      preferred_payment_method: "",
      quality_rating: undefined,
      delivery_rating: undefined,
      price_rating: undefined,
      compliance_status: "pending",
      is_preferred_supplier: false,
      tax_id: "",
      citizen_id: "",
      supplier_notes: "",
      tax_certificate_url: "",
      business_license_url: "",
    },
  });

  // Query for supplier categories
  const { data: categories } = useQuery({
    queryKey: ["supplier-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const countries = [
    { value: "จีน", label: "จีน" },
    { value: "ญี่ปุ่น", label: "ญี่ปุ่น" },
    { value: "เกาหลีใต้", label: "เกาหลีใต้" },
    { value: "สิงคโปร์", label: "สิงคโปร์" },
    { value: "ไต้หวัน", label: "ไต้หวัน" },
    { value: "มาเลเซีย", label: "มาเลเซีย" },
    { value: "อินเดีย", label: "อินเดีย" },
    { value: "สหรัฐอเมริกา", label: "สหรัฐอเมริกา" },
    { value: "เยอรมนี", label: "เยอรมนี" },
    { value: "อิตาลี", label: "อิตาลี" },
  ];

  const currencies = [
    { value: "USD", label: "USD - ดอลลาร์สหรัฐ" },
    { value: "EUR", label: "EUR - ยูโร" },
    { value: "GBP", label: "GBP - ปอนด์อังกฤษ" },
    { value: "JPY", label: "JPY - เยนญี่ปุ่น" },
    { value: "CNY", label: "CNY - หยวนจีน" },
    { value: "SGD", label: "SGD - ดอลลาร์สิงคโปร์" },
    { value: "KRW", label: "KRW - วอนเกาหลี" },
    { value: "MYR", label: "MYR - ริงกิตมาเลเซีย" },
    { value: "THB", label: "THB - บาทไทย" },
  ];

  const paymentMethods = [
    { value: "wire_transfer", label: "Wire Transfer" },
    { value: "swift", label: "SWIFT" },
    { value: "letter_of_credit", label: "Letter of Credit (L/C)" },
    { value: "documentary_collection", label: "Documentary Collection" },
    { value: "telegraphic_transfer", label: "Telegraphic Transfer (T/T)" },
  ];

  const complianceStatuses = [
    { value: "pending", label: "รอการตรวจสอบ" },
    { value: "approved", label: "อนุมัติแล้ว" },
    { value: "rejected", label: "ไม่อนุมัติ" },
    { value: "under_review", label: "กำลังตรวจสอบ" },
    { value: "suspended", label: "ระงับชั่วคราว" },
  ];

  const onSubmit = async (data: SupplierFormData) => {
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
        ...data,
        customer_type: "ผู้จำหน่าย",
        created_by: editingSupplier ? editingSupplier.created_by : user.id,
      };

      if (editingSupplier) {
        const { error } = await supabase
          .from("customers")
          .update(submitData)
          .eq("id", editingSupplier.id);

        if (error) throw error;
      } else {
        const insertData: any = submitData;
        const { error } = await supabase
          .from("customers")
          .insert([insertData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error submitting supplier:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูล Supplier ได้: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = ({ rating, onRatingChange }: { rating?: number, onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer ${
              star <= (rating || 0) 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
            onClick={() => onRatingChange(star)}
          />
        ))}
        {rating && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRatingChange(0)}
            className="ml-2 text-xs"
          >
            ล้าง
          </Button>
        )}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
            <TabsTrigger value="contact">ข้อมูลติดต่อ</TabsTrigger>
            <TabsTrigger value="banking">ข้อมูลธนาคาร</TabsTrigger>
            <TabsTrigger value="business">ข้อมูลธุรกิจ</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
                <CardDescription>ข้อมูลทั่วไปของ Supplier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อ Supplier *</FormLabel>
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
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          ระบบจะสร้างรหัสอัตโนมัติหากไม่ระบุ
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="supplier_category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>หมวดหมู่ *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกหมวดหมู่" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
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
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
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
                    name="supplier_currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>สกุลเงินหลัก</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tax_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เลขผู้เสียภาษี</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compliance_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>สถานะการอนุมัติ</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {complianceStatuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ที่อยู่</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="is_preferred_supplier"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Preferred Supplier
                          </FormLabel>
                          <FormDescription>
                            ทำเครื่องหมาย Supplier ที่ให้ความสำคัญพิเศษ
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลติดต่อ</CardTitle>
                <CardDescription>ข้อมูลการติดต่อทั่วไปและฝ่ายการเงิน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* General Contact */}
                  <div className="space-y-4">
                    <h4 className="font-medium">ข้อมูลติดต่อทั่วไป</h4>
                    <FormField
                      control={form.control}
                      name="contact_person"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ผู้ติดต่อ</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>อีเมล</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
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
                          <FormLabel>เบอร์โทร</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Finance Contact */}
                  <div className="space-y-4">
                    <h4 className="font-medium">ข้อมูลติดต่อฝ่ายการเงิน</h4>
                    <FormField
                      control={form.control}
                      name="contact_person_finance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ผู้ติดต่อฝ่ายการเงิน</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_email_finance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>อีเมลฝ่ายการเงิน</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_phone_finance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>เบอร์โทรฝ่ายการเงิน</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลธนาคาร</CardTitle>
                <CardDescription>ข้อมูลบัญชีธนาคารสำหรับการโอนเงิน</CardDescription>
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
                        <FormLabel>เลขที่บัญชี *</FormLabel>
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
                    name="banking_swift_code"
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
                    name="banking_iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IBAN</FormLabel>
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
                    name="banking_routing_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="banking_correspondent_bank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correspondent Bank</FormLabel>
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
                  name="bank_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ที่อยู่ธนาคาร</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลธุรกิจ</CardTitle>
                <CardDescription>เงื่อนไขทางธุรกิจและการประเมิน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เงื่อนไขการชำระเงิน</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="เช่น NET 30, COD" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferred_payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>วิธีการชำระเงินที่ต้องการ</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกวิธีการชำระ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minimum_order_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>จำนวนสั่งซื้อขั้นต่ำ</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="credit_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>วงเงินสินเชื่อ</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ratings */}
                <div className="space-y-4">
                  <h4 className="font-medium">การประเมิน Supplier</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quality_rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>คะแนนคุณภาพ</FormLabel>
                          <FormControl>
                            <RatingStars
                              rating={field.value}
                              onRatingChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delivery_rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>คะแนนการส่งมอบ</FormLabel>
                          <FormControl>
                            <RatingStars
                              rating={field.value}
                              onRatingChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price_rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>คะแนนราคา</FormLabel>
                          <FormControl>
                            <RatingStars
                              rating={field.value}
                              onRatingChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <FormField
                  control={form.control}
                  name="supplier_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมายเหตุเพิ่มเติม</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "กำลังบันทึก..." : editingSupplier ? "อัปเดต" : "เพิ่ม Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}