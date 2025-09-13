import { 
  Activity, 
  Brain, 
  Database, 
  FileText, 
  Home, 
  Settings, 
  Shield, 
  Users,
  AlertTriangle,
  BarChart3,
  Heart
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

// Menu items based on user roles
const menuItems = [
  {
    title: "대시보드",
    url: "/",
    icon: Home,
    roles: ["USER", "REVIEWER", "ADMIN"]
  },
  {
    title: "데이터 입력",
    url: "/report",
    icon: Database,
    roles: ["USER", "REVIEWER", "ADMIN"]
  },
  {
    title: "사례 관리",
    url: "/cases",
    icon: FileText,
    roles: ["USER", "REVIEWER", "ADMIN"]
  },
  {
    title: "AI 모델 관리",
    url: "/ai-models",
    icon: Brain,
    roles: ["REVIEWER", "ADMIN"]
  },
  {
    title: "사용자 관리",
    url: "/users",
    icon: Users,
    roles: ["ADMIN"]
  },
  {
    title: "감사 로그",
    url: "/audit-logs",
    icon: Shield,
    roles: ["REVIEWER", "ADMIN"]
  },
  {
    title: "시스템 모니터링",
    url: "/monitoring",
    icon: Activity,
    roles: ["ADMIN"]
  },
  {
    title: "설정",
    url: "/settings",
    icon: Settings,
    roles: ["USER", "REVIEWER", "ADMIN"]
  },
];


interface AppSidebarProps {
  userRole?: string;
}

export function AppSidebar({ userRole = "ADMIN" }: AppSidebarProps) {
  const [location] = useLocation();

  // Filter menu items based on user role
  const filteredItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>약물감시 시스템</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.url.replace('/', '') || 'home'}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>빠른 상태</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">시스템 상태</span>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">정상</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">대기 중인 사례</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI 신뢰도</span>
                <span className="font-medium">92.3%</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}