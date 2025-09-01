import { useState, useEffect } from "react";
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
import { MetricCard } from "@/components/dashboard/MetricCard";
import { 
  ClipboardList, 
  Users, 
  Timer, 
  CheckCircle, 
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Settings,
  Plus,
  Wrench,
  Building,
  Package,
  Clock,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { AddRepairedItemForm } from "@/components/AddRepairedItemForm";

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
  status: 'pending' | 'assigned' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled' | 'waiting_approval';
  source: 'staff' | 'technician' | 'customer';
  assigned_technician_id?: string;
  estimated_cost?: number;
  actual_cost?: number;
  scheduled_date?: string;
  completed_date?: string;
  customer_satisfaction?: number;
  customer_feedback?: string;
  created_at: string;
  updated_at: string;
  acknowledged_at?: string;
  acknowledgment_notes?: string;
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
  specialization: 'general' | 'electrical' | 'mechanical' | 'software' | 'hardware';
  is_available: boolean;
  current_workload: number;
  rating: number;
  total_jobs: number;
}

export default function ServiceDashboard() {
  const { user } = useAuth();
  const { canManageInventory } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState('service-dashboard');
  const [isCompanyInfoOpen, setIsCompanyInfoOpen] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [currentTechnician, setCurrentTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [selectedRequestForItem, setSelectedRequestForItem] = useState<string | null>(null);
  
  // Form state for new service request
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    device_type: "",
    device_brand: "",
    device_model: "",
    problem_description: "",
    priority: "medium"
  });

  useEffect(() => {
    fetchData();
    setupRealtimeSubscription();
  }, []);

  const fetchData = async () => {
    try {
      // Check if current user is a technician
      const { data: techData, error: techError } = await supabase
        .from('technicians')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (techData && !techError) {
        setCurrentTechnician(techData);
      }

      // Fetch service requests with technician info
      let requestsQuery = supabase
        .from('service_requests')
        .select(`
          *,
          technicians (
            name,
            phone,
            specialization
          )
        `);

      // If user is a technician, show only their assigned jobs or available jobs
      if (techData && !techError) {
        requestsQuery = requestsQuery.or(`assigned_technician_id.eq.${techData.id},assigned_technician_id.is.null`);
      }

      const { data: requests, error: requestsError } = await requestsQuery
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch all technicians (for managers)
      const { data: allTechnicians, error: allTechError } = await supabase
        .from('technicians')
        .select('*')
        .order('name');

      if (allTechError) throw allTechError;

      setServiceRequests((requests || []).map(req => ({
        ...req,
        source: req.source as 'staff' | 'technician' | 'customer'
      })));
      setTechnicians(allTechnicians || []);
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
      .channel('service-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests'
        },
        () => {
          fetchData(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateRequestStatus = async (requestId: string, newStatus: string, technicianId?: string) => {
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

      // Send completion email if status is completed
      if (newStatus === 'completed') {
        const request = serviceRequests.find(r => r.id === requestId);
        if (request) {
          await supabase.functions.invoke('send-service-confirmation', {
            body: {
              serviceRequest: { ...request, status: newStatus },
              customerEmail: request.customer_email,
              type: 'completion',
            },
          });
        }
      }

      toast({
        title: "อัพเดทสำเร็จ",
        description: "สถานะงานซ่อมได้รับการอัพเดท",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสถานะได้",
        variant: "destructive",
      });
    }
  };

  const handleCreateServiceRequest = async () => {
    if (!formData.customer_name || !formData.customer_phone || !formData.device_type || !formData.problem_description) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกชื่อลูกค้า, เบอร์โทร, ประเภทอุปกรณ์ และอาการเสีย",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          ticket_number: '', // Will be auto-generated by trigger
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || null,
          customer_address: formData.customer_address,
          device_type: formData.device_type,
          device_brand: formData.device_brand || null,
          device_model: formData.device_model || null,
          problem_description: formData.problem_description,
          priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
          status: 'pending',
          source: (currentTechnician ? 'technician' : 'staff') as 'staff' | 'technician' | 'customer',
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "แจ้งซ่อมสำเร็จ",
        description: `ได้รับงานซ่อมหมายเลข ${data.ticket_number} แล้ว`
      });

      // Reset form and close dialog
      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        customer_address: "",
        device_type: "",
        device_brand: "",
        device_model: "",
        problem_description: "",
        priority: "medium"
      });
      setIsCreateDialogOpen(false);
      
      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error('Error creating service request:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const autoAssignTechnician = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('auto_assign_technician', { request_id: requestId });

      if (error) throw error;

      if (data) {
        toast({
          title: "มอบหมายงานสำเร็จ",
          description: "มอบหมายงานให้ช่างเทคนิคอัตโนมัติแล้ว",
        });
        fetchData();
      } else {
        toast({
          title: "ไม่สามารถมอบหมายงานได้",
          description: "ไม่มีช่างเทคนิคที่ว่างในขณะนี้",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error auto-assigning technician:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถมอบหมายงานอัตโนมัติได้",
        variant: "destructive",
      });
    }
  };

  const acceptJob = async (requestId: string) => {
    if (!currentTechnician) return;

    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          assigned_technician_id: currentTechnician.id,
          status: 'assigned'
        })
        .eq('id', requestId);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('service_status_history')
        .insert({
          service_request_id: requestId,
          new_status: 'assigned',
          changed_by: user?.id,
          notes: 'ช่างรับงาน',
        });

      toast({
        title: "รับงานสำเร็จ",
        description: "คุณได้รับงานนี้แล้ว",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error accepting job:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรับงานได้",
        variant: "destructive",
      });
    }
  };

  const updateJobStatus = async (requestId: string, newStatus: string, notes?: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        // When technician marks as completed, it needs manager approval
        updates.status = 'waiting_approval';
        updates.completed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      // Add to status history - fix type issues
      await supabase
        .from('service_status_history')
        .insert({
          service_request_id: requestId,
          new_status: (newStatus === 'completed' ? 'completed' : newStatus) as any,
          old_status: undefined,
          changed_by: user?.id,
          notes: notes || `อัพเดทสถานะเป็น ${newStatus}`,
        });

      const message = newStatus === 'completed' 
        ? "ส่งงานให้ผู้จัดการอนุมัติแล้ว" 
        : "อัพเดทสถานะสำเร็จ";

      toast({
        title: "สำเร็จ",
        description: message,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error updating job status:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสถานะได้",
        variant: "destructive",
      });
    }
  };

  const approveJob = async (requestId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          status: approved ? 'completed' : 'in_progress'
        })
        .eq('id', requestId);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('service_status_history')
        .insert({
          service_request_id: requestId,
          new_status: approved ? 'completed' : 'in_progress',
          changed_by: user?.id,
          notes: approved ? 'ผู้จัดการอนุมัติงาน' : 'ผู้จัดการไม่อนุมัติ ต้องแก้ไข',
        });

      toast({
        title: approved ? "อนุมัติงานสำเร็จ" : "ไม่อนุมัติงาน",
        description: approved ? "งานได้รับการอนุมัติแล้ว" : "ส่งงานกลับไปแก้ไข",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error approving job:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการได้",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = 
      request.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.device_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Acknowledge job function for technicians
  const acknowledgeJob = async (requestId: string, notes?: string) => {
    if (!currentTechnician) return;
    
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledgment_notes: notes || null
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "รับทราบงานสำเร็จ",
        description: "คุณได้รับทราบงานนี้แล้ว"
      });

      fetchData();
    } catch (error) {
      console.error('Error acknowledging job:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรับทราบงานได้",
        variant: "destructive"
      });
    }
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

  const getSourceBadge = (source: string) => {
    const variants = {
      staff: "default",
      technician: "outline",
      customer: "secondary"
    } as const;

    const labels = {
      staff: "พนักงาน",
      technician: "ช่าง",
      customer: "ลูกค้า"
    };

    return (
      <Badge variant={variants[source as keyof typeof variants] || "secondary"}>
        {labels[source as keyof typeof labels] || source}
      </Badge>
    );
  };

  // Calculate metrics
  const totalRequests = serviceRequests.length;
  const pendingRequests = serviceRequests.filter(r => r.status === 'pending').length;
  const inProgressRequests = serviceRequests.filter(r => r.status === 'in_progress').length;
  const completedRequests = serviceRequests.filter(r => r.status === 'completed').length;

  // Format time helper function
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        currentView={currentView} 
        onMenuClick={(view) => setCurrentView(view)}
        onLogoClick={() => setIsCompanyInfoOpen(true)}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Service Dashboard</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  เปิดเคส/แจ้งปัญหา
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>เปิดเคส/แจ้งปัญหา</DialogTitle>
                </DialogHeader>
                <ServiceRequestForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleCreateServiceRequest}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>
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
          value={completedRequests}
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
                        {getSourceBadge(request.source)}
                      </div>
                    </div>
                    
                    {/* Time information - moved to top right and made prominent */}
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 justify-end">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">เวลาเปิดเคส</div>
                          <div className="font-semibold text-lg text-blue-600">
                            {formatDateTime(request.created_at)}
                          </div>
                        </div>
                      </div>
                      {request.acknowledged_at && (
                        <div className="flex items-center gap-2 justify-end mt-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">เวลารับทราบ</div>
                            <div className="font-medium text-sm text-green-600">
                              {formatDateTime(request.acknowledged_at)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
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
                          {/* Customer Information Card */}
                          <Card className="bg-white border border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                ข้อมูลลูกค้า
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-sm text-gray-700">ชื่อ:</span>
                                    <span className="text-sm">{request.customer_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-sm text-gray-700">โทร:</span>
                                    <span className="text-sm">{request.customer_phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-sm text-gray-700">อีเมล:</span>
                                    <span className="text-sm">{request.customer_email}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                    <div>
                                      <span className="font-medium text-sm text-gray-700">ที่อยู่:</span>
                                      <p className="text-sm mt-1">{request.customer_address}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Device Information Card */}
                          <Card className="bg-white border border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Wrench className="h-5 w-5" />
                                ข้อมูลอุปกรณ์
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="p-2 bg-gray-50 rounded border">
                                    <span className="font-medium text-sm text-gray-700">ประเภทอุปกรณ์:</span>
                                    <p className="text-sm mt-1">{request.device_type}</p>
                                  </div>
                                  <div className="p-2 bg-gray-50 rounded border">
                                    <span className="font-medium text-sm text-gray-700">ยี่ห้อ:</span>
                                    <p className="text-sm mt-1">{request.device_brand || 'ไม่ระบุ'}</p>
                                  </div>
                                  <div className="p-2 bg-gray-50 rounded border">
                                    <span className="font-medium text-sm text-gray-700">รุ่น:</span>
                                    <p className="text-sm mt-1">{request.device_model || 'ไม่ระบุ'}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="p-2 bg-gray-50 rounded border">
                                    <span className="font-medium text-sm text-gray-700">อาการเสีย:</span>
                                    <p className="text-sm mt-1">{request.problem_description}</p>
                                  </div>
                                  {request.technicians && (
                                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                      <span className="font-medium text-sm text-blue-700">ช่างที่รับผิดชอบ:</span>
                                      <p className="text-sm mt-1 text-blue-600">{request.technicians.name}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Time Information Card */}
                          <Card className="bg-white border border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                ข้อมูลเวลา
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-2 bg-gray-50 rounded border">
                                  <span className="font-medium text-sm text-gray-700">เวลาเปิดเคส:</span>
                                  <p className="text-sm mt-1">{formatDateTime(request.created_at)}</p>
                                </div>
                                {request.acknowledged_at && (
                                  <div className="p-2 bg-green-50 rounded border border-green-200">
                                    <span className="font-medium text-sm text-green-700">เวลารับทราบ:</span>
                                    <p className="text-sm mt-1 text-green-600">{formatDateTime(request.acknowledged_at)}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                           
                           {canManageInventory() && (
                             <div className="flex gap-2 pt-4 border-t">
                               {!request.assigned_technician_id ? (
                                 <div className="flex gap-2 w-full">
                                   <Select onValueChange={(techId) => updateRequestStatus(request.id, 'assigned', techId)}>
                                     <SelectTrigger className="flex-1">
                                       <SelectValue placeholder="เลือกช่างเทคนิค" />
                                     </SelectTrigger>
                                     <SelectContent>
                                       {technicians
                                         .filter(tech => tech.is_available)
                                         .map(tech => (
                                           <SelectItem key={tech.id} value={tech.id}>
                                             <div className="flex items-center justify-between w-full">
                                               <span>{tech.name}</span>
                                               <div className="flex items-center gap-2 ml-2">
                                                 <Badge variant="outline" className="text-xs">
                                                   {tech.specialization}
                                                 </Badge>
                                                 <span className="text-xs text-muted-foreground">
                                                   งาน: {tech.current_workload}
                                                 </span>
                                               </div>
                                             </div>
                                           </SelectItem>
                                         ))}
                                     </SelectContent>
                                   </Select>
                                   <Button 
                                     size="sm" 
                                     variant="outline"
                                     onClick={() => autoAssignTechnician(request.id)}
                                   >
                                     มอบหมายอัตโนมัติ
                                   </Button>
                                 </div>
                               ) : (
                                  <div className="flex flex-wrap gap-2 w-full">
                                    {request.status !== 'in_progress' && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateRequestStatus(request.id, 'in_progress')}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        เริ่มซ่อม
                                      </Button>
                                    )}
                                    {request.status !== 'waiting_parts' && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateRequestStatus(request.id, 'waiting_parts')}
                                        variant="outline"
                                        className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                      >
                                        รออะไหล่
                                      </Button>
                                    )}
                                    {request.status !== 'completed' && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateRequestStatus(request.id, 'completed')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        เสร็จสิ้น
                                      </Button>
                                    )}
                                    {request.status !== 'cancelled' && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateRequestStatus(request.id, 'cancelled')}
                                        variant="destructive"
                                      >
                                        ยกเลิก
                                      </Button>
                                    )}
                                   {request.status === 'completed' && (
                                     <Button 
                                       size="sm" 
                                       variant="outline"
                                       onClick={() => {
                                         setSelectedRequestForItem(request.id);
                                         setShowAddItemDialog(true);
                                       }}
                                     >
                                       <Package className="h-4 w-4 mr-1" />
                                       เพิ่มเข้าคลัง
                                     </Button>
                                   )}
                                 </div>
                               )}
                             </div>
                           )}
                           
                           {/* Technician Actions */}
                           {currentTechnician && request.assigned_technician_id === currentTechnician.id && (
                             <div className="flex gap-2 pt-4 border-t">
                               {/* Acknowledgment button - only show if not acknowledged */}
                               {request.status === 'assigned' && !request.acknowledged_at && (
                                 <Button 
                                   size="sm" 
                                   onClick={() => acknowledgeJob(request.id)}
                                   className="bg-blue-600 hover:bg-blue-700"
                                 >
                                   <CheckCircle2 className="h-4 w-4 mr-1" />
                                   รับทราบงาน
                                 </Button>
                               )}
                               
                               {/* Work progress buttons */}
                               {request.acknowledged_at && request.status === 'assigned' && (
                                 <Button 
                                   size="sm" 
                                   onClick={() => updateJobStatus(request.id, 'in_progress')}
                                 >
                                   เริ่มซ่อม
                                 </Button>
                               )}
                               {request.status === 'in_progress' && (
                                 <>
                                   <Button 
                                     size="sm" 
                                     onClick={() => updateJobStatus(request.id, 'waiting_parts')}
                                     variant="outline"
                                   >
                                     รออะไหล่
                                   </Button>
                                   <Button 
                                     size="sm" 
                                     onClick={() => updateJobStatus(request.id, 'completed')}
                                   >
                                     ส่งงาน
                                   </Button>
                                 </>
                               )}
                               {request.status === 'waiting_parts' && (
                                 <Button 
                                   size="sm" 
                                   onClick={() => updateJobStatus(request.id, 'in_progress')}
                                 >
                                   ซ่อมต่อ
                                 </Button>
                               )}
                             </div>
                           )}
                           
                           {/* Manager Actions for Approval */}
                           {canManageInventory() && request.status === 'waiting_approval' && (
                             <div className="flex gap-2 pt-4 border-t">
                               <Button 
                                 size="sm" 
                                 onClick={() => approveJob(request.id, false)}
                                 variant="outline"
                               >
                                 ส่งกลับแก้ไข
                               </Button>
                               <Button 
                                 size="sm" 
                                 onClick={() => approveJob(request.id, true)}
                               >
                                 อนุมัติงาน
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
                  
                  {/* Technician quick actions on main card */}
                  {currentTechnician && request.assigned_technician_id === currentTechnician.id && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {request.status === 'assigned' && !request.acknowledged_at && (
                        <Button 
                          size="sm" 
                          onClick={() => acknowledgeJob(request.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          รับทราบงาน
                        </Button>
                      )}
                      {request.acknowledged_at && request.status === 'assigned' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateJobStatus(request.id, 'in_progress')}
                        >
                          เริ่มซ่อม
                        </Button>
                      )}
                    </div>
                  )}
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
        </main>
        
        {/* Add Repaired Item Dialog */}
        <AddRepairedItemForm 
          isOpen={showAddItemDialog}
          onOpenChange={setShowAddItemDialog}
          serviceRequestId={selectedRequestForItem || ""}
          onItemAdded={() => {
            toast({
              title: "เพิ่มสินค้าสำเร็จ",
              description: "เพิ่มสินค้าซ่อมแซมเข้าคลังสินค้าแล้ว",
            });
          }}
        />

        {/* Company Info Dialog */}
        <Dialog open={isCompanyInfoOpen} onOpenChange={setIsCompanyInfoOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">🏢 ENT GROUP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="text-center">
                <p className="font-semibold">Software Version 1.0</p>
                <p className="text-muted-foreground">พัฒนาโดย Therdpoom Phanich</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">บริษัท อีเอ็นที กรุ๊ป จำกัด</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>เมทโทร บิซทาวน์ แจ้งวัฒนะ2 เลขที่ 70/5 หมู่ 4</p>
                  <p>ตำบลคลองพระอุดม อำเภอปากเกร็ด</p>
                  <p>จังหวัดนนทบุรี 11120</p>
                  <p className="pt-2">เลขประจำตัวผู้เสียภาษี 0135558013167</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}