import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const Reports = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">รายงาน / Reports</h1>
          <p className="text-muted-foreground">สร้างและจัดการรายงาน</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          ส่งออกรายงาน
        </Button>
      </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  รายงานยอดขาย
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  รายงานยอดขายและรายได้รายวัน รายเดือน รายปี
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    เลือกวันที่
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    ดาวน์โหลด
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  รายงานงานซ่อม
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  รายงานสถิติและสถานะงานซ่อมทั้งหมด
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Filter className="h-4 w-4 mr-1" />
                    กรองข้อมูล
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    ดาวน์โหลด
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  รายงานลูกค้า
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  รายงานข้อมูลลูกค้าและประวัติการใช้บริการ
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    เลือกช่วง
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    ดาวน์โหลด
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  รายงานคลังสินค้า
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  รายงานสินค้าคงคลัง การเคลื่อนไหวสินค้า
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Filter className="h-4 w-4 mr-1" />
                    กรองสินค้า
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    ดาวน์โหลด
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  รายงานการเงิน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  รายงานกำไร-ขาดทุน กระแสเงินสด
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    เลือกงวด
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    ดาวน์โหลด
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  รายงานประจำปี
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  รายงานสรุปผลการดำเนินงานประจำปี
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    เลือกปี
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    ดาวน์โหลด
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ระบบรายงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">ระบบรายงานกำลังพัฒนา</h3>
                <p className="text-muted-foreground">
                  ระบบสร้างรายงานแบบกำหนดเองจะพร้อมใช้งานเร็วๆ นี้
                </p>
              </div>
            </CardContent>
          </Card>
    </div>
  );
};

export default Reports;