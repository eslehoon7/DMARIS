/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Reservation, MenuItem, GalleryItem, Review } from '../types';
import { Lock, User, FileText, Plus, LogOut, Check, X, Trash2, Camera, Tag, List, DollarSign, Image as ImageIcon, Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface AdminPanelProps {
  reservations: Reservation[];
  menuItems: MenuItem[];
  galleryItems: GalleryItem[];
  reviews: Review[];
  onUpdateReservations: (resList: Reservation[]) => void;
  onUpdateMenuItems: (menuList: MenuItem[]) => void;
  onUpdateGalleryItems: (galleryList: GalleryItem[]) => void;
  onUpdateReviews: (reviewList: Review[]) => void;
  onDeleteReservation?: (id: string) => void;
  onDeleteMenuItem?: (id: string) => void;
  onDeleteGalleryItem?: (id: string) => void;
  onDeleteReview?: (id: string) => void;
  onClose: () => void;
}

export default function AdminPanel({
  reservations,
  menuItems,
  galleryItems,
  reviews,
  onUpdateReservations,
  onUpdateMenuItems,
  onUpdateGalleryItems,
  onUpdateReviews,
  onDeleteReservation,
  onDeleteMenuItem,
  onDeleteGalleryItem,
  onDeleteReview,
  onClose
}: AdminPanelProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'menu' | 'gallery' | 'reviews'>('bookings');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: 'booking' | 'menu' | 'gallery' | 'review';
    message: string;
  } | null>(null);

  // Forms State
  const [menuName, setMenuName] = useState('');
  const [menuCat, setMenuCat] = useState<'STEAK' | 'SUSHI' | 'CHINESE' | 'DESSERT' | 'KOREAN'>('STEAK');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuImage, setMenuImage] = useState('');
  const [menuIsPremium, setMenuIsPremium] = useState(false);
  const [menuFile, setMenuFile] = useState<File | null>(null);

  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCat, setGalleryCat] = useState<'WEDDING' | 'BIRTHDAY' | 'LONGEVITY' | 'CORPORATE' | 'CATERING' | 'BUFFET'>('WEDDING');
  const [galleryDate, setGalleryDate] = useState('2026.07');
  const [galleryImage, setGalleryImage] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Handle Login (Image 3 Password prompt)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) {
      setLoginError('아이디를 입력하세요.');
      return;
    }
    if (!password) {
      setLoginError('비밀번호를 입력하세요.');
      return;
    }
    
    // Accept standard ID 'admin' or 'dmaris', and passwords '1234', 'admin', 'dmaris'
    const isValidId = adminId.toLowerCase() === 'admin' || adminId.toLowerCase() === 'dmaris';
    const isValidPw = password === '1234' || password === 'admin' || password === 'dmaris';
    
    if (isValidId && isValidPw) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  // Image File Upload Helper
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'menu' | 'gallery') => {
    const file = e.target.files?.[0];
    if (file) {
      if (target === 'menu') {
        setMenuFile(file);
      } else {
        setGalleryFile(file);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (target === 'menu') {
            setMenuImage(reader.result);
          } else {
            setGalleryImage(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Status Modifiers for Bookings
  const changeBookingStatus = (id: string, newStatus: 'APPROVED' | 'CANCELLED') => {
    const updated = reservations.map(res => {
      if (res.id === id) {
        return { ...res, status: newStatus };
      }
      return res;
    });
    onUpdateReservations(updated);
  };

  const deleteBooking = (id: string) => {
    setDeleteConfirm({
      id,
      type: 'booking',
      message: '선택하신 예약 정보를 영구히 삭제하시겠습니까?'
    });
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    if (type === 'booking') {
      if (onDeleteReservation) {
        onDeleteReservation(id);
      } else {
        onUpdateReservations(reservations.filter(res => res.id !== id));
      }
    } else if (type === 'menu') {
      if (onDeleteMenuItem) {
        onDeleteMenuItem(id);
      } else {
        onUpdateMenuItems(menuItems.filter(item => item.id !== id));
      }
    } else if (type === 'gallery') {
      if (onDeleteGalleryItem) {
        onDeleteGalleryItem(id);
      } else {
        onUpdateGalleryItems(galleryItems.filter(item => item.id !== id));
      }
    } else if (type === 'review') {
      if (onDeleteReview) {
        onDeleteReview(id);
      } else {
        onUpdateReviews(reviews.filter(r => r.id !== id));
      }
    }
    setDeleteConfirm(null);
  };

  // Add Menu Item
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName || !menuPrice) {
      alert('메뉴 이름과 단가를 정확히 기입하세요.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('메뉴 이미지를 Firebase Storage에 업로드 중...');

    let finalImage = menuImage;
    try {
      if (menuFile) {
        const fileExt = menuFile.name.split('.').pop() || 'png';
        const storageRef = ref(storage, `menu/${Date.now()}.${fileExt}`);
        const snapshot = await uploadBytes(storageRef, menuFile);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        finalImage = downloadUrl;
      } else if (menuImage.startsWith('data:')) {
        const fileExt = menuImage.split(';')[0].split('/')[1]?.split('+')[0] || 'png';
        const storageRef = ref(storage, `menu/${Date.now()}.${fileExt}`);
        const snapshot = await uploadString(storageRef, menuImage, 'data_url');
        const downloadUrl = await getDownloadURL(snapshot.ref);
        finalImage = downloadUrl;
      } else if (!menuImage) {
        finalImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
      }

      const priceNum = parseInt(menuPrice) || 0;
      const newItem: MenuItem = {
        id: 'm-' + Date.now(),
        name: menuName,
        category: menuCat,
        description: menuDesc || '드마리스 파티시에와 셰프군단이 선사하는 라이브 스페셜 가치.',
        price: priceNum,
        imageUrl: finalImage,
        isPremium: menuIsPremium,
        isAvailable: true
      };

      onUpdateMenuItems([newItem, ...menuItems]);
      
      // reset form
      setMenuName('');
      setMenuDesc('');
      setMenuPrice('');
      setMenuImage('');
      setMenuFile(null);
      setMenuIsPremium(false);
      alert('새 메뉴가 정상적으로 등록되었습니다!');
    } catch (error) {
      console.error("Upload error:", error);
      alert('메뉴 등록 중 이미지 업로드 실패: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  // Delete Menu Item
  const handleDeleteMenuItem = (id: string) => {
    setDeleteConfirm({
      id,
      type: 'menu',
      message: '이 요리를 메뉴 카탈로그에서 제외하시겠습니까?'
    });
  };

  // Add Gallery Item
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle) {
      alert('갤러리 제목을 기록해 주세요.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('이미지를 Firebase Storage에 업로드 중...');

    let finalImage = galleryImage;
    try {
      if (galleryFile) {
        const fileExt = galleryFile.name.split('.').pop() || 'png';
        const storageRef = ref(storage, `gallery/${Date.now()}.${fileExt}`);
        const snapshot = await uploadBytes(storageRef, galleryFile);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        finalImage = downloadUrl;
      } else if (galleryImage.startsWith('data:')) {
        const fileExt = galleryImage.split(';')[0].split('/')[1]?.split('+')[0] || 'png';
        const storageRef = ref(storage, `gallery/${Date.now()}.${fileExt}`);
        const snapshot = await uploadString(storageRef, galleryImage, 'data_url');
        const downloadUrl = await getDownloadURL(snapshot.ref);
        finalImage = downloadUrl;
      } else if (!galleryImage) {
        finalImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80';
      }

      const newItem: GalleryItem = {
        id: 'g-' + Date.now(),
        title: galleryTitle,
        category: galleryCat,
        date: galleryDate || '2026.07',
        imageUrl: finalImage
      };

      onUpdateGalleryItems([newItem, ...galleryItems]);

      setGalleryTitle('');
      setGalleryImage('');
      setGalleryFile(null);
      alert('새로운 행사 전경 사진이 성공적으로 업로드되었습니다!');
    } catch (error) {
      console.error("Upload error:", error);
      alert('이미지 업로드에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  // Delete Gallery Item
  const handleDeleteGalleryItem = (id: string) => {
    setDeleteConfirm({
      id,
      type: 'gallery',
      message: '해당 이미지를 갤러리에서 삭제하시겠습니까?'
    });
  };

  // Login view (matching image 3)
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5EFE6] p-4">
        <div className="w-full max-w-md bg-[#FAF6F0] p-10 rounded-lg shadow-sm border border-[#EBE3D5] text-center">
          
          <h2 className="text-2xl font-serif text-[#70553C] tracking-wide mb-2 uppercase">
            DMARIS 관리자
          </h2>
          <p className="text-xs text-[#9B846D] leading-relaxed mb-8">
            어드민 페이지에 진입하려면 아이디와 비밀번호를 입력하세요.
          </p>

          {loginError && (
            <div className="mb-4 text-xs text-red-600 bg-red-100/50 py-2.5 rounded border border-red-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider text-[#9B846D] uppercase">아이디</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-white border border-[#CDBC9F] rounded py-3 pl-4 pr-10 text-sm text-[#5C4631] focus:outline-none focus:border-[#AF8151] transition"
                  autoFocus
                />
                <span className="absolute right-4 top-3.5 text-gray-400">
                  <User size={15} />
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider text-[#9B846D] uppercase">비밀번호</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#CDBC9F] rounded py-3 pl-4 pr-10 text-sm text-[#5C4631] focus:outline-none focus:border-[#AF8151] transition"
                />
                <span className="absolute right-4 top-3.5 text-gray-400">
                  <Lock size={15} />
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#AF8151] hover:bg-[#8F6339] text-white font-medium text-sm tracking-widest py-3 px-6 rounded transition duration-200 shadow-sm cursor-pointer"
              >
                로그인
              </button>
            </div>
          </form>

          <button
            onClick={onClose}
            className="mt-6 text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
          >
            홈페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Control Center (Logged-In state)
  return (
    <div className="fixed inset-0 z-50 bg-[#0c0c0c] text-neutral-200 flex flex-col overflow-hidden">
      
      {/* Admin Top Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-brand-bronze text-white text-[10px] font-mono tracking-widest px-2.5 py-1 rounded font-bold">
            DMARIS MASTER
          </span>
          <h1 className="text-lg font-serif text-brand-cream font-light tracking-wide">
            드마리스 프리미엄 통합 어드민 센터
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setPassword('');
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>로그아웃</span>
          </button>
          <button
            onClick={onClose}
            className="bg-neutral-800 hover:bg-neutral-700 text-brand-cream text-xs px-4 py-2 rounded-lg transition cursor-pointer"
          >
            닫고 홈페이지 가기
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Tab Sidebar */}
        <aside className="w-64 bg-neutral-950 border-r border-neutral-900 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
              Menu Directories
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs tracking-wider transition font-sans ${
                  activeTab === 'bookings'
                    ? 'bg-brand-bronze text-white font-semibold'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <FileText size={15} />
                <span>실시간 예약 관리 ({reservations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs tracking-wider transition font-sans ${
                  activeTab === 'gallery'
                    ? 'bg-brand-bronze text-white font-semibold'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <Camera size={15} />
                <span>갤러리 업로드 ({galleryItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs tracking-wider transition font-sans ${
                  activeTab === 'reviews'
                    ? 'bg-brand-bronze text-white font-semibold'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <FileText size={15} />
                <span>고객 리뷰 관리 ({reviews.length})</span>
              </button>
            </nav>
          </div>

          {/* Quick Info */}
          <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800/80 space-y-2 text-[11px] text-gray-400 font-sans">
            <div className="text-brand-bronze font-semibold flex items-center gap-1">
              <Sparkles size={11} /> 
              <span>관리자 안내</span>
            </div>
            <p className="leading-relaxed">
              본 관리자 창에서 수정한 예약 승인 상태, 음식 메뉴 구성, 전경 이미지는 메인 레이아웃 화면에 즉시 실시간으로 반영됩니다.
            </p>
          </div>
        </aside>

        {/* Right Dashboard Content */}
        <main className="flex-1 bg-[#101010] p-8 overflow-y-auto">
          
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif text-brand-cream">실시간 가맹 예약 관리 대시보드</h2>
                  <p className="text-xs text-gray-400 font-sans mt-1">고객이 홈페이지를 통해 접수한 상담 예약을 심사하고 관리합니다.</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg">
                    총 예약 건수: <strong className="text-brand-bronze font-mono">{reservations.length}건</strong>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg">
                    대기 중 예약: <strong className="text-amber-500 font-mono">{reservations.filter(r => r.status === 'PENDING').length}건</strong>
                  </div>
                </div>
              </div>

              {/* Reservations List */}
              <div className="bg-neutral-950 rounded-xl border border-neutral-900 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-900/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-neutral-800">
                      <th className="py-4 px-6 font-semibold">신청일 / 예약ID</th>
                      <th className="py-4 px-6 font-semibold">고객 정보 / 연락처</th>
                      <th className="py-4 px-6 font-semibold">행사 종류 / 인원</th>
                      <th className="py-4 px-6 font-semibold">희망 일시</th>
                      <th className="py-4 px-6 font-semibold">추가 요청 사항</th>
                      <th className="py-4 px-6 font-semibold">상태</th>
                      <th className="py-4 px-6 font-semibold text-center">동작</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-xs text-neutral-300">
                    {reservations.map(res => (
                      <tr key={res.id} className="hover:bg-neutral-900/30 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-mono text-[10px] text-gray-500">{res.createdAt}</p>
                          <p className="font-mono text-[11px] font-semibold text-brand-bronze mt-0.5">{res.id}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-brand-cream text-sm">{res.name}</p>
                          <p className="font-mono text-gray-400 mt-0.5">{res.contact}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-neutral-900 border border-neutral-800 text-gray-300 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                            {res.eventType}
                          </span>
                          <p className="text-gray-400 mt-1">예상 {res.guests}명</p>
                        </td>
                        <td className="py-4 px-6 font-sans">
                          <p className="font-medium text-brand-cream">{res.date}</p>
                          <p className="text-gray-400 font-mono text-[11px] mt-0.5">{res.time}</p>
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-gray-400 truncate-3-lines leading-relaxed text-[11px]" title={res.notes}>
                            {res.notes || '(요청 사항 없음)'}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          {res.status === 'APPROVED' && (
                            <span className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-semibold">
                              상담 완료 (승인)
                            </span>
                          )}
                          {res.status === 'PENDING' && (
                            <span className="bg-amber-950/40 border border-amber-900 text-amber-400 px-2.5 py-1 rounded text-[10px] font-semibold animate-pulse">
                              대기 검토 중
                            </span>
                          )}
                          {res.status === 'CANCELLED' && (
                            <span className="bg-red-950/40 border border-red-900 text-red-400 px-2.5 py-1 rounded text-[10px] font-semibold">
                              상담 보류 (취소)
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {res.status !== 'APPROVED' && (
                              <button
                                onClick={() => changeBookingStatus(res.id, 'APPROVED')}
                                className="w-8 h-8 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900 rounded flex items-center justify-center transition cursor-pointer"
                                title="상담 예약 승인"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            {res.status !== 'CANCELLED' && (
                              <button
                                onClick={() => changeBookingStatus(res.id, 'CANCELLED')}
                                className="w-8 h-8 bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-900 rounded flex items-center justify-center transition cursor-pointer"
                                title="상담 예약 취소"
                              >
                                <X size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteBooking(res.id)}
                              className="w-8 h-8 bg-neutral-900 hover:bg-red-950/60 text-gray-500 hover:text-red-400 border border-neutral-800 rounded flex items-center justify-center transition cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          접수된 예약 상담 정보가 존재하지 않습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {activeTab === 'menu' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Add Menu Form */}
              <div className="lg:col-span-5 bg-neutral-950 p-6 rounded-xl border border-neutral-900 h-fit space-y-6">
                <div>
                  <h3 className="text-base font-serif text-brand-cream flex items-center gap-2">
                    <Plus size={16} className="text-brand-bronze" /> 
                    <span>새로운 프리미엄 메뉴 등록</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">즉석 라이브 뷔페에 추가할 시그니처 요리를 작성합니다.</p>
                </div>

                <form onSubmit={handleAddMenuItem} className="space-y-4 text-xs">
                  
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">요리명 (Korean)</label>
                    <input
                      type="text"
                      placeholder="예: 최상급 활랍스터 버터구이"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">퀴진 분류</label>
                    <select
                      value={menuCat}
                      onChange={(e) => setMenuCat(e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                    >
                      <option value="STEAK">🥩 그릴 스테이크 코너</option>
                      <option value="SUSHI">🍣 라이브 스시 & 제철 활어 사시미</option>
                      <option value="CHINESE">🥟 정통 중화 특선 요리</option>
                      <option value="KOREAN">🍱 임금님 궁중 한식 요리</option>
                      <option value="DESSERT">🍰 명품 디저트 & 베이커리 쇼케이스</option>
                    </select>
                  </div>

                  {/* Estimated Price */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">추정 원가 가치 (KRW 단가)</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="예: 95000"
                        value={menuPrice}
                        onChange={(e) => setMenuPrice(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 pl-8 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                        required
                      />
                      <DollarSign size={13} className="absolute left-3 top-3.5 text-gray-500" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">요리 설명</label>
                    <textarea
                      rows={3}
                      placeholder="식자재 산지, 조리 특장점 등 고품격 설명을 적어주세요."
                      value={menuDesc}
                      onChange={(e) => setMenuDesc(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition resize-none"
                    />
                  </div>

                  {/* Image input (File or URL) */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium flex items-center justify-between">
                      <span>요리 이미지 사진</span>
                      <span className="text-[10px] text-gray-500">URL 혹은 직접 기기 파일 업로드</span>
                    </label>
                    
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... (또는 아래 업로드)"
                      value={menuImage.startsWith('data:') ? '' : menuImage}
                      onChange={(e) => setMenuImage(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                    />

                    <div className="relative border border-dashed border-neutral-800 rounded-lg p-3 bg-neutral-900/30 flex items-center justify-center hover:bg-neutral-900/50 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, 'menu')}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div className="text-center">
                        <ImageIcon size={18} className="mx-auto text-brand-bronze mb-1" />
                        <span className="text-[10px] text-neutral-400">
                          {menuImage.startsWith('data:') ? '✅ 로컬 이미지 로드 완료' : '컴퓨터 파일 탐색기에서 이미지 선택하기'}
                        </span>
                      </div>
                    </div>

                    {menuImage && (
                      <div className="mt-2 relative aspect-[16/9] rounded-lg overflow-hidden border border-neutral-800 bg-black">
                        <img src={menuImage} alt="미리보기" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => { setMenuImage(''); setMenuFile(null); }}
                          className="absolute top-1 right-1 bg-black/80 hover:bg-black text-white p-1 rounded-full text-[10px] border border-neutral-800 cursor-pointer"
                        >
                          ✕ 제거
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Premium Toggler */}
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="premium-toggle"
                      checked={menuIsPremium}
                      onChange={(e) => setMenuIsPremium(e.target.checked)}
                      className="w-4 h-4 text-brand-bronze bg-neutral-900 border-neutral-800 rounded focus:ring-brand-bronze accent-brand-bronze cursor-pointer"
                    />
                    <label htmlFor="premium-toggle" className="text-gray-300 font-medium cursor-pointer">
                      ⭐ 시그니처 프리미엄 명품 타이틀 뱃지 부여
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                      isUploading
                        ? 'bg-neutral-800 cursor-not-allowed text-neutral-400 border border-neutral-700'
                        : 'bg-brand-bronze hover:bg-brand-bronze-dark'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        <span>{uploadStatus || '업로드 중...'}</span>
                      </>
                    ) : (
                      <span>퀴진 신규 요리 등록하기</span>
                    )}
                  </button>

                </form>
              </div>

              {/* Current Menu Table */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif text-brand-cream">실시간 메뉴 등록 명단</h3>
                  <span className="text-xs text-gray-500">총 {menuItems.length}개의 라이브 아이템</span>
                </div>

                <div className="bg-neutral-950 rounded-xl border border-neutral-900 overflow-hidden divide-y divide-neutral-900">
                  {menuItems.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-900/10 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-brand-cream font-medium text-xs">{item.name}</span>
                            <span className="bg-neutral-900 border border-neutral-800 text-gray-400 px-1.5 py-0.5 rounded text-[9px]">
                              {item.category}
                            </span>
                            {item.isPremium && (
                              <span className="bg-amber-950 text-brand-bronze border border-brand-bronze/30 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                                PREMIUM
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-md mt-1">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs text-brand-bronze font-semibold">
                          ₩ {item.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="w-8 h-8 bg-neutral-900 hover:bg-red-950/50 text-gray-500 hover:text-red-400 border border-neutral-800 rounded flex items-center justify-center transition cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Photo Upload Form */}
              <div className="lg:col-span-5 bg-neutral-950 p-6 rounded-xl border border-neutral-900 h-fit space-y-6">
                <div>
                  <h3 className="text-base font-serif text-brand-cream flex items-center gap-2">
                    <ImageIcon size={16} className="text-brand-bronze" /> 
                    <span>완성된 순간들 갤러리 이미지 추가</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    홈페이지 세션 03 (GALLERY) 섹션에 고화질 스냅샷 사진을 추가 업로드합니다.
                  </p>
                </div>

                <form onSubmit={handleAddGalleryItem} className="space-y-4 text-xs">
                  
                  {/* Photo Title */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">갤러리 사진 설명 제목</label>
                    <input
                      type="text"
                      placeholder="예: 생화 데코레이션이 완성된 드마리스 프리미엄 신부대기실"
                      value={galleryTitle}
                      onChange={(e) => setGalleryTitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">해당 행사 분류 카테고리</label>
                    <select
                      value={galleryCat}
                      onChange={(e) => setGalleryCat(e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                    >
                      <option value="WEDDING">💍 웨딩 (WEDDING)</option>
                      <option value="BIRTHDAY">👶 돌잔치 (FIRST BIRTHDAY)</option>
                      <option value="LONGEVITY">💐 장수연 (LONGEVITY)</option>
                      <option value="CORPORATE">🏢 기업행사 (CORPORATE)</option>
                      <option value="CATERING">🍽️ 케이터링 (CATERING)</option>
                      <option value="BUFFET">🍱 스페셜 뷔페전경 (BUFFET)</option>
                    </select>
                  </div>

                  {/* Snap Date */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">촬영 시점 일자 표기</label>
                    <input
                      type="text"
                      placeholder="예시: 2026.07"
                      value={galleryDate}
                      onChange={(e) => setGalleryDate(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                    />
                  </div>

                  {/* Image Input (URL/File) */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium flex items-center justify-between">
                      <span>행사 및 뷔페 사진 등록</span>
                      <span className="text-[10px] text-gray-500">가장 핵심 기능</span>
                    </label>
                    
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... (또는 아래 파일 업로드)"
                      value={galleryImage.startsWith('data:') ? '' : galleryImage}
                      onChange={(e) => setGalleryImage(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                    />

                    <div className="relative border border-dashed border-neutral-800 rounded-lg p-3 bg-neutral-900/30 flex items-center justify-center hover:bg-neutral-900/50 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, 'gallery')}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div className="text-center">
                        <ImageIcon size={18} className="mx-auto text-brand-bronze mb-1" />
                        <span className="text-[10px] text-neutral-400">
                          {galleryImage.startsWith('data:') ? '✅ 로컬 이미지 장착 완료' : '컴퓨터 파일 탐색기에서 이미지 선택하기'}
                        </span>
                      </div>
                    </div>

                    {galleryImage && (
                      <div className="mt-2 relative aspect-[16/9] rounded-lg overflow-hidden border border-neutral-800 bg-black">
                        <img src={galleryImage} alt="미리보기" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => { setGalleryImage(''); setGalleryFile(null); }}
                          className="absolute top-1 right-1 bg-black/80 hover:bg-black text-white p-1 rounded-full text-[10px] border border-neutral-800 cursor-pointer"
                        >
                          ✕ 제거
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                      isUploading
                        ? 'bg-neutral-800 cursor-not-allowed text-neutral-400 border border-neutral-700'
                        : 'bg-brand-bronze hover:bg-brand-bronze-dark'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        <span>{uploadStatus || '업로드 중...'}</span>
                      </>
                    ) : (
                      <span>갤러리 신규 스냅 이미지 등록하기</span>
                    )}
                  </button>

                </form>
              </div>

              {/* Current Gallery View */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif text-brand-cream font-light">
                    실시간 홈페이지 갤러리 등록 사진 ({galleryItems.length}장)
                  </h3>
                  <span className="text-xs text-gray-500">삭제 시 홈페이지에서 실시간 차단</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {galleryItems.map(item => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-900 group">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end space-y-1">
                        <p className="text-[10px] text-brand-bronze font-mono">{item.date} | {item.category}</p>
                        <p className="text-[10px] text-white font-sans font-medium line-clamp-2 leading-snug">{item.title}</p>
                        
                        <button
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="mt-2 w-full bg-red-950/80 hover:bg-red-900 border border-red-900 text-red-200 text-[10px] py-1 rounded transition cursor-pointer"
                        >
                          삭제하기
                        </button>
                      </div>

                      {/* Small floating tag */}
                      <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] text-gray-400 group-hover:opacity-0 transition-opacity">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif text-brand-cream">실시간 고객 안심 리뷰 백업 및 관리</h2>
                  <p className="text-xs text-gray-400 font-sans mt-1">고객들이 작성하고 간 안심 인증 리뷰 및 일반 후기를 조회하고 삭제 관리합니다.</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg">
                    총 리뷰 개수: <strong className="text-brand-bronze font-mono">{reviews.length}개</strong>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg">
                    실예약 안심 인증 리뷰: <strong className="text-amber-500 font-mono">{reviews.filter(r => r.isVerified).length}개</strong>
                  </div>
                </div>
              </div>

              {/* Reviews Backup List */}
              <div className="bg-neutral-950 rounded-xl border border-neutral-900 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-900/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-neutral-800">
                      <th className="py-4 px-6 font-semibold">작성 ID / 날짜</th>
                      <th className="py-4 px-6 font-semibold">작성자 / 연락처 및 행사 정보</th>
                      <th className="py-4 px-6 font-semibold">연회 종류 / 만족도</th>
                      <th className="py-4 px-6 font-semibold">리뷰 상세 내용</th>
                      <th className="py-4 px-6 font-semibold">인증 상태</th>
                      <th className="py-4 px-6 font-semibold text-center">동작</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-xs text-neutral-300">
                    {reviews.map(rev => (
                      <tr key={rev.id} className="hover:bg-neutral-900/30 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-mono text-[11px] font-semibold text-brand-bronze">{rev.id}</p>
                          <p className="font-mono text-[10px] text-gray-500 mt-1">{rev.date}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-brand-cream text-sm">{rev.author} 고객님</p>
                          <p className="font-mono text-gray-400 mt-1">
                            연락처: {rev.phone || rev.phoneLast4 || '(미등록)'}
                          </p>
                          {rev.eventDate && (
                            <p className="text-gray-500 font-mono text-[10px] mt-0.5">행사일: {rev.eventDate}</p>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-neutral-900 border border-neutral-800 text-gray-300 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                            {rev.eventType}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-400 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={11} 
                                className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-neutral-800"} 
                              />
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-sm">
                          <p className="text-gray-300 leading-relaxed text-[11px] whitespace-pre-wrap break-all">
                            {rev.content}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          {rev.isVerified ? (
                            <span className="bg-amber-950/40 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded text-[10px] font-semibold">
                              실예약 안심 인증
                            </span>
                          ) : (
                            <span className="bg-neutral-900 border border-neutral-800 text-gray-500 px-2.5 py-1 rounded text-[10px]">
                              일반 비인증 후기
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => {
                              setDeleteConfirm({
                                id: rev.id,
                                type: 'review',
                                message: '이 후기를 영구히 삭제하시겠습니까? (삭제 즉시 홈페이지에서 노출 제한됩니다)'
                              });
                            }}
                            className="w-8 h-8 bg-neutral-900 hover:bg-red-950/60 text-gray-500 hover:text-red-400 border border-neutral-800 rounded flex items-center justify-center transition cursor-pointer mx-auto"
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          등록된 고객 후기가 존재하지 않습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </main>

      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 bg-red-950/40 border border-red-900 rounded-full flex items-center justify-center mx-auto text-red-400">
              <Trash2 size={20} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-200">데이터 삭제 확인</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                {deleteConfirm.message}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-850 text-gray-400 hover:text-white rounded-lg text-xs font-sans font-medium border border-neutral-800 transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={executeDelete}
                className="py-2.5 px-4 bg-red-900 hover:bg-red-800 text-white rounded-lg text-xs font-sans font-medium transition cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
