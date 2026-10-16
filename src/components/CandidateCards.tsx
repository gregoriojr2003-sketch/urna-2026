import React from 'react';
import { CANDIDATOS } from '../data/candidates';
import { Check, ShieldCheck, FileQuestion, Lock, Smartphone } from 'lucide-react';

interface CandidateCardsProps {
  selectedNumber: string;
  isBranco: boolean;
  onSelectCandidate: (numero: '13' | '22') => void;
  onSelectBranco: () => void;
  disabled?: boolean;
  stage?: 'voting' | 'recording' | 'finished' | 'already_voted' | 'closed';
  hasDeviceVoted?: boolean;
  isClosed?: boolean;
  onOpenQrCode?: () => void;
}

export const CandidateCards: React.FC<CandidateCardsProps> = ({
  selectedNumber,
  isBranco,
  onSelectCandidate,
  onSelectBranco,
  disabled = false,
  stage = 'voting',
  hasDeviceVoted = false,
  isClosed = false,
  onOpenQrCode,
}) => {
  if (isClosed || stage === 'closed') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-red-500/40 shadow-xl space-y-3 animate-fade-in select-none">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Votações Encerradas Oficialmente
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                Prazo Finalizado
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              O período oficial de votação foi encerrado no dia <strong>25/10/2026 às 17h00</strong>. Não é mais possível receber novos votos. Confira ao lado a proclamação oficial do candidato mais votado!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasDeviceVoted || stage === 'already_voted') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-3 animate-fade-in select-none">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Voto Registrado Neste Dispositivo
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                1 Voto por Aparelho
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Para assegurar a integridade do ranking, cada eleitor só pode registrar <strong>1 voto por celular ou computador</strong>. Seu voto já está contabilizado na apuração oficial ao vivo.
            </p>
          </div>
        </div>

        {onOpenQrCode && (
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              Deseja que outro eleitor vote?
            </span>
            <button
              type="button"
              onClick={onOpenQrCode}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-950/40"
            >
              Abrir QR Code para Outro Celular
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div key={stage} className="space-y-3 select-none transition-opacity duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Flávio Bolsonaro Card */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectCandidate('22')}
          className={`candidate-card animate-fade-in-1 group relative rounded-2xl p-4 text-left transition-all duration-300 ease-out border-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-4 hover:scale-[1.02] ${
            selectedNumber === '22' && !isBranco
              ? 'bg-blue-950/70 border-blue-500 shadow-xl shadow-blue-950/70 ring-2 ring-blue-500/40 scale-[1.02]'
              : 'bg-slate-900/80 border-slate-800 hover:border-blue-500/60 hover:bg-slate-900'
          }`}
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-blue-500/80 shadow-md bg-slate-800 flex-shrink-0 transition-transform duration-300">
            <img
              src={CANDIDATOS['22'].foto}
              alt="Flávio Bolsonaro"
              loading="eager"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            {selectedNumber === '22' && !isBranco && (
              <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transform transition-transform animate-fade-in-scale">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-urna font-extrabold text-blue-400 bg-blue-950/90 px-2 py-0.5 rounded-full border border-blue-800/80">
                Nº 22
              </span>
              <span className="text-xs font-semibold text-slate-400">PL</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white group-hover:text-blue-400 transition-colors truncate mt-0.5">
              Flávio Bolsonaro
            </div>
            <div className="text-xs text-slate-400 truncate mt-0.5">
              Vice: {CANDIDATOS['22'].vice}
            </div>
          </div>
        </button>

        {/* Lula Card */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectCandidate('13')}
          className={`candidate-card animate-fade-in-2 group relative rounded-2xl p-4 text-left transition-all duration-300 ease-out border-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-4 hover:scale-[1.02] ${
            selectedNumber === '13' && !isBranco
              ? 'bg-red-950/70 border-red-500 shadow-xl shadow-red-950/70 ring-2 ring-red-500/40 scale-[1.02]'
              : 'bg-slate-900/80 border-slate-800 hover:border-red-500/60 hover:bg-slate-900'
          }`}
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-red-500/80 shadow-md bg-slate-800 flex-shrink-0 transition-transform duration-300">
            <img
              src={CANDIDATOS['13'].foto}
              alt="Lula"
              loading="eager"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            {selectedNumber === '13' && !isBranco && (
              <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform transition-transform animate-fade-in-scale">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-urna font-extrabold text-red-400 bg-red-950/90 px-2 py-0.5 rounded-full border border-red-800/80">
                Nº 13
              </span>
              <span className="text-xs font-semibold text-slate-400">PT</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white group-hover:text-red-400 transition-colors truncate mt-0.5">
              Lula
            </div>
            <div className="text-xs text-slate-400 truncate mt-0.5">
              Vice: {CANDIDATOS['13'].vice}
            </div>
          </div>
        </button>
      </div>

      {/* Voto em Branco Quick Select Bar with fade-in */}
      <div className="animate-fade-in-3 flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800 rounded-xl transition-all duration-300">
        <div className="flex items-center gap-2 text-xs text-slate-400 pl-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Opção neutra de votação:</span>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onSelectBranco}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ease-out flex items-center gap-1.5 cursor-pointer disabled:opacity-40 hover:scale-[1.02] ${
            isBranco
              ? 'bg-slate-200 text-slate-950 font-black shadow-md ring-2 ring-slate-400 scale-[1.02]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <FileQuestion className="w-3.5 h-3.5" />
          {isBranco ? '✓ VOTO EM BRANCO SELECIONADO' : 'Votar em Branco'}
        </button>
      </div>
    </div>
  );
};
