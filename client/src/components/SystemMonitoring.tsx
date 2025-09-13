import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: string;
  threshold: number;
}

interface ServiceStatus {
  name: string;
  status: string;
  uptime: string;
  lastCheck: string;
  responseTime?: number;
}

export function SystemMonitoring() {
  // Mock data - todo: remove mock functionality
  const systemMetrics: SystemMetric[] = [
    { name: "CPU 사용률", value: 45.2, unit: "%", status: "normal", threshold: 80 },
    { name: "메모리 사용률", value: 62.8, unit: "%", status: "normal", threshold: 85 },
    { name: "디스크 사용률", value: 78.5, unit: "%", status: "warning", threshold: 80 },
    { name: "네트워크 대역폭", value: 234.7, unit: "Mbps", status: "normal", threshold: 500 }
  ];

  const services: ServiceStatus[] = [
    {
      name: "웹 서버",
      status: "healthy",
      uptime: "15일 3시간",
      lastCheck: "2024-01-15 14:30:00",
      responseTime: 120
    },
    {
      name: "데이터베이스",
      status: "healthy", 
      uptime: "15일 3시간",
      lastCheck: "2024-01-15 14:30:00",
      responseTime: 45
    },
    {
      name: "AI 서비스",
      status: "healthy",
      uptime: "2일 8시간",
      lastCheck: "2024-01-15 14:30:00", 
      responseTime: 250
    },
    {
      name: "캐시 서버",
      status: "warning",
      uptime: "1일 2시간",
      lastCheck: "2024-01-15 14:30:00",
      responseTime: 780
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "healthy": return "default";
      case "warning": return "secondary";
      case "error": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return CheckCircle;
      case "warning": return AlertTriangle;
      case "error": return AlertTriangle;
      default: return Activity;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleRefreshMetrics = () => {
    console.log('Refresh metrics triggered');
  };

  const handleRestartService = (serviceName: string) => {
    console.log('Restart service triggered:', serviceName);
  };

  return (
    <div className="space-y-6" data-testid="system-monitoring-main">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">시스템 모니터링</h1>
          <p className="text-muted-foreground">시스템 성능 및 서비스 상태 모니터링</p>
        </div>
        <Button onClick={handleRefreshMetrics} data-testid="button-refresh-metrics">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="status-system-health">정상</div>
            <p className="text-xs text-muted-foreground">모든 서비스 운영 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-active-users">23</div>
            <p className="text-xs text-muted-foreground">현재 접속 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">응답 시간</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-response-time">145ms</div>
            <p className="text-xs text-muted-foreground">평균 응답 시간</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">가동 시간</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-uptime">99.9%</div>
            <p className="text-xs text-muted-foreground">이번 달</p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 리소스</CardTitle>
          <CardDescription>실시간 시스템 리소스 사용률</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="space-y-2" data-testid={`metric-${metric.name}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getMetricColor(metric.status)}`} />
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <Progress 
                  value={metric.value} 
                  className="h-2"
                  max={metric.threshold}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0{metric.unit}</span>
                  <span>임계값: {metric.threshold}{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>서비스 상태</CardTitle>
          <CardDescription>각 서비스의 건강 상태 및 성능 지표</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover-elevate" data-testid={`service-${service.name}`}>
                  <div className="flex items-center gap-4">
                    <StatusIcon className="h-5 w-5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{service.name}</h3>
                        <Badge variant={getStatusVariant(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>가동시간: {service.uptime}</span>
                        {service.responseTime && (
                          <span>응답시간: {service.responseTime}ms</span>
                        )}
                        <span>마지막 확인: {service.lastCheck}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRestartService(service.name)}
                    data-testid={`button-restart-${service.name}`}
                  >
                    재시작
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts Placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>CPU 사용률 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <p className="text-muted-foreground">CPU 사용률 차트 영역</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>메모리 사용률 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <p className="text-muted-foreground">메모리 사용률 차트 영역</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}