/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Reservation, MenuItem, GalleryItem, Review, HeroImage } from '../types';
import { Lock, User, FileText, Plus, LogOut, Check, X, Trash2, Camera, Tag, List, DollarSign, Image as ImageIcon, Sparkles, Star, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface AdminPanelProps {
  reservations: Reservation[];
  menuItems: MenuItem[];
  galleryItems: GalleryItem[];
  reviews: Review[];
  heroImages: HeroImage[];
  onUpdateReservations: (resList: Reservation[]) => void;
  onUpdateMenuItems: (menuList: MenuItem[]) => void;
  onUpdateGalleryItems: (galleryList: GalleryItem[]) => void;
  onUpdateReviews: (reviewList: Review[]) => void;
  onUpdateHeroImages: (heroList: HeroImage[]) => void;
  onDeleteReservation?: (id: string) => void;
  onDeleteMenuItem?: (id: string) => void;
  onDeleteGalleryItem?: (id: string) => void;
  onDeleteReview?: (id: string) => void;
  onDeleteHeroImage?: (id: string) => void;
  onClose: () => void;
}

const SUB_CATEGORIES_BY_MAIN: Record<string, { label: string; value: string }[]> = {
  WEDDING: [
    { label: '교회 (교회/성당 웨딩)', value: '교회' },
    { label: '야외 (야외/가든 웨딩)', value: '야외' },
    { label: '스몰 (스몰/하우스 웨딩)', value: '스몰' },
    { label: '고급웨딩홀 (프리미엄 웨딩홀)', value: '고급웨딩홀' }
  ],
  BIRTHDAY: [
    { label: '전통돌상 (전통 스타일 돌상)', value: '전통돌상' },
    { label: '현대돌상 (모던 스타일 돌상)', value: '현대돌상' },
    { label: '패키지연출 (스페셜 패키지)', value: '패키지연출' }
  ],
  LONGEVITY: [
    { label: '전통생신상 (전통 헌수 상차림)', value: '전통생신상' },
    { label: '현대생신상 (모던 생신 상차림)', value: '현대생신상' },
    { label: '직계가족예식 (소규모 직계 모임)', value: '직계가족예식' }
  ],
  CORPORATE: [
    { label: '세미나·포럼 (학술/기업 세미나)', value: '세미나·포럼' },
    { label: '사은회·시상식 (공식 시상식)', value: '사은회·시상식' },
    { label: '연말파티 (송년/신년회 파티)', value: '연말파티' }
  ],
  CATERING: [
    { label: '핑거푸드 (리셉션 핑거푸드)', value: '핑거푸드' },
    { label: '럭셔리뷔페 (프리미엄 출장 뷔페)', value: '럭셔리뷔페' },
    { label: '홈파티박스 (가정/소규모 파티)', value: '홈파티박스' }
  ],
  BUFFET: [
    { label: '출장뷔페 (대형 연회 출장뷔페)', value: '출장뷔페' },
    { label: '뷔페전경 (매장 전체 인테리어)', value: '뷔페전경' },
    { label: '푸드코너 (라이브 푸드 스테이션)', value: '푸드코너' }
  ]
};

export default function AdminPanel({
  reservations,
  menuItems,
  galleryItems,
  reviews,
  heroImages,
  onUpdateReservations,
  onUpdateMenuItems,
  onUpdateGalleryItems,
  onUpdateReviews,
  onUpdateHeroImages,
  onDeleteReservation,
  onDeleteMenuItem,
  onDeleteGalleryItem,
  onDeleteReview,
  onDeleteHeroImage,
  onClose
}: AdminPanelProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'menu' | 'gallery' | 'reviews' | 'hero'>('bookings');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: 'booking' | 'menu' | 'gallery' | 'review' | 'hero';
    message: string;
  } | null>(null);

  // Hero Image Form State
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  // Hero Image Edit State
  const [editingHeroItem, setEditingHeroItem] = useState<HeroImage | null>(null);
  const [editHeroTitle, setEditHeroTitle] = useState('');
  const [editHeroSubtitle, setEditHeroSubtitle] = useState('');
  const [editHeroImageUrl, setEditHeroImageUrl] = useState('');
  const [editHeroImageFile, setEditHeroImageFile] = useState<File | null>(null);

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
  const [gallerySubCat, setGallerySubCat] = useState<string>('교회');
  const [galleryDate, setGalleryDate] = useState('2026.07');
  const [galleryImage, setGalleryImage] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  const handleGalleryCatChange = (newCat: 'WEDDING' | 'BIRTHDAY' | 'LONGEVITY' | 'CORPORATE' | 'CATERING' | 'BUFFET') => {
    setGalleryCat(newCat);
    const subs = SUB_CATEGORIES_BY_MAIN[newCat];
    if (subs && subs.length > 0) {
      setGallerySubCat(subs[0].value);
    } else {
      setGallerySubCat('');
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Gallery Edit Modal State
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [editGalleryTitle, setEditGalleryTitle] = useState('');
  const [editGalleryCat, setEditGalleryCat] = useState<'WEDDING' | 'BIRTHDAY' | 'LONGEVITY' | 'CORPORATE' | 'CATERING' | 'BUFFET'>('WEDDING');
  const [editGallerySubCat, setEditGallerySubCat] = useState<string>('');
  const [editGalleryDate, setEditGalleryDate] = useState('2026.07');
  const [editGalleryImage, setEditGalleryImage] = useState('');
  const [editGalleryFile, setEditGalleryFile] = useState<File | null>(null);
  const [isEditUploading, setIsEditUploading] = useState(false);

  const handleStartEditGalleryItem = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setEditGalleryTitle(item.title || '');
    setEditGalleryCat(item.category || 'WEDDING');
    setEditGallerySubCat(item.subCategory || (SUB_CATEGORIES_BY_MAIN[item.category]?.[0]?.value || ''));
    setEditGalleryDate(item.date || '2026.07');
    setEditGalleryImage(item.imageUrl || '');
    setEditGalleryFile(null);
  };

  const handleEditGalleryCatChange = (newCat: 'WEDDING' | 'BIRTHDAY' | 'LONGEVITY' | 'CORPORATE' | 'CATERING' | 'BUFFET') => {
    setEditGalleryCat(newCat);
    const subs = SUB_CATEGORIES_BY_MAIN[newCat];
    if (subs && subs.length > 0) {
      setEditGallerySubCat(subs[0].value);
    } else {
      setEditGallerySubCat('');
    }
  };

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

  // Helper to compress images down to under 1MB / ~500KB automatically
  const compressImageFile = (file: File, maxDimension = 1920, quality = 0.82): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size <= 500 * 1024 && file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

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
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg", {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Image File Upload Helper
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'menu' | 'gallery') => {
    const rawFile = e.target.files?.[0];
    if (rawFile) {
      // Compress automatically if large
      const file = await compressImageFile(rawFile);

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
    } else if (type === 'hero') {
      if (onDeleteHeroImage) {
        onDeleteHeroImage(id);
      } else {
        onUpdateHeroImages(heroImages.filter(item => item.id !== id));
      }
    }
    setDeleteConfirm(null);
  };

  // Hero Image File Change Helper
  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (rawFile) {
      const compressed = await compressImageFile(rawFile, 1920, 0.85);
      setHeroImageFile(compressed);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHeroImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(compressed);
    }
  };

  // Add Hero Image Handler
  const handleAddHeroImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroImageUrl && !heroImageFile) {
      alert('메인사진 이미지 파일 또는 URL을 입력해 주세요.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('메인사진 이미지를 Storage에 업로드 중...');

    let finalImage = heroImageUrl;
    try {
      if (heroImageFile) {
        const fileExt = heroImageFile.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `hero/${Date.now()}.${fileExt}`);
        const snapshot = await uploadBytes(storageRef, heroImageFile);
        finalImage = await getDownloadURL(snapshot.ref);
      } else if (heroImageUrl.startsWith('data:')) {
        const storageRef = ref(storage, `hero/${Date.now()}.jpg`);
        const snapshot = await uploadString(storageRef, heroImageUrl, 'data_url');
        finalImage = await getDownloadURL(snapshot.ref);
      }

      const newHeroItem: HeroImage = {
        id: 'hero-' + Date.now(),
        title: heroTitle.trim() || '품격 있는 순간',
        subtitle: heroSubtitle.trim() || '드마리스에서 완성됩니다',
        imageUrl: finalImage,
        createdAt: new Date().toISOString().slice(0, 10)
      };

      onUpdateHeroImages([newHeroItem, ...heroImages]);
      setHeroTitle('');
      setHeroSubtitle('');
      setHeroImageUrl('');
      setHeroImageFile(null);
      alert('새로운 메인사진이 등록되었습니다! 홈페이지 메인화면 슬라이드에 즉시 반영됩니다.');
    } catch (error) {
      console.error("Hero upload error:", error);
      alert('메인사진 등록 중 업로드 오류: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  // Start Edit Hero Item
  const handleStartEditHeroItem = (item: HeroImage) => {
    setEditingHeroItem(item);
    setEditHeroTitle(item.title || '');
    setEditHeroSubtitle(item.subtitle || '');
    setEditHeroImageUrl(item.imageUrl || '');
    setEditHeroImageFile(null);
  };

  // Edit Hero Image File Change Helper
  const handleEditHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (rawFile) {
      const compressed = await compressImageFile(rawFile, 1920, 0.85);
      setEditHeroImageFile(compressed);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditHeroImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(compressed);
    }
  };

  // Save Edited Hero Item Handler
  const handleSaveEditHeroItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHeroItem) return;
    if (!editHeroImageUrl && !editHeroImageFile) {
      alert('메인사진 이미지 파일 또는 URL을 입력해 주세요.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('메인사진 수정 사항을 저장 중...');

    let finalImage = editHeroImageUrl;
    try {
      if (editHeroImageFile) {
        const fileExt = editHeroImageFile.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `hero/${Date.now()}.${fileExt}`);
        const snapshot = await uploadBytes(storageRef, editHeroImageFile);
        finalImage = await getDownloadURL(snapshot.ref);
      } else if (editHeroImageUrl.startsWith('data:')) {
        const storageRef = ref(storage, `hero/${Date.now()}.jpg`);
        const snapshot = await uploadString(storageRef, editHeroImageUrl, 'data_url');
        finalImage = await getDownloadURL(snapshot.ref);
      }

      const updatedItem: HeroImage = {
        ...editingHeroItem,
        title: editHeroTitle.trim() || '품격 있는 순간',
        subtitle: editHeroSubtitle.trim() || '드마리스에서 완성됩니다',
        imageUrl: finalImage
      };

      const newHeroList = heroImages.map(item => item.id === editingHeroItem.id ? updatedItem : item);
      onUpdateHeroImages(newHeroList);
      setEditingHeroItem(null);
      alert('메인사진 수정이 완료되었습니다! 홈페이지 메인화면에 즉시 반영됩니다.');
    } catch (error) {
      console.error("Hero edit upload error:", error);
      alert('메인사진 수정 중 업로드 오류: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
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
        subCategory: gallerySubCat,
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

  // Save Edited Gallery Item
  const handleSaveEditGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryItem) return;

    if (!editGalleryTitle.trim()) {
      alert('행사 스냅 제목을 입력해 주세요.');
      return;
    }

    setIsEditUploading(true);
    try {
      let finalImage = editGalleryImage;

      if (editGalleryFile) {
        const storageRef = ref(storage, `gallery/edit_${Date.now()}_${editGalleryFile.name}`);
        await uploadBytes(storageRef, editGalleryFile);
        finalImage = await getDownloadURL(storageRef);
      }

      if (!finalImage) {
        alert('이미지 URL 또는 이미지 파일을 선택해 주세요.');
        setIsEditUploading(false);
        return;
      }

      const updatedList = galleryItems.map(item => {
        if (item.id === editingGalleryItem.id) {
          return {
            ...item,
            title: editGalleryTitle,
            category: editGalleryCat,
            subCategory: editGallerySubCat,
            date: editGalleryDate || '2026.07',
            imageUrl: finalImage
          };
        }
        return item;
      });

      onUpdateGalleryItems(updatedList);
      setEditingGalleryItem(null);
      alert('갤러리 사진 정보가 성공적으로 수정되었습니다!');
    } catch (error) {
      console.error("Gallery edit error:", error);
      alert('수정 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsEditUploading(false);
    }
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

              <button
                onClick={() => setActiveTab('hero')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs tracking-wider transition font-sans ${
                  activeTab === 'hero'
                    ? 'bg-brand-bronze text-white font-semibold'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <ImageIcon size={15} />
                <span>메인사진 관리 ({heroImages.length})</span>
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
                    <label className="text-gray-400 font-medium">해당 행사 메인 카테고리</label>
                    <select
                      value={galleryCat}
                      onChange={(e) => handleGalleryCatChange(e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                    >
                      <option value="WEDDING">💍 웨딩 (WEDDING)</option>
                      <option value="BIRTHDAY">👶 돌잔치 (FIRST BIRTHDAY)</option>
                      <option value="LONGEVITY">💐 칠순·팔순 / 장수연 (LONGEVITY)</option>
                      <option value="CORPORATE">🏢 기업행사 (CORPORATE)</option>
                      <option value="CATERING">🍽️ 케이터링 (CATERING)</option>
                      <option value="BUFFET">🍱 출장뷔페 / 스페셜 뷔페전경 (BUFFET)</option>
                    </select>
                  </div>

                  {/* SubCategory */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium flex items-center justify-between">
                      <span>소주제 (서브 카테고리) 설정</span>
                      <span className="text-[10px] text-brand-bronze font-mono">
                        {gallerySubCat ? `선택: ${gallerySubCat}` : ''}
                      </span>
                    </label>
                    <select
                      value={gallerySubCat}
                      onChange={(e) => setGallerySubCat(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                    >
                      {(SUB_CATEGORIES_BY_MAIN[galleryCat] || []).map((sub) => (
                        <option key={sub.value} value={sub.value}>
                          {sub.label}
                        </option>
                      ))}
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
                      <div className="text-center space-y-1">
                        <ImageIcon size={18} className="mx-auto text-brand-bronze mb-1" />
                        <span className="text-[11px] text-neutral-300 font-medium block">
                          {galleryImage.startsWith('data:') ? '✅ 로컬 이미지 장착 완료' : '컴퓨터 파일 탐색기에서 이미지 선택하기'}
                        </span>
                        <p className="text-[11px] text-amber-400/90 font-medium leading-snug">
                          ※ 500KB 이내의 사진을 업로드해야 합니다. (로딩 속도 최적화)
                        </p>
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
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end space-y-1">
                        <p className="text-[10px] text-brand-bronze font-mono">
                          {item.date} | {item.category} {item.subCategory ? `(${item.subCategory})` : ''}
                        </p>
                        <p className="text-[10px] text-white font-sans font-medium line-clamp-2 leading-snug">{item.title}</p>
                        
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditGalleryItem(item)}
                            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-300 text-[10px] py-1 rounded transition cursor-pointer flex items-center justify-center gap-1 font-medium"
                          >
                            수정하기
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="bg-red-950/80 hover:bg-red-900 border border-red-900 text-red-200 text-[10px] py-1 rounded transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            삭제하기
                          </button>
                        </div>
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

          {/* Gallery Edit Modal Overlay */}
          {editingGalleryItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-5 text-left text-xs shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <div>
                    <h3 className="text-base font-serif text-brand-cream font-medium">갤러리 스냅 정보 수정</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">선택한 행사 스냅의 제목, 메인/서브 카테고리, 날짜 및 이미지를 변경합니다.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingGalleryItem(null)}
                    className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveEditGalleryItem} className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">행사 스냅 제목</label>
                    <input
                      type="text"
                      value={editGalleryTitle}
                      onChange={(e) => setEditGalleryTitle(e.target.value)}
                      placeholder="예: 영락교회 본당 단독 가든 세팅"
                      required
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                    />
                  </div>

                  {/* Category & SubCategory */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-medium">메인 카테고리</label>
                      <select
                        value={editGalleryCat}
                        onChange={(e) => handleEditGalleryCatChange(e.target.value as any)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                      >
                        <option value="WEDDING">💍 웨딩 (WEDDING)</option>
                        <option value="BIRTHDAY">🎂 돌잔치 (BIRTHDAY)</option>
                        <option value="LONGEVITY">💐 칠순·팔순 / 장수연 (LONGEVITY)</option>
                        <option value="CORPORATE">🏢 기업행사 (CORPORATE)</option>
                        <option value="CATERING">🍽️ 케이터링 (CATERING)</option>
                        <option value="BUFFET">🍱 출장뷔페 / 뷔페전경 (BUFFET)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-medium">소주제 (서브 카테고리)</label>
                      <select
                        value={editGallerySubCat}
                        onChange={(e) => setEditGallerySubCat(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                      >
                        {(SUB_CATEGORIES_BY_MAIN[editGalleryCat] || []).map((sub) => (
                          <option key={sub.value} value={sub.value}>
                            {sub.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">행사 연월 (표기용)</label>
                    <input
                      type="text"
                      value={editGalleryDate}
                      onChange={(e) => setEditGalleryDate(e.target.value)}
                      placeholder="2026.07"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-brand-cream focus:outline-none focus:border-brand-bronze transition font-mono"
                    />
                  </div>

                  {/* Image upload / URL */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium">이미지 변경 (선택사항)</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const compressed = await compressImageFile(e.target.files[0]);
                            setEditGalleryFile(compressed);
                            setEditGalleryImage(URL.createObjectURL(compressed));
                          }
                        }}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-gray-300 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-neutral-800 file:text-brand-cream file:cursor-pointer"
                      />
                      <p className="text-[11px] text-amber-400/90 font-medium">
                        ※ 500KB 이내의 사진을 업로드해야 합니다. (로딩 속도 최적화)
                      </p>
                      <input
                        type="url"
                        value={editGalleryImage}
                        onChange={(e) => setEditGalleryImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-gray-300 text-xs focus:outline-none focus:border-brand-bronze font-mono"
                      />
                    </div>
                    {editGalleryImage && (
                      <div className="mt-2 relative aspect-[16/9] max-h-36 rounded-lg overflow-hidden border border-neutral-800 bg-black">
                        <img src={editGalleryImage} alt="수정 이미지 미리보기" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => setEditingGalleryItem(null)}
                      className="px-4 py-2.5 rounded-lg border border-neutral-800 text-gray-300 hover:bg-neutral-900 transition cursor-pointer font-medium"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isEditUploading}
                      className="px-5 py-2.5 rounded-lg bg-brand-bronze hover:bg-brand-bronze-dark text-white font-semibold transition cursor-pointer flex items-center gap-2"
                    >
                      {isEditUploading ? (
                        <>
                          <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                          <span>저장 중...</span>
                        </>
                      ) : (
                        <span>수정 사항 저장하기</span>
                      )}
                    </button>
                  </div>
                </form>
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

          {/* MAIN HERO IMAGES MANAGEMENT TAB */}
          {activeTab === 'hero' && (
            <div className="space-y-8">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
                <div>
                  <h3 className="text-lg font-serif font-light text-brand-cream">
                    메인 화면 대문 사진 관리
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">
                    홈페이지 메인화면(Hero Section)에 로테이션되는 대문 배경사진을 직접 등록/삭제하실 수 있습니다.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg text-gray-300">
                    등록된 메인사진: <strong className="text-brand-bronze font-mono text-sm ml-1">{heroImages.length}장</strong>
                  </div>
                </div>
              </div>



              {/* Existing Hero Images List */}
              <div className="bg-neutral-950 rounded-xl border border-neutral-900 overflow-hidden">
                <div className="p-4 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-300">현재 등록된 메인사진 목록</h4>
                  <span className="text-[11px] text-gray-500 font-mono">등록된 사진들이 메인 화면에서 순서대로 넘어가며 표시됩니다</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {heroImages.map((hero, index) => (
                    <div
                      key={hero.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-brand-bronze/50 transition"
                    >
                      <div className="relative h-44 bg-black overflow-hidden">
                        <img
                          src={hero.imageUrl}
                          alt={hero.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm border border-brand-bronze/40 text-brand-bronze text-[10px] font-mono px-2.5 py-1 rounded-full font-bold">
                          {`${index + 1}번 슬라이드`}
                        </div>
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-brand-cream line-clamp-1">{hero.title}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-1 italic mt-0.5">{hero.subtitle}</p>
                        </div>

                        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                          <span>{hero.createdAt || '등록됨'}</span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStartEditHeroItem(hero)}
                              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700/60 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                              title="사진 수정"
                            >
                              <Pencil size={13} />
                              <span>수정</span>
                            </button>

                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  id: hero.id,
                                  type: 'hero',
                                  message: '선택한 메인사진을 삭제하시겠습니까? (삭제 즉시 메인 화면 로테이션에서 제외됩니다)'
                                });
                              }}
                              className="p-2 bg-neutral-800 hover:bg-red-950/80 text-gray-400 hover:text-red-400 border border-neutral-700/60 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px]"
                              title="삭제"
                            >
                              <Trash2 size={13} />
                              <span>삭제</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {heroImages.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 text-xs">
                      등록된 메인사진이 없습니다. 상단 폼에서 사진을 올려주세요.
                    </div>
                  )}
                </div>
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

      {/* Hero Image Edit Modal */}
      {editingHeroItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <div className="flex items-center gap-2">
                <Pencil className="text-brand-bronze" size={18} />
                <h3 className="text-sm font-semibold text-gray-200">메인사진 정보 및 이미지 수정</h3>
              </div>
              <button
                onClick={() => setEditingHeroItem(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditHeroItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-400">메인 타이틀</label>
                <input
                  type="text"
                  value={editHeroTitle}
                  onChange={(e) => setEditHeroTitle(e.target.value)}
                  placeholder="예: 품격 있는 순간,"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-bronze"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-400">서브 타이틀</label>
                <input
                  type="text"
                  value={editHeroSubtitle}
                  onChange={(e) => setEditHeroSubtitle(e.target.value)}
                  placeholder="예: 드마리스에서 완성됩니다"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-bronze"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">새 사진 파일 선택 또는 이미지 URL 변경</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditHeroFileChange}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-bronze/20 file:text-brand-bronze hover:file:bg-brand-bronze/30 cursor-pointer bg-neutral-900 border border-neutral-800 rounded-lg p-2"
                />

                <input
                  type="text"
                  value={editHeroImageUrl}
                  onChange={(e) => setEditHeroImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-bronze"
                />

                {editHeroImageUrl && (
                  <div className="relative h-36 rounded-lg overflow-hidden border border-neutral-800 bg-black mt-2">
                    <img
                      src={editHeroImageUrl}
                      alt="수정 미리보기"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setEditingHeroItem(null)}
                  className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-850 text-gray-400 hover:text-white rounded-lg text-xs font-medium border border-neutral-800 transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="py-2.5 px-5 bg-brand-bronze hover:bg-brand-bronze-dark text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <span>{uploadStatus || '저장 중...'}</span>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>수정 사항 저장</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
