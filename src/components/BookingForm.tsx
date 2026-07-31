/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Reservation } from '../types';
import { Calendar, Users, Phone, User, Tag, Clock, AlignLeft, CheckCircle } from 'lucide-react';
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
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider font-mono">드마리스 위치</h4>
                  <p className="text-brand-cream text-sm">
                    경기도 부천시 원미구 길주로71 <br />
                    리파인빌 B/D 3층 드마리스 부천점
                  </p>
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
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Calendar size={13} className="text-brand-bronze" /> 행사 예정일
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg py-3 px-4 text-sm text-brand-cream focus:outline-none focus:border-brand-bronze transition"
                  />
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
                    placeholder="010-0000-0000"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
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
