import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Route,
  Plus,
  Edit,
  Save,
  UserPlus,
  Users,
  Car,
  Bike,
  Building,
  Shield,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeliveryOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  status: 'preparing' | 'ready_to_ship' | 'shipped' | 'in_transit' | 'delivered' | 'failed' | 'returned';
  priority: 'normal' | 'urgent';
  delivery_date: string;
  driver_name?: string;
  tracking_number: string;
  items_count: number;
  total_weight: number;
  delivery_notes?: string;
  created_at: string;
  assigned_staff_id?: string;
  assignment_date?: string;
  assignment_notes?: string;
  courier_contact_name?: string;
  courier_contact_phone?: string;
  staff_phone?: string;
  vehicle_info?: string;
  warranty_items?: WarrantyItem[];
}

interface WarrantyItem {
  id: string;
  item_name: string;
  serial_numbers: string[];
  warranty_period_days: number;
  warranty_start_date?: string;
  warranty_end_date?: string;
  warranty_status: 'pending' | 'active' | 'expired';
  registration_code?: string;
}

const Delivery = () => {
  const [currentView, setCurrentView] = useState('delivery');
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [assigningOrder, setAssigningOrder] = useState<any>(null);
  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    customer_phone_backup: "",
    customer_email: "",
    customer_line_id: "",
    delivery_address: "",
    delivery_method_id: "",
    order_type: "new_product",
    priority: "normal",
    scheduled_date: new Date().toISOString().split('T')[0], // Default to today
    delivery_notes: "",
    special_instructions: ""
  });
  
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([
    {
      id: "1",
      order_number: "DL2025000001",
      customer_name: "บริษัท เอบีซี จำกัด",
      customer_phone: "02-123-4567",
      delivery_address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110",
      status: "delivered",
      priority: "urgent",
      delivery_date: "2025-01-09",
      driver_name: "สมชาย รถดี",
      tracking_number: "TRK001234567890",
      items_count: 2,
      total_weight: 25.5,
      delivery_notes: "ส่งก่อน 16:00 น.",
      created_at: "2025-01-08T10:30:00Z",
      warranty_items: [
        {
          id: "w1",
          item_name: "Industrial Panel PC รุ่น IPC-2150",
          serial_numbers: ["IPC2150-2025-001", "IPC2150-2025-002"],
          warranty_period_days: 7,
          warranty_start_date: "2025-01-09", // วันที่ส่งสินค้า
          warranty_end_date: "2025-01-16", // 7 วันหลังจากส่ง
          warranty_status: "active",
          registration_code: "REG20250001"
        },
        {
          id: "w2", 
          item_name: "Touch Monitor 15 นิ้ว",
          serial_numbers: ["TM15-2025-001"],
          warranty_period_days: 7,
          warranty_start_date: "2025-01-09",
          warranty_end_date: "2025-01-16",
          warranty_status: "active",
          registration_code: "REG20250002"
        }
      ]
    },
    {
      id: "2", 
      order_number: "DL2025000002",
      customer_name: "บริษัท เดฟจี จำกัด",
      customer_phone: "02-987-6543",
      delivery_address: "456 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310",
      status: "in_transit",
      priority: "normal",
      delivery_date: "2025-01-09",
      tracking_number: "TRK001234567891",
      items_count: 1,
      total_weight: 15.2,
      created_at: "2025-01-08T14:15:00Z",
      warranty_items: [
        {
          id: "w3",
          item_name: "Mini PC รุ่น MPC-500",
          serial_numbers: ["MPC500-2025-001"],
          warranty_period_days: 7,
          warranty_start_date: undefined, // ยังไม่ส่งสินค้า
          warranty_end_date: undefined,
          warranty_status: "pending",
          registration_code: undefined
        }
      ]
    },
    {
      id: "3",
      order_number: "DL2025000003", 
      customer_name: "บริษัท เทคโนโลยี จำกัด",
      customer_phone: "02-555-1234",
      delivery_address: "789 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
      status: "delivered",
      priority: "normal",
      delivery_date: "2025-01-02", // ส่งไป 7 วันแล้ว - ประกันหมดอายุ
      tracking_number: "TRK001234567892",
      items_count: 1,
      total_weight: 8.5,
      created_at: "2025-01-01T09:00:00Z",
      warranty_items: [
        {
          id: "w4",
          item_name: "Rugged Tablet 10 นิ้ว",
          serial_numbers: ["RT10-2025-001"],
          warranty_period_days: 7,
          warranty_start_date: "2025-01-02", // เริ่มประกัน
          warranty_end_date: "2025-01-09", // หมดประกันแล้ว (7 วันผ่านไป)
          warranty_status: "expired",
          registration_code: "REG20250003"
        }
      ]
    },
    {
      id: "4",
      order_number: "DL2025000004",
      customer_name: "ร้าน คอมพิวเตอร์ดี",
      customer_phone: "08-111-2222",
      delivery_address: "321 ถนนลาดพร้าว แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900",
      status: "preparing",
      priority: "normal", 
      delivery_date: "2025-01-10",
      tracking_number: "TRK001234567893",
      items_count: 3,
      total_weight: 12.0,
      created_at: "2025-01-09T08:00:00Z",
      warranty_items: [
        {
          id: "w5",
          item_name: "Water Proof PC",
          serial_numbers: ["WPC-2025-001"],
          warranty_period_days: 7,
          warranty_start_date: undefined,
          warranty_end_date: undefined,
          warranty_status: "pending",
          registration_code: undefined
        },
        {
          id: "w6",
          item_name: "Industrial PC Compact",
          serial_numbers: ["IPC-COM-001", "IPC-COM-002"],
          warranty_period_days: 7,
          warranty_start_date: undefined,
          warranty_end_date: undefined,
          warranty_status: "pending", 
          registration_code: undefined
        }
      ]
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
      preparing: "secondary",
      ready_to_ship: "outline", 
      shipped: "default",
      in_transit: "default",
      delivered: "default",
      failed: "destructive",
      returned: "secondary"
    } as const;

    const labels = {
      preparing: "เตรียมสินค้า",
      ready_to_ship: "พร้อมจัดส่ง",
      shipped: "จัดส่งแล้ว",
      in_transit: "กำลังจัดส่ง", 
      delivered: "จัดส่งสำเร็จ",
      failed: "จัดส่งไม่สำเร็จ",
      returned: "ส่งคืน"
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

  // Load data on component mount
  useEffect(() => {
    loadDeliveryMethods();
    loadCustomers();
    loadDeliveryOrders();
    loadStaff();
  }, []);

  const loadDeliveryMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_methods')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setDeliveryMethods(data || []);
    } catch (error) {
      console.error('Error loading delivery methods:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadDeliveryOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_orders')
        .select(`
          *,
          delivery_methods(name),
          staff(name, phone, vehicle_type, vehicle_plate),
          delivery_items(
            id,
            item_name,
            serial_numbers,
            warranty_period_days,
            warranty_start_date,
            warranty_end_date,
            product_warranties(
              id,
              registration_code,
              status
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = data?.map(order => {
        // Calculate warranty status for each item
        const warrantyItems = order.delivery_items?.map((item: any) => {
          let warrantyStatus: 'pending' | 'active' | 'expired' = 'pending';
          if (item.warranty_start_date) {
            const endDate = new Date(item.warranty_end_date);
            const today = new Date();
            warrantyStatus = endDate < today ? 'expired' : 'active';
          }
          
          return {
            id: item.id,
            item_name: item.item_name,
            serial_numbers: item.serial_numbers || [],
            warranty_period_days: item.warranty_period_days || 0,
            warranty_start_date: item.warranty_start_date,
            warranty_end_date: item.warranty_end_date,
            warranty_status: warrantyStatus,
            registration_code: item.product_warranties?.[0]?.registration_code
          };
        }) || [];

        return {
          id: order.id,
          order_number: order.delivery_number,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          delivery_address: order.delivery_address,
          status: order.status as any,
          priority: order.priority as any,
          delivery_date: order.scheduled_date || order.created_at,
          tracking_number: order.tracking_number || 'TBD',
          items_count: order.delivery_items?.length || 0,
          total_weight: order.weight_kg || 0,
          delivery_notes: order.delivery_notes,
          created_at: order.created_at,
          assigned_staff_id: order.assigned_staff_id,
          assignment_date: order.assignment_date,
          assignment_notes: order.assignment_notes,
          courier_contact_name: order.courier_contact_name,
          courier_contact_phone: order.courier_contact_phone,
          driver_name: order.staff?.name || null,
          staff_phone: order.staff?.phone || null,
          vehicle_info: order.staff ? `${order.staff.vehicle_type} ${order.staff.vehicle_plate}` : null,
          warranty_items: warrantyItems
        };
      }) || [];
      
      setDeliveryOrders(transformedData);
    } catch (error) {
      console.error('Error loading delivery orders:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, phone, email, line_id, is_available, current_workload, max_workload, rating, vehicle_type, vehicle_plate, staff_code')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const handleCreateDeliveryOrder = async () => {
    if (!formData.customer_name || !formData.customer_phone || !formData.delivery_address || !formData.delivery_method_id) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกชื่อลูกค้า, เบอร์โทร, ที่อยู่จัดส่ง และวิธีการจัดส่ง",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('delivery_orders')
        .insert({
          delivery_number: '', // Will be auto-generated by trigger
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || null,
          delivery_address: formData.delivery_address,
          delivery_method_id: formData.delivery_method_id,
          order_type: 'new_product', // Changed to match database constraint
          priority: formData.priority,
          scheduled_date: formData.scheduled_date || null,
          delivery_notes: formData.delivery_notes || null,
          special_instructions: formData.special_instructions || null,
          status: 'preparing'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "สร้างใบจัดส่งสำเร็จ",
        description: `ใบจัดส่งหมายเลข ${data.delivery_number} ถูกสร้างแล้ว`
      });

      // Reset form and close dialog
      setFormData({
        customer_id: "",
        customer_name: "",
        customer_phone: "",
        customer_phone_backup: "",
        customer_email: "",
        customer_line_id: "",
        delivery_address: "",
        delivery_method_id: "",
        order_type: "new_product",
        priority: "normal",
        scheduled_date: new Date().toISOString().split('T')[0],
        delivery_notes: "",
        special_instructions: ""
      });
      setIsCreateDialogOpen(false);
      
      // Reload delivery orders
      loadDeliveryOrders();
    } catch (error: any) {
      console.error('Error creating delivery order:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้างใบจัดส่งได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = async (customerId: string) => {
    if (!customerId || customerId === "new") {
      // Clear form if "new" is selected
      setFormData(prev => ({
        ...prev,
        customer_id: "",
        customer_name: "",
        customer_phone: "",
        customer_phone_backup: "",
        customer_email: "",
        customer_line_id: "",
        delivery_address: ""
      }));
      return;
    }
    
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customer_id: customerId,
        customer_name: customer.name,
        customer_phone: customer.phone || "",
        customer_phone_backup: customer.phone_backup || "",
        customer_email: customer.email || "",
        customer_line_id: customer.line_id || "",
        delivery_address: customer.address || ""
      }));
    }
  };

  const handleAssignDelivery = async (assignmentType: 'staff' | 'courier', assignmentData: any) => {
    if (!assigningOrder) return;

    setIsLoading(true);
    try {
      const updateData: any = {
        status: 'ready_to_ship', // แก้ไขจาก 'assigned' เป็น 'ready_to_ship'
        assignment_date: new Date().toISOString()
      };

      let assignedTo = '';
      let assignedPhone = '';
      let vehicleInfo = '';

      if (assignmentType === 'staff') {
        const selectedStaffMember = staff.find(s => s.id === assignmentData.staffId);
        updateData.assigned_staff_id = assignmentData.staffId;
        updateData.assignment_notes = assignmentData.notes;
        
        if (selectedStaffMember) {
          assignedTo = selectedStaffMember.name;
          assignedPhone = selectedStaffMember.phone || '';
          vehicleInfo = `${selectedStaffMember.vehicle_type} ${selectedStaffMember.vehicle_plate}`;
        }
      } else if (assignmentType === 'courier') {
        updateData.courier_contact_name = assignmentData.contactName;
        updateData.courier_contact_phone = assignmentData.contactPhone;
        updateData.assignment_notes = assignmentData.notes;
        updateData.tracking_number = assignmentData.trackingNumber;
        
        assignedTo = assignmentData.contactName;
        assignedPhone = assignmentData.contactPhone;
      }

      const { error } = await supabase
        .from('delivery_orders')
        .update(updateData)
        .eq('id', assigningOrder.id);

      if (error) throw error;

      // Send email notification to sales team
      try {
        const { data: userData } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', userData.user?.id)
          .single();

        await supabase.functions.invoke('send-delivery-assignment', {
          body: {
            deliveryNumber: assigningOrder.order_number,
            customerName: assigningOrder.customer_name,
            customerPhone: assigningOrder.customer_phone,
            deliveryAddress: assigningOrder.delivery_address,
            assignmentType,
            assignedTo,
            assignedPhone,
            vehicleInfo,
            notes: assignmentData.notes,
            assignedBy: profile?.full_name || 'ผู้ใช้ระบบ'
          }
        });
        console.log('Email notification sent successfully');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the assignment if email fails
      }

      toast({
        title: "มอบหมายงานสำเร็จ",
        description: assignmentType === 'staff' 
          ? `มอบหมายงานให้พนักงานแล้ว และส่งแจ้งเตือนให้ทีม Sales`
          : `มอบหมายงานให้ Courier แล้ว และส่งแจ้งเตือนให้ทีม Sales`
      });

      // Reload data
      loadDeliveryOrders();
      loadStaff();
      setIsAssignDialogOpen(false);
      setAssigningOrder(null);
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถมอบหมายงานได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOrder = (order: DeliveryOrder) => {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('delivery_orders')
        .update({ 
          status: newStatus,
          shipped_date: newStatus === 'in_transit' ? new Date().toISOString() : null,
          delivered_date: newStatus === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "อัปเดตสถานะสำเร็จ",
        description: `สถานะถูกเปลี่ยนเป็น ${getStatusLabel(newStatus)} แล้ว`
      });

      // Reload delivery orders
      loadDeliveryOrders();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      preparing: "เตรียมสินค้า",
      ready_to_ship: "พร้อมจัดส่ง",
      shipped: "จัดส่งแล้ว",
      in_transit: "กำลังจัดส่ง", 
      delivered: "จัดส่งสำเร็จ",
      failed: "จัดส่งไม่สำเร็จ",
      returned: "ส่งคืน"
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Calculate metrics
  const totalOrders = deliveryOrders.length;
  const preparingOrders = deliveryOrders.filter(o => o.status === 'preparing').length;
  const readyToShipOrders = deliveryOrders.filter(o => o.status === 'ready_to_ship').length;
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  สร้างใบจัดส่งใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>สร้างใบจัดส่งใหม่</DialogTitle>
                </DialogHeader>
                <DeliveryForm 
                  formData={formData}
                  setFormData={setFormData}
                  customers={customers}
                  deliveryMethods={deliveryMethods}
                  onCustomerSelect={handleCustomerSelect}
                  onSubmit={handleCreateDeliveryOrder}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>
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
              title="เตรียมสินค้า"
              value={preparingOrders}
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders">ใบจัดส่ง</TabsTrigger>
              <TabsTrigger value="warranty">ติดตามประกัน</TabsTrigger>
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
                    <SelectItem value="preparing">เตรียมสินค้า</SelectItem>
                    <SelectItem value="ready_to_ship">พร้อมจัดส่ง</SelectItem>
                    <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
                    <SelectItem value="in_transit">กำลังจัดส่ง</SelectItem>
                    <SelectItem value="delivered">จัดส่งสำเร็จ</SelectItem>
                    <SelectItem value="failed">จัดส่งไม่สำเร็จ</SelectItem>
                    <SelectItem value="returned">ส่งคืน</SelectItem>
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
                              สร้างเมื่อ: {new Date(order.created_at).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'Asia/Bangkok'
                              })}
                            </p>
                           
                            {/* Assignment Info */}
                             {order.assigned_staff_id && order.driver_name && (
                               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2">
                                 <div className="flex items-center gap-2 flex-wrap">
                                   <div className="flex items-center gap-2">
                                     <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                       <Users className="h-4 w-4 text-blue-600" />
                                     </div>
                                     <span className="text-sm font-semibold text-blue-700">มอบหมายแล้ว</span>
                                   </div>
                                   <span className="text-gray-300">|</span>
                                   <div className="flex items-center gap-1">
                                     <span className="text-sm">👨‍💼</span>
                                     <span className="text-sm font-medium text-blue-600">{order.driver_name}</span>
                                   </div>
                                   {order.staff_phone && (
                                     <>
                                       <span className="text-gray-300">|</span>
                                       <div className="flex items-center gap-1">
                                         <span className="text-sm">📞</span>
                                         <span className="text-sm text-gray-600">{order.staff_phone}</span>
                                       </div>
                                     </>
                                   )}
                                   {order.vehicle_info && (
                                     <>
                                       <span className="text-gray-300">|</span>
                                       <div className="flex items-center gap-1">
                                         <span className="text-sm">🚗</span>
                                         <span className="text-sm text-gray-600">{order.vehicle_info}</span>
                                       </div>
                                     </>
                                   )}
                                   {order.assignment_date && (
                                     <>
                                       <span className="text-gray-300">|</span>
                                       <div className="flex items-center gap-1">
                                         <span className="text-sm">📅</span>
                                         <span className="text-sm text-gray-600">
                                           {new Date(order.assignment_date).toLocaleDateString('th-TH', {
                                             day: 'numeric',
                                             month: 'short',
                                             hour: '2-digit',
                                             minute: '2-digit',
                                             timeZone: 'Asia/Bangkok'
                                           })}
                                         </span>
                                       </div>
                                     </>
                                   )}
                                 </div>
                               </div>
                             )}
                             {order.courier_contact_name && (
                               <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-2">
                                 <div className="flex items-center gap-2 flex-wrap">
                                   <div className="flex items-center gap-2">
                                     <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                       <Truck className="h-4 w-4 text-green-600" />
                                     </div>
                                     <span className="text-sm font-semibold text-green-700">Courier Service</span>
                                   </div>
                                   <span className="text-gray-300">|</span>
                                   <div className="flex items-center gap-1">
                                     <span className="text-sm">👨‍💼</span>
                                     <span className="text-sm font-medium text-green-600">{order.courier_contact_name}</span>
                                   </div>
                                   {order.courier_contact_phone && (
                                     <>
                                       <span className="text-gray-300">|</span>
                                       <div className="flex items-center gap-1">
                                         <span className="text-sm">📞</span>
                                         <span className="text-sm text-gray-600">{order.courier_contact_phone}</span>
                                       </div>
                                     </>
                                   )}
                                   {order.assignment_date && (
                                     <>
                                       <span className="text-gray-300">|</span>
                                       <div className="flex items-center gap-1">
                                         <span className="text-sm">📅</span>
                                         <span className="text-sm text-gray-600">
                                           {new Date(order.assignment_date).toLocaleDateString('th-TH', {
                                             day: 'numeric',
                                             month: 'short',
                                             hour: '2-digit',
                                             minute: '2-digit',
                                             timeZone: 'Asia/Bangkok'
                                           })}
                                         </span>
                                       </div>
                                     </>
                                   )}
                                 </div>
                               </div>
                             )}
                         </div>
                         <div className="flex gap-2">
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => {
                               setAssigningOrder(order);
                               setIsAssignDialogOpen(true);
                             }}
                           >
                             <UserPlus className="h-4 w-4 mr-1" />
                             มอบหมายงาน
                           </Button>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => handleEditOrder(order)}
                           >
                             <Edit className="h-4 w-4 mr-1" />
                             แก้ไขสถานะ
                           </Button>
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
                      </div>
                      
                       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
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
                         <div>
                           <span className="font-medium">ประกัน: </span>
                           <div className="flex items-center gap-1">
                             {order.warranty_items && order.warranty_items.length > 0 ? (
                               <>
                                 <Shield className="h-4 w-4 text-blue-500" />
                                 <span className="text-xs">
                                   {order.warranty_items.filter(item => item.warranty_status === 'active').length} ชิ้น
                                   {order.warranty_items.filter(item => item.warranty_status === 'expired').length > 0 && 
                                     ` (${order.warranty_items.filter(item => item.warranty_status === 'expired').length} หมดอายุ)`
                                   }
                                 </span>
                               </>
                             ) : (
                               <span className="text-xs text-muted-foreground">ไม่มีประกัน</span>
                             )}
                           </div>
                         </div>
                       </div>
                       
                       {/* Warranty Details Section */}
                       {order.warranty_items && order.warranty_items.length > 0 && (
                         <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                           <div className="flex items-center gap-2 mb-3">
                             <ShieldCheck className="h-4 w-4 text-blue-500" />
                             <span className="font-medium text-sm">รายละเอียดประกัน</span>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {order.warranty_items.map((item, index) => (
                               <div key={item.id} className="text-xs">
                                 <div className="flex items-center gap-2 mb-1">
                                   <span className="font-medium">{item.item_name}</span>
                                   <Badge 
                                     variant={
                                       item.warranty_status === 'active' ? 'default' : 
                                       item.warranty_status === 'expired' ? 'destructive' : 'secondary'
                                     }
                                     className="text-xs px-1 py-0"
                                   >
                                     {item.warranty_status === 'active' ? 'ใช้งานได้' : 
                                      item.warranty_status === 'expired' ? 'หมดอายุ' : 'รอเริ่มใช้'}
                                   </Badge>
                                 </div>
                                 {item.serial_numbers && item.serial_numbers.length > 0 && (
                                   <div className="text-muted-foreground">
                                     <span className="font-medium">S/N:</span> {item.serial_numbers.join(', ')}
                                   </div>
                                 )}
                                 {item.warranty_period_days > 0 && (
                                   <div className="text-muted-foreground">
                                     <span className="font-medium">ระยะประกัน:</span> {item.warranty_period_days} วัน
                                   </div>
                                 )}
                                 {item.warranty_start_date && (
                                   <div className="text-muted-foreground">
                                     <span className="font-medium">เริ่ม:</span> {new Date(item.warranty_start_date).toLocaleDateString('th-TH')}
                                     {item.warranty_end_date && (
                                       <> ถึง {new Date(item.warranty_end_date).toLocaleDateString('th-TH')}</>
                                     )}
                                   </div>
                                 )}
                                 {item.registration_code && (
                                   <div className="text-muted-foreground font-mono">
                                     <span className="font-medium">รหัสลงทะเบียน:</span> {item.registration_code}
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="warranty" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    ติดตามประกันสินค้า
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {deliveryOrders
                      .filter(order => order.warranty_items && order.warranty_items.length > 0)
                      .map((order) => (
                        <Card key={order.id} className="border border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">{order.order_number}</h4>
                                <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  จัดส่งเมื่อ: {new Date(order.delivery_date).toLocaleDateString('th-TH')}
                                </p>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(order.status)}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {order.warranty_items?.map((item, index) => (
                                <div key={item.id} className="p-3 border rounded-lg bg-gray-50/50">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-sm">{item.item_name}</h5>
                                      {item.serial_numbers && item.serial_numbers.length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                          Serial: {item.serial_numbers.join(', ')}
                                        </p>
                                      )}
                                    </div>
                                    <Badge 
                                      variant={
                                        item.warranty_status === 'active' ? 'default' : 
                                        item.warranty_status === 'expired' ? 'destructive' : 'secondary'
                                      }
                                      className="ml-2"
                                    >
                                      {item.warranty_status === 'active' ? 'ใช้งานได้' : 
                                       item.warranty_status === 'expired' ? 'หมดอายุ' : 'รอเริ่มใช้'}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <span className="font-medium">ระยะเวลาประกัน:</span>
                                      <p>{item.warranty_period_days} วัน</p>
                                    </div>
                                    {item.warranty_start_date && (
                                      <div>
                                        <span className="font-medium">วันที่เริ่มประกัน:</span>
                                        <p>{new Date(item.warranty_start_date).toLocaleDateString('th-TH')}</p>
                                      </div>
                                    )}
                                    {item.warranty_end_date && (
                                      <div>
                                        <span className="font-medium">วันที่หมดประกัน:</span>
                                        <p className={
                                          item.warranty_status === 'expired' ? 'text-red-600 font-medium' : ''
                                        }>
                                          {new Date(item.warranty_end_date).toLocaleDateString('th-TH')}
                                        </p>
                                      </div>
                                    )}
                                    {item.registration_code && (
                                      <div>
                                        <span className="font-medium">รหัสลงทะเบียน:</span>
                                        <p className="font-mono">{item.registration_code}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {item.warranty_status === 'pending' && order.status === 'delivered' && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                      <Info className="h-3 w-3 inline mr-1" />
                                      ประกันจะเริ่มนับจากวันที่จัดส่งสินค้าสำเร็จ
                                    </div>
                                  )}
                                  
                                  {item.warranty_status === 'expired' && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                                      ประกันหมดอายุแล้ว
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {deliveryOrders.filter(order => order.warranty_items && order.warranty_items.length > 0).length === 0 && (
                      <div className="text-center py-12">
                        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">ไม่พบข้อมูลประกัน</h3>
                        <p className="text-muted-foreground">
                          ยังไม่มีสินค้าที่มีประกันในระบบ
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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

          {/* Status Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>แก้ไขสถานะการจัดส่ง</DialogTitle>
              </DialogHeader>
              {editingOrder && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      ใบจัดส่ง: <span className="font-medium">{editingOrder.order_number}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ลูกค้า: <span className="font-medium">{editingOrder.customer_name}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      สถานะปัจจุบัน: {getStatusBadge(editingOrder.status)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>เปลี่ยนสถานะเป็น</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant={editingOrder.status === 'preparing' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(editingOrder.id, 'preparing')}
                        disabled={isLoading}
                        className="justify-start"
                      >
                        เตรียมสินค้า
                      </Button>
                      <Button
                        variant={editingOrder.status === 'ready_to_ship' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(editingOrder.id, 'ready_to_ship')}
                        disabled={isLoading}
                        className="justify-start"
                      >
                        พร้อมจัดส่ง
                      </Button>
                      <Button
                        variant={editingOrder.status === 'shipped' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(editingOrder.id, 'shipped')}
                        disabled={isLoading}
                        className="justify-start"
                      >
                        จัดส่งแล้ว
                      </Button>
                      <Button
                        variant={editingOrder.status === 'in_transit' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(editingOrder.id, 'in_transit')}
                        disabled={isLoading}
                        className="justify-start"
                      >
                        กำลังจัดส่ง
                      </Button>
                      <Button
                        variant={editingOrder.status === 'delivered' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(editingOrder.id, 'delivered')}
                        disabled={isLoading}
                        className="justify-start"
                      >
                        จัดส่งสำเร็จ
                      </Button>
                      <Button
                        variant={editingOrder.status === 'failed' ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(editingOrder.id, 'failed')}
                        disabled={isLoading}
                        className="justify-start"
                      >
                        จัดส่งไม่สำเร็จ
                      </Button>
                      <Button
                        variant={editingOrder.status === 'returned' ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(editingOrder.id, 'returned')}
                        disabled={isLoading}
                        className="justify-start"
                      >
                        ส่งคืน
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Assignment Dialog */}
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>มอบหมายการจัดส่ง</DialogTitle>
              </DialogHeader>
              {assigningOrder && <AssignmentForm />}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );

  // Assignment Form Component
  function AssignmentForm() {
    const [assignmentType, setAssignmentType] = useState<'staff' | 'courier'>('staff');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [courierData, setCourierData] = useState({
      contactName: '',
      contactPhone: '',
      trackingNumber: ''
    });
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
      if (assignmentType === 'staff') {
        if (!selectedStaff) {
          toast({
            title: "กรุณาเลือกพนักงาน",
            variant: "destructive"
          });
          return;
        }
        handleAssignDelivery('staff', {
          staffId: selectedStaff,
          notes
        });
      } else {
        if (!courierData.contactName || !courierData.contactPhone) {
          toast({
            title: "กรุณากรอกข้อมูล Courier",
            description: "กรุณากรอกชื่อผู้ติดต่อและเบอร์โทร",
            variant: "destructive"
          });
          return;
        }
        handleAssignDelivery('courier', {
          ...courierData,
          notes
        });
      }
    };

    const getAvailableStaff = () => staff.filter(s => s.is_available && s.current_workload < s.max_workload);
    const getStaffWorkloadDisplay = (staffMember: any) => `${staffMember.current_workload}/${staffMember.max_workload}`;
    const getVehicleIcon = (vehicleType: string) => {
      if (vehicleType?.includes('รถจักรยานยนต์')) return Bike;
      if (vehicleType?.includes('รถยนต์') || vehicleType?.includes('รถกระบะ')) return Car;
      return Building;
    };

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            ใบจัดส่ง: <span className="font-medium">{assigningOrder?.order_number}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            ลูกค้า: <span className="font-medium">{assigningOrder?.customer_name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            ที่อยู่: <span className="font-medium">{assigningOrder?.delivery_address}</span>
          </p>
        </div>

        {/* Assignment Type Selection */}
        <div className="space-y-3">
          <Label>เลือกประเภทการมอบหมาย</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={assignmentType === 'staff' ? "default" : "outline"}
              onClick={() => setAssignmentType('staff')}
              className="h-20 flex-col space-y-2"
            >
              <Users className="h-6 w-6" />
              <span>พนักงานบริษัท</span>
            </Button>
            <Button
              variant={assignmentType === 'courier' ? "default" : "outline"}
              onClick={() => setAssignmentType('courier')}
              className="h-20 flex-col space-y-2"
            >
              <Truck className="h-6 w-6" />
              <span>Courier Service</span>
            </Button>
          </div>
        </div>

        {/* Staff Assignment */}
        {assignmentType === 'staff' && (
          <div className="space-y-4">
            <Label>เลือกพนักงาน</Label>
            <div className="grid gap-3">
              {getAvailableStaff().length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  ไม่มีพนักงานที่ว่างในขณะนี้
                </p>
              ) : (
                getAvailableStaff().map((staffMember) => {
                  const VehicleIcon = getVehicleIcon(staffMember.vehicle_type);
                  return (
                    <Card 
                      key={staffMember.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedStaff === staffMember.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedStaff(staffMember.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <VehicleIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{staffMember.name}</p>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  รหัส: {staffMember.staff_code} | {staffMember.vehicle_type} {staffMember.vehicle_plate}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {staffMember.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {staffMember.phone}
                                    </span>
                                  )}
                                  {staffMember.line_id && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-green-600">LINE:</span>
                                      {staffMember.line_id}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              งาน: {getStaffWorkloadDisplay(staffMember)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ⭐ {staffMember.rating || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Courier Assignment */}
        {assignmentType === 'courier' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courier-contact">ชื่อผู้ติดต่อ *</Label>
                <Input
                  id="courier-contact"
                  value={courierData.contactName}
                  onChange={(e) => setCourierData(prev => ({...prev, contactName: e.target.value}))}
                  placeholder="ชื่อคนขับ/ผู้ติดต่อ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courier-phone">เบอร์โทร *</Label>
                <Input
                  id="courier-phone"
                  value={courierData.contactPhone}
                  onChange={(e) => setCourierData(prev => ({...prev, contactPhone: e.target.value}))}
                  placeholder="0xx-xxx-xxxx"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking-number">Tracking Number</Label>
              <Input
                id="tracking-number"
                value={courierData.trackingNumber}
                onChange={(e) => setCourierData(prev => ({...prev, trackingNumber: e.target.value}))}
                placeholder="หมายเลขติดตาม (ถ้ามี)"
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="assignment-notes">หมายเหตุการมอบหมาย</Label>
          <Textarea
            id="assignment-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="หมายเหตุเพิ่มเติม..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "กำลังมอบหมาย..." : "มอบหมายงาน"}
          </Button>
        </div>
      </div>
    );
  }

  // Delivery Form Component
  function DeliveryForm({ 
    formData, 
    setFormData, 
    customers,
    deliveryMethods,
    onCustomerSelect,
    onSubmit, 
    onCancel, 
    isLoading 
  }: {
    formData: any;
    setFormData: (data: any) => void;
    customers: any[];
    deliveryMethods: any[];
    onCustomerSelect: (customerId: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isLoading: boolean;
  }) {
    return (
      <div className="space-y-6">
        {/* Customer Selection Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">ข้อมูลลูกค้า</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-select">เลือกลูกค้า (ถ้ามี)</Label>
              <Select value={formData.customer_id} onValueChange={onCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกลูกค้าที่มีอยู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">ไม่เลือก (กรอกข้อมูลใหม่)</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-name">ชื่อลูกค้า *</Label>
              <Input
                id="customer-name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({...prev, customer_name: e.target.value}))}
                placeholder="ชื่อลูกค้า"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">ข้อมูลการติดต่อ</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-phone">เบอร์โทรศัพท์ *</Label>
              <Input
                id="customer-phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({...prev, customer_phone: e.target.value}))}
                placeholder="0xx-xxx-xxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone-backup">เบอร์สำรอง</Label>
              <Input
                id="customer-phone-backup"
                value={formData.customer_phone_backup}
                onChange={(e) => setFormData(prev => ({...prev, customer_phone_backup: e.target.value}))}
                placeholder="เบอร์โทรสำรอง (ถ้ามี)"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="customer-email">อีเมล</Label>
              <Input
                id="customer-email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData(prev => ({...prev, customer_email: e.target.value}))}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-line-id">Line ID</Label>
              <Input
                id="customer-line-id"
                value={formData.customer_line_id}
                onChange={(e) => setFormData(prev => ({...prev, customer_line_id: e.target.value}))}
                placeholder="Line ID ลูกค้า (ถ้ามี)"
              />
            </div>
          </div>
        </div>

        {/* Delivery Address Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">ที่อยู่จัดส่ง</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-address">ที่อยู่จัดส่ง *</Label>
            <Textarea
              id="delivery-address"
              value={formData.delivery_address}
              onChange={(e) => setFormData(prev => ({...prev, delivery_address: e.target.value}))}
              placeholder="ที่อยู่สำหรับจัดส่งสินค้า"
              rows={3}
            />
          </div>
        </div>

        {/* Delivery Settings Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">การตั้งค่าการจัดส่ง</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-method">วิธีการจัดส่ง *</Label>
              <Select value={formData.delivery_method_id} onValueChange={(value) => setFormData(prev => ({...prev, delivery_method_id: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกวิธีการจัดส่ง" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-type">ประเภทการจัดส่ง</Label>
              <Select value={formData.order_type} onValueChange={(value) => setFormData(prev => ({...prev, order_type: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="ประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_product">จัดส่งสินค้าใหม่</SelectItem>
                  <SelectItem value="repair_return">ส่งคืนของซ่อม</SelectItem>
                  <SelectItem value="warranty_claim">เคลมสินค้า</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">ความเร่งด่วน</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({...prev, priority: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="ความเร่งด่วน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">ปกติ</SelectItem>
                  <SelectItem value="urgent">เร่งด่วน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled-date">วันที่ต้องการจัดส่ง</Label>
              <Input
                id="scheduled-date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({...prev, scheduled_date: e.target.value}))}
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Edit className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">หมายเหตุ</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-notes">หมายเหตุการจัดส่ง</Label>
              <Textarea
                id="delivery-notes"
                value={formData.delivery_notes}
                onChange={(e) => setFormData(prev => ({...prev, delivery_notes: e.target.value}))}
                placeholder="หมายเหตุเพิ่มเติม เช่น เวลาที่สะดวกรับ"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special-instructions">คำสั่งพิเศษ</Label>
              <Textarea
                id="special-instructions"
                value={formData.special_instructions}
                onChange={(e) => setFormData(prev => ({...prev, special_instructions: e.target.value}))}
                placeholder="คำสั่งพิเศษสำหรับคนขับ"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "กำลังสร้าง..." : "สร้างใบจัดส่ง"}
          </Button>
        </div>
      </div>
    );
  }
};

export default Delivery;