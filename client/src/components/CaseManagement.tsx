import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Brain
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface Case {
  id: string;
  caseNumber: string;
  patientAge: number;
  patientGender: string;
  drugName: string;
  adverseReaction: string;
  severity: string;
  status: string;
  reporterId: string;
  dateReported: string;
  reactionDescription?: string;
  outcome?: string;
}

export function CaseManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch cases from API
  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ["/api", "cases"],
    staleTime: 30000, // Cache for 30 seconds
  });

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.adverseReaction.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || case_.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "긴급": return AlertTriangle;
      case "검토 필요": return Clock;
      case "처리중": return Brain;
      case "완료": return CheckCircle;
      default: return FileText;
    }
  };

  const handleViewCase = (case_: Case) => {
    setLocation(`/cases/${case_.id}`);
  };

  const handleCreateCase = () => {
    setIsCreateDialogOpen(true);
    console.log('Create new case triggered');
  };

  const handleProcessCase = (caseId: string) => {
    console.log('Process case triggered:', caseId);
  };

  return (
    <div className="space-y-6" data-testid="case-management-main">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">사례 관리</h1>
          <p className="text-muted-foreground">부작용 사례 관리 및 처리</p>
        </div>
        <Button onClick={handleCreateCase} data-testid="button-create-case">
          <Plus className="h-4 w-4 mr-2" />
          새 사례 등록
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>사례 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="약물명, 반응, 사례 ID로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-cases"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48" data-testid="select-filter-status">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="긴급">긴급</SelectItem>
                <SelectItem value="검토 필요">검토 필요</SelectItem>
                <SelectItem value="처리중">처리중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">검색 조건에 맞는 사례가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredCases.map((case_) => {
          const StatusIcon = getStatusIcon(case_.status);
          return (
            <Card key={case_.id} className="hover-elevate" data-testid={`case-card-${case_.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lg">{case_.caseNumber}</span>
                      <Badge variant={getSeverityVariant(case_.severity)}>
                        {case_.severity}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm">{case_.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">환자</p>
                        <p className="font-medium">{case_.patientAge}세 {case_.patientGender}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">약물</p>
                        <p className="font-medium">{case_.drugName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">반응</p>
                        <p className="font-medium">{case_.adverseReaction}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">보고일</p>
                        <p className="font-medium">{new Date(case_.dateReported).toLocaleDateString('ko-KR')}</p>
                      </div>
                    </div>

                    {case_.outcome && (
                      <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">처리 결과</p>
                          <p className="text-xs text-muted-foreground">{case_.outcome}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewCase(case_)} data-testid={`button-view-${case_.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      상세보기
                    </Button>
                    <Button size="sm" onClick={() => handleProcessCase(case_.id)} data-testid={`button-process-${case_.id}`}>
                      처리
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
            })
          )}
        </div>
      )}

      {/* Case Detail Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-case-details">
          <DialogHeader>
            <DialogTitle>사례 상세 정보</DialogTitle>
            <DialogDescription>사례 ID: {selectedCase?.id}</DialogDescription>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>환자 정보</Label>
                  <p className="text-sm mt-1">{selectedCase.patientAge}세 {selectedCase.gender}</p>
                </div>
                <div>
                  <Label>중증도</Label>
                  <Badge className="mt-1" variant={getSeverityVariant(selectedCase.severity)}>
                    {selectedCase.severity}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>약물</Label>
                <p className="text-sm mt-1">{selectedCase.drug}</p>
              </div>
              <div>
                <Label>부작용 반응</Label>
                <p className="text-sm mt-1">{selectedCase.reaction}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Case Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-create-case">
          <DialogHeader>
            <DialogTitle>새 사례 등록</DialogTitle>
            <DialogDescription>새로운 부작용 사례를 등록합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient-age">환자 나이</Label>
                <Input id="patient-age" placeholder="나이" data-testid="input-patient-age" />
              </div>
              <div>
                <Label htmlFor="patient-gender">성별</Label>
                <Select>
                  <SelectTrigger data-testid="select-patient-gender">
                    <SelectValue placeholder="성별 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">남성</SelectItem>
                    <SelectItem value="Female">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="drug-name">약물명</Label>
              <Input id="drug-name" placeholder="약물명 및 용량" data-testid="input-drug-name" />
            </div>
            <div>
              <Label htmlFor="reaction">부작용 반응</Label>
              <Textarea id="reaction" placeholder="부작용 상세 설명" data-testid="textarea-reaction" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel-create">
                취소
              </Button>
              <Button onClick={() => { setIsCreateDialogOpen(false); console.log('Create case submitted'); }} data-testid="button-submit-create">
                등록
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}