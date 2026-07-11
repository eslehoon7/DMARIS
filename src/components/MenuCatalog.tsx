/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MenuItem } from '../types';
import { Search, Crown, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuCatalogProps {
  items: MenuItem[];
}

const CATEGORIES = [
  { id: 'ALL', name: '전체 메뉴' },
  { id: 'STEAK', name: '그릴 스테이크' },
  { id: 'SUSHI', name: '스시 & 일식 사시미' },
  { id: 'CHINESE', name: '중화 파인 다이닝' },
  { id: 'KOREAN', name: '궁중 전통 한식' },
  { id: 'DESSERT', name: '베이커리 & 디저트' }
];

export default function MenuCatalog({ items }: MenuCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'STEAK' | 'SUSHI' | 'CHINESE' | 'DESSERT' | 'KOREAN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyPremium, setOnlyPremium] = useState(false);

  // Filtered menu logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPremium = !onlyPremium || item.isPremium;
      return matchCategory && matchSearch && matchPremium && item.isAvailable;
    });
  }, [items, selectedCategory, searchQuery, onlyPremium]);

  return (
    <section id="menu-catalog" className="py-24 bg-neutral-950 text-white relative border-t border-neutral-900">
      {/* Absolute Decorative Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-bronze/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-amber-950/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <div className="text-center space-y-4 mb-16">
          <span className="font-mono text-xs tracking-widest text-brand-bronze uppercase">DMARIS SIGNATURE CUISINES</span>
          <h2 className="text-3xl md:text-5xl font-serif font-light text-brand-cream">
            드마리스 <span className="text-brand-bronze font-normal">프리미엄 퀴진</span>
          </h2>
          <div className="w-12 h-[1px] bg-brand-bronze mx-auto mt-6" />
          <p className="text-gray-400 text-sm max-w-2xl mx-auto font-sans leading-relaxed">
            마스터 셰프 그룹이 최고급 식재료로 조리해 내는 라이브 파인 다이닝 대표 요리를 만나보세요. 
            신선함과 기품을 가득 채워 품격 있는 미식 여행을 선사합니다.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="space-y-6 mb-12">
          
          {/* Categories Grid (Optimized list) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-5 py-2.5 rounded-full font-sans text-xs tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-brand-bronze text-white shadow-md shadow-brand-bronze/20 font-semibold'
                    : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-gray-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Bar & Premium Filter */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80 max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="검색하고 싶은 요리명을 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-4 text-xs text-brand-cream focus:outline-none focus:border-brand-bronze transition"
              />
              <Search size={14} className="absolute left-3 top-3 text-gray-500" />
            </div>

            {/* Signature Filter Switch */}
            <button
              onClick={() => setOnlyPremium(!onlyPremium)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs tracking-wider font-sans transition-all cursor-pointer ${
                onlyPremium
                  ? 'bg-amber-950/40 border-brand-bronze text-brand-bronze'
                  : 'bg-transparent border-neutral-800 hover:border-neutral-700 text-gray-400 hover:text-white'
              }`}
            >
              <Crown size={14} className={onlyPremium ? 'text-brand-bronze fill-brand-bronze' : 'text-gray-400'} />
              <span>시그니처 프리미엄만 보기</span>
              {onlyPremium && <Check size={12} className="ml-1 text-brand-bronze" />}
            </button>
          </div>

        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                className="group bg-neutral-900/40 rounded-xl overflow-hidden border border-neutral-800/80 hover:border-brand-bronze/40 transition-all duration-300 flex flex-col h-full"
              >
                
                {/* Image Container with Zoom effect */}
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-950">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Indicator */}
                  <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-gray-300 px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase">
                    {item.category}
                  </div>

                  {/* Premium Badge */}
                  {item.isPremium && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-serif px-2.5 py-1 rounded text-[10px] tracking-wider uppercase font-medium flex items-center gap-1 shadow-lg shadow-black/40">
                      <Crown size={10} className="fill-white" />
                      <span>SIGNATURE</span>
                    </div>
                  )}
                </div>

                {/* Detail Information */}
                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-serif text-brand-cream group-hover:text-brand-bronze transition-colors duration-300">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans min-h-[40px]">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="font-sans text-[11px] tracking-widest text-gray-500 uppercase">Estimated Value</span>
                    <span className="text-brand-bronze font-mono text-sm font-semibold">
                      ₩ {item.price.toLocaleString()} ~
                    </span>
                  </div>

                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-neutral-900/10 rounded-xl border border-dashed border-neutral-800/80">
            <Sparkles className="mx-auto text-gray-600 mb-4" size={28} />
            <p className="text-sm text-gray-500 font-sans">
              조건에 해당하는 퀴진 요리가 존재하지 않습니다.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
                setOnlyPremium(false);
              }}
              className="mt-4 text-xs text-brand-bronze hover:underline font-sans"
            >
              필터 초기화하기
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
