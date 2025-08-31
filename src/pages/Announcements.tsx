import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Megaphone, 
  Package, 
  Tag, 
  TrendingUp,
  Star,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  User,
  ArrowLeft
} from "lucide-react";

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

const Announcements = () => {
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
    setupRealtimeSubscription();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      // Use any type to avoid TypeScript issues with missing table definition
      const { data, error } = await (supabase as any)
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .lte('published_at', new Date().toISOString())
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Filter announcements based on user roles  
      const filteredAnnouncements = data?.filter((announcement: any) => {
        if (announcement.target_roles?.includes('all')) return true;
        return announcement.target_roles?.includes(userRole) || false;
      }) || [];

      setAnnouncements(filteredAnnouncements);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลประกาศได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'new_product':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'promotion':
        return <Tag className="h-5 w-5 text-green-500" />;
      case 'stock_update':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'maintenance':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'policy':
        return <User className="h-5 w-5 text-purple-500" />;
      default:
        return <Megaphone className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      new_product: 'สินค้าใหม่',
      promotion: 'โปรโมชั่น',
      stock_update: 'อัพเดทสต็อก',
      maintenance: 'การบำรุงรักษา',
      policy: 'นโยบาย',
      general: 'ทั่วไป'
    };
    return labels[type] || type;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "destructive"
    } as const;

    const labels = {
      low: "ปกติ",
      medium: "ปานกลาง", 
      high: "สำคัญ"
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "secondary"}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || announcement.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || announcement.priority === priorityFilter;

    return matchesSearch && matchesType && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div>กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (selectedAnnouncement) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedAnnouncement(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </Button>
            <h1 className="text-2xl font-bold">รายละเอียดประกาศ</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getAnnouncementIcon(selectedAnnouncement.type)}
                  <div>
                    <CardTitle className="text-xl">{selectedAnnouncement.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{getTypeLabel(selectedAnnouncement.type)}</Badge>
                      {getPriorityBadge(selectedAnnouncement.priority)}
                      {selectedAnnouncement.priority === 'high' && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">รายละเอียด</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedAnnouncement.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium">วันที่เผยแพร่</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedAnnouncement.published_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {selectedAnnouncement.expires_at && (
                  <div>
                    <p className="text-sm font-medium">วันหมดอายุ</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedAnnouncement.expires_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">ข่าวสารและประกาศ</h1>
            <p className="text-muted-foreground">ข้อมูลข่าวสารและการประกาศล่าสุด</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="ค้นหาประกาศ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="ประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกประเภท</SelectItem>
                  <SelectItem value="new_product">สินค้าใหม่</SelectItem>
                  <SelectItem value="promotion">โปรโมชั่น</SelectItem>
                  <SelectItem value="stock_update">อัพเดทสต็อก</SelectItem>
                  <SelectItem value="maintenance">การบำรุงรักษา</SelectItem>
                  <SelectItem value="policy">นโยบาย</SelectItem>
                  <SelectItem value="general">ทั่วไป</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="ความสำคัญ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกระดับ</SelectItem>
                  <SelectItem value="high">สำคัญ</SelectItem>
                  <SelectItem value="medium">ปานกลาง</SelectItem>
                  <SelectItem value="low">ปกติ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">ไม่มีประกาศในขณะนี้</h3>
              <p className="text-muted-foreground">ยังไม่มีประกาศที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedAnnouncement(announcement)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getAnnouncementIcon(announcement.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(announcement.type)}
                        </Badge>
                        {getPriorityBadge(announcement.priority)}
                        {announcement.priority === 'high' && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <CardTitle className="text-base line-clamp-2">
                        {announcement.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {announcement.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(announcement.published_at).toLocaleDateString('th-TH')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;