import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Save, Send, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AdverseEventForm {
  // Patient Information
  patientAge: string;
  patientGender: string;
  patientWeight?: string;
  medicalHistory?: string;

  // Drug Information
  drugName: string;
  drugDosage?: string;
  routeOfAdministration?: string;
  treatmentStartDate?: string;
  treatmentEndDate?: string;
  concomitantMeds?: string;

  // Adverse Event Information
  adverseReaction: string;
  reactionDescription?: string;
  dateOfReaction?: string;
  severity: string;
  outcome?: string;
  
  // Reporter Information
  reporterName?: string;
  reporterRole?: string;
  reporterContact?: string;
}

export function DataEntryClient() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<AdverseEventForm>({
    patientAge: "",
    patientGender: "",
    drugName: "",
    adverseReaction: "",
    severity: "Medium"
  });

  const [isDraft, setIsDraft] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: any) => {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit case');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "보고서 제출 완료",
        description: "부작용 사례가 성공적으로 제출되었습니다.",
        variant: "default",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api", "cases"] });
    },
    onError: (error) => {
      toast({
        title: "제출 실패",
        description: "보고서 제출 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientAge || isNaN(Number(formData.patientAge)) || Number(formData.patientAge) <= 0) {
      errors.patientAge = "유효한 나이를 입력해주세요";
    }

    if (!formData.patientGender) {
      errors.patientGender = "환자 성별을 선택해주세요";
    }

    if (!formData.drugName.trim()) {
      errors.drugName = "약물명을 입력해주세요";
    }

    if (!formData.adverseReaction.trim()) {
      errors.adverseReaction = "부작용 반응을 입력해주세요";
    }

    if (!formData.severity) {
      errors.severity = "중증도를 선택해주세요";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!asDraft && !validateForm()) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      patientAge: Number(formData.patientAge),
      patientGender: formData.patientGender,
      drugName: formData.drugName,
      drugDosage: formData.drugDosage || null,
      adverseReaction: formData.adverseReaction,
      reactionDescription: formData.reactionDescription || null,
      severity: formData.severity,
      status: asDraft ? "초안" : "검토 필요",
      dateReported: new Date(),
      dateOfReaction: formData.dateOfReaction ? new Date(formData.dateOfReaction) : null,
      concomitantMeds: formData.concomitantMeds || null,
      medicalHistory: formData.medicalHistory || null,
      outcome: formData.outcome || null,
    };

    setIsDraft(asDraft);
    createCaseMutation.mutate(submitData);
  };

  const resetForm = () => {
    setFormData({
      patientAge: "",
      patientGender: "",
      drugName: "",
      adverseReaction: "",
      severity: "Medium"
    });
    setValidationErrors({});
  };

  const updateField = (field: keyof AdverseEventForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          약물 부작용 보고서 입력 시스템
        </h1>
        <p className="text-muted-foreground">
          Individual Case Safety Report (ICSR) 데이터 입력 클라이언트
        </p>
      </div>

      {/* Patient Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            환자 정보
          </CardTitle>
          <CardDescription>
            부작용을 경험한 환자의 기본 정보를 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientAge">환자 나이 *</Label>
              <Input
                id="patientAge"
                type="number"
                placeholder="나이 (숫자만 입력)"
                value={formData.patientAge}
                onChange={(e) => updateField("patientAge", e.target.value)}
                className={validationErrors.patientAge ? "border-destructive" : ""}
              />
              {validationErrors.patientAge && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.patientAge}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientGender">성별 *</Label>
              <Select value={formData.patientGender} onValueChange={(value) => updateField("patientGender", value)}>
                <SelectTrigger className={validationErrors.patientGender ? "border-destructive" : ""}>
                  <SelectValue placeholder="성별 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="남성">남성</SelectItem>
                  <SelectItem value="여성">여성</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.patientGender && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.patientGender}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientWeight">체중 (kg)</Label>
              <Input
                id="patientWeight"
                type="number"
                placeholder="체중 (선택사항)"
                value={formData.patientWeight || ""}
                onChange={(e) => updateField("patientWeight", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">기존 병력</Label>
            <Textarea
              id="medicalHistory"
              placeholder="환자의 기존 병력이나 의학적 상태를 기입해주세요 (선택사항)"
              value={formData.medicalHistory || ""}
              onChange={(e) => updateField("medicalHistory", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Drug Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>약물 정보</CardTitle>
          <CardDescription>
            부작용과 관련된 약물의 상세 정보를 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drugName">약물명 *</Label>
              <Input
                id="drugName"
                placeholder="약물명 (성분명 또는 상품명)"
                value={formData.drugName}
                onChange={(e) => updateField("drugName", e.target.value)}
                className={validationErrors.drugName ? "border-destructive" : ""}
              />
              {validationErrors.drugName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.drugName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="drugDosage">용량</Label>
              <Input
                id="drugDosage"
                placeholder="예: 500mg, 1정"
                value={formData.drugDosage || ""}
                onChange={(e) => updateField("drugDosage", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routeOfAdministration">투여 경로</Label>
              <Select value={formData.routeOfAdministration || ""} onValueChange={(value) => updateField("routeOfAdministration", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="투여 경로 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="경구">경구 (Oral)</SelectItem>
                  <SelectItem value="정맥주사">정맥주사 (IV)</SelectItem>
                  <SelectItem value="근육주사">근육주사 (IM)</SelectItem>
                  <SelectItem value="피하주사">피하주사 (SC)</SelectItem>
                  <SelectItem value="외용">외용 (Topical)</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentStartDate">치료 시작일</Label>
              <Input
                id="treatmentStartDate"
                type="date"
                value={formData.treatmentStartDate || ""}
                onChange={(e) => updateField("treatmentStartDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concomitantMeds">병용 약물</Label>
            <Textarea
              id="concomitantMeds"
              placeholder="함께 복용한 다른 약물들을 기입해주세요 (선택사항)"
              value={formData.concomitantMeds || ""}
              onChange={(e) => updateField("concomitantMeds", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Adverse Event Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>부작용 정보</CardTitle>
          <CardDescription>
            발생한 부작용에 대한 상세 정보를 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adverseReaction">부작용 반응 *</Label>
              <Input
                id="adverseReaction"
                placeholder="예: 피부발진, 구토, 두통"
                value={formData.adverseReaction}
                onChange={(e) => updateField("adverseReaction", e.target.value)}
                className={validationErrors.adverseReaction ? "border-destructive" : ""}
              />
              {validationErrors.adverseReaction && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.adverseReaction}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">중증도 *</Label>
              <Select value={formData.severity} onValueChange={(value) => updateField("severity", value)}>
                <SelectTrigger className={validationErrors.severity ? "border-destructive" : ""}>
                  <SelectValue placeholder="중증도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">경증 (Low)</SelectItem>
                  <SelectItem value="Medium">중등도 (Medium)</SelectItem>
                  <SelectItem value="High">중증 (High)</SelectItem>
                  <SelectItem value="Critical">위급 (Critical)</SelectItem>
                </SelectContent>
              </Select>
              {formData.severity && (
                <Badge variant={getSeverityColor(formData.severity) as any} className="mt-1">
                  {formData.severity}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfReaction">부작용 발생일</Label>
              <Input
                id="dateOfReaction"
                type="date"
                value={formData.dateOfReaction || ""}
                onChange={(e) => updateField("dateOfReaction", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">결과</Label>
              <Select value={formData.outcome || ""} onValueChange={(value) => updateField("outcome", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="결과 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="회복">완전 회복</SelectItem>
                  <SelectItem value="호전">호전</SelectItem>
                  <SelectItem value="후유증">후유증 있음</SelectItem>
                  <SelectItem value="치료중">치료 중</SelectItem>
                  <SelectItem value="사망">사망</SelectItem>
                  <SelectItem value="알 수 없음">알 수 없음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reactionDescription">부작용 상세 설명</Label>
            <Textarea
              id="reactionDescription"
              placeholder="부작용의 구체적인 증상, 경과, 치료내용 등을 자세히 기입해주세요"
              value={formData.reactionDescription || ""}
              onChange={(e) => updateField("reactionDescription", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reporter Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>보고자 정보</CardTitle>
          <CardDescription>
            보고서를 작성하는 담당자 정보 (선택사항)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reporterName">보고자명</Label>
              <Input
                id="reporterName"
                placeholder="보고자 이름"
                value={formData.reporterName || ""}
                onChange={(e) => updateField("reporterName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporterRole">직책/역할</Label>
              <Select value={formData.reporterRole || ""} onValueChange={(value) => updateField("reporterRole", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="직책 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="의사">의사</SelectItem>
                  <SelectItem value="약사">약사</SelectItem>
                  <SelectItem value="간호사">간호사</SelectItem>
                  <SelectItem value="환자">환자</SelectItem>
                  <SelectItem value="보호자">보호자</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reporterContact">연락처</Label>
              <Input
                id="reporterContact"
                placeholder="이메일 또는 전화번호"
                value={formData.reporterContact || ""}
                onChange={(e) => updateField("reporterContact", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button 
          variant="outline" 
          onClick={resetForm}
          className="w-full sm:w-auto"
        >
          초기화
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={() => handleSubmit(true)}
          disabled={createCaseMutation.isPending}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          임시저장
        </Button>
        
        <Button 
          onClick={() => handleSubmit(false)}
          disabled={createCaseMutation.isPending}
          className="w-full sm:w-auto"
        >
          {createCaseMutation.isPending ? (
            "제출 중..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              보고서 제출
            </>
          )}
        </Button>
      </div>

      {/* Status Information */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 inline mr-1" />
            제출된 보고서는 전문가 검토 후 약물감시 시스템에 등록됩니다
          </div>
        </CardContent>
      </Card>
    </div>
  );
}