import React from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
interface QuotationItem {
  id: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
}
interface QuotationData {
  id?: string;
  quotation_number: string;
  quotation_date: string;
  valid_until?: string;
  customer_name: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  vat_amount: number;
  total_amount: number;
  terms_conditions?: string;
  notes?: string;
  items: QuotationItem[];
}
interface CompanyInfo {
  name: string;
  address: string;
  taxId: string;
  phone: string;
  mobile?: string;
  fax?: string;
  website?: string;
  email?: string;
  logo?: string;
}
interface QuotationPreviewProps {
  quotationData: QuotationData;
  companyInfo?: CompanyInfo;
  printMode?: boolean;
  className?: string;
}
const defaultCompanyInfo: CompanyInfo = {
  name: "บริษัท อีเอ็น ทีกรุ๊ป จำกัด (สำนักงานใหญ่)",
  address: "เลขที่ 70/5 หมู่บ้านเมทโทร บิซทาวน์แจ้งวัฒนะ 2 หมูที่ 4\nตำบลคลองพระอุดม อำเภอปกเกร็ด จังหวัดนนทบุรี 11120",
  taxId: "0135558013167",
  phone: "02-045-6104",
  mobile: "095-7391053, 082-2497922",
  fax: "02-045-6105",
  website: "www.entgroup.co.th"
};
export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  quotationData,
  companyInfo = defaultCompanyInfo,
  printMode = false,
  className = ""
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', {
        locale: th
      });
    } catch {
      return dateString;
    }
  };
  return <div className={`bg-white ${printMode ? 'p-8' : 'p-6'} ${className}`} id="quotation-preview">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        {/* Company Logo and Info */}
        <div className="flex items-start space-x-4">
          <div className="w-24 h-24 bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-400 text-xs">
            {companyInfo.logo ? <img src={companyInfo.logo} alt="Logo" className="w-full h-full object-contain" /> : 'LOGO'}
          </div>
          <div className="space-y-1 text-sm">
            <h1 className="font-bold text-lg">{companyInfo.name}</h1>
            <div className="text-gray-600 whitespace-pre-line">
              {companyInfo.address}
            </div>
            <div className="text-gray-600">
              เลขประจำตัวผู้เสียภาษี {companyInfo.taxId}
            </div>
            <div className="text-gray-600">
              โทร. {companyInfo.phone}
            </div>
            <div className="text-gray-600">
              เบอร์มือถือ {companyInfo.mobile}
            </div>
            {companyInfo.fax && <div className="text-gray-600">
                โทรสาร {companyInfo.fax}
              </div>}
            <div className="text-gray-600">
              {companyInfo.website}
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Header */}
      <div className="bg-blue-500 text-white text-center py-3 mb-6">
        <h2 className="text-xl font-bold tracking-wider">ใบเสนอราคา / Q U O T A T I O N</h2>
      </div>

      {/* Customer and Quotation Info */}
      <div className="border-2 border-gray-400 rounded p-4 mb-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Customer Info */}
          <div className="space-y-2">
            <div className="text-red-500 font-bold">ข้อมูลลูกค้า / C U S T O M E R :</div>
            <div className="text-sm space-y-1">
              <div>{quotationData.customer_name}</div>
              {quotationData.customer_address && <div className="whitespace-pre-line">{quotationData.customer_address}</div>}
              {quotationData.customer_phone && <div>TEL: {quotationData.customer_phone}</div>}
              {quotationData.customer_email && <div>EMAIL: {quotationData.customer_email}</div>}
            </div>
          </div>

          {/* Quotation Info */}
          <div className="space-y-2 text-right">
            <div className="text-red-500 font-bold">REF: {quotationData.quotation_number || 'QT2025XXXXXX'}</div>
            <div className="text-sm space-y-1">
              <div>เลขที่: {quotationData.quotation_number}</div>
              <div>วันที่: {formatDate(quotationData.quotation_date)}</div>
              {quotationData.valid_until && <div>วันหมดอายุ: {formatDate(quotationData.valid_until)}</div>}
              <div>หน้า: 1 จาก 1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-red-500 text-white text-center py-2 mb-4">
        <div className="grid grid-cols-12 gap-2 px-4 text-sm font-bold">
          <div className="col-span-1">ลำดับ</div>
          <div className="col-span-5">รายการ</div>
          <div className="col-span-1">จำนวน</div>
          <div className="col-span-2">ราคาต่อหน่วย</div>
          <div className="col-span-1">ส่วนลด</div>
          <div className="col-span-2">จำนวนเงิน</div>
        </div>
      </div>

      <div className="border border-gray-300 mb-6">
        {quotationData.items.map((item, index) => <div key={item.id} className="border-b border-gray-200 p-3">
            <div className="grid grid-cols-12 gap-2 text-sm">
              <div className="col-span-1 text-center">{index + 1}</div>
              <div className="col-span-5">
                <div className="font-medium">{item.product_name}</div>
                {item.product_sku && <div className="text-xs text-gray-600">SKU: {item.product_sku}</div>}
                {item.description && <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                    {item.description}
                  </div>}
              </div>
              <div className="col-span-1 text-center">{item.quantity}</div>
              <div className="col-span-2 text-right">{formatCurrency(item.unit_price)}</div>
              <div className="col-span-1 text-right">{formatCurrency(item.discount_amount)}</div>
              <div className="col-span-2 text-right">{formatCurrency(item.line_total)}</div>
            </div>
          </div>)}

        {/* Summary Section */}
        <div className="p-4 bg-gray-50">
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ยอดรวม:</span>
                <span>{formatCurrency(quotationData.subtotal)}</span>
              </div>
              {quotationData.discount_amount > 0 && <div className="flex justify-between">
                  <span>ส่วนลด ({quotationData.discount_percentage}%):</span>
                  <span>-{formatCurrency(quotationData.discount_amount)}</span>
                </div>}
              <div className="flex justify-between">
                <span>ภาษีมูลค่าเพิ่ม 7%:</span>
                <span>{formatCurrency(quotationData.vat_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>ยอดรวมทั้งสิ้น:</span>
                <span>{formatCurrency(quotationData.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {quotationData.terms_conditions && <div className="mb-6">
          <h3 className="font-bold mb-2">เงื่อนไขการขาย:</h3>
          <div className="text-sm whitespace-pre-line">{quotationData.terms_conditions}</div>
        </div>}

      {/* Notes */}
      {quotationData.notes && <div className="mb-6">
          <h3 className="font-bold mb-2">หมายเหตุ:</h3>
          <div className="text-sm whitespace-pre-line">{quotationData.notes}</div>
        </div>}

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="text-center">
          <div className="mb-16"></div>
          <div className="border-t border-gray-400 pt-2">
            <div>ลงชื่อ ................................</div>
            <div className="text-sm mt-1">ผู้เสนอราคา/พนักงานขาย</div>
          </div>
        </div>
        <div className="text-center">
          <div className="mb-16"></div>
          <div className="border-t border-gray-400 pt-2">
            <div>ลงชื่อ ................................</div>
            <div className="text-sm mt-1">ผู้รับใบเสนอราคา/ผู้อนุมัติ</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-8 border-t pt-4">บริษัท อีเอ็น ทีกรุ๊ป จำกัด</div>
    </div>;
};
export default QuotationPreview;