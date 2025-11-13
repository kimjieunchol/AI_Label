import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2, AlertCircle } from "lucide-react";

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean> | boolean;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await onLogin(username, password);

      if (!success) {
        setError("아이디 또는 비밀번호가 일치하지 않습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3 text-center">Label AI</h1>
          <p className="text-center text-gray-500">로그인</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-800">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="h-12"
          />

          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-12"
          />

          <Button
            type="submit"
            className="w-full h-12 mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "로그인"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
