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
      <TopNavigation />
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}