import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Gift, Sparkles, Briefcase, Coffee, Check, ArrowRight, Upload, Trash2, Eye, Image as ImageIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { GalleryItem } from '../types';
import { GlowCard } from './ui/spotlight-card';

interface ServicePageProps {
  activeTab: number;
  setActiveTab: (index: number) => void;
  viewMode?: 'service' | 'gallery';
  initialSubCategory?: string;
  onInquire: () => void;
  onAboutClick: () => void;
  onAdminClick: () => void;
  scrollToSection: (id: string) => void;
  galleryItems?: GalleryItem[];
}

const serviceDetails = [
  {
    title: "WEDDING",
    korTitle: "웨딩",
    tagline: "두 사람의 새로운 시작, 드마리스가 가장 아름답게 완성합니다.",
    desc: "인생에서 가장 소중한 약속의 순간. 품격 있는 연회 공간과 정성 어린 프리미엄 다이닝,\n그리고 세심한 서비스가 어우러져 오랫동안 기억될 웨딩을 완성합니다.\n드마리스는 결혼식 그 이상의 감동을 선사합니다.",
    features: [
      { name: "PRIVATE HALL", detail: "품격 있는 공간,\n프라이빗 연회장" },
      { name: "PREMIUM DINING", detail: "최고의 미식,\n라이브 다이닝" },
      { name: "CUSTOM DECORATION", detail: "감각적인 연출,\n맞춤 스타일링" },
      { name: "TOTAL EVENT CARE", detail: "완벽한 진행,\n전담 매니저 케어" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80",
    icon: Heart,
    colorAccent: "#A68A70"
  },
  {
    title: "DOLJANCHI PARTY",
    korTitle: "돌잔치",
    tagline: "우리 아이의 첫번째 특별한 순간, 드마리스가 함께합니다.",
    desc: "한 번뿐인 첫돌.\n가족의 축복과 아이의 첫 번째 추억이 더욱 특별하게 기억될 수 있도록\n품격 있는 공간과 정성 어린 음식, 세심한 돌잔치 서비스로 소중한 하루를 완성해드립니다.",
    bottomDesc: "우리 아이의 첫 번째 특별한 순간, 드마리스가 함께합니다.\n품격 있는 공간과 정성 어린 음식, 그리고 세심한 서비스로 가족 모두가 행복한 돌잔치를 만들어드립니다.",
    features: [
      { name: "PRIVATE PARTY", detail: "단독 돌잔치\n프라이빗 공간에서 편안한 가족행사" },
      { name: "PREMIUM BUFFET", detail: "프리미엄 뷔페\n다양한 메뉴와 라이브 다이닝" },
      { name: "DOL TABLE", detail: "돌상 연출\n감각적인 돌상과 포토존 스타일링" },
      { name: "EVENT CARE", detail: "행사 진행\n전담 매니저의 세심한 케어" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format&fit=crop&q=80",
    icon: Gift,
    colorAccent: "#8C745C"
  },
  {
    title: "LONGEVITY PARTY",
    korTitle: "칠순.팔순",
    tagline: "소중한 오늘, 부모님께 품격 있는 감사의 시간을",
    desc: "부모님의 생신과 칠순·팔순을 더욱 특별하게.\n부천 드마리스는 품격 있는 연회 공간과 프리미엄 뷔페, 세심한 서비스로 가족 모두가 행복한 순간을 만들어드립니다.\n감사와 사랑을 전하는 소중한 하루를 드마리스와 함께하세요.",
    features: [
      { name: "품격 있는 프라이빗 연회 공간", detail: "가족만의 소중한 시간을 더욱 편안하게 보낼 수 있도록\n쾌적하고 품격 있는 연회 공간을 제공합니다." },
      { name: "프리미엄 뷔페 & 계절 특선 요리", detail: "신선한 해산물과 다양한 프리미엄 메뉴, 계절 특선 요리까지\n모든 세대가 만족하는 풍성한 식사를 준비합니다." },
      { name: "전문 연회 매니저의 맞춤 서비스", detail: "예약 상담부터 행사 진행까지, 전문 연회 매니저가 함께하여\n더욱 편안하고 완성도 높은 가족행사를 만들어드립니다." },
      { name: "가족의 추억을 더욱 특별하게", detail: "생신, 칠순·팔순, 가족모임 등 소중한 순간을 오래 기억될 추억으로 남길 수 있도록\n세심하게 준비해드립니다." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop&q=80",
    icon: Sparkles,
    colorAccent: "#9B846D"
  },
  {
    title: "CORPORATE EVENTS",
    korTitle: "기업행사",
    tagline: "기업의 특별한 순간을 더욱 품격 있게",
    desc: "기업 행사부터 송년회, 신년회, 워크숍, 세미나, 단체모임까지,\n부천 드마리스는 넓고 쾌적한 연회 공간과 프리미엄 뷔페, 체계적인 예약 서비스를 통해 성공적인 기업행사를 함께합니다.",
    features: [
      { name: "넓고 쾌적한 연회 공간", detail: "소규모 비즈니스 미팅부터 대규모 단체 연회까지\n인원에 맞춘 다양한 크기의 전용 연회 공간을 제공합니다." },
      { name: "프리미엄 뷔페 다이닝", detail: "신선한 최고급 식재료로 조리하는 라이브 뷔페 요리로\n참석자 모두가 만족하는 비즈니스 만찬을 선사합니다." },
      { name: "편리한 단체 예약 서비스", detail: "기업 전담 매니저가 1:1 맞춤 상담부터 견적 안내,\n세부 일정까지 원스톱으로 지원해드립니다." },
      { name: "다양한 기업행사 가능", detail: "송년회, 신년회, 세미나, 워크숍, 창립기념일 등 기업의 다양한 목적과\n분위기에 맞추어 성공적인 행사를 연출합니다." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
    bottomTitle: "드마리스 프리미엄 기업연회",
    bottomDesc: "기업의 중요한 모임이 더욱 성공적으로 진행될 수 있도록 품격 있는 공간과 프리미엄 뷔페,\n체계적인 예약 서비스를 제공합니다.",
    icon: Briefcase,
    colorAccent: "#7C634E"
  },
  {
    title: "CATERING",
    korTitle: "케이터링",
    tagline: "소규모 모임도, 드마리스의 정성을 그대로 담아드립니다.",
    desc: "집들이, 생일, 가족모임부터 소규모 기업행사와 출장 식사까지.\n부천 드마리스는 최소 10인분부터 정성껏 조리한 음식을 당일 배송하여 더욱 편리하고 맛있는 식사를 제공합니다.",
    features: [
      { name: "최소 10인분부터 주문 가능", detail: "가정 모임부터 소규모 파티까지 10인분 이상부터 부담 없이 맞춤 예약 가능" },
      { name: "당일 조리 · 신선 배송", detail: "행사 당일 셰프가 직접 조리하여 갓 요리한 최상의 신선함과 온도로 당일 배송" },
      { name: "소규모 행사 전문 케이터링", detail: "집들이, 생일, 가족 연회, 기업 출장 식사 등 행사 성격에 맞춘 차별화된 세팅" },
      { name: "드마리스 인기메뉴 그대로", detail: "드마리스 프리미엄 뷔페의 대표 베스트 메뉴들을 엄선하여 그대로 정성껏 전달" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&auto=format&fit=crop&q=80",
    bottomTitle: "드마리스 케이터링 서비스",
    bottomDesc: "소규모 가족모임부터 기업행사까지\n정성껏 준비한 음식을 원하는 장소로 안전하게 배송해드립니다.",
    icon: Coffee,
    colorAccent: "#6B543F"
  },
  {
    title: "BUFFET",
    korTitle: "출장뷔페",
    tagline: "행사의 규모와 장소를 가리지 않는 드마리스 출장뷔페",
    desc: "소규모 행사부터 최대 800명 규모의 대형 행사까지. 야외행사, 체육대회, 기업행사, 성당·교회 행사, 학교 및 기관 행사, 웨딩까지\n드마리스는 풍부한 운영 경험과 체계적인 시스템으로 성공적인 행사를 완성합니다.\n행사 운영에 필요한 사항도 함께 상담하여 보다 편리하게 행사를 준비하실 수 있도록 도와드립니다.",
    bottomTitle: "드마리스 프리미엄 출장뷔페",
    bottomDesc: "수많은 행사 경험으로 검증된 운영 노하우.\n행사 준비부터 음식 제공, 운영까지 드마리스가 함께합니다.",
    features: [
      { name: "최대 800명 규모 출장뷔페 운영", detail: "소규모 행사부터 대형 행사까지, 풍부한 운영 경험을 바탕으로\n규모에 맞는 출장뷔페를 제공합니다." },
      { name: "원스톱 행사 진행 시스템", detail: "행사 준비부터 운영까지 체계적인 시스템으로 행사의 부담을 줄여드립니다." },
      { name: "다양한 행사 전문", detail: "기업행사, 체육대회, 성당·교회 행사, 학교 및 기관 행사, 야외행사, 웨딩 등\n행사 목적에 맞는 출장뷔페를 제공합니다." },
      { name: "풍부한 메뉴 구성과 맞춤 상담", detail: "행사 인원과 예산에 맞춰 다양한 메뉴를 제안해드리며,\n행사 목적에 맞는 최적의 구성을 상담을 통해 안내해드립니다." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80",
    icon: ImageIcon,
    colorAccent: "#8C745C"
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
  ],
  5: [
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
  4: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80",
  5: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
};

const subCategoriesConfig: Record<number, string[]> = {
  0: ["전체", "교회", "야외", "스몰", "고급웨딩홀"],
  1: ["전체", "전통돌상", "현대돌상", "패키지연출"],
  2: ["전체", "전통생신상", "현대생신상", "직계가족예식"],
  3: ["전체", "세미나·포럼", "사은회·시상식", "연말파티"],
  4: ["전체", "핑거푸드", "럭셔리뷔페", "홈파티박스"],
  5: ["전체", "출장뷔페", "뷔페전경", "푸드코너"]
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
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80"
    ],
    "현대돌상": [
      "https://images.unsplash.com/photo-1517263904008-797480d25147?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80"
    ],
    "패키지연출": [
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1481162854517-d9e353af153d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
    ]
  },
  2: { // LONGEVITY PARTY
    "전통생신상": [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80"
    ],
    "현대생신상": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517263904008-797480d25147?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80"
    ],
    "직계가족예식": [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80"
    ]
  },
  3: { // CORPORATE EVENTS
    "세미나·포럼": [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
    ],
    "사은회·시상식": [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80"
    ],
    "연말파티": [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80"
    ]
  },
  4: { // CATERING
    "핑거푸드": [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80"
    ],
    "럭셔리뷔페": [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80"
    ],
    "홈파티박스": [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"
    ]
  },
  5: { // BUFFET
    "출장뷔페": [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"
    ],
    "뷔페전경": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517263904008-797480d25147?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80"
    ],
    "푸드코너": [
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"
    ]
  }
};

const tabToCategoryMap: Record<number, string> = {
  0: 'WEDDING',
  1: 'BIRTHDAY',
  2: 'LONGEVITY',
  3: 'CORPORATE',
  4: 'CATERING',
  5: 'BUFFET'
};

export default function ServicePage({
  activeTab,
  setActiveTab,
  viewMode = 'service',
  initialSubCategory,
  onInquire,
  onAboutClick,
  onAdminClick,
  scrollToSection,
  galleryItems = []
}: ServicePageProps) {
  
  const currentService = serviceDetails[activeTab];
  const IconComponent = currentService?.icon || ImageIcon;

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

  // Dynamic image fetching for category + subcategory (returns directly uploaded photos)
  const images = React.useMemo(() => {
    // Get user-uploaded / registered gallery images for this category
    const catCode = tabToCategoryMap[activeTab];
    const userUploaded = (galleryItems || [])
      .filter(item => item.category === catCode)
      .filter(item => {
        if (activeSubCategory === "전체") return true;
        if (item.subCategory === activeSubCategory) return true;
        const titleLower = item.title.toLowerCase();
        const subLower = activeSubCategory.toLowerCase();
        if (titleLower.includes(subLower)) return true;
        
        // Match words
        const words = subLower.split(/[\s·]/);
        if (words.some(word => word && titleLower.includes(word))) return true;
        
        return false;
      })
      .map(item => item.imageUrl);

    // Return only user-uploaded/registered gallery images
    return userUploaded;
  }, [activeTab, activeSubCategory, galleryItems]);

  const subCategoryLookup = React.useMemo(() => {
    const map = new Map<string, string>();
    (galleryItems || []).forEach(item => {
      if (item.imageUrl && item.subCategory) {
        map.set(item.imageUrl, item.subCategory);
      }
    });
    return map;
  }, [galleryItems]);

  return (
    <div className="w-full bg-[#FAF8F5] text-[#2C2520] flex flex-col font-sans">
      
      {/* Top Services Navigation Menu - Centered Container */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-8 md:pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex flex-col items-center justify-center gap-4 border-b border-[#EFEBE4] pb-6"
        >
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
                <motion.button
                  key={service.title}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(idx)}
                  className={`py-2 px-4.5 sm:py-2.5 sm:px-6 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer shadow-sm border ${
                    isSelected
                      ? 'bg-[#A68A70] border-[#A68A70] text-white font-semibold shadow-md'
                      : 'bg-white border-[#EFEBE4] text-neutral-500 hover:text-[#A68A70] hover:border-[#A68A70]/40'
                  }`}
                >
                  <span>{service.korTitle}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Elegant Subcategory Filter Tabs (Dynamic) */}
          {viewMode === 'gallery' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center mt-5 pt-3 border-t border-[#EFEBE4]/60 w-full max-w-2xl mx-auto"
            >
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
            </motion.div>
          )}

        </motion.div>
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
                  const uploadedSub = subCategoryLookup.get(imgUrl);
                  let subCategoryName = uploadedSub || "";
                  if (!subCategoryName) {
                    const catData = subCategoryImages[activeTab];
                    if (catData) {
                      for (const [subName, list] of Object.entries(catData)) {
                        if (list.includes(imgUrl)) {
                          subCategoryName = subName;
                          break;
                        }
                      }
                    }
                  }
                  if (!subCategoryName) {
                    const subList = subCategoriesConfig[activeTab]?.filter(name => name !== "전체") || [];
                    if (subList.length > 0) {
                      subCategoryName = subList[imgIdx % subList.length];
                    }
                  }

                  return (
                    <GlowCard
                      key={activeTab + "-gallery-" + imgIdx}
                      glowColor="bronze"
                      onClick={() => setLightboxImage(imgUrl)}
                      className="group relative aspect-[4/3] w-full border border-neutral-200/40 shadow-sm cursor-pointer transition-transform duration-200 hover:scale-[1.015] rounded-lg overflow-hidden bg-neutral-100"
                    >
                      <img
                        src={imgUrl}
                        alt={`${currentService.korTitle} 현장 연출 사진`}
                        className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 select-none pointer-events-none"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = categoryFallbacks[activeTab] || DEFAULT_FALLBACK_IMAGE;
                        }}
                      />
                      {/* Black gradient rising instantly on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out pointer-events-none z-10" />
                      
                      {/* Subcategory title text emerging instantly on hover */}
                      {subCategoryName && (
                        <div className="absolute inset-0 p-3 sm:p-4 pb-4 flex flex-col justify-end items-center text-center opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out group-hover:translate-y-0 translate-y-1 pointer-events-none z-20">
                          <span className="font-serif text-[10px] sm:text-[11px] tracking-[0.2em] text-[#D8C2A0] uppercase font-semibold">
                            {currentService.korTitle}
                          </span>
                          <div className="w-5 h-[1px] bg-[#C5A880]/50 my-1" />
                          <span className="font-sans text-xs sm:text-sm md:text-base font-semibold text-white tracking-wide leading-tight drop-shadow-md select-none">
                            {subCategoryName}
                          </span>
                        </div>
                      )}
                    </GlowCard>
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
                  {(() => {
                    const phrases = ['최소 10인분부터', '최대 800명 규모의 대형 행사'];
                    const found = phrases.find(p => currentService.desc.includes(p));
                    if (found) {
                      const parts = currentService.desc.split(found);
                      return parts.reduce<React.ReactNode[]>((acc, part, i) => {
                        acc.push(part);
                        if (i < parts.length - 1) {
                          acc.push(
                            <strong key={i} className="font-bold text-neutral-900">
                              {found}
                            </strong>
                          );
                        }
                        return acc;
                      }, []);
                    }
                    return currentService.desc;
                  })()}
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
                animation: marquee-scroll 300s linear infinite;
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
                    <motion.div
                      key={fIdx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: fIdx * 0.08 }}
                      whileHover={{ y: -3, borderColor: 'rgba(166, 138, 112, 0.4)' }}
                      className="p-5 rounded bg-white border border-[#EFEBE4] shadow-sm flex gap-4 transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#FCFAF7] border border-[#EFEBE4] flex items-center justify-center text-[#A68A70] shrink-0 mt-0.5">
                        <Check size={10} className="stroke-[3px]" />
                      </div>
                      <div className="space-y-1.5">
                        <h5 className="text-xs font-semibold text-neutral-800">{feature.name}</h5>
                        <div className="text-[11px] leading-relaxed">
                          {feature.detail.includes('\n') ? (
                            feature.detail.split('\n').map((line, idx) => (
                              <span
                                key={idx}
                                className="font-normal text-neutral-500 block"
                              >
                                {line}
                              </span>
                            ))
                          ) : (
                            <p className="text-neutral-500">{feature.detail}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="bg-white rounded-sm p-6 md:p-8 border border-[#EFEBE4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center md:text-left">
                  <h5 className="text-sm font-semibold text-neutral-800">
                    {(currentService as any).bottomTitle || `드마리스 프리미엄 ${currentService.korTitle}`}
                  </h5>
                  <p className="text-xs text-neutral-500 whitespace-pre-line">
                    {(currentService as any).bottomDesc || "행사 전문 전담 플래너가 초기 상담부터 행사 마감까지 꼼꼼히 가이드해 드립니다."}
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
              <p>주소: 경기도 부천시 원미구 길주로 71 리파인빌 B/D 3층 드마리스 부천점</p>
              <p>Tel : 032-323-3888 | Fax : 032-323-3888</p>
              <p>사업자등록번호 : 793-81-03151 | 이메일 : ross604@naver.com</p>
            </div>
            
            <div className="text-left md:text-right space-y-1">
              <p>© 2026 DMARIS. ALL RIGHTS RESERVED.</p>
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
