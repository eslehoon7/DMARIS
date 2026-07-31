/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, GalleryItem, Review, Reservation, HeroImage } from '../types';

// High-quality, professional food & venue photos from Unsplash
export const initialMenuItems: MenuItem[] = [
  {
    id: 'm1',
    name: '프리미엄 로스트 비프 스테이크',
    category: 'STEAK',
    description: '최상급 USDA 프라임 등급의 소고기를 저온 슬로우 로스팅하여 육즙이 풍부하고 극상의 부드러움을 자랑하는 시그니처 즉석 스테이크',
    price: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    isPremium: true,
    isAvailable: true
  },
  {
    id: 'm2',
    name: '라이브 양갈비 구이',
    category: 'STEAK',
    description: '어린 양만을 엄선하여 허브와 마늘향으로 마리네이드한 후 그릴에서 즉석으로 구워내는 고소하고 담백한 프리미엄 그릴 요리',
    price: 78000,
    imageUrl: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=800&auto=format&fit=crop&q=80',
    isPremium: true,
    isAvailable: true
  },
  {
    id: 'm3',
    name: '산지직송 제철 모듬 사시미',
    category: 'SUSHI',
    description: '통영, 제주 등 산지에서 매일 아침 직송받은 참돔, 광어, 연어를 전문 셰프가 즉석에서 해체하여 제공하는 극강의 신선함',
    price: 90000,
    imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop&q=80',
    isPremium: true,
    isAvailable: true
  },
  {
    id: 'm4',
    name: '라이브 최고급 참치 스시',
    category: 'SUSHI',
    description: '참다랑어 오토로(대뱃살)와 주토로(중뱃살)를 사용하여 입 안에서 사르르 녹아내리는 일식 마스터 셰프의 고품격 초밥',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&auto=format&fit=crop&q=80',
    isPremium: true,
    isAvailable: true
  },
  {
    id: 'm5',
    name: '정통 북경 오리 (Peking Duck)',
    category: 'CHINESE',
    description: '화덕에서 장시간 구워내 겉은 바삭하고 속은 촉촉한 껍질과 살코기를 셰프가 직접 카빙하여 밀전병과 함께 서빙하는 정통 연회 요리',
    price: 72000,
    imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop&q=80',
    isPremium: false,
    isAvailable: true
  },
  {
    id: 'm6',
    name: '홍소 전복과 송이버섯',
    category: 'CHINESE',
    description: '자연산 전복을 특제 홍소 소스에 졸여 깊고 진한 바다 풍미와 자연 송이의 고급스러운 향이 조화를 이루는 고품격 중화 요리',
    price: 88000,
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=80',
    isPremium: true,
    isAvailable: true
  },
  {
    id: 'm7',
    name: '쇼콜라 마카롱과 수제 타르트',
    category: 'DESSERT',
    description: '프랑스 명품 버터와 초콜릿으로 베이킹한 파티시에의 수제 디저트 셀렉션, 다양한 베리류와 함께 즐기는 달콤함',
    price: 24000,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop&q=80',
    isPremium: false,
    isAvailable: true
  },
  {
    id: 'm8',
    name: '시그니처 벨기에 초콜릿 분수 디저트',
    category: 'DESSERT',
    description: '흐르는 고급 밀크 초콜릿 분수에 신선한 생딸기, 마시멜로, 쿠키를 퐁듀처럼 찍어 먹는 드마리스의 인기 어트랙션 디저트',
    price: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
    isPremium: false,
    isAvailable: true
  },
  {
    id: 'm9',
    name: '전통 궁중 한우 갈비찜',
    category: 'KOREAN',
    description: '최고급 한우를 배즙과 수제 양념에 재워 밤, 대추, 인삼과 함께 정성껏 쪄낸 전통 명절 및 대형 연회 필수 명품 갈비찜',
    price: 60000,
    imageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&auto=format&fit=crop&q=80',
    isPremium: false,
    isAvailable: true
  },
  {
    id: 'm10',
    name: '신선한 영양 신선로',
    category: 'KOREAN',
    description: '궁중 전통 화로에 전, 고기, 해산물, 은이버섯을 담아 따뜻하게 보글보글 끓여 드시는 조선 왕실의 기품 있는 영양 신선로 요리',
    price: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    isPremium: true,
    isAvailable: true
  }
];

export const initialGalleryItems: GalleryItem[] = [
  {
    id: 'g1',
    title: '버진로드 웨딩',
    category: 'WEDDING',
    date: '2026.06',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g2',
    title: '전통 첫돌 돌상',
    category: 'BIRTHDAY',
    date: '2026.06',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g3',
    title: '부모님 칠순잔치',
    category: 'LONGEVITY',
    date: '2026.05',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g4',
    title: '비즈니스 기업행사',
    category: 'CORPORATE',
    date: '2026.05',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g5',
    title: '프리미엄 케이터링',
    category: 'CATERING',
    date: '2026.04',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g6',
    title: '명품 활어 스시',
    category: 'BUFFET',
    date: '2026.04',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g7',
    title: '쇼콜라 디저트',
    category: 'BUFFET',
    date: '2026.03',
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g8',
    title: '럭셔리 뷔페 홀',
    category: 'CORPORATE',
    date: '2026.03',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g9',
    title: '스몰 웨딩 연출',
    category: 'WEDDING',
    date: '2026.02',
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g10',
    title: '현대식 돌상 파티',
    category: 'BIRTHDAY',
    date: '2026.02',
    imageUrl: 'https://images.unsplash.com/photo-1517263904008-797480d25147?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g11',
    title: '팔순 잔치 상차림',
    category: 'LONGEVITY',
    date: '2026.01',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'g12',
    title: '기업 연말 파티',
    category: 'CORPORATE',
    date: '2026.01',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
  }
];

