import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { TopNavigation } from "@/components/TopNavigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* System Banner */}
      <div className="flex justify-center py-2">
        <img 
          src="/lovable-uploads/a9d8d639-27ef-41b4-8eaf-43eed6f2a03d.png" 
          alt="ระบบบริหารจัดการธุรกิจ ENT GROUP" 
          className="h-16 object-contain"
        />
      </div>
      
      <Header />
      <TopNavigation />
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}