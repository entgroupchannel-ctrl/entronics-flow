import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase connection test result:', { data, error });
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionError(true);
          toast({
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่อีกครั้ง',
            variant: 'destructive',
          });
        } else {
          // If already authenticated, redirect to home
          if (data.session) {
            navigate('/');
            return;
          }
        }
      } catch (err) {
        console.error('Auth component error:', err);
        setConnectionError(true);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'เกิดข้อผิดพลาดในการโหลดหน้า กรุณาลองใหม่อีกครั้ง',
          variant: 'destructive',
        });
      } finally {
        setIsInitializing(false);
      }
    };

    testConnection();
  }, [navigate, toast]);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error screen if connection failed
  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">เกิดข้อผิดพลาด</CardTitle>
            <CardDescription>ไม่สามารถเชื่อมต่อกับระบบได้</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              ลองใหม่อีกครั้ง
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const username = formData.get('username') as string;

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          username: username,
        }
      }
    });

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'สมัครสมาชิกสำเร็จ',
        description: 'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
      });
    }

    setIsLoading(false);
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message === 'Invalid login credentials' 
          ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'เข้าสู่ระบบสำเร็จ',
        description: 'ยินดีต้อนรับ!',
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Inventory System</CardTitle>
          <CardDescription>เข้าสู่ระบบหรือสมัครสมาชิก</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">อีเมล</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">รหัสผ่าน</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">ชื่อ-นามสกุล</Label>
                  <Input
                    id="signup-fullname"
                    name="fullName"
                    placeholder="ชื่อ นามสกุล"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">ชื่อผู้ใช้</Label>
                  <Input
                    id="signup-username"
                    name="username"
                    placeholder="username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">อีเมล</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">รหัสผ่าน</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}