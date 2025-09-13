import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Download,
  Filter,
  Shield,
  AlertTriangle,
  Info,
  Eye,
  User
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: string;
}

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterTimeRange, setFilterTimeRange] = useState("24h");

  // Mock data - todo: remove mock functionality
  const auditLogs: AuditLog[] = [
    {
      id: "audit-001",
      timestamp: "2024-01-15 14:30:22",
      action: "USER_LOGIN",
      userId: "user-001",
      userName: "관리자",
      resource: "/auth/login",
      details: "Successful login",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      severity: "INFO"
    },
    {
      id: "audit-002", 
      timestamp: "2024-01-15 14:25:15",
      action: "CASE_CREATED",
      userId: "user-002",
      userName: "김검토",
      resource: "/api/cases",
      details: "Created new adverse event case CSE-2024-001",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0...",
      severity: "INFO"
    },
    {
      id: "audit-003",
      timestamp: "2024-01-15 14:20:08",
      action: "FAILED_LOGIN",
      userId: "unknown",
      userName: "Unknown",
      resource: "/auth/login",
      details: "Failed login attempt - invalid credentials",
      ipAddress: "203.0.113.1",
      userAgent: "curl/7.68.0",
      severity: "WARNING"
    },
    {
      id: "audit-004",
      timestamp: "2024-01-15 14:15:33",
      action: "USER_DELETED",
      userId: "user-001",
      userName: "관리자",
      resource: "/api/users/user-005",
      details: "Deleted user account: inactive-user@example.com",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      severity: "HIGH"
    },
    {
      id: "audit-005",
      timestamp: "2024-01-15 14:10:45",
      action: "AI_PREDICTION",
      userId: "system",
      userName: "AI System",
      resource: "/api/ai/predict",
      details: "Generated prediction for case CSE-2024-001 with 92% confidence",
      ipAddress: "127.0.0.1",
      userAgent: "AI-Service/2.1.0",
      severity: "INFO"
    }
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "HIGH": return "destructive";
      case "WARNING": return "default";
      case "INFO": return "secondary";
      default: return "secondary";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "HIGH": return AlertTriangle;
      case "WARNING": return AlertTriangle;
      case "INFO": return Info;
      default: return Info;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN")) return User;
    if (action.includes("DELETE")) return AlertTriangle;
    if (action.includes("CREATE") || action.includes("UPDATE")) return Eye;
    return Shield;
  };

  const handleExportLogs = () => {
    console.log('Export logs triggered');
  };

  const handleViewDetails = (logId: string) => {
    console.log('View log details:', logId);
  };

  return (
    <div className="space-y-6" data-testid="audit-logs-main">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">감사 로그</h1>
          <p className="text-muted-foreground">시스템 활동 및 사용자 작업 추적</p>
        </div>
        <Button onClick={handleExportLogs} data-testid="button-export-logs">
          <Download className="h-4 w-4 mr-2" />
          로그 내보내기
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>로그 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="작업, 사용자명, 세부사항으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-logs"
                />
              </div>
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40" data-testid="select-filter-severity">
                <SelectValue placeholder="심각도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 심각도</SelectItem>
                <SelectItem value="HIGH">높음</SelectItem>
                <SelectItem value="WARNING">경고</SelectItem>
                <SelectItem value="INFO">정보</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
              <SelectTrigger className="w-40" data-testid="select-filter-time">
                <SelectValue placeholder="기간" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1시간</SelectItem>
                <SelectItem value="24h">24시간</SelectItem>
                <SelectItem value="7d">7일</SelectItem>
                <SelectItem value="30d">30일</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 로그</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-logs">{filteredLogs.length}</div>
            <p className="text-xs text-muted-foreground">최근 24시간</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">높은 심각도</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-high-severity">
              {filteredLogs.filter(log => log.severity === "HIGH").length}
            </div>
            <p className="text-xs text-muted-foreground">즉시 확인 필요</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">로그인 시도</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-login-attempts">
              {filteredLogs.filter(log => log.action.includes("LOGIN")).length}
            </div>
            <p className="text-xs text-muted-foreground">성공 및 실패</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">고유 사용자</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-unique-users">
              {new Set(filteredLogs.map(log => log.userId)).size}
            </div>
            <p className="text-xs text-muted-foreground">활동한 사용자</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
          <CardDescription>시간순으로 정렬된 시스템 활동 로그</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const SeverityIcon = getSeverityIcon(log.severity);
              const ActionIcon = getActionIcon(log.action);
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover-elevate" data-testid={`log-item-${log.id}`}>
                  <div className="flex items-center gap-2">
                    <ActionIcon className="h-4 w-4 text-muted-foreground" />
                    <SeverityIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.action}</span>
                      <Badge variant={getSeverityVariant(log.severity)}>
                        {log.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>사용자: {log.userName}</span>
                      <span>IP: {log.ipAddress}</span>
                      <span>리소스: {log.resource}</span>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(log.id)} data-testid={`button-view-${log.id}`}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}