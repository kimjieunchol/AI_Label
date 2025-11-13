import { useState } from "react";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onPasswordChanged: (newPassword: string) => void;
  username: string;
}

export function ChangePasswordModal({
  isOpen,
  onPasswordChanged,
  username,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError("");

    // 현재 비밀번호 확인 (아이디와 동일한지)
    if (currentPassword !== username) {
      setError("현재 비밀번호가 일치하지 않습니다.");
      return;
    }

    // 새 비밀번호 검증
    if (newPassword.length < 6) {
      setError("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    // 비밀번호 변경 성공
    onPasswordChanged(newPassword);
  };

  const isFormValid = 
    currentPassword.length > 0 && 
    newPassword.length >= 6 && 
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Lock size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="mb-1">비밀번호 변경 필요</h2>
            <p className="text-sm text-gray-600">
              처음 로그인하셨습니다. 보안을 위해 비밀번호를 변경해주세요.
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-900">
              <p>현재 비밀번호는 아이디(<strong>{username}</strong>)와 동일합니다.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-800">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          {/* Current Password */}
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <Label htmlFor="current" className="text-right">
              현재 비밀번호
            </Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호 입력"
            />
          </div>

          {/* New Password */}
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <Label htmlFor="new" className="text-right">
              새 비밀번호
            </Label>
            <div>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 입력 (6자 이상)"
              />
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 size={12} className={newPassword.length >= 6 ? 'text-green-600' : 'text-gray-300'} />
                    최소 6자 이상
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${newPassword !== currentPassword && currentPassword ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 size={12} className={newPassword !== currentPassword && currentPassword ? 'text-green-600' : 'text-gray-300'} />
                    현재 비밀번호와 다름
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <Label htmlFor="confirm" className="text-right">
              새 비밀번호 확인
            </Label>
            <div>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 재입력"
              />
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-2 text-xs mt-2 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle2 size={12} />
                      비밀번호가 일치합니다
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} />
                      비밀번호가 일치하지 않습니다
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-6 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            size="lg"
          >
            비밀번호 변경하기
          </Button>
        </div>
      </Card>
    </div>
  );
}
