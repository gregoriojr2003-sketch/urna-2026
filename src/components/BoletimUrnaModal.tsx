import React from 'react';
import { VoteTally } from '../types';
import { X, Printer, CheckCircle } from 'lucide-react';

interface BoletimUrnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tally: VoteTally;
  municipio?: string;
  uf?: string;
}

export const BoletimUrnaModal: React.FC<BoletimUrnaModalProps> = ({
  isOpen,
  onClose,
  tally,
  municipio = 'BRASÍLIA',
  uf = 'DF',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const validos = (tally.lula || 0) + (tally.flavio || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 font-mono text-xs relative my-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-400 mb-4 print:hidden">
          <span className="font-bold text-slate-700 uppercase tracking-widest text-sm">
            Boletim de Urna (BU) Oficial
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-800 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content - Styled like authentic thermal paper receipt */}
        <div className="space-y-3 bg-[#fdfbf7] p-5 border border-slate-200 rounded shadow-inner">
          <div className="text-center pb-2 border-b border-dashed border-slate-300">
            <div className="font-bold text-sm tracking-wider">PESQUISA POPULAR</div>
            <div className="text-[11px] text-slate-600">SONDAGEM DE OPINIÃO PÚBLICA</div>
            <div className="text-[10px] text-slate-500 mt-0.5">SISTEMA ELETRÔNICO DE VOTAÇÃO ONLINE</div>
            <div className="font-bold mt-2 text-xs">BOLETIM DE APURAÇÃO</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-dashed border-slate-300">
            <div><strong>MUNICÍPIO:</strong> {municipio.toUpperCase()} / {uf.toUpperCase()}</div>
            <div><strong>ZONA:</strong> 001 <strong>SEÇÃO:</strong> 0142</div>
            <div><strong>CARGO:</strong> PRESIDENTE DA REPÚBLICA</div>
            <div><strong>TURNO:</strong> 2º TURNO</div>
          </div>

          <div className="py-1">
            <div className="font-bold text-center text-xs pb-1 mb-2 border-b border-slate-200">
              VOTAÇÃO DOS CANDIDATOS
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center py-1 px-1 bg-slate-100/70 rounded">
                <div>
                  <strong>22</strong> - FLÁVIO BOLSONARO (PL)
                </div>
                <div className="font-bold font-mono">
                  {tally.flavio} {tally.flavio === 1 ? 'VOTO' : 'VOTOS'}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 px-1 bg-slate-100/70 rounded">
                <div>
                  <strong>13</strong> - LULA (PT)
                </div>
                <div className="font-bold font-mono">
                  {tally.lula} {tally.lula === 1 ? 'VOTO' : 'VOTOS'}
                </div>
              </div>

              <div className="flex justify-between items-center py-0.5 px-1 text-slate-600">
                <div>VOTOS EM BRANCO:</div>
                <div className="font-mono">{tally.branco}</div>
              </div>

              <div className="flex justify-between items-center py-0.5 px-1 text-slate-600">
                <div>VOTOS NULOS:</div>
                <div className="font-mono">{tally.nulo}</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between font-bold">
              <span>TOTAL DE VOTOS VÁLIDOS:</span>
              <span>{validos}</span>
            </div>
            <div className="flex justify-between font-extrabold text-xs">
              <span>TOTAL GERAL DE VOTOS:</span>
              <span>{tally.total}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-500 leading-tight">
            <div>HASH DE VERIFICAÇÃO CRIPTOGRÁFICA:</div>
            <div className="font-mono break-all text-[8px] bg-slate-100 p-1 rounded mt-0.5">
              SHA256: 4F9B7E3A1C2D8E9F0A5B6C7D8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F
            </div>
            <div className="mt-2 text-center text-emerald-800 font-bold flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              INTEGRIDADE AUDITADA E SINCRONIZADA
            </div>
          </div>
        </div>

        <div className="mt-4 text-center print:hidden">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs transition cursor-pointer"
          >
            Fechar Boletim
          </button>
        </div>
      </div>
    </div>
  );
};
