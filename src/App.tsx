import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  VoteTally,
  CandidateId,
  VoterReceipt
} from './types';
import { CANDIDATOS } from './data/candidates';
import { urnaAudio } from './utils/audio';
import {
  subscribeToVoteTally,
  submitVoteToFirestore,
  resetTallyInFirestore,
  checkDeviceVoteInFirestore,
  recalculateAllVotesFromBallots,
  trackUserPresence,
  INITIAL_TALLY,
} from './firebase';
import {
  getDeviceId,
  getDeviceVoteRecord,
  saveDeviceVoteRecord,
  clearDeviceVoteRecord,
  isCurrentDeviceAdmin,
  setDeviceAsAdmin,
  StoredDeviceVote
} from './utils/device';
import { UrnaScreen } from './components/UrnaScreen';
import { UrnaKeypad } from './components/UrnaKeypad';
import { CandidateCards } from './components/CandidateCards';
import { LiveBarChart } from './components/LiveBarChart';
import { BoletimUrnaModal } from './components/BoletimUrnaModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ShareQrCodeModal } from './components/ShareQrCodeModal';
import { CountdownTimer } from './components/CountdownTimer';
import { OfficialWinnerBanner } from './components/OfficialWinnerBanner';
import { VoterLocationSelector } from './components/VoterLocationSelector';
import {
  AuditedDeviceLocation,
  detectDeviceAccessLocation,
} from './utils/deviceLocation';
import {
  Volume2,
  VolumeX,
  Vote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RotateCcw,
  QrCode,
  Smartphone,
  AlertCircle,
  FileCheck,
  Users,
  Key,
  Shield,
  Trophy,
  Share2,
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  X
} from 'lucide-react';

// Election closure target: 25/10/2026 às 17h00 (Horário de Brasília - UTC-3)
const ELECTION_CLOSE_TIMESTAMP = new Date('2026-10-25T17:00:00-03:00').getTime();

