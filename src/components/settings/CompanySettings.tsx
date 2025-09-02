import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save, Building, FileImage } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface CompanyData {
  name: string;
  address: string;
  tax_id: string;
  phone: string;
  mobile?: string;
  fax?: string;
  email?: string;
  website?: string;
  logo_url?: string;
}

export const CompanySettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: 'ENT GROUP CO., LTD.',
    address: '70/5 Metro Beach Town Chaeng Watthana 2 Village, Moo 4\nKhlong Thanon Praditsathan, Pak Kret, Nonthaburi 11120',
    tax_id: '0135558013167',
    phone: '02-045-6104',
    mobile: '095-7391053, 082-2497922',
    fax: '02-045-6105',
    email: '',
    website: 'www.entgroup.co.th',
    logo_url: ''
  });

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      // For now, we'll use localStorage. Later this can be moved to Supabase
      const savedSettings = localStorage.getItem('company_settings');
      if (savedSettings) {
        setCompanyData(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setLogoUploading(true);

      // For now, convert to base64. Later this can be uploaded to Supabase Storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCompanyData(prev => ({
          ...prev,
          logo_url: base64
        }));
        
        toast({
          title: "อัปโหลดสำเร็จ",
          description: "อัปโหลดโลโก้เรียบร้อยแล้ว",
        });
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปโหลดโลโก้ได้",
        variant: "destructive",
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!companyData.name || !companyData.address || !companyData.tax_id) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกชื่อบริษัท ที่อยู่ และเลขประจำตัวผู้เสียภาษี",
          variant: "destructive",
        });
        return;
      }

      // For now, save to localStorage. Later this can be saved to Supabase
      localStorage.setItem('company_settings', JSON.stringify(companyData));

      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกข้อมูลบริษัทเรียบร้อยแล้ว",
      });

    } catch (error) {
      console.error('Error saving company settings:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          ข้อมูลบริษัท
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">โลโก้บริษัท</Label>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {companyData.logo_url ? (
                <img 
                  src={companyData.logo_url} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <FileImage className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">ไม่มีโลโก้</span>
                </div>
              )}
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="relative"
                disabled={logoUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {logoUploading ? 'กำลังอัปโหลด...' : 'เลือกโลโก้'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                รองรับ JPG, PNG ขนาดไม่เกิน 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name">ชื่อบริษัท *</Label>
              <Input
                id="company-name"
                value={companyData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="ENT GROUP CO., LTD."
              />
            </div>

            <div>
              <Label htmlFor="tax-id">เลขประจำตัวผู้เสียภาษี *</Label>
              <Input
                id="tax-id"
                value={companyData.tax_id}
                onChange={(e) => handleInputChange('tax_id', e.target.value)}
                placeholder="0135558013167"
              />
            </div>

            <div>
              <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="02-045-6104"
              />
            </div>

            <div>
              <Label htmlFor="mobile">เบอร์มือถือ</Label>
              <Input
                id="mobile"
                value={companyData.mobile || ''}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="095-7391053, 082-2497922"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address">ที่อยู่ *</Label>
              <Textarea
                id="address"
                value={companyData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="70/5 Metro Beach Town Chaeng Watthana 2 Village..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="fax">แฟกซ์</Label>
              <Input
                id="fax"
                value={companyData.fax || ''}
                onChange={(e) => handleInputChange('fax', e.target.value)}
                placeholder="02-045-6105"
              />
            </div>

            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="info@entgroup.co.th"
              />
            </div>

            <div>
              <Label htmlFor="website">เว็บไซต์</Label>
              <Input
                id="website"
                value={companyData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="www.entgroup.co.th"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanySettings;