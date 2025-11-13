// =========================================
// src/services/api.ts - API 서비스 레이어
// =========================================

import axios, { AxiosInstance, AxiosError } from "axios";

// API 기본 설정
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

export interface PipelineResponse {
  ocr_result: {
    filename: string;
    language: string;
    texts: string[];
  };
  structured_data: {
    language: string;
    data: any;
  };
  translated_data: {
    source_language: string;
    target_country: string;
    translated_data: any;
  };
  html_output: string;
  processing_time: {
    ocr_time: number;
    structure_time: number;
    translate_time: number;
    html_time: number;
    total_time: number;
  };
}

// =========================================
// 인증 API
// =========================================

export const authApi = {
  /**
   * 로그인
   * POST /api/auth/login
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
   * POST /api/auth/logout
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
   * GET /api/user/profile
   */
  getProfile: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>("/user/profile");
    return response.data;
  },

  /**
   * 비밀번호 변경
   * PUT /api/user/password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put("/user/password", data);
  },

  /**
   * 내 이력 조회
   * GET /api/user/history
   */
  getMyHistory: async (): Promise<HistoryResponse[]> => {
    const response = await apiClient.get<HistoryResponse[]>("/user/history");
    return response.data;
  },

  /**
   * 내 이력 삭제
   * DELETE /api/user/history
   * Request Body: number[] (id 배열)
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
   * GET /api/admin/users
   */
  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await apiClient.get<UserResponse[]>("/admin/users");
    return response.data;
  },

  /**
   * 사용자 생성
   * POST /api/admin/users
   */
  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>("/admin/users", data);
    return response.data;
  },

  /**
   * 사용자 삭제
   * DELETE /api/admin/users/{id}
   */
  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  /**
   * 사용자 상세 조회
   * GET /api/admin/users/{id}
   */
  getUserDetail: async (userId: number): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(
      `/admin/users/${userId}`
    );
    return response.data;
  },

  /**
   * 전체 이력 조회
   * GET /api/admin/history
   */
  getAllHistory: async (): Promise<HistoryResponse[]> => {
    const response = await apiClient.get<HistoryResponse[]>("/admin/history");
    return response.data;
  },

  /**
   * 이력 삭제 (관리자)
   * DELETE /api/admin/history
   * Request Body: number[] (id 배열)
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
   * POST /api/label/validate
   *
   * 전체 플로우:
   * 1. 이미지 → Food Label API (OCR + Structure + Translate + HTML)
   * 2. HTML → RAG API (FDA Validation)
   */
  validateLabel: async (
    file: File,
    country: string = "USA"
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
   * 라벨 번역 (HTML 반환)
   * POST /api/label/translate
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
        responseType: "text",
      }
    );

    return response.data;
  },

  /**
   * 상세 번역 결과 (구조화된 데이터 포함)
   * POST /api/label/translate/detailed
   */
  translateLabelDetailed: async (
    file: File,
    country: string
  ): Promise<PipelineResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("country", country);

    const response = await apiClient.post<PipelineResponse>(
      "/label/translate/detailed",
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
   * 배치 번역 (여러 이미지 동시 처리)
   * POST /api/label/translate/batch
   * 최대 20개 파일까지
   */
  translateBatch: async (
    files: File[],
    country: string = "USA"
  ): Promise<PipelineResponse[]> => {
    if (files.length > 20) {
      throw new Error("최대 20개 파일까지 처리 가능합니다.");
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("country", country);

    const response = await apiClient.post<PipelineResponse[]>(
      "/label/translate/batch",
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
   * 다중 국가 번역 (하나의 이미지 → 여러 국가 형식)
   * POST /api/label/translate/multi-country
   * 최대 10개 국가까지
   */
  translateToMultipleCountries: async (
    file: File,
    countries: string[]
  ): Promise<Record<string, string>> => {
    if (countries.length > 10) {
      throw new Error("최대 10개 국가까지 처리 가능합니다.");
    }

    const formData = new FormData();
    formData.append("file", file);
    countries.forEach((country) => {
      formData.append("countries", country);
    });

    const response = await apiClient.post<Record<string, string>>(
      "/label/translate/multi-country",
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
   * OCR만 실행 (텍스트 추출만)
   * POST /api/label/ocr
   */
  extractText: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/label/ocr", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * 구조화만 실행 (텍스트 → JSON)
   * POST /api/label/structure
   */
  structureData: async (texts: string[], language: string): Promise<any> => {
    const response = await apiClient.post("/label/structure", {
      texts,
      language,
    });

    return response.data;
  },

  /**
   * API 상태 확인
   * GET /api/label/health
   */
  checkHealth: async (): Promise<{
    service: string;
    food_label_api_healthy: boolean;
    circuit_breaker_state: string;
    status: string;
  }> => {
    const response = await apiClient.get("/label/health");
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
