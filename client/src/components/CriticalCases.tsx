import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, User, Pill, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface CriticalCase {
  id: string;
  patientAge: number;
  patientGender: string;
  drugName: string;
  suspectedReaction: string;
  severity: string;
  outcome: string;
  reporterType: string;
  aiPrediction?: {
    severity: string;
    confidence: number;
  };
  createdAt: string;
  daysSinceReport: number;
}

export function CriticalCases() {
  const { data: criticalCases, isLoading, error } = useQuery<CriticalCase[]>({
    queryKey: ["/api", "cases", "critical"],
    staleTime: 30000, // 30초 캐시
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="critical-cases-loading">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">긴급 사례</h1>
          <p className="text-muted-foreground">즉시 처리가 필요한 중요 사례</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" data-testid="critical-cases-error">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">긴급 사례</h1>
          <p className="text-muted-foreground">즉시 처리가 필요한 중요 사례</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">데이터를 불러올 수 없습니다</h2>
              <p className="text-muted-foreground">네트워크 연결을 확인하고 다시 시도해주세요.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
      case 'moderate':
        return 'default';
      case 'low':
      case 'mild':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityLevel = (daysSinceReport: number, severity: string) => {
    if (severity.toLowerCase() === 'critical' || severity.toLowerCase() === 'high') {
      if (daysSinceReport >= 7) return 'urgent';
      if (daysSinceReport >= 3) return 'high';
      return 'medium';
    }
    return 'low';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">매우 긴급</Badge>;
      case 'high':
        return <Badge variant="destructive">긴급</Badge>;
      case 'medium':
        return <Badge variant="default">중요</Badge>;
      default:
        return <Badge variant="secondary">일반</Badge>;
    }
  };

  return (
    <div className="space-y-6" data-testid="critical-cases-main">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">긴급 사례</h1>
          <p className="text-muted-foreground">즉시 처리가 필요한 중요 사례</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          총 {criticalCases?.length || 0}건의 긴급 사례
        </div>
      </div>

      {/* Summary Alert */}
      {criticalCases && criticalCases.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-red-700 dark:text-red-300 font-medium">
                  {criticalCases.length}건의 긴급 처리가 필요한 사례가 있습니다.
                </p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  이 사례들은 즉시 검토하고 조치가 필요합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Cases List */}
      <div className="space-y-4">
        {criticalCases && criticalCases.length > 0 ? (
          criticalCases.map((criticalCase) => {
            const priority = getPriorityLevel(criticalCase.daysSinceReport, criticalCase.severity);
            return (
              <Card key={criticalCase.id} className="hover-elevate" data-testid={`critical-case-${criticalCase.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">사례 ID: {criticalCase.id}</CardTitle>
                      {getPriorityBadge(priority)}
                      <Badge variant={getSeverityColor(criticalCase.severity)}>
                        {criticalCase.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {criticalCase.daysSinceReport}일 전 보고
                    </div>
                  </div>
                  <CardDescription>
                    긴급 처리가 필요한 부작용 사례
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* 환자 정보 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4" />
                        환자 정보
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p data-testid={`patient-info-${criticalCase.id}`}>
                          {criticalCase.patientAge}세, {criticalCase.patientGender}
                        </p>
                        <p>보고자: {criticalCase.reporterType}</p>
                      </div>
                    </div>

                    {/* 약물 정보 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Pill className="h-4 w-4" />
                        약물 정보
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium" data-testid={`drug-name-${criticalCase.id}`}>
                          {criticalCase.drugName}
                        </p>
                        <p data-testid={`reaction-${criticalCase.id}`}>
                          부작용: {criticalCase.suspectedReaction}
                        </p>
                      </div>
                    </div>

                    {/* AI 분석 & 결과 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        분석 결과
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p data-testid={`outcome-${criticalCase.id}`}>결과: {criticalCase.outcome}</p>
                        {criticalCase.aiPrediction && (
                          <p data-testid={`ai-analysis-${criticalCase.id}`}>
                            AI 분석: {criticalCase.aiPrediction.severity} ({criticalCase.aiPrediction.confidence}% 신뢰도)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      보고일: {new Date(criticalCase.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <Link href={`/cases/${criticalCase.id}`}>
                      <Button size="sm" data-testid={`button-view-critical-${criticalCase.id}`}>
                        상세보기
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">긴급 사례가 없습니다</h2>
                <p className="text-muted-foreground">현재 긴급 처리가 필요한 사례가 없습니다.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}