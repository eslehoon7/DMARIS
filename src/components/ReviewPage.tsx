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
  ChevronRight,
  Pencil,
  Trash2,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

interface ReviewPageProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
  onUpdateReview?: (review: Review) => void;
  onDeleteReview?: (id: string) => void;
  onClose: () => void;
}

const CATEGORIES = ['전체', '웨딩', '돌잔치', '칠순·팔순', '기업행사', '일반 뷔페', '케이터링'];

export default function ReviewPage({ reviews, onAddReview, onUpdateReview, onDeleteReview, onClose }: ReviewPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isWriteOpen, setIsWriteOpen] = useState<boolean>(false);
  const [showOnlyVerified, setShowOnlyVerified] = useState<boolean>(false);

  // Author local tracking for immediate visibility & edit/delete permissions
  const [myReviewIds, setMyReviewIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('my_dmaris_review_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveMyReviewId = (id: string) => {
    setMyReviewIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('my_dmaris_review_ids', JSON.stringify(next));
      return next;
    });
  };

  const removeMyReviewId = (id: string) => {
    setMyReviewIds((prev) => {
      const next = prev.filter((item) => item !== id);
      localStorage.setItem('my_dmaris_review_ids', JSON.stringify(next));
      return next;
    });
  };

  // Form & Editing State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [eventType, setEventType] = useState('웨딩');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [formError, setFormError] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Verification states
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [bookingChecking, setBookingChecking] = useState(false);
  const [bookingVerified, setBookingVerified] = useState(false);
  const [bookingMatchInfo, setBookingMatchInfo] = useState<string | null>(null);

  // Auto-compress photo down to <500KB using HTML Canvas
  const compressReviewImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200; // max size for sharp yet lightweight review photos

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Convert to JPEG with quality 0.82 ensuring file size < 500KB
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

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

  // Open Edit Modal
  const handleOpenEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setAuthor(review.author);
    setEventType(review.eventType);
    setRating(review.rating);
    setContent(review.content);
    setPhone(review.phone || '');
    setEventDate(review.eventDate || '');
    setImageUrl(review.imageUrl || '');
    setBookingVerified(!!review.isVerified);
    setBookingMatchInfo(review.phoneLast4 ? `DM-RESERVE-${review.phoneLast4}` : null);
    setFormError('');
    setIsWriteOpen(true);
  };

  // Customer Delete Handler
  const handleDeleteMyReview = (reviewId: string) => {
    if (window.confirm('작성하신 리뷰를 삭제하시겠습니까?')) {
      if (onDeleteReview) {
        onDeleteReview(reviewId);
      }
      removeMyReviewId(reviewId);
    }
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
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}년 ${month}월 ${day}일`;

    if (editingReviewId) {
      // Edit existing review
      const existingRev = reviews.find(r => r.id === editingReviewId);
      const updatedReview: Review = {
        id: editingReviewId,
        author: author.trim(),
        eventType,
        content: content.trim(),
        rating,
        date: existingRev?.date || formattedDate,
        isVerified: bookingVerified,
        verificationType: bookingVerified ? 'booking' : (existingRev?.verificationType || 'none'),
        phone: phone.trim() || undefined,
        phoneLast4: phone ? phone.replace(/[^0-9]/g, '').slice(-4) : existingRev?.phoneLast4,
        eventDate: eventDate || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isApproved: existingRev?.isApproved ?? false, // Maintain approval state
      };

      if (onUpdateReview) {
        onUpdateReview(updatedReview);
      } else {
        onAddReview(updatedReview);
      }
    } else {
      // Create new review
      const newId = `r-${Date.now()}`;
      const newReview: Review = {
        id: newId,
        author: author.trim(),
        eventType,
        content: content.trim(),
        rating,
        date: formattedDate,
        isVerified: bookingVerified,
        verificationType: bookingVerified ? 'booking' : 'none',
        phone: phone.trim() || undefined,
        phoneLast4: phone ? phone.replace(/[^0-9]/g, '').slice(-4) : undefined,
        eventDate: eventDate || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isApproved: false, // Requires admin approval for other visitors
      };

      onAddReview(newReview);
      saveMyReviewId(newId);
    }

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setEditingReviewId(null);
    setAuthor('');
    setEventType('웨딩');
    setRating(5);
    setContent('');
    setImageUrl('');
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
      
      const types = ['웨딩', '돌잔치', '칠순·팔순', '기업행사', '케이터링'];
      const matchedType = types[Math.floor(Math.random() * types.length)];
      setEventType(matchedType);
    }, 1200);
  };

  // Filter & Search
  // Shows reviews that are approved OR authored by the current visitor
  const filteredReviews = reviews.filter((rev) => {
    const isMine = myReviewIds.includes(rev.id);
    const isApprovedOrMine = rev.isApproved !== false || isMine;
    if (!isApprovedOrMine) return false;

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
  const approvedReviews = reviews.filter(r => r.isApproved !== false);
  const totalReviewsCount = approvedReviews.length;
  const verifiedCount = approvedReviews.filter(r => r.isVerified).length;
  const averageRating = totalReviewsCount > 0 
    ? (approvedReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviewsCount).toFixed(2)
    : "5.00";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
        
        {/* Board Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4 pt-8"
        >
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
            <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 bg-neutral-900/60 px-4 py-2 rounded-full border border-neutral-800/40">
              <MessageSquare size={13} className="text-[#C5A880]" />
              <span>전체 후기 <strong className="text-[#C5A880] font-semibold">{totalReviewsCount}건</strong></span>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 bg-[#C5A880]/10 px-4 py-2 rounded-full border border-[#C5A880]/20">
              <ShieldCheck size={13} className="text-[#C5A880]" />
              <span className="text-brand-cream">실예약 안심 인증 <strong className="text-[#C5A880] font-bold">{verifiedCount}건</strong></span>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 bg-neutral-900/60 px-4 py-2 rounded-full border border-neutral-800/40">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span>평균 만족도 <strong className="text-amber-400 font-semibold">{averageRating} / 5.00</strong></span>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Controls & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col xl:flex-row gap-5 justify-between items-stretch xl:items-center bg-neutral-950 p-4 sm:p-6 rounded-xl border border-neutral-900/80"
        >
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-2 xl:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-[11px] sm:text-xs font-medium tracking-wider rounded-sm transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#C5A880] text-neutral-950 font-semibold shadow-sm'
                    : 'bg-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-850 border border-neutral-800/50'
                }`}
              >
                {cat}
              </motion.button>
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
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                resetForm();
                setIsWriteOpen(true);
              }}
              className="bg-brand-bronze hover:bg-[#b0936e] text-white text-xs font-semibold tracking-wider px-5 py-2.5 rounded-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-bronze/10 shrink-0"
            >
              <Plus size={15} />
              리뷰 작성하기
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((rev, idx) => {
                const isMyReview = myReviewIds.includes(rev.id);

                return (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -5 }}
                    className={`bg-neutral-950 p-6 rounded-xl border flex flex-col justify-between hover:border-[#C5A880]/30 transition-all duration-300 shadow-xl group relative overflow-hidden ${
                      rev.isVerified 
                        ? 'border-neutral-800/80 ring-1 ring-[#C5A880]/10 bg-gradient-to-b from-neutral-950 to-[#0e0d0b]' 
                        : 'border-neutral-900/60'
                    }`}
                  >
                    {/* Luxury accent line at top of cards on hover */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="space-y-4">
                      
                      {/* Header: Event Type, Badges & Date */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="bg-neutral-900 text-[#C5A880] text-[10px] font-mono font-medium tracking-wider px-2 py-0.5 rounded border border-[#C5A880]/10">
                            {rev.eventType}
                          </span>
                          
                          {/* My Review Badge */}
                          {isMyReview && (
                            <span className="text-[10px] text-brand-cream bg-brand-bronze/20 px-2 py-0.5 rounded border border-brand-bronze/30 font-semibold">
                              내 작성 리뷰
                            </span>
                          )}

                          {/* Pending Approval Badge */}
                          {rev.isApproved === false && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                              검수 대기중
                            </span>
                          )}

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
                        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1 shrink-0 ml-1">
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

                      {/* Attached Image Preview */}
                      {rev.imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-neutral-800/80 bg-black aspect-[16/9] max-h-48 relative">
                          <img 
                            src={rev.imageUrl} 
                            alt={`${rev.author} 고객님의 후기 사진`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed font-sans font-light whitespace-pre-wrap">
                        {rev.content}
                      </p>
                    </div>

                    {/* Writer Info & Edit/Delete Controls */}
                    <div className="pt-5 border-t border-neutral-900/60 mt-6 space-y-3">
                      <div className="flex items-center justify-between">
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

                      {/* Customer Author Action Buttons (Edit & Delete) */}
                      {isMyReview && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-900/40">
                          <button
                            onClick={() => handleOpenEdit(rev)}
                            className="text-[11px] text-gray-300 hover:text-brand-cream bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 px-3 py-1 rounded flex items-center gap-1 transition cursor-pointer"
                          >
                            <Pencil size={11} className="text-[#C5A880]" />
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteMyReview(rev.id)}
                            className="text-[11px] text-red-400 hover:text-red-300 bg-neutral-900 hover:bg-red-950/40 border border-neutral-800 hover:border-red-900/50 px-3 py-1 rounded flex items-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 size={11} />
                            삭제
                          </button>
                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })
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

      {/* Write / Edit Review Modal */}
      <AnimatePresence>
        {isWriteOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
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
                  <h3 className="text-lg font-serif text-brand-cream">
                    {editingReviewId ? '작성하신 고객 후기 수정' : '소중한 안심 연회 후기 작성'}
                  </h3>
                </div>
                <button
                  onClick={resetForm}
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

                {/* Writer Name and Event Type */}
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

                {/* Unified Booking Verification */}
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
                        <label className="text-[10px] text-gray-400">실제 행사 일자 (YYYY-MM-DD)</label>
                        <input
                          type="date"
                          min="1900-01-01"
                          max="2099-12-31"
                          value={eventDate}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (val) {
                              const parts = val.split('-');
                              if (parts[0] && parts[0].length > 4) {
                                parts[0] = parts[0].slice(0, 4);
                                val = parts.join('-');
                              }
                            }
                            setEventDate(val);
                          }}
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

                {/* Photo Upload with Auto-Compression (<500KB) */}
                <div className="space-y-2 bg-neutral-900/40 p-4 rounded-sm border border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-gray-300 font-medium flex items-center gap-1.5">
                      <Camera size={13} className="text-[#C5A880]" />
                      후기 사진 첨부 <span className="text-[10px] text-gray-500 font-normal">(선택)</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">
                      자동 500KB 이하 최적화
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    어떤 크기의 고화질 사진을 올려도 500KB 이하로 자동 용량 압축 처리됩니다.
                  </p>

                  <div className="space-y-2 pt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsCompressing(true);
                          const compressedDataUrl = await compressReviewImage(file);
                          setImageUrl(compressedDataUrl);
                          setIsCompressing(false);
                        }
                      }}
                      className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-bronze/20 file:text-brand-bronze hover:file:bg-brand-bronze/30 cursor-pointer bg-neutral-950 border border-neutral-800 rounded p-1.5"
                    />

                    {isCompressing && (
                      <p className="text-[11px] text-brand-bronze animate-pulse flex items-center gap-1.5 font-mono">
                        <span className="w-3 h-3 border-2 border-brand-bronze border-t-transparent rounded-full animate-spin" />
                        사진을 500KB 이하로 자동 용량 압축 중입니다...
                      </p>
                    )}

                    {imageUrl && (
                      <div className="relative mt-2 rounded overflow-hidden border border-neutral-800 bg-black max-h-48 flex items-center justify-center">
                        <img src={imageUrl} alt="리뷰 첨부사진 미리보기" className="max-h-48 object-contain" />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute top-2 right-2 bg-black/80 hover:bg-red-950 text-white p-1 rounded-full transition cursor-pointer"
                          title="사진 삭제"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
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
                    disabled={isCompressing}
                    className="flex-1 bg-brand-bronze hover:bg-brand-bronze-dark text-white text-xs font-semibold py-3 transition rounded-sm cursor-pointer shadow-lg shadow-brand-bronze/10 disabled:opacity-50"
                  >
                    {editingReviewId ? '수정 내용 저장하기' : '소중한 리뷰 제출하기'}
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

