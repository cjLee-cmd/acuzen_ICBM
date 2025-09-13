import { Settings as SettingsIcon, Bell, Shield, Database, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Settings() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="text-muted-foreground">시스템 설정을 관리합니다</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>알림 설정</CardTitle>
            </div>
            <CardDescription>시스템 알림 및 이메일 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">긴급 사례 알림</div>
                <div className="text-sm text-muted-foreground">중요도가 높은 사례에 대한 즉시 알림</div>
              </div>
              <Switch data-testid="switch-critical-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">이메일 알림</div>
                <div className="text-sm text-muted-foreground">일일 요약 및 중요 업데이트 이메일</div>
              </div>
              <Switch data-testid="switch-email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">AI 분석 완료 알림</div>
                <div className="text-sm text-muted-foreground">AI 분석이 완료될 때 알림</div>
              </div>
              <Switch data-testid="switch-ai-completion" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 보안 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>보안 설정</CardTitle>
            </div>
            <CardDescription>시스템 보안 및 접근 권한을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">세션 타임아웃</div>
                <div className="text-sm text-muted-foreground">비활성 상태 시 자동 로그아웃 시간</div>
              </div>
              <Badge variant="outline" data-testid="badge-session-timeout">30분</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">2단계 인증</div>
                <div className="text-sm text-muted-foreground">보안 강화를 위한 2단계 인증</div>
              </div>
              <Switch data-testid="switch-2fa" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">IP 제한</div>
                <div className="text-sm text-muted-foreground">허용된 IP 주소에서만 접근 가능</div>
              </div>
              <Switch data-testid="switch-ip-restriction" />
            </div>
          </CardContent>
        </Card>

        {/* 데이터 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>데이터 설정</CardTitle>
            </div>
            <CardDescription>데이터 보관 및 백업 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">자동 백업</div>
                <div className="text-sm text-muted-foreground">매일 자동으로 데이터 백업</div>
              </div>
              <Switch data-testid="switch-auto-backup" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">데이터 보관 기간</div>
                <div className="text-sm text-muted-foreground">완료된 사례의 보관 기간</div>
              </div>
              <Badge variant="outline" data-testid="badge-retention-period">7년</Badge>
            </div>
            <div className="pt-4">
              <Button variant="outline" data-testid="button-export-data">
                <Database className="h-4 w-4 mr-2" />
                데이터 내보내기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 테마 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>표시 설정</CardTitle>
            </div>
            <CardDescription>인터페이스 테마 및 표시 옵션을 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">다크 모드</div>
                <div className="text-sm text-muted-foreground">어두운 테마로 표시</div>
              </div>
              <Switch data-testid="switch-dark-mode" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">고대비 모드</div>
                <div className="text-sm text-muted-foreground">접근성을 위한 고대비 표시</div>
              </div>
              <Switch data-testid="switch-high-contrast" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">언어</div>
                <div className="text-sm text-muted-foreground">시스템 표시 언어</div>
              </div>
              <Badge variant="outline" data-testid="badge-language">한국어</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4">
          <Button data-testid="button-save-settings" className="min-w-32">
            설정 저장
          </Button>
        </div>
      </div>
    </div>
  );
}