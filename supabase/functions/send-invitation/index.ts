import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  role: 'admin' | 'accountant' | 'sales' | 'technician' | 'user';
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user is authenticated and is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !userRole) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions. Admin role required.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { email, role, message }: InvitationRequest = await req.json();

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email and role are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    if (existingUser.user) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if invitation already exists and is not expired
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('email', email)
      .gt('expires_at', new Date().toISOString())
      .is('accepted_at', null)
      .single();

    if (existingInvitation) {
      return new Response(JSON.stringify({ error: 'Active invitation already exists for this email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        role,
        invited_by: user.id
      })
      .select('*')
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return new Response(JSON.stringify({ error: 'Failed to create invitation' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get company settings
    const { data: companySettings } = await supabase
      .from('system_settings')
      .select('*')
      .in('setting_key', ['company_name', 'company_email']);

    const companyName = companySettings?.find(s => s.setting_key === 'company_name')?.setting_value || 'ENT GROUP';
    const companyEmail = companySettings?.find(s => s.setting_key === 'company_email')?.setting_value || 'admin@entgroup.co.th';

    // Send invitation email using Resend
    const resend = new Resend(resendApiKey);

    const roleNames = {
      admin: 'ผู้ดูแลระบบ (Administrator)',
      accountant: 'นักบัญชี (Accountant)',
      sales: 'พนักงานขาย (Sales)',
      technician: 'ช่างเทคนิค (Technician)',
      user: 'ผู้ใช้ทั่วไป (General User)'
    };

    const invitationUrl = `${supabaseUrl.replace('https://', 'https://id-preview--')}.lovable.app/invitation?token=${invitation.invitation_token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>เชิญเข้าร่วมระบบ ${companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 เชิญเข้าร่วมระบบ ${companyName}</h1>
          </div>
          <div class="content">
            <h2>สวัสดีครับ/ค่ะ</h2>
            <p>คุณได้รับเชิญให้เข้าร่วมระบบ ERP ของ ${companyName} ในตำแหน่ง:</p>
            <p><strong>🏷️ สิทธิ์การใช้งาน: ${roleNames[role as keyof typeof roleNames]}</strong></p>
            
            ${message ? `<p><strong>ข้อความจากผู้เชิญ:</strong><br>"${message}"</p>` : ''}
            
            <p>กรุณาคลิกปุ่มด้านล่างเพื่อลงทะเบียนและเข้าสู่ระบบ:</p>
            
            <div style="text-align: center;">
              <a href="${invitationUrl}" class="button">✅ รับคำเชิญและลงทะเบียน</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ ข้อมูลสำคัญ:</strong>
              <ul>
                <li>ลิงก์นี้จะหมดอายุภายใน 7 วัน</li>
                <li>คุณจะต้องใช้อีเมลนี้ (${email}) ในการลงทะเบียน</li>
                <li>หากมีปัญหา กรุณาติดต่อผู้ดูแลระบบ</li>
              </ul>
            </div>
            
            <p>หากปุ่มไม่ทำงาน คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
              ${invitationUrl}
            </p>
          </div>
          <div class="footer">
            <p>ระบบ ERP ของ ${companyName}<br>
            📧 ${companyEmail}</p>
            <p style="font-size: 12px; color: #999;">
              หากคุณไม่ได้ขอคำเชิญนี้ กรุณาเพิกเฉยต่ออีเมลนี้
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: `${companyName} <${companyEmail}>`,
      to: [email],
      subject: `🎉 เชิญเข้าร่วมระบบ ${companyName} - ตำแหน่ง ${roleNames[role as keyof typeof roleNames]}`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
      // Don't delete the invitation if email fails, admin can resend
      return new Response(JSON.stringify({ 
        error: 'Invitation created but email failed to send. Please try again.',
        invitationId: invitation.id 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'invitation_sent',
      resource_type: 'user_invitation',
      resource_id: invitation.id,
      details: { email, role, invitation_token: invitation.invitation_token }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-invitation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);