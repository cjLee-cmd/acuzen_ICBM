import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { CaseManagement } from "@/components/CaseManagement";
import { CaseDetails } from "@/components/CaseDetails";
import { CriticalCases } from "@/components/CriticalCases";
import { UserManagement } from "@/components/UserManagement";
import { AIModelManagement } from "@/components/AIModelManagement";
import { AuditLogs } from "@/components/AuditLogs";
import { SystemMonitoring } from "@/components/SystemMonitoring";
import { Settings } from "@/components/Settings";
import { AdverseEventReport } from "@/components/AdverseEventReport";
import NotFound from "@/pages/not-found";

function Router({ userRole }: { userRole: string }) {
  return (
    <Switch>
      <Route path="/" component={() => <Dashboard userRole={userRole} />} />
      <Route path="/cases" component={CaseManagement} />
      <Route path="/cases/:id" component={CaseDetails} />
      <Route path="/report" component={AdverseEventReport} />
      <Route path="/critical-cases" component={CriticalCases} />
      <Route path="/users" component={UserManagement} />
      <Route path="/ai-models" component={AIModelManagement} />
      <Route path="/audit-logs" component={AuditLogs} />
      <Route path="/monitoring" component={SystemMonitoring} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  // In development, authentication is bypassed via requireAuth middleware
  // No login state management needed

  // Custom sidebar width for drug surveillance application
  const style = {
    "--sidebar-width": "20rem",       // 320px for better content
    "--sidebar-width-icon": "4rem",   // default icon width
  };


  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar userRole="ADMIN" />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b bg-background">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <div className="text-sm text-muted-foreground">
                      약물감시 시스템 관리자
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </header>
                <main className="flex-1 overflow-auto p-6">
                  <Router userRole="ADMIN" />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
