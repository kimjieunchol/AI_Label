import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileImage,
  Globe,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  UserCircle,
  LogOut,
  Type,
  Download,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { HistoryItem } from "../App";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LabelElement {
  id: string;
  type: "text";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: string;
  color: string;
}

interface RegulationIssue {
  id: string;
  type: "error" | "warning";
  category: string;
  description: string;
  elementId: string;
  regulation: {
    title: string;
    requirement: string;
    reference: string;
  };
  suggestion: string;
  location?: string;
}

interface MainPageProps {
  onTranslate: (file: File, type: "validate" | "translate") => void;
  user: { username: string; name: string; email: string; isAdmin?: boolean };
  onMyPage: () => void;
  onAdminPage?: () => void;
  onLogout: () => void;
  onAddHistory: (item: HistoryItem) => void;
}

// Mock AI 추출 데이터
const MOCK_EXTRACTED_ELEMENTS: LabelElement[] = [
  {
    id: "elem-1",
    type: "text",
    content: "Coca-Cola",
    x: 120,
    y: 80,
    width: 200,
    height: 40,
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  {
    id: "elem-2",
    type: "text",
    content: "영양정보",
    x: 380,
    y: 50,
    width: 150,
    height: 25,
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
  },
  {
    id: "elem-3",
    type: "text",
    content: "열량 43kcal\n탄수화물 11g\n당류 11g\n나트륨 5mg",
    x: 380,
    y: 80,
    width: 150,
    height: 80,
    fontSize: 11,
    fontWeight: "normal",
    color: "#000000",
  },
  {
    id: "elem-4",
    type: "text",
    content: "원재료명: 정제수, 설탕, 이산화탄소",
    x: 30,
    y: 320,
    width: 500,
    height: 30,
    fontSize: 12,
    fontWeight: "normal",
    color: "#000000",
  },
  {
    id: "elem-5",
    type: "text",
    content: "유통기한: 2025.12.31",
    x: 30,
    y: 360,
    width: 250,
    height: 25,
    fontSize: 11,
    fontWeight: "normal",
    color: "#000000",
  },
];

const MOCK_REGULATION_ISSUES: RegulationIssue[] = [
  {
    id: "issue-1",
    type: "error",
    category: "영양 성분 표시",
    description: "나트륨 % Daily Value 표시 누락",
    elementId: "elem-3",
    regulation: {
      title: "FDA 21 CFR 101.9(d)",
      requirement: "나트륨 함량은 반드시 % Daily Value로 표기해야 합니다.",
      reference: "Total sodium per serving must be declared with % DV",
    },
    suggestion: '나트륨 옆에 "(% DV)" 또는 "% Daily Value" 추가',
    location: "Nutrition Facts 패널",
  },
  {
    id: "issue-2",
    type: "error",
    category: "알레르기 유발물질",
    description: "알레르기 유발물질 표시 누락",
    elementId: "elem-4",
    regulation: {
      title: "FDA FALCPA (Food Allergen Labeling)",
      requirement:
        "주요 알레르겐 8종(우유, 계란, 생선, 갑각류, 견과류, 땅콩, 밀, 대두)을 명시해야 합니다.",
      reference: "Major food allergens must be declared in plain language",
    },
    suggestion:
      '"Contains: [알레르기 성분]" 문구를 추가하거나 원재료명에 괄호로 표시',
    location: "원재료명 섹션",
  },
  {
    id: "issue-3",
    type: "warning",
    category: "글꼴 크기",
    description: "유통기한 글자 크기 권장사항 미달",
    elementId: "elem-5",
    regulation: {
      title: "FDA 21 CFR 101.15",
      requirement:
        "필수 정보는 최소 1/16인치(약 1.6mm) 이상의 글자 크기로 표기해야 합니다.",
      reference: "Type size must be at least 1/16 inch in height",
    },
    suggestion: "글자 크기를 최소 12pt 이상으로 변경",
    location: "유통기한 표시",
  },
  {
    id: "issue-4",
    type: "error",
    category: "Serving Size",
    description: "Serving Size 표시 누락",
    elementId: "elem-3",
    regulation: {
      title: "FDA 21 CFR 101.9(b)",
      requirement:
        "1회 제공량(Serving Size)과 총 제공량(Servings per Container)을 명시해야 합니다.",
      reference:
        "Serving size must be declared in both household and metric measures",
    },
    suggestion: '"Serving Size: 8 fl oz (240ml)" 형태로 표기',
    location: "Nutrition Facts 상단",
  },
];

type ProcessingState = "idle" | "uploading" | "analyzing" | "ready";

const DEFAULT_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nutrition Facts - Carbonated Soft Drink</title>
    <style>
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            display: flex;
            justify-content: center;
        }
        .label-container {
            border: 2px solid black;
            width: 320px;
            padding: 10px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .nutrition-facts {
            border: 2px solid black;
            padding: 5px;
            margin-bottom: 10px;
        }
        .nutrition-facts h1 {
            font-size: 32px;
            font-weight: 900;
            margin: 0 0 5px 0;
            padding: 0;
        }
        .nutrition-facts .divider {
            border-top: 10px solid black;
            margin: 3px 0;
        }
        .nutrition-facts .thin-divider {
            border-top: 1px solid black;
            margin: 2px 0;
        }
        .nutrition-facts .serving-size {
            font-size: 12px;
            margin: 5px 0;
        }
        .nutrition-facts .calories {
            font-size: 18px;
            font-weight: 700;
            margin: 5px 0;
        }
        .nutrition-facts .daily-value-header {
            font-size: 10px;
            text-align: right;
            font-weight: 700;
        }
        .nutrition-facts .nutrient {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            border-top: 1px solid #999;
            padding: 2px 0;
        }
        .nutrition-facts .nutrient-indent {
            padding-left: 15px;
        }
        .nutrition-facts .nutrient-bold {
            font-weight: 700;
        }
        .nutrition-facts .small-text {
            font-size: 10px;
            margin: 5px 0;
        }
        .section {
            border-top: 2px solid #666;
            padding: 8px 0;
            font-size: 10px;
            line-height: 1.4;
        }
        .section:first-of-type {
            border-top: none;
        }
        .section-title {
            font-weight: 700;
            font-size: 11px;
            margin-bottom: 4px;
        }
        .facility-item {
            margin: 2px 0;
        }
    </style>
</head>
<body>
    <div class="label-container">
        <!-- Nutrition Facts 테이블 -->
        <div class="nutrition-facts">
            <h1>Nutrition Facts</h1>
            <div class="divider"></div>
            
            <div class="serving-size">
                <strong>About 1</strong> servings per container
            </div>
            <div class="serving-size">
                <strong>Serving size</strong> 8.45 fl oz
            </div>
            
            <div class="divider"></div>
            
            <div class="calories">
                <strong>Calories</strong> 110
            </div>
            
            <div class="divider"></div>
            <div class="daily-value-header">% Daily Value*</div>
            
            <div class="nutrient nutrient-bold">
                <span><strong>Total Fat</strong> 0g</span>
                <span><strong>0%</strong></span>
            </div>
            
            
            
            
            
            
            
            <div class="nutrient nutrient-bold">
                <span><strong>Sodium</strong> 6mg</span>
                <span><strong>0%</strong></span>
            </div>
            
            <div class="nutrient nutrient-bold">
                <span><strong>Total Carbohydrate</strong> 28g</span>
                <span><strong>9%</strong></span>
            </div>
            
            
            
            
            <div class="nutrient nutrient-indent">
                <span>Total Sugars 27g</span>
                <span></span>
            </div>
            
            
            
            <div class="nutrient nutrient-indent" style="padding-left: 30px;">
                <span>Includes 27g Added Sugars</span>
                <span><strong>27%</strong></span>
            </div>
            
            
            <div class="nutrient nutrient-bold">
                <span><strong>Protein</strong> 0g</span>
                <span></span>
            </div>
            
            <div class="divider"></div>
            
            <div class="small-text">
                * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 
                2,000 calories a day is used for general nutrition advice.
            </div>
        </div>
        
        <!-- 원재료 섹션 -->
        <div class="section">
            <div class="section-title">INGREDIENTS:</div>
            <div>Purified Water, High Fructose Corn Syrup, Sugar, Carbon Dioxide, Citric Acid, Natural Flavor (Lemon Lime Flavor).</div>
            
        </div>
        
        <!-- 제조원 섹션 -->
        <div class="section">
            <div class="section-title">MANUFACTURED BY:</div>
            <div>Lotte Chilsung Beverage Co., Ltd.</div>
            
            
            
            
            
            
            
            
            
            
            
        </div>
        
        <!-- 경고 및 주의사항 섹션 -->
        
        <div class="section">
            
            <div class="section-title">STORAGE:</div>
            <div>Store in a cool place away from direct sunlight and do not freeze. Refrigerate after opening and consume quickly.</div>
            
            
            
            <div class="section-title" style="margin-top: 6px;">CAUTIONS:</div>
            
            <div>• Be careful when opening as contents may overflow. Do not consume if the container is damaged or contents are altered.</div>
            
            <div>• Report any substandard or defective food: Call 1399 without area code.</div>
            
            <div>• Consumers can exchange or receive compensation according to the Consumer Dispute Resolution Standards (Fair Trade Commission Notice).</div>
            
            <div>• Exchange: Lotte Chilsung Beverage Co., Ltd. Customer Satisfaction Team (Toll-free 080-730-1472) and place of purchase.</div>
            
            
        </div>
        
        
        <!-- 제품 정보 섹션 -->
        <div class="section">
            <div class="section-title">PRODUCT INFO:</div>
            <div><strong>Type:</strong>Carbonated Soft Drink</div>
            
            
            <div><strong>Best Before:</strong> See bottom of the can</div>
            
        </div>
    </div>
</body>
</html>`;

export function MainPage({
  onTranslate,
  user,
  onMyPage,
  onAdminPage,
  onLogout,
  onAddHistory,
}: MainPageProps) {
  const [processingState, setProcessingState] =
    useState<ProcessingState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string>("usa");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [actionType, setActionType] = useState<"validate" | "translate" | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editor state
  const [imageUrl, setImageUrl] = useState<string>("");
  const [htmlContent, setHtmlContent] = useState<string>(DEFAULT_HTML);
  const [issues, setIssues] = useState<RegulationIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Enable editing in iframe
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;
    doc.designMode = "on";

    // Undo/Redo 단축키 지원
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        doc.execCommand("undo", false);
      } else if (
        (e.ctrlKey || e.metaKey) &&
        ((e.shiftKey && e.key === "z") || e.key === "y")
      ) {
        e.preventDefault();
        doc.execCommand("redo", false);
      }
    };

    doc.addEventListener("keydown", handleKeyDown);

    // 입력 이벤트는 제거 - 커서가 사라지는 문제를 방지하기 위해
    // 대신 검증/내보내기 시 iframe에서 직접 HTML을 추출합니다
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  };

  const startProcess = (type: "validate" | "translate") => {
    if (!selectedFile) return;

    // 검증/번역 시작 시 바로 ResultPage로 이동
    onTranslate(selectedFile, type);
  };

  const runValidation = () => {
    setIsValidating(true);

    // Mock validation - 실제로는 API 호출
    setTimeout(() => {
      setIssues(MOCK_REGULATION_ISSUES);
      setIsValidating(false);
    }, 1500);
  };

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4 flex-shrink-0 relative z-50">
        <div className="flex items-center justify-between">
          <div className="cursor-default">
            <h1 className="mb-1">라벨 번역 서비스</h1>
            <p className="text-gray-600">
              음료 라벨을 업로드하고 FDA 규제에 맞춰 번역하세요
            </p>
          </div>
          <div className="flex items-center gap-2">
            {processingState === "ready" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // iframe에서 현재 HTML 가져오기
                  const iframe = iframeRef.current;
                  let exportHtml = htmlContent;

                  if (iframe?.contentDocument) {
                    exportHtml =
                      iframe.contentDocument.documentElement.outerHTML;
                  }

                  // HTML 파일 다운로드
                  const blob = new Blob([exportHtml], {
                    type: "text/html;charset=utf-8",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `label-${Date.now()}.html`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);

                  // 이력에 추가
                  const now = new Date();
                  const historyItem: HistoryItem = {
                    id: `hist-${Date.now()}`,
                    type: actionType || "validate",
                    fileName: selectedFile?.name || "unknown.png",
                    date: now
                      .toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                      .replace(/\. /g, ".")
                      .replace(".", ""),
                    time: now.toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                    status: "completed",
                    errorCount: issues.filter((i) => i.type === "error").length,
                    warningCount: issues.filter((i) => i.type === "warning")
                      .length,
                    userId: user.username, // 👈 이 줄 추가
                  };
                  onAddHistory(historyItem);

                  // 저장 처리 (콘솔에 로그)
                  console.log("라벨 저장 완료", historyItem);

                  // 초기 상태로 리셋
                  setProcessingState("idle");
                  setSelectedFile(null);
                  setImageUrl("");
                  setHtmlContent(DEFAULT_HTML);
                  setIssues([]);
                  setProgress(0);
                  setActionType(null);
                }}
              >
                <Download className="mr-2" size={16} />
                내보내기
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <UserCircle size={16} className="mr-1" />
                  {user.name}
                  <ChevronDown size={14} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onMyPage}>
                  <UserCircle size={16} className="mr-2" />
                  마이페이지
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem onClick={onAdminPage}>
                    <UserCircle size={16} className="mr-2" />
                    관리자 페이지
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut size={16} className="mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content - 좌우 배치 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {/* Upload / Processing State */}
          {processingState === "idle" && (
            <Card className="p-8 h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <FileImage className="text-blue-600" size={32} />
                </div>
                <h2 className="mb-2">라벨 파일 업로드</h2>
                <p className="text-gray-600">
                  HTML 또는 이미지 파일을 업로드하세요
                </p>
              </div>

              {/* Country Selection */}
              <div className="mb-6 max-w-md mx-auto w-full">
                <Label className="mb-2 flex items-center gap-2">
                  <Globe size={16} />
                  번역 대상 국가
                </Label>
                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usa">🇺🇸 미국 (FDA)</SelectItem>
                    <SelectItem value="eu">🇪🇺 유럽연합 (EC)</SelectItem>
                    <SelectItem value="japan">🇯🇵 일본 (MHLW)</SelectItem>
                    <SelectItem value="china">🇨🇳 중국 (CFDA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer max-w-2xl mx-auto w-full ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : selectedFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload
                  className={`mx-auto mb-4 ${
                    selectedFile ? "text-green-500" : "text-gray-400"
                  }`}
                  size={48}
                />
                {selectedFile ? (
                  <>
                    <p className="mb-2">
                      선택된 파일: <strong>{selectedFile.name}</strong>
                    </p>
                    <p className="text-sm text-gray-500">
                      다른 파일을 선택하려면 클릭하세요
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-2">
                      라벨 이미지를 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG 지원 (최대 10MB)
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <div className="mt-6 flex gap-4 max-w-2xl mx-auto w-full">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={() => startProcess("validate")}
                  >
                    <AlertCircle className="mr-2" size={20} />
                    검증 시작
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    variant="outline"
                    onClick={() => startProcess("translate")}
                  >
                    <Globe className="mr-2" size={20} />
                    번역 시작
                  </Button>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-2xl mx-auto w-full">
                <p className="text-sm text-blue-900">
                  💡 <strong>안내:</strong> 이미지를 업로드한 후 검증 또는
                  번역을 선택하세요. 검증은 FDA 규제를 확인하고, 번역은 선택한
                  국가의 언어로 변환합니다.
                </p>
              </div>
            </Card>
          )}

          {/* Processing States */}
          {(processingState === "uploading" ||
            processingState === "analyzing") && (
            <Card className="p-12 h-full flex flex-col justify-center items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>

              <h2 className="mb-2">
                {processingState === "uploading"
                  ? "파일 업로드 중..."
                  : actionType === "validate"
                  ? "FDA 규제 검증 중..."
                  : "라벨 번역 중..."}
              </h2>
              <p className="text-gray-600 mb-6">
                {processingState === "uploading"
                  ? "이미지를 서버에 업로드하고 있습니다"
                  : actionType === "validate"
                  ? "라벨의 텍스트와 구조를 추출하고 FDA 규제를 검증하고 있습니다"
                  : "라벨의 텍스트를 추출하고 선택한 언어로 번역하고 있습니다"}
              </p>

              <div className="w-full max-w-md">
                <Progress value={progress} className="mb-4" />
                <p className="text-sm text-center text-gray-500">{progress}%</p>
              </div>

              <div className="mt-8 space-y-2 text-sm text-gray-600">
                {processingState === "uploading" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>파일 업로드 중...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>
                        {actionType === "validate"
                          ? "FDA 규제 검증 대기 중"
                          : "언어 번역 대기 중"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>레이아웃 분석 대기 중</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>파일 업로드 완료</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>텍스트 추출 중...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>
                        {actionType === "validate"
                          ? "FDA 규제 검증 중..."
                          : "언어 번역 중..."}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Editor View */}
          {processingState === "ready" && (
            <Card className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2>라벨 미리보기</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runValidation}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                      검증 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2" size={16} />
                      규제 검증
                    </>
                  )}
                </Button>
              </div>

              <div className="flex-1 flex justify-center items-center overflow-hidden relative">
                <div
                  ref={containerRef}
                  className="relative bg-gray-100 rounded-lg overflow-auto shadow-lg max-w-full max-h-full"
                  style={{
                    minHeight: "600px",
                    minWidth: "400px",
                  }}
                >
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">
                          미리보기 로딩 중...
                        </p>
                      </div>
                    </div>
                  )}
                  <iframe
                    ref={iframeRef}
                    srcDoc={htmlContent}
                    onLoad={handleIframeLoad}
                    className="w-full h-full border-0"
                    style={{
                      minHeight: "600px",
                      minWidth: "400px",
                    }}
                    title="HTML Label Preview"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center flex-shrink-0">
                💡 미리보기 화면을 클릭하여 직접 편집할 수 있습니다
              </p>
            </Card>
          )}
        </div>

        {/* Right Panel - 검증 결과 패널 */}
        <div className="w-[450px] flex-shrink-0 border-l bg-white overflow-auto">
          {/* Validation Results - 항상 표시 */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3>규제 검증 결과</h3>
              {processingState === "ready" && issues.length > 0 && (
                <div className="flex gap-1.5">
                  <Badge variant="destructive" className="text-xs">
                    {errorCount}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {warningCount}
                  </Badge>
                </div>
              )}
            </div>

            {processingState === "ready" ? (
              issues.length > 0 ? (
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-4 pr-4">
                    {issues.map((issue) => (
                      <Card
                        key={issue.id}
                        className={`p-4 border-2 ${
                          issue.type === "error"
                            ? "border-red-200 bg-red-50/50"
                            : "border-yellow-200 bg-yellow-50/50"
                        }`}
                      >
                        {/* Issue Header */}
                        <div className="flex items-start gap-2 mb-3">
                          <div
                            className={`mt-1 ${
                              issue.type === "error"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            <AlertCircle size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  issue.type === "error"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {issue.type === "error" ? "오류" : "경고"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {issue.category}
                              </Badge>
                            </div>
                            <p className="text-sm">{issue.description}</p>
                            {issue.location && (
                              <p className="text-xs text-gray-500 mt-1">
                                📍 {issue.location}
                              </p>
                            )}
                          </div>
                        </div>

                        <Separator className="my-3" />

                        {/* Regulation Details */}
                        <div className="mb-3">
                          <div className="flex items-center gap-1 mb-2">
                            <BookOpen size={14} className="text-blue-600" />
                            <p className="text-xs text-blue-900">
                              {issue.regulation.title}
                            </p>
                          </div>
                          <div className="pl-5 space-y-1">
                            <p className="text-xs text-gray-700">
                              <strong>요구사항:</strong>{" "}
                              {issue.regulation.requirement}
                            </p>
                            <p className="text-xs text-gray-500 italic">
                              {issue.regulation.reference}
                            </p>
                          </div>
                        </div>

                        {/* Suggestion */}
                        <div className="pl-5 border-l-2 border-green-500 bg-white p-2 rounded">
                          <p className="text-xs text-green-900">
                            <strong>💡 해결방법:</strong> {issue.suggestion}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2
                    size={48}
                    className="mx-auto mb-4 text-green-500"
                  />
                  <p className="text-gray-700 mb-2">검증 결과가 없습니다</p>
                  <p className="text-sm text-gray-500">
                    "규제 검증" 버튼을 눌러 검증을 시작하세요
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  라벨을 업로드하면 검증 결과가 표시됩니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
