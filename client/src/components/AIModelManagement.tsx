import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Brain, 
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Activity,
  Zap,
  AlertCircle
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  version: string;
  status: string;
  accuracy: number;
  lastUpdated: string;
  avgResponseTime: number;
  totalPredictions: number;
}

export function AIModelManagement() {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isRetrainDialogOpen, setIsRetrainDialogOpen] = useState(false);

  // Mock data - todo: remove mock functionality
  const models: AIModel[] = [
    {
      id: "model-001",
      name: "Drug Safety Classifier",
      version: "v2.1.3",
      status: "Active",
      accuracy: 92.3,
      lastUpdated: "2024-01-10",
      avgResponseTime: 245,
      totalPredictions: 15420
    },
    {
      id: "model-002",
      name: "Severity Predictor",
      version: "v1.8.2", 
      status: "Active",
      accuracy: 89.7,
      lastUpdated: "2024-01-08",
      avgResponseTime: 180,
      totalPredictions: 12890
    },
    {
      id: "model-003",
      name: "Causality Analyzer",
      version: "v3.0.1",
      status: "Training",
      accuracy: 85.2,
      lastUpdated: "2024-01-15",
      avgResponseTime: 320,
      totalPredictions: 8750
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Training": return "secondary";
      case "Error": return "destructive";
      case "Inactive": return "outline";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return Activity;
      case "Training": return RotateCcw;
      case "Error": return AlertCircle;
      case "Inactive": return Pause;
      default: return Brain;
    }
  };

  const handleViewModel = (model: AIModel) => {
    setSelectedModel(model);
    console.log('View model details:', model.id);
  };

  const handleRetrainModel = (modelId: string) => {
    setIsRetrainDialogOpen(true);
    console.log('Retrain model triggered:', modelId);
  };

  const handleDeployModel = (modelId: string) => {
    console.log('Deploy model triggered:', modelId);
  };

  const handleToggleModel = (modelId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    console.log('Toggle model status:', modelId, newStatus);
  };

  return (
    <div className="space-y-6" data-testid="ai-model-management-main">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI 모델 관리</h1>
          <p className="text-muted-foreground">인공지능 모델 상태 및 성능 관리</p>
        </div>
        <Button variant="outline" data-testid="button-refresh-models">
          <RotateCcw className="h-4 w-4 mr-2" />
          모델 상태 새로고침
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 모델</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-active-models">
              {models.filter(m => m.status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">총 {models.length}개 모델 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 정확도</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-avg-accuracy">
              {(models.reduce((acc, m) => acc + m.accuracy, 0) / models.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 예측 수</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-predictions">
              {models.reduce((acc, m) => acc + m.totalPredictions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">이번 달</p>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <div className="space-y-4">
        {models.map((model) => {
          const StatusIcon = getStatusIcon(model.status);
          return (
            <Card key={model.id} className="hover-elevate" data-testid={`model-card-${model.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        <h3 className="font-medium text-lg">{model.name}</h3>
                      </div>
                      <Badge variant={getStatusVariant(model.status)}>
                        {model.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{model.version}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">정확도</p>
                        <div className="space-y-1">
                          <p className="text-lg font-medium">{model.accuracy}%</p>
                          <Progress value={model.accuracy} className="h-2" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">응답 시간</p>
                        <p className="text-lg font-medium">{model.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">예측 수</p>
                        <p className="text-lg font-medium">{model.totalPredictions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">마지막 업데이트</p>
                        <p className="text-lg font-medium">{model.lastUpdated}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewModel(model)} data-testid={`button-view-${model.id}`}>
                      상세보기
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRetrainModel(model.id)} data-testid={`button-retrain-${model.id}`}>
                      재훈련
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleModel(model.id, model.status)}
                      data-testid={`button-toggle-${model.id}`}
                    >
                      {model.status === "Active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Model Detail Dialog */}
      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-model-details">
          <DialogHeader>
            <DialogTitle>모델 상세 정보</DialogTitle>
            <DialogDescription>{selectedModel?.name} - {selectedModel?.version}</DialogDescription>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">성능 지표</h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm">정확도:</span>
                      <span className="font-medium">{selectedModel.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">평균 응답시간:</span>
                      <span className="font-medium">{selectedModel.avgResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">총 예측 수:</span>
                      <span className="font-medium">{selectedModel.totalPredictions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">모델 정보</h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm">상태:</span>
                      <Badge variant={getStatusVariant(selectedModel.status)}>
                        {selectedModel.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">버전:</span>
                      <span className="font-medium">{selectedModel.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">마지막 업데이트:</span>
                      <span className="font-medium">{selectedModel.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Retrain Dialog */}
      <Dialog open={isRetrainDialogOpen} onOpenChange={setIsRetrainDialogOpen}>
        <DialogContent data-testid="dialog-retrain-model">
          <DialogHeader>
            <DialogTitle>모델 재훈련</DialogTitle>
            <DialogDescription>선택한 모델을 새로운 데이터로 재훈련합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                모델 재훈련은 시간이 오래 걸릴 수 있습니다. 진행 중에는 모델이 일시적으로 사용 불가능할 수 있습니다.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRetrainDialogOpen(false)} data-testid="button-cancel-retrain">
                취소
              </Button>
              <Button onClick={() => { setIsRetrainDialogOpen(false); console.log('Retrain confirmed'); }} data-testid="button-confirm-retrain">
                재훈련 시작
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}