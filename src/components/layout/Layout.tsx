import { ReactNode } from "react";
import { TopNavigation } from "@/components/TopNavigation";
import { Header } from "@/components/layout/Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col">
        <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex-1">
            <Header />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}