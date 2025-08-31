import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Sidebar } from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings as SettingsIcon, 
  UserPlus, 
  Shield, 
  Users, 
  Building2, 
  Mail, 
  Clock, 
  Trash2, 
  Send,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  Megaphone,
  Package,
  Tag,
  TrendingUp,
  Star,
  Edit,
  Plus,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { format } from 'date-fns';

interface UserInvitation {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  category: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  details: any;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  target_roles: string[];
  is_active: boolean;
  published_at: string;
  expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState('settings');
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('user');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Announcement form state
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementDescription, setAnnouncementDescription] = useState('');
  const [announcementType, setAnnouncementType] = useState('general');
  const [announcementPriority, setAnnouncementPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [announcementTargetRoles, setAnnouncementTargetRoles] = useState<string[]>(['all']);
  const [announcementExpiresAt, setAnnouncementExpiresAt] = useState('');
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);

  const roleLabels = {
    admin: 'ผู้ดูแลระบบ',
    accountant: 'นักบัญชี',
    sales: 'พนักงานขาย',
    technician: 'ช่างเทคนิค',
    user: 'ผู้ใช้ทั่วไป'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadInvitations(),
        loadSystemSettings(),
        loadAuditLogs(),
        loadAnnouncements()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลคำเชิญได้",
        variant: "destructive",
      });
      return;
    }

    setInvitations(data || []);
  };

  const loadSystemSettings = async () => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดการตั้งค่าระบบได้",
        variant: "destructive",
      });
      return;
    }

    setSystemSettings(data || []);
  };

  const loadAuditLogs = async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดประวัติการใช้งานได้",
        variant: "destructive",
      });
      return;
    }

    setAuditLogs(data || []);
  };

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลประกาศได้",
        variant: "destructive",
      });
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail || !inviteRole) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกอีเมลและเลือกสิทธิ์การใช้งาน",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: inviteEmail,
          role: inviteRole,
          message: inviteMessage
        }
      });

      if (error) throw error;

      toast({
        title: "ส่งคำเชิญสำเร็จ",
        description: `ส่งคำเชิญไปยัง ${inviteEmail} เรียบร้อยแล้ว`,
      });

      // Reset form
      setInviteEmail('');
      setInviteRole('user');
      setInviteMessage('');
      setShowInviteDialog(false);
      
      // Reload invitations
      loadInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งคำเชิญได้",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const updateSystemSetting = async (settingKey: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: newValue,
          updated_by: user?.id 
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      toast({
        title: "อัพเดทสำเร็จ",
        description: "การตั้งค่าถูกบันทึกเรียบร้อยแล้ว",
      });

      loadSystemSettings();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "ลบคำเชิญสำเร็จ",
        description: "คำเชิญถูกลบเรียบร้อยแล้ว",
      });

      loadInvitations();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบคำเชิญได้",
        variant: "destructive",
      });
    }
  };

  const getInvitationStatus = (invitation: UserInvitation) => {
    if (invitation.accepted_at) {
      return <Badge className="bg-green-100 text-green-800">ยอมรับแล้ว</Badge>;
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge className="bg-red-100 text-red-800">หมดอายุ</Badge>;
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800">รอการตอบรับ</Badge>;
  };

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">ตั้งค่าระบบ / Settings</h1>
            <p className="text-sm text-muted-foreground">จัดการการตั้งค่าและความปลอดภัยของระบบ</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">จัดการผู้ใช้</TabsTrigger>
          <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
          <TabsTrigger value="company">ข้อมูลบริษัท</TabsTrigger>
          <TabsTrigger value="announcements">ข่าวสารประกาศ</TabsTrigger>
          <TabsTrigger value="audit">ประวัติการใช้งาน</TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                การจัดการผู้ใช้งาน
              </CardTitle>
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    เชิญผู้ใช้ใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>เชิญผู้ใช้เข้าร่วมระบบ</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">อีเมล</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">สิทธิ์การใช้งาน</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสิทธิ์" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="message">ข้อความ (ไม่บังคับ)</Label>
                      <Textarea
                        id="message"
                        placeholder="ข้อความเพิ่มเติมสำหรับผู้รับคำเชิญ"
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowInviteDialog(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        onClick={sendInvitation}
                        disabled={isInviting}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isInviting ? 'กำลังส่ง...' : 'ส่งคำเชิญ'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>สิทธิ์</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>วันที่เชิญ</TableHead>
                    <TableHead>หมดอายุ</TableHead>
                    <TableHead className="text-center">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {roleLabels[invitation.role as keyof typeof roleLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>{getInvitationStatus(invitation)}</TableCell>
                      <TableCell>
                        {format(new Date(invitation.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invitation.expires_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-center">
                        {!invitation.accepted_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteInvitation(invitation.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                การตั้งค่าความปลอดภัย
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {systemSettings
                .filter(setting => setting.category === 'security')
                .map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        {setting.description}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {setting.setting_key}
                      </p>
                    </div>
                    <div className="w-32">
                      {setting.setting_key === 'require_2fa' ? (
                        <Switch
                          checked={setting.setting_value === 'true'}
                          onCheckedChange={(checked) =>
                            updateSystemSetting(setting.setting_key, checked ? 'true' : 'false')
                          }
                        />
                      ) : (
                        <Input
                          type="number"
                          value={setting.setting_value}
                          onChange={(e) =>
                            updateSystemSetting(setting.setting_key, e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Info Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                ข้อมูลบริษัท
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {systemSettings
                .filter(setting => setting.category === 'company')
                .map((setting) => (
                  <div key={setting.id}>
                    <Label className="text-sm font-medium">
                      {setting.description}
                    </Label>
                    <Input
                      className="mt-1"
                      value={setting.setting_value?.replace(/"/g, '')}
                      onChange={(e) =>
                        updateSystemSetting(setting.setting_key, `"${e.target.value}"`)
                      }
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                ประวัติการใช้งาน (50 รายการล่าสุด)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เวลา</TableHead>
                    <TableHead>การกระทำ</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.resource_type}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                จัดการข่าวสารและประกาศ
              </CardTitle>
              <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างประกาศใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAnnouncement ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">หัวข้อประกาศ</Label>
                      <Input
                        id="title"
                        placeholder="หัวข้อประกาศ"
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">รายละเอียด</Label>
                      <Textarea
                        id="description"
                        placeholder="รายละเอียดประกาศ"
                        rows={4}
                        value={announcementDescription}
                        onChange={(e) => setAnnouncementDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">ประเภทประกาศ</Label>
                        <Select value={announcementType} onValueChange={setAnnouncementType}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกประเภท" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">ทั่วไป</SelectItem>
                            <SelectItem value="new_product">สินค้าใหม่</SelectItem>
                            <SelectItem value="promotion">โปรโมชั่น</SelectItem>
                            <SelectItem value="stock_update">อัพเดทสต็อก</SelectItem>
                            <SelectItem value="maintenance">การบำรุงรักษา</SelectItem>
                            <SelectItem value="policy">นโยบาย</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">ความสำคัญ</Label>
                        <Select value={announcementPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setAnnouncementPriority(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกความสำคัญ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">ปกติ</SelectItem>
                            <SelectItem value="medium">ปานกลาง</SelectItem>
                            <SelectItem value="high">สำคัญ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="expires">วันหมดอายุ (ไม่บังคับ)</Label>
                      <Input
                        id="expires"
                        type="datetime-local"
                        value={announcementExpiresAt}
                        onChange={(e) => setAnnouncementExpiresAt(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAnnouncementDialog(false);
                          setEditingAnnouncement(null);
                          setAnnouncementTitle('');
                          setAnnouncementDescription('');
                          setAnnouncementType('general');
                          setAnnouncementPriority('medium');
                          setAnnouncementTargetRoles(['all']);
                          setAnnouncementExpiresAt('');
                        }}
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        onClick={() => {/* TODO: implement save */}}
                        disabled={isSubmittingAnnouncement}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmittingAnnouncement ? 'กำลังบันทึก...' : 'บันทึก'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>หัวข้อ</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>ความสำคัญ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead className="text-center">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {announcement.type === 'general' && 'ทั่วไป'}
                          {announcement.type === 'new_product' && 'สินค้าใหม่'}
                          {announcement.type === 'promotion' && 'โปรโมชั่น'}
                          {announcement.type === 'stock_update' && 'อัพเดทสต็อก'}
                          {announcement.type === 'maintenance' && 'การบำรุงรักษา'}
                          {announcement.type === 'policy' && 'นโยบาย'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            announcement.priority === 'high' ? 'destructive' : 
                            announcement.priority === 'medium' ? 'outline' : 'secondary'
                          }
                        >
                          {announcement.priority === 'high' && 'สำคัญ'}
                          {announcement.priority === 'medium' && 'ปานกลาง'}
                          {announcement.priority === 'low' && 'ปกติ'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {announcement.is_active ? (
                            <Badge className="bg-green-100 text-green-800">ใช้งาน</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">ปิดใช้งาน</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: toggle status */}}
                          >
                            {announcement.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(announcement.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: implement edit */}}
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: implement delete */}}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-64">
          <Sidebar onMenuClick={setCurrentView} currentView={currentView} />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b border-border bg-card" />
          <main className="flex-1 flex items-center justify-center">
            <div>กำลังโหลด...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-64">
        <Sidebar onMenuClick={setCurrentView} currentView={currentView} />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border bg-card" />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {renderSettingsContent()}
          </div>
        </main>
      </div>
    </div>
  );
}