import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeliveryAssignmentRequest {
  deliveryNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  assignmentType: 'staff' | 'courier';
  assignedTo: string;
  assignedPhone?: string;
  vehicleInfo?: string;
  notes?: string;
  assignedBy: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      deliveryNumber,
      customerName,
      customerPhone,
      deliveryAddress,
      assignmentType,
      assignedTo,
      assignedPhone,
      vehicleInfo,
      notes,
      assignedBy
    }: DeliveryAssignmentRequest = await req.json();

    console.log("Sending delivery assignment notification:", { deliveryNumber, assignmentType, assignedTo });

    const assignmentTypeText = assignmentType === 'staff' ? 'พนักงานบริษัท' : 'Courier Service';
    const currentDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailResponse = await resend.emails.send({
      from: "ENT Group Delivery System <delivery@entgroup.co.th>",
      to: ["sales@entgroup.co.th"],
      subject: `🚚 แจ้งมอบหมายการจัดส่ง - ${deliveryNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">📦 ENT Group Delivery System</h1>
              <h2 style="color: #1f2937; margin: 10px 0 0 0; font-size: 20px;">แจ้งมอบหมายการจัดส่ง</h2>
            </div>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
              <h3 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">📋 ข้อมูลการจัดส่ง</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 35%;">หมายเลขจัดส่ง:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${deliveryNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ลูกค้า:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">เบอร์โทร:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${customerPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">ที่อยู่จัดส่ง:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${deliveryAddress}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
              <h3 style="color: #16a34a; margin: 0 0 15px 0; font-size: 18px;">👤 ข้อมูลผู้รับมอบหมาย</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 35%;">ประเภท:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${assignmentTypeText}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ชื่อ:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${assignedTo}</td>
                </tr>
                ${assignedPhone ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">เบอร์โทร:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${assignedPhone}</td>
                </tr>
                ` : ''}
                ${vehicleInfo ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ยานพาหนะ:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${vehicleInfo}</td>
                </tr>
                ` : ''}
                ${notes ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">หมายเหตุ:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${notes}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>📅 วันที่มอบหมาย:</strong> ${currentDate}<br>
                <strong>👨‍💼 มอบหมายโดย:</strong> ${assignedBy}
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                อีเมลนี้ส่งอัตโนมัติจากระบบ ENT Group Delivery System<br>
                หากมีคำถามกรุณาติดต่อทีม IT
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-delivery-assignment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);