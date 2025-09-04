import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, X, CheckSquare, Square } from "lucide-react";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [searchPO, setSearchPO] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Query for purchase orders with usage check
  const { data: purchaseOrders } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      // First get all POs
      const { data: pos, error: poError } = await supabase
        .from("purchase_orders")
        .select("id, po_number, customer_name, customer_company, total_amount, po_date, status")
        .in("status", ["confirmed", "sent"])
        .order("created_at", { ascending: false });
      
      if (poError) throw poError;

      // Then get used PO numbers from transfer requests (excluding cancelled/rejected)
      const { data: transferRequests, error: transferError } = await supabase
        .from("international_transfer_requests")
        .select("purchase_order_number, status")
        .not("status", "in", '("cancelled","rejected")');
      
      if (transferError) throw transferError;

      // Extract used PO numbers
      const usedPONumbers = new Set<string>();
      transferRequests?.forEach(request => {
        if (request.purchase_order_number) {
          // Handle multiple POs in one request (comma separated)
          const poNumbers = request.purchase_order_number.split(',').map(po => po.trim());
          poNumbers.forEach(po => usedPONumbers.add(po));
        }
      });

      // Add usage status to POs
      const posWithUsage = pos?.map(po => ({
        ...po,
        isUsed: usedPONumbers.has(po.po_number)
      })) || [];

      return posWithUsage;
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

  const handleSupplierChange = (supplierId: string) => {
    const selectedSupplier = suppliers?.find(s => s.id === supplierId);
    if (selectedSupplier) {
      form.setValue("supplier_id", selectedSupplier.id);
      form.setValue("supplier_name", selectedSupplier.name);
      form.setValue("supplier_bank_name", selectedSupplier.bank_name || "");
      form.setValue("supplier_account_number", selectedSupplier.bank_account || "");
      form.setValue("supplier_swift_code", selectedSupplier.swift_code || "");
    }
  };

  const handlePOSelection = (poNumber: string, checked: boolean) => {
    let updatedPOs: string[];
    if (checked) {
      updatedPOs = [...selectedPOs, poNumber];
    } else {
      updatedPOs = selectedPOs.filter(po => po !== poNumber);
    }
    setSelectedPOs(updatedPOs);

    // Update form values
    form.setValue("purchase_order_number", updatedPOs.join(", "));
    
    // Calculate total amount from selected POs
    const selectedPOData = purchaseOrders?.filter(po => updatedPOs.includes(po.po_number)) || [];
    const totalAmount = selectedPOData.reduce((sum, po) => sum + (po.total_amount || 0), 0);
    form.setValue("transfer_amount", totalAmount);

    // Generate payment purpose from selected POs
    if (selectedPOData.length > 0) {
      const purpose = `ชำระค่าสินค้า PO: ${updatedPOs.join(", ")} - ${selectedPOData.map(po => po.customer_name).join(", ")}`;
      form.setValue("payment_purpose", purpose);
    } else {
      form.setValue("payment_purpose", "");
    }
  };

  const handleSelectAll = () => {
    const availablePOs = filteredPOs?.filter(po => !po.isUsed) || [];
    const allPONumbers = availablePOs.map(po => po.po_number);
    setSelectedPOs(allPONumbers);
    
    // Update form values
    form.setValue("purchase_order_number", allPONumbers.join(", "));
    const totalAmount = availablePOs.reduce((sum, po) => sum + (po.total_amount || 0), 0);
    form.setValue("transfer_amount", totalAmount);
    
    if (availablePOs.length > 0) {
      const purpose = `ชำระค่าสินค้า PO: ${allPONumbers.join(", ")}`;
      form.setValue("payment_purpose", purpose);
    }
  };

  const handleClearAll = () => {
    setSelectedPOs([]);
    form.setValue("purchase_order_number", "");
    form.setValue("transfer_amount", 0);
    form.setValue("payment_purpose", "");
  };

  const removePO = (poNumber: string) => {
    handlePOSelection(poNumber, false);
  };

  // Filter POs based on search and status
  const filteredPOs = purchaseOrders?.filter(po => {
    const matchesSearch = !searchPO || 
      po.po_number.toLowerCase().includes(searchPO.toLowerCase()) ||
      po.customer_name.toLowerCase().includes(searchPO.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Separate available and used POs
  const availablePOs = filteredPOs?.filter(po => !po.isUsed) || [];
  const usedPOs = filteredPOs?.filter(po => po.isUsed) || [];

  // Calculate summary
  const selectedPOData = purchaseOrders?.filter(po => selectedPOs.includes(po.po_number)) || [];
  const totalSelectedAmount = selectedPOData.reduce((sum, po) => sum + (po.total_amount || 0), 0);

  // Function to fetch exchange rate
  const fetchExchangeRate = async (currency: string) => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/THB`);
      const data = await response.json();
      const rate = data.rates[currency];
      if (rate) {
        return 1 / rate;
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
    <div className="max-w-7xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Content in Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              {/* Supplier Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">ข้อมูล Supplier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เลือก Supplier *</FormLabel>
                        <Select onValueChange={handleSupplierChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือก Supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers?.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                <div className="flex flex-col text-left">
                                  <span className="font-medium">{supplier.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {supplier.supplier_country} • {supplier.bank_name}
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

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="supplier_bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ธนาคาร *</FormLabel>
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
                    name="supplier_bank_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ที่อยู่ธนาคาร</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">วัตถุประสงค์การชำระ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enhanced PO Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-medium">เลือก Purchase Orders</FormLabel>
                      {selectedPOs.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          เลือกแล้ว {selectedPOs.length} PO
                        </Badge>
                      )}
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="ค้นหา PO หรือชื่อลูกค้า..."
                          value={searchPO}
                          onChange={(e) => setSearchPO(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ทั้งหมด</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={availablePOs.length === 0}
                      >
                        <CheckSquare className="w-4 h-4 mr-1" />
                        เลือกที่ใช้ได้ ({availablePOs.length})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        disabled={selectedPOs.length === 0}
                      >
                        <Square className="w-4 h-4 mr-1" />
                        ยกเลิกทั้งหมด
                      </Button>
                    </div>

                    {/* Selected POs Summary */}
                    {selectedPOs.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">PO ที่เลือก</span>
                          <span className="text-sm font-bold text-primary">
                            รวม: ฿{totalSelectedAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedPOs.map((poNumber) => (
                            <Badge key={poNumber} variant="default" className="text-xs">
                              {poNumber}
                              <button
                                type="button"
                                onClick={() => removePO(poNumber)}
                                className="ml-1 hover:bg-destructive rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PO Table */}
                    <div className="border rounded-lg">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-muted/50 border-b">
                            <tr>
                              <th className="text-left p-3 w-12"></th>
                              <th className="text-left p-3">PO Number</th>
                              <th className="text-left p-3">ลูกค้า</th>
                              <th className="text-left p-3">สถานะ</th>
                              <th className="text-right p-3">มูลค่า</th>
                              <th className="text-center p-3">สถานะการใช้งาน</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Available POs */}
                            {availablePOs.map((po) => (
                              <tr key={po.id} className="border-b hover:bg-muted/30">
                                <td className="p-3">
                                  <Checkbox
                                    checked={selectedPOs.includes(po.po_number)}
                                    onCheckedChange={(checked) => 
                                      handlePOSelection(po.po_number, checked as boolean)
                                    }
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="font-medium">{po.po_number}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(po.po_date), "dd/MM/yyyy")}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div>{po.customer_name}</div>
                                  {po.customer_company && (
                                    <div className="text-xs text-muted-foreground">
                                      {po.customer_company}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  <Badge 
                                    variant={po.status === 'confirmed' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {po.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ส่งแล้ว'}
                                  </Badge>
                                </td>
                                <td className="p-3 text-right font-medium">
                                  ฿{po.total_amount?.toLocaleString()}
                                </td>
                                <td className="p-3 text-center">
                                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                    ใช้ได้
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                            
                            {/* Used POs (disabled) */}
                            {usedPOs.map((po) => (
                              <tr key={po.id} className="border-b bg-muted/20 opacity-60">
                                <td className="p-3">
                                  <Checkbox
                                    disabled
                                    checked={false}
                                    className="opacity-50"
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="font-medium text-muted-foreground">{po.po_number}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(po.po_date), "dd/MM/yyyy")}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="text-muted-foreground">{po.customer_name}</div>
                                  {po.customer_company && (
                                    <div className="text-xs text-muted-foreground">
                                      {po.customer_company}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  <Badge 
                                    variant="outline"
                                    className="text-xs opacity-50"
                                  >
                                    {po.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ส่งแล้ว'}
                                  </Badge>
                                </td>
                                <td className="p-3 text-right font-medium text-muted-foreground">
                                  ฿{po.total_amount?.toLocaleString()}
                                </td>
                                <td className="p-3 text-center">
                                  <Badge variant="destructive" className="text-xs">
                                    ใช้แล้ว
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {filteredPOs?.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            {searchPO ? 'ไม่พบ PO ที่ค้นหา' : 'ไม่มี PO ที่สามารถเลือกได้'}
                          </div>
                        )}

                        {filteredPOs && filteredPOs.length > 0 && availablePOs.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <div className="text-orange-600 font-medium">PO ทั้งหมดถูกใช้งานแล้ว</div>
                            <div className="text-xs mt-1">ไม่สามารถเลือก PO ที่ถูกสร้างคำขอโอนเงินแล้ว</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="invoice_reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เลขที่ Invoice</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>วัตถุประสงค์การจ่าย *</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} className="text-sm" />
                        </FormControl>
                        <FormDescription className="text-xs">
                          ระบุรายละเอียดสินค้าหรือบริการที่ชำระเงิน
                        </FormDescription>
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
                          <Textarea {...field} rows={2} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Transfer Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">รายละเอียดการโอน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
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

                  <div className="grid grid-cols-2 gap-3">
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
                          <FormDescription className="text-xs">ต่อ 1 บาท</FormDescription>
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

                  <div className="grid grid-cols-2 gap-3">
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
                                    "w-full pl-3 text-left font-normal text-sm",
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
                                    "w-full pl-3 text-left font-normal text-sm",
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

              {/* Fees and Charges */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">ค่าธรรมเนียม</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="transfer_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">ค่าโอน</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              className="text-sm"
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
                          <FormLabel className="text-sm">ค่าธนาคาร</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              className="text-sm"
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
                          <FormLabel className="text-sm">อื่นๆ</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              className="text-sm"
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : editingRequest ? "อัปเดต" : "สร้างคำขอ"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}