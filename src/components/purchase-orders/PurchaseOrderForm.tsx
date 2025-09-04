import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, X, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PurchaseOrderAttachments } from "./PurchaseOrderAttachments";
import { PaymentTermsSection } from "./PaymentTermsSection";

const purchaseOrderSchema = z.object({
  po_number: z.string().optional(),
  customer_po_number: z.string().optional(),
  quotation_id: z.string().optional(),
  customer_id: z.string().min(1, "กรุณาเลือกลูกค้า"),
  customer_name: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  customer_company: z.string().optional(),
  po_date: z.date({
    required_error: "กรุณาเลือกวันที่ PO",
  }),
  delivery_date: z.date().optional(),
  status: z.string().default("received"),
  payment_terms: z.string().default("30 วัน"),
  payment_method: z.string().default("bank_transfer"),
  payment_terms_type: z.string().default("credit"),
  payment_due_days: z.number().default(30),
  advance_payment_percentage: z.number().default(0),
  advance_payment_amount: z.number().default(0),
  cash_discount_percentage: z.number().default(0),
  cash_discount_days: z.number().default(0),
  installment_count: z.number().default(1),
  payment_currency: z.string().default("THB"),
  late_payment_fee_percentage: z.number().default(0),
  delivery_address: z.string().optional(),
  special_instructions: z.string().optional(),
  notes: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderItem {
  id?: string;
  item_sequence: number;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  delivery_date?: Date;
}

interface QuotationWithSalesPerson {
  id: string;
  quotation_number: string;
  customer_name: string;
  total_amount: number;
  quotation_date: string;
  status: string;
  created_by: string;
  sales_person_name: string;
}

interface PurchaseOrderFormProps {
  editingPO?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PurchaseOrderForm({
  editingPO,
  onSuccess,
  onCancel,
}: PurchaseOrderFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllQuotations, setShowAllQuotations] = useState(false);
  const [paymentTermsData, setPaymentTermsData] = useState<any>({});
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      item_sequence: 1,
      product_name: "",
      quantity: 1,
      unit_price: 0,
      line_total: 0,
    },
  ]);

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: editingPO ? {
      po_number: editingPO.po_number || "",
      customer_po_number: editingPO.customer_po_number || "",
      quotation_id: editingPO.quotation_id || "",
      customer_id: editingPO.customer_id || "",
      customer_name: editingPO.customer_name || "",
      customer_company: editingPO.customer_company || "",
      po_date: new Date(editingPO.po_date),
      delivery_date: editingPO.delivery_date ? new Date(editingPO.delivery_date) : undefined,
      status: editingPO.status || "received",
      payment_terms: editingPO.payment_terms || "30 วัน",
      payment_method: editingPO.payment_method || "bank_transfer",
      payment_terms_type: editingPO.payment_terms_type || "credit",
      payment_due_days: editingPO.payment_due_days || 30,
      advance_payment_percentage: editingPO.advance_payment_percentage || 0,
      advance_payment_amount: editingPO.advance_payment_amount || 0,
      cash_discount_percentage: editingPO.cash_discount_percentage || 0,
      cash_discount_days: editingPO.cash_discount_days || 0,
      installment_count: editingPO.installment_count || 1,
      payment_currency: editingPO.payment_currency || "THB",
      late_payment_fee_percentage: editingPO.late_payment_fee_percentage || 0,
      delivery_address: editingPO.delivery_address || "",
      special_instructions: editingPO.special_instructions || "",
      notes: editingPO.notes || "",
    } : {
      po_number: "",
      customer_po_number: "",
      quotation_id: "",
      customer_id: "",
      customer_name: "",
      customer_company: "",
      po_date: new Date(),
      delivery_date: undefined,
      status: "received",
      payment_terms: "30 วัน",
      payment_method: "bank_transfer",
      payment_terms_type: "credit",
      payment_due_days: 30,
      advance_payment_percentage: 0,
      advance_payment_amount: 0,
      cash_discount_percentage: 0,
      cash_discount_days: 0,
      installment_count: 1,
      payment_currency: "THB",
      late_payment_fee_percentage: 0,
      delivery_address: "",
      special_instructions: "",
      notes: "",
    },
  });

  // Query for customers
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
        .eq("customer_type", "ลูกค้า")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  // Query for recent quotations with sales person info
  const { data: quotations } = useQuery({
    queryKey: ["quotations", showAllQuotations],
    queryFn: async (): Promise<QuotationWithSalesPerson[]> => {
      let query = supabase
        .from("quotations")
        .select(`
          id, 
          quotation_number, 
          customer_name, 
          total_amount, 
          quotation_date, 
          status,
          created_by
        `)
        .in("status", ["approved", "pending"])
        .order("quotation_date", { ascending: false });

      if (!showAllQuotations) {
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        query = query.gte("quotation_date", twoMonthsAgo.toISOString().split('T')[0]);
      }
      
      const { data: quotationData, error } = await query;
      
      if (error) throw error;
      
      // Get sales person info for each quotation
      if (quotationData && quotationData.length > 0) {
        const salesPersonIds = [...new Set(quotationData.map(q => q.created_by))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", salesPersonIds);
        
        // Merge profile data with quotation data
        return quotationData.map(quotation => ({
          ...quotation,
          sales_person_name: profilesData?.find(p => p.user_id === quotation.created_by)?.full_name || 'ไม่ระบุ'
        }));
      }
      
      return quotationData?.map(q => ({ ...q, sales_person_name: 'ไม่ระบุ' })) || [];
    },
  });

  const statusOptions = [
    { value: "received", label: "ได้รับแล้ว" },
    { value: "processing", label: "กำลังดำเนินการ" },
    { value: "completed", label: "เสร็จสิ้น" },
    { value: "cancelled", label: "ยกเลิก" },
  ];

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers?.find(c => c.id === customerId);
    if (customer) {
      form.setValue("customer_id", customer.id);
      form.setValue("customer_name", customer.name);
    }
  };

  const addItem = () => {
    setItems([...items, {
      item_sequence: items.length + 1,
      product_name: "",
      quantity: 1,
      unit_price: 0,
      line_total: 0,
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems.map((item, i) => ({ ...item, item_sequence: i + 1 })));
    }
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate line total
    if (field === "quantity" || field === "unit_price") {
      newItems[index].line_total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.line_total, 0);
  };

  const onSubmit = async (data: PurchaseOrderFormData) => {
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
      const totalAmount = getTotalAmount();
      
      // Get sales person ID from selected quotation
      let salesPersonId = null;
      if (data.quotation_id) {
        const selectedQuotation = quotations?.find(q => q.id === data.quotation_id);
        salesPersonId = selectedQuotation?.created_by;
      }

      const purchaseOrderData = {
        po_number: data.po_number || undefined,
        customer_po_number: data.customer_po_number || undefined,
        quotation_id: data.quotation_id || null,
        sales_person_id: salesPersonId,
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        customer_company: data.customer_company || undefined,
        po_date: data.po_date.toISOString().split('T')[0],
        delivery_date: data.delivery_date ? data.delivery_date.toISOString().split('T')[0] : undefined,
        status: data.status,
        total_amount: totalAmount,
        payment_terms: data.payment_terms,
        payment_method: paymentTermsData.payment_method || data.payment_method,
        payment_terms_type: paymentTermsData.payment_terms_type || data.payment_terms_type,
        payment_due_days: paymentTermsData.payment_due_days || data.payment_due_days,
        advance_payment_percentage: paymentTermsData.advance_payment_percentage || data.advance_payment_percentage,
        advance_payment_amount: paymentTermsData.advance_payment_amount || data.advance_payment_amount,
        cash_discount_percentage: paymentTermsData.cash_discount_percentage || data.cash_discount_percentage,
        cash_discount_days: paymentTermsData.cash_discount_days || data.cash_discount_days,
        installment_count: paymentTermsData.installment_count || data.installment_count,
        payment_currency: paymentTermsData.payment_currency || data.payment_currency,
        late_payment_fee_percentage: paymentTermsData.late_payment_fee_percentage || data.late_payment_fee_percentage,
        payment_schedule: JSON.stringify(paymentTermsData.payment_schedule || []),
        delivery_address: data.delivery_address || undefined,
        special_instructions: data.special_instructions || undefined,
        notes: data.notes || undefined,
        created_by: editingPO ? editingPO.created_by : user.id,
      };

      let poId = editingPO?.id;

      if (editingPO) {
        // Update existing PO
        const { error } = await supabase
          .from("purchase_orders")
          .update(purchaseOrderData)
          .eq("id", editingPO.id);

        if (error) throw error;
      } else {
        // Create new PO
        const { data: newPO, error } = await supabase
          .from("purchase_orders")
          .insert([purchaseOrderData])
          .select()
          .single();

        if (error) throw error;
        poId = newPO.id;
      }

      // Handle items
      if (editingPO) {
        // Delete existing items first
        await supabase
          .from("purchase_order_items")
          .delete()
          .eq("purchase_order_id", poId);
      }

      // Insert new items
      const itemsData = items.map(item => ({
        purchase_order_id: poId,
        item_sequence: item.item_sequence,
        product_name: item.product_name,
        product_sku: item.product_sku || null,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        delivery_date: item.delivery_date || null,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(itemsData);

      if (itemsError) throw itemsError;

      onSuccess();
    } catch (error: any) {
      console.error("Error saving PO:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึก PO ได้: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลทั่วไป</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="quotation_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ใบเสนอราคาอ้างอิง {!showAllQuotations && "(2 เดือนล่าสุด)"}
                      {showAllQuotations && "(ทั้งหมด)"}
                    </FormLabel>
                    <div className="space-y-2">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกใบเสนอราคา" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {quotations?.map((quotation) => (
                            <SelectItem key={quotation.id} value={quotation.id}>
                              <div className="flex flex-col text-left">
                                <span className="font-medium">{quotation.quotation_number}</span>
                                <span className="text-sm text-muted-foreground">
                                  {quotation.customer_name} • ฿{quotation.total_amount?.toLocaleString()} • {quotation.status}
                                  <span className="text-blue-600"> • พนักงานขาย: {quotation.sales_person_name}</span>
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          {quotations?.length === 0 && !showAllQuotations && (
                            <SelectItem value="no-results" disabled>
                              ไม่พบใบเสนอราคาใน 2 เดือนล่าสุด
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      
                      {!showAllQuotations && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllQuotations(true)}
                          className="w-full"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          ค้นหาใบเสนอราคาทั้งหมด
                        </Button>
                      )}
                      
                      {showAllQuotations && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllQuotations(false)}
                          className="w-full"
                        >
                          กลับไปแสดง 2 เดือนล่าสุด
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_po_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมายเลข PO จากลูกค้า</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="กรอกหมายเลข PO จากระบบลูกค้า" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อลูกค้า *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>บริษัท</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="po_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันที่ PO *</FormLabel>
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันส่งมอบ</FormLabel>
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สถานะ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดเพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เงื่อนไขการชำระเงิน</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ที่อยู่จัดส่ง</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="special_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>คำแนะนำพิเศษ</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมายเหตุ</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>รายการสินค้า</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มรายการ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ลำดับ</TableHead>
                    <TableHead>ชื่อสินค้า</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>จำนวน</TableHead>
                    <TableHead>ราคาต่อหน่วย</TableHead>
                    <TableHead>รวม</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.item_sequence}</TableCell>
                      <TableCell>
                        <Input
                          value={item.product_name}
                          onChange={(e) => updateItem(index, "product_name", e.target.value)}
                          placeholder="ชื่อสินค้า"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.product_sku || ""}
                          onChange={(e) => updateItem(index, "product_sku", e.target.value)}
                          placeholder="SKU"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        ฿{item.line_total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end mt-4">
              <div className="text-right">
                <div className="text-lg font-semibold">
                  ยอดรวม: ฿{getTotalAmount().toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms Section */}
        <PaymentTermsSection 
          value={paymentTermsData}
          onChange={setPaymentTermsData}
          totalAmount={getTotalAmount()}
          poDate={form.watch("po_date")}
        />

        {/* Attachments Section */}
        <PurchaseOrderAttachments purchaseOrderId={editingPO?.id || ""} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "กำลังบันทึก..." : editingPO ? "อัปเดต" : "บันทึก"}
          </Button>
        </div>
      </form>
    </Form>
  );
}