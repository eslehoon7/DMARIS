/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Reservation, MenuItem, GalleryItem, Review, HeroImage } from './types';
import { 
  initialMenuItems,
  initialGalleryItems, 
  initialReservations, 
  initialReviews,
  initialHeroImages
} from './data/initialData';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, query } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import BookingForm from './components/BookingForm';
import AdminPanel from './components/AdminPanel';
import ServicePage from './components/ServicePage';
import ReviewPage from './components/ReviewPage';
import { GlowCard } from './components/ui/spotlight-card';
import { 
  Menu, 
  X, 
  Crown, 
  ChevronRight, 
  ArrowRight, 
  Quote, 
  Star, 
  ChevronLeft, 
  Calendar, 
  Sparkles, 
  Clock, 
  MapPin, 
  Heart,
  Briefcase,
  Gift,
  Coffee,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Services Cards Specs
const services = [
  {
    num: '01',
    title: 'WEDDING',
    korTitle: '웨딩',
    desc: '두 사람의 새로운 시작,\n드마리스가 가장 아름답게 완성합니다.',
    detail: '호텔식 플라워 세팅, 미디어 파사드 조향 연출, 그리고 최고 명성을 가진 마스터 셰프 군단의 프리미엄 연회 요리를 통해 세상에 오직 하나뿐인 웨딩 시나리오를 지어 드립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    icon: Heart
  },
  {
    num: '02',
    title: 'DOLJANCHI PARTY',
    korTitle: '첫돌 파티',
    desc: '사랑스러운 첫 순간,\n정성과 품격으로 함께합니다',
    detail: '현대식·전통식 테마 돌상 커스텀, 유기농 재료 식단, 돌잡이 전담 연출 스태프 및 단독 룸 배정을 통해 온 가족이 편안하고 행복하게 머물 수 있는 축제의 장을 준비합니다.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/main%20image%2F%EC%B2%AB%EB%8F%8C%EC%82%AC%EC%A7%84.jpg?alt=media&token=5856c9df-7c1d-4fd0-8cb1-ba6ff6c199d9',
    icon: Gift
  },
  {
    num: '03',
    title: 'LONGEVITY PARTY',
    korTitle: '칠순 · 팔순',
    desc: '존경과 감사의 마음을 담아,\n뜻깊은 시간을 완성합니다',
    detail: '생신을 축하하는 전통 헌수 상차림과 어르신들의 입맛에 꼭 맞춘 영양 신선로, 갈비찜 등의 궁중 요리, 고품격 현수막 및 감사 영상 스크린 지원으로 기품 있는 효도를 선사합니다.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/main%20image%2F%EC%B9%A0%EC%88%9C%2C%ED%8C%94%EC%88%9C%EC%82%AC%EC%A7%84.jpg?alt=media&token=72118016-7ac4-42d4-93a5-189b97272ea1',
    icon: Sparkles
  },
  {
    num: '04',
    title: 'CORPORATE EVENTS',
    korTitle: '출장 뷔페',
    desc: '비즈니스의 가치를 높이는\n품격 있는 연회와 서비스',
    detail: '송년회, 신년회, 비즈니스 미팅, 제품 런칭 쇼케이스 등을 위해 대형 빔 프로젝터, 프로 음향 오디오 시스템 및 레이아웃 커스텀 테이블을 완비한 스페셜 홀을 대여해 드립니다.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/main%20image%2F%EC%B6%9C%EC%9E%A5%EB%B7%94%ED%8E%9801.jpg?alt=media&token=a6cf8cb4-cd32-4ac3-9c96-db71ba0a925f',
    icon: Briefcase
  },
  {
    num: '05',
    title: 'CATERING',
    korTitle: '케이터링',
    desc: '소규모 모임도,\n드마리스의 정성을\n그대로 담아드립니다.',
    detail: '가정, 야외 가든, 기업 사무실 등 원하시는 특별한 장소로 셰프들이 직접 출동하여 라이브 푸드 스테이션을 설치하고 데코레이션부터 케이터링 서비스까지 완벽하게 제공합니다.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/main%20image%2F%EC%BC%80%EC%9D%B4%ED%84%B0%EB%A7%8101.jpg?alt=media&token=556b5e80-21d0-4d3c-be45-144bc34db66d',
    icon: Coffee
  }
];

export default function App() {
  // Sync Data State via localStorage to act like a real backend
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('dmaris_reservations');
    return saved ? JSON.parse(saved) : initialReservations;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('dmaris_menu_items');
    return saved ? JSON.parse(saved) : initialMenuItems;
  });

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('dmaris_reviews_v3');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [heroImages, setHeroImages] = useState<HeroImage[]>(initialHeroImages);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-advance hero slideshow every 5 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Sync state to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem('dmaris_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('dmaris_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('dmaris_reviews_v3', JSON.stringify(reviews));
  }, [reviews]);

  // Firestore Real-time synchronization & seeding
  useEffect(() => {
    const q = query(collection(db, "gallery_items"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        initialGalleryItems.forEach((item) => {
          const docRef = doc(db, "gallery_items", item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
      } else {
        const items: GalleryItem[] = [];
        const existingIds = new Set<string>();
        const tempDocIdsToDelete: string[] = [];

        snapshot.forEach((docSnap) => {
          const itemData = docSnap.data() as GalleryItem;
          // Check if it's a temporary mock photo (Unsplash or legacy g1-g12 ID)
          const isTemp = /^g\d+$/.test(itemData.id) || (itemData.imageUrl && itemData.imageUrl.includes('images.unsplash.com'));
          if (isTemp) {
            tempDocIdsToDelete.push(docSnap.id);
          } else {
            items.push(itemData);
            existingIds.add(itemData.id);
          }
        });

        // Delete temporary mock photos from Firestore
        if (tempDocIdsToDelete.length > 0) {
          try {
            const batch = writeBatch(db);
            tempDocIdsToDelete.forEach((id) => {
              batch.delete(doc(db, "gallery_items", id));
            });
            batch.commit();
          } catch (err) {
            console.error("Error purging temp gallery docs:", err);
          }
        }

        // Seed any missing initial items (e.g. g-buffet-1~5) to Firestore if needed
        const missingItems = initialGalleryItems.filter(item => !existingIds.has(item.id));
        if (missingItems.length > 0) {
          try {
            const batch = writeBatch(db);
            missingItems.forEach((item) => {
              const docRef = doc(db, "gallery_items", item.id);
              batch.set(docRef, item);
              items.push(item);
            });
            batch.commit();
          } catch (err) {
            console.error("Error seeding missing gallery items:", err);
          }
        }

        items.sort((a, b) => {
          const getNum = (id: string) => {
            if (!id) return 0;
            if (id.startsWith('g-buffet-')) {
              const num = parseInt(id.replace('g-buffet-', ''), 10);
              return 1000 + (isNaN(num) ? 0 : num);
            }
            if (id.startsWith('g-')) {
              const num = parseInt(id.replace('g-', ''), 10);
              return isNaN(num) ? 0 : num;
            }
            if (id.startsWith('g')) {
              const num = parseInt(id.replace('g', ''), 10);
              return isNaN(num) ? 0 : num;
            }
            return 0;
          };
          return getNum(b.id) - getNum(a.id);
        });
        setGalleryItems(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "gallery_items");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "menu_items"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        initialMenuItems.forEach((item) => {
          const docRef = doc(db, "menu_items", item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
      } else {
        const items: MenuItem[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as MenuItem);
        });
        items.sort((a, b) => {
          const getNum = (id: string) => {
            if (id.startsWith('m-')) {
              return parseInt(id.replace('m-', '')) || Date.now();
            }
            return parseInt(id.replace('m', '')) || 0;
          };
          return getNum(b.id) - getNum(a.id);
        });
        setMenuItems(items);
      }
    }, (error) => {
      console.error("Error loading menu_items:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "reservations"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        initialReservations.forEach((item) => {
          const docRef = doc(db, "reservations", item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
      } else {
        const items: Reservation[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as Reservation);
        });
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setReservations(items);
      }
    }, (error) => {
      console.error("Error loading reservations:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "reviews"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        initialReviews.forEach((item) => {
          const docRef = doc(db, "reviews", item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
      } else {
        const items: Review[] = [];
        let r1NeedsUpdate = false;
        snapshot.forEach((docSnap) => {
          const item = docSnap.data() as Review;
          if (item.id === 'r1' && (!item.content || item.content.startsWith('아이의 첫 생일'))) {
            item.content = initialReviews[0].content;
            r1NeedsUpdate = true;
          }
          items.push(item);
        });
        if (r1NeedsUpdate) {
          try {
            await setDoc(doc(db, "reviews", "r1"), initialReviews[0], { merge: true });
          } catch (err) {
            console.error("Error updating r1 review in Firestore:", err);
          }
        }
        items.sort((a, b) => b.date.localeCompare(a.date));
        setReviews(items);
      }
    }, (error) => {
      console.error("Error loading reviews:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "hero_images"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        initialHeroImages.forEach((item) => {
          const docRef = doc(db, "hero_images", item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
      } else {
        const items: HeroImage[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as HeroImage);
        });
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setHeroImages(items);
      }
    }, (error) => {
      console.error("Error loading hero_images:", error);
      handleFirestoreError(error, OperationType.GET, "hero_images");
    });
    return () => unsubscribe();
  }, []);

  // Preload hero images so background images load instantly with text
  useEffect(() => {
    if (heroImages.length > 0) {
      heroImages.forEach((item) => {
        if (item.imageUrl) {
          const img = new Image();
          img.src = item.imageUrl;
        }
      });
    }
  }, [heroImages]);

  // Maintain original aspect ratio of favicon logo without stretching or distortion
  useEffect(() => {
    const faviconUrl = "https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/logo%2F%ED%8C%8C%EB%B9%84%EC%BD%98%EB%A1%9C%EA%B3%A001.png?alt=media&token=c2c3314b-e003-454e-8cfb-0f1a0eaf5ec7";
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 128; // High resolution square canvas for crisp display
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate proportional scale so original aspect ratio is 100% preserved
        const scale = Math.min(size / img.width, size / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const x = (size - drawWidth) / 2;
        const y = (size - drawHeight) / 2;

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        const dataUrl = canvas.toDataURL('image/png');

        const faviconElements = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
        faviconElements.forEach((el) => {
          el.href = dataUrl;
        });
      } catch (e) {
        console.warn('Could not generate proportional favicon canvas:', e);
      }
    };
    img.src = faviconUrl;
  }, []);

  // Sync updaters to handle Firebase writes with optimistic UI updates & parallel async promises
  const handleUpdateReservations = async (newList: Reservation[]) => {
    setReservations(newList);
    try {
      const newIds = new Set(newList.map(r => r.id));
      const toDelete = reservations.filter(r => !newIds.has(r.id));
      const oldMap = new Map(reservations.map(r => [r.id, r]));
      const toWrite = newList.filter(item => {
        const oldItem = oldMap.get(item.id);
        if (!oldItem) return true;
        return JSON.stringify(item) !== JSON.stringify(oldItem);
      });

      const promises: Promise<void>[] = [];
      for (const item of toDelete) {
        promises.push(deleteDoc(doc(db, "reservations", item.id)));
      }
      for (const item of toWrite) {
        promises.push(setDoc(doc(db, "reservations", item.id), item));
      }
      await Promise.all(promises);
    } catch (e) {
      console.error("Sync reservations error:", e);
    }
  };

  const handleUpdateMenuItems = async (newList: MenuItem[]) => {
    setMenuItems(newList);
    try {
      const newIds = new Set(newList.map(r => r.id));
      const toDelete = menuItems.filter(r => !newIds.has(r.id));
      const oldMap = new Map(menuItems.map(r => [r.id, r]));
      const toWrite = newList.filter(item => {
        const oldItem = oldMap.get(item.id);
        if (!oldItem) return true;
        return JSON.stringify(item) !== JSON.stringify(oldItem);
      });

      const promises: Promise<void>[] = [];
      for (const item of toDelete) {
        promises.push(deleteDoc(doc(db, "menu_items", item.id)));
      }
      for (const item of toWrite) {
        promises.push(setDoc(doc(db, "menu_items", item.id), item));
      }
      await Promise.all(promises);
    } catch (e) {
      console.error("Sync menu_items error:", e);
    }
  };

  const handleUpdateGalleryItems = async (newList: GalleryItem[]) => {
    setGalleryItems(newList);
    try {
      const newIds = new Set(newList.map(r => r.id));
      const toDelete = galleryItems.filter(r => !newIds.has(r.id));
      const oldMap = new Map(galleryItems.map(r => [r.id, r]));
      const toWrite = newList.filter(item => {
        const oldItem = oldMap.get(item.id);
        if (!oldItem) return true;
        return JSON.stringify(item) !== JSON.stringify(oldItem);
      });

      const promises: Promise<void>[] = [];
      for (const item of toDelete) {
        promises.push(deleteDoc(doc(db, "gallery_items", item.id)));
      }
      for (const item of toWrite) {
        promises.push(setDoc(doc(db, "gallery_items", item.id), item));
      }
      await Promise.all(promises);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "gallery_items");
    }
  };

  const handleUpdateReviews = async (newList: Review[]) => {
    setReviews(newList);
    try {
      const newIds = new Set(newList.map(r => r.id));
      const toDelete = reviews.filter(r => !newIds.has(r.id));
      const oldMap = new Map(reviews.map(r => [r.id, r]));
      const toWrite = newList.filter(item => {
        const oldItem = oldMap.get(item.id);
        if (!oldItem) return true;
        return JSON.stringify(item) !== JSON.stringify(oldItem);
      });

      const promises: Promise<void>[] = [];
      for (const item of toDelete) {
        promises.push(deleteDoc(doc(db, "reviews", item.id)));
      }
      for (const item of toWrite) {
        promises.push(setDoc(doc(db, "reviews", item.id), item));
      }
      await Promise.all(promises);
    } catch (e) {
      console.error("Sync reviews error:", e);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await deleteDoc(doc(db, "reservations", id));
      setReservations(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error("Error deleting reservation:", e);
      alert("예약 정보를 삭제하는 도중 오류가 발생했습니다: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "menu_items", id));
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error("Error deleting menu item:", e);
      alert("메뉴를 삭제하는 도중 오류가 발생했습니다: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "gallery_items", id));
      setGalleryItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `gallery_items/${id}`);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error("Error deleting review:", e);
      alert("후기를 삭제하는 도중 오류가 발생했습니다: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleUpdateHeroImages = async (newList: HeroImage[]) => {
    setHeroImages(newList);
    try {
      const newIds = new Set(newList.map(r => r.id));
      const toDelete = heroImages.filter(r => !newIds.has(r.id));
      const oldMap = new Map(heroImages.map(r => [r.id, r]));
      const toWrite = newList.filter(item => {
        const oldItem = oldMap.get(item.id);
        if (!oldItem) return true;
        return JSON.stringify(item) !== JSON.stringify(oldItem);
      });

      const promises: Promise<void>[] = [];
      for (const item of toDelete) {
        promises.push(deleteDoc(doc(db, "hero_images", item.id)));
      }
      for (const item of toWrite) {
        promises.push(setDoc(doc(db, "hero_images", item.id), item));
      }
      await Promise.all(promises);
    } catch (e) {
      console.error("Sync hero_images error:", e);
    }
  };

  const handleDeleteHeroImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "hero_images", id));
      setHeroImages(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error("Error deleting hero image:", e);
      alert("메인사진을 삭제하는 도중 오류가 발생했습니다: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  // UI Control States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeGalleryTab, setActiveGalleryTab] = useState<'ALL' | 'WEDDING' | 'BIRTHDAY' | 'LONGEVITY' | 'CORPORATE' | 'CATERING' | 'BUFFET'>('ALL');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isServicesHovered, setIsServicesHovered] = useState(false);
  const [isServicePageOpen, setIsServicePageOpen] = useState(false);
  const [isReviewPageOpen, setIsReviewPageOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState(0);
  const [activeServiceSubCategory, setActiveServiceSubCategory] = useState<string>('전체');
  const [servicePageViewMode, setServicePageViewMode] = useState<'service' | 'gallery'>('service');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isServicesHovered) return;
    const interval = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % services.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isServicesHovered]);

  // Append new reservation locally
  const handleNewReservation = async (newRes: Reservation) => {
    try {
      await setDoc(doc(db, "reservations", newRes.id), newRes);
    } catch (error) {
      console.error("Error creating reservation:", error);
    }

    fetch("https://eslehoon.app.n8n.cloud/webhook/dmaris-inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRes),
    }).catch((error) => {
      console.error("Error sending to n8n:", error);
    });

    setReservations(prev => [newRes, ...prev]);
  };

  // Helper for navigating and synchronizing URL paths (/service, /gallery, /reservation, /, /reviews)
  const navigateTo = (
    path: string, 
    options?: { 
      tabIndex?: number; 
      viewMode?: 'service' | 'gallery'; 
      subCat?: string;
      replace?: boolean;
      skipScroll?: boolean;
    }
  ) => {
    setIsMobileMenuOpen(false);

    // Normalize path
    const targetPath = path.startsWith('/') ? path : `/${path}`;
    
    // Update Browser History URL
    try {
      if (options?.replace) {
        window.history.replaceState({ path: targetPath }, '', targetPath);
      } else if (window.location.pathname !== targetPath) {
        window.history.pushState({ path: targetPath }, '', targetPath);
      }
    } catch (e) {
      console.warn('History navigation error:', e);
    }

    if (targetPath === '/service') {
      setIsReviewPageOpen(false);
      setIsServicePageOpen(true);
      setServicePageViewMode(options?.viewMode || 'service');
      if (options?.tabIndex !== undefined) setActiveServiceTab(options.tabIndex);
      if (!options?.skipScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetPath === '/gallery') {
      setIsReviewPageOpen(false);
      setIsServicePageOpen(true);
      setServicePageViewMode('gallery');
      if (options?.tabIndex !== undefined) setActiveServiceTab(options.tabIndex);
      if (options?.subCat) setActiveServiceSubCategory(options.subCat);
      if (!options?.skipScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetPath === '/reservation' || targetPath === '/reserve') {
      setIsServicePageOpen(false);
      setIsReviewPageOpen(false);
      setTimeout(() => {
        const el = document.getElementById('reserve');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else if (targetPath === '/reviews' || targetPath === '/review') {
      setIsServicePageOpen(false);
      setIsReviewPageOpen(true);
      if (!options?.skipScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    } else { // Home '/'
      setIsServicePageOpen(false);
      setIsReviewPageOpen(false);
      if (!options?.skipScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to browser direct URL navigation and Back/Forward buttons
  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      const hash = window.location.hash.toLowerCase();

      if (pathname === '/service' || hash === '#service') {
        setIsReviewPageOpen(false);
        setIsServicePageOpen(true);
        setServicePageViewMode('service');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (pathname === '/gallery' || hash === '#gallery') {
        setIsReviewPageOpen(false);
        setIsServicePageOpen(true);
        setServicePageViewMode('gallery');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (pathname === '/reservation' || pathname === '/reserve' || hash === '#reserve' || hash === '#reservation') {
        setIsServicePageOpen(false);
        setIsReviewPageOpen(false);
        setTimeout(() => {
          const el = document.getElementById('reserve');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else if (pathname === '/reviews' || pathname === '/review' || hash === '#review' || hash === '#reviews') {
        setIsServicePageOpen(false);
        setIsReviewPageOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (pathname === '/' || pathname === '') {
        setIsServicePageOpen(false);
        setIsReviewPageOpen(false);
      }
    };

    handleUrlRoute();

    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  // Navigate to specific gallery service page when clicked
  const handleGalleryItemClick = (category: string, title?: string) => {
    let tabIndex = 0;
    let subCat = '전체';
    if (category === 'WEDDING') {
      tabIndex = 0;
      if (title?.includes('교회')) subCat = '교회';
      else if (title?.includes('야외')) subCat = '야외';
      else if (title?.includes('스몰')) subCat = '스몰';
      else subCat = '고급웨딩홀';
    }
    else if (category === 'BIRTHDAY') {
      tabIndex = 1;
      if (title?.includes('전통')) subCat = '전통돌상';
      else if (title?.includes('현대')) subCat = '현대돌상';
      else subCat = '패키지연출';
    }
    else if (category === 'LONGEVITY') {
      tabIndex = 2;
      if (title?.includes('전통')) subCat = '전통생신상';
      else if (title?.includes('현대')) subCat = '현대생신상';
      else subCat = '직계가족예식';
    }
    else if (category === 'CORPORATE') {
      tabIndex = 3;
      if (title?.includes('세미나') || title?.includes('포럼')) subCat = '세미나·포럼';
      else if (title?.includes('사은회') || title?.includes('시상식') || title?.includes('뷔페 홀')) subCat = '사은회·시상식';
      else subCat = '연말파티';
    }
    else if (category === 'CATERING') {
      tabIndex = 4;
      if (title?.includes('디저트') || title?.includes('핑거')) subCat = '핑거푸드';
      else if (title?.includes('스시') || title?.includes('뷔페') || title?.includes('케이터링')) subCat = '럭셔리뷔페';
      else subCat = '홈파티박스';
    }
    else if (category === 'BUFFET') {
      tabIndex = 5;
      subCat = '출장뷔페';
    }
    else tabIndex = 0; // fallback default
    
    navigateTo('/gallery', { tabIndex, viewMode: 'gallery', subCat });
  };

  // Gallery tabs logic with deduplication by imageUrl
  const filteredGallery = useMemo(() => {
    const categoryFiltered = galleryItems.filter(item => {
      if (activeGalleryTab === 'ALL') return true;
      return item.category === activeGalleryTab;
    });

    const seenUrls = new Set<string>();
    return categoryFiltered.filter(item => {
      if (!item.imageUrl) return false;
      if (seenUrls.has(item.imageUrl)) return false;
      seenUrls.add(item.imageUrl);
      return true;
    });
  }, [galleryItems, activeGalleryTab]);



  // Helper for scroll to sections smoothly
  // Scroll to top when page views change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isServicePageOpen, isReviewPageOpen, servicePageViewMode, activeServiceTab]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    setIsServicePageOpen(false);
    setIsReviewPageOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element && id !== 'brand') {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-brand-bronze selection:text-white">
      
      {/* HEADER SECTION (Matching PC & Mobile layout requirements) */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        (isServicePageOpen || isReviewPageOpen)
          ? isScrolled
            ? 'bg-[#FAF8F5]/50 backdrop-blur-md border-b border-[#EFEBE4]/50 shadow-xs'
            : 'bg-[#FAF8F5] border-b border-[#EFEBE4] shadow-xs'
          : isScrolled 
            ? 'bg-white/50 backdrop-blur-md border-b border-neutral-200/40 shadow-md' 
            : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'
      }`}>
        <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${isScrolled || isServicePageOpen || isReviewPageOpen ? 'py-3' : 'py-4'}`}>
          
          {/* Logo */}
          <button 
            onClick={() => navigateTo('/')}
            className="text-left flex items-center focus:outline-none cursor-pointer group"
          >
            <img 
              src={(isScrolled || isServicePageOpen || isReviewPageOpen)
                ? "https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/logo%2F%EB%A1%9C%EA%B3%A001.png?alt=media&token=37d18b43-44db-4aa6-8111-ef8c3dd8e56f"
                : "https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/logo%2F%EB%A1%9C%EA%B3%A002.png?alt=media&token=a71ef1da-c59c-4aa8-a955-ae3d24e06472"
              }
              alt="D'MARIS Logo" 
              className="h-10 md:h-12 w-auto object-contain transition-all duration-300 group-hover:opacity-90"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* PC Navigation Links (Layout 2 spec) */}
          <nav className={`hidden md:flex items-center gap-8 text-xs tracking-widest font-sans font-medium transition-colors duration-300 ${(isScrolled || isServicePageOpen || isReviewPageOpen) ? 'text-gray-600' : 'text-gray-400'}`}>
            <button onClick={() => navigateTo('/')} className={`hover:text-brand-bronze transition cursor-pointer uppercase ${(!isServicePageOpen && !isReviewPageOpen) ? 'text-brand-bronze font-semibold' : ''}`}>DMARIS</button>
            <button onClick={() => navigateTo('/service', { tabIndex: 0, viewMode: 'service' })} className={`hover:text-brand-bronze transition cursor-pointer uppercase ${(isServicePageOpen && servicePageViewMode === 'service') ? 'text-brand-bronze font-semibold' : ''}`}>Service</button>
            <button onClick={() => navigateTo('/gallery', { tabIndex: 0, viewMode: 'gallery', subCat: '전체' })} className={`hover:text-brand-bronze transition cursor-pointer uppercase ${(isServicePageOpen && servicePageViewMode === 'gallery') ? 'text-brand-bronze font-semibold' : ''}`}>Gallery</button>
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Reservation Button - PC Only */}
            <button
              onClick={() => navigateTo('/reservation')}
              className="hidden sm:inline-flex bg-brand-bronze hover:bg-brand-bronze-dark text-white text-xs font-semibold tracking-wider uppercase py-2 px-5 rounded transition-all shadow shadow-brand-bronze/20 cursor-pointer"
            >
              Reservation
            </button>

            {/* Mobile Hamburger Burger Menu (Image 2 Mobile requirement) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden w-9 h-9 border rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer ${
                (isScrolled || isServicePageOpen || isReviewPageOpen) 
                  ? 'border-neutral-300 text-gray-600 hover:text-gray-900' 
                  : 'border-neutral-800 text-gray-400 hover:text-white'
              }`}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

          </div>

        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY (Image 2 layout support) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-30 pt-20 bg-[#0c0c0c] flex flex-col p-6 space-y-6 md:hidden border-b border-neutral-900 shadow-2xl"
          >
            <div className="flex flex-col space-y-4 pt-4 text-center">
              <button 
                onClick={() => navigateTo('/')} 
                className="text-lg font-serif py-3 border-b border-neutral-900 text-brand-cream hover:text-brand-bronze transition"
              >
                드마리스 브랜드 스토리
              </button>
              <button 
                onClick={() => navigateTo('/service', { tabIndex: 0, viewMode: 'service' })} 
                className="text-lg font-serif py-3 border-b border-neutral-900 text-brand-cream hover:text-brand-bronze transition"
              >
                인생연회 서비스안내
              </button>
              <button 
                onClick={() => navigateTo('/gallery', { tabIndex: 0, viewMode: 'gallery', subCat: '전체' })} 
                className="text-lg font-serif py-3 border-b border-neutral-900 text-brand-cream hover:text-brand-bronze transition"
              >
                완성된 순간들 갤러리
              </button>
              <button 
                onClick={() => navigateTo('/reservation')} 
                className="text-lg font-serif py-3 bg-brand-bronze text-white rounded-lg mt-4 shadow"
              >
                실시간 예약 신청하기
              </button>
            </div>

            <div className="mt-auto text-center space-y-2 text-xs text-gray-500 font-mono py-4">
              <p>DMARIS PREMIUM</p>
              <p>예약상담: 010-8078-4597</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isReviewPageOpen ? (
        <div className="pt-16">
          <ReviewPage
            reviews={reviews}
            onAddReview={async (newReview) => {
              try {
                await setDoc(doc(db, "reviews", newReview.id), newReview);
              } catch (e) {
                console.error("Error saving review:", e);
              }
              setReviews((prev) => [newReview, ...prev]);
            }}
            onUpdateReview={async (updatedReview) => {
              try {
                await setDoc(doc(db, "reviews", updatedReview.id), updatedReview);
              } catch (e) {
                console.error("Error updating review:", e);
              }
              setReviews((prev) => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
            }}
            onDeleteReview={handleDeleteReview}
            onClose={() => navigateTo('/')}
          />
        </div>
      ) : isServicePageOpen ? (
        <div className="pt-16">
          <ServicePage
            activeTab={activeServiceTab}
            setActiveTab={setActiveServiceTab}
            viewMode={servicePageViewMode}
            initialSubCategory={activeServiceSubCategory}
            onInquire={() => navigateTo('/reservation')}
            onAboutClick={() => setIsAboutModalOpen(true)}
            onAdminClick={() => setIsAdminOpen(true)}
            scrollToSection={scrollToSection}
            galleryItems={galleryItems}
          />
        </div>
      ) : (
        <>
          {/* HERO HERO SECTION (Dynamic Background Slideshow from heroImages) */}
          <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden pt-16">
        
            {/* Dynamic Synchronized Background Image Slider & Content */}
            <AnimatePresence mode="wait">
              {heroImages.length > 0 && (() => {
                const activeSlide = heroImages[currentHeroIndex % heroImages.length] || heroImages[0];
                const titleText = activeSlide?.title || "품격 있는 순간";
                const subText = activeSlide?.subtitle || "드마리스에서 완성됩니다";

                return (
                  <motion.div
                    key={activeSlide.id || currentHeroIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                      <motion.img
                        initial={{ scale: 1.06 }}
                        animate={{ scale: 1.0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        src={activeSlide.imageUrl}
                        alt={activeSlide.title || "Dmaris Main Hero"}
                        className="w-full h-full object-cover object-[center_35%] opacity-65"
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      {/* Elegant radial/bottom vignetting */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                    </div>

                    {/* Content Block */}
                    <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8 mt-10 pointer-events-auto">
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-8 h-[1px] bg-brand-bronze" />
                          <span className="font-mono text-xs tracking-[0.3em] uppercase text-brand-bronze font-bold">
                            DMARIS PREMIUM
                          </span>
                          <span className="w-8 h-[1px] bg-brand-bronze" />
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-[4rem] lg:text-[4.8rem] xl:text-[5.5rem] font-serif font-light text-brand-cream tracking-tight leading-tight md:leading-normal">
                          {titleText} <br />
                          <span className="block text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal italic text-brand-bronze mt-2 sm:mt-4 whitespace-nowrap">
                            {subText}
                          </span>
                        </h1>
                      </div>

                      <p className="text-gray-300 text-xs md:text-sm tracking-wider max-w-xl mx-auto font-sans leading-relaxed">
                        가족모임부터 돌잔치, 웨딩, 기업행사까지 <br />
                        특별한 하루를 더욱 특별하게 만드는 프리미엄 연회 공간
                      </p>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                          onClick={() => setIsAboutModalOpen(true)}
                          className="w-full sm:w-auto border border-brand-bronze/60 text-brand-cream hover:bg-brand-bronze/10 text-xs tracking-widest font-sans uppercase font-medium py-3 px-8 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>DMARIS 소개</span>
                          <ChevronRight size={13} className="text-brand-bronze" />
                        </button>

                        <button
                          onClick={() => scrollToSection('reserve')}
                          className="w-full sm:w-auto bg-brand-bronze hover:bg-brand-bronze-dark text-white text-xs tracking-widest font-sans uppercase font-semibold py-3 px-8 rounded-lg transition-all shadow shadow-brand-bronze/20 cursor-pointer"
                        >
                          견적 문의 및 예약
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Previous / Next Arrow Controls */}
            {heroImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer backdrop-blur-sm"
                  title="이전 사진"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length)}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer backdrop-blur-sm"
                  title="다음 사진"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

        {/* Bottom Pagination / Decoration & Slide Indicator */}
        <div className="absolute bottom-10 left-6 right-6 max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-gray-400 z-10">
          <div className="flex items-center gap-3">
            <span className="text-brand-bronze font-bold">
              {String((currentHeroIndex % Math.max(1, heroImages.length)) + 1).padStart(2, '0')}
            </span>
            <div className="w-20 sm:w-28 h-[2px] bg-neutral-800 relative rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 bottom-0 bg-amber-400"
                initial={{ width: "0%" }}
                animate={{ width: `${(((currentHeroIndex % Math.max(1, heroImages.length)) + 1) / Math.max(1, heroImages.length)) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span>{String(Math.max(1, heroImages.length)).padStart(2, '0')}</span>
          </div>

          {/* Slide Dots */}
          <div className="flex items-center gap-2">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === (currentHeroIndex % heroImages.length)
                    ? 'w-6 bg-brand-bronze'
                    : 'w-2 bg-neutral-600 hover:bg-neutral-400'
                }`}
                title={`${idx + 1}번 메인사진 보기`}
              />
            ))}
          </div>

          <div className="hidden md:block tracking-widest uppercase text-[10px] text-gray-500">
            Designed for Memories of life
          </div>
        </div>

      </section>


      {/* 01 / ABOUT DMARIS (Brand story with chef plating - Light Warm Sand bg) */}
      <section id="brand" className="py-24 bg-brand-beige text-brand-charcoal relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <span className="font-mono text-xs tracking-widest text-brand-bronze uppercase">01 / ABOUT DMARIS</span>
                <h2 className="text-3xl md:text-4xl font-serif leading-tight font-light tracking-tight">
                  부천을 대표하는 <br />
                  <span className="text-brand-bronze font-normal">프리미엄 연회 공간</span>
                </h2>
              </div>

              <div className="space-y-4 text-gray-600 text-sm leading-relaxed font-sans">
                <p>
                  드마리스는 단순한 뷔페가 아닙니다.<br /><br />
                  가족모임, 돌잔치, 회갑연, 웨딩, 기업행사까지<br />
                  소중한 사람들과 함께하는 모든 순간을 위해<br />
                  품격 있는 공간과 최고의 요리를 준비합니다.
                </p>
                <p>
                  라이브 셰프의 즉석 요리와 다양한 프리미엄 메뉴,<br />
                  넓고 쾌적한 단독 연회장,<br />
                  그리고 행사 전담 매니저의 세심한 서비스까지.<br /><br />
                  드마리스는 한 번의 식사가 아닌,<br />
                  오랫동안 기억될 특별한 하루를 만들어 드립니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-sans">
                <motion.div 
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/60 p-3.5 rounded-lg border border-neutral-200 shadow-sm"
                >
                  <div className="font-serif text-brand-bronze text-sm sm:text-base font-medium mb-1 whitespace-nowrap">PRIVATE HALL</div>
                  <div className="text-gray-500 text-[11px] leading-relaxed">
                    <strong className="font-bold text-gray-700 block whitespace-nowrap">단독 연회장</strong>
                    <span className="text-gray-500 block whitespace-nowrap mt-0.5">10인 ~ 200인 맞춤 연회</span>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/60 p-3.5 rounded-lg border border-neutral-200 shadow-sm"
                >
                  <div className="font-serif text-brand-bronze text-sm sm:text-base font-medium mb-1 whitespace-nowrap">LIVE DINING</div>
                  <div className="text-gray-500 text-[11px] leading-relaxed">
                    <strong className="font-bold text-gray-700 block whitespace-nowrap">프리미엄 라이브 키친</strong>
                    <span className="text-gray-500 block whitespace-nowrap mt-0.5">호텔급 즉석 라이브 요리</span>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/60 p-3.5 rounded-lg border border-neutral-200 shadow-sm"
                >
                  <div className="font-serif text-brand-bronze text-sm sm:text-base font-medium mb-1 whitespace-nowrap">EVENT SERVICE</div>
                  <div className="text-gray-500 text-[11px] leading-relaxed">
                    <strong className="font-bold text-gray-700 block whitespace-nowrap">행사 전문 케어</strong>
                    <span className="text-gray-500 block whitespace-nowrap mt-0.5">전담 매니저 맞춤 진행</span>
                  </div>
                </motion.div>
              </div>

              <button
                onClick={() => setIsAboutModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-brand-bronze font-semibold hover:text-brand-bronze-dark uppercase tracking-widest pt-2 cursor-pointer group"
              >
                <span>드마리스 스토리 더 알아보기</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Right Brand 2x2 Photo Grid */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-3 sm:gap-4 relative"
            >
              {[
                {
                  id: 'brand-photo-1',
                  title: '단독 연회 공간',
                  image: 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/main%20image%2FKakaoTalk_20260831_124625332.png?alt=media&token=1b9f7c90-1c32-497e-889c-f0cd2b601221'
                },
                {
                  id: 'brand-photo-2',
                  title: '라이브 셰프 키친',
                  image: 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/main%20image%2FKakaoTalk_20260831_124625332_01.jpg?alt=media&token=2b2727e2-1c87-40f9-a304-2ea2e3eeac3a'
                },
                {
                  id: 'brand-photo-3',
                  title: '프리미엄 뷔페 퀴진',
                  image: 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/main%20image%2FKakaoTalk_20260831_124625332_02.jpg?alt=media&token=5c0a7969-b1ae-4e1d-8724-fbc4fd2e55fd'
                },
                {
                  id: 'brand-photo-4',
                  title: '특별한 연회 케어',
                  image: 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/main%20image%2FKakaoTalk_20260831_124625332_03.jpg?alt=media&token=79664f6c-945b-4361-96eb-ddd811bbadd8'
                }
              ].map((item) => (
                <div
                  key={item.id}
                  id={item.id}
                  className="group relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-neutral-200/60 bg-neutral-100"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>


      {/* 02 / OUR SERVICES (Vertical premium cards) */}
      <section id="services" className="py-24 bg-[#FCFAF7] border-t border-b border-[#F2EAE0] text-[#332C26] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          >
            <div className="space-y-4">
              <span className="font-mono text-xs tracking-widest text-[#A68A70] uppercase">02 / OUR SERVICE</span>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-[#2C2520] leading-tight">
                우리가 짓는 <br />
                <span className="text-[#A68A70] font-normal">인생의 명장면들</span>
              </h2>
            </div>
          </motion.div>

          {/* Grid of 5 luxurious cards designed precisely as image.png with separated layouts and minimal rounded corners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {services.map((svc, idx) => {
              return (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <GlowCard
                    glowColor="bronze"
                    onClick={() => {
                      setActiveStoryIndex(idx);
                      navigateTo('/service', { tabIndex: idx, viewMode: 'service' });
                    }}
                    className={`group bg-white rounded-xl overflow-hidden border border-[#EFEBE4] text-center shadow-[0_4px_16px_rgba(202,189,173,0.08)] hover:shadow-[0_12px_28px_rgba(202,189,173,0.22)] transition-all duration-300 flex flex-col justify-between cursor-pointer h-full ${
                      activeStoryIndex === idx ? 'ring-2 ring-[#A68A70] shadow-[0_12px_28px_rgba(202,189,173,0.22)]' : ''
                    }`}
                  >
                    <div className="flex flex-col h-full z-20 relative">
                      {/* Visual separation: Image at the top with a crisp border underneath */}
                      <div className="relative aspect-[1.5] overflow-hidden border-b border-[#EFEBE4]">
                        <img
                          src={svc.imageUrl}
                          alt={svc.korTitle}
                          className={`w-full h-full object-cover transition-transform duration-700 ${
                            svc.title === 'CATERING'
                              ? 'scale-[1.3] group-hover:scale-[1.38] brightness-[1.06] contrast-[1.06] saturate-[1.12]'
                              : 'group-hover:scale-105'
                          }`}
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Text content separated with ample space */}
                      <div className="p-5 flex flex-col justify-between flex-grow bg-[#F5EFE6] group-hover:bg-[#EDE4D7] transition-colors duration-300">
                        <div className="space-y-3.5">
                          <div className="text-[11px] md:text-xs font-sans tracking-[0.22em] text-[#8C745C] uppercase font-normal">
                            {svc.title}
                          </div>
                          <h3 className="text-base md:text-lg font-serif font-medium text-[#2C2520] tracking-tight">
                            {svc.korTitle}
                          </h3>
                          <p className="text-[11px] md:text-xs text-[#857668] leading-relaxed font-sans whitespace-pre-line max-w-[200px] mx-auto min-h-[44px] flex items-center justify-center">
                            {svc.desc}
                          </p>
                        </div>

                        {/* Circular Chevron/Arrow Button */}
                        <div className="mt-5 flex justify-center">
                          <div className="w-8 h-8 rounded-full border border-[#DCD3C7] text-[#A68A70] flex items-center justify-center group-hover:bg-[#A68A70] group-hover:text-white group-hover:border-[#A68A70] transition-colors duration-300">
                            <ArrowRight size={14} className="stroke-[1.5]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              );
            })}
          </div>

          {/* Elegant active service details drawer below the grid */}
          <div
            onMouseEnter={() => setIsServicesHovered(true)}
            onMouseLeave={() => setIsServicesHovered(false)}
            className="mt-12 bg-white/80 rounded-sm p-6 border border-[#EFEBE4] max-w-4xl mx-auto shadow-sm backdrop-blur-sm overflow-hidden relative min-h-[140px] flex flex-col justify-center"
          >
            {/* Visual timer progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#F5EFE6]">
              <motion.div
                key={`progress-${activeStoryIndex}`}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
                className="h-full bg-[#A68A70]"
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStoryIndex}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 w-full"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-[#FCFAF7] flex items-center justify-center text-[#A68A70] border border-[#EFEBE4]">
                      {React.createElement(services[activeStoryIndex].icon, { size: 18 })}
                    </div>
                    <div>
                      <span className="font-mono text-[9px] tracking-wider text-[#A68A70] uppercase font-medium">
                        {services[activeStoryIndex].title} BENEFITS
                      </span>
                      <h4 className="text-sm font-serif font-medium text-[#2C2520]">
                        {services[activeStoryIndex].korTitle} 연회 서비스 특별 구성 및 강점
                      </h4>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigateTo('/service', { tabIndex: activeStoryIndex, viewMode: 'service' });
                    }}
                    className="bg-[#A68A70] hover:bg-[#8F765D] text-white text-[11px] font-sans font-semibold tracking-wider uppercase py-2 px-4 rounded transition-colors self-start sm:self-center cursor-pointer shadow-sm"
                  >
                    상세 정보 및 강점 보기
                  </button>
                </div>
                <p className="text-xs text-[#857668] leading-relaxed font-sans pl-6 sm:pl-13 border-l border-[#EFEBE4]">
                  {services[activeStoryIndex].detail}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>


      {/* 03 / GALLERY (Grid of images with premium tabs - Light theme) */}
      <section id="gallery" className="py-24 bg-brand-beige text-brand-charcoal border-t border-neutral-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center space-y-4 mb-12"
          >
            <span className="font-mono text-xs tracking-widest text-brand-bronze uppercase">03 / PHOTO GALLERY</span>
            <h2 className="text-3xl md:text-4xl font-serif text-center font-light">
              완성된 <span className="text-brand-bronze font-normal">순간들</span>
            </h2>
            <div className="w-10 h-[1px] bg-brand-bronze mx-auto mt-4" />
          </motion.div>

          {/* Category Tabs for snaps */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-10 text-xs font-sans"
          >
            {[
              { id: 'ALL', name: '최근소식' },
              { id: 'WEDDING', name: '웨딩' },
              { id: 'BIRTHDAY', name: '돌잔치' },
              { id: 'LONGEVITY', name: '장수연/회갑' },
              { id: 'CORPORATE', name: '기업행사' },
              { id: 'CATERING', name: '케이터링' },
              { id: 'BUFFET', name: '출장뷔페' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveGalleryTab(tab.id as any)}
                className={`px-5 py-2 rounded-full border transition cursor-pointer ${
                  activeGalleryTab === tab.id
                    ? 'bg-brand-charcoal text-white border-brand-charcoal font-semibold shadow'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 text-gray-500'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </motion.div>

          {/* Photo Snapshots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <AnimatePresence mode="popLayout">
              {filteredGallery.slice(0, 8).map((snap, idx) => (
                <motion.div
                  key={snap.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="w-full"
                >
                  <GlowCard
                    glowColor="bronze"
                    onClick={() => handleGalleryItemClick(snap.category, snap.title)}
                    className="group relative aspect-[10/7] rounded-lg overflow-hidden bg-gray-200 border border-neutral-200/60 shadow-sm cursor-pointer w-full h-full"
                  >
                    <img
                      src={snap.imageUrl || 'https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/gallery%2FKakaoTalk_20260706_124040941-1.jpg?alt=media&token=67f3c057-cc0e-4eb2-baac-81829d4291ad'}
                      alt={snap.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.failed) {
                          target.dataset.failed = "true";
                          target.src = "https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/gallery%2FKakaoTalk_20260706_124040941-1.jpg?alt=media&token=67f3c057-cc0e-4eb2-baac-81829d4291ad";
                        }
                      }}
                    />
                    {/* Glassmorphism details footer with clickable indicator */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-100 p-4 flex flex-col justify-end space-y-1 text-white z-20">
                      <span className="font-mono text-[9px] text-brand-bronze tracking-wider uppercase font-bold">{snap.category}</span>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-sans font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[70%]">
                          {snap.title}
                        </h4>
                        <span className="text-[10px] text-amber-400 font-sans flex items-center gap-1 hover:underline">
                          갤러리 이동 →
                        </span>
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty snap screen */}
          {filteredGallery.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-xs font-sans bg-white/40 rounded-xl border border-neutral-200">
              해당 분류로 등록된 갤러리 행사 사진이 없습니다.
            </div>
          )}

        </div>
      </section>


      {/* 04 / COMMUNITY REVIEWS (Designed as image.png spec) */}
      <section id="reviews" className="py-24 relative overflow-hidden bg-stone-100/70 text-[#2C2520] border-t border-b border-[#E8DEC8]">
        {/* Soft overhead culinary background overlay matching image.png */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1600&auto=format&fit=crop&q=80"
            alt="Dining Background"
            className="w-full h-full object-cover opacity-15 filter contrast-125"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/90 via-[#FAF8F5]/85 to-[#FAF8F5]/90 backdrop-blur-[2px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Header block with Pill badge, Title and Subtitle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="font-mono text-xs tracking-widest text-brand-bronze uppercase block mb-3.5">04 / REVIEW</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#2C2520] font-normal tracking-tight">
              드마리스를 경험한 <span className="text-[#A68A70] font-semibold">고객님들의 이야기</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base font-sans max-w-xl mx-auto mt-3 leading-relaxed">
              드마리스와 함께 특별한 순간을 만들어가신 고객님들의 진솔한 평점과 후기입니다.
            </p>
          </motion.div>

          {/* Cards grid (Static review text as requested) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                id: 'static-r1',
                rating: 5,
                content: '해산물 뷔페를 다녀왔는데 기대 이상으로 만족스러웠어요. 보통 뷔페는 종류만 많고 맛은 평범한 경우가 많은데, 여기는 하나하나 음식 퀄리티가 좋아서 놀랐어요. 특히 해산물 신선도가 좋아서 비린 맛 없이 깔끔했고, 회랑 초밥도 수준급이었어요. 돌잔치나 칠순잔치, 스몰웨딩 같은 가족 행사나 특별한 날에 이용하기에도 분위기가 잘 갖춰져 있어서 좋을 것 같아요. 공간도 깔끔하고 테이블 간 간격도 여유 있어서 편하게 식사할 수 있었어요. 일반 뷔페보다 확실히 한 단계 위 느낌이라 다음에 중요한 자리 생기면 다시 방문하고 싶은 곳이에요.',
                author: '쿠키랑구찌랑',
                eventType: '돌잔치',
                date: '4.19.일'
              },
              {
                id: 'static-r2',
                rating: 5,
                content: '친구 생일을 맞아 방문했어요. 음식도 만족했지만 아늑한 분위기와 친절한 직원들의 서비스가 감동이네요. 갑자기 뭉친 자리라 생일케익을 준비못했지만 대표님의 배려로 조각 케익 모듬으로 근사한 케익이 만들어졌고 소중한 순간을 사진으로 남겨주시는 배려도 보여주셨어요. 신선한 스시는 제 몸무게 만큼 먹어서 다이어트는 망혔지만 맛있는 음식과 기분좋은 서비스로 행복한 하루가 됐습니다. 부천에서 보물같은 곳을 발견해서 행복합니다^^',
                author: '곱게자란아가씨',
                eventType: '웨딩',
                date: '3.19.목'
              },
              {
                id: 'static-r3',
                rating: 5,
                content: '드마리스 청라점을 2달에 1번꼴로 이용했는데, 이사 가면서 드마리스 부천점을 오늘 처음 방문해 봤다. 나름 이런류의 뷔페를 좋아해서 애슐X, 고메X퀘어, 쿠우X우, 샤브X데이 등 매달 어딘가는 이용하고 있다. 그런데 내가 가 보았던 5만원 이하의 뷔페 중에서 여기 드마리스 부천점이 1등이다. 음식 하나하나의 퀄리티가 말이 안된다. 솔직히 드마리스 청라점보다도 맛있고, 여타 다른 뷔페들이랑은 비교 자체가 안된다. 먹으면서 계속 감탄하다 나왔다. 퀄리티가 좋아서 어이없을 정도였다. 심지어 마지막에 마신 커피까지 퀄리티가 좋더라.. 여기 뭐냐.. 이제부터 여기 단골이다..\n음식이 맛있어요+2개의 리뷰가 더 있습니다펼쳐보기',
                author: 'Bony5',
                eventType: '기업행사',
                date: '7.1.수'
              }
            ].map((rev, idx) => (
              <motion.div 
                key={rev.id} 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-[#EFEBE4] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgba(166,138,112,0.18)] transition-all duration-300 flex flex-col justify-between text-left h-full group"
              >
                <div className="space-y-4">
                  {/* Star Rating & Numeric Rating Score */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-700 font-mono">
                      {rev.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Review Content inside quotes */}
                  <p className="text-gray-700 text-sm md:text-[15px] leading-relaxed font-sans italic my-4 min-h-[72px] whitespace-pre-line">
                    "{rev.content}"
                  </p>
                </div>

                {/* Customer Info */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                      {rev.author} 님
                    </h4>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {rev.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <a
              href="https://pcmap.place.naver.com/restaurant/1979235118/review?bk_query=%EB%B6%80%EC%B2%9C%20%EB%93%9C%EB%A7%88%EB%A6%AC%EC%8A%A4&entry=bmp&fromPanelNum=2&locale=ko&searchText=%EB%B6%80%EC%B2%9C%20%EB%93%9C%EB%A7%88%EB%A6%AC%EC%8A%A4&svcName=map_pcv5&timestamp=202608140040&reviewTheme=total"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#8C745C] bg-white border border-[#E2D8C8] hover:bg-[#A68A70] hover:text-white hover:border-[#A68A70] transition-all duration-300 cursor-pointer px-6 py-3 rounded-full shadow-xs hover:shadow"
            >
              <span>전체 고객 후기 및 작성하기</span>
              <ChevronRight size={14} />
            </a>
          </motion.div>

        </div>
      </section>


      {/* BOOKING RESERVATION FORM (Section 05 / RESERVE) */}
      <BookingForm onNewReservation={handleNewReservation} />


      {/* OPERATING INFO BLOCK SECTION */}
      <section className="py-12 bg-neutral-950 border-t border-neutral-900/60 text-xs text-gray-400 font-sans overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="space-y-3">
            <h4 className="text-brand-cream font-serif font-semibold tracking-wider">이용 시간</h4>
            <ul className="space-y-1 text-gray-400 text-[11px]">
              <li>평일 런치: 11:30 - 15:30</li>
              <li>평일 디너: 17:30 - 21:30</li>
              <li>주말 & 공휴일: 11:30 - 22:00</li>
              <li className="text-[10px] text-gray-500">* 브레이크 타임 (평일만): 15:30 - 17:30</li>
              <li className="text-amber-400/90 font-medium pt-0.5">* 매주 월요일 / 화요일 휴무</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-brand-cream font-serif font-semibold tracking-wider">단체 고객 특전</h4>
            <p className="leading-relaxed text-[11px] text-gray-400">
              50인 이상 단체 계약 시 단독 룸 대관 무료, 프리미엄 빔 프로젝터 및 마이크 음향 시설 무료 세팅, 돌상 연출 제휴 할인이 적용됩니다.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-brand-cream font-serif font-semibold tracking-wider">드마리스 명가</h4>
            <p className="leading-relaxed text-[11px] text-gray-400">
              최고급 대규모 연회를 안정감 있고 우아하게 책임지며, 평생 간직할 인생의 아름다운 장면을 선물합니다.
            </p>
          </div>

        </motion.div>
      </section>


      {/* FOOTER SECTION */}
      <footer className="bg-[#080808] border-t border-neutral-900 py-12 text-gray-500 text-xs font-sans">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-6 space-y-8"
        >
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-neutral-900 pb-8">
            <div className="text-left flex flex-col gap-1">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/dmaris-932df.firebasestorage.app/o/logo%2F%EB%A1%9C%EA%B3%A001.png?alt=media&token=37d18b43-44db-4aa6-8111-ef8c3dd8e56f" 
                alt="D'MARIS Logo" 
                className="h-9 w-auto object-contain self-start"
                referrerPolicy="no-referrer"
              />
              <p className="text-[10px] tracking-wider text-gray-600 uppercase mt-1">
                The chapter of beautiful memories starts here
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-gray-400">
              <button onClick={() => setIsAboutModalOpen(true)} className="hover:text-brand-bronze transition cursor-pointer">회사소개</button>
              <button onClick={() => scrollToSection('services')} className="hover:text-brand-bronze transition cursor-pointer">이용약관</button>
              <button onClick={() => scrollToSection('reserve')} className="hover:text-brand-bronze transition cursor-pointer">개인정보처리방침</button>
              <button onClick={() => setIsAdminOpen(true)} className="hover:text-brand-bronze transition cursor-pointer text-brand-bronze font-medium">관리자 전용</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-[11px] text-gray-600">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 flex-wrap">
                <span>주소: 경기도 부천시 원미구 길주로 71 리파인빌 B/D 3층 드마리스 부천점</span>
                <a 
                  href="https://naver.me/xD8WOx2a" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-bronze hover:text-brand-cream underline underline-offset-2 transition ml-1"
                >
                  <MapPin size={12} />
                  네이버 지도
                </a>
              </p>
              <p>Tel : 032-323-3888 | Fax : 032-323-3888</p>
              <p>사업자등록번호 : 793-81-03151 | 이메일 : ross604@naver.com</p>
            </div>
            
            <div className="text-left md:text-right space-y-1">
              <p>© 2026 DMARIS. ALL RIGHTS RESERVED.</p>
              <p className="text-[9px] text-gray-700">All photographs are simulated representative graphics of premium culinary arts.</p>
            </div>
          </div>

        </motion.div>
      </footer>
        </>
      )}


      {/* ABOUT BRAND MODAL DRAWER (Gives massive interactive premium depth) */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-2xl max-w-2xl w-full p-8 relative overflow-hidden"
            >
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="font-mono text-[10px] tracking-widest text-brand-bronze uppercase">Heritage Story</span>
                  <h3 className="text-2xl font-serif text-brand-cream">
                    드마리스 프리미엄 <span className="text-brand-bronze">연회 브랜드 가치</span>
                  </h3>
                  <div className="w-10 h-[1px] bg-brand-bronze" />
                </div>

                <div className="space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
                  <p>
                    <strong>1. 특급 셰프들의 즉석 라이브 요리</strong><br />
                    드마리스는 단순 보관식 뷔페가 아닙니다. 코너별 배치된 스페셜 셰프팀이 즉석에서 그릴 시어링하는 프라임 부위 토마호크/등심 스테이크와, 스시 라이브 매스킹 존에서 쥐어 올리는 참다랑어 오토로 스시는 한 입 가득 최상의 격조를 자랑합니다.
                  </p>
                  
                  <p>
                    <strong>2. 최첨단 연회 조율과 프라이빗 룸</strong><br />
                    소규모 10인 이상 돌잔치 룸부터 최대 500인 수용 가능한 그랜드 볼룸 웨딩홀까지 완비되어 있습니다. 최신 무선 마이크 사운드 엠프 시스템과 미디어 슬라이드 세팅으로 깔끔한 진행을 보조합니다.
                  </p>

                  <p>
                    <strong>3. 위생과 안전의 엄격한 가치</strong><br />
                    HACCP 기준 위생 검사를 매주 수시로 이행하여 해산물 사시미 코너 및 전체 요리의 신선도를 완벽하게 준수하고 엄선합니다. 안심하고 사랑하는 가족, 친지, 귀한 바이어 분들을 식사에 초청하십시오.
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>Dmaris Luxury Fine Dining</span>
                  <button
                    onClick={() => {
                      setIsAboutModalOpen(false);
                      scrollToSection('reserve');
                    }}
                    className="bg-brand-bronze hover:bg-brand-bronze-dark text-white font-sans text-xs px-4 py-2 rounded font-semibold transition cursor-pointer"
                  >
                    상담 예약 접수하기
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ADMIN PANEL CONTAINER DASHBOARD */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel
            reservations={reservations}
            menuItems={menuItems}
            galleryItems={galleryItems}
            reviews={reviews}
            heroImages={heroImages}
            onUpdateReservations={handleUpdateReservations}
            onUpdateMenuItems={handleUpdateMenuItems}
            onUpdateGalleryItems={handleUpdateGalleryItems}
            onUpdateReviews={handleUpdateReviews}
            onUpdateHeroImages={handleUpdateHeroImages}
            onDeleteReservation={handleDeleteReservation}
            onDeleteMenuItem={handleDeleteMenuItem}
            onDeleteGalleryItem={handleDeleteGalleryItem}
            onDeleteReview={handleDeleteReview}
            onDeleteHeroImage={handleDeleteHeroImage}
            onClose={() => setIsAdminOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}