/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Reservation } from '../types';
import { Calendar, Users, Phone, User, Tag, Clock, AlignLeft, CheckCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingFormProps {
  onNewReservation: (res: Reservation) => void;
}

export default function BookingForm({ onNewReservation }: BookingFormProps) {
  const [eventType, setEventType] = useState('WEDDING');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [guests, setGuests] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  
  // Custom interactive calendar state
  const today = new Date();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (calendarContainerRef.current && !calendarContainerRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isCalendarOpen]);

  const toggleCalendar = () => {
    if (!isCalendarOpen && date) {
      const parts = date.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
    setIsCalendarOpen(prev => !prev);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleTodayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    setViewYear(y);
    setViewMonth(m);
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setDate(dateStr);
    setIsCalendarOpen(false);
  };

  const handleSelectDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setDate(dateStr);
    setIsCalendarOpen(false);
  };

  const formatDisplayDate = (val: string) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;
    }
    return val;
  };

  // Generate calendar days
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonthDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push({
      day: daysInPrevMonth - i,
      month: viewMonth === 0 ? 11 : viewMonth - 1,
      year: viewMonth === 0 ? viewYear - 1 : viewYear,
      isCurrentMonth: false,
    });
  }

  const currentMonthDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    currentMonthDays.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      dateStr,
      isCurrentMonth: true,
      isSelected: date === dateStr,
      isToday: todayStr === dateStr,
    });
  }

  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthDays = [];
  for (let d = 1; d <= nextMonthDaysCount; d++) {
    nextMonthDays.push({
      day: d,
      month: viewMonth === 11 ? 0 : viewMonth + 1,
      year: viewMonth === 11 ? viewYear + 1 : viewYear,
      isCurrentMonth: false,
    });
  }

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numbersOnly = rawVal.replace(/[^0-9]/g, '').slice(0, 11);
    
    let formatted = numbersOnly;
    if (numbersOnly.length > 7) {
      formatted = `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7)}`;
    } else if (numbersOnly.length > 3) {
      formatted = `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
    }
    
    setContact(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!date) {
      setErrorMsg('행사 예정일을 선택해 주세요.');
      return;
    }
    if (!guests || parseInt(guests) <= 0) {
      setErrorMsg('예상 인원을 정확히 입력해 주세요.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('신청인 성함을 입력해 주세요.');
      return;
    }
    if (!contact.trim()) {
      setErrorMsg('연락처를 입력해 주세요.');
      return;
    }

    const newRes: Reservation = {
      id: 'res-' + Date.now(),
      eventType,
      date,
      time,
      guests: parseInt(guests),
      name: name.trim(),
      contact: contact.trim(),
      notes: notes.trim(),
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onNewReservation(newRes);
    setIsSuccess(true);
    
    // Clear inputs
    setDate('');
    setGuests('');
    setName('');
    setContact('');
    setNotes('');

    // Clear success banner after 5 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 5000);
  };

  return (
    <section id="reserve" className="py-24 bg-brand-charcoal text-white relative overflow-hidden border-t border-amber-950/30">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-bronze/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Description Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="space-y-4">
              <span className="font-mono text-xs tracking-widest text-brand-bronze uppercase">05 / RESERVE</span>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight font-light text-brand-cream tracking-tight">
                다음 이야기의 <br />
                <span className="text-brand-bronze font-normal">주인공</span>은 <br />
                당신입니다
              </h2>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              드마리스와 함께 평생 잊지 못할 고품격 순간을 디자인해 보세요. 
              남겨주신 행사 성격에 맞춰 담당 플래너가 24시간 내에 맞춤형 예약 상담과 상세 견적을 전해 드립니다.
            </p>

            <div className="pt-6 border-t border-neutral-800/80 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-brand-bronze shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider font-mono">예약 문의 전화</h4>
                  <p className="text-brand-cream text-lg font-medium tracking-tight">032-323-3888</p>
                  <p className="text-xs text-gray-500">운영시간 09:00 - 20:00 (연중무휴)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-brand-bronze shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider font-mono">드마리스 위치</h4>
                  <a 
                    href="https://naver.me/xD8WOx2a" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-brand-cream hover:text-brand-bronze transition text-sm block group"
                  >
                    경기도 부천시 원미구 길주로71 <br />
                    리파인빌 B/D 3층 드마리스 부천점
                    <span className="text-[11px] text-brand-bronze group-hover:underline flex items-center gap-1 mt-1">
                      네이버 지도 ↗
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Form Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 bg-neutral-900/40 p-8 md:p-10 rounded-2xl border border-neutral-800/80 backdrop-blur-md"
          >
            
            <AnimatePresence mode="wait">
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 p-5 bg-brand-bronze/10 border border-brand-bronze/40 rounded-xl flex items-start gap-3 text-brand-cream"
                >
                  <CheckCircle className="text-brand-bronze shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-base text-brand-bronze">예약 상담 신청이 성공적으로 접수되었습니다.</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      접수 번호는 자동 등록되었으며, 기재해주신 연락처로 예약 전담 마스터 셰프 및 전문 상담원이 신속히 연락 드리겠습니다.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Event Type */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Tag size={13} className="text-brand-bronze" /> 행사 유형
                  </label>
                  <div className="relative">
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg py-3 px-4 text-sm text-brand-cream focus:outline-none focus:border-brand-bronze transition appearance-none cursor-pointer"
                    >
                      <option value="WEDDING">💍 고품격 호텔급 웨딩</option>
                      <option value="BIRTHDAY">👶 우리 아이 첫돌 파티</option>
                      <option value="LONGEVITY">💐 부모님 기품 칠순/팔순</option>
                      <option value="CORPORATE">🏢 기업 연회 & 컨퍼런스 세미나</option>
                      <option value="CATERING">🍽️ 최고급 프리미엄 케이터링</option>
                      <option value="DINING">🥩 일반 스페셜 뷔페 예약</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Date Picker */}
                <div className="space-y-2 relative" ref={calendarContainerRef}>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Calendar size={13} className="text-brand-bronze" /> 행사 예정일
                  </label>
                  
                  {/* Clickable Trigger Input */}
                  <div 
                    onClick={toggleCalendar}
                    className="relative cursor-pointer group"
                  >
                    <input
                      type="text"
                      readOnly
                      placeholder="행사 예정일을 선택해 주세요"
                      value={formatDisplayDate(date)}
                      className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg py-3 px-4 pr-10 text-sm text-brand-cream placeholder-gray-500 focus:outline-none focus:border-brand-bronze group-hover:border-neutral-700 transition cursor-pointer select-none"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-brand-bronze group-hover:text-amber-400 transition pointer-events-none">
                      <Calendar size={17} />
                    </div>
                  </div>

                  {/* Custom Calendar Popover */}
                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[320px] bg-neutral-950 border border-neutral-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
                      >
                        {/* Header: Month / Year / Nav Buttons */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                            title="이전 달"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          
                          <div className="flex items-center gap-2 font-serif text-sm font-medium text-brand-cream">
                            <span>{viewYear}년</span>
                            <span className="text-brand-bronze">{viewMonth + 1}월</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={handleTodayClick}
                              className="text-[11px] px-2 py-0.5 rounded bg-brand-bronze/10 text-brand-bronze hover:bg-brand-bronze/20 border border-brand-bronze/30 transition cursor-pointer"
                            >
                              오늘
                            </button>
                            <button
                              type="button"
                              onClick={handleNextMonth}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                              title="다음 달"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Weekday Labels */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-semibold text-gray-400">
                          <div className="text-red-400/80">일</div>
                          <div>월</div>
                          <div>화</div>
                          <div>수</div>
                          <div>목</div>
                          <div>금</div>
                          <div className="text-sky-400/80">토</div>
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {/* Previous month days */}
                          {prevMonthDays.map((item, idx) => (
                            <button
                              key={`prev-${idx}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDate(item.year, item.month, item.day);
                              }}
                              className="h-8 w-8 mx-auto flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/40 rounded-lg transition cursor-pointer"
                            >
                              {item.day}
                            </button>
                          ))}

                          {/* Current month days */}
                          {currentMonthDays.map((item) => {
                            const dayOfWeek = (firstDayOfWeek + item.day - 1) % 7;
                            const isSunday = dayOfWeek === 0;
                            const isSaturday = dayOfWeek === 6;

                            return (
                              <button
                                key={`curr-${item.day}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectDate(item.year, item.month, item.day);
                                }}
                                className={`h-8 w-8 mx-auto flex items-center justify-center text-xs rounded-lg transition cursor-pointer relative ${
                                  item.isSelected
                                    ? 'bg-brand-bronze text-white font-bold shadow-md shadow-brand-bronze/40 ring-2 ring-brand-bronze/50'
                                    : item.isToday
                                    ? 'border border-brand-bronze text-brand-bronze font-semibold hover:bg-brand-bronze/20'
                                    : isSunday
                                    ? 'text-red-400 hover:bg-neutral-800'
                                    : isSaturday
                                    ? 'text-sky-400 hover:bg-neutral-800'
                                    : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                                }`}
                              >
                                {item.day}
                              </button>
                            );
                          })}

                          {/* Next month days */}
                          {nextMonthDays.map((item, idx) => (
                            <button
                              key={`next-${idx}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDate(item.year, item.month, item.day);
                              }}
                              className="h-8 w-8 mx-auto flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/40 rounded-lg transition cursor-pointer"
                            >
                              {item.day}
                            </button>
                          ))}
                        </div>

                        {/* Selected info footer if date selected */}
                        {date && (
                          <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-gray-400">
                            <span>선택된 날짜: <strong className="text-brand-bronze font-medium">{formatDisplayDate(date)}</strong></span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDate('');
                              }}
                              className="text-gray-500 hover:text-red-400 transition cursor-pointer"
                            >
                              초기화
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Time Picker */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-bronze" /> 희망 시간
                  </label>
                  <div className="relative">
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg py-3 px-4 text-sm text-brand-cream focus:outline-none focus:border-brand-bronze transition appearance-none cursor-pointer"
                    >
                      <option value="11:30">점심 1부 (11:30 - 13:30)</option>
                      <option value="12:00">점심 2부 (12:00 - 14:00)</option>
                      <option value="13:30">점심 3부 (13:30 - 15:30)</option>
                      <option value="17:30">저녁 1부 (17:30 - 19:30)</option>
                      <option value="18:00">저녁 2부 (18:00 - 20:00)</option>
                      <option value="19:00">저녁 3부 (19:00 - 21:00)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Guest Count */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Users size={13} className="text-brand-bronze" /> 예상 인원 (명)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="예시: 50"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg py-3 px-4 pl-10 text-sm text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                    />
                    <div className="absolute left-3.5 top-3.5 text-gray-500 pointer-events-none">
                      명
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <User size={13} className="text-brand-bronze" /> 신청인 이름
                  </label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg py-3 px-4 text-sm text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                  />
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Phone size={13} className="text-brand-bronze" /> 연락처
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={13}
                    placeholder="010-0000-0000"
                    value={contact}
                    onChange={handleContactChange}
                    className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg py-3 px-4 text-sm text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                  />
                </div>

              </div>

              {/* Special Notes */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <AlignLeft size={13} className="text-brand-bronze" /> 문의 및 특별 요청 사항
                </label>
                <textarea
                  rows={4}
                  placeholder="추가 세팅 조건, 알레르기 수, 진행상 보조 사항 등 필요하신 조건을 적어주세요."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg py-3 px-4 text-sm text-brand-cream focus:outline-none focus:border-brand-bronze transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-booking-btn"
                  className="w-full bg-brand-bronze hover:bg-brand-bronze-dark text-white font-sans text-sm tracking-wider font-semibold uppercase py-4 px-6 rounded-lg transition-colors cursor-pointer duration-300 shadow-lg shadow-brand-bronze/20 flex items-center justify-center gap-2"
                >
                  예약 문의하기
                </button>
              </div>

            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
