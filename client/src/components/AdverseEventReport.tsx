import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertTriangle, Calendar as CalendarIcon, FileText, User, Pill, Activity, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ICSR 표준 보고서 인터페이스
interface AdverseEventReportData {
  // A. 일반 정보
  reportType: "spontaneous" | "study" | "other";
  reporterId: string;
  reporterType: "healthcare_professional" | "consumer" | "company" | "regulatory";
  reporterName: string;
  reporterQualification: string;
  reporterOrganization: string;
  reporterContact: string;
  
  // B. 환자 정보
  patientAge: number;
  patientGender: "Male" | "Female" | "Unknown";
  patientWeight?: number;
  patientHeight?: number;
  patientMedicalHistory?: string;
  
  // C. 의심 약물 정보
  drugName: string;
  drugDosage: string;
  drugRoute: string;
  drugIndication: string;
  drugStartDate: Date;
  drugEndDate?: Date;
  drugBatchNumber?: string;
  drugManufacturer?: string;
  
  // D. 부작용 정보
  adverseReaction: string;
  reactionDescription: string;
  reactionStartDate: Date;
  reactionEndDate?: Date;
  severity: "Low" | "Medium" | "High" | "Critical";
  seriousness: "serious" | "non_serious";
  outcome: "recovered" | "recovering" | "not_recovered" | "recovered_with_sequelae" | "fatal" | "unknown";
  
  // E. 병용 약물
  concomitantMeds?: Array<{
    name: string;
    dosage: string;
    indication: string;
    startDate: Date;
    endDate?: Date;
  }>;
  
  // F. 평가
  rechallenge?: "positive" | "negative" | "not_applicable";
  dechallenge?: "positive" | "negative" | "not_applicable";
  causality?: "certain" | "probable" | "possible" | "unlikely" | "conditional" | "unassessable";
  
  // G. 추가 정보
  additionalInfo?: string;
  literatureReferences?: string;
}

