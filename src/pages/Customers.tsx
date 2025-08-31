import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Phone, Mail, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { AddCustomerForm } from '@/components/customers/AddCustomerForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  customer_type: string;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch customers from database
  const fetchCustomers = async () => {
    try {
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
    return filteredData.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.contact_person && item.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getStatusBadge = (status?: string | null) => {
    if (!status || status === 'ปกติ') return null;
    return (
      <Badge variant={status === "สำคัญ" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ลูกค้า':
        return 'bg-blue-500';
      case 'ผู้จำหน่าย':
        return 'bg-orange-500';
      case 'ผู้จำหน่าย/ลูกค้า':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="p-6">
              <div className="text-center py-8">กำลังโหลด...</div>
            </main>
          </div>
        </div>
      </div>
    );
  }

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
                        ลูกค้า ({customers.filter(c => c.customer_type === 'ลูกค้า').length})
                      </TabsTrigger>
                      <TabsTrigger value="suppliers" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        ผู้จำหน่าย ({customers.filter(c => c.customer_type === 'ผู้จำหน่าย').length})
                      </TabsTrigger>
                      <TabsTrigger value="both" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        ผู้จำหน่าย/ลูกค้า ({customers.filter(c => c.customer_type === 'ผู้จำหน่าย/ลูกค้า').length})
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
                    {getFilteredData().map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getTypeColor(item.customer_type)}`}></div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.status && item.status !== 'ปกติ' && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {getStatusBadge(item.status)}
                                </div>
                              )}
                              {item.address && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {item.address.substring(0, 30)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm">{item.contact_person || '-'}</div>
                        <div className="col-span-2 text-sm">
                          {item.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {item.phone}
                            </div>
                          ) : '-'}
                        </div>
                        <div className="col-span-2 text-sm">
                          {item.email ? (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {item.email}
                            </div>
                          ) : '-'}
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
                    ))}
                  </div>

                  {getFilteredData().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูลที่ค้นหา
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}