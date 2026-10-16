import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, Share2, QrCode, Smartphone } from 'lucide-react';

interface ShareQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareQrCodeModal: React.FC<ShareQrCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use current window location or development/production URL
      const currentUrl = window.location.href;
      setAppUrl(currentUrl);
    }
  }, []);

  useEffect(() => {
    if (isOpen && canvasRef.current && appUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        appUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#090d16',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        },
        (error) => {
          if (error) console.error('QR Code render error:', error);
        }
      );
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'urna-eletronica-qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Urna Eletrônica Online - Votação Flávio Bolsonaro vs Lula',
          text: 'Vote na Urna Eletrônica Online e acompanhe a apuração ao vivo!',
          url: appUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-fade-in-scale">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">QR Code de Votação</h3>
              <p className="text-[11px] text-slate-400">Abra a urna direto no celular</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-slate-800 flex items-center justify-center">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <Smartphone className="w-4 h-4" />
            <span>Aponte a câmera do smartphone para votar</span>
          </div>
        </div>

        {/* URL Box with Copy Button */}
        <div className="mt-4 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
          <div className="font-mono text-[11px] text-slate-400 truncate flex-1 select-all">
            {appUrl}
          </div>
          <button
            onClick={handleCopy}
            title="Copiar link"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleDownload}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            <Download className="w-4 h-4 text-blue-400" /> Baixar Imagem
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-blue-950/50"
          >
            <Share2 className="w-4 h-4" /> Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
};
