import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ServiceRequest {
  id: string;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  device_type: string;
  device_brand?: string;
  device_model?: string;
  problem_description: string;
  priority: string;
  status: string;
  created_at: string;
}

interface EmailRequest {
  serviceRequest: ServiceRequest;
  customerEmail: string;
  type?: 'confirmation' | 'completion';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceRequest, customerEmail, type = 'confirmation' }: EmailRequest = await req.json();

    if (!serviceRequest || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const priorityText = {
      low: 'ปกติ',
      medium: 'ปานกลาง', 
      high: 'สูง',
      urgent: 'เร่งด่วนมาก'
    }[serviceRequest.priority] || 'ปานกลาง';

    const statusText = {
      pending: 'รอดำเนินการ',
      assigned: 'มอบหมายช่างแล้ว',
      in_progress: 'กำลังดำเนินการ',
      waiting_parts: 'รออะไหล่',
      completed: 'เสร็จสิ้น',
      cancelled: 'ยกเลิก'
    }[serviceRequest.status] || 'รอดำเนินการ';

    let subject, htmlContent;

    if (type === 'confirmation') {
      subject = `ยืนยันการรับแจ้งซ่อม - หมายเลข ${serviceRequest.ticket_number}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">📱 ยืนยันการรับแจ้งซ่อม</h1>
              <div style="background-color: #2563eb; color: white; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold;">
                ${serviceRequest.ticket_number}
              </div>
            </div>
            
            <p>เรียน คุณ${serviceRequest.customer_name}</p>
            <p>เราได้รับแจ้งซ่อมของท่านเรียบร้อยแล้ว ขอบคุณที่เลือกใช้บริการของเรา</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">รายละเอียดการซ่อม</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold; width: 30%;">หมายเลขใบซ่อม:</td>
                  <td style="padding: 8px 0;">${serviceRequest.ticket_number}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold;">อุปกรณ์:</td>
                  <td style="padding: 8px 0;">${serviceRequest.device_type} ${serviceRequest.device_brand || ''} ${serviceRequest.device_model || ''}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold;">ปัญหา:</td>
                  <td style="padding: 8px 0;">${serviceRequest.problem_description}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold;">ความเร่งด่วน:</td>
                  <td style="padding: 8px 0;">${priorityText}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold;">สถานะ:</td>
                  <td style="padding: 8px 0;">${statusText}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">วันที่แจ้ง:</td>
                  <td style="padding: 8px 0;">${new Date(serviceRequest.created_at).toLocaleDateString('th-TH')}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <h4 style="margin-top: 0; color: #1e40af;">📞 ขั้นตอนต่อไป</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>ทีมช่างจะติดต่อกลับภายใน 24 ชั่วโมง</li>
                <li>จะมีการประเมินค่าใช้จ่ายเบื้องต้น</li>
                <li>หากต้องการอะไหล่เพิ่มเติม จะแจ้งให้ทราบ</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                หากมีข้อสงสัย กรุณาติดต่อ:<br>
                📞 02-XXX-XXXX | 📧 support@company.com<br>
                พร้อมแจ้งหมายเลขใบซ่อม: <strong>${serviceRequest.ticket_number}</strong>
              </p>
            </div>
          </div>
        </div>
      `;
    } else {
      subject = `การซ่อมเสร็จสิ้น - หมายเลข ${serviceRequest.ticket_number}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin-bottom: 10px;">✅ การซ่อมเสร็จสิ้น</h1>
              <div style="background-color: #059669; color: white; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold;">
                ${serviceRequest.ticket_number}
              </div>
            </div>
            
            <p>เรียน คุณ${serviceRequest.customer_name}</p>
            <p>การซ่อม ${serviceRequest.device_type} ของท่านเสร็จเรียบร้อยแล้ว!</p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="color: #065f46; margin-top: 0;">📦 พร้อมรับมอบแล้ว</h3>
              <p style="margin-bottom: 10px;">กรุณาติดต่อมารับอุปกรณ์ของท่าน หรือเราจะจัดส่งตามที่อยู่ที่ระบุไว้</p>
              <p style="font-weight: bold; color: #065f46;">โทร: 02-XXX-XXXX</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                ขอบคุณที่เลือกใช้บริการของเรา<br>
                หากมีปัญหาใดๆ กรุณาติดต่อกลับมาได้ตลอดเวลา
              </p>
            </div>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: 'Service Center <noreply@yourcompany.com>',
      to: [customerEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResponse.data?.id,
        message: 'Email sent successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-service-confirmation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});