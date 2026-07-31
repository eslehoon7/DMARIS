/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Reservation {
  id: string;
  eventType: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  contact: string;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'ALL' | 'STEAK' | 'SUSHI' | 'CHINESE' | 'DESSERT' | 'KOREAN';
  description: string;
  price: number; // or string representation
  imageUrl: string;
  isPremium: boolean;
  isAvailable: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'WEDDING' | 'BIRTHDAY' | 'LONGEVITY' | 'CORPORATE' | 'CATERING' | 'BUFFET';
  subCategory?: string;
  date: string;
  imageUrl: string;
}

export interface Review {
  id: string;
  author: string;
  eventType: string;
  content: string;
  rating: number;
  date: string;
  isVerified?: boolean;
  verificationType?: 'booking' | 'receipt' | 'none';
  receiptImage?: string;
  phoneLast4?: string;
  phone?: string;
  eventDate?: string;
}

export interface HeroImage {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  createdAt?: string;
}
