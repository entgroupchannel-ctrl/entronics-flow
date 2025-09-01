import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, 
  Users, 
  Timer, 
  CheckCircle, 
  Wrench,
  TrendingUp,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  User,
  Search,
  Settings,
  MapPin,
  FileText,
  Bell,
  Megaphone,
  Package,
  Tag,
  Star,
  AlertCircle
} from "lucide-react";

interface ServiceRequest {
  id: string;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  device_type: string;
  device_brand?: string;
  device_model?: string;
  problem_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';
  assigned_technician_id?: string;
  estimated_cost?: number;
  actual_cost?: number;
  scheduled_date?: string;
  completed_date?: string;
  customer_satisfaction?: number;
  customer_feedback?: string;
  created_at: string;
  updated_at: string;
  technicians?: {
    name: string;
    phone?: string;
    specialization: string;
  };
}

interface Technician {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  specialization: string;
  is_available: boolean;
  current_workload: number;
  rating: number;
  total_jobs: number;
}

// Create a context for sharing state between Sidebar and Index
const AppContext = React.createContext<{
  currentView: string;
  setCurrentView: (view: string) => void;
}>({
  currentView: 'dashboard',
  setCurrentView: () => {}
});

const Index = () => {
  const { user } = useAuth();
  const { canManageInventory } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  
  // Update form states
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [emailList, setEmailList] = useState('');

  useEffect(() => {
    fetchData();
    setupRealtimeSubscription();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch service requests with technician info
      const { data: requests, error: requestsError } = await supabase
        .from('service_requests')
        .select(`
          *,
          technicians (
            name,
            phone,
            specialization
          )
        `)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch technicians
      const { data: techData, error: techError } = await supabase
        .from('technicians')
        .select('*')
        .order('name');

      if (techError) throw techError;

      // Fetch quotations
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (quotationsError) throw quotationsError;

      // Fetch announcements  
      const { data: announcementsData, error: announcementsError } = await (supabase as any)
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .lte('published_at', new Date().toISOString())
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(6);

      if (announcementsError) throw announcementsError;

      setServiceRequests(requests || []);
      setTechnicians(techData || []);
      setQuotations(quotationsData || []);
      setAnnouncements(announcementsData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('dashboard-service-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateRequestStatus = async (requestId: string, newStatus: string, technicianId?: string, shouldSendEmail = false, emailAddresses = '') => {
    try {
      const updates: any = { status: newStatus };
      if (technicianId) {
        updates.assigned_technician_id = technicianId;
      }
      if (newStatus === 'completed') {
        updates.completed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('service_status_history')
        .insert({
          service_request_id: requestId,
          new_status: newStatus as 'pending' | 'assigned' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled',
          changed_by: user?.id,
          notes: `Status updated to ${newStatus}`,
        });

      // Send email if requested
      if (shouldSendEmail && emailAddresses) {
        const request = serviceRequests.find(r => r.id === requestId);
        if (request) {
          const emailList = emailAddresses.split(',').map(email => email.trim()).filter(email => email);
          
          for (const email of emailList) {
            try {
              await supabase.functions.invoke('send-service-confirmation', {
                body: {
                  serviceRequest: { ...request, status: newStatus },
                  customerEmail: email,
                  type: newStatus === 'completed' ? 'completion' : 'update'
                }
              });
            } catch (emailError) {
              console.error('Error sending email to:', email, emailError);
            }
          }
        }
      }

      toast({
        title: "อัพเดทสำเร็จ",
        description: "สถานะงานซ่อมได้รับการอัพเดท",
      });

      fetchData();
      
      // Reset form states
      setSelectedTechnician('');
      setSelectedStatus('');
      setSendEmail(false);
      setEmailList('');
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสถานะได้",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRequest = (requestId: string) => {
    const technicianId = selectedTechnician === 'none' ? undefined : selectedTechnician;
    updateRequestStatus(
      requestId, 
      selectedStatus, 
      technicianId,
      sendEmail,
      emailList
    );
  };

  const handleDialogOpen = (request: ServiceRequest) => {
    setSelectedTechnician(request.assigned_technician_id || 'none');
    setSelectedStatus(request.status);
    setSendEmail(false);
    setEmailList(request.customer_email);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      assigned: "outline", 
      in_progress: "default",
      waiting_parts: "destructive",
      completed: "default",
      cancelled: "secondary"
    } as const;

    const labels = {
      pending: "รอดำเนินการ",
      assigned: "มอบหมายแล้ว",
      in_progress: "กำลังดำเนินการ", 
      waiting_parts: "รออะไหล่",
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิก"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "destructive", 
      urgent: "destructive"
    } as const;

    const labels = {
      low: "ปกติ",
      medium: "ปานกลาง",
      high: "สูง",
      urgent: "เร่งด่วน"
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "secondary"}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  // Filter requests for service view
  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = 
      request.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.device_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate metrics
  const totalRequests = serviceRequests.length;
  const pendingRequests = serviceRequests.filter(r => r.status === 'pending').length;
  const inProgressRequests = serviceRequests.filter(r => r.status === 'in_progress').length;
  const completedToday = serviceRequests.filter(r => 
    r.status === 'completed' && 
    new Date(r.created_at).toDateString() === new Date().toDateString()
  ).length;


  const renderDashboardView = () => (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">ภาพรวมระบบ / ENTGROUP Overview</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.open('/service-request', '_blank')}>
            แจ้งซ่อมใหม่
          </Button>
          <Button variant="outline" onClick={() => setCurrentView('service')}>
            จัดการงานซ่อม
          </Button>
        </div>
      </div>

      {/* Announcements Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            ข่าวสารและการประกาศ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                ยังไม่มีประกาศในขณะนี้
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                     onClick={() => window.location.href = '/settings'}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {announcement.type === 'new_product' && <Package className="h-6 w-6 text-blue-500" />}
                      {announcement.type === 'promotion' && <Tag className="h-6 w-6 text-green-500" />}
                      {announcement.type === 'stock_update' && <TrendingUp className="h-6 w-6 text-orange-500" />}
                      {announcement.type === 'maintenance' && <AlertCircle className="h-6 w-6 text-red-500" />}
                      {announcement.type === 'policy' && <User className="h-6 w-6 text-purple-500" />}
                      {!['new_product', 'promotion', 'stock_update', 'maintenance', 'policy'].includes(announcement.type) && <Megaphone className="h-6 w-6 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{announcement.title}</h3>
                        {announcement.priority === 'high' && <Star className="h-4 w-4 text-yellow-500" />}
                        {announcement.priority === 'medium' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {announcement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(announcement.published_at || announcement.created_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {announcements.length > 0 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => window.location.href = '/settings'}>
                จัดการประกาศ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="งานซ่อมทั้งหมด"
          value={totalRequests}
          icon={ClipboardList}
          className="border-blue-200"
        />
        <MetricCard
          title="รอดำเนินการ"
          value={pendingRequests}
          icon={Timer}
          className="border-orange-200"
        />
        <MetricCard
          title="กำลังซ่อม"
          value={inProgressRequests}
          icon={Wrench}
          className="border-yellow-200"
        />
        <MetricCard
          title="เสร็จสิ้นวันนี้"
          value={completedToday}
          icon={CheckCircle}
          className="border-green-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Requests List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                งานซ่อมล่าสุด (5 รายการ)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceRequests.slice(0, 5).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  ยังไม่มีงานซ่อม
                </div>
              ) : (
                serviceRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{request.ticket_number}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{request.customer_name}</span>
                      </div>
                      <div>
                        <span className="font-medium">อุปกรณ์: </span>
                        <span>{request.device_type}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {serviceRequests.length > 0 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentView('service')}
                  >
                    ดูทั้งหมด
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quotations List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ใบเสนอราคาล่าสุด (5 รายการ)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotations.slice(0, 5).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  ยังไม่มีใบเสนอราคา
                </div>
              ) : (
                quotations.slice(0, 5).map((quotation) => (
                  <div key={quotation.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{quotation.quotation_number}</span>
                          <Badge variant={quotation.status === 'approved' ? 'default' : 'secondary'}>
                            {quotation.status === 'draft' ? 'ร่าง' : 
                             quotation.status === 'sent' ? 'ส่งแล้ว' : 
                             quotation.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quotation.created_at).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{quotation.customer_name}</span>
                      </div>
                      <div>
                        <span className="font-medium">ยอดรวม: </span>
                        <span>{quotation.total_amount?.toLocaleString('th-TH')} บาท</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {quotations.length > 0 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/quotations'}
                  >
                    ดูทั้งหมด
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sales Chart */}
        <div className="space-y-4">
          <SalesChart />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การดำเนินการด่วน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.open('/service-request', '_blank')}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                แจ้งซ่อมใหม่
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setCurrentView('service')}
              >
                <Wrench className="mr-2 h-4 w-4" />
                จัดการงานซ่อม
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.location.href = '/customers'}
              >
                <Users className="mr-2 h-4 w-4" />
                จัดการลูกค้า
              </Button>
               <Button 
                 className="w-full justify-start" 
                 variant="outline"
                 onClick={() => window.location.href = '/inventory'}
               >
                 <DollarSign className="mr-2 h-4 w-4" />
                 คลังสินค้า
               </Button>
               <Button 
                 className="w-full justify-start" 
                 variant="outline"
                 onClick={() => window.location.href = '/quotations'}
               >
                 <FileText className="mr-2 h-4 w-4" />
                 สร้างใบเสนอราคา
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  const renderServiceView = () => (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Service Dashboard</h1>
        <Button onClick={() => window.open('/service-request', '_blank')}>
          แจ้งซ่อมใหม่
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="งานทั้งหมด"
          value={totalRequests}
          icon={ClipboardList}
          className="border-blue-200"
        />
        <MetricCard
          title="รอดำเนินการ"
          value={pendingRequests}
          icon={Timer}
          className="border-orange-200"
        />
        <MetricCard
          title="กำลังซ่อม"
          value={inProgressRequests}
          icon={Settings}
          className="border-yellow-200"
        />
        <MetricCard
          title="เสร็จสิ้น"
          value={serviceRequests.filter(r => r.status === 'completed').length}
          icon={CheckCircle}
          className="border-green-200"
        />
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">งานซ่อม</TabsTrigger>
          <TabsTrigger value="technicians">ช่างเทคนิค</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ค้นหาตามหมายเลข, ชื่อลูกค้า, อุปกรณ์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="assigned">มอบหมายแล้ว</SelectItem>
                <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="waiting_parts">รออะไหล่</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ความเร่งด่วน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกระดับ</SelectItem>
                <SelectItem value="urgent">เร่งด่วน</SelectItem>
                <SelectItem value="high">สูง</SelectItem>
                <SelectItem value="medium">ปานกลาง</SelectItem>
                <SelectItem value="low">ปกติ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Requests List */}
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{request.ticket_number}</h3>
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDialogOpen(request)}
                        >
                          ดูรายละเอียด
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {request.ticket_number}
                            {getStatusBadge(request.status)}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{request.customer_name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{request.customer_phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{request.customer_email}</span>
                              </div>
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5" />
                                <span>{request.customer_address}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium">อุปกรณ์: </span>
                                <span>{request.device_type} {request.device_brand} {request.device_model}</span>
                              </div>
                              <div>
                                <span className="font-medium">ปัญหา: </span>
                                <p className="text-sm mt-1">{request.problem_description}</p>
                              </div>
                              {request.technicians && (
                                <div>
                                  <span className="font-medium">ช่างที่รับผิดชอบ: </span>
                                  <span>{request.technicians.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {canManageInventory() && (
                            <div className="space-y-4 pt-4 border-t">
                              {/* Technician Assignment */}
                              <div className="space-y-2">
                                <Label>มอบหมายช่างเทคนิค</Label>
                                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกช่างเทคนิค" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">ไม่มอบหมาย</SelectItem>
                                    {technicians.filter(tech => tech.is_available).map((tech) => (
                                      <SelectItem key={tech.id} value={tech.id}>
                                        {tech.name} - {tech.specialization} (งาน: {tech.current_workload})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Status Selection */}
                              <div className="space-y-2">
                                <Label>สถานะงาน</Label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกสถานะ" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">รอดำเนินการ</SelectItem>
                                    <SelectItem value="assigned">มอบหมายแล้ว</SelectItem>
                                    <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                                    <SelectItem value="waiting_parts">รออะไหล่</SelectItem>
                                    <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Email Options */}
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="send-email" 
                                    checked={sendEmail}
                                    onCheckedChange={(checked) => setSendEmail(checked === true)}
                                  />
                                  <Label htmlFor="send-email">ส่ง Email แจ้งอัพเดท</Label>
                                </div>
                                
                                {sendEmail && (
                                  <div className="space-y-2">
                                    <Label>Email ผู้รับ (คั่นด้วยเครื่องหมายจุลภาค)</Label>
                                    <Input
                                      placeholder="email1@example.com, email2@example.com"
                                      value={emailList}
                                      onChange={(e) => setEmailList(e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Update Button */}
                              <Button 
                                onClick={() => handleUpdateRequest(request.id)}
                                className="w-full"
                                disabled={!selectedStatus}
                              >
                                อัพเดทข้อมูล
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ลูกค้า: </span>
                      <span>{request.customer_name}</span>
                    </div>
                    <div>
                      <span className="font-medium">อุปกรณ์: </span>
                      <span>{request.device_type}</span>
                    </div>
                    <div>
                      <span className="font-medium">ช่าง: </span>
                      <span>{request.technicians?.name || 'ยังไม่มอบหมาย'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredRequests.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">ไม่พบงานซ่อม</h3>
                  <p className="text-muted-foreground">ไม่มีงานซ่อมที่ตรงกับเงื่อนไขการค้นหา</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4">
          <div className="grid gap-4">
            {technicians.map((tech) => (
              <Card key={tech.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{tech.name}</h3>
                      <p className="text-sm text-muted-foreground">{tech.specialization}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>งานปัจจุบัน: {tech.current_workload}</span>
                        <span>คะแนน: {tech.rating.toFixed(1)}/5.0</span>
                        <span>งานที่เสร็จ: {tech.total_jobs}</span>
                      </div>
                    </div>
                    <Badge variant={tech.is_available ? "default" : "secondary"}>
                      {tech.is_available ? "พร้อมทำงาน" : "ไม่ว่าง"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );


  // Handle navigation for specific views (only when not loading)
  useEffect(() => {
    if (loading) return; // Don't navigate while loading
    
    switch (currentView) {
      case 'inventory':
        navigate('/inventory');
        break;
      case 'customers':
        navigate('/customers');
        break;
      case 'quotations':
        navigate('/quotations');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  }, [currentView, navigate, loading]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardView();
      case 'service':
        return renderServiceView();
      case 'inventory':
      case 'customers':
      case 'quotations':
      case 'settings':
        // These will be handled by useEffect above
        return renderDashboardView(); // Show dashboard while navigating
      default:
        return renderDashboardView();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64">
        <Sidebar onMenuClick={setCurrentView} currentView={currentView} />
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Header with Notification Bell */}
        <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground">
              {currentView === 'dashboard' ? 'ภาพรวมระบบ' : 'จัดการงานซ่อม'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {announcements.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                      {announcements.length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>ข่าวสารและประกาศองค์กร</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {announcements.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      ไม่มีข่าวสารใหม่
                    </div>
                  ) : (
                    announcements.map((announcement) => (
                      <div key={announcement.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {announcement.type === 'new_product' && <Package className="h-5 w-5 text-blue-500" />}
                            {announcement.type === 'promotion' && <Tag className="h-5 w-5 text-green-500" />}
                            {announcement.type === 'stock_update' && <TrendingUp className="h-5 w-5 text-orange-500" />}
                            {!['new_product', 'promotion', 'stock_update'].includes(announcement.type) && <Megaphone className="h-5 w-5 text-purple-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-sm">{announcement.title}</h3>
                              {announcement.priority === 'high' && <Star className="h-4 w-4 text-yellow-500" />}
                              {announcement.priority === 'medium' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {announcement.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(announcement.created_at).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@entgroup.com</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div>กำลังโหลด...</div>
            </div>
          ) : (
            renderView()
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;