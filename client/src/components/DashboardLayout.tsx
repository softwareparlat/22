import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";
import { Code } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SoftwarePar</span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <h1 className="text-lg font-semibold text-foreground" data-testid="dashboard-title">
              {title}
            </h1>
          </div>

          <UserMenu />
        </div>
      </div>

      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
export { DashboardLayout };