import { useState, useEffect, useRef } from "react";
import {
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Trash2,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ResultPageProps {
  uploadedFile: File;
  onRestart: () => void;
  user: { name: string; email: string; isAdmin?: boolean };
  onMyPage: () => void;
  onLogout: () => void;
  onAdminPage?: () => void;
}

interface ValidationError {
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

interface ValidationResult {
  product_name: string;
  source_html: string;
  product_type: string;
  total_errors: number;
  errors: ValidationError[];
}

// 고정된 HTML 템플릿 (드래그 핸들 제거, contenteditable만 유지)
const INITIAL_HTML = `<!DOCTYPE html>
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
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
        }
        .nutrition-facts .daily-value-header {
            font-size: 10px;
            font-weight: bold;
            text-align: right;
            margin: 5px 0;
        }
        .nutrition-facts .nutrient {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            border-top: 1px solid #666;
            padding: 3px 0;
        }
        .nutrition-facts .nutrient-bold {
            font-weight: bold;
        }
        .nutrition-facts .nutrient-indent {
            padding-left: 15px;
        }
        .nutrition-facts .small-text {
            font-size: 9px;
            margin-top: 5px;
            line-height: 1.3;
        }
        .section {
            margin: 10px 0;
            font-size: 11px;
        }
        .section .section-title {
            font-weight: bold;
            margin-bottom: 3px;
        }
        .editable-element {
            position: relative;
        }
        .editable-element[contenteditable="true"] {
            cursor: text;
        }
        .editable-element[contenteditable="true"]:hover {
            background-color: rgba(59, 130, 246, 0.05);
        }
        .editable-element[contenteditable="true"]:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }
        .highlight-error {
            animation: pulse-error 2s ease-in-out;
            background-color: rgba(239, 68, 68, 0.2) !important;
        }
        .highlight-warning {
            animation: pulse-warning 2s ease-in-out;
            background-color: rgba(249, 115, 22, 0.2) !important;
        }
        .highlight-info {
            animation: pulse-info 2s ease-in-out;
            background-color: rgba(59, 130, 246, 0.2) !important;
        }
        @keyframes pulse-error {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        }
        @keyframes pulse-warning {
            0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
            50% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
        }
        @keyframes pulse-info {
            0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        }
    </style>
</head>
<body>
    <div class="label-container">
        <div class="nutrition-facts">
            <h1>Nutrition Facts</h1>
            <div class="divider"></div>
            
            <div class="serving-size editable-element" contenteditable="true">
                <strong>About 1</strong> servings per container
            </div>
            <div class="serving-size editable-element" contenteditable="true">
                <strong>Serving size</strong> 6.4 fl oz
            </div>
            
            <div class="divider"></div>
            
            <div class="calories editable-element" contenteditable="true">
                <strong>Calories</strong> 84
            </div>
            
            <div class="divider"></div>
            <div class="daily-value-header">% Daily Value*</div>
            
            <div class="nutrient nutrient-bold editable-element" contenteditable="true">
                <span><strong>Total Fat</strong> 0g</span>
                <span><strong>0%</strong></span>
            </div>
            
            <div class="nutrient nutrient-indent editable-element" contenteditable="true">
                <span>Saturated Fat 0g</span>
                <span><strong>0%</strong></span>
            </div>
            
            <div class="nutrient nutrient-indent editable-element" contenteditable="true">
                <span><em>Trans</em> Fat 0g</span>
                <span></span>
            </div>
            
            <div class="nutrient nutrient-bold editable-element" contenteditable="true">
                <span><strong>Cholesterol</strong> 0mg</span>
                <span><strong>0%</strong></span>
            </div>
            
            <div class="nutrient nutrient-bold editable-element" contenteditable="true">
                <span><strong>Sodium</strong> 6mg</span>
                <span><strong>0%</strong></span>
            </div>
            
            <div class="nutrient nutrient-bold editable-element" contenteditable="true">
                <span><strong>Total Carbohydrate</strong> 21g</span>
                <span><strong>6%</strong></span>
            </div>
            
            <div class="nutrient nutrient-indent editable-element" contenteditable="true">
                <span>Total Sugars 21g</span>
                <span></span>
            </div>
            
            <div class="nutrient nutrient-indent editable-element" contenteditable="true" style="padding-left: 30px;">
                <span>Includes 21g Added Sugars</span>
                <span><strong>21%</strong></span>
            </div>
            
            <div class="nutrient nutrient-bold editable-element" contenteditable="true">
                <span><strong>Protein</strong> 0g</span>
                <span></span>
            </div>
            
            <div class="divider"></div>
            
            <div class="small-text editable-element" contenteditable="true">
                * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 
                2,000 calories a day is used for general nutrition advice.
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">INGREDIENTS:</div>
            <div class="editable-element" contenteditable="true">Purified Water, Sugar Syrup, Carbon Dioxide, Citric Acid, Gum Arabic, Artificial Flavor Orange Flavor, Sucrose, Sucrose Acetate Isobutyrate, Propylene Glycol, Sunset Yellow FCF, Vitamin C, Sucralose.</div>
        </div>
        
        <div class="section">
            <div class="section-title">MANUFACTURED BY:</div>
            <div class="editable-element" contenteditable="true">Coca-Cola Beverage Co., Ltd.</div>
        </div>
        
        <div class="section">
            <div class="section-title">STORAGE:</div>
            <div class="editable-element" contenteditable="true">Do not store in a sealed space inside a car as the product may be damaged.</div>
        </div>
        
        <div class="section">
            <div class="section-title">PRODUCT INFO:</div>
            <div class="editable-element" contenteditable="true"><strong>Type:</strong> Carbonated Soft Drink</div>
            <div class="editable-element" contenteditable="true"><strong>Volume:</strong> 190ml (6.4 fl oz)</div>
            <div class="editable-element" contenteditable="true"><strong>Expiration:</strong> See bottom of can</div>
        </div>
    </div>
</body>
</html>`;

// Mock 검증 결과
const MOCK_VALIDATION_RESULT: ValidationResult = {
  product_name: "Fanta Orange",
  source_html: "",
  product_type: "Carbonated Soft Drink",
  total_errors: 6,
  errors: [
    {
      location: {
        selector: "div.nutrition-facts",
        element_type: "nutrition-facts",
      },
      missing: {
        item: "Vitamin D",
        severity: "error",
        message: "Vitamin D 필수 영양소",
      },
      reference: {
        regulation: "21 CFR 101.9(c)(8)(ii)",
        guidance:
          "Yes, Vitamin D, Calcium, Iron, and Potassium are required to be listed on FDA nutrition labels. According to the FDA regulations, specifically 21 CFR 101.9(c)(8)(ii), the declaration of these vitamins...",
        sources: [
          {
            source: "What's on the Nutrition Facts Label.pdf",
            category: "factors",
          },
          {
            source:
              "21 CFR 101.9 (up to date as of 9-29-2025).pdf",
            category: "legal",
          },
        ],
      },
    },
    {
      location: {
        selector: "div.nutrition-facts",
        element_type: "nutrition-facts",
      },
      missing: {
        item: "Calcium",
        severity: "error",
        message: "Calcium 필수 영양소",
      },
      reference: {
        regulation: "21 CFR 101.9(c)(8)(ii)",
        guidance:
          "Yes, Vitamin D, Calcium, Iron, and Potassium are required to be listed on FDA nutrition labels. According to the FDA regulations, specifically 21 CFR 101.9(c)(8)(ii), the declaration of these vitamins...",
        sources: [
          {
            source: "What's on the Nutrition Facts Label.pdf",
            category: "factors",
          },
          {
            source:
              "21 CFR 101.9 (up to date as of 9-29-2025).pdf",
            category: "legal",
          },
        ],
      },
    },
    {
      location: {
        selector: "div.nutrition-facts",
        element_type: "nutrition-facts",
      },
      missing: {
        item: "Iron",
        severity: "warning",
        message: "Iron 권장 영양소",
      },
      reference: {
        regulation: "21 CFR 101.9(c)(8)(ii)",
        guidance:
          "Yes, Vitamin D, Calcium, Iron, and Potassium are required to be listed on FDA nutrition labels. According to the FDA regulations, specifically 21 CFR 101.9(c)(8)(ii), the declaration of these vitamins...",
        sources: [
          {
            source: "What's on the Nutrition Facts Label.pdf",
            category: "factors",
          },
          {
            source:
              "21 CFR 101.9 (up to date as of 9-29-2025).pdf",
            category: "legal",
          },
        ],
      },
    },
    {
      location: {
        selector: "div.nutrition-facts",
        element_type: "nutrition-facts",
      },
      missing: {
        item: "Potassium",
        severity: "warning",
        message: "Potassium 권장 영양소",
      },
      reference: {
        regulation: "21 CFR 101.9(c)(8)(ii)",
        guidance:
          "Yes, Vitamin D, Calcium, Iron, and Potassium are required to be listed on FDA nutrition labels. According to the FDA regulations, specifically 21 CFR 101.9(c)(8)(ii), the declaration of these vitamins...",
        sources: [
          {
            source: "What's on the Nutrition Facts Label.pdf",
            category: "factors",
          },
          {
            source:
              "21 CFR 101.9 (up to date as of 9-29-2025).pdf",
            category: "legal",
          },
        ],
      },
    },
    {
      location: {
        selector: "div.section",
        element_type: "ingredients-section",
      },
      incorrect: {
        current_value:
          "Purified Water, Sugar Syrup, Carbon Dioxide, Citric Acid, Gum Arabic, Artificial Flavor Orange Flavor, Sucrose, Sucrose Acetate Isobutyrate, Propylene Glycol, Sunset Yellow FCF, Vitamin C, Sucralose.",
        issue: "성분 순서가 무게 순서대로 나열되어야 함",
        severity: "info",
        message: "성분 순서 확인 (12개)",
      },
      reference: {
        regulation: "21 CFR 101.4(a)",
        guidance:
          "Ingredients on FDA labels must be listed in descending order of predominance by weight. This means that the ingredient that weighs the most is listed first, followed by the next heaviest ingredient, a...",
        sources: [
          {
            source: "Food-Labeling-Guide.pdf",
            category: "legal",
          },
          {
            source: "Food-Labeling-Guide.pdf",
            category: "legal",
          },
        ],
      },
    },
    {
      location: {
        selector: "div.section",
        element_type: "ingredients-section",
      },
      missing: {
        item: "Allergen information",
        severity: "info",
        message: "알레르겐 정보 권장",
      },
      reference: {
        regulation: "FALCPA",
        guidance:
          "The FDA allergen labeling requirements are primarily governed by the Food Allergen Labeling and Consumer Protection Act (FALCPA), which mandates specific labeling practices for major food allergens. H...",
        sources: [
          {
            source: "Food-Labeling-Guide.pdf",
            category: "legal",
          },
          {
            source: "Food-Labeling-Guide.pdf",
            category: "legal",
          },
        ],
      },
    },
  ],
};

export function ResultPage({
  uploadedFile,
  onRestart,
  user,
  onMyPage,
  onLogout,
  onAdminPage,
}: ResultPageProps) {
  const [htmlContent, setHtmlContent] =
    useState<string>(INITIAL_HTML);
  const [validationResult] = useState<ValidationResult>(
    MOCK_VALIDATION_RESULT,
  );
  const [selectedErrors, setSelectedErrors] = useState<
    Set<number>
  >(new Set());
  const [highlightedIndex, setHighlightedIndex] = useState<
    number | null
  >(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // 로딩 시뮬레이션
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // iframe 로드 후 편집 이벤트 설정 (드래그 기능 제거)
  useEffect(() => {
    if (!iframeRef.current || isLoading) return;

    const iframe = iframeRef.current;
    const iframeDoc =
      iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // HTML 콘텐츠 설정
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // contenteditable 요소에 대한 입력 이벤트 처리
    setTimeout(() => {
      const editableElements = iframeDoc.querySelectorAll(
        '[contenteditable="true"]',
      );
      editableElements.forEach((element) => {
        element.addEventListener("input", () => {
          const newHtml =
            "<!DOCTYPE html>\\n" +
            iframeDoc.documentElement.outerHTML;
          setHtmlContent(newHtml);
        });
      });
    }, 100);
  }, [htmlContent, isLoading]);

  // 하이라이트 효과 적용
  useEffect(() => {
    if (
      !iframeRef.current ||
      highlightedIndex === null ||
      isLoading
    )
      return;

    const iframe = iframeRef.current;
    const iframeDoc =
      iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // 모든 하이라이트 제거
    const allElements = iframeDoc.querySelectorAll(
      ".highlight-error, .highlight-warning, .highlight-info",
    );
    allElements.forEach((el) => {
      el.classList.remove(
        "highlight-error",
        "highlight-warning",
        "highlight-info",
      );
    });

    // 선택된 에러에 해당하는 요소 하이라이트
    const error = validationResult.errors[highlightedIndex];
    const selector = error.location.selector;
    const severity =
      error.missing?.severity ||
      error.incorrect?.severity ||
      "info";

    const elements = iframeDoc.querySelectorAll(selector);
    elements.forEach((element) => {
      element.classList.add(`highlight-${severity}`);
    });

    // 2초 후 자동으로 하이라이트 제거
    const timer = setTimeout(() => {
      setHighlightedIndex(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [highlightedIndex, validationResult.errors, isLoading]);

  const handleCheckboxChange = (
    index: number,
    checked: boolean,
  ) => {
    const newSelectedErrors = new Set(selectedErrors);
    if (checked) {
      newSelectedErrors.add(index);
    } else {
      newSelectedErrors.delete(index);
    }
    setSelectedErrors(newSelectedErrors);
  };

  const handleDeleteSelected = () => {
    // 실제로는 선택된 에러를 처리하는 로직
    console.log("Delete errors:", Array.from(selectedErrors));
    setSelectedErrors(new Set());
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${validationResult.product_name}_edited.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleValidate = () => {
    setIsValidating(true);
    // 실제 검증 로직을 여기에 추가할 수 있습니다
    setTimeout(() => {
      setIsValidating(false);
      // 검증 결과를 업데이트하거나 새로운 결과를 설정할 수 있습니다
    }, 1000);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="text-red-600" size={18} />;
      case "warning":
        return (
          <AlertTriangle className="text-orange-600" size={18} />
        );
      case "info":
        return <Info className="text-blue-600" size={18} />;
      default:
        return <CheckCircle2 className="text-green-600" size={18} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-orange-200 bg-orange-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4 flex-shrink-0 relative z-50">
        <div className="flex items-center justify-between">
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onRestart}
          >
            <h1 className="mb-0">라벨 번역 서비스</h1>
            <p className="text-xs text-gray-500">{uploadedFile.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadHTML}
            >
              <Download className="mr-2" size={16} />
              HTML 다운로드
            </Button>
            {selectedErrors.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="mr-2" size={16} />
                선택 삭제 ({selectedErrors.size})
              </Button>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <UserCircle className="mr-2" size={16} />
                  {user.name}
                  <ChevronDown className="ml-2" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onMyPage}>
                  마이페이지
                </DropdownMenuItem>
                {user.isAdmin && onAdminPage && (
                  <DropdownMenuItem onClick={onAdminPage}>
                    관리자 페이지
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2" size={14} />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - HTML Preview */}
        <div className="flex-1 border-r bg-white p-6 overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="mb-2">HTML 미리보기</h2>
              <p className="text-sm text-gray-600">
                텍스트를 직접 클릭해서 편집할 수 있습니다
              </p>
            </div>
            <Button
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  검증 중...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2" size={16} />
                  검증하기
                </>
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">라벨 로딩 중...</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <iframe
                ref={iframeRef}
                className="w-full h-[800px] border-0"
                title="Label Preview"
              />
            </div>
          )}
        </div>

        {/* Right - Validation Results */}
        <div className="w-[480px] flex flex-col bg-white">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="mb-1">검증 결과</h2>
                <p className="text-sm text-gray-600">
                  {validationResult.product_name} -{" "}
                  {validationResult.product_type}
                </p>
              </div>
              <Badge
                variant="destructive"
                className="text-lg px-3 py-1"
              >
                {validationResult.total_errors}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 bg-red-50 border-red-200">
                <p className="text-xs text-red-700 mb-1">
                  Error
                </p>
                <p className="text-red-900">
                  {
                    validationResult.errors.filter(
                      (e) =>
                        (e.missing?.severity ||
                          e.incorrect?.severity) === "error",
                    ).length
                  }
                </p>
              </Card>
              <Card className="p-3 bg-orange-50 border-orange-200">
                <p className="text-xs text-orange-700 mb-1">
                  Warning
                </p>
                <p className="text-orange-900">
                  {
                    validationResult.errors.filter(
                      (e) =>
                        (e.missing?.severity ||
                          e.incorrect?.severity) === "warning",
                    ).length
                  }
                </p>
              </Card>
              <Card className="p-3 bg-blue-50 border-blue-200">
                <p className="text-xs text-blue-700 mb-1">
                  Info
                </p>
                <p className="text-blue-900">
                  {
                    validationResult.errors.filter(
                      (e) =>
                        (e.missing?.severity ||
                          e.incorrect?.severity) === "info",
                    ).length
                  }
                </p>
              </Card>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-3">
              {validationResult.errors.map((error, index) => {
                const severity =
                  error.missing?.severity ||
                  error.incorrect?.severity ||
                  "info";
                const message =
                  error.missing?.message ||
                  error.incorrect?.message ||
                  "";
                const item =
                  error.missing?.item ||
                  error.incorrect?.issue ||
                  "";

                return (
                  <Card
                    key={index}
                    className={`p-4 cursor-pointer transition-all ${getSeverityColor(severity)} ${
                      highlightedIndex === index
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    onClick={() =>
                      setHighlightedIndex(
                        highlightedIndex === index
                          ? null
                          : index,
                      )
                    }
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedErrors.has(index)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            index,
                            checked as boolean,
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          {getSeverityIcon(severity)}
                          <div className="flex-1 min-w-0">
                            <h3 className="mb-1 break-words">
                              {item}
                            </h3>
                            <p className="text-sm text-gray-700 break-words">
                              {message}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="mb-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {error.reference.regulation}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 break-words">
                            {error.reference.guidance}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}