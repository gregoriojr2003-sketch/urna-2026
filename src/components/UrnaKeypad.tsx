import React from 'react';
import { urnaAudio } from '../utils/audio';

interface UrnaKeypadProps {
  onNumberClick: (num: string) => void;
  onBrancoClick: () => void;
  onCorrigeClick: () => void;
  onConfirmaClick: () => void;
  disabled?: boolean;
}

export const UrnaKeypad: React.FC<UrnaKeypadProps> = ({
  onNumberClick,
  onBrancoClick,
  onCorrigeClick,
  onConfirmaClick,
  disabled = false,
}) => {
  const handleNumber = (n: string) => {
    if (disabled) return;
    urnaAudio.playKeypadBeep();
    onNumberClick(n);
  };

  const handleBranco = () => {
    if (disabled) return;
    urnaAudio.playBrancoBeep();
    onBrancoClick();
  };

  const handleCorrige = () => {
    if (disabled) return;
    urnaAudio.playCorrigeBeep();
    onCorrigeClick();
  };

  const handleConfirma = () => {
    if (disabled) return;
    onConfirmaClick();
  };

  return (
    <div className="urna-keypad-case rounded-xl p-4 md:p-5 flex flex-col items-center justify-between shadow-2xl border border-slate-700 select-none">
      {/* Header Emblem */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/80 w-full justify-center">
        <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-[10px] font-black text-blue-400">
          ✓
        </div>
        <div className="text-center">
          <div className="text-slate-200 text-xs font-black tracking-widest uppercase">
            PESQUISA POPULAR
          </div>
          <div className="text-[9px] text-slate-400 font-medium">TERMINAL DE VOTAÇÃO</div>
        </div>
      </div>

      {/* Numeric Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-3.5 mb-5 w-full max-w-[240px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => handleNumber(n)}
            className="urna-btn-num h-11 md:h-12 rounded-lg text-white font-mono-urna text-2xl font-black flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {n}
          </button>
        ))}

        {/* Empty placeholder */}
        <div />

        {/* Number 0 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleNumber('0')}
          className="urna-btn-num h-11 md:h-12 rounded-lg text-white font-mono-urna text-2xl font-black flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          0
        </button>

        {/* Empty placeholder */}
        <div />
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-3 gap-2 w-full pt-2 items-end">
        <button
          type="button"
          disabled={disabled}
          onClick={handleBranco}
          className="urna-btn-branco h-11.5 sm:h-12 md:h-13 rounded-lg text-slate-900 uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center text-center px-1 overflow-hidden shadow-sm"
          title="Voto em Branco"
        >
          <span className="font-extrabold text-[8.5px] sm:text-[9.5px] md:text-[10px] tracking-tight leading-none text-center block w-full select-none">
            BRANCO
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={handleCorrige}
          className="urna-btn-corrige h-11.5 sm:h-12 md:h-13 rounded-lg text-slate-950 uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center text-center px-1 overflow-hidden shadow-sm"
          title="Corrige número digitado"
        >
          <span className="font-extrabold text-[8.5px] sm:text-[9.5px] md:text-[10px] tracking-tight leading-none text-center block w-full select-none">
            CORRIGE
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={handleConfirma}
          className="urna-btn-confirma h-14 md:h-15.5 rounded-lg text-white uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center text-center px-1 shadow-lg overflow-hidden"
          title="CONFIRMA o voto"
        >
          <span className="font-black text-[9px] sm:text-[10px] md:text-[10.5px] tracking-tight leading-none text-center block w-full px-0.5 select-none">
            CONFIRMA
          </span>
        </button>
      </div>
    </div>
  );
};
