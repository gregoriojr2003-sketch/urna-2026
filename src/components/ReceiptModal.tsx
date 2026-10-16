import React from 'react';
import { VoterReceipt } from '../types';
import { CheckCircle2, Copy, Check, ShieldCheck, Lock, Share2, MessageCircle } from 'lucide-react';

interface ReceiptModalProps {
  receipt: VoterReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  location?: { uf: string; municipio: string; regiao: string; auditHash?: string };
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  location,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !receipt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Comprovante de Votação - Pesquisa Popular\nProtocolo: ${receipt.codigoEleitoral}\nAutenticação: ${receipt.autenticacao}\nData: ${new Date(receipt.timestamp).toLocaleString('pt-BR')}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in-scale">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white">
            Voto Computado com Sucesso!
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Seu voto foi registrado e sincronizado no banco de dados em tempo real.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-left text-xs font-mono space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>COMPROVANTE DIGITAL - PESQUISA POPULAR</span>
          </div>

          <div className="flex justify-between py-0.5">
            <span className="text-slate-400">Protocolo:</span>
            <span className="font-bold text-slate-200">{receipt.codigoEleitoral}</span>
          </div>

          <div className="flex justify-between py-0.5">
            <span className="text-slate-400">Data/Hora:</span>
            <span className="text-slate-200">{new Date(receipt.timestamp).toLocaleString('pt-BR')}</span>
          </div>

          <div className="flex justify-between py-0.5">
            <span className="text-slate-400">Seção Virtual:</span>
            <span className="text-slate-200">0142 / Zona 001</span>
          </div>

          {location && (
            <>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Origem do Acesso:</span>
                <span className="text-blue-300 font-bold">{location.municipio} - {location.uf} ({location.regiao})</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Auditoria do Terminal:</span>
                <span className="text-emerald-400 font-bold">{location.auditHash || 'AUD-VERIFICADO'}</span>
              </div>
            </>
          )}

          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-500 text-[10px] block mb-1">CÓDIGO DE AUTENTICAÇÃO:</span>
            <span className="text-[10px] break-all text-slate-300 bg-slate-900 p-1.5 rounded block">
              {receipt.autenticacao}
            </span>
          </div>
        </div>

        {/* Device Lock Info */}
        <div className="mb-4 p-2.5 bg-blue-950/30 border border-blue-900/50 rounded-xl flex items-center gap-2 text-[11px] text-blue-300">
          <Lock className="w-4 h-4 flex-shrink-0 text-blue-400" />
          <span>Voto único registrado neste dispositivo. Apenas 1 voto é permitido por aparelho.</span>
        </div>

        {/* Notice to share immediately after voting */}
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-blue-950/70 border border-emerald-500/40 text-left space-y-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
              Ajude a divulgar esta votação!
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Compartilhe agora com seus amigos, familiares e grupos para garantir maior participação e representatividade popular!
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const text = `🗳️ Acabei de votar na Urna Eletrônica Online (Flávio Bolsonaro vs Lula)! Vote você também e acompanhe a apuração ao vivo: ${window.location.href}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: 'Urna Eletrônica Online - Pesquisa Presidencial 2026',
                      text: 'Vote na Urna Eletrônica Online e acompanhe a apuração ao vivo!',
                      url: window.location.href,
                    });
                  } catch (e) {
                    // ignore
                  }
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar Código
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            Ver Apuração
          </button>
        </div>
      </div>
    </div>
  );
};
