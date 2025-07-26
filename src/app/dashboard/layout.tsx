import type { ReactNode } from "react";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 sm:ml-14">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/40">
          {children}
        </main>
      </div>
    </div>
  );
}
