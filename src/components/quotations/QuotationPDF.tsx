import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

interface PDFExportOptions {
  filename?: string;
  quotationData?: any;
  companyInfo?: any;
  scale?: number;
  quality?: number;
}

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

export const useQuotationPDF = () => {
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const addQuotationHeader = (pdf: jsPDF, pageNumber: number, totalPages: number, quotationData: any, companyInfo: any) => {
    // Company header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(companyInfo?.name || 'บริษัท อี เอ็น ที กรุ๊ป จำกัด (สำนักงานใหญ่)', 20, 20);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const companyAddress = companyInfo?.address || 'เลขที่ 70/5 หมู่บ้านเมทโทร บิซทาวน์แจ้งวัฒนะ 2 หมูที่ 4 ตำบลคลองพราอุดม อำเภอปากเกร็ด จังหวัดนนทบุรี 11120';
    const addressLines = pdf.splitTextToSize(companyAddress, 160);
    let yPos = 28;
    addressLines.forEach((line: string) => {
      pdf.text(line, 20, yPos);
      yPos += 4;
    });
    
    pdf.text(`เลขประจำตัวผู้เสียภาษี ${companyInfo?.taxId || '0135558013167'}`, 20, yPos);
    yPos += 4;
    pdf.text(`โทร. ${companyInfo?.phone || '02-045-6104'} โทรสาร ${companyInfo?.fax || '02-045-6105'}`, 20, yPos);
    yPos += 4;
    pdf.text(`เบอร์มือถือ ${companyInfo?.mobile || '095-7391053, 082-2497922'}`, 20, yPos);
    yPos += 4;
    pdf.text(`${companyInfo?.website || 'www.entgroup.co.th'} / ${companyInfo?.email || 'sales@entgroup.co.th'}`, 20, yPos);

    // Quotation title
    pdf.setFillColor(59, 130, 246);
    pdf.rect(20, yPos + 10, 170, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ใบเสนอราคา / Q U O T A T I O N', 105, yPos + 16, { align: 'center' });

    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Customer and quotation info box
    const boxY = yPos + 25;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(1);
    pdf.rect(20, boxY, 170, 25);
    
    // Customer info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ข้อมูลลูกค้า / C U S T O M E R :', 25, boxY + 6);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(quotationData.customer_name || '', 25, boxY + 12);
    
    if (quotationData.customer_address) {
      const custAddressLines = pdf.splitTextToSize(quotationData.customer_address, 80);
      let custY = boxY + 16;
      custAddressLines.slice(0, 2).forEach((line: string) => {
        pdf.text(line, 25, custY);
        custY += 4;
      });
    }

    // Quotation info (right side)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(`REF: ${quotationData.quotation_number || 'QT2025XXXXXX'}`, 190, boxY + 6, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`เลขที่: ${quotationData.quotation_number || ''}`, 190, boxY + 12, { align: 'right' });
    pdf.text(`วันที่: ${formatDate(quotationData.quotation_date)}`, 190, boxY + 16, { align: 'right' });
    if (quotationData.valid_until) {
      pdf.text(`วันหมดอายุ: ${formatDate(quotationData.valid_until)}`, 190, boxY + 20, { align: 'right' });
    }
    pdf.text(`หน้า: ${pageNumber} จาก ${totalPages}`, 190, boxY + (quotationData.valid_until ? 24 : 20), { align: 'right' });

    return boxY + 35; // Return Y position where content should start
  };

  const exportToPDF = async (options: PDFExportOptions = {}) => {
    const { 
      filename = 'quotation.pdf',
      quotationData,
      companyInfo
    } = options;

    if (!quotationData) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่พบข้อมูลใบเสนอราคา",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "กำลังสร้าง PDF",
        description: "กรุณารอสักครู่...",
      });

      // หาไฟล์ที่มี id "quotation-preview" สำหรับแปลงเป็น PDF
      const element = document.getElementById('quotation-preview');
      if (!element) {
        console.warn('ไม่พบ preview element, ใช้การสร้าง PDF แบบเดิม');
        // ใช้การสร้าง PDF แบบเดิมต่อไป
      } else {
        // ใช้ html2canvas เพื่อแปลง element เป็น PDF
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          height: element.scrollHeight,
          width: element.scrollWidth
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(filename);
        
        toast({
          title: "สร้าง PDF สำเร็จ",
          description: "ดาวน์โหลดไฟล์แล้ว",
        });
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = 297;
      const pageWidth = 210;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Calculate items per page (estimate based on average item height)
      const itemHeight = 15; // Average height per item including description
      const headerHeight = 70; // Height of header section
      const footerHeight = 40; // Height for summary and signatures
      const availableHeight = pageHeight - headerHeight - footerHeight;
      const itemsPerPage = Math.floor(availableHeight / itemHeight);
      
      const items = quotationData.items || [];
      const totalPages = Math.ceil(items.length / itemsPerPage) || 1;
      
      let currentPage = 1;
      let itemIndex = 0;

      while (currentPage <= totalPages) {
        if (currentPage > 1) {
          pdf.addPage();
        }

        // Add header for each page
        const contentStartY = addQuotationHeader(pdf, currentPage, totalPages, quotationData, companyInfo);

        // Table header
        pdf.setFillColor(59, 130, 246);
        pdf.rect(20, contentStartY, 170, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        
        // Column headers
        pdf.text('ลำดับ', 25, contentStartY + 5, { align: 'center' });
        pdf.text('รายการ', 60, contentStartY + 5, { align: 'center' });
        pdf.text('จำนวน', 125, contentStartY + 5, { align: 'center' });
        pdf.text('ราคาต่อหน่วย', 145, contentStartY + 5, { align: 'center' });
        pdf.text('ส่วนลด', 165, contentStartY + 5, { align: 'center' });
        pdf.text('จำนวนเงิน', 185, contentStartY + 5, { align: 'right' });

        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');

        // Add items for this page
        let yPos = contentStartY + 12;
        const itemsOnThisPage = items.slice(itemIndex, itemIndex + itemsPerPage);
        
        itemsOnThisPage.forEach((item: QuotationItem, index: number) => {
          const globalIndex = itemIndex + index + 1;
          
          // Draw item row
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(20, yPos + 8, 190, yPos + 8);
          
          pdf.setFontSize(8);
          // Item number
          pdf.text(globalIndex.toString(), 25, yPos + 3, { align: 'center' });
          
          // Item details
          pdf.setFont('helvetica', 'bold');
          const itemNameLines = pdf.splitTextToSize(item.product_name, 55);
          pdf.text(itemNameLines[0] || '', 30, yPos + 3);
          
          if (item.product_sku) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);
            pdf.text(`SKU: ${item.product_sku}`, 30, yPos + 7);
          }
          
          if (item.description) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);
            const descLines = pdf.splitTextToSize(item.description, 55);
            let descY = yPos + (item.product_sku ? 11 : 7);
            descLines.slice(0, 2).forEach((line: string) => {
              pdf.text(line, 30, descY);
              descY += 3;
            });
          }
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          
          // Quantity
          pdf.text(item.quantity.toString(), 125, yPos + 3, { align: 'center' });
          
          // Unit price
          pdf.text(formatCurrency(item.unit_price), 155, yPos + 3, { align: 'right' });
          
          // Discount
          pdf.text(formatCurrency(item.discount_amount), 172, yPos + 3, { align: 'right' });
          
          // Line total
          pdf.text(formatCurrency(item.line_total), 185, yPos + 3, { align: 'right' });
          
          yPos += itemHeight;
        });

        // Add summary on last page
        if (currentPage === totalPages) {
          yPos += 10;
          
          // Summary box
          pdf.setFillColor(248, 249, 250);
          pdf.rect(130, yPos, 60, 30, 'F');
          pdf.setDrawColor(0, 0, 0);
          pdf.rect(130, yPos, 60, 30);
          
          pdf.setFontSize(9);
          pdf.text('ยอดรวม:', 135, yPos + 6);
          pdf.text(formatCurrency(quotationData.subtotal), 185, yPos + 6, { align: 'right' });
          
          if (quotationData.discount_amount > 0) {
            pdf.text(`ส่วนลด (${quotationData.discount_percentage}%):`, 135, yPos + 12);
            pdf.text(`-${formatCurrency(quotationData.discount_amount)}`, 185, yPos + 12, { align: 'right' });
          }
          
          pdf.text('ภาษีมูลค่าเพิ่ม 7%:', 135, yPos + (quotationData.discount_amount > 0 ? 18 : 12));
          pdf.text(formatCurrency(quotationData.vat_amount), 185, yPos + (quotationData.discount_amount > 0 ? 18 : 12), { align: 'right' });
          
          pdf.setFont('helvetica', 'bold');
          const totalY = yPos + (quotationData.discount_amount > 0 ? 24 : 18);
          pdf.line(130, totalY - 2, 190, totalY - 2);
          pdf.text('ยอดรวมทั้งสิ้น:', 135, totalY + 2);
          pdf.text(formatCurrency(quotationData.total_amount), 185, totalY + 2, { align: 'right' });
        }

        itemIndex += itemsPerPage;
        currentPage++;
      }

      pdf.save(filename);

      toast({
        title: "ส่งออก PDF สำเร็จ",
        description: `บันทึกไฟล์ ${filename} เรียบร้อยแล้ว`,
      });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออก PDF ได้",
        variant: "destructive",
      });
    }
  };

  const printQuotation = async (elementId: string = 'quotation-preview') => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('ไม่พบองค์ประกอบที่จะพิมพ์');
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('ไม่สามารถเปิดหน้าต่างพิมพ์ได้');
      }

      // Get the element's HTML and styles
      const elementHTML = element.outerHTML;
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('');
          } catch (e) {
            return '';
          }
        })
        .join('');

      // Write content to print window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ใบเสนอราคา</title>
            <style>
              ${styles}
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${elementHTML}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };

      toast({
        title: "เปิดหน้าต่างพิมพ์",
        description: "กรุณาเลือกเครื่องพิมพ์และตั้งค่าการพิมพ์",
      });

    } catch (error) {
      console.error('Error printing:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถพิมพ์เอกสารได้",
        variant: "destructive",
      });
    }
  };

  return {
    exportToPDF,
    printQuotation
  };
};

// Utility function to generate filename with current date
export const generateQuotationFilename = (quotationNumber?: string) => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const baseFilename = quotationNumber ? `quotation_${quotationNumber}` : 'quotation';
  return `${baseFilename}_${dateStr}.pdf`;
};