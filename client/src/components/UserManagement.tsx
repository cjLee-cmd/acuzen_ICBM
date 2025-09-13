import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Plus, 
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Users
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data - todo: remove mock functionality
  const users: User[] = [
    {
      id: "user-001",
      email: "admin@pharma.com",
      name: "관리자",
      role: "ADMIN",
      organization: "시스템 관리부",
      isActive: true,
      lastLogin: "2024-01-15 10:30",
      createdAt: "2023-01-01"
    },
    {
      id: "user-002", 
      email: "reviewer@pharma.com",
      name: "김검토",
      role: "REVIEWER",
      organization: "약물안전부",
      isActive: true,
      lastLogin: "2024-01-15 09:15",
      createdAt: "2023-06-15"
    },
    {
      id: "user-003",
      email: "user@pharma.com", 
      name: "이사용",
      role: "USER",
      organization: "임상연구부",
      isActive: false,
      lastLogin: "2024-01-10 14:22",
      createdAt: "2023-08-20"
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "ADMIN": return "destructive";
      case "REVIEWER": return "default";
      case "USER": return "secondary";
      default: return "secondary";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return Shield;
      case "REVIEWER": return UserCheck;
      case "USER": return Users;
      default: return Users;
    }
  };

  const handleCreateUser = () => {
    setIsCreateDialogOpen(true);
    console.log('Create new user triggered');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    console.log('Edit user triggered:', user.id);
  };

  const handleToggleUser = (userId: string, isActive: boolean) => {
    console.log('Toggle user status:', userId, !isActive);
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user triggered:', userId);
  };

  return (
    <div className="space-y-6" data-testid="user-management-main">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">사용자 관리</h1>
          <p className="text-muted-foreground">시스템 사용자 계정 관리</p>
        </div>
        <Button onClick={handleCreateUser} data-testid="button-create-user">
          <Plus className="h-4 w-4 mr-2" />
          새 사용자 추가
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 이메일, 조직으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-users"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48" data-testid="select-filter-role">
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 역할</SelectItem>
                <SelectItem value="ADMIN">관리자</SelectItem>
                <SelectItem value="REVIEWER">검토자</SelectItem>
                <SelectItem value="USER">사용자</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const RoleIcon = getRoleIcon(user.role);
          return (
            <Card key={user.id} className="hover-elevate" data-testid={`user-card-${user.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.name}</h3>
                        <Badge variant={getRoleVariant(user.role)}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                        {user.isActive ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            활성
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            비활성
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.organization}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">마지막 로그인</p>
                      <p className="font-medium">{user.lastLogin}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditUser(user)} data-testid={`button-edit-${user.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleToggleUser(user.id, user.isActive)}
                        data-testid={`button-toggle-${user.id}`}
                      >
                        {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        data-testid={`button-delete-${user.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-create-user">
          <DialogHeader>
            <DialogTitle>새 사용자 추가</DialogTitle>
            <DialogDescription>새로운 시스템 사용자를 추가합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">이름</Label>
              <Input id="user-name" placeholder="사용자 이름" data-testid="input-user-name" />
            </div>
            <div>
              <Label htmlFor="user-email">이메일</Label>
              <Input id="user-email" type="email" placeholder="email@example.com" data-testid="input-user-email" />
            </div>
            <div>
              <Label htmlFor="user-organization">조직</Label>
              <Input id="user-organization" placeholder="소속 조직" data-testid="input-user-organization" />
            </div>
            <div>
              <Label htmlFor="user-role">역할</Label>
              <Select>
                <SelectTrigger data-testid="select-user-role">
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">사용자</SelectItem>
                  <SelectItem value="REVIEWER">검토자</SelectItem>
                  <SelectItem value="ADMIN">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel-create-user">
                취소
              </Button>
              <Button onClick={() => { setIsCreateDialogOpen(false); console.log('Create user submitted'); }} data-testid="button-submit-create-user">
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}