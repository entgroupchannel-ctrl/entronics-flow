import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
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
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function ServiceDashboard() {
  const { user } = useAuth();
  const { canManageInventory } = useUserRole();
  const { toast } = useToast();
  
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

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

      setServiceRequests(requests || []);
      setTechnicians(techData || []);
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

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = 
      request.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.device_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  // Calculate metrics
  const totalRequests = serviceRequests.length;
  const pendingRequests = serviceRequests.filter(r => r.status === 'pending').length;
  const inProgressRequests = serviceRequests.filter(r => r.status === 'in_progress').length;
  const completedRequests = serviceRequests.filter(r => r.status === 'completed').length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
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
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('th-TH')}
                      </p>
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
                            <div className="flex gap-2 pt-4 border-t">
                              <Select onValueChange={(value) => updateRequestStatus(request.id, value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="อัพเดทสถานะ" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="assigned">มอบหมายช่าง</SelectItem>
                                  <SelectItem value="in_progress">เริ่มซ่อม</SelectItem>
                                  <SelectItem value="waiting_parts">รออะไหล่</SelectItem>
                                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                                  <SelectItem value="cancelled">ยกเลิก</SelectItem>
                                </SelectContent>
                              </Select>
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
    </div>
  );
}