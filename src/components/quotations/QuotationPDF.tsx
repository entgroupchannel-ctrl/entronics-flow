import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

interface PDFExportOptions {
  filename?: string;
  elementId?: string;
  scale?: number;
  quality?: number;
}

export const useQuotationPDF = () => {
  const { toast } = useToast();

  const exportToPDF = async (options: PDFExportOptions = {}) => {
    const {
      filename = 'quotation.pdf',
      elementId = 'quotation-preview',
      scale = 2,
      quality = 0.95
    } = options;

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('ไม่พบองค์ประกอบที่จะส่งออก');
      }

      // Show loading toast
      toast({
        title: "กำลังสร้าง PDF",
        description: "กรุณารอสักครู่...",
      });

      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/jpeg', quality),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/jpeg', quality),
          'JPEG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Save the PDF
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