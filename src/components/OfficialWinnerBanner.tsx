import React from 'react';
import { VoteTally } from '../types';
import { CANDIDATOS } from '../data/candidates';
import { Trophy, Award, CheckCircle2, ShieldCheck, Calendar, Lock } from 'lucide-react';

interface OfficialWinnerBannerProps {
  tally: VoteTally;
  targetDateStr?: string;
}

export const OfficialWinnerBanner: React.FC<OfficialWinnerBannerProps> = ({
  tally,
  targetDateStr = '25/10/2026 às 17:00',
}) => {
  const flavio = tally.flavio || 0;
  const lula = tally.lula || 0;
  const branco = tally.branco || 0;
  const nulo = tally.nulo || 0;
  const total = tally.total || 0;
  const validos = flavio + lula;

  let winnerId: '22' | '13' | null = null;
  let runnerUpId: '22' | '13' | null = null;
  let isTie = false;

  if (flavio > lula) {
    winnerId = '22';
    runnerUpId = '13';
  } else if (lula > flavio) {
    winnerId = '13';
    runnerUpId = '22';
  } else if (validos > 0) {
    isTie = true;
  }

  const winner = winnerId ? CANDIDATOS[winnerId] : null;
  const runnerUp = runnerUpId ? CANDIDATOS[runnerUpId] : null;

  const winnerVotes = winnerId === '22' ? flavio : lula;
  const runnerUpVotes = runnerUpId === '22' ? flavio : lula;

  const winnerPct = validos > 0 ? ((winnerVotes / validos) * 100).toFixed(1) : '0.0';
  const runnerUpPct = validos > 0 ? ((runnerUpVotes / validos) * 100).toFixed(1) : '0.0';
  const diffVotes = Math.abs(flavio - lula);

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/60 p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden animate-fade-in">
      {/* Top Gold Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

      {/* Header status */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center justify-center sm:justify-start gap-1.5">
              <span>Votações Encerradas Oficialmente</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                Final
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Prazo finalizado em <strong>{targetDateStr}</strong></span>
            </div>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          Total de Votos Auditados: <span className="font-mono-urna font-black text-white">{total.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      {/* Winner Display Body */}
      {winner ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Winner Photo & Badges */}
          <div className="md:col-span-5 flex flex-col items-center text-center">
            <div className="relative">
              {/* Outer Golden Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full blur-md opacity-60 animate-pulse" />

              {/* Photo Frame */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl bg-slate-800">
                <img
                  src={winner.foto}
                  alt={winner.nome}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Golden Trophy Medal Badge */}
              <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-xl border-2 border-white">
                <Trophy className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>

            <div className="mt-3.5">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                1º Lugar • Mais Votado
              </span>
            </div>
          </div>

          {/* Winner Details & Stats */}
          <div className="md:col-span-7 space-y-3 text-center md:text-left">
            <div>
              <div className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                Proclamação Oficial do Vencedor
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span>{winner.nome}</span>
                <span className={`text-sm px-2.5 py-0.5 rounded-lg font-mono-urna font-extrabold ${winner.numero === '22' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                  Nº {winner.numero}
                </span>
                <span className="text-xs text-slate-400 font-semibold">({winner.partido})</span>
              </h2>
              <div className="text-xs text-slate-300 mt-1">
                Vice: <strong>{winner.vice}</strong>
              </div>
            </div>

            {/* Percentage Bar & Votes */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-bold uppercase">Percentual dos Votos Válidos</span>
                <span className="text-2xl font-mono-urna font-black text-amber-400">{winnerPct}%</span>
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${winner.numero === '22' ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
                  style={{ width: `${winnerPct}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Total de Votos: <strong className="text-white">{winnerVotes.toLocaleString('pt-BR')}</strong></span>
                <span>Vantagem: <strong className="text-emerald-400">+{diffVotes.toLocaleString('pt-BR')} votos</strong></span>
              </div>
            </div>

            {/* Runner-up summary */}
            {runnerUp && (
              <div className="flex items-center justify-between text-xs text-slate-400 px-3 py-2 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <span>2º Lugar: <strong className="text-slate-300">{runnerUp.nome} ({runnerUp.partido})</strong></span>
                <span className="font-mono-urna font-bold text-slate-300">{runnerUpVotes.toLocaleString('pt-BR')} votos ({runnerUpPct}%)</span>
              </div>
            )}
          </div>
        </div>
      ) : isTie ? (
        <div className="p-6 text-center">
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
          <h3 className="text-xl font-black text-white">Empate Técnico Registrado</h3>
          <p className="text-xs text-slate-300 mt-1">Ambos os candidatos obtiveram exatamente {flavio} votos válidos cada.</p>
        </div>
      ) : (
        <div className="p-6 text-center text-slate-400">
          Nenhum voto computado até o encerramento.
        </div>
      )}

      {/* Official Audit Seal */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Apuração Definitiva e Auditada via Firebase</span>
        </div>
        <div>
          Brancos: {branco} • Nulos: {nulo} • Válidos: {validos}
        </div>
      </div>
    </div>
  );
};
