import React, { useState, useEffect } from "react";
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
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Phone,
  Mail,
  User,
  Calendar,
  Route
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeliveryOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
  priority: 'normal' | 'urgent';
  delivery_date: string;
  driver_name?: string;
  tracking_number: string;
  items_count: number;
  total_weight: number;
  delivery_notes?: string;
  created_at: string;
}

const Delivery = () => {
  const [currentView, setCurrentView] = useState('delivery');
  const { toast } = useToast();
  
  const [deliveryOrders] = useState<DeliveryOrder[]>([
    {
      id: "1",
      order_number: "DL2025000001",
      customer_name: "บริษัท เอบีซี จำกัด",
      customer_phone: "02-123-4567",
      delivery_address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110",
      status: "in_transit",
      priority: "urgent",
      delivery_date: "2025-01-09",
      driver_name: "สมชาย รถดี",
      tracking_number: "TRK001234567890",
      items_count: 5,
      total_weight: 25.5,
      delivery_notes: "ส่งก่อน 16:00 น.",
      created_at: "2025-01-08T10:30:00Z"
    },
    {
      id: "2", 
      order_number: "DL2025000002",
      customer_name: "บริษัท เดฟจี จำกัด",
      customer_phone: "02-987-6543",
      delivery_address: "456 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310",
      status: "pending",
      priority: "normal",
      delivery_date: "2025-01-09",
      tracking_number: "TRK001234567891",
      items_count: 3,
      total_weight: 15.2,
      created_at: "2025-01-08T14:15:00Z"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredOrders = deliveryOrders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tracking_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      assigned: "outline", 
      in_transit: "default",
      delivered: "default",
      failed: "destructive"
    } as const;

    const labels = {
      pending: "รอจัดส่ง",
      assigned: "มอบหมายแล้ว",
      in_transit: "กำลังจัดส่ง", 
      delivered: "จัดส่งสำเร็จ",
      failed: "จัดส่งไม่สำเร็จ"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      normal: "secondary",
      urgent: "destructive"
    } as const;

    const labels = {
      normal: "ปกติ",
      urgent: "เร่งด่วน"
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "secondary"}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  // Calculate metrics
  const totalOrders = deliveryOrders.length;
  const pendingOrders = deliveryOrders.filter(o => o.status === 'pending').length;
  const inTransitOrders = deliveryOrders.filter(o => o.status === 'in_transit').length;
  const deliveredOrders = deliveryOrders.filter(o => o.status === 'delivered').length;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        currentView={currentView} 
        onMenuClick={(view) => setCurrentView(view)}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">ระบบจัดส่งสินค้า / Delivery</h1>
              <p className="text-muted-foreground">จัดการการจัดส่งและติดตามสถานะ</p>
            </div>
            <Button>
              <Package className="mr-2 h-4 w-4" />
              สร้างใบจัดส่งใหม่
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="ใบจัดส่งทั้งหมด"
              value={totalOrders}
              icon={Package}
              className="border-blue-200"
            />
            <MetricCard
              title="รอจัดส่ง"
              value={pendingOrders}
              icon={Clock}
              className="border-orange-200"
            />
            <MetricCard
              title="กำลังจัดส่ง"
              value={inTransitOrders}
              icon={Truck}
              className="border-yellow-200"
            />
            <MetricCard
              title="จัดส่งสำเร็จ"
              value={deliveredOrders}
              icon={CheckCircle}
              className="border-green-200"
            />
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">ใบจัดส่ง</TabsTrigger>
              <TabsTrigger value="tracking">ติดตามสถานะ</TabsTrigger>
              <TabsTrigger value="drivers">คนขับ</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="ค้นหาตามหมายเลข, ลูกค้า, tracking..."
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
                    <SelectItem value="pending">รอจัดส่ง</SelectItem>
                    <SelectItem value="assigned">มอบหมายแล้ว</SelectItem>
                    <SelectItem value="in_transit">กำลังจัดส่ง</SelectItem>
                    <SelectItem value="delivered">จัดส่งสำเร็จ</SelectItem>
                    <SelectItem value="failed">จัดส่งไม่สำเร็จ</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="ความเร่งด่วน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกระดับ</SelectItem>
                    <SelectItem value="urgent">เร่งด่วน</SelectItem>
                    <SelectItem value="normal">ปกติ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Orders List */}
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{order.order_number}</h3>
                            {getStatusBadge(order.status)}
                            {getPriorityBadge(order.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            สร้างเมื่อ: {new Date(order.created_at).toLocaleDateString('th-TH')}
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
                                {order.order_number}
                                {getStatusBadge(order.status)}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">{order.customer_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{order.customer_phone}</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mt-0.5" />
                                    <span>{order.delivery_address}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium">Tracking: </span>
                                    <span className="text-primary font-mono">{order.tracking_number}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">จำนวนรายการ: </span>
                                    <span>{order.items_count} รายการ</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">น้ำหนักรวม: </span>
                                    <span>{order.total_weight} กก.</span>
                                  </div>
                                  {order.driver_name && (
                                    <div>
                                      <span className="font-medium">คนขับ: </span>
                                      <span>{order.driver_name}</span>
                                    </div>
                                  )}
                                  {order.delivery_notes && (
                                    <div>
                                      <span className="font-medium">หมายเหตุ: </span>
                                      <p className="text-sm mt-1">{order.delivery_notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">ลูกค้า: </span>
                          <span>{order.customer_name}</span>
                        </div>
                        <div>
                          <span className="font-medium">Tracking: </span>
                          <span className="text-primary font-mono">{order.tracking_number}</span>
                        </div>
                        <div>
                          <span className="font-medium">วันที่จัดส่ง: </span>
                          <span>{new Date(order.delivery_date).toLocaleDateString('th-TH')}</span>
                        </div>
                        <div>
                          <span className="font-medium">รายการ: </span>
                          <span>{order.items_count} รายการ ({order.total_weight} กก.)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    ติดตามสถานะการจัดส่ง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Truck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">ระบบติดตามสถานะกำลังพัฒนา</h3>
                    <p className="text-muted-foreground">
                      ระบบติดตามสถานะการจัดส่งแบบ Real-time จะพร้อมใช้งานเร็วๆ นี้
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drivers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    จัดการคนขับ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">ระบบจัดการคนขับกำลังพัฒนา</h3>
                    <p className="text-muted-foreground">
                      ระบบจัดการคนขับและมอบหมายงานจะพร้อมใช้งานเร็วๆ นี้
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Delivery;