export function AdverseEventReport() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AdverseEventReportData>>({
    reportType: "spontaneous",
    reporterType: "healthcare_professional",
    patientGender: "Unknown",
    severity: "Medium",
    seriousness: "non_serious",
    outcome: "unknown"
  });
  
  const queryClient = useQueryClient();
  
  const submitReport = useMutation({
    mutationFn: async (data: Partial<AdverseEventReportData>) => {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("보고서 제출 실패");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "dashboard"] });
    }
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    submitReport.mutate(formData);
  };

  const steps = [
    { number: 1, title: "보고자 정보", icon: User },
    { number: 2, title: "환자 정보", icon: User },
    { number: 3, title: "의심 약물", icon: Pill },
    { number: 4, title: "부작용 정보", icon: Activity },
    { number: 5, title: "병용 약물", icon: Pill },
    { number: 6, title: "평가 및 인과관계", icon: FileText },
    { number: 7, title: "검토 및 제출", icon: CheckCircle }
  ];

  return (
    <div className="space-y-6" data-testid="adverse-event-report">
      {/* 진행 단계 표시 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            약물 부작용 보고서 (ICSR)
          </CardTitle>
          <CardDescription>
            ICH E2B(R3) 표준에 따른 개별 안전성 사례 보고서
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-green-500 bg-green-500 text-white",
                    !isActive && !isCompleted && "border-muted-foreground text-muted-foreground"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-12 ml-2",
                      isCompleted ? "bg-green-500" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-sm text-muted-foreground mb-4">
            단계 {currentStep} / {steps.length}: {steps[currentStep - 1].title}
          </div>
        </CardContent>
      </Card>

      {/* 단계별 폼 */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">A. 보고자 정보</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportType">보고 유형 *</Label>
                  <Select value={formData.reportType} onValueChange={(value) => updateFormData("reportType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="보고 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spontaneous">자발적 보고</SelectItem>
                      <SelectItem value="study">임상시험</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="reporterType">보고자 유형 *</Label>
                  <Select value={formData.reporterType} onValueChange={(value) => updateFormData("reporterType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="보고자 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare_professional">의료진</SelectItem>
                      <SelectItem value="consumer">소비자</SelectItem>
                      <SelectItem value="company">제약회사</SelectItem>
                      <SelectItem value="regulatory">규제기관</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterName">보고자 성명 *</Label>
                  <Input
                    id="reporterName"
                    value={formData.reporterName || ""}
                    onChange={(e) => updateFormData("reporterName", e.target.value)}
                    placeholder="보고자 성명"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reporterQualification">자격/직책</Label>
                  <Input
                    id="reporterQualification"
                    value={formData.reporterQualification || ""}
                    onChange={(e) => updateFormData("reporterQualification", e.target.value)}
                    placeholder="의사, 약사, 간호사 등"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterOrganization">소속 기관 *</Label>
                  <Input
                    id="reporterOrganization"
                    value={formData.reporterOrganization || ""}
                    onChange={(e) => updateFormData("reporterOrganization", e.target.value)}
                    placeholder="병원명, 의원명 등"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reporterContact">연락처</Label>
                  <Input
                    id="reporterContact"
                    value={formData.reporterContact || ""}
                    onChange={(e) => updateFormData("reporterContact", e.target.value)}
                    placeholder="전화번호 또는 이메일"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">B. 환자 정보</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="patientAge">환자 나이 *</Label>
                  <Input
                    id="patientAge"
                    type="number"
                    value={formData.patientAge || ""}
                    onChange={(e) => updateFormData("patientAge", parseInt(e.target.value))}
                    placeholder="나이"
                  />
                </div>
                
                <div>
                  <Label>성별 *</Label>
                  <RadioGroup 
                    value={formData.patientGender} 
                    onValueChange={(value) => updateFormData("patientGender", value)}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male">남성</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female">여성</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Unknown" id="unknown" />
                      <Label htmlFor="unknown">미상</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientWeight">체중 (kg)</Label>
                  <Input
                    id="patientWeight"
                    type="number"
                    value={formData.patientWeight || ""}
                    onChange={(e) => updateFormData("patientWeight", parseFloat(e.target.value))}
                    placeholder="체중"
                  />
                </div>
                
                <div>
                  <Label htmlFor="patientHeight">신장 (cm)</Label>
                  <Input
                    id="patientHeight"
                    type="number"
                    value={formData.patientHeight || ""}
                    onChange={(e) => updateFormData("patientHeight", parseFloat(e.target.value))}
                    placeholder="신장"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="patientMedicalHistory">과거 병력</Label>
                <Textarea
                  id="patientMedicalHistory"
                  value={formData.patientMedicalHistory || ""}
                  onChange={(e) => updateFormData("patientMedicalHistory", e.target.value)}
                  placeholder="관련 과거 병력, 알레르기 등"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">C. 의심 약물 정보</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drugName">약물명 *</Label>
                  <Input
                    id="drugName"
                    value={formData.drugName || ""}
                    onChange={(e) => updateFormData("drugName", e.target.value)}
                    placeholder="상품명 또는 성분명"
                  />
                </div>
                
                <div>
                  <Label htmlFor="drugDosage">용법/용량 *</Label>
                  <Input
                    id="drugDosage"
                    value={formData.drugDosage || ""}
                    onChange={(e) => updateFormData("drugDosage", e.target.value)}
                    placeholder="1일 3회, 1회 1정"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drugRoute">투여 경로</Label>
                  <Select value={formData.drugRoute} onValueChange={(value) => updateFormData("drugRoute", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="투여 경로 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oral">경구</SelectItem>
                      <SelectItem value="injection">주사</SelectItem>
                      <SelectItem value="topical">외용</SelectItem>
                      <SelectItem value="inhalation">흡입</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="drugIndication">적응증</Label>
                  <Input
                    id="drugIndication"
                    value={formData.drugIndication || ""}
                    onChange={(e) => updateFormData("drugIndication", e.target.value)}
                    placeholder="투여 목적/적응증"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drugManufacturer">제조회사</Label>
                  <Input
                    id="drugManufacturer"
                    value={formData.drugManufacturer || ""}
                    onChange={(e) => updateFormData("drugManufacturer", e.target.value)}
                    placeholder="제조회사명"
                  />
                </div>
                
                <div>
                  <Label htmlFor="drugBatchNumber">배치 번호</Label>
                  <Input
                    id="drugBatchNumber"
                    value={formData.drugBatchNumber || ""}
                    onChange={(e) => updateFormData("drugBatchNumber", e.target.value)}
                    placeholder="LOT 번호"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">D. 부작용 정보</h3>
              
              <div>
                <Label htmlFor="adverseReaction">부작용명 *</Label>
                <Input
                  id="adverseReaction"
                  value={formData.adverseReaction || ""}
                  onChange={(e) => updateFormData("adverseReaction", e.target.value)}
                  placeholder="예: 두드러기, 호흡곤란, 간기능 이상"
                />
              </div>

              <div>
                <Label htmlFor="reactionDescription">부작용 상세 설명 *</Label>
                <Textarea
                  id="reactionDescription"
                  value={formData.reactionDescription || ""}
                  onChange={(e) => updateFormData("reactionDescription", e.target.value)}
                  placeholder="부작용 증상, 발현 경과, 검사 결과 등을 상세히 기술"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>중증도 *</Label>
                  <RadioGroup 
                    value={formData.severity} 
                    onValueChange={(value) => updateFormData("severity", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Low" id="low" />
                      <Label htmlFor="low">경미</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Medium" id="medium" />
                      <Label htmlFor="medium">중등도</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="High" id="high" />
                      <Label htmlFor="high">심각</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Critical" id="critical" />
                      <Label htmlFor="critical">중대</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>중대성</Label>
                  <RadioGroup 
                    value={formData.seriousness} 
                    onValueChange={(value) => updateFormData("seriousness", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="serious" id="serious" />
                      <Label htmlFor="serious">중대한 부작용</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non_serious" id="non_serious" />
                      <Label htmlFor="non_serious">비중대한 부작용</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div>
                <Label>결과 *</Label>
                <Select value={formData.outcome} onValueChange={(value) => updateFormData("outcome", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="결과 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recovered">회복</SelectItem>
                    <SelectItem value="recovering">회복 중</SelectItem>
                    <SelectItem value="not_recovered">회복되지 않음</SelectItem>
                    <SelectItem value="recovered_with_sequelae">후유증과 함께 회복</SelectItem>
                    <SelectItem value="fatal">사망</SelectItem>
                    <SelectItem value="unknown">알 수 없음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1}
            >
              이전
            </Button>
            
            {currentStep < 7 ? (
              <Button onClick={nextStep}>
                다음
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={submitReport.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitReport.isPending ? "제출 중..." : "보고서 제출"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 제출 상태 */}
      {submitReport.isSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">보고서가 성공적으로 제출되었습니다.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {submitReport.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">제출 중 오류가 발생했습니다: {submitReport.error?.message}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}