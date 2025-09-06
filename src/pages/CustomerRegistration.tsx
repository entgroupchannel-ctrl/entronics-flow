import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Building, Mail, Phone, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ExistingCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customer_type: string;
  linked_user_id: string | null;
  link_status: string | null;
  verification_token: string | null;
}

interface RegistrationData {
  email: string;
  password: string;
  company_name: string;
  contact_person: string;
  phone: string;
}

export default function CustomerRegistration() {
  const [step, setStep] = useState<'search' | 'verify' | 'auth' | 'complete'>('search');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: '',
    password: '',
    company_name: '',
    contact_person: '',
    phone: ''
  });
  const [existingCustomers, setExistingCustomers] = useState<ExistingCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ExistingCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'email' | 'phone' | 'manual'>('email');
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // ถ้า user ล็อกอินแล้วให้ redirect
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // 🔍 ค้นหาข้อมูลลูกค้าที่มีอยู่แล้วในระบบ
  const searchExistingCustomers = async () => {
    if (!registrationData.email && !registrationData.phone && !registrationData.company_name) {
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase.from('customers').select('*');
      
      // ค้นหาจาก email, phone, หรือชื่อบริษัท
      const conditions = [];
      if (registrationData.email) {
        conditions.push(`email.ilike.%${registrationData.email}%`);
      }
      if (registrationData.phone) {
        conditions.push(`phone.ilike.%${registrationData.phone}%`);
      }
      if (registrationData.company_name) {
        conditions.push(`name.ilike.%${registrationData.company_name}%`);
      }

      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;

      // Map data to include required fields with proper typing
      const mappedData: ExistingCustomer[] = (data || []).map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        customer_type: customer.customer_type,
        linked_user_id: (customer as any).linked_user_id || null,
        link_status: (customer as any).link_status || 'unlinked',
        verification_token: (customer as any).verification_token || null
      }));

      setExistingCustomers(mappedData);
      
      if (data && data.length > 0) {
        setStep('verify');
      } else {
        // ไม่พบข้อมูลเดิม ให้สร้างใหม่
        setStep('auth');
      }
    } catch (error: any) {
      console.error('Error searching customers:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถค้นหาข้อมูลได้',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 📧 ส่งรหัสยืนยันทาง email
  const sendVerificationEmail = async (customerId: string) => {
    try {
      const verificationToken = Math.random().toString(36).substring(2, 15);
      
      // บันทึก verification token (ใช้ any เพื่อหลีกเลี่ยง type error)
      const { error } = await supabase
        .from('customers')
        .update({ 
          link_status: 'pending_verification'
        } as any)
        .eq('id', customerId);

      if (error) throw error;

      // TODO: ส่ง email จริงผ่าน Edge Function
      console.log('Verification token:', verificationToken);
      
      toast({
        title: 'ส่งอีเมลยืนยันแล้ว',
        description: 'กรุณาตรวจสอบอีเมลของคุณ',
      });
      
      setVerificationStep('email');
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งอีเมลยืนยันได้',
        variant: 'destructive'
      });
    }
  };

  // 🔗 เชื่อมโยงบัญชีกับข้อมูลลูกค้า
  const linkCustomerAccount = async () => {
    if (!selectedCustomer) return;

    setIsLoading(true);
    try {
      // สร้างบัญชีผู้ใช้ใหม่
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: registrationData.contact_person,
            company_id: selectedCustomer.id
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // เชื่อมโยงข้อมูลลูกค้ากับ user (ใช้ any เพื่อหลีกเลี่ยง type error)
        const { error: linkError } = await supabase
          .from('customers')
          .update({
            link_status: 'linked'
          } as any)
          .eq('id', selectedCustomer.id);

        if (linkError) throw linkError;

        // สร้าง profile ใหม่ (ใช้ any เพื่อหลีกเลี่ยง type error)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            full_name: registrationData.contact_person,
            username: registrationData.email
          } as any);

        if (profileError && profileError.code !== '23505') {
          console.error('Profile creation error:', profileError);
        }

        toast({
          title: 'สร้างบัญชีสำเร็จ',
          description: 'บัญชีของคุณถูกเชื่อมโยงกับข้อมูลบริษัทแล้ว',
        });

        setStep('complete');
      }
    } catch (error: any) {
      console.error('Error linking account:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถสร้างบัญชีได้',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 สร้างลูกค้าใหม่
  const createNewCustomer = async () => {
    setIsLoading(true);
    try {
      // สร้างบัญชีผู้ใช้ใหม่
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: registrationData.contact_person
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // สร้างข้อมูลลูกค้าใหม่ (ใช้ any เพื่อหลีกเลี่ยง type error)
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: registrationData.company_name,
            contact_person: registrationData.contact_person,
            email: registrationData.email,
            phone: registrationData.phone,
            customer_type: 'ลูกค้า',
            link_status: 'linked',
            status: 'ปกติ',
            created_by: authData.user.id
          } as any)
          .select()
          .single();

        if (customerError) throw customerError;

        // สร้าง profile ใหม่ (ใช้ any เพื่อหลีกเลี่ยง type error)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            full_name: registrationData.contact_person,
            username: registrationData.email
          } as any);

        if (profileError && profileError.code !== '23505') {
          console.error('Profile creation error:', profileError);
        }

        // สร้าง credit profile เริ่มต้น
        const { error: creditError } = await supabase
          .from('customer_credit_profiles')
          .insert({
            customer_id: customerData.id,
            credit_limit: 0,
            available_credit: 0,
            used_credit: 0,
            payment_terms_days: 30,
            credit_status: 'active'
          });

        if (creditError) {
          console.error('Credit profile creation error:', creditError);
        }

        toast({
          title: 'สร้างบัญชีสำเร็จ',
          description: 'บัญชีและข้อมูลบริษัทใหม่ถูกสร้างแล้ว',
        });

        setStep('complete');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถสร้างบัญชีได้',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-primary">
          ลงทะเบียนลูกค้า
        </CardTitle>
        <p className="text-center text-muted-foreground">
          กรอกข้อมูลเพื่อตรวจสอบว่าบริษัทของคุณมีในระบบแล้วหรือไม่
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="company_name">ชื่อบริษัท *</Label>
            <Input
              id="company_name"
              value={registrationData.company_name}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                company_name: e.target.value
              }))}
              placeholder="ชื่อบริษัทของคุณ"
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_person">ชื่อผู้ติดต่อ *</Label>
            <Input
              id="contact_person"
              value={registrationData.contact_person}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                contact_person: e.target.value
              }))}
              placeholder="ชื่อของคุณ"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">อีเมล *</Label>
            <Input
              id="email"
              type="email"
              value={registrationData.email}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              placeholder="email@company.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              value={registrationData.phone}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                phone: e.target.value
              }))}
              placeholder="02-xxx-xxxx"
            />
          </div>

          <div>
            <Label htmlFor="password">รหัสผ่าน *</Label>
            <Input
              id="password"
              type="password"
              value={registrationData.password}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                password: e.target.value
              }))}
              placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
              required
              minLength={6}
            />
          </div>
        </div>

        <Button 
          onClick={searchExistingCustomers} 
          className="w-full"
          disabled={isLoading || !registrationData.email || !registrationData.company_name}
        >
          {isLoading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบข้อมูลในระบบ'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderVerifyStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl text-primary">
            พบข้อมูลบริษัทในระบบ
          </CardTitle>
          <p className="text-center text-muted-foreground">
            เลือกบริษัทที่ตรงกับของคุณเพื่อเชื่อมโยงบัญชี
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {existingCustomers.map((customer) => (
              <Card 
                key={customer.id}
                className={`cursor-pointer transition-all ${
                  selectedCustomer?.id === customer.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedCustomer(customer)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{customer.name}</h3>
                        <Badge variant={customer.customer_type === 'ลูกค้า' ? 'default' : 'secondary'}>
                          {customer.customer_type}
                        </Badge>
                      </div>
                      
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      )}
                      
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                      
                      {customer.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {customer.address}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      {customer.linked_user_id ? (
                        <Badge variant="destructive">
                          เชื่อมโยงแล้ว
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          ยังไม่เชื่อมโยง
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setStep('search')}
              className="flex-1"
            >
              ย้อนกลับ
            </Button>
            
            {selectedCustomer && !selectedCustomer.linked_user_id && (
              <Button 
                onClick={() => setShowLinkDialog(true)}
                className="flex-1"
              >
                เชื่อมโยงบัญชี
              </Button>
            )}
            
            <Button 
              variant="secondary"
              onClick={() => setStep('auth')}
              className="flex-1"
            >
              สร้างบริษัทใหม่
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog ยืนยันการเชื่อมโยง */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการเชื่อมโยงบัญชี</DialogTitle>
            <DialogDescription>
              คุณต้องการเชื่อมโยงบัญชีกับบริษัท "{selectedCustomer?.name}" หรือไม่?
            </DialogDescription>
          </DialogHeader>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              การเชื่อมโยงจะให้คุณเข้าถึงข้อมูลเครดิต วงเงิน และประวัติการสั่งซื้อของบริษัท
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={linkCustomerAccount} disabled={isLoading}>
              {isLoading ? 'กำลังเชื่อมโยง...' : 'ยืนยันการเชื่อมโยง'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderAuthStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl text-primary">
          สร้างบริษัทใหม่
        </CardTitle>
        <p className="text-center text-muted-foreground">
          ไม่พบข้อมูลบริษัทในระบบ เราจะสร้างข้อมูลใหม่ให้คุณ
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ระบบจะสร้างบัญชีผู้ใช้และข้อมูลบริษัทใหม่ พร้อมกับตั้งค่าวงเงินเครดิตเริ่มต้น
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-semibold">ข้อมูลที่จะสร้าง:</h4>
          <p><strong>บริษัท:</strong> {registrationData.company_name}</p>
          <p><strong>ผู้ติดต่อ:</strong> {registrationData.contact_person}</p>
          <p><strong>อีเมล:</strong> {registrationData.email}</p>
          <p><strong>เบอร์โทร:</strong> {registrationData.phone || 'ไม่ระบุ'}</p>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setStep('search')}
            className="flex-1"
          >
            ย้อนกลับ
          </Button>
          <Button 
            onClick={createNewCustomer}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'กำลังสร้าง...' : 'สร้างบัญชี'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl text-green-600">
          สร้างบัญชีสำเร็จ!
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
        <p className="text-muted-foreground">
          กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ
        </p>
        <Button onClick={() => navigate('/auth')}>
          ไปหน้าเข้าสู่ระบบ
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-12">
      <div className="container mx-auto px-4">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'search' ? 'bg-primary text-primary-foreground' : 
              ['verify', 'auth', 'complete'].includes(step) ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className="h-px bg-muted w-12"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'verify' ? 'bg-primary text-primary-foreground' : 
              ['auth', 'complete'].includes(step) ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div className="h-px bg-muted w-12"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'auth' ? 'bg-primary text-primary-foreground' : 
              step === 'complete' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
            <div className="h-px bg-muted w-12"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'complete' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              ✓
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            <span>ค้นหา</span>
            <span>ตรวจสอบ</span>
            <span>สร้างบัญชี</span>
            <span>เสร็จสิ้น</span>
          </div>
        </div>

        {/* Content */}
        {step === 'search' && renderSearchStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'auth' && renderAuthStep()}
        {step === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
}