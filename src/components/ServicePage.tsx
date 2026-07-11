import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Gift, Sparkles, Briefcase, Coffee, Check, ArrowRight, Upload, Trash2, Eye, Image as ImageIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface ServicePageProps {
  activeTab: number;
  setActiveTab: (index: number) => void;
  viewMode?: 'service' | 'gallery';
  initialSubCategory?: string;
  onInquire: () => void;
  onAboutClick: () => void;
  onAdminClick: () => void;
  scrollToSection: (id: string) => void;
}

const serviceDetails = [
  {
    title: "WEDDING",
    korTitle: "웨딩",
    tagline: "세상에서 가장 성스럽고 눈부신 약속의 순간",
    desc: "인생 최고의 순간인 결혼식, 드마리스의 프리미엄 웨딩 서비스로 단 하나의 시나리오를 완성합니다. 호텔식 플라워 연출과 커스텀 플라워 길 장식, 최고 수준의 셰프가 즉석에서 요리하는 프리미엄 연회 요리가 함께하여 웅장하면서도 기품 넘치는 순간을 설계해 드립니다.",
    features: [
      { name: "단독 홀 대관 및 연출", detail: "대규모 하객을 여유롭게 수용할 수 있는 웅장하고 품격 있는 단독 대관 연회 홀 지원" },
      { name: "플라워 커스텀 셋업", detail: "전문 플로리스트의 감각으로 섬세하게 연출되는 격조 높은 생화 및 캔들 테마 로드" },
      { name: "특급 호텔식 라이브 뷔페", detail: "드마리스 명품 셰프 군단이 엄선한 제철 식재료로 요리하는 하이엔드 라이브 뷔페 만찬" },
      { name: "미디어 및 음향 하이 테크", detail: "고해상도 빔 프로젝터, 정교한 조명 시어링 및 시네마틱 오디오 음향 장비 완비" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80",
    icon: Heart,
    colorAccent: "#A68A70"
  },
  {
    title: "FIRST BIRTHDAY PARTY",
    korTitle: "첫돌파티",
    tagline: "소중한 우리 아기의 첫 번째 생일, 사랑과 정성을 가득 담아",
    desc: "우리 아기가 처음으로 맞이하는 일생에 단 한 번뿐인 소중한 날, 온 가족이 온전히 기쁨을 나누고 축하에만 전념하실 수 있도록 프라이빗하고 품격 있게 모든 순간을 연출합니다.",
    features: [
      { name: "전통 & 현대 테마 돌상", detail: "풍성하고 화사한 전통 한국식 돌상 차림 또는 감각적이고 세련된 유러피안 모던 돌상 스타일링" },
      { name: "단독 프라이빗 룸 보장", detail: "소중한 직계 가족 및 지인분들과 아늑하고 쾌적하게 식사하실 수 있는 전용 다이닝 룸 배정" },
      { name: "감성 포토 테이블 셋업", detail: "아기의 소중한 추억을 담은 성장 사진 액자 전시 및 감사 카드, 소품 무료 세팅 지원" },
      { name: "돌잡이 사회자 및 진행", detail: "전문 전담 진행 스태프의 세련되고 유쾌한 돌잡이 이벤트 리드와 전체 타임라인 케어" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format&fit=crop&q=80",
    icon: Gift,
    colorAccent: "#8C745C"
  },
  {
    title: "LONGEVITY PARTY",
    korTitle: "칠순.팔순",
    tagline: "부모님의 늘 푸른 건강을 기원하는 기품 있고 효심 어린 생신연",
    desc: "가족을 위해 평생 헌신해 오신 부모님께 감사하는 마음을 담아 존경과 효심을 정성스럽게 올립니다. 어르신들의 기호와 건강을 깊이 배려한 특선 궁중 보양식과 정갈한 연회 분위기를 보장해 드립니다.",
    features: [
      { name: "고품격 전통 생신 상차림", detail: "무병장수를 기원하는 떡과 한과, 오색 과일로 정성껏 채워 올리는 고전미 넘치는 상차림" },
      { name: "어르신 선호 궁중 메뉴", detail: "신선한 전복 요리, 한방 갈비찜, 깊은 국물의 특선 신선로 등 최고급 궁중 특선 보양 요리" },
      { name: "감사 헌정 스크린 연출", detail: "생애 발자취가 담긴 동영상 상영을 위한 대형 스크린 인프라와 캘리그래피 현수막 맞춤 장식" },
      { name: "가족 헌수 의전 케어", detail: "절차와 격식을 온전히 갖춘 가족 헌수식 진행을 세심하게 돕는 전담 지배인 현장 서포트" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop&q=80",
    icon: Sparkles,
    colorAccent: "#9B846D"
  },
  {
    title: "CORPORATE EVENTS",
    korTitle: "기업행사",
    tagline: "브랜드의 격조 높은 가치와 성공적인 비즈니스를 지원하는 완벽 솔루션",
    desc: "대형 연말연시 송년회, 신년회, 심포지엄, 바이어 리셉션, 세미나 등 행사의 성격과 목적에 정확히 조응하는 테이블 구성, 수준 높은 프라이빗 뷔페 다이닝, 무대 테크니컬 어시스턴스를 완비하고 있습니다.",
    features: [
      { name: "커스텀 공간 레이아웃", detail: "기획에 맞추어 강의식, 소모임식, 원형 만찬식 등 최적의 맞춤 테이블 라인 설계" },
      { name: "최신 무대 테크니컬 장비", detail: "강력한 프로 오디오 음향, 고해상도 무선 마이크, 와이드 빔 스크린 및 제어실 서포트" },
      { name: "커스터마이징 뷔페", detail: "비즈니스 품격에 걸맞은 스탠딩 리셉션 핑거푸드부터 명품 그릴 만찬 뷔페까지 다양하게 제안" },
      { name: "일대일 전담 코디네이터", detail: "사전 답사 및 세부 견적 조율부터 행사 당일 마무리 정리까지 밀착 서포트하는 컨설턴트" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
    icon: Briefcase,
    colorAccent: "#7C634E"
  },
  {
    title: "CATERING",
    korTitle: "케이터링",
    tagline: "원하시는 장소 어디든, 드마리스의 특급 명품 미식을 연출합니다",
    desc: "야외 웨딩, 사옥 이전 기념식, 프라이빗 홈 파티, 대규모 체육 행사 등 공간의 한계를 넘어 드마리스 셰프들이 직접 파티 현장으로 출동하여 완벽한 미식 파라다이스를 세팅해 드립니다.",
    features: [
      { name: "마스터 셰프 라이브 키친", detail: "특급 셰프진이 현장에 동행하여 고급 육류 시어링 및 스시 라이브 스테이션 직접 구현" },
      { name: "프리미엄 핫&콜드 푸드 시스템", detail: "갓 요리한 온도로 전하는 최신 핫 컨테이너 및 수시 공급되는 프레시 쿨 시스템 탑재" },
      { name: "유러피안 플라워 플래닝", detail: "푸드 테이블 및 웰컴 존을 파티 컨셉트에 맞춰 화려하게 꾸미는 플라워 및 스타일링 연출" },
      { name: "토탈 올인원 핸들링", detail: "식기 일체 세팅, 유니폼 전문 서버 배치, 종료 후 말끔한 클리닝까지 완벽 처리" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&auto=format&fit=crop&q=80",
    icon: Coffee,
    colorAccent: "#6B543F"
  }
];

const defaultCaseImages: Record<number, string[]> = {
  0: [
    "https://images.unsplash.com/photo-1519225495810-7512c696505a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80"
  ],
  1: [
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517263904008-797480d25147?w=800&auto=format&fit=crop&q=80"
  ],
  2: [
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80"
  ],
  3: [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80"
  ],
  4: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"
  ]
};

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80";

const categoryFallbacks: Record<number, string> = {
  0: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
  1: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80",
  2: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80",
  3: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
  4: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80"
};

const subCategoriesConfig: Record<number, string[]> = {
  0: ["전체", "교회", "야외", "스몰", "고급웨딩홀"],
  1: ["전체", "전통돌상", "현대돌상", "패키지연출"],
  2: ["전체", "전통생신상", "현대생신상", "직계가족예식"],
  3: ["전체", "세미나·포럼", "사은회·시상식", "연말파티"],
  4: ["전체", "핑거푸드", "럭셔리뷔페", "홈파티박스"]
};

const subCategoryImages: Record<number, Record<string, string[]>> = {
  0: { // WEDDING
    "교회": [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1438821408060-27c85853633c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1478812954026-9c750f0e89fc?w=800&auto=format&fit=crop&q=80"
    ],
    "야외": [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519225495810-7512c696505a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80"
    ],
    "스몰": [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80"
    ],
    "고급웨딩홀": [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80"
    ]
  },
  1: { // FIRST BIRTHDAY PARTY
    "전통돌상": [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80"
    ],
    "현대돌상": [
      "https://images.unsplash.com/photo-1517263904008-797480d25147?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80"
    ],
    "패키지연출": [
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1481162854517-d9e353af153d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&auto=format&fit=crop&q=80"
    ]
  },
  2: { // LONGEVITY PARTY
    "전통생신상": [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
    ],
    "현대생신상": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517263904008-797480d25147?w=800&auto=format&fit=crop&q=80"
    ],
    "직계가족예식": [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80"
    ]
  },
  3: { // CORPORATE EVENTS
    "세미나·포럼": [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
    ],
    "사은회·시상식": [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80"
    ],
    "연말파티": [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80"
    ]
  },
  4: { // CATERING
    "핑거푸드": [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80"
    ],
    "럭셔리뷔페": [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
    ],
    "홈파티박스": [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80"
    ]
  }
};

export default function ServicePage({
  activeTab,
  setActiveTab,
  viewMode = 'service',
  initialSubCategory,
  onInquire,
  onAboutClick,
  onAdminClick,
  scrollToSection
}: ServicePageProps) {
  
  const currentService = serviceDetails[activeTab];
  const IconComponent = currentService.icon;

  const [activeSubCategory, setActiveSubCategory] = useState<string>("전체");

  useEffect(() => {
    if (viewMode === 'service') {
      setActiveSubCategory("전체");
    } else if (initialSubCategory) {
      setActiveSubCategory(initialSubCategory);
    } else {
      setActiveSubCategory("전체");
    }
  }, [activeTab, initialSubCategory, viewMode]);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Dynamic image fetching for category + subcategory
  const images = React.useMemo(() => {
    const catData = subCategoryImages[activeTab];
    if (!catData) return [];
    if (activeSubCategory === "전체") {
      const allImgs: string[] = [];
      Object.values(catData).forEach(list => {
        list.forEach(img => {
          if (!allImgs.includes(img)) allImgs.push(img);
        });
      });
      return allImgs;
    }
    return catData[activeSubCategory] || [];
  }, [activeTab, activeSubCategory]);

  return (
    <div className="w-full bg-[#FAF8F5] text-[#2C2520] flex flex-col font-sans">
      
      {/* Top Services Navigation Menu - Centered Container */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-8 md:pt-12">
        <div className="w-full flex flex-col items-center justify-center gap-4 border-b border-[#EFEBE4] pb-6">
          <div className="text-center space-y-1">
            <span className="font-mono text-[9px] tracking-[0.2em] text-[#A68A70] uppercase font-bold">
              Premium Banquet & Services
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-light text-neutral-800">
              인생의 가장 빛나는 순간을 위한 프리미엄 연회 서비스
            </h3>
          </div>

          {/* Elegant Horizontal Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-1">
            {serviceDetails.map((service, idx) => {
              const isSelected = activeTab === idx;
              return (
                <button
                  key={service.title}
                  onClick={() => setActiveTab(idx)}
                  className={`py-2 px-4.5 sm:py-2.5 sm:px-6 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer shadow-sm border ${
                    isSelected
                      ? 'bg-[#A68A70] border-[#A68A70] text-white font-semibold scale-[1.02] shadow-md'
                      : 'bg-white border-[#EFEBE4] text-neutral-500 hover:text-[#A68A70] hover:border-[#A68A70]/40'
                  }`}
                >
                  <span>{service.korTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Elegant Subcategory Filter Tabs (Dynamic) */}
          {viewMode === 'gallery' && (
            <div className="flex flex-col items-center justify-center mt-5 pt-3 border-t border-[#EFEBE4]/60 w-full max-w-2xl mx-auto animate-fade-in">
              <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 mt-1">
                {(subCategoriesConfig[activeTab] || ["전체"]).map((subName, subIdx) => {
                  const isSubSelected = activeSubCategory === subName;
                  return (
                    <React.Fragment key={subName}>
                      {subIdx > 0 && <span className="text-neutral-300 font-light text-xs select-none">|</span>}
                      <button
                        onClick={() => setActiveSubCategory(subName)}
                        className={`text-xs sm:text-[13px] font-sans tracking-wide transition-all duration-200 cursor-pointer ${
                          isSubSelected
                            ? 'text-[#8F765D] font-semibold scale-[1.02]'
                            : 'text-neutral-400 hover:text-[#A68A70]'
                        }`}
                      >
                        {subName}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {viewMode === 'gallery' ? (
        /* ELEGANT PHOTOGRAPHY GALLERY GRID (Perfectly matching image.png) */
        <div className="max-w-7xl w-full mx-auto px-6 py-10 md:py-16 flex-grow flex flex-col justify-between">
          <div className="space-y-12">
            <div className="text-center space-y-2">
              <span className="font-mono text-[9px] tracking-[0.25em] text-[#A68A70] uppercase font-bold">
                Dmaris Premium Gallery
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-light text-neutral-800">
                {currentService.korTitle} 공간 연출 & 스타일링
              </h2>
              <div className="w-10 h-[1px] bg-[#A68A70]/30 mx-auto mt-4" />
            </div>

            {images.length > 0 ? (
              <motion.div 
                key={activeTab + "-" + activeSubCategory}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-2 lg:gap-2"
              >
                {images.map((imgUrl, imgIdx) => {
                  const subCategoryName = (() => {
                    const catData = subCategoryImages[activeTab];
                    if (catData) {
                      const found = Object.entries(catData).find(([_, list]) => list.includes(imgUrl));
                      if (found) return found[0];
                    }
                    const subList = subCategoriesConfig[activeTab]?.filter(name => name !== "전체") || [];
                    if (subList.length > 0) {
                      return subList[imgIdx % subList.length];
                    }
                    return "";
                  })();

                  return (
                    <div
                      key={activeTab + "-gallery-" + imgIdx}
                      onClick={() => setLightboxImage(imgUrl)}
                      className="group relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 border border-neutral-200/40 shadow-sm cursor-zoom-in transition-all duration-300 rounded-sm"
                    >
                      <img
                        src={imgUrl}
                        alt={`${currentService.korTitle} 현장 연출 사진`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] select-none pointer-events-none"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = categoryFallbacks[activeTab] || DEFAULT_FALLBACK_IMAGE;
                        }}
                      />
                      {/* Black gradient rising from bottom on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                      
                      {/* Elegant subcategory text emerging on hover (Center aligned, slightly raised, premium typography with Gold/White pairings) */}
                      {subCategoryName && (
                        <div className="absolute inset-0 p-4 sm:p-5 pb-10 sm:pb-12 flex flex-col justify-end items-center text-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                          <span className="font-serif text-[11px] sm:text-xs tracking-[0.25em] text-[#C5A880] uppercase font-semibold">
                            {currentService.korTitle}
                          </span>
                          <div className="w-6 h-[1px] bg-[#C5A880]/40 my-2" />
                          <span className="font-sans text-sm sm:text-base md:text-[17px] font-semibold text-white tracking-wide leading-tight drop-shadow-sm select-none">
                            {subCategoryName}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="w-full py-24 text-center text-neutral-400 font-serif font-light text-xs">
                해당 카테고리의 갤러리 이미지가 곧 업데이트될 예정입니다.
              </div>
            )}
          </div>

          {/* Simple Premium Gallery CTA */}
          <div className="mt-20 max-w-4xl w-full mx-auto bg-white rounded-sm p-6 md:p-8 border border-[#EFEBE4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h5 className="text-sm font-semibold text-neutral-800">
                마음에 드시는 {currentService.korTitle} 스타일링을 찾으셨나요?
              </h5>
              <p className="text-xs text-neutral-500">
                원하시는 디자인 컨셉을 저장하거나 캡처하여 전달 주시면, 전문 디자이너가 그대로 구현해 드립니다.
              </p>
            </div>

            <button
              onClick={onInquire}
              className="w-full md:w-auto bg-[#A68A70] hover:bg-[#8F765D] text-white text-xs font-sans font-semibold tracking-wider uppercase py-3.5 px-8 rounded transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 group"
            >
              <span>{currentService.korTitle} 견적 및 예약 문의</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* ORIGINAL SERVICE DETAILS LAYOUT */
        <>
          {/* FULL-WIDTH BANNER (Spans complete horizontal width) */}
          <div className="w-full my-8 md:my-12">
            <motion.div
              key={activeTab + "-banner"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-full aspect-[16/7] md:aspect-[21/6] lg:aspect-[32/8] overflow-hidden border-y border-[#EFEBE4]"
            >
              <img
                src={currentService.imageUrl}
                alt={currentService.korTitle}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = categoryFallbacks[activeTab] || DEFAULT_FALLBACK_IMAGE;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-12 lg:left-24 text-white space-y-1">
                <span className="font-mono text-[9px] md:text-xs tracking-widest uppercase opacity-80">
                  {currentService.title} SERVICE
                </span>
                <h2 className="text-xl md:text-3xl font-serif font-light">
                  드마리스 <span className="font-semibold text-brand-bronze">{currentService.korTitle}</span>
                </h2>
              </div>
            </motion.div>
          </div>

          {/* Main Content Details Container */}
          <main className="max-w-5xl w-full mx-auto px-6 pb-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              {/* Title and Tagline */}
              <div className="space-y-4 border-b border-[#EFEBE4] pb-8">
                <div className="flex items-center gap-2 text-[#A68A70]">
                  <IconComponent size={18} />
                  <span className="font-mono text-xs tracking-widest font-semibold">{currentService.title}</span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-serif font-light text-neutral-800 leading-tight">
                  {currentService.tagline}
                </h1>
                
                <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl whitespace-pre-line">
                  {currentService.desc}
                </p>
              </div>
            </motion.div>
          </main>

          {/* FULL-WIDTH EVENT SHOWCASE GALLERY (Stretches edge-to-edge, display-only, auto-scrolling) */}
          <div className="w-full my-8 md:my-14 overflow-hidden relative bg-[#FAF8F5]">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes marquee-scroll {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
              .marquee-track-smooth {
                display: flex;
                width: max-content;
                animation: marquee-scroll 55s linear infinite;
              }
              .marquee-track-smooth:hover {
                animation-play-state: paused;
              }
            `}} />

            {images.length > 0 ? (
              <div className="marquee-container w-full relative py-2">
                {/* Ambient luxury edge fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10 pointer-events-none" />

                <div className="marquee-track-smooth">
                  {/* Duplicate the array to ensure seamless infinite looping */}
                  {[...images, ...images, ...images, ...images].map((imgUrl, imgIdx) => (
                    <div
                      key={activeTab + "-marquee-" + imgIdx}
                      onClick={() => setLightboxImage(imgUrl)}
                      className="relative h-44 md:h-56 lg:h-64 aspect-[16/10] mx-1.5 md:mx-2.5 overflow-hidden rounded-lg bg-neutral-900 border border-[#EFEBE4]/80 cursor-zoom-in group shadow-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-lg hover:border-[#A68A70]/45"
                    >
                      <img
                        src={imgUrl}
                        alt={`${currentService.korTitle} 현장 연출`}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none pointer-events-none"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = categoryFallbacks[activeTab] || DEFAULT_FALLBACK_IMAGE;
                        }}
                      />
                      {/* Luxury hover subtle border highlight overlay */}
                      <div className="absolute inset-0 border border-transparent group-hover:border-[#A68A70]/20 rounded-lg transition-colors duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full py-12 text-center text-neutral-400 font-serif font-light text-xs">
                행사 연출 사례 이미지가 제공되지 않습니다.
              </div>
            )}
          </div>

          {/* Features & Actions Container */}
          <main className="flex-grow max-w-5xl w-full mx-auto px-6 pb-16 md:pb-24">
            <motion.div
              key={activeTab + "-features"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              {/* Simple subpage detailed explanations */}
              <div className="space-y-6">
                <h4 className="text-xs font-mono tracking-widest text-[#A68A70] uppercase font-semibold">
                  Key Benefits & Service Details
                </h4>

                {/* Simple Feature Cards Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentService.features.map((feature, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-5 rounded bg-white border border-[#EFEBE4] shadow-sm flex gap-4 hover:border-[#A68A70]/40 transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#FCFAF7] border border-[#EFEBE4] flex items-center justify-center text-[#A68A70] shrink-0 mt-0.5">
                        <Check size={10} className="stroke-[3px]" />
                      </div>
                      <div className="space-y-1.5">
                        <h5 className="text-xs font-semibold text-neutral-800">{feature.name}</h5>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">{feature.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="bg-white rounded-sm p-6 md:p-8 border border-[#EFEBE4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center md:text-left">
                  <h5 className="text-sm font-semibold text-neutral-800">
                    드마리스 프리미엄 {currentService.korTitle} 연회와 만찬
                  </h5>
                  <p className="text-xs text-neutral-500">
                    행사 전문 전담 플래너가 초기 상담부터 행사 마감까지 꼼꼼히 가이드해 드립니다.
                  </p>
                </div>

                <button
                  onClick={onInquire}
                  className="w-full md:w-auto bg-[#A68A70] hover:bg-[#8F765D] text-white text-xs font-sans font-semibold tracking-wider uppercase py-3.5 px-8 rounded transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 group"
                >
                  <span>{currentService.korTitle} 상세 예약 문의하기</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </motion.div>
          </main>
        </>
      )}

      {/* Footer Branding */}
      <footer className="bg-[#080808] border-t border-neutral-900 py-12 text-gray-500 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-neutral-900 pb-8">
            <div className="text-left">
              <h3 className="text-lg font-serif tracking-widest text-brand-cream">
                DMARIS <span className="text-brand-bronze font-light text-sm tracking-normal">PREMIUM BUFFET</span>
              </h3>
              <p className="text-[10px] tracking-wider text-gray-600 uppercase mt-1">
                The chapter of beautiful memories starts here
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-gray-400">
              <button onClick={onAboutClick} className="hover:text-brand-bronze transition cursor-pointer">회사소개</button>
              <button onClick={() => scrollToSection('services')} className="hover:text-brand-bronze transition cursor-pointer">이용약관</button>
              <button onClick={() => scrollToSection('reserve')} className="hover:text-brand-bronze transition cursor-pointer">개인정보처리방침</button>
              <button onClick={onAdminClick} className="hover:text-brand-bronze transition cursor-pointer text-brand-bronze font-medium">관리자 전용</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-[11px] text-gray-600">
            <div className="space-y-1">
              <p>주소: 경기도 부천시 원미구 신흥로 150 드마리스 타워 3층 | 대표자: 드마리스 부천 지점 관리 위원회</p>
              <p>사업자등록번호: 120-12-34567 | 전화번호: 010-8078-4597 | 이메일: dmarisbnc.co.kr</p>
            </div>
            
            <div className="text-left md:text-right space-y-1">
              <p>© 2026 DMARIS BUCHEON. ALL RIGHTS RESERVED.</p>
              <p className="text-[9px] text-gray-700">All photographs are simulated representative graphics of premium culinary arts.</p>
            </div>
          </div>

        </div>
      </footer>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 transition rounded-full hover:bg-white/10"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={lightboxImage}
              alt="사례 이미지 크게 보기"
              className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.currentTarget.src = categoryFallbacks[activeTab] || DEFAULT_FALLBACK_IMAGE;
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
