// =========================================
// src/services/api.ts - API 서비스 레이어
// =========================================

import axios, { AxiosInstance, AxiosError } from "axios";

// API 기본 설정 - 타입 에러 수정
const API_BASE_URL = "http://localhost:8081/api";

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request 인터셉터 - JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; errorCode: string }>) => {
    // 401 Unauthorized - 토큰 만료 또는 인증 실패
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("label_service_current_user");
      window.location.href = "/";
    }

    // 에러 메시지 추출
    const errorMessage =
      error.response?.data?.message || "서버 오류가 발생했습니다.";
    return Promise.reject(new Error(errorMessage));
  }
);

// =========================================
// 타입 정의
// =========================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isFirstLogin: boolean;
}

export interface UserResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  createdAt: string;
  lastActive: string;
  isFirstLogin: boolean;
}

export interface HistoryResponse {
  id: number;
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

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ValidationError {
  location: {
    selector: string;
    element_type: string;
  };
  missing?: {
    item: string;
    severity: "warning" | "info" | "error";
    message: string;
  };
  incorrect?: {
    current_value: string;
    issue: string;
    severity: "warning" | "info" | "error";
    message: string;
  };
  reference: {
    regulation: string;
    guidance: string;
    sources: Array<{
      source: string;
      category: string;
    }>;
  };
}

export interface ValidationResponse {
  product_name: string;
  source_html: string;
  product_type: string;
  total_errors: number;
  errors: ValidationError[];
}

// =========================================
// 인증 API
// =========================================

export const authApi = {
  /**
   * 로그인
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);

    // 토큰 저장
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
    }

    return response.data;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("label_service_current_user");
    }
  },
};

// =========================================
// 사용자 API (마이페이지)
// =========================================

export const userApi = {
  /**
   * 내 프로필 조회
   */
  getProfile: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>("/user/profile");
    return response.data;
  },

  /**
   * 비밀번호 변경
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put("/user/password", data);
  },

  /**
   * 내 이력 조회
   */
  getMyHistory: async (): Promise<HistoryResponse[]> => {
    const response = await apiClient.get<HistoryResponse[]>("/user/history");
    return response.data;
  },

  /**
   * 내 이력 삭제
   */
  deleteHistory: async (ids: number[]): Promise<void> => {
    await apiClient.delete("/user/history", { data: ids });
  },
};

// =========================================
// 관리자 API
// =========================================

export const adminApi = {
  /**
   * 전체 사용자 목록
   */
  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await apiClient.get<UserResponse[]>("/admin/users");
    return response.data;
  },

  /**
   * 사용자 생성
   */
  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>("/admin/users", data);
    return response.data;
  },

  /**
   * 사용자 삭제
   */
  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  /**
   * 사용자 상세 조회
   */
  getUserDetail: async (userId: number): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(
      `/admin/users/${userId}`
    );
    return response.data;
  },

  /**
   * 전체 이력 조회
   */
  getAllHistory: async (): Promise<HistoryResponse[]> => {
    const response = await apiClient.get<HistoryResponse[]>("/admin/history");
    return response.data;
  },

  /**
   * 이력 삭제 (관리자)
   */
  deleteHistory: async (ids: number[]): Promise<void> => {
    await apiClient.delete("/admin/history", { data: ids });
  },
};

// =========================================
// 라벨 API
// =========================================

export const labelApi = {
  /**
   * FDA 규제 검증
   */
  validateLabel: async (
    file: File,
    country: string = "usa"
  ): Promise<ValidationResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("country", country);

    const response = await apiClient.post<ValidationResponse>(
      "/label/validate",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * 라벨 번역
   */
  translateLabel: async (file: File, country: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("country", country);

    const response = await apiClient.post<string>(
      "/label/translate",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};

// =========================================
// 기본 내보내기
// =========================================

const api = {
  auth: authApi,
  user: userApi,
  admin: adminApi,
  label: labelApi,
};

export default api;
