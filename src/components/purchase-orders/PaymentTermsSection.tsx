import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Calculator, Plus, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { th } from "date-fns/locale";

interface PaymentScheduleItem {
  installment_number: number;
  due_date: Date;
  amount: number;
  description: string;
}

interface PaymentTermsProps {
  value?: {
    payment_method?: string;
    payment_terms_type?: string;
    payment_due_days?: number;
    advance_payment_percentage?: number;
    advance_payment_amount?: number;
    cash_discount_percentage?: number;
    cash_discount_days?: number;
    installment_count?: number;
    payment_schedule?: PaymentScheduleItem[];
    payment_currency?: string;
    late_payment_fee_percentage?: number;
  };
  onChange: (value: any) => void;
  totalAmount?: number;
  poDate?: Date;
}

export function PaymentTermsSection({ value = {}, onChange, totalAmount = 0, poDate = new Date() }: PaymentTermsProps) {
  const [showSchedule, setShowSchedule] = useState(false);

  const defaultValues = {
    payment_method: 'bank_transfer',
    payment_terms_type: 'credit',
    payment_due_days: 30,
    advance_payment_percentage: 0,
    advance_payment_amount: 0,
    cash_discount_percentage: 0,
    cash_discount_days: 0,
    installment_count: 1,
    payment_schedule: [],
    payment_currency: 'THB',
    late_payment_fee_percentage: 0,
    ...value
  };

  const updateValue = (field: string, newValue: any) => {
    const updated = { ...defaultValues, [field]: newValue };
    
    // Auto-calculate advance payment amount when percentage changes
    if (field === 'advance_payment_percentage') {
      updated.advance_payment_amount = (totalAmount * newValue) / 100;
    }
    
    // Auto-calculate advance payment percentage when amount changes
    if (field === 'advance_payment_amount' && totalAmount > 0) {
      updated.advance_payment_percentage = (newValue / totalAmount) * 100;
    }

    // Generate payment schedule for installments
    if (field === 'installment_count' || field === 'payment_terms_type') {
      if (updated.payment_terms_type === 'installment' && newValue > 1) {
        updated.payment_schedule = generatePaymentSchedule(newValue, totalAmount, poDate, updated.advance_payment_amount);
      } else {
        updated.payment_schedule = [];
      }
    }

    onChange(updated);
  };

  const generatePaymentSchedule = (installments: number, total: number, startDate: Date, advanceAmount: number): PaymentScheduleItem[] => {
    const remainingAmount = total - advanceAmount;
    const installmentAmount = remainingAmount / installments;
    const schedule: PaymentScheduleItem[] = [];

    for (let i = 1; i <= installments; i++) {
      schedule.push({
        installment_number: i,
        due_date: addDays(startDate, i * 30), // 30 days between installments
        amount: i === installments ? remainingAmount - (installmentAmount * (installments - 1)) : installmentAmount, // Last installment gets remainder
        description: `งวดที่ ${i} จาก ${installments}`
      });
    }

    return schedule;
  };

  const paymentMethodOptions = [
    { value: 'bank_transfer', label: 'โอนเงินผ่านธนาคาร' },
    { value: 'check', label: 'เช็ค' },
    { value: 'cash', label: 'เงินสด' },
    { value: 'credit_card', label: 'บัตรเครดิت' },
    { value: 'promissory_note', label: 'ตั๋วสัญญาใช้เงิน' },
    { value: 'letter_of_credit', label: 'เลตเตอร์ออฟเครดิต' }
  ];

  const paymentTermsTypeOptions = [
    { value: 'advance', label: 'ชำระล่วงหน้า 100%' },
    { value: 'cod', label: 'เก็บเงินปลายทาง' },
    { value: 'credit', label: 'เครดิต' },
    { value: 'installment', label: 'ผ่อนชำระ' },
    { value: 'partial_advance', label: 'มัดจำ + เครดิต' },
    { value: 'partial_delivery', label: 'รับเงินบางส่วน ส่งสินค้ารับส่วนที่เหลือ' }
  ];

  const currencyOptions = [
    { value: 'THB', label: 'บาท (THB)' },
    { value: 'USD', label: 'ดอลลาร์สหรัฐ (USD)' },
    { value: 'EUR', label: 'ยูโร (EUR)' },
    { value: 'JPY', label: 'เยน (JPY)' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          เงื่อนไขการชำระเงิน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>วิธีการชำระเงิน</Label>
            <Select value={defaultValues.payment_method} onValueChange={(value) => updateValue('payment_method', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>สกุลเงิน</Label>
            <Select value={defaultValues.payment_currency} onValueChange={(value) => updateValue('payment_currency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payment Terms Type */}
        <div className="space-y-2">
          <Label>รูปแบบการชำระเงิน</Label>
          <Select value={defaultValues.payment_terms_type} onValueChange={(value) => updateValue('payment_terms_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentTermsTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Credit Terms */}
        {(defaultValues.payment_terms_type === 'credit' || defaultValues.payment_terms_type === 'partial_advance' || defaultValues.payment_terms_type === 'partial_delivery') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ระยะเวลาเครดิต (วัน)</Label>
              <Input
                type="number"
                value={defaultValues.payment_due_days}
                onChange={(e) => updateValue('payment_due_days', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>ค่าปรับชำระล่าช้า (%)</Label>
              <Input
                type="number"
                value={defaultValues.late_payment_fee_percentage}
                onChange={(e) => updateValue('late_payment_fee_percentage', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
          </div>
        )}

        {/* Advance Payment */}
        {(defaultValues.payment_terms_type === 'partial_advance' || defaultValues.payment_terms_type === 'partial_delivery') && (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              {defaultValues.payment_terms_type === 'partial_delivery' ? 'การรับเงินล่วงหน้า' : 'การชำระเงินมัดจำ'}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {defaultValues.payment_terms_type === 'partial_delivery' ? 'เปอร์เซ็นต์รับล่วงหน้า (%)' : 'เปอร์เซ็นต์มัดจำ (%)'}
                </Label>
                <Input
                  type="number"
                  value={defaultValues.advance_payment_percentage}
                  onChange={(e) => updateValue('advance_payment_percentage', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {defaultValues.payment_terms_type === 'partial_delivery' ? 'จำนวนเงินรับล่วงหน้า' : 'จำนวนเงินมัดจำ'}
                </Label>
                <Input
                  type="number"
                  value={defaultValues.advance_payment_amount}
                  onChange={(e) => updateValue('advance_payment_amount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            {defaultValues.payment_terms_type === 'partial_delivery' && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>หมายเหตุ:</strong> รูปแบบนี้จะรับเงินบางส่วนก่อน จากนั้นส่งสินค้าและรับเงินส่วนที่เหลือตอนส่งมอบ
                </p>
              </div>
            )}
          </div>
        )}

        {/* Installment */}
        {defaultValues.payment_terms_type === 'installment' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>จำนวนงวด</Label>
                <Input
                  type="number"
                  value={defaultValues.installment_count}
                  onChange={(e) => updateValue('installment_count', parseInt(e.target.value) || 1)}
                  min="1"
                  max="12"
                />
              </div>
              <div className="space-y-2">
                <Label>เงินมัดจำ (ถ้ามี)</Label>
                <Input
                  type="number"
                  value={defaultValues.advance_payment_amount}
                  onChange={(e) => updateValue('advance_payment_amount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {defaultValues.payment_schedule && defaultValues.payment_schedule.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">ตารางการชำระเงิน</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSchedule(!showSchedule)}
                  >
                    {showSchedule ? 'ซ่อน' : 'แสดง'}ตาราง
                  </Button>
                </div>

                {showSchedule && (
                  <div className="border rounded-lg p-4 space-y-2">
                    {defaultValues.payment_schedule.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{item.description}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            - {format(new Date(item.due_date), "dd/MM/yyyy", { locale: th })}
                          </span>
                        </div>
                        <Badge variant="outline">
                          ฿{item.amount.toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cash Discount */}
        <div className="space-y-4">
          <Label className="text-base font-medium">ส่วนลดเงินสด (ถ้ามี)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ส่วนลด (%)</Label>
              <Input
                type="number"
                value={defaultValues.cash_discount_percentage}
                onChange={(e) => updateValue('cash_discount_percentage', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>ชำระภายใน (วัน)</Label>
              <Input
                type="number"
                value={defaultValues.cash_discount_days}
                onChange={(e) => updateValue('cash_discount_days', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        {totalAmount > 0 && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium">สรุปการชำระเงิน</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>ยอดรวม:</div>
              <div className="text-right">฿{totalAmount.toLocaleString()}</div>
              
              {defaultValues.advance_payment_amount > 0 && (
                <>
                  <div>เงินมัดจำ:</div>
                  <div className="text-right">฿{defaultValues.advance_payment_amount.toLocaleString()}</div>
                  <div>ยอดคงเหลือ:</div>
                  <div className="text-right">฿{(totalAmount - defaultValues.advance_payment_amount).toLocaleString()}</div>
                </>
              )}
              
              {defaultValues.cash_discount_percentage > 0 && (
                <>
                  <div>ส่วนลดเงินสด:</div>
                  <div className="text-right text-green-600">
                    -฿{((totalAmount * defaultValues.cash_discount_percentage) / 100).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}