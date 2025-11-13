import { useState } from "react";
import {
  Users,
  UserPlus,
  ArrowLeft,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";

interface AppUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  lastActive: string;
  isFirstLogin: boolean;
}

interface HistoryItem {
  id: string;
  type: "validate" | "translate";
  fileName: string;
  date: string;
  time: string;
  status: "completed" | "failed";
  errorCount?: number;
  warningCount?: number;
  country?: string;
  userId: string;
}

interface AdminPageProps {
  onBack: () => void;
  adminUser: {
    email: string;
    name: string;
  };
  onLogout: () => void;
  users: AppUser[];
  allHistory: HistoryItem[];
  onCreateUser: (name: string, username: string, email: string) => void;
  onDeleteUser: (userId: string) => void;
  onViewUserDetail: (userId: string) => void;
  onDeleteHistory: (ids: string[]) => void;
}

const ITEMS_PER_PAGE = 5;

export function AdminPage({
  onBack,
  adminUser,
  onLogout,
  users,
  allHistory,
  onCreateUser,
  onDeleteUser,
  onViewUserDetail,
  onDeleteHistory,
}: AdminPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // 새 사용자 생성 폼
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
  });

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.username || !newUser.email) {
      return;
    }

    onCreateUser(newUser.name, newUser.username, newUser.email);
    setIsCreateModalOpen(false);
    setNewUser({ name: "", username: "", email: "" });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`정말 ${userName} 사용자를 삭제하시겠습니까?`)) {
      onDeleteUser(userId);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 각 사용자의 통계 계산
  const getUserStats = (username: string) => {
    const userHistory = allHistory.filter((h) => h.userId === username);
    return {
      total: userHistory.length,
      validations: userHistory.filter((h) => h.type === "validate").length,
      translations: userHistory.filter((h) => h.type === "translate").length,
    };
  };

  // 전체 통계
  const totalValidations = allHistory.filter(
    (h) => h.type === "validate"
  ).length;
  const totalTranslations = allHistory.filter(
    (h) => h.type === "translate"
  ).length;

  const handleSelectHistory = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedHistoryIds((prev) => [...prev, id]);
    } else {
      setSelectedHistoryIds((prev) => prev.filter((hId) => hId !== id));
    }
  };

  const handleSelectAllHistory = (checked: boolean) => {
    if (checked) {
      setSelectedHistoryIds(allHistory.map((h) => h.id));
    } else {
      setSelectedHistoryIds([]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleHistoryPageChange = (page: number) => {
    setHistoryPage(page);
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginatedHistory = allHistory.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const totalHistoryPages = Math.ceil(allHistory.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold mb-1">관리자 페이지</h1>
                <p className="text-sm text-gray-600">사용자 및 이력 관리</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{adminUser.name}</span>
              <Button variant="outline" onClick={onLogout}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="users">
              <Users className="mr-2" size={18} />
              사용자 관리
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="mr-2" size={18} />
              전체 이력
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">전체 사용자</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="text-blue-600" size={40} />
                </div>
              </Card>
            </div>

            {/* User Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">사용자 관리</h2>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <UserPlus className="mr-2" size={18} />
                  사용자 생성
                </Button>
              </div>

              {/* Search */}
              <div className="mb-4 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  type="text"
                  placeholder="이름, 아이디, 이메일로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* User List */}
              <div className="space-y-2">
                {paginatedUsers.map((user) => {
                  const stats = getUserStats(user.username);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => onViewUserDetail(user.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{user.name}</h3>
                          <Badge variant="outline">{user.username}</Badge>
                          {user.isFirstLogin && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200"
                            >
                              비밀번호 변경 필요
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>가입일: {user.createdAt}</span>
                          <span>•</span>
                          <span>마지막 활동: {user.lastActive}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">전체</p>
                          <p className="font-bold">{stats.total}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">검증</p>
                          <p className="font-bold text-blue-600">
                            {stats.validations}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">번역</p>
                          <p className="font-bold text-purple-600">
                            {stats.translations}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id, user.name);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    이전
                  </Button>
                  <span className="mx-2 text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-6">
                <p className="text-sm text-gray-600 mb-1">총 이력</p>
                <p className="text-2xl font-bold">{allHistory.length}</p>
              </Card>
              <Card className="p-6 bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-700 mb-1">검증 횟수</p>
                <p className="text-2xl font-bold text-blue-900">
                  {totalValidations}
                </p>
              </Card>
              <Card className="p-6 bg-purple-50 border-purple-200">
                <p className="text-sm text-purple-700 mb-1">번역 횟수</p>
                <p className="text-2xl font-bold text-purple-900">
                  {totalTranslations}
                </p>
              </Card>
            </div>

            {/* History List */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">전체 이력</h2>
                {selectedHistoryIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(
                          `선택한 ${selectedHistoryIds.length}개의 이력을 삭제하시겠습니까?`
                        )
                      ) {
                        onDeleteHistory(selectedHistoryIds);
                        setSelectedHistoryIds([]);
                      }
                    }}
                  >
                    <Trash2 size={16} className="mr-1" />
                    삭제 ({selectedHistoryIds.length})
                  </Button>
                )}
              </div>

              {allHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p>아직 이력이 없습니다</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <Checkbox
                      id="select-all-history"
                      checked={
                        selectedHistoryIds.length === allHistory.length &&
                        allHistory.length > 0
                      }
                      onCheckedChange={handleSelectAllHistory}
                    />
                    <label
                      htmlFor="select-all-history"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      전체 선택
                    </label>
                  </div>

                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      {paginatedHistory.map((item) => {
                        const user = users.find(
                          (u) => u.username === item.userId
                        );
                        return (
                          <Card
                            key={item.id}
                            className="p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id={`history-${item.id}`}
                                checked={selectedHistoryIds.includes(item.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectHistory(
                                    item.id,
                                    checked as boolean
                                  )
                                }
                                className="mt-1"
                              />

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    variant={
                                      item.type === "validate"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {item.type === "validate" ? "검증" : "번역"}
                                  </Badge>

                                  {item.status === "completed" ? (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-green-500 text-green-700"
                                    >
                                      <CheckCircle2
                                        size={12}
                                        className="mr-1"
                                      />
                                      완료
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-red-500 text-red-700"
                                    >
                                      <AlertCircle size={12} className="mr-1" />
                                      실패
                                    </Badge>
                                  )}

                                  {item.country && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {item.country}
                                    </Badge>
                                  )}

                                  {user && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-gray-50"
                                    >
                                      {user.name} (@{user.username})
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-sm font-medium mb-1">
                                  {item.fileName}
                                </p>

                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>
                                      {item.date} {item.time}
                                    </span>
                                  </div>

                                  {item.errorCount !== undefined &&
                                    item.warningCount !== undefined && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-red-600">
                                          오류 {item.errorCount}
                                        </span>
                                        <span className="text-yellow-600">
                                          경고 {item.warningCount}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </>
              )}

              {/* Pagination */}
              {totalHistoryPages > 1 && (
                <div className="flex items-center justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHistoryPageChange(historyPage - 1)}
                    disabled={historyPage === 1}
                  >
                    이전
                  </Button>
                  <span className="mx-2 text-sm text-gray-600">
                    {historyPage} / {totalHistoryPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHistoryPageChange(historyPage + 1)}
                    disabled={historyPage === totalHistoryPages}
                  >
                    다음
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 사용자 생성</DialogTitle>
            <DialogDescription>새 사용자를 생성합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                placeholder="홍길동"
              />
            </div>
            <div>
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                placeholder="hongkd"
              />
              <p className="text-xs text-gray-500 mt-1">
                * 비밀번호는 아이디와 동일하게 자동 설정됩니다.
              </p>
              <p className="text-xs text-gray-500">
                * 처음 로그인 시 비밀번호 변경이 필요합니다.
              </p>
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="hongkd@company.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!newUser.name || !newUser.username || !newUser.email}
            >
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
