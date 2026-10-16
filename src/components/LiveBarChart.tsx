import React, { useMemo, useState, useEffect } from 'react';
import { VoteTally, IndividualVote } from '../types';
import { CANDIDATOS } from '../data/candidates';
import { Trophy, Medal, BarChart3, Radio, RefreshCw, FileText, CheckCircle2, Award, Users, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { subscribeToRecentVotes } from '../firebase';
import { RegionalApuracao, ApuracaoScope } from './RegionalApuracao';

interface LiveBarChartProps {
  tally: VoteTally;
  isLive: boolean;
  onlineCount?: number;
  isAdmin?: boolean;
  userUf?: string;
  userMunicipio?: string;
  onOpenBoletim: () => void;
  onResetUrna?: () => void;
  onRecalculateVotes?: () => void;
}

export const LiveBarChart: React.FC<LiveBarChartProps> = ({
  tally,
  isLive,
  onlineCount = 1,
  isAdmin = false,
  userUf = 'SP',
  userMunicipio = 'São Paulo',
  onOpenBoletim,
  onResetUrna,
  onRecalculateVotes,
}) => {
  const stats = useMemo(() => {
    const total = tally.total || 0;
    const lula = tally.lula || 0;
    const flavio = tally.flavio || 0;
    const branco = tally.branco || 0;
    const nulo = tally.nulo || 0;

    const validos = lula + flavio;

    const pctLulaTotal = total > 0 ? (lula / total) * 100 : 0;
    const pctFlavioTotal = total > 0 ? (flavio / total) * 100 : 0;
    const pctBrancoTotal = total > 0 ? (branco / total) * 100 : 0;
    const pctNuloTotal = total > 0 ? (nulo / total) * 100 : 0;

    const pctLulaValidos = validos > 0 ? (lula / validos) * 100 : (total === 0 ? 0 : 50);
    const pctFlavioValidos = validos > 0 ? (flavio / validos) * 100 : (total === 0 ? 0 : 50);

    // Ranking order
    let ranking: Array<{
      id: 'flavio' | 'lula';
      num: '22' | '13';
      name: string;
      party: string;
      votes: number;
      pctValidos: number;
      pctTotal: number;
      photo: string;
      color: string;
      bgGradient: string;
      border: string;
    }> = [];

    if (flavio >= lula) {
      ranking = [
        {
          id: 'flavio',
          num: '22',
          name: 'Flávio Bolsonaro',
          party: 'PL',
          votes: flavio,
          pctValidos: pctFlavioValidos,
          pctTotal: pctFlavioTotal,
          photo: CANDIDATOS['22'].foto,
          color: 'text-blue-400',
          bgGradient: 'from-blue-600 to-blue-400',
          border: 'border-blue-500',
        },
        {
          id: 'lula',
          num: '13',
          name: 'Lula',
          party: 'PT',
          votes: lula,
          pctValidos: pctLulaValidos,
          pctTotal: pctLulaTotal,
          photo: CANDIDATOS['13'].foto,
          color: 'text-red-400',
          bgGradient: 'from-red-600 to-red-400',
          border: 'border-red-500',
        },
      ];
    } else {
      ranking = [
        {
          id: 'lula',
          num: '13',
          name: 'Lula',
          party: 'PT',
          votes: lula,
          pctValidos: pctLulaValidos,
          pctTotal: pctLulaTotal,
          photo: CANDIDATOS['13'].foto,
          color: 'text-red-400',
          bgGradient: 'from-red-600 to-red-400',
          border: 'border-red-500',
        },
        {
          id: 'flavio',
          num: '22',
          name: 'Flávio Bolsonaro',
          party: 'PL',
          votes: flavio,
          pctValidos: pctFlavioValidos,
          pctTotal: pctFlavioTotal,
          photo: CANDIDATOS['22'].foto,
          color: 'text-blue-400',
          bgGradient: 'from-blue-600 to-blue-400',
          border: 'border-blue-500',
        },
      ];
    }

    const diffVotes = Math.abs(flavio - lula);
    const diffPct = Math.abs(pctFlavioValidos - pctLulaValidos);
    const isTied = flavio === lula && validos > 0;

    return {
      total,
      lula,
      flavio,
      branco,
      nulo,
      validos,
      pctLulaTotal,
      pctFlavioTotal,
      pctBrancoTotal,
      pctNuloTotal,
      pctLulaValidos,
      pctFlavioValidos,
      ranking,
      diffVotes,
      diffPct,
      isTied,
    };
  }, [tally]);

  // Real-time vote trends and regional scope
  const [votesList, setVotesList] = useState<IndividualVote[]>([]);
  const [trendMode, setTrendMode] = useState<'hourly' | 'cumulative'>('hourly');
  const [scope, setScope] = useState<ApuracaoScope>('geral');

  useEffect(() => {
    const unsub = subscribeToRecentVotes((votes) => {
      setVotesList(votes);
    }, 30);
    return () => unsub();
  }, []);

  const chartData = useMemo(() => {
    if (!votesList || votesList.length === 0) {
      return [];
    }

    // Sort chronologically ascending
    const sorted = [...votesList].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group into hourly buckets
    const bucketMap = new Map<string, {
      key: string;
      label: string;
      fullTime: string;
      flavio: number;
      lula: number;
      total: number;
    }>();

    for (const v of sorted) {
      if (!v.timestamp) continue;
      const d = new Date(v.timestamp);
      if (isNaN(d.getTime())) continue;

      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const hour = d.getHours().toString().padStart(2, '0');
      const key = `${year}-${month}-${day} ${hour}:00`;
      const label = `${hour}h`;
      const fullTime = `${day}/${month} às ${hour}h`;

      if (!bucketMap.has(key)) {
        bucketMap.set(key, {
          key,
          label,
          fullTime,
          flavio: 0,
          lula: 0,
          total: 0,
        });
      }

      const item = bucketMap.get(key)!;
      item.total++;
      if (v.candidate === '22') item.flavio++;
      if (v.candidate === '13') item.lula++;
    }

    const hourlyList = Array.from(bucketMap.values());
    // Display the last 12 active hours for a clean, punchy small line chart
    const recentBuckets = hourlyList.slice(-12);

    if (trendMode === 'cumulative') {
      let cumFlavio = 0;
      let cumLula = 0;
      return recentBuckets.map((b) => {
        cumFlavio += b.flavio;
        cumLula += b.lula;
        return {
          ...b,
          flavio: cumFlavio,
          lula: cumLula,
          total: cumFlavio + cumLula,
        };
      });
    }

    return recentBuckets;
  }, [votesList, trendMode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 text-white shadow-2xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2 flex-wrap">
                Ranking em Tempo Real
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    AO VIVO
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Users className="w-3 h-3 text-blue-400" />
                  {onlineCount} ONLINE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Apuração eletrônica auditável atualizada via Firebase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBoletim}
              title="Ver Boletim de Urna (BU)"
              className="px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Boletim (BU)</span>
            </button>

            {/* Admin-only controls: Strictly visible and accessible only on this administrator device */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
                {onRecalculateVotes && (
                  <button
                    onClick={onRecalculateVotes}
                    title="Auditar e Sincronizar todos os votos da urna"
                    className="p-1.5 text-slate-400 hover:text-blue-400 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-xs transition cursor-pointer border border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                {onResetUrna && (
                  <button
                    onClick={onResetUrna}
                    title="Zerar Urna (Zerésima - Apenas Administrador)"
                    className="px-2 py-1 text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/60 rounded-lg text-[10px] font-black tracking-wider transition cursor-pointer border border-red-800/50"
                  >
                    ZERAR
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scope Selector: Brasil / Por Região / Por Estado / Por Município */}
        <div className="mb-5">
          <div className="grid grid-cols-4 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setScope('geral')}
              className={`py-2 px-1 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer ${
                scope === 'geral'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇧🇷 Brasil</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('regiao')}
              className={`py-2 px-1 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer ${
                scope === 'regiao'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🗺️ Região</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('estado')}
              className={`py-2 px-1 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer ${
                scope === 'estado'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🏛️ Estado</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('municipio')}
              className={`py-2 px-1 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer ${
                scope === 'municipio'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🏙️ Município</span>
            </button>
          </div>
        </div>

        {scope === 'geral' ? (
          <>
            {/* Live Leader / Ranking Summary Card */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-800/90 via-slate-800/60 to-slate-800/90 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold flex-shrink-0">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                    Liderança da Votação
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2 flex-wrap">
                {stats.isTied ? (
                  <span className="text-amber-300">Empate Técnico ({stats.flavio} x {stats.lula})</span>
                ) : stats.validos === 0 ? (
                  <span className="text-slate-400 font-medium">Aguardando primeiros votos</span>
                ) : (
                  <>
                    <span className={stats.ranking[0].color}>
                      1º {stats.ranking[0].name} ({stats.ranking[0].party})
                    </span>
                    <span className="text-xs font-normal text-slate-400">
                      +{stats.diffVotes} {stats.diffVotes === 1 ? 'voto' : 'votos'} (+{stats.diffPct.toFixed(1)}%)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right pl-2">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total Votos</div>
            <div className="text-xl sm:text-2xl font-mono-urna font-black text-white">
              {stats.total.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {/* PODIUM RANKING LIST (1º e 2º Lugar) */}
        <div className="mb-6 space-y-2.5">
          <div className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex justify-between items-center">
            <span>Classificação Oficial</span>
            <span className="text-[11px] text-slate-500 font-normal">% dos votos válidos</span>
          </div>

          {stats.ranking.map((cand, index) => (
            <div
              key={cand.id}
              className={`p-3.5 rounded-xl border transition-all ${
                index === 0 && stats.validos > 0
                  ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-slate-800/50 border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full font-black text-xs">
                    {index === 0 && stats.validos > 0 ? (
                      <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                        🥇 1º
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-0.5 font-bold">
                        🥈 2º
                      </span>
                    )}
                  </div>

                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-600 flex-shrink-0 bg-slate-900">
                    <img
                      src={cand.photo}
                      alt={cand.name}
                      loading="eager"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>{cand.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono-urna font-bold">
                        {cand.num}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {cand.votes} {cand.votes === 1 ? 'voto registrado' : 'votos registrados'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xl font-mono-urna font-black ${cand.color}`}>
                    {cand.pctValidos.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {cand.pctTotal.toFixed(1)}% do total
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full bg-gradient-to-r ${cand.bgGradient} rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${Math.max(cand.pctValidos, stats.validos > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* NEUTRAL VOTES: BRANCOS E NULOS */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-medium">Votos em Branco</span>
              <span className="font-mono-urna text-slate-200 font-bold">{stats.pctBrancoTotal.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-slate-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.pctBrancoTotal}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 text-right">
              {stats.branco} {stats.branco === 1 ? 'voto' : 'votos'}
            </div>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-medium">Votos Nulos</span>
              <span className="font-mono-urna text-slate-200 font-bold">{stats.pctNuloTotal.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.pctNuloTotal}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 text-right">
              {stats.nulo} {stats.nulo === 1 ? 'voto' : 'votos'}
            </div>
          </div>
        </div>

        {/* RECHARTS LINE CHART: TENDÊNCIA DE VOTOS AO LONGO DAS ÚLTIMAS HORAS */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                Tendência de Votos
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                Últimas Horas
              </span>
            </div>

            {/* Candidate Badges & Mode Toggle */}
            <div className="flex items-center gap-2.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-blue-400 font-bold text-[10px] sm:text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Flávio (22)
                </span>
                <span className="flex items-center gap-1 text-red-400 font-bold text-[10px] sm:text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Lula (13)
                </span>
              </div>

              <div className="inline-flex p-0.5 bg-slate-800/90 rounded-lg border border-slate-700 text-[10px]">
                <button
                  type="button"
                  onClick={() => setTrendMode('hourly')}
                  className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                    trendMode === 'hourly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Por Hora
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMode('cumulative')}
                  className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                    trendMode === 'cumulative'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Acumulado
                </button>
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="w-full h-36 bg-slate-950/50 rounded-xl p-2.5 border border-slate-800/80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0]?.payload;
                        return (
                          <div className="bg-slate-950/95 border border-slate-700 p-2.5 rounded-lg shadow-2xl text-xs backdrop-blur-md">
                            <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between gap-4">
                              <span>{pt?.fullTime || pt?.label}</span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                Total: {pt?.total || 0}
                              </span>
                            </p>
                            <div className="space-y-1">
                              {payload.map((entry, idx) => (
                                <div key={`tip-${idx}`} className="flex items-center justify-between gap-3">
                                  <span className="flex items-center gap-1.5 font-semibold" style={{ color: entry.color }}>
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    {entry.name}:
                                  </span>
                                  <span className="font-mono-urna font-bold text-slate-100">
                                    {entry.value} {entry.value === 1 ? 'voto' : 'votos'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="flavio"
                    name="Flávio Bolsonaro"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#3b82f6' }}
                    activeDot={{ r: 4.5, fill: '#60a5fa' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lula"
                    name="Lula"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#ef4444' }}
                    activeDot={{ r: 4.5, fill: '#f87171' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-24 bg-slate-950/30 rounded-xl flex items-center justify-center text-xs text-slate-500 border border-slate-800/60">
              Registrando tendência de votos das últimas horas...
            </div>
          )}
        </div>
        </>
        ) : (
          <RegionalApuracao
            tally={tally}
            votesList={votesList}
            scope={scope}
            onScopeChange={setScope}
            userUf={userUf}
            userMunicipio={userMunicipio}
            hideTabs={true}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-3.5 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{onlineCount} {onlineCount === 1 ? 'eleitor online' : 'eleitores online agora'}</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Votos válidos: <strong className="text-slate-200">{stats.validos}</strong></span>
          </div>
        </div>
        <div>
          Última atualização: {new Date(tally.updatedAt).toLocaleTimeString('pt-BR')}
        </div>
      </div>
    </div>
  );
};
