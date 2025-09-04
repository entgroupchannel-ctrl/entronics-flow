import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const transferFormSchema = z.object({
  supplier_id: z.string().min(1, "กรุณาเลือก Supplier"),
  supplier_name: z.string().min(1, "กรุณากรอกชื่อ Supplier"),
  supplier_bank_name: z.string().min(1, "กรุณากรอกชื่อธนาคาร"),
  supplier_bank_address: z.string().optional(),
  supplier_account_number: z.string().min(1, "กรุณากรอกเลขที่บัญชี"),
  supplier_swift_code: z.string().optional(),
  transfer_amount: z.number().min(0.01, "กรุณากรอกจำนวนเงิน"),
  currency: z.string().min(1, "กรุณาเลือกสกุลเงิน"),
  exchange_rate: z.number().optional(),
  thb_equivalent: z.number().optional(),
  purchase_order_number: z.string().optional(),
  invoice_reference: z.string().optional(),
  payment_purpose: z.string().min(1, "กรุณากรอกวัตถุประสงค์การจ่าย"),
  payment_deadline: z.date().optional(),
  requested_transfer_date: z.date({
    required_error: "กรุณาเลือกวันที่ต้องการโอน",
  }),
  priority: z.string().default("normal"),
  transfer_fee: z.number().default(0),
  bank_charges: z.number().default(0),
  other_charges: z.number().default(0),
  notes: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferFormSchema>;

interface InternationalTransferFormProps {
  editingRequest?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InternationalTransferForm({
  editingRequest,
  onSuccess,
  onCancel,
}: InternationalTransferFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: editingRequest ? {
      supplier_id: editingRequest.supplier_id || "",
      supplier_name: editingRequest.supplier_name || "",
      supplier_bank_name: editingRequest.supplier_bank_name || "",
      supplier_bank_address: editingRequest.supplier_bank_address || "",
      supplier_account_number: editingRequest.supplier_account_number || "",
      supplier_swift_code: editingRequest.supplier_swift_code || "",
      transfer_amount: editingRequest.transfer_amount || 0,
      currency: editingRequest.currency || "USD",
      exchange_rate: editingRequest.exchange_rate || undefined,
      thb_equivalent: editingRequest.thb_equivalent || undefined,
      purchase_order_number: editingRequest.purchase_order_number || "",
      invoice_reference: editingRequest.invoice_reference || "",
      payment_purpose: editingRequest.payment_purpose || "",
      payment_deadline: editingRequest.payment_deadline ? new Date(editingRequest.payment_deadline) : undefined,
      requested_transfer_date: new Date(editingRequest.requested_transfer_date),
      priority: editingRequest.priority || "normal",
      transfer_fee: editingRequest.transfer_fee || 0,
      bank_charges: editingRequest.bank_charges || 0,
      other_charges: editingRequest.other_charges || 0,
      notes: editingRequest.notes || "",
    } : {
      supplier_id: "",
      supplier_name: "",
      supplier_bank_name: "",
      supplier_bank_address: "",
      supplier_account_number: "",
      supplier_swift_code: "",
      transfer_amount: 0,
      currency: "USD",
      exchange_rate: undefined,
      thb_equivalent: undefined,
      purchase_order_number: "",
      invoice_reference: "",
      payment_purpose: "",
      payment_deadline: undefined,
      requested_transfer_date: new Date(),
      priority: "normal",
      transfer_fee: 0,
      bank_charges: 0,
      other_charges: 0,
      notes: "",
    },
  });

  // Query for approved suppliers only
  const { data: suppliers } = useQuery({
    queryKey: ["approved-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, bank_name, bank_account, swift_code, supplier_code, tax_id, phone, email, supplier_country, business_type")
        .eq("customer_type", "ผู้จำหน่าย")
        .eq("supplier_registration_status", "approved")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Query for purchase orders
  const { data: purchaseOrders } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("id, po_number, customer_name, customer_company, total_amount, po_date, status")
        .in("status", ["confirmed", "sent"])
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });


  const currencies = [
    { value: "USD", label: "USD - ดอลลาร์สหรัฐ" },
    { value: "EUR", label: "EUR - ยูโร" },
    { value: "GBP", label: "GBP - ปอนด์อังกฤษ" },
    { value: "JPY", label: "JPY - เยนญี่ปุ่น" },
    { value: "CNY", label: "CNY - หยวนจีน" },
    { value: "SGD", label: "SGD - ดอลลาร์สิงคโปร์" },
  ];

  const priorityOptions = [
    { value: "low", label: "ต่ำ" },
    { value: "normal", label: "ปกติ" },
    { value: "high", label: "สูง" },
    { value: "urgent", label: "เร่งด่วน" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "รอการจ่ายเงิน" },
    { value: "partial", label: "จ่ายบางส่วน" },
    { value: "paid", label: "จ่ายครบแล้ว" },
    { value: "overdue", label: "เกินกำหนด" },
  ];

  const handleSupplierSelect = (supplier: any) => {
    form.setValue("supplier_id", supplier.id);
    form.setValue("supplier_name", supplier.name);
    form.setValue("supplier_bank_name", supplier.bank_name || "");
    form.setValue("supplier_account_number", supplier.bank_account || "");
    form.setValue("supplier_swift_code", supplier.swift_code || "");
  };

  // Function to fetch exchange rate
  const fetchExchangeRate = async (currency: string) => {
    try {
      // Using a free API for exchange rates
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/THB`);
      const data = await response.json();
      const rate = data.rates[currency];
      if (rate) {
        return 1 / rate; // Convert from THB to foreign currency
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
    return null;
  };

  // Watch for currency changes and update exchange rate
  const watchCurrency = form.watch("currency");
  const watchTransferAmount = form.watch("transfer_amount");
  const watchExchangeRate = form.watch("exchange_rate");

  // Auto-fetch exchange rate when currency changes
  useEffect(() => {
    if (watchCurrency && watchCurrency !== "THB") {
      fetchExchangeRate(watchCurrency).then(rate => {
        if (rate) {
          form.setValue("exchange_rate", Number(rate.toFixed(4)));
        }
      });
    }
  }, [watchCurrency, form]);

  // Auto-calculate THB equivalent
  useEffect(() => {
    if (watchTransferAmount && watchExchangeRate) {
      const thbAmount = watchTransferAmount * watchExchangeRate;
      form.setValue("thb_equivalent", Number(thbAmount.toFixed(2)));
    }
  }, [watchTransferAmount, watchExchangeRate, form]);

  const onSubmit = async (data: TransferFormData) => {
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
        requested_by: user.id,
        status: editingRequest ? editingRequest.status : "draft",
        payment_deadline: data.payment_deadline?.toISOString().split('T')[0] || null,
        requested_transfer_date: data.requested_transfer_date.toISOString().split('T')[0],
      };

      // Remove transfer_number for new records (will be generated by trigger)
      if (!editingRequest) {
        delete (submitData as any).transfer_number;
      }

      if (editingRequest) {
        const { error } = await supabase
          .from("international_transfer_requests")
          .update(submitData)
          .eq("id", editingRequest.id);

        if (error) throw error;
      } else {
        const insertData: any = { ...submitData };
        delete insertData.transfer_number;
        
        const { error } = await supabase
          .from("international_transfer_requests")
          .insert(insertData);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error submitting transfer request:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกคำขอโอนเงินได้: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูล Supplier</CardTitle>
            <CardDescription>ข้อมูลผู้รับโอนเงิน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เลือก Supplier *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const selectedSupplier = suppliers?.find(s => s.id === value);
                      if (selectedSupplier) {
                        handleSupplierSelect(selectedSupplier);
                      }
                      field.onChange(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก Supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <div className="flex flex-col text-right">
                            <span className="font-medium">{supplier.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {supplier.supplier_country && `${supplier.supplier_country} • `}
                              {supplier.business_type && `${supplier.business_type} • `}
                              {supplier.bank_name && supplier.bank_account &&
                                `${supplier.bank_name} - ${supplier.bank_account}`
                              }
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier_name"
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
                name="supplier_bank_name"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier_account_number"
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

              <FormField
                control={form.control}
                name="supplier_swift_code"
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
            </div>

            <FormField
              control={form.control}
              name="supplier_bank_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ที่อยู่ธนาคาร</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดการโอน</CardTitle>
            <CardDescription>ข้อมูลการโอนเงิน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="transfer_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนเงิน *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สกุลเงิน *</FormLabel>
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

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ความสำคัญ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
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
                name="exchange_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อัตราแลกเปลี่ยน</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>อัตราแลกเปลี่ยนต่อ 1 บาท</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thb_equivalent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เทียบเท่าบาท</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        value={field.value ? Number(field.value).toLocaleString() : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, '');
                          field.onChange(parseFloat(value) || 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requested_transfer_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันที่ต้องการโอน *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>เลือกวันที่</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>กำหนดจ่าย</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>เลือกวันที่</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reference Documents */}
        <Card>
          <CardHeader>
            <CardTitle>เอกสารอ้างอิง</CardTitle>
            <CardDescription>เอกสารที่เกี่ยวข้องกับการโอนเงิน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_order_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เลขที่ PO</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก PO ที่ได้รับ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purchaseOrders?.map((po) => (
                          <SelectItem key={po.id} value={po.po_number}>
                            <div className="flex flex-col text-left">
                              <span className="font-medium">{po.po_number}</span>
                              <span className="text-sm text-muted-foreground">
                                {po.customer_name} • ฿{po.total_amount?.toLocaleString()}
                              </span>
                            </div>
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
                name="invoice_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เลขที่ Invoice อ้างอิง</FormLabel>
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
              name="payment_purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วัตถุประสงค์การจ่าย *</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    ระบุรายละเอียดสินค้าหรือบริการที่ชำระเงิน
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Fees and Charges */}
        <Card>
          <CardHeader>
            <CardTitle>ค่าธรรมเนียม</CardTitle>
            <CardDescription>ค่าใช้จ่ายในการโอนเงิน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="transfer_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ค่าธรรมเนียมโอน</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ค่าธรรมเนียมธนาคาร</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="other_charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ค่าใช้จ่ายอื่นๆ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>หมายเหตุ</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุเพิ่มเติม</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "กำลังบันทึก..." : editingRequest ? "อัปเดต" : "สร้างคำขอ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}