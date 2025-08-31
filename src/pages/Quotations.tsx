import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, FileText, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
}

interface QuotationItem {
  id?: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_percentage: number;
  line_total: number;
  is_software: boolean;
}

interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  quotation_date: string;
  valid_until: string;
  subtotal: number;
  discount_amount: number;
  vat_amount: number;
  withholding_tax_amount: number;
  total_amount: number;
  status: string;
}

const Quotations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>('');
  const [items, setItems] = useState<QuotationItem[]>([{
    product_name: '',
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    discount_percentage: 0,
    line_total: 0,
    is_software: false
  }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลใบเสนอราคาได้",
        variant: "destructive",
      });
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, address')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, category')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLineTotal = (item: QuotationItem) => {
    const baseAmount = item.quantity * item.unit_price;
    const discountAmount = item.discount_percentage > 0 
      ? baseAmount * (item.discount_percentage / 100)
      : item.discount_amount;
    return baseAmount - discountAmount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    const vatAmount = subtotal * 0.07; // 7% VAT
    const softwareItems = items.filter(item => item.is_software);
    const softwareTotal = softwareItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    const withholdingTaxAmount = softwareTotal * 0.03; // 3% withholding tax for software
    const totalAmount = subtotal + vatAmount - withholdingTaxAmount;

    return {
      subtotal,
      vatAmount,
      withholdingTaxAmount,
      totalAmount
    };
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    updatedItems[index].line_total = calculateLineTotal(updatedItems[index]);
    setItems(updatedItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const updatedItems = [...items];
    updatedItems[index].unit_price = price;
    updatedItems[index].line_total = calculateLineTotal(updatedItems[index]);
    setItems(updatedItems);
  };

  const updateItemDiscount = (index: number, type: 'amount' | 'percentage', value: number) => {
    const updatedItems = [...items];
    if (type === 'amount') {
      updatedItems[index].discount_amount = value;
      updatedItems[index].discount_percentage = 0;
    } else {
      updatedItems[index].discount_percentage = value;
      updatedItems[index].discount_amount = 0;
    }
    updatedItems[index].line_total = calculateLineTotal(updatedItems[index]);
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, {
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      discount_percentage: 0,
      line_total: 0,
      is_software: false
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const updatedItems = [...items];
      updatedItems[index] = {
        ...updatedItems[index],
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        unit_price: product.price,
        is_software: product.category.toLowerCase().includes('software')
      };
      updatedItems[index].line_total = calculateLineTotal(updatedItems[index]);
      setItems(updatedItems);
    }
  };

  const handleSubmit = async () => {
    try {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (!customer) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "กรุณาเลือกลูกค้า",
          variant: "destructive",
        });
        return;
      }

      const totals = calculateTotals();

      const { data: quotationData, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          quotation_number: '', // Will be auto-generated by trigger
          customer_name: customer.name,
          customer_phone: customer.phone || '',
          customer_email: customer.email || '',
          customer_address: customer.address || '',
          quotation_date: quotationDate,
          valid_until: validUntil || null,
          subtotal: totals.subtotal,
          discount_amount: 0,
          discount_percentage: 0,
          vat_amount: totals.vatAmount,
          withholding_tax_amount: totals.withholdingTaxAmount,
          total_amount: totals.totalAmount,
          notes: notes || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Insert quotation items
      const itemsToInsert = items.map(item => ({
        quotation_id: quotationData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        discount_percentage: item.discount_percentage,
        line_total: item.line_total,
        is_software: item.is_software
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "สำเร็จ",
        description: "สร้างใบเสนอราคาเรียบร้อยแล้ว",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchQuotations();
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างใบเสนอราคาได้",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setQuotationDate(new Date().toISOString().split('T')[0]);
    setValidUntil('');
    setItems([{
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      discount_percentage: 0,
      line_total: 0,
      is_software: false
    }]);
    setNotes('');
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'draft': 'outline',
      'sent': 'default',
      'approved': 'secondary',
      'rejected': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const totals = calculateTotals();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">ใบเสนอราคา</h1>
                <p className="text-muted-foreground">จัดการใบเสนอราคาและสร้างใบเสนอราคาใหม่</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างใบเสนอราคา
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>สร้างใบเสนอราคาใหม่</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Customer Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer">ลูกค้า</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกลูกค้า" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="date">วันที่</Label>
                        <Input
                          type="date"
                          value={quotationDate}
                          onChange={(e) => setQuotationDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="validUntil">วันหมดอายุ</Label>
                      <Input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                      />
                    </div>

                    {/* Items Table */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label>รายการสินค้า</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                          <Plus className="w-4 h-4 mr-2" />
                          เพิ่มรายการ
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>สินค้า</TableHead>
                              <TableHead>จำนวน</TableHead>
                              <TableHead>ราคาต่อหน่วย</TableHead>
                              <TableHead>ส่วนลด</TableHead>
                              <TableHead>Software</TableHead>
                              <TableHead>รวม</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Select 
                                    value={item.product_id || ''} 
                                    onValueChange={(value) => selectProduct(index, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="เลือกสินค้า" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                          {product.name} ({product.sku})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                                    className="w-24"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="บาท"
                                      value={item.discount_amount}
                                      onChange={(e) => updateItemDiscount(index, 'amount', parseFloat(e.target.value) || 0)}
                                      className="w-20"
                                    />
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      placeholder="%"
                                      value={item.discount_percentage}
                                      onChange={(e) => updateItemDiscount(index, 'percentage', parseFloat(e.target.value) || 0)}
                                      className="w-20"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Checkbox
                                    checked={item.is_software}
                                    onCheckedChange={(checked) => {
                                      const updatedItems = [...items];
                                      updatedItems[index].is_software = !!checked;
                                      setItems(updatedItems);
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  ฿{calculateLineTotal(item).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                  {items.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(index)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>ยอดรวม:</span>
                        <span>฿{totals.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT 7%:</span>
                        <span>฿{totals.vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                      {totals.withholdingTaxAmount > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>หักภาษี ณ ที่จ่าย 3%:</span>
                          <span>-฿{totals.withholdingTaxAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>รวมทั้งสิ้น:</span>
                        <span>฿{totals.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">หมายเหตุ</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="เงื่อนไขและข้อตกลง..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        ยกเลิก
                      </Button>
                      <Button onClick={handleSubmit}>
                        สร้างใบเสนอราคา
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Quotations List */}
            <Card>
              <CardHeader>
                <CardTitle>รายการใบเสนอราคา</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>เลขที่เอกสาร</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>ยอดรวม</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                        <TableCell>{quotation.customer_name}</TableCell>
                        <TableCell>{new Date(quotation.quotation_date).toLocaleDateString('th-TH')}</TableCell>
                        <TableCell>฿{quotation.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Quotations;