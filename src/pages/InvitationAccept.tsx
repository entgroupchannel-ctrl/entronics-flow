import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Mail, Shield, Building2 } from 'lucide-react';

export default function InvitationAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [step, setStep] = useState('validating'); // validating, signup, success, error
  const [error, setError] = useState('');
  
  // Signup form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const token = searchParams.get('token');

  const roleLabels = {
    admin: 'ผู้ดูแลระบบ',
    accountant: 'นักบัญชี',
    sales: 'พนักงานขาย',
    technician: 'ช่างเทคนิค',
    user: 'ผู้ใช้ทั่วไป'
  };

  useEffect(() => {
    if (!token) {
      setError('ไม่พบ token สำหรับคำเชิญ');
      setStep('error');
      setLoading(false);
      return;
    }

    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      setLoading(true);

      // Check if invitation exists and is valid
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('invitation_token', token)
        .gt('expires_at', new Date().toISOString())
        .is('accepted_at', null)
        .single();

      if (error || !data) {
        setError('คำเชิญไม่ถูกต้องหรือหมดอายุแล้ว');
        setStep('error');
        return;
      }

      // Skip user existence check for now - let Supabase handle it during signup
      // We'll rely on the signup process to handle existing users

      setInvitation(data);
      setEmail(data.email);
      setStep('signup');
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      setError('เกิดข้อผิดพลาดในการตรวจสอบคำเชิญ');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านให้ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "รหัสผ่านสั้นเกินไป",
        description: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
        variant: "destructive",
      });
      return;
    }

    setIsSigningUp(true);
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Accept the invitation
        const { data: acceptResult, error: acceptError } = await supabase
          .rpc('accept_invitation', { invitation_token: token });

        if (acceptError) throw acceptError;

        const result = acceptResult as any;
        if (result?.success) {
          toast({
            title: "ลงทะเบียนสำเร็จ",
            description: `ยินดีต้อนรับสู่ระบบ! สิทธิ์ของคุณ: ${roleLabels[invitation.role as keyof typeof roleLabels]}`,
          });
          setStep('success');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          throw new Error(result?.message || 'ไม่สามารถยอมรับคำเชิญได้');
        }
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลงทะเบียนได้",
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>กำลังตรวจสอบคำเชิญ...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">ข้อผิดพลาด</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">ลงทะเบียนสำเร็จ!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              ยินดีต้อนรับสู่ระบบ ENT GROUP
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                สิทธิ์ของคุณ: <strong>{roleLabels[invitation?.role as keyof typeof roleLabels]}</strong>
              </p>
            </div>
            <p className="text-sm text-gray-500">
              กำลังนำคุณไปยังหน้าหลัก...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <CardTitle>เข้าร่วมระบบ ENT GROUP</CardTitle>
          <p className="text-sm text-gray-600">
            คุณได้รับเชิญให้เข้าร่วมระบบในตำแหน่ง
          </p>
          <div className="bg-blue-50 p-3 rounded-lg mt-2">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-700">
                {roleLabels[invitation?.role as keyof typeof roleLabels]}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="สร้างรหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                required
                minLength={8}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="ยืนยันรหัสผ่าน"
                required
              />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>หมายเหตุ:</strong> หลังจากลงทะเบียน คุณอาจต้องยืนยันอีเมลก่อนเข้าใช้งานระบบ
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนและเข้าร่วมระบบ'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}