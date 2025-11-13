import { useState, useEffect } from "react";
import {
  User,
  Mail,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Trash2,
  Lock,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import api, { UserResponse, HistoryResponse } from "../services/api";

interface MyPageProps {
  user: { name: string; email: string; username: string };
  onBack: () => void;
  onPasswordChange: (
    currentPassword: string,
    newPassword: string
  ) => boolean | Promise<boolean>; // App.tsx에서는 Promise 안 씀
  history: {
    id: string;
    type: "validate" | "translate";
    fileName: string;
    date: string;
    time: string;
    status: "completed" | "failed";
    errorCount?: number;
    warningCount?: number;
    country?: string;
  }[];
  onDeleteHistory: (ids: string[]) => void;
}

const ITEMS_PER_PAGE = 5;

export function MyPage({ user, onBack, onPasswordChange }: MyPageProps) {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 비밀번호 변경 관련 state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // 프로필 및 이력 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profileData, historyData] = await Promise.all([
        api.user.getProfile(),
        api.user.getMyHistory(),
      ]);
      setProfile(profileData);
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedHistory.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;

    if (confirm(`선택한 ${selectedIds.size}건의 이력을 삭제하시겠습니까?`)) {
      try {
        await api.user.deleteHistory(Array.from(selectedIds));
        setHistory(history.filter((item) => !selectedIds.has(item.id)));
        setSelectedIds(new Set());
      } catch (error) {
        alert("이력 삭제에 실패했습니다.");
      }
    }
  };

  const handlePasswordChangeSubmit = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    const success = await onPasswordChange(currentPassword, newPassword);
    if (success) {
      setPasswordSuccess("비밀번호가 성공적으로 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setIsPasswordModalOpen(false);
      setTimeout(() => setPasswordSuccess(""), 3000);
    } else {
      setPasswordError("현재 비밀번호가 일치하지 않습니다.");
    }
  };

  // 페이징 계산
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="mb-1">마이페이지</h1>
            <p className="text-gray-600">내 정보를 확인하고 관리하세요</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="history">이력</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={32} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="mb-1">{profile?.name}</h2>
                  <p className="text-sm text-gray-600">Label AI 사용자</p>
                </div>
              </div>

              <Separator className="mb-6" />

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <User size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">아이디</p>
                    <p className="text-sm">{profile?.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="text-sm">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">총 이용 횟수</p>
                    <p className="text-sm">{history.length}건</p>
                  </div>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Password Change Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Lock size={20} className="text-gray-400" />
                    <h3>비밀번호 변경</h3>
                  </div>
                  <Button onClick={() => setIsPasswordModalOpen(true)}>
                    비밀번호 변경
                  </Button>
                </div>

                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-800">
                    <CheckCircle2 size={16} />
                    {passwordSuccess}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>검증/번역 이력</h3>
                <div className="flex items-center gap-2">
                  {selectedIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                    >
                      <Trash2 size={16} className="mr-1" />
                      삭제 ({selectedIds.size})
                    </Button>
                  )}
                  <Badge variant="secondary">{history.length}건</Badge>
                </div>
              </div>

              <Separator className="mb-4" />

              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>아직 이력이 없습니다</p>
                  <p className="text-sm mt-2">
                    검증이나 번역을 수행하면 이곳에 기록됩니다
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedIds.size === paginatedHistory.length &&
                        paginatedHistory.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      전체 선택
                    </label>
                  </div>

                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {paginatedHistory.map((item) => (
                        <Card
                          key={item.id}
                          className="p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={selectedIds.has(item.id)}
                              onCheckedChange={(checked) =>
                                handleSelectItem(item.id, checked as boolean)
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
                                    <CheckCircle2 size={12} className="mr-1" />
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
                                  <Badge variant="outline" className="text-xs">
                                    {item.country}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm mb-1">{item.fileName}</p>

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

                            <Button variant="ghost" size="sm">
                              <Download size={16} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        이전
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        다음
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
            <DialogDescription>
              현재 비밀번호와 새 비밀번호를 입력하세요.
            </DialogDescription>
          </DialogHeader>

          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-800">
              <AlertCircle size={16} />
              {passwordError}
            </div>
          )}

          <div className="space-y-3 py-4">
            <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
              <Label htmlFor="current-password" className="text-right">
                현재 비밀번호
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호"
              />
            </div>

            <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
              <Label htmlFor="new-password" className="text-right">
                새 비밀번호
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 (최소 6자)"
              />
            </div>

            <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
              <Label htmlFor="confirm-password" className="text-right">
                새 비밀번호 확인
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 확인"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
              }}
            >
              취소
            </Button>
            <Button
              onClick={handlePasswordChangeSubmit}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