export const initialReviews: Review[] = [
  {
    id: 'r1',
    author: '김현아',
    eventType: '돌잔치',
    content: '아이의 첫 생일, 드마리스 덕분에 잊지 못할 최고의 하루가 됐습니다. 음식 퀄리티가 정말 높아서 오신 친척 어르신분들이 모두 칭찬하셨어요. 공간 연출도 대만족입니다!',
    rating: 5,
    date: '2026년 5월',
    isVerified: true,
    verificationType: 'booking',
    phoneLast4: '3492',
    eventDate: '2026-05-10'
  },
  {
    id: 'r2',
    author: '박정수',
    eventType: '웨딩',
    content: '호텔급 웨딩 홀 못지않은 우아한 생화 장식과 완벽한 서비스였습니다. 특히 스테이크 즉석 구이 코너가 엄청 인기 있었어요. 뷔페 동선도 넓고 쾌적해서 손님분들이 편해하셨습니다.',
    rating: 5,
    date: '2026년 4월',
    isVerified: true,
    verificationType: 'booking',
    phoneLast4: '0188',
    eventDate: '2026-04-18'
  },
  {
    id: 'r3',
    author: '이영희',
    eventType: '기업행사',
    content: '연말 부서 송년회를 드마리스에서 진행했습니다. 스크린과 앰프 시스템이 잘 구비되어 있어서 세미나 진행 후 정말 풍족하고 우아한 식사를 마쳤습니다. 다음 연도 행사도 예약 예정입니다.',
    rating: 5,
    date: '2026년 5월',
    isVerified: true,
    verificationType: 'receipt'
  },
  {
    id: 'r4',
    author: '최진우',
    eventType: '칠순잔치',
    content: '아버님 고희연을 위해 소규모 룸을 대여하여 행사를 가졌습니다. 전용 전통상 스타일링과 가족들과 조용히 맛볼 수 있는 최상급 한우, 활어 사시미 덕에 너무 효도한 날이었습니다. 감사해요!',
    rating: 5,
    date: '2026년 3월',
    isVerified: true,
    verificationType: 'booking',
    phoneLast4: '7721',
    eventDate: '2026-03-22'
  }
];

export const initialReservations: Reservation[] = [
  {
    id: 'res-101',
    eventType: 'WEDDING',
    date: '2026-08-15',
    time: '12:00',
    guests: 150,
    name: '김은지',
    contact: '010-1234-5678',
    notes: '생화 추가 연출 원합니다. 뷔페 프리미엄 스테이크 업그레이드 코스 견적서도 요청드려요.',
    status: 'APPROVED',
    createdAt: '2026-07-06 14:30'
  },
  {
    id: 'res-102',
    eventType: 'BIRTHDAY',
    date: '2026-08-22',
    time: '18:00',
    guests: 50,
    name: '이수민',
    contact: '010-8765-4321',
    notes: '전통 돌상 스타일링 및 돌잡이 사회자 연계 원합니다. 유아용 의자 10대 사전 세팅 부탁드립니다.',
    status: 'PENDING',
    createdAt: '2026-07-07 09:15'
  },
  {
    id: 'res-103',
    eventType: 'CORPORATE',
    date: '2026-09-10',
    time: '11:00',
    guests: 80,
    name: '정지훈 (SK 이노베이션)',
    contact: '010-5555-9999',
    notes: '세미나 진행용 마이크 및 대형 빔 프로젝터, 노트북 연결선 요청드립니다. 회사 법인카드 결제 예정입니다.',
    status: 'PENDING',
    createdAt: '2026-07-07 10:20'
  }
];

export const initialHeroImages: HeroImage[] = [
  {
    id: 'hero-1',
    title: '품격 있는 순간',
    subtitle: '드마리스에서 완성됩니다',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/main%20image%2FKakaoTalk_20260706_124040941_02.jpg?alt=media&token=b893693e-571e-400a-b146-0922d08c7a27',
    createdAt: '2026-07-01'
  },
  {
    id: 'hero-2',
    title: '최고의 마스터 셰프 군단',
    subtitle: '프리미엄 원식재료와 라이브 뷔페 요리',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80',
    createdAt: '2026-07-02'
  },
  {
    id: 'hero-3',
    title: '세상에 단 하나뿐인 연회 공간',
    subtitle: '돌잔치 · 웨딩 · 회갑연 · 기업행사 전문 연회장',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80',
    createdAt: '2026-07-03'
  }
];
