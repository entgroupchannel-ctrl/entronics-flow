import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, DollarSign, Clock } from "lucide-react";
import { InternationalTransferForm } from "@/components/international-transfer/InternationalTransferForm";
import { TransferRequestsList } from "@/components/international-transfer/TransferRequestsList";
import { useToast } from "@/hooks/use-toast";

export default function InternationalTransfer() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingRequest, setEditingRequest] = useState(null);
  const [currentView, setCurrentView] = useState('international-transfer');
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: transferRequests, isLoading, refetch } = useQuery({
    queryKey: ["international-transfer-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("international_transfer_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transfer requests:", error);
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลคำขอโอนเงินได้",
          variant: "destructive",
        });
        throw error;
      }
      
      // Get profile data for creators
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(req => req.requested_by).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name, username")
            .in("user_id", userIds);
          
          // Attach profile data to requests
          const requestsWithProfiles = data.map(request => ({
            ...request,
            profiles: profiles?.find(p => p.user_id === request.requested_by) || null
          }));
          
          return requestsWithProfiles;
        }
      }
      
      return data || [];
    },
  });

  // Calculate statistics
  const stats = transferRequests ? {
    total: transferRequests.length,
    pending: transferRequests.filter(req => req.status === 'pending').length,
    approved: transferRequests.filter(req => req.status === 'approved').length,
    totalAmount: transferRequests.reduce((sum, req) => sum + (req.transfer_amount || 0), 0)
  } : { total: 0, pending: 0, approved: 0, totalAmount: 0 };

  const handleNewRequest = () => {
    setEditingRequest(null);
    setActiveTab("form");
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setActiveTab("form");
  };

  const handleFormSuccess = () => {
    refetch();
    setActiveTab("list");
    setEditingRequest(null);
    toast({
      title: "สำเร็จ",
      description: editingRequest ? "แก้ไขคำขอโอนเงินเรียบร้อยแล้ว" : "สร้างคำขอโอนเงินเรียบร้อยแล้ว",
    });
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">โอนเงินต่างประเทศ</h1>
          <p className="text-muted-foreground">
            จัดการคำขอโอนเงินไปยัง Supplier ต่างประเทศ
          </p>
        </div>
        <Button onClick={handleNewRequest} className="gap-2">
          <Plus className="h-4 w-4" />
          สร้างคำขอใหม่
        </Button>
      </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">คำขอทั้งหมด</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">รออนุมัติ</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
                <Badge variant="secondary" className="h-4 w-4 bg-green-100 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">มูลค่ารวม</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  ${stats.totalAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="list">รายการคำขอ</TabsTrigger>
              <TabsTrigger value="form">
                {editingRequest ? "แก้ไขคำขอ" : "สร้างคำขอใหม่"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <TransferRequestsList
                requests={transferRequests || []}
                isLoading={isLoading}
                onEdit={handleEditRequest}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="form" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingRequest ? "แก้ไขคำขอโอนเงิน" : "สร้างคำขอโอนเงินใหม่"}
                  </CardTitle>
                  <CardDescription>
                    กรอกข้อมูลสำหรับการโอนเงินไปยัง Supplier ต่างประเทศ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InternationalTransferForm
                    editingRequest={editingRequest}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setActiveTab("list")}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    </div>
  );
}