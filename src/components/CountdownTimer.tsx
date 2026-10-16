import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

// Target: 25/10/2026 às 17:00:00 no Horário de Brasília (UTC-3)
const TARGET_DATE_ISO = '2026-10-25T17:00:00-03:00';
const TARGET_TIMESTAMP = new Date(TARGET_DATE_ISO).getTime();

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(): TimeRemaining {
  const now = Date.now();
  const diff = TARGET_TIMESTAMP - now;

  if (diff <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (timeLeft.isExpired) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border-2 border-red-500/50 text-white shadow-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-red-300">VOTAÇÃO OFICIAL ENCERRADA</h3>
            <p className="text-xs text-slate-300">Prazo eleitoral finalizado em 25/10/2026 às 17h00.</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs font-bold text-red-300">
          Apuração Definitiva
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 p-3.5 sm:p-4 shadow-xl text-white relative overflow-hidden">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-red-500 opacity-80" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title and context */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                Encerramento da Votação Oficial
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                2º Turno
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-center md:justify-start gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Contagem regressiva até <strong>25/10/2026 às 17h00</strong> (Horário de Brasília)</span>
            </p>
          </div>
        </div>

        {/* Countdown Digit Blocks */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-14 h-12 sm:h-13 bg-slate-950 border border-slate-700/80 rounded-xl flex items-center justify-center shadow-inner">
              <span className="font-mono-urna text-lg sm:text-2xl font-black text-white">
                {timeLeft.days}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Dias</span>
          </div>

          <span className="text-slate-600 font-black text-lg -mt-4">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-14 h-12 sm:h-13 bg-slate-950 border border-slate-700/80 rounded-xl flex items-center justify-center shadow-inner">
              <span className="font-mono-urna text-lg sm:text-2xl font-black text-white">
                {formatNumber(timeLeft.hours)}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Horas</span>
          </div>

          <span className="text-slate-600 font-black text-lg -mt-4">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-14 h-12 sm:h-13 bg-slate-950 border border-slate-700/80 rounded-xl flex items-center justify-center shadow-inner">
              <span className="font-mono-urna text-lg sm:text-2xl font-black text-white">
                {formatNumber(timeLeft.minutes)}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Min</span>
          </div>

          <span className="text-slate-600 font-black text-lg -mt-4">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-14 h-12 sm:h-13 bg-slate-950 border border-emerald-500/40 rounded-xl flex items-center justify-center shadow-inner ring-1 ring-emerald-500/20">
              <span className="font-mono-urna text-lg sm:text-2xl font-black text-emerald-400">
                {formatNumber(timeLeft.seconds)}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 mt-1">Seg</span>
          </div>
        </div>
      </div>
    </div>
  );
};
