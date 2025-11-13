import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { MainPage } from "./components/MainPage";
import { ResultPage } from "./components/ResultPage";
import { MyPage } from "./components/MyPage";
import { AdminPage } from "./components/AdminPage";
import { UserDetailPage } from "./components/UserDetailPage";
import { ChangePasswordModal } from "./components/ChangePasswordModal";

type Page = "login" | "main" | "result" | "mypage" | "admin" | "userdetail";

interface User {
  email: string;
  name: string;
  username: string;
  isAdmin: boolean;
  isFirstLogin: boolean;
}

export interface HistoryItem {
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

export interface AppUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  lastActive: string;
  isFirstLogin: boolean;
}

const STORAGE_KEYS = {
  USERS: "label_service_users",
  HISTORY: "label_service_history",
  CURRENT_USER: "label_service_current_user",
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // 사용자 데이터베이스
  const [users, setUsers] = useState<AppUser[]>([
    {
      id: "admin",
      name: "관리자",
      username: "admin",
      email: "admin@company.com",
      password: "admin",
      createdAt: "2025.01.01",
      lastActive: "-",
      isFirstLogin: false,
    },
  ]);

  // 초기화: localStorage에서 데이터 로드
  useEffect(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
      } catch (e) {
        console.error("Failed to parse users", e);
      }
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setAllHistory(parsedHistory);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    if (savedCurrentUser) {
      try {
        const parsedUser = JSON.parse(savedCurrentUser);
        setUser(parsedUser);
        setCurrentPage("main");
      } catch (e) {
        console.error("Failed to parse current user", e);
      }
    }
  }, []);

  // users 변경 시 localStorage에 저장
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }, [users]);

  // history 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(allHistory));
  }, [allHistory]);

  // current user 변경 시 localStorage에 저장
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [user]);

  const handleLogin = async (username: string, password: string) => {
    // 사용자 찾기
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!foundUser) {
      return false;
    }

    // 마지막 활동 시간 업데이트
    const now = new Date();
    const dateStr = now
      .toLocaleDateString("ko-KR")
      .replace(/\. /g, ".")
      .slice(0, -1);
    const timeStr = now.toTimeString().slice(0, 5);

    const updatedUsers = users.map((u) =>
      u.id === foundUser.id ? { ...u, lastActive: `${dateStr} ${timeStr}` } : u
    );
    setUsers(updatedUsers);

    const loggedInUser: User = {
      email: foundUser.email,
      name: foundUser.name,
      username: foundUser.username,
      isAdmin: foundUser.id === "admin",
      isFirstLogin: foundUser.isFirstLogin,
    };

    setUser(loggedInUser);

    if (foundUser.isFirstLogin) {
      setShowPasswordModal(true);
      setCurrentPage("main");
    } else {
      setCurrentPage("main");
    }

    return true;
  };

  const handlePasswordChanged = (newPassword: string) => {
    setShowPasswordModal(false);
    if (user) {
      // 비밀번호 변경 및 첫 로그인 플래그 해제
      const updatedUsers = users.map((u) =>
        u.username === user.username
          ? { ...u, password: newPassword, isFirstLogin: false }
          : u
      );
      setUsers(updatedUsers);
      setUser({ ...user, isFirstLogin: false });
    }
  };

  const handlePasswordChange = (
    currentPassword: string,
    newPassword: string
  ): boolean => {
    if (!user) return false;

    // 현재 사용자 찾기
    const currentUser = users.find((u) => u.username === user.username);
    if (!currentUser) return false;

    // 현재 비밀번호 확인
    if (currentUser.password !== currentPassword) {
      return false;
    }

    // 비밀번호 변경
    const updatedUsers = users.map((u) =>
      u.username === user.username ? { ...u, password: newPassword } : u
    );
    setUsers(updatedUsers);
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("login");
    setUploadedFile(null);
  };

  const handleTranslate = (file: File, type: "validate" | "translate") => {
    setUploadedFile(file);
    setCurrentPage("result");

    // 이력 추가
    if (user) {
      const now = new Date();
      const dateStr = now
        .toLocaleDateString("ko-KR")
        .replace(/\. /g, ".")
        .slice(0, -1);
      const timeStr = now.toTimeString().slice(0, 5);

      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        type: type,
        fileName: file.name,
        date: dateStr,
        time: timeStr,
        status: "completed",
        errorCount: type === "validate" ? 6 : 0,
        warningCount: type === "validate" ? 0 : 0,
        country: type === "translate" ? "미국 (FDA)" : undefined,
        userId: user.username,
      };

      setAllHistory((prev) => [newHistoryItem, ...prev]);
    }
  };

  const handleRestart = () => {
    setCurrentPage("main");
    setUploadedFile(null);
  };

  const handleAddHistory = (item: HistoryItem) => {
    setAllHistory((prev) => [item, ...prev]);
  };

  const handleDeleteHistory = (ids: string[]) => {
    setAllHistory((prev) => prev.filter((item) => !ids.includes(item.id)));
  };

  const handleDeleteUserHistory = (ids: string[]) => {
    handleDeleteHistory(ids);
  };

  const handleDeleteAdminHistory = (ids: string[]) => {
    handleDeleteHistory(ids);
  };

  const handleCreateUser = (name: string, username: string, email: string) => {
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name,
      username,
      email,
      password: username,
      createdAt: new Date()
        .toLocaleDateString("ko-KR")
        .replace(/\. /g, ".")
        .slice(0, -1),
      lastActive: "-",
      isFirstLogin: true,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    // 해당 사용자의 이력도 삭제
    setAllHistory((prev) => prev.filter((h) => h.userId !== userId));
  };

  const handleViewUserDetail = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentPage("userdetail");
  };

  // 현재 사용자의 이력만 필터링
  const currentUserHistory = user
    ? allHistory.filter((h) => h.userId === user.username)
    : [];

  return (
    <div className="min-h-screen">
      {/* 인증되지 않은 경우 */}
      {!user && <LoginPage onLogin={handleLogin} />}

      {/* 인증된 경우 */}
      {user && (
        <>
          {currentPage === "admin" && user.isAdmin && (
            <AdminPage
              onBack={() => setCurrentPage("main")}
              adminUser={user}
              onLogout={handleLogout}
              users={users.filter((u) => u.id !== "admin")}
              allHistory={allHistory}
              onCreateUser={handleCreateUser}
              onDeleteUser={handleDeleteUser}
              onDeleteHistory={handleDeleteAdminHistory}
              onViewUserDetail={handleViewUserDetail}
            />
          )}

          {currentPage === "userdetail" && selectedUserId && (
            <UserDetailPage
              user={users.find((u) => u.id === selectedUserId)!}
              history={allHistory.filter(
                (h) =>
                  h.userId ===
                  users.find((u) => u.id === selectedUserId)?.username
              )}
              onBack={() => setCurrentPage("admin")}
              onDeleteHistory={handleDeleteUserHistory}
            />
          )}

          {currentPage === "main" && (
            <MainPage
              onTranslate={handleTranslate}
              user={user}
              onMyPage={() => setCurrentPage("mypage")}
              onAdminPage={() => setCurrentPage("admin")}
              onLogout={handleLogout}
              onAddHistory={handleAddHistory}
            />
          )}

          {currentPage === "result" && uploadedFile && (
            <ResultPage
              uploadedFile={uploadedFile}
              onRestart={handleRestart}
              user={user}
              onMyPage={() => setCurrentPage("mypage")}
              onLogout={handleLogout}
              onAdminPage={
                user.isAdmin ? () => setCurrentPage("admin") : undefined
              }
            />
          )}

          {currentPage === "mypage" && (
            <MyPage
              user={user}
              onBack={() => setCurrentPage("main")}
              history={currentUserHistory}
              onDeleteHistory={handleDeleteHistory}
              onPasswordChange={handlePasswordChange}
            />
          )}

          {/* 비밀번호 변경 모달 */}
          {showPasswordModal && (
            <ChangePasswordModal
              isOpen={showPasswordModal}
              onPasswordChanged={handlePasswordChanged}
              username={user.username}
            />
          )}
        </>
      )}
    </div>
  );
}