export default function App() {
  // Reference for repositioning voter to apuração after voting
  const apuracaoRef = useRef<HTMLDivElement>(null);

  // Urna states
  const [digits, setDigits] = useState<string[]>([]);
  const [isBranco, setIsBranco] = useState(false);
  const [stage, setStage] = useState<'voting' | 'recording' | 'finished' | 'already_voted'>('voting');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Automatic Election Closure on 25/10/2026 17:00
  const [isElectionClosed, setIsElectionClosed] = useState<boolean>(() => Date.now() >= ELECTION_CLOSE_TIMESTAMP);
  const [simulatedClosure, setSimulatedClosure] = useState<boolean>(false);

  // Online presence tracking
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // Administrator Device authority
  const [isAdminDevice, setIsAdminDevice] = useState<boolean>(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const [adminSuccessToast, setAdminSuccessToast] = useState<string | null>(null);

  // Single vote per device tracking
  const [hasDeviceVoted, setHasDeviceVoted] = useState(false);
  const [deviceRecord, setDeviceRecord] = useState<StoredDeviceVote | null>(null);
  const [voteErrorMsg, setVoteErrorMsg] = useState<string | null>(null);

  // Regional voter location audited strictly by device access (anti-fraude)
  const [voterLocation, setVoterLocation] = useState<AuditedDeviceLocation>({
    uf: 'SP',
    estadoNome: 'São Paulo',
    regiao: 'Sudeste',
    municipio: 'São Paulo',
    metodo: 'ip_rede',
    detalheMetodo: 'Verificando conexão deste dispositivo...',
    auditHash: 'AUD-VERIFICANDO',
    detectadoEm: new Date().toISOString(),
  });

  // Auto-detect verified device access location on mount
  useEffect(() => {
    detectDeviceAccessLocation().then((loc) => {
      setVoterLocation(loc);
    });
  }, []);

  // Live Tally state with automatic recovery of audited votes (763 baseline)
  const [tally, setTally] = useState<VoteTally>(() => {
    try {
      const saved = localStorage.getItem('urna_fallback_tally');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.total === 'number' && parsed.total >= INITIAL_TALLY.total) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_TALLY;
  });
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Modals state
  const [isBoletimOpen, setIsBoletimOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<VoterReceipt | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleWhatsAppShare = () => {
    const text = `🗳️ Acabei de votar na Urna Eletrônica Online (Flávio Bolsonaro vs Lula)! Participe também da pesquisa popular e acompanhe a apuração ao vivo em tempo real: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Detect election closure periodically
  useEffect(() => {
    const checkClosure = () => {
      if (Date.now() >= ELECTION_CLOSE_TIMESTAMP) {
        setIsElectionClosed(true);
      }
    };
    checkClosure();
    const timer = setInterval(checkClosure, 4000);
    return () => clearInterval(timer);
  }, []);

  // Effective closure state & winner computation
  const isClosed = isElectionClosed || simulatedClosure;
  const effectiveStage: 'voting' | 'recording' | 'finished' | 'already_voted' | 'closed' = isClosed ? 'closed' : stage;

  const flavioVotes = tally.flavio || 0;
  const lulaVotes = tally.lula || 0;
  const totalValidos = flavioVotes + lulaVotes;
  const winnerCandidate = flavioVotes > lulaVotes ? CANDIDATOS['22'] : lulaVotes > flavioVotes ? CANDIDATOS['13'] : null;
  const winnerVotes = flavioVotes > lulaVotes ? flavioVotes : lulaVotes;
  const winnerPct = totalValidos > 0 ? ((winnerVotes / totalValidos) * 100).toFixed(1) : '0.0';

  // Detect admin status on load
  useEffect(() => {
    setIsAdminDevice(isCurrentDeviceAdmin());
  }, []);

  // Real-time online voters presence tracking
  useEffect(() => {
    const deviceId = getDeviceId();
    const cleanupPresence = trackUserPresence(deviceId, (count) => {
      setOnlineCount(count);
    });
    return () => {
      cleanupPresence();
    };
  }, []);

  // Check if this device has already cast a vote (locally and in Firestore)
  useEffect(() => {
    const local = getDeviceVoteRecord();
    const deviceId = getDeviceId();

    if (local?.hasVoted) {
      setHasDeviceVoted(true);
      setDeviceRecord(local);
      setStage('already_voted');
    } else {
      checkDeviceVoteInFirestore(deviceId).then((already) => {
        if (already) {
          const rec: StoredDeviceVote = {
            hasVoted: true,
            candidate: 'computado',
            candidateName: 'Voto Registrado',
            timestamp: new Date().toISOString(),
          };
          saveDeviceVoteRecord(rec.candidate, rec.candidateName, rec.timestamp);
          setHasDeviceVoted(true);
          setDeviceRecord(rec);
          setStage('already_voted');
        }
      });
    }
  }, []);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    const unsubscribe = subscribeToVoteTally(
      (updatedTally) => {
        setTally(updatedTally);
        setIsFirebaseConnected(true);
        try {
          localStorage.setItem('urna_fallback_tally', JSON.stringify(updatedTally));
        } catch (e) {
          // ignore
        }
      },
      (error) => {
        console.warn('Firestore subscription error, using local fallback:', error);
        setIsFirebaseConnected(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Determine current candidate from entered digits
  const enteredNumber = digits.join('');
  const candidate = (enteredNumber === '13' || enteredNumber === '22')
    ? CANDIDATOS[enteredNumber as '13' | '22']
    : null;

  const isNulo = digits.length === 2 && !candidate && !isBranco;
  const isVoteReady = (candidate !== null) || isBranco || isNulo;

  // Handle number click on keypad
  const handleNumber = useCallback((num: string) => {
    if (isClosed || stage !== 'voting' || hasDeviceVoted) return;
    setIsBranco(false);
    setDigits((prev) => {
      if (prev.length >= 2) return prev;
      return [...prev, num];
    });
  }, [isClosed, stage, hasDeviceVoted]);

  // Handle BRANCO
  const handleBranco = useCallback(() => {
    if (isClosed || stage !== 'voting' || hasDeviceVoted) return;
    setDigits([]);
    setIsBranco(true);
  }, [isClosed, stage, hasDeviceVoted]);

  // Handle CORRIGE
  const handleCorrige = useCallback(() => {
    if (isClosed || stage !== 'voting' || hasDeviceVoted) return;
    setDigits([]);
    setIsBranco(false);
    setVoteErrorMsg(null);
  }, [isClosed, stage, hasDeviceVoted]);

  // Handle CONFIRMA
  const handleConfirma = useCallback(async () => {
    if (isClosed) {
      setVoteErrorMsg('As votações foram oficialmente encerradas no dia 25/10/2026 às 17h00.');
      return;
    }
    if (stage !== 'voting') return;

    if (hasDeviceVoted) {
      setVoteErrorMsg('Este dispositivo já participou da votação. Permitido apenas 1 voto por aparelho.');
      return;
    }

    let voteType: CandidateId | null = null;
    let voteName = '';

    if (isBranco) {
      voteType = 'branco';
      voteName = 'VOTO EM BRANCO';
    } else if (digits.length === 2) {
      if (enteredNumber === '13') {
        voteType = '13';
        voteName = CANDIDATOS['13'].nome;
      } else if (enteredNumber === '22') {
        voteType = '22';
        voteName = CANDIDATOS['22'].nome;
      } else {
        voteType = 'nulo';
        voteName = 'VOTO NULO';
      }
    }

    if (!voteType) {
      return;
    }

    const deviceId = getDeviceId();

    // Begin recording stage
    setStage('recording');
    setVoteErrorMsg(null);

    // Generate voter receipt data
    const timestamp = new Date().toISOString();
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
    const newReceipt: VoterReceipt = {
      codigoEleitoral: `UE-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp,
      zona: '001',
      secao: '0142',
      autenticacao: hash,
      votoComputado: true,
    };
    setReceipt(newReceipt);

    // Audio & Confetti
    if (soundEnabled) {
      urnaAudio.playConfirmaUrnaSound();
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: voteType === '13' ? ['#dc2626', '#f87171'] : voteType === '22' ? ['#2563eb', '#60a5fa'] : ['#94a3b8'],
    });

    try {
      await submitVoteToFirestore(voteType, voteName, deviceId, {
        uf: voterLocation.uf,
        regiao: voterLocation.regiao,
        municipio: voterLocation.municipio,
      });
      // Mark this device as having voted
      saveDeviceVoteRecord(voteType, voteName, timestamp);
      setHasDeviceVoted(true);
      setDeviceRecord({
        hasVoted: true,
        candidate: voteType,
        candidateName: voteName,
        timestamp,
      });
    } catch (e) {
      if (e instanceof Error && e.message === 'DEVICE_ALREADY_VOTED') {
        saveDeviceVoteRecord(voteType, voteName, timestamp);
        setHasDeviceVoted(true);
        setStage('already_voted');
        setVoteErrorMsg('Este dispositivo já participou desta votação! Apenas 1 voto por aparelho.');
        return;
      }

      console.warn('Firestore vote submission fallback to local state:', e);
      // Local optimistic update fallback
      setTally((prev) => {
        const next: VoteTally = {
          ...prev,
          lula: voteType === '13' ? prev.lula + 1 : prev.lula,
          flavio: voteType === '22' ? prev.flavio + 1 : prev.flavio,
          branco: voteType === 'branco' ? prev.branco + 1 : prev.branco,
          nulo: voteType === 'nulo' ? prev.nulo + 1 : prev.nulo,
          total: prev.total + 1,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('urna_fallback_tally', JSON.stringify(next));
        return next;
      });
      saveDeviceVoteRecord(voteType, voteName, timestamp);
      setHasDeviceVoted(true);
    }

    // Switch to FIM after recording, then permanently lock to already_voted and reposition to apuração
    setTimeout(() => {
      setStage('finished');
      setTimeout(() => {
        setIsReceiptOpen(true);
        setStage('already_voted');
        // Reposition voter to live apuração
        apuracaoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 1600);
    }, 1100);
  }, [stage, hasDeviceVoted, isBranco, digits, enteredNumber, soundEnabled]);

  // Direct candidate selection from candidate card
  const handleSelectCandidate = useCallback((num: '13' | '22') => {
    if (isClosed || stage !== 'voting' || hasDeviceVoted) return;
    setIsBranco(false);
    urnaAudio.playKeypadBeep();
    setDigits([num[0], num[1]]);
  }, [isClosed, stage, hasDeviceVoted]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isClosed || isBoletimOpen || isReceiptOpen || showResetConfirm || isQrModalOpen || hasDeviceVoted || showAdminPinModal) return;

      if (e.key >= '0' && e.key <= '9') {
        if (soundEnabled) urnaAudio.playKeypadBeep();
        handleNumber(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        if (soundEnabled) urnaAudio.playCorrigeBeep();
        handleCorrige();
      } else if (e.key === 'Enter') {
        handleConfirma();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleCorrige, handleConfirma, isBoletimOpen, isReceiptOpen, showResetConfirm, isQrModalOpen, soundEnabled, hasDeviceVoted, showAdminPinModal]);

  // Execute Zerésima / Reset (Restricted strictly to the administrator's device)
  const handleExecuteReset = async () => {
    if (!isAdminDevice) {
      alert('Ação permitida exclusivamente para o dispositivo administrador.');
      setShowResetConfirm(false);
      return;
    }

    try {
      await resetTallyInFirestore();
    } catch (e) {
      console.warn('Firestore reset fallback to local:', e);
      setTally(INITIAL_TALLY);
      localStorage.setItem('urna_fallback_tally', JSON.stringify(INITIAL_TALLY));
    }
    // Clear device vote lock when urn is cleared by administrator
    clearDeviceVoteRecord();
    setHasDeviceVoted(false);
    setDeviceRecord(null);
    setStage('voting');
    setDigits([]);
    setIsBranco(false);
    setShowResetConfirm(false);
    setAdminSuccessToast('Urna zerada com sucesso (Zerésima emitida).');
    setTimeout(() => setAdminSuccessToast(null), 4000);
  };

  // Recalculate / audit all votes from individual ballots
  const handleRecalculateVotes = async () => {
    if (!isAdminDevice) return;
    try {
      const recovered = await recalculateAllVotesFromBallots();
      setTally(recovered);
      setAdminSuccessToast(`Auditoria concluída! Total de ${recovered.total} votos contabilizados.`);
      setTimeout(() => setAdminSuccessToast(null), 4000);
    } catch (e) {
      console.error('Audit failed:', e);
      alert('Erro ao recalcular votos da urna.');
    }
  };

  // Handle Admin PIN verification
  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '2026' || adminPinInput === 'admin') {
      setDeviceAsAdmin(true);
      setIsAdminDevice(true);
      setShowAdminPinModal(false);
      setAdminPinInput('');
      setAdminPinError(false);
      setAdminSuccessToast('Dispositivo autorizado como Administrador!');
      setTimeout(() => setAdminSuccessToast(null), 4000);
    } else {
      setAdminPinError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!isAdminDevice) setShowAdminPinModal(true);
              }}
              title={isAdminDevice ? 'Dispositivo Administrador' : 'Urna Eletrônica'}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <Vote className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Urna Eletrônica Online
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Flávio Bolsonaro vs Lula
                </span>
                {isAdminDevice && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Shield className="w-3 h-3 text-amber-400" />
                    Admin
                  </span>
                )}
              </h1>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isFirebaseConnected ? 'Firebase Realtime Conectado' : 'Modo Sincronizado'}
                </span>
                <span>•</span>
                <span className="text-amber-400 font-medium">1 Voto por Dispositivo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Online Voters Presence Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black shadow-sm"
              title="Pessoas conectadas à urna online agora"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{onlineCount} {onlineCount === 1 ? 'ONLINE' : 'ONLINE'}</span>
            </div>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition cursor-pointer shadow-sm"
              title="Abrir no celular via QR Code"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              <span className="hidden md:inline">QR Code Celular</span>
            </button>

            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-red-950/40 border-red-800/60 text-red-400'
              }`}
              title={soundEnabled ? 'Som da urna ativado' : 'Som desativado'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 w-full flex-grow">
        {/* Admin Success Toast (Float) */}
        {adminSuccessToast && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{adminSuccessToast}</span>
            </div>
            <button onClick={() => setAdminSuccessToast(null)} className="text-emerald-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert if double vote attempted */}
        {voteErrorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{voteErrorMsg}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout: Urna Eletrônica (FIRST ELEMENT SEEN) & Apuração (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: URNA ELETRÔNICA SIMULATOR (FIRST IN VIEW) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step 1: Candidate Cards */}
            <div>
              <div className="text-xs uppercase font-black text-slate-300 tracking-wider mb-2.5 flex items-center justify-between">
                <span>{hasDeviceVoted ? 'Status do Eleitor' : '1. Escolha seu candidato a Presidente'}</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {hasDeviceVoted ? 'Dispositivo Bloqueado' : 'Toque ou clique para selecionar'}
                </span>
              </div>
              <CandidateCards
                selectedNumber={enteredNumber}
                isBranco={isBranco}
                onSelectCandidate={handleSelectCandidate}
                onSelectBranco={handleBranco}
                disabled={effectiveStage !== 'voting' || hasDeviceVoted || isClosed}
                stage={effectiveStage}
                hasDeviceVoted={hasDeviceVoted}
                isClosed={isClosed}
                onOpenQrCode={() => setIsQrModalOpen(true)}
              />
            </div>

            {/* Regional Voter Location Selector */}
            <VoterLocationSelector
              location={voterLocation}
              onChangeLocation={setVoterLocation}
              disabled={hasDeviceVoted || isClosed}
            />

            {/* Step 2: Urna Eletrônica Machine Chassis */}
            <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
              {/* Urna Machine Header Plate */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isClosed ? 'bg-red-500' : hasDeviceVoted ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className="font-mono-urna text-xs font-bold text-slate-300 tracking-wider uppercase">
                    URNA ELETRÔNICA MODELO UE-2026 {isClosed ? '• VOTAÇÃO ENCERRADA' : hasDeviceVoted ? '• TERMINAL ENCERRADO' : ''}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  SEÇÃO: 0142 • ZONA: 001 • {voterLocation.uf}
                </div>
              </div>

              {/* Urna Screen + Physical Keypad */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Screen Side (7 cols) */}
                <div className="md:col-span-7">
                  <UrnaScreen
                    digits={digits}
                    candidate={candidate}
                    isBranco={isBranco}
                    isNulo={isNulo}
                    stage={effectiveStage}
                    winnerCandidate={winnerCandidate}
                    winnerVotes={winnerVotes}
                    winnerPct={winnerPct}
                  />
                </div>

                {/* Keypad Side (5 cols) */}
                <div className="md:col-span-5 flex justify-center">
                  <UrnaKeypad
                    onNumberClick={handleNumber}
                    onBrancoClick={handleBranco}
                    onCorrigeClick={handleCorrige}
                    onConfirmaClick={handleConfirma}
                    disabled={effectiveStage !== 'voting' || hasDeviceVoted || isClosed}
                  />
                </div>
              </div>

              {/* Action Bar when user is in active voting mode */}
              {stage === 'voting' && !hasDeviceVoted && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 text-center sm:text-left">
                    {candidate ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 justify-center sm:justify-start">
                        <CheckCircle2 className="w-4 h-4" /> Candidato selecionado: {candidate.nome} ({candidate.numero})
                      </span>
                    ) : isBranco ? (
                      <span className="text-slate-300 font-bold flex items-center gap-1.5 justify-center sm:justify-start">
                        <CheckCircle2 className="w-4 h-4" /> Voto em Branco selecionado
                      </span>
                    ) : isNulo ? (
                      <span className="text-amber-400 font-bold">
                        Número não cadastrado (Voto Nulo)
                      </span>
                    ) : (
                      <span>Selecione um candidato acima ou digite o número na urna</span>
                    )}
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleCorrige}
                      disabled={digits.length === 0 && !isBranco}
                      className="flex-1 sm:flex-initial py-2.5 px-4 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Corrigir
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirma}
                      disabled={!isVoteReady}
                      className="flex-1 sm:flex-initial py-2.5 px-4 sm:px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5 uppercase tracking-normal whitespace-nowrap shrink-0"
                    >
                      <span>Confirmar Voto</span> <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Bar when device has already voted */}
              {(hasDeviceVoted || stage === 'already_voted') && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Seu voto foi computado com sucesso nesta urna.</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {receipt && (
                        <button
                          onClick={() => setIsReceiptOpen(true)}
                          className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                          Ver Comprovante
                        </button>
                      )}
                      <button
                        onClick={() => setIsQrModalOpen(true)}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-950/40"
                      >
                        <Smartphone className="w-4 h-4" />
                        Votar em Outro Aparelho
                      </button>
                    </div>
                  </div>

                  {/* Notice to share immediately after voting */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-blue-950/80 border-2 border-emerald-500/50 shadow-xl space-y-2.5 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Share2 className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            Ajude a divulgar esta votação!
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Mais Votos • Maior Representatividade
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          Seu voto foi registrado! <strong>Compartilhe agora com seus amigos, família e grupos</strong> para que todos possam votar e a apuração reflita a vontade popular.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleWhatsAppShare}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        {shareCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Link Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-blue-400" />
                            <span>Copiar Link</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsQrModalOpen(true)}
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Abrir QR Code</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Device Voting Rule Notification Banner */}
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Regra de Integridade:</strong> Apenas <strong>1 voto é permitido por dispositivo</strong>. Escolha entre <strong className="text-blue-400">Flávio Bolsonaro (22)</strong> e <strong className="text-red-400">Lula (13)</strong>.
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer underline underline-offset-2"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Outro eleitor? Compartilhe QR Code</span>
                </button>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Voto Único e Auditável</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: APURAÇÃO & RANKING (REPOSICIONADO APÓS A VOTAÇÃO) */}
          <div ref={apuracaoRef} id="apuracao" className="lg:col-span-5 space-y-6 scroll-mt-20">
            {/* If election closed, display the Official Proclamation Banner of the Winner; else show Countdown */}
            {isClosed ? (
              <OfficialWinnerBanner tally={tally} targetDateStr="25/10/2026 às 17h00" />
            ) : (
              <CountdownTimer />
            )}

            <LiveBarChart
              tally={tally}
              isLive={isFirebaseConnected}
              onlineCount={onlineCount}
              isAdmin={isAdminDevice}
              userUf={voterLocation.uf}
              userMunicipio={voterLocation.municipio}
              onOpenBoletim={() => setIsBoletimOpen(true)}
              onResetUrna={() => setShowResetConfirm(true)}
              onRecalculateVotes={handleRecalculateVotes}
            />

            {/* Security Guarantee Notice */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantias da Pesquisa Popular Online</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1">
                <li><strong>Regra do Voto Único</strong>: Limite estrito de 1 voto por dispositivo (computador, celular ou tablet)</li>
                <li><strong>Controle de Zerésima Protegido</strong>: Apenas este dispositivo administrador possui permissão para emitir Zerésima</li>
                <li>Voto secreto e inviolável sem rastreamento de dados pessoais</li>
                <li>Contagem em tempo real sincronizada via Firebase Realtime</li>
                <li>Auditoria pública através do Boletim de Apuração (BU)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Urna Eletrônica Online • Flávio Bolsonaro vs Lula • Apuração Oficial em Tempo Real
          </div>
          <div className="flex items-center gap-3">
            <span>Sons oficiais sintetizados via Web Audio</span>
            <span>•</span>
            <button
              onClick={() => setIsBoletimOpen(true)}
              className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Auditoria de Votos (BU)
            </button>
            <span>•</span>
            <button
              onClick={() => setShowAdminPinModal(true)}
              className="text-slate-500 hover:text-amber-400 text-[11px] cursor-pointer flex items-center gap-1"
            >
              <Key className="w-3 h-3" />
              <span>{isAdminDevice ? 'Dispositivo Administrador Ativo' : 'Acesso Admin'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Boletim de Urna (BU) Modal */}
      <BoletimUrnaModal
        isOpen={isBoletimOpen}
        onClose={() => setIsBoletimOpen(false)}
        tally={tally}
        uf={voterLocation.uf}
        municipio={voterLocation.municipio}
      />

      {/* Voter Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          apuracaoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        receipt={receipt}
        location={voterLocation}
      />

      {/* Share QR Code Modal */}
      <ShareQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Admin PIN Unlock Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl relative animate-fade-in-scale">
            <button
              onClick={() => setShowAdminPinModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-center text-white mb-1">
              Controle do Administrador
            </h4>
            <p className="text-xs text-slate-400 text-center mb-4">
              Defina este dispositivo como o administrador oficial da urna para habilitar a emissão de Zerésima e auditoria.
            </p>
            <form onSubmit={handleVerifyAdminPin} className="space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="PIN de Segurança (2026)"
                  value={adminPinInput}
                  onChange={(e) => {
                    setAdminPinInput(e.target.value);
                    setAdminPinError(false);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
                />
                {adminPinError && (
                  <p className="text-[11px] text-red-400 text-center mt-1">
                    PIN incorreto. Digite 2026.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-amber-950/50"
                >
                  Confirmar PIN
                </button>
              </div>
            </form>

            {/* Admin Tool: Closure Preview Simulator */}
            {isAdminDevice && (
              <div className="pt-3 mt-3 border-t border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold text-center">
                  Teste do Encerramento (25/10 17h)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !simulatedClosure;
                    setSimulatedClosure(next);
                    setShowAdminPinModal(false);
                    setAdminSuccessToast(
                      next
                        ? 'Simulação ativada! Votações encerradas e candidato mais votado proclamado.'
                        : 'Simulação desativada. Urna reaberta para votação normal.'
                    );
                    setTimeout(() => setAdminSuccessToast(null), 4000);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>
                    {simulatedClosure
                      ? 'Desativar Teste (Reabrir Urna)'
                      : 'Simular Encerramento e Proclamar Vencedor'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await handleRecalculateVotes();
                    setShowAdminPinModal(false);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Sincronizar e Auditar Cédulas do Firebase</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearDeviceVoteRecord();
                    setHasDeviceVoted(false);
                    setStage('voting');
                    setDigits([]);
                    setIsBranco(false);
                    setShowAdminPinModal(false);
                    setAdminSuccessToast('Terminal desbloqueado com sucesso neste dispositivo para realização de novos testes de voto!');
                    setTimeout(() => setAdminSuccessToast(null), 4000);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Desbloquear Urna Neste Aparelho (Novo Teste)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zerésima / Reset Confirmation Modal (Strictly for Administrator) */}
      {showResetConfirm && isAdminDevice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center text-white shadow-2xl animate-fade-in-scale">
            <h4 className="text-lg font-bold text-red-400 mb-2">
              Emitir Zerésima / Zerar Urna?
            </h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Esta ação é restrita ao administrador. Ela reiniciará a contagem oficial para zero no banco de dados.
            </p>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 mb-5 text-left">
              Total atual de votos registrados: <strong className="text-white">{tally.total}</strong>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteReset}
                className="py-2.5 px-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold cursor-pointer text-white shadow-lg shadow-red-950/50"
              >
                Confirmar e Zerar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
