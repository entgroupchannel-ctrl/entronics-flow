import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Car, 
  Bike, 
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  UserCheck,
  UserX,
  Search,
  Clock,
  Pause,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Staff {
  id: string;
  staff_code: string;
  name: string;
  phone?: string;
  email?: string;
  line_id?: string;
  position: string;
  department: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  license_number?: string;
  is_available: boolean;
  is_active: boolean;
  current_workload: number;
  max_workload: number;
  rating: number;
  total_deliveries: number;
  successful_deliveries: number;
  hire_date?: string;
  salary?: number;
  notes?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  created_at: string;
}

const StaffManagement = () => {
  const [currentView, setCurrentView] = useState('staff-management');
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    staff_code: "",
    name: "",
    phone: "",
    email: "",
    line_id: "",
    position: "driver",
    department: "delivery",
    vehicle_type: "",
    vehicle_plate: "",
    license_number: "",
    max_workload: 5,
    hire_date: new Date().toISOString().split('T')[0],
    salary: "",
    notes: "",
    emergency_contact: "",
    emergency_phone: ""
  });

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, statusFilter]);

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลพนักงานได้",
        variant: "destructive"
      });
    }
  };

  const filterStaff = () => {
    let filtered = staff;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.staff_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.vehicle_plate?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(s => s.is_active && s.is_available);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(s => !s.is_active);
      } else if (statusFilter === "busy") {
        filtered = filtered.filter(s => s.is_active && !s.is_available);
      }
    }

    setFilteredStaff(filtered);
  };

  const resetForm = () => {
    setFormData({
      staff_code: "",
      name: "",
      phone: "",
      email: "",
      line_id: "",
      position: "driver",
      department: "delivery",
      vehicle_type: "",
      vehicle_plate: "",
      license_number: "",
      max_workload: 5,
      hire_date: new Date().toISOString().split('T')[0],
      salary: "",
      notes: "",
      emergency_contact: "",
      emergency_phone: ""
    });
  };

  const handleCreateStaff = async () => {
    if (!formData.name || !formData.staff_code) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกชื่อและรหัสพนักงาน",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
     try {
       const { error } = await supabase
         .from('staff')
         .insert({
           staff_code: formData.staff_code,
           name: formData.name,
           phone: formData.phone || null,
           email: formData.email || null,
           line_id: formData.line_id || null,
           position: formData.position,
           department: formData.department,
           vehicle_type: formData.vehicle_type || null,
           vehicle_plate: formData.vehicle_plate || null,
           license_number: formData.license_number || null,
           max_workload: formData.max_workload,
           hire_date: formData.hire_date || null,
           salary: formData.salary ? parseFloat(formData.salary) : null,
           notes: formData.notes || null,
           emergency_contact: formData.emergency_contact || null,
           emergency_phone: formData.emergency_phone || null,
           is_active: true,
           is_available: true,
           current_workload: 0,
           rating: 0,
           total_deliveries: 0,
           successful_deliveries: 0,
           created_by: (await supabase.auth.getUser()).data.user?.id
         });

      if (error) throw error;

      toast({
        title: "เพิ่มพนักงานสำเร็จ",
        description: `เพิ่มพนักงาน ${formData.name} เรียบร้อยแล้ว`
      });

      resetForm();
      setIsCreateDialogOpen(false);
      loadStaff();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มพนักงานได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      staff_code: staff.staff_code,
      name: staff.name,
      phone: staff.phone || "",
      email: staff.email || "",
      line_id: staff.line_id || "",
      position: staff.position,
      department: staff.department,
      vehicle_type: staff.vehicle_type || "",
      vehicle_plate: staff.vehicle_plate || "",
      license_number: staff.license_number || "",
      max_workload: staff.max_workload,
      hire_date: staff.hire_date || "",
      salary: staff.salary?.toString() || "",
      notes: staff.notes || "",
      emergency_contact: staff.emergency_contact || "",
      emergency_phone: staff.emergency_phone || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !formData.name || !formData.staff_code) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกชื่อและรหัสพนักงาน",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('staff')
        .update({
          staff_code: formData.staff_code,
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          line_id: formData.line_id || null,
          position: formData.position,
          department: formData.department,
          vehicle_type: formData.vehicle_type || null,
          vehicle_plate: formData.vehicle_plate || null,
          license_number: formData.license_number || null,
          max_workload: formData.max_workload,
          hire_date: formData.hire_date || null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          notes: formData.notes || null,
          emergency_contact: formData.emergency_contact || null,
          emergency_phone: formData.emergency_phone || null,
        })
        .eq('id', editingStaff.id);

      if (error) throw error;

      toast({
        title: "แก้ไขข้อมูลสำเร็จ",
        description: `แก้ไขข้อมูล ${formData.name} เรียบร้อยแล้ว`
      });

      resetForm();
      setIsEditDialogOpen(false);
      setEditingStaff(null);
      loadStaff();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถแก้ไขข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      toast({
        title: "ลบพนักงานสำเร็จ",
        description: `ลบพนักงาน ${staffName} เรียบร้อยแล้ว`
      });

      loadStaff();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบพนักงานได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStaffStatus = async (staffId: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_active: !currentStatus })
        .eq('id', staffId);

      if (error) throw error;

      toast({
        title: "เปลี่ยนสถานะสำเร็จ",
        description: `${!currentStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}พนักงานแล้ว`
      });

      loadStaff();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเปลี่ยนสถานะได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailabilityStatus = async (staffId: string, currentAvailability: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_available: !currentAvailability })
        .eq('id', staffId);

      if (error) throw error;

      toast({
        title: "เปลี่ยนสถานะพร้อมงานสำเร็จ",
        description: `${!currentAvailability ? 'พร้อมทำงาน' : 'ไม่ว่าง'}`
      });

      loadStaff();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเปลี่ยนสถานะได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    if (vehicleType?.includes('รถจักรยานยนต์')) return Bike;
    if (vehicleType?.includes('รถยนต์') || vehicleType?.includes('รถกระบะ') || vehicleType?.includes('รถบรรทุก')) return Car;
    return Building;
  };

  const getStatusBadge = (staff: Staff) => {
    if (!staff.is_active) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <UserX className="h-3 w-3" />
        ปิดใช้งาน
      </Badge>;
    }
    if (!staff.is_available) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        ไม่ว่าง
      </Badge>;
    }
    return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
      <UserCheck className="h-3 w-3" />
      พร้อมงาน
    </Badge>;
  };

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
              <h1 className="text-3xl font-bold">จัดการพนักงานขับรถ</h1>
              <p className="text-muted-foreground">เพิ่ม แก้ไข และจัดการข้อมูลพนักงานขับรถ</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มพนักงานใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>เพิ่มพนักงานขับรถใหม่</DialogTitle>
                </DialogHeader>
                <StaffForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleCreateStaff}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isLoading={isLoading}
                  isEdit={false}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาพนักงาน (ชื่อ, รหัส, เบอร์โทร, ทะเบียนรถ)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="กรองตามสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="active">พร้อมงาน</SelectItem>
                    <SelectItem value="busy">ไม่ว่าง</SelectItem>
                    <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Staff Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">พนักงานทั้งหมด</p>
                    <p className="text-2xl font-bold">{staff.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">พร้อมงาน</p>
                    <p className="text-2xl font-bold text-green-600">
                      {staff.filter(s => s.is_active && s.is_available).length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ไม่ว่าง</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {staff.filter(s => s.is_active && !s.is_available).length}
                    </p>
                  </div>
                  <UserX className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ปิดใช้งาน</p>
                    <p className="text-2xl font-bold text-red-600">
                      {staff.filter(s => !s.is_active).length}
                    </p>
                  </div>
                  <UserX className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff List */}
          <div className="grid gap-4">
            {filteredStaff.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">ไม่พบข้อมูลพนักงาน</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" 
                      : "เริ่มต้นด้วยการเพิ่มพนักงานคนแรก"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredStaff.map((staffMember) => {
                const VehicleIcon = getVehicleIcon(staffMember.vehicle_type || '');
                return (
                  <Card key={staffMember.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <VehicleIcon className="h-10 w-10 text-muted-foreground" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{staffMember.name}</h3>
                              {getStatusBadge(staffMember)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              รหัส: {staffMember.staff_code} | {staffMember.position} - {staffMember.department}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {staffMember.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {staffMember.phone}
                                </span>
                              )}
                              {staffMember.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {staffMember.email}
                                </span>
                              )}
                              {staffMember.line_id && (
                                <span className="flex items-center gap-1">
                                  <span className="text-green-600">LINE:</span>
                                  {staffMember.line_id}
                                </span>
                              )}
                            </div>
                            {staffMember.vehicle_type && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <VehicleIcon className="h-4 w-4" />
                                <span>{staffMember.vehicle_type} {staffMember.vehicle_plate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right text-sm">
                            <p className="font-medium">งาน: {staffMember.current_workload}/{staffMember.max_workload}</p>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {staffMember.rating.toFixed(1)} | จัดส่ง: {staffMember.successful_deliveries}/{staffMember.total_deliveries}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStaff(staffMember)}
                              title="แก้ไขข้อมูล"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            {/* Available/Busy Toggle */}
                            {staffMember.is_active && (
                              <Button
                                variant={staffMember.is_available ? "default" : "secondary"}
                                size="sm"
                                onClick={() => toggleAvailabilityStatus(staffMember.id, staffMember.is_available)}
                                title={staffMember.is_available ? "เปลี่ยนเป็นไม่ว่าง" : "เปลี่ยนเป็นพร้อมงาน"}
                              >
                                {staffMember.is_available ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                            )}
                            
                            {/* Active/Inactive Toggle */}
                            <Button
                              variant={staffMember.is_active ? "secondary" : "default"}
                              size="sm"
                              onClick={() => toggleStaffStatus(staffMember.id, staffMember.is_active)}
                              title={staffMember.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                            >
                              {staffMember.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" title="ลบพนักงาน">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>ยืนยันการลบพนักงาน</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    คุณแน่ใจหรือไม่ที่จะลบพนักงาน "{staffMember.name}" ?
                                    การกระทำนี้ไม่สามารถย้อนกลับได้
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteStaff(staffMember.id, staffMember.name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    ลบพนักงาน
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
              </DialogHeader>
              <StaffForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdateStaff}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingStaff(null);
                  resetForm();
                }}
                isLoading={isLoading}
                isEdit={true}
              />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );

  // Staff Form Component
  function StaffForm({ 
    formData, 
    setFormData, 
    onSubmit, 
    onCancel, 
    isLoading, 
    isEdit 
  }: {
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isLoading: boolean;
    isEdit: boolean;
  }) {
    return (
      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">ข้อมูลพื้นฐาน</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff_code">รหัสพนักงาน *</Label>
              <Input
                id="staff_code"
                value={formData.staff_code}
                onChange={(e) => setFormData(prev => ({...prev, staff_code: e.target.value}))}
                placeholder="DRV001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                placeholder="ชื่อ นามสกุล"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทร</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                placeholder="081-234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                placeholder="example@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line_id">Line ID</Label>
              <Input
                id="line_id"
                value={formData.line_id}
                onChange={(e) => setFormData(prev => ({...prev, line_id: e.target.value}))}
                placeholder="line_id"
              />
            </div>
          </div>
        </div>

        {/* Job Information Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">ข้อมูลงาน</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">ตำแหน่ง</Label>
              <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({...prev, position: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">คนขับ</SelectItem>
                  <SelectItem value="assistant">ผู้ช่วยจัดส่ง</SelectItem>
                  <SelectItem value="supervisor">หัวหน้าทีม</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">แผนก</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({...prev, department: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกแผนก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">จัดส่ง</SelectItem>
                  <SelectItem value="logistics">โลจิสติกส์</SelectItem>
                  <SelectItem value="warehouse">คลังสินค้า</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Vehicle Information Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">ข้อมูลยานพาหนะ</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">ประเภทยานพาหนะ</Label>
              <Select value={formData.vehicle_type} onValueChange={(value) => setFormData(prev => ({...prev, vehicle_type: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทยานพาหนะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="รถจักรยานยนต์">รถจักรยานยนต์</SelectItem>
                  <SelectItem value="รถยนต์">รถยนต์</SelectItem>
                  <SelectItem value="รถกระบะ">รถกระบะ</SelectItem>
                  <SelectItem value="รถบรรทุก">รถบรรทุก</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_plate">ทะเบียนรถ</Label>
              <Input
                id="vehicle_plate"
                value={formData.vehicle_plate}
                onChange={(e) => setFormData(prev => ({...prev, vehicle_plate: e.target.value}))}
                placeholder="กข-1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">เลขที่ใบขับขี่</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData(prev => ({...prev, license_number: e.target.value}))}
                placeholder="12345678"
              />
            </div>
          </div>
        </div>

        {/* Work Settings Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">การตั้งค่างาน</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_workload">งานสูงสุดต่อวัน</Label>
              <Input
                id="max_workload"
                type="number"
                min="1"
                max="20"
                value={formData.max_workload}
                onChange={(e) => setFormData(prev => ({...prev, max_workload: parseInt(e.target.value) || 5}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">วันที่เริ่มงาน</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData(prev => ({...prev, hire_date: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">เงินเดือน (บาท)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({...prev, salary: e.target.value}))}
                placeholder="15000"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">ผู้ติดต่อฉุกเฉิน</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">ชื่อผู้ติดต่อฉุกเฉิน</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => setFormData(prev => ({...prev, emergency_contact: e.target.value}))}
                placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">เบอร์โทรฉุกเฉิน</Label>
              <Input
                id="emergency_phone"
                value={formData.emergency_phone}
                onChange={(e) => setFormData(prev => ({...prev, emergency_phone: e.target.value}))}
                placeholder="081-234-5678"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">หมายเหตุ</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
              placeholder="หมายเหตุเพิ่มเติม..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "กำลังบันทึก..." : (isEdit ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน")}
          </Button>
        </div>
      </div>
    );
  }
};

export default StaffManagement;