import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreHorizontal, Phone, Mail } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock data for demonstration
const customersData = [
  {
    id: 1,
    name: "101 Training Co.,Ltd",
    contact: "Ms. Nithima Chuai..",
    phone: "06-5526-6591",
    email: "nithima@101training.c..",
    type: "ลูกค้า",
    status: "สำคัญ"
  },
  {
    id: 2,
    name: "101TRAINING COMPANY LIMITED",
    contact: "Ms.Nithima Chuai..",
    phone: "065-5266591",
    email: "Nithima@101training.c..",
    type: "ลูกค้า",
    status: "สำคัญ"
  },
  {
    id: 3,
    name: "108 OA Co.,Ltd.",
    contact: "Lamul Lunkhunto..",
    phone: "02 410 4488ex..",
    email: "lamul@108oa.co.th",
    type: "ลูกค้า",
    status: undefined
  },
  {
    id: 4,
    name: "24 Automation CO.,LTD.",
    contact: "คุณอดิศักดิ์ อินดี",
    phone: "02-015-6610",
    email: "info@24automation.com",
    type: "ลูกค้า",
    status: undefined
  }
];

const suppliersData = [
  {
    id: 1,
    name: "2 Be Shop (บริษัทอีไลฟ์ จิตเสียส์ จำกัด)",
    contact: "",
    phone: "",
    email: "",
    type: "ผู้จำหน่าย",
    status: undefined
  }
];

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("customers");

  const getFilteredData = () => {
    const data = activeTab === "customers" ? customersData : 
                 activeTab === "suppliers" ? suppliersData : 
                 [...customersData, ...suppliersData];
    
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  สร้างใหม่
                </Button>
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
                    {getFilteredData().map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.status && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {getStatusBadge(item.status)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm">{item.contact}</div>
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
                          <Badge variant="outline">{item.type}</Badge>
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