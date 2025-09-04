import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { TopNavigation } from "@/components/TopNavigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      
      {/* System Banner */}
      <div className="flex justify-center py-2">
        <img 
          src="/lovable-uploads/276be7a8-bb59-4695-b475-cb6088b9fbd6.png" 
          alt="ระบบบริหารจัดการธุรกิจ ENT GROUP" 
          className="h-16 object-contain"
        />
      </div>
      
      <TopNavigation />
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}