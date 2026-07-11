import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Review } from '../types';
import { 
  Star, 
  MessageSquare, 
  Plus, 
  X, 
  Search, 
  Calendar, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Upload, 
  Sparkles, 
  HelpCircle,
  Smartphone,
  ChevronRight
} from 'lucide-react';

interface ReviewPageProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
  onClose: () => void;
}

const CATEGORIES = ['전체', '웨딩', '돌잔치', '칠순·팔순', '기업행사', '일반 뷔페', '케이터링'];

export default function ReviewPage({ reviews, onAddReview, onClose }: ReviewPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isWriteOpen, setIsWriteOpen] = useState<boolean>(false);
  const [showOnlyVerified, setShowOnlyVerified] = useState<boolean>(false);

  // Form State
  const [author, setAuthor] = useState('');
  const [eventType, setEventType] = useState('웨딩');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Verification states - Unified Booking verification using mobile phone
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [bookingChecking, setBookingChecking] = useState(false);
  const [bookingVerified, setBookingVerified] = useState(false);
  const [bookingMatchInfo, setBookingMatchInfo] = useState<string | null>(null);

  // Phone number formatter (010-1234-5678)
  const formatPhoneNumber = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length <= 3) return clean;
    if (clean.length <= 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setFormError('작성자 이름을 입력해주세요.');
      return;
    }
    if (!content.trim() || content.length < 10) {
      setFormError('리뷰 내용을 최소 10자 이상 작성해주세요.');
      return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;

    const newReview: Review = {
      id: `r-${Date.now()}`,
      author: author.trim(),
      eventType,
      content: content.trim(),
      rating,
      date: formattedDate,
      isVerified: bookingVerified,
      verificationType: bookingVerified ? 'booking' : 'none',
      phone: phone.trim() || undefined,
      eventDate: eventDate || undefined,
    };

    onAddReview(newReview);

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setAuthor('');
    setEventType('웨딩');
    setRating(5);
    setContent('');
    setFormError('');
    setIsWriteOpen(false);
    setPhone('');
    setEventDate('');
    setBookingVerified(false);
    setBookingChecking(false);
    setBookingMatchInfo(null);
  };

  // Mock lookup for booking verification using full phone number
  const handleCheckBooking = () => {
    if (!author.trim()) {
      setFormError('예약자명을 먼저 입력해주세요.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setFormError('올바른 휴대폰 번호 10-11자리를 입력해주세요 (예: 010-1234-5678).');
      return;
    }
    if (!eventDate) {
      setFormError('행사 일자 년월을 선택해 주세요.');
      return;
    }

    setFormError('');
    setBookingChecking(true);

    setTimeout(() => {
      setBookingChecking(false);
      setBookingVerified(true);
      const last4 = cleanPhone.slice(-4);
      setBookingMatchInfo(`DM-RESERVE-${last4}`);
      
      // Auto assign matched event type based on selection
      const types = ['웨딩', '돌잔치', '칠순·팔순', '기업행사', '케이터링'];
      const matchedType = types[Math.floor(Math.random() * types.length)];
      setEventType(matchedType);
    }, 1200);
  };

  // Filter & Search
  const filteredReviews = reviews.filter((rev) => {
    const matchesCategory =
      selectedCategory === '전체' ||
      rev.eventType === selectedCategory ||
      (selectedCategory === '칠순·팔순' && (rev.eventType.includes('칠순') || rev.eventType.includes('팔순') || rev.eventType.includes('고희')));
    
    const matchesSearch =
      rev.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.eventType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVerifiedOnly = !showOnlyVerified || rev.isVerified;

    return matchesCategory && matchesSearch && matchesVerifiedOnly;
  });

  // Stats calculation
  const totalReviewsCount = reviews.length;
  const verifiedCount = reviews.filter(r => r.isVerified).length;
  const averageRating = totalReviewsCount > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviewsCount).toFixed(2)
    : "5.00";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
        
        {/* Board Header Section */}
        <div className="text-center space-y-4 pt-8">
          <span className="font-mono text-xs tracking-[0.3em] text-[#C5A880] uppercase flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-[#C5A880]" />
            DMARIS TRUST REVIEWS
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-brand-cream tracking-wide">
            드마리스 안심 고객 후기
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
            드마리스는 번거로운 회원가입 대신 <strong className="text-brand-cream">실제 예약 매칭</strong> 및 <strong className="text-brand-cream">영수증 인증 시스템</strong>을 활용하여, 
            가짜 후기 없는 100% 투명하고 신뢰도 높은 자필 리뷰만을 약속드립니다.
          </p>
          
          <div className="pt-4 flex flex-wrap justify-center items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2 bg-neutral-900/60 px-4 py-2 rounded-full border border-neutral-800/40">
              <MessageSquare size={13} className="text-[#C5A880]" />
              <span>전체 후기 <strong className="text-[#C5A880] font-semibold">{totalReviewsCount}건</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-[#C5A880]/10 px-4 py-2 rounded-full border border-[#C5A880]/20">
              <ShieldCheck size={13} className="text-[#C5A880]" />
              <span className="text-brand-cream">실예약 안심 인증 <strong className="text-[#C5A880] font-bold">{verifiedCount}건</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/60 px-4 py-2 rounded-full border border-neutral-800/40">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span>평균 만족도 <strong className="text-amber-400 font-semibold">{averageRating} / 5.00</strong></span>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-col xl:flex-row gap-5 justify-between items-stretch xl:items-center bg-neutral-950 p-4 sm:p-6 rounded-xl border border-neutral-900/80">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-2 xl:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-[11px] sm:text-xs font-medium tracking-wider rounded-sm transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#C5A880] text-neutral-950 font-semibold shadow-sm'
                    : 'bg-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-850 border border-neutral-800/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Verification Filter & Search & Write */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="작성자, 행사 내용 검색..."
                className="w-full bg-neutral-900 text-xs text-gray-300 placeholder-gray-500 pl-9 pr-4 py-2.5 rounded-sm border border-neutral-800/80 focus:outline-none focus:border-[#C5A880]/50 transition-colors"
              />
            </div>

            {/* Write Button */}
            <button
              onClick={() => setIsWriteOpen(true)}
              className="bg-brand-bronze hover:bg-[#b0936e] text-white text-xs font-semibold tracking-wider px-5 py-2.5 rounded-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-bronze/10 shrink-0"
            >
              <Plus size={15} />
              리뷰 작성하기
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((rev, idx) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
                  className={`bg-neutral-950 p-6 rounded-xl border flex flex-col justify-between hover:border-[#C5A880]/30 transition-all duration-300 shadow-xl group relative overflow-hidden ${
                    rev.isVerified 
                      ? 'border-neutral-800/80 ring-1 ring-[#C5A880]/10 bg-gradient-to-b from-neutral-950 to-[#0e0d0b]' 
                      : 'border-neutral-900/60'
                  }`}
                >
                  {/* Luxury accent line at top of cards on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="space-y-4">
                    
                    {/* Header: Event Type & Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-neutral-900 text-[#C5A880] text-[10px] font-mono font-medium tracking-wider px-2 py-0.5 rounded border border-[#C5A880]/10">
                          {rev.eventType}
                        </span>
                        
                        {/* Verified Badges */}
                        {rev.isVerified && rev.verificationType === 'booking' && (
                          <span className="text-[10px] text-amber-400 font-semibold tracking-wide flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <ShieldCheck size={11} className="fill-amber-400/20 text-amber-400" />
                            예약 인증
                          </span>
                        )}
                        {rev.isVerified && rev.verificationType === 'receipt' && (
                          <span className="text-[10px] text-teal-400 font-semibold tracking-wide flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                            <FileText size={11} className="text-teal-400" />
                            영수증 인증
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                        <Calendar size={10} />
                        {rev.date}
                      </span>
                    </div>

                    {/* Star Ratings */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={11} 
                          className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-neutral-800"} 
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed font-sans font-light whitespace-pre-wrap">
                      {rev.content}
                    </p>
                  </div>

                  {/* Writer Info */}
                  <div className="pt-5 border-t border-neutral-900/60 mt-6 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-serif text-brand-cream tracking-wide">
                        {rev.author} <span className="text-gray-500 font-sans text-[11px] font-light">고객님</span>
                      </span>
                      {rev.isVerified && rev.verificationType === 'booking' && rev.eventDate && (
                        <span className="text-[9px] text-gray-500 font-mono mt-0.5">
                          실행 행사일: {rev.eventDate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-gray-500 tracking-wider font-mono">
                      {rev.isVerified ? (
                        <span className="text-[#C5A880] flex items-center gap-0.5 font-semibold">
                          <CheckCircle2 size={9} /> DMARIS CERTIFIED
                        </span>
                      ) : (
                        <span>STANDARD REVIEW</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center text-neutral-500 space-y-3 bg-neutral-950 rounded-xl border border-neutral-900">
                <p className="font-serif font-light text-sm text-gray-400">등록된 후기가 없습니다.</p>
                <p className="text-xs text-gray-600">안심 고객 인증으로 진실된 첫 리뷰의 주인공이 되어보세요.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Go back button at bottom */}
        <div className="text-center pt-8">
          <button
            onClick={onClose}
            className="border border-neutral-850 text-gray-400 hover:text-white hover:border-gray-600 px-6 py-2.5 text-xs font-medium tracking-widest uppercase transition duration-300 cursor-pointer rounded-sm"
          >
            메인페이지로 돌아가기
          </button>
        </div>

      </div>

      {/* Write Review Modal with Security Verification Tabs */}
      <AnimatePresence>
        {isWriteOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWriteOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-xl bg-neutral-950 rounded-xl border border-neutral-800 shadow-2xl overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-900 flex items-center justify-between bg-neutral-950">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-[0.2em] text-[#C5A880] uppercase flex items-center gap-1">
                    <ShieldCheck size={11} className="text-[#C5A880]" />
                    DMARIS SECURITY VERIFICATION SYSTEM
                  </span>
                  <h3 className="text-lg font-serif text-brand-cream">소중한 안심 연회 후기 작성</h3>
                </div>
                <button
                  onClick={() => setIsWriteOpen(false)}
                  className="text-gray-500 hover:text-white transition p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto scrollbar-thin">
                
                {formError && (
                  <div className="bg-red-950/40 text-red-400 border border-red-900/30 text-[11px] p-3 rounded-sm leading-relaxed">
                    {formError}
                  </div>
                )}

                {/* Writer Name and Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-gray-400 font-medium tracking-wide">작성자 성함</label>
                    <input
                      type="text"
                      placeholder="예시: 홍길동"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-neutral-900 text-xs text-gray-300 placeholder-gray-600 px-3 py-2.5 rounded-sm border border-neutral-800/80 focus:outline-none focus:border-[#C5A880]/50 transition-colors"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-gray-400 font-medium tracking-wide">연회 종류</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      disabled={bookingVerified}
                      className="w-full bg-neutral-900 text-xs text-gray-300 px-3 py-2.5 rounded-sm border border-neutral-800/80 focus:outline-none focus:border-[#C5A880]/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="웨딩">웨딩</option>
                      <option value="돌잔치">돌잔치</option>
                      <option value="칠순·팔순">칠순·팔순</option>
                      <option value="기업행사">기업행사</option>
                      <option value="케이터링">케이터링</option>
                      <option value="일반 뷔페">일반 뷔페</option>
                    </select>
                  </div>
                </div>

                {/* Unified Booking Verification - Selected elements removed per user intent */}
                <div className="space-y-3 bg-neutral-900/50 p-4 rounded-sm border border-neutral-800/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] text-[#C5A880] font-semibold tracking-wide uppercase flex items-center gap-1">
                      실예약 안심 인증 <span className="text-[9px] text-gray-500 font-normal font-sans">(선택 사항)</span>
                    </label>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                      안심 매칭 100% 보장
                    </span>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed">
                    드마리스 예약 정보(휴대폰 번호 및 행사일)와 매칭하여 실고객 안심 마크를 획득하세요.
                  </p>

                  {!bookingVerified ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">휴대폰 번호 입력</label>
                        <input
                          type="tel"
                          placeholder="010-1234-5678"
                          value={phone}
                          onChange={handlePhoneChange}
                          className="w-full bg-neutral-950 text-xs text-gray-300 placeholder-gray-700 px-3 py-2.5 rounded-sm border border-neutral-800 focus:outline-none focus:border-[#C5A880]/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">실제 행사 년월</label>
                        <input
                          type="month"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full bg-neutral-950 text-xs text-[#C5A880] px-3 py-2.5 rounded-sm border border-neutral-800 focus:outline-none focus:border-[#C5A880]/50"
                        />
                      </div>
                      <div className="sm:col-span-2 pt-2">
                        <button
                          type="button"
                          onClick={handleCheckBooking}
                          disabled={bookingChecking}
                          className="w-full bg-[#C5A880]/15 hover:bg-[#C5A880]/30 border border-[#C5A880]/40 text-[#C5A880] text-[11px] font-semibold py-2.5 rounded-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {bookingChecking ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
                              드마리스 실시간 예약 데이터베이스 조회 중...
                            </>
                          ) : (
                            <>
                              <Search size={12} />
                              예약 내역 조회 및 실시간 매칭하기
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-sm flex items-start gap-2.5"
                    >
                      <ShieldCheck className="text-amber-400 fill-amber-400/10 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-xs font-semibold text-amber-400">드마리스 예약고객 인증 완료</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          성함: {author} | 연동번호: <span className="font-mono">{bookingMatchInfo}</span> | 행사 종류 자동 반영 완료!
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Star Rating Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-gray-400 font-medium tracking-wide">만족도 별점</label>
                  <div className="flex items-center gap-1.5 bg-neutral-900 px-4 py-3 rounded-sm border border-neutral-800/80">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(null)}
                          className="text-amber-400 p-0.5 focus:outline-none transition-transform active:scale-95 cursor-pointer"
                        >
                          <Star
                            size={18}
                            className={
                              star <= (hoveredStar ?? rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-850"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400 ml-2 font-medium">
                      {rating === 5 && '아주 만족스러워요 (5점)'}
                      {rating === 4 && '만족스러워요 (4점)'}
                      {rating === 3 && '보통이에요 (3점)'}
                      {rating === 2 && '조금 아쉬워요 (2점)'}
                      {rating === 1 && '개선이 필요해요 (1점)'}
                    </span>
                  </div>
                </div>

                {/* Content Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-gray-400 font-medium tracking-wide">리뷰 내용</label>
                  <textarea
                    placeholder="드마리스에서 누린 우아한 시간과 셰프의 격조 높은 요리에 대해 자유롭게 적어주세요. (최소 10자 이상)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="w-full bg-neutral-900 text-xs text-gray-300 placeholder-gray-600 p-3 rounded-sm border border-neutral-800/80 focus:outline-none focus:border-[#C5A880]/50 transition-colors resize-none leading-relaxed"
                    maxLength={500}
                  />
                  <div className="text-right text-[10px] text-gray-500 font-mono">
                    {content.length} / 500자
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-gray-400 hover:text-white text-xs font-semibold py-3 border border-neutral-800/80 transition rounded-sm cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-bronze hover:bg-brand-bronze-dark text-white text-xs font-semibold py-3 transition rounded-sm cursor-pointer shadow-lg shadow-brand-bronze/10"
                  >
                    소중한 리뷰 제출하기
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
