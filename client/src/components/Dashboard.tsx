import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Brain, 
  FileText, 
  TrendingUp, 
  Users, 
  Activity,
  Clock,
  CheckCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  criticalCases: number;
  aiAccuracy: number;
  systemHealth: number;
}

interface RecentCase {
  id: string;
  drug: string;
  severity: string;
  status: string;
  aiConfidence: number | null;
}

interface DashboardProps {
  userRole?: string;
}

export function Dashboard({ userRole = "ADMIN" }: DashboardProps) {
  const [, setLocation] = useLocation();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api", "dashboard", "stats"],
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch recent cases
  const { data: recentCases, isLoading: casesLoading } = useQuery<RecentCase[]>({
    queryKey: ["/api", "dashboard", "recent-cases"],
    staleTime: 60000, // Cache for 1 minute
  });

  const isLoading = statsLoading || casesLoading;

  const handleViewCase = (caseId: string) => {
    setLocation(`/cases/${caseId}`);
  };

  const handleProcessPending = () => {
    setLocation('/cases');
  };

  const handleViewCriticalCases = () => {
    setLocation('/critical-cases');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="dashboard-main">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">대시보드</h1>
            <p className="text-muted-foreground">약물감시 시스템 현황</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-main">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">대시보드</h1>
          <p className="text-muted-foreground">약물감시 시스템 현황</p>
        </div>
        {userRole === "ADMIN" && (
          <Button onClick={handleProcessPending} data-testid="button-process-pending">
            <Clock className="h-4 w-4 mr-2" />
            대기 중인 사례 처리
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사례 수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-cases">{stats?.totalCases?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중인 사례</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-pending-cases">{stats?.pendingCases || 0}</div>
            <p className="text-xs text-muted-foreground">-3 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 정확도</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-ai-accuracy">{stats?.aiAccuracy || 0}%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-system-health">{stats?.systemHealth || 0}%</div>
            <p className="text-xs text-green-600">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases */}
      <Card>
        <CardHeader>
          <CardTitle>최근 사례</CardTitle>
          <CardDescription>최근 제출된 부작용 사례</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCases && recentCases.length > 0 ? recentCases.map((case_: RecentCase) => (
              <div key={case_.id} className="flex items-center justify-between p-4 border rounded-lg hover-elevate" data-testid={`case-item-${case_.id}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{case_.id}</span>
                    <Badge variant={case_.severity === 'High' ? 'destructive' : case_.severity === 'Medium' ? 'default' : 'secondary'}>
                      {case_.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{case_.drug}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{case_.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {case_.aiConfidence ? `AI 신뢰도: ${case_.aiConfidence}%` : 'AI 분석 대기중'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleViewCase(case_.id)} data-testid={`button-view-${case_.id}`}>
                    상세보기
                  </Button>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">최근 사례가 없습니다.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {stats && stats.criticalCases > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              긴급 알림
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400" data-testid="text-critical-alerts">
              {stats.criticalCases}개의 긴급 처리가 필요한 사례가 있습니다.
            </p>
            <Button variant="destructive" size="sm" className="mt-2" onClick={handleViewCriticalCases} data-testid="button-view-critical">
              긴급 사례 확인
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}