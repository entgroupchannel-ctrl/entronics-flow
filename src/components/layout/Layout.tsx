import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}