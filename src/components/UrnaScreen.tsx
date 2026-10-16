import React from 'react';
import { CandidateInfo } from '../types';
import { UserX, AlertTriangle, CheckCircle2, Trophy } from 'lucide-react';

interface UrnaScreenProps {
  digits: string[];
  candidate: CandidateInfo | null;
  isBranco: boolean;
  isNulo: boolean;
  stage: 'voting' | 'recording' | 'finished' | 'already_voted' | 'closed';
  winnerCandidate?: CandidateInfo | null;
  winnerVotes?: number;
  winnerPct?: string;
}

export const UrnaScreen: React.FC<UrnaScreenProps> = ({
  digits,
  candidate,
  isBranco,
  isNulo,
  stage,
  winnerCandidate,
  winnerVotes,
  winnerPct,
}) => {
  if (stage === 'closed') {
    return (
      <div className="urna-lcd-screen animate-fade-in w-full h-[360px] md:h-[400px] border-4 border-slate-700 rounded-lg p-5 flex flex-col items-center justify-between relative overflow-hidden select-none">
        <div className="text-center pt-1">
          <div className="font-mono-urna text-xs uppercase font-bold text-red-700 tracking-wider">
            PESQUISA POPULAR • VOTAÇÃO ENCERRADA
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-0.5">
            PRAZO FINAL: 25/10/2026 ÀS 17:00
          </div>
        </div>

        <div className="text-center my-auto px-2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-700 border border-amber-600/30 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-7 h-7 text-amber-700" />
          </div>
          <div className="font-mono-urna text-xs font-bold text-slate-600 uppercase tracking-widest">
            CANDIDATO MAIS VOTADO
          </div>
          <div className="font-mono-urna text-2xl md:text-3xl font-black text-slate-900 tracking-wide uppercase mt-1">
            {winnerCandidate ? winnerCandidate.nome : 'APURAÇÃO FINALIZADA'}
          </div>
          {winnerCandidate && (
            <div className="mt-1 text-sm font-bold text-slate-700">
              Nº {winnerCandidate.numero} • {winnerCandidate.partido} ({winnerPct}% dos votos válidos)
            </div>
          )}
          <div className="mt-3 inline-block px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full font-mono text-[11px] font-bold">
            STATUS: RESULTADO OFICIAL PROCLAMADO
          </div>
        </div>

        <div className="w-full border-t border-slate-400 pt-2 text-[11px] text-slate-600 text-center">
          Terminal bloqueado para novas votações.
        </div>
      </div>
    );
  }

  if (stage === 'already_voted') {
    return (
      <div className="urna-lcd-screen animate-fade-in w-full h-[360px] md:h-[400px] border-4 border-slate-700 rounded-lg p-6 flex flex-col items-center justify-between relative overflow-hidden select-none">
        <div className="text-center pt-2">
          <div className="font-mono-urna text-xs uppercase font-bold text-slate-600 tracking-wider">
            PESQUISA POPULAR • TERMINAL BLOQUEADO
          </div>
          <div className="text-sm font-semibold text-slate-500 mt-0.5">
            SEÇÃO: 0142 • ZONA: 001
          </div>
        </div>

        <div className="text-center my-auto px-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-600/30 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="font-mono-urna text-2xl md:text-3xl font-black text-slate-900 tracking-wide uppercase">
            VOTO JÁ COMPUTADO
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-700 max-w-xs mx-auto leading-relaxed font-medium">
            Este dispositivo já exerceu o direito ao voto nesta pesquisa. Cada aparelho possui cota de <strong>1 voto único</strong>.
          </p>
          <div className="mt-3 inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full font-mono text-[11px] font-bold">
            STATUS: ELEITOR REGISTRADO
          </div>
        </div>

        <div className="w-full border-t border-slate-400 pt-2 text-[11px] text-slate-600 text-center">
          Acompanhe o ranking e apuração dos votos ao lado em tempo real.
        </div>
      </div>
    );
  }

  if (stage === 'finished') {
    return (
      <div className="urna-lcd-screen animate-fade-in w-full h-[360px] md:h-[400px] border-4 border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
        <div className="text-center animate-fade-in-scale">
          <div className="font-mono-urna text-7xl md:text-9xl font-black text-slate-900 tracking-wider">
            FIM
          </div>
          <div className="mt-3 text-lg md:text-xl font-bold uppercase tracking-widest text-emerald-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            Voto Gravado com Sucesso
          </div>
        </div>

        <div className="absolute bottom-4 right-5 text-slate-500 font-mono-urna text-xs uppercase tracking-widest">
          PESQUISA POPULAR • VOTAÇÃO ONLINE
        </div>
      </div>
    );
  }

  if (stage === 'recording') {
    return (
      <div className="urna-lcd-screen animate-fade-in w-full h-[360px] md:h-[400px] border-4 border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center relative select-none">
        <div className="animate-pulse text-center">
          <div className="font-mono-urna text-3xl md:text-5xl font-black text-slate-800 tracking-widest">
            GRAVANDO...
          </div>
          <div className="mt-4 text-sm text-slate-600 font-mono-urna">
            Criptografando e computando cédula digital
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <span className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="urna-lcd-screen animate-fade-in w-full h-[360px] md:h-[400px] border-4 border-slate-700 rounded-lg p-4 md:p-5 flex flex-col justify-between relative select-none text-slate-900 font-sans shadow-inner">
      {/* Top Header */}
      <div>
        <div className="text-xs uppercase font-bold text-slate-600 tracking-wider">
          SEU VOTO PARA
        </div>
        <div className="text-xl md:text-2xl font-black tracking-wide text-slate-900 uppercase">
          Presidente
        </div>
      </div>

      {/* Main Center Content */}
      <div className="grid grid-cols-12 gap-3 items-center my-auto">
        {/* Left Side: Digits & Candidate Details */}
        <div className="col-span-8 flex flex-col justify-center">
          {/* Numbers Line */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold uppercase text-slate-700">Número:</span>
            <div className="flex gap-2">
              <div
                className={`w-10 h-12 md:w-12 md:h-14 border-2 flex items-center justify-center font-mono-urna text-2xl md:text-3xl font-bold bg-white text-slate-900 shadow-sm ${
                  digits.length === 0 ? 'border-slate-800 animate-cursor-blink' : 'border-slate-600'
                }`}
              >
                {digits[0] || ''}
              </div>
              <div
                className={`w-10 h-12 md:w-12 md:h-14 border-2 flex items-center justify-center font-mono-urna text-2xl md:text-3xl font-bold bg-white text-slate-900 shadow-sm ${
                  digits.length === 1 ? 'border-slate-800 animate-cursor-blink' : 'border-slate-600'
                }`}
              >
                {digits[1] || ''}
              </div>
            </div>
          </div>

          {/* Conditional Displays */}
          {isBranco && (
            <div className="mt-2 py-3 px-4 bg-white/70 border border-slate-300 rounded text-center">
              <div className="font-mono-urna text-xl md:text-2xl font-black text-slate-800 tracking-wider">
                VOTO EM BRANCO
              </div>
            </div>
          )}

          {isNulo && !isBranco && (
            <div className="mt-1 space-y-1">
              <div className="text-sm font-bold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> NÚMERO ERRADO
              </div>
              <div className="font-mono-urna text-xl md:text-2xl font-black text-red-600 tracking-wider animate-pulse">
                VOTO NULO
              </div>
            </div>
          )}

          {candidate && !isBranco && (
            <div className="space-y-1 text-xs md:text-sm">
              <div className="flex items-baseline gap-1">
                <span className="text-slate-600 font-semibold uppercase">Nome:</span>
                <span className="font-black text-slate-950 uppercase text-sm md:text-base">
                  {candidate.nome}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-slate-600 font-semibold uppercase">Partido:</span>
                <span className="font-bold text-slate-900 uppercase">
                  {candidate.sigla}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-slate-600 font-semibold uppercase">Vice-Pres.:</span>
                <span className="font-semibold text-slate-800 uppercase">
                  {candidate.vice}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Candidate Photo */}
        <div className="col-span-4 flex justify-end">
          {candidate ? (
            <div className="w-24 h-28 md:w-28 md:h-34 border-2 border-slate-700 bg-white p-1 shadow-md flex flex-col items-center animate-fade-in">
              <div className="w-full h-full overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={candidate.foto}
                  alt={candidate.nome}
                  loading="eager"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    // Fallback to online thumbnail if local path has any issue
                    const target = e.target as HTMLImageElement;
                    if (candidate.numero === '13' && !target.src.includes('upload.wikimedia')) {
                      target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/500px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg';
                    } else if (candidate.numero === '22' && !target.src.includes('upload.wikimedia')) {
                      target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Foto_oficial_do_senador_Fl%C3%A1vio_Bolsonaro_%28v._AgSen%29_%283x4%29.jpg/500px-Foto_oficial_do_senador_Fl%C3%A1vio_Bolsonaro_%28v._AgSen%29_%283x4%29.jpg';
                    }
                  }}
                />
              </div>
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Presidente
              </span>
            </div>
          ) : isBranco ? (
            <div className="w-24 h-28 md:w-28 md:h-34 border-2 border-dashed border-slate-400 bg-white/40 flex flex-col items-center justify-center p-2 text-center text-slate-400 animate-fade-in">
              <span className="text-xs font-bold uppercase">Branco</span>
            </div>
          ) : isNulo ? (
            <div className="w-24 h-28 md:w-28 md:h-34 border-2 border-dashed border-red-300 bg-red-50 flex flex-col items-center justify-center p-2 text-center text-red-500">
              <UserX className="w-8 h-8 opacity-60 mb-1" />
              <span className="text-[10px] font-bold uppercase">Inexistente</span>
            </div>
          ) : (
            <div className="w-24 h-28 md:w-28 md:h-34 border-2 border-dashed border-slate-300 bg-white/30 flex flex-col items-center justify-center p-2 text-center text-slate-400">
              <span className="text-[10px] uppercase font-medium">Foto do Candidato</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Instructions Footer */}
      <div className="border-t border-slate-400 pt-2 text-[11px] md:text-xs text-slate-700">
        <div className="font-semibold text-slate-800">Aperte a tecla:</div>
        <div className="flex justify-between flex-wrap text-slate-600 gap-1 mt-0.5">
          <span><strong className="text-emerald-700">CONFIRMA</strong> para CONFIRMAR este voto</span>
          <span><strong className="text-orange-700">CORRIGE</strong> para REINICIAR este voto</span>
        </div>
      </div>
    </div>
  );
};
