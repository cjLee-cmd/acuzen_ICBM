import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar, User, Pill, AlertTriangle, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CaseDetails {
  id: string;
  patientAge: number;
  patientGender: string;
  drugName: string;
  drugDosage: string;
  adverseReaction: string;
  dateReported: string;
  severity: string;
  outcome: string;
  reporterId: string;
  aiPrediction?: {
    severity: string;
    confidence: number;
    recommendations: string[];
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export function CaseDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: caseData, isLoading, error } = useQuery<CaseDetails>({
    queryKey: ["/api", "cases", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="case-details-loading">
        <div className="flex items-center gap-4">
          <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="space-y-6" data-testid="case-details-error">
        <div className="flex items-center gap-4">
          <Link href="/cases">
            <Button variant="outline" size="sm" data-testid="button-back-to-cases">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">사례를 찾을 수 없습니다</h2>
              <p className="text-muted-foreground">요청하신 사례가 존재하지 않거나 접근 권한이 없습니다.</p>
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

  return (
    <div className="space-y-6" data-testid="case-details-main">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cases">
            <Button variant="outline" size="sm" data-testid="button-back-to-cases">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">사례 상세정보</h1>
            <p className="text-muted-foreground">사례 ID: {caseData.id}</p>
          </div>
        </div>
        <Badge variant={getSeverityColor(caseData.severity)} data-testid="badge-severity">
          {caseData.severity}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 환자 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              환자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">연령</label>
              <p className="text-sm" data-testid="text-patient-age">{caseData.patientAge}세</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">성별</label>
              <p className="text-sm" data-testid="text-patient-gender">{caseData.patientGender}</p>
            </div>
          </CardContent>
        </Card>

        {/* 약물 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              약물 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">약물명</label>
              <p className="text-sm font-medium" data-testid="text-drug-name">{caseData.drugName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">용량</label>
              <p className="text-sm" data-testid="text-dosage">{caseData.drugDosage}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">부작용 반응</label>
              <p className="text-sm" data-testid="text-adverse-reaction">{caseData.adverseReaction}</p>
            </div>
          </CardContent>
        </Card>

        {/* 시간 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              시간 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">보고일</label>
              <p className="text-sm" data-testid="text-date-reported">{new Date(caseData.dateReported).toLocaleDateString('ko-KR')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">보고일</label>
              <p className="text-sm" data-testid="text-created-date">{new Date(caseData.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 부작용 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            부작용 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">의심 부작용</label>
            <p className="text-sm mt-1" data-testid="text-suspected-reaction">{caseData.adverseReaction}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">중증도</label>
              <div className="mt-1">
                <Badge variant={getSeverityColor(caseData.severity)} data-testid="badge-severity-detail">
                  {caseData.severity}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">결과</label>
              <p className="text-sm" data-testid="text-outcome">{caseData.outcome}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">보고자 ID</label>
            <p className="text-sm" data-testid="text-reporter-id">{caseData.reporterId}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI 분석 결과 */}
      {caseData.aiPrediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              AI 분석 결과
            </CardTitle>
            <CardDescription>AI 모델의 분석 결과 및 권장사항</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">AI 예측 중증도</label>
                <div className="mt-1">
                  <Badge variant={getSeverityColor(caseData.aiPrediction.severity)} data-testid="badge-ai-severity">
                    {caseData.aiPrediction.severity}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">신뢰도</label>
                <p className="text-sm" data-testid="text-ai-confidence">{caseData.aiPrediction.confidence}%</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">AI 권장사항</label>
              <ul className="mt-1 space-y-1" data-testid="list-ai-recommendations">
                {caseData.aiPrediction.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-muted-foreground">• {recommendation}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}