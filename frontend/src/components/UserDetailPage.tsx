import { useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";

interface AppUser {
  id: string;
  name: string;
  username: string;
  email: string;
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

interface UserDetailPageProps {
  user: AppUser;
  history: HistoryItem[];
  onBack: () => void;
  onDeleteHistory: (ids: string[]) => void;
}

export function UserDetailPage({
  user,
  history,
  onBack,
  onDeleteHistory,
}: UserDetailPageProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;

    if (confirm(`선택한 ${selectedItems.size}개의 이력을 삭제하시겠습니까?`)) {
      onDeleteHistory(Array.from(selectedItems));
      setSelectedItems(new Set());
    }
  };

  const totalValidations = history.filter((h) => h.type === "validate").length;
  const totalTranslations = history.filter(
    (h) => h.type === "translate"
  ).length;

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
                <h1 className="text-2xl font-bold mb-1">
                  {user.name} 상세 정보
                </h1>
                <p className="text-sm text-gray-600">@{user.username}</p>
              </div>
            </div>
            {selectedItems.size > 0 && (
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 className="mr-2" size={16} />
                선택 삭제 ({selectedItems.size})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        {/* User Info Card */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">이름</p>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">아이디</p>
              <p className="font-semibold">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">이메일</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">가입일</p>
              <p className="font-semibold">{user.createdAt}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">마지막 활동</p>
              <p className="font-semibold">{user.lastActive}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">상태</p>
              <Badge variant={user.isFirstLogin ? "outline" : "default"}>
                {user.isFirstLogin ? "비밀번호 변경 필요" : "활성"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">총 이력</p>
            <p className="text-2xl font-bold">{history.length}</p>
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

        {/* History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">이력</h2>

          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">아직 이력이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(item.id, checked as boolean)
                    }
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          item.type === "validate" ? "default" : "secondary"
                        }
                      >
                        {item.type === "validate" ? "검증" : "번역"}
                      </Badge>
                      <p className="font-semibold">{item.fileName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={12} />
                      <span>
                        {item.date} {item.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.type === "validate" && (
                      <>
                        {item.errorCount !== undefined &&
                          item.errorCount > 0 && (
                            <Badge variant="destructive">
                              Error {item.errorCount}
                            </Badge>
                          )}
                        {item.warningCount !== undefined &&
                          item.warningCount > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-orange-50 text-orange-700 border-orange-200"
                            >
                              Warning {item.warningCount}
                            </Badge>
                          )}
                      </>
                    )}
                    {item.type === "translate" && item.country && (
                      <Badge variant="outline">{item.country}</Badge>
                    )}
                    {item.status === "completed" ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle2 size={12} className="mr-1" />
                        완료
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle size={12} className="mr-1" />
                        실패
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
