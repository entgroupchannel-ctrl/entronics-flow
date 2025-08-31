import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
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
  User
} from "lucide-react";

interface ServiceRequest {
  id: string;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  device_type: string;
  device_brand?: string;
  device_model?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';
  created_at: string;
  technicians?: {
    name: string;
    phone?: string;
  };
}

const Index = () => {
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceRequests();
    setupRealtimeSubscription();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          technicians (
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setServiceRequests(data || []);
    } catch (error) {
      console.error('Error fetching service requests:', error);
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
          fetchServiceRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  // Calculate metrics
  const totalRequests = serviceRequests.length;
  const pendingRequests = serviceRequests.filter(r => r.status === 'pending').length;
  const inProgressRequests = serviceRequests.filter(r => r.status === 'in_progress').length;
  const completedToday = serviceRequests.filter(r => 
    r.status === 'completed' && 
    new Date(r.created_at).toDateString() === new Date().toDateString()
  ).length;

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div>กำลังโหลด...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">ภาพรวมระบบจัดการงานซ่อม</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.location.href = '/service-request'}>
              แจ้งซ่อมใหม่
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/service-dashboard'}>
              จัดการงานซ่อม
            </Button>
          </div>
        </div>

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
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  งานซ่อมล่าสุด (10 รายการ)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    ยังไม่มีงานซ่อม
                  </div>
                ) : (
                  serviceRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{request.ticket_number}</span>
                            {getStatusBadge(request.status)}
                            {getPriorityBadge(request.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{request.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{request.customer_phone}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div>
                            <span className="font-medium">อุปกรณ์: </span>
                            <span>{request.device_type} {request.device_brand} {request.device_model}</span>
                          </div>
                          <div>
                            <span className="font-medium">ช่าง: </span>
                            <span>{request.technicians?.name || 'ยังไม่มอบหมาย'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {serviceRequests.length > 0 && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/service-dashboard'}
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
                  onClick={() => window.location.href = '/service-request'}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  แจ้งซ่อมใหม่
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/service-dashboard'}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
