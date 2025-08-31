import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Phone, Mail } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { AddCustomerForm } from '@/components/customers/AddCustomerForm';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  customer_type: string;
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลลูกค้าได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getFilteredData = () => {
    let filteredData = customers;
    
    // Filter by tab
    if (activeTab === "customers") {
      filteredData = customers.filter(c => c.customer_type === "ลูกค้า");
    } else if (activeTab === "suppliers") {
      filteredData = customers.filter(c => c.customer_type === "ผู้จำหน่าย");
    } else if (activeTab === "both") {
      filteredData = customers.filter(c => c.customer_type === "ผู้จำหน่าย/ลูกค้า");
    }
    
    // Filter by search term
    if (searchTerm) {
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.contact_person && item.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filteredData;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    return (
      <Badge variant={status === "สำคัญ" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">รายชื่อลูกค้า</h1>
                  <p className="text-muted-foreground">จัดการข้อมูลลูกค้าและผู้จำหน่าย</p>
                </div>
                <AddCustomerForm onSuccess={fetchCustomers} />
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="ค้นหาชื่อ หรือผู้ติดต่อ"
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs and Content */}
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="customers" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        ลูกค้า
                      </TabsTrigger>
                      <TabsTrigger value="suppliers" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        ผู้จำหน่าย
                      </TabsTrigger>
                      <TabsTrigger value="both" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        ผู้จำหน่าย/ลูกค้า
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 rounded-t-lg font-medium text-sm">
                    <div className="col-span-3">รายชื่อ</div>
                    <div className="col-span-2">ชื่อผู้ติดต่อ</div>
                    <div className="col-span-2">เบอร์ติดต่อ</div>
                    <div className="col-span-2">อีเมล</div>
                    <div className="col-span-2">ประเภท</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Table Content */}
                  <div className="divide-y divide-border">
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        กำลังโหลดข้อมูล...
                      </div>
                    ) : getFilteredData().length > 0 ? (
                      getFilteredData().map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors">
                          <div className="col-span-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                item.customer_type === 'ลูกค้า' ? 'bg-blue-500' : 
                                item.customer_type === 'ผู้จำหน่าย' ? 'bg-orange-500' : 'bg-green-500'
                              }`}></div>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                {item.status && item.status !== 'ปกติ' && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {getStatusBadge(item.status)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 text-sm">{item.contact_person}</div>
                          <div className="col-span-2 text-sm">
                            {item.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {item.phone}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 text-sm">
                            {item.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {item.email}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 text-sm">
                            <Badge variant="outline">{item.customer_type}</Badge>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        ไม่พบข้อมูลที่ค้นหา
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}