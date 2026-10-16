import React, { useState } from 'react';
import {
  AuditedDeviceLocation,
  updateLocationFromGps,
  detectDeviceAccessLocation,
} from '../utils/deviceLocation';
import {
  ShieldCheck,
  MapPin,
  Compass,
  Radio,
  Lock,
  RefreshCw,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface VoterLocationSelectorProps {
  location: AuditedDeviceLocation;
  onChangeLocation: (newLoc: AuditedDeviceLocation) => void;
  disabled?: boolean;
}

export const VoterLocationSelector: React.FC<VoterLocationSelectorProps> = ({
  location,
  onChangeLocation,
  disabled = false,
}) => {
  const [isUpdatingGps, setIsUpdatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null);

  const handleSyncGps = async () => {
    if (disabled || isUpdatingGps) return;
    setIsUpdatingGps(true);
    setGpsError(null);
    setGpsSuccess(null);

    try {
      const updated = await updateLocationFromGps();
      onChangeLocation(updated);
      setGpsSuccess(`Localização aferida com sucesso via GPS: ${updated.municipio} - ${updated.uf}`);
      setTimeout(() => setGpsSuccess(null), 5000);
    } catch (err) {
      // If GPS permission denied or failed, retry via network IP
      try {
        const netRefreshed = await detectDeviceAccessLocation(true);
        onChangeLocation(netRefreshed);
        setGpsSuccess(`Localização validada via conexão de rede: ${netRefreshed.municipio} - ${netRefreshed.uf}`);
        setTimeout(() => setGpsSuccess(null), 5000);
      } catch (e) {
        setGpsError('Não foi possível obter sinal de satélite GPS. Mantendo auditoria da conexão de rede.');
        setTimeout(() => setGpsError(null), 5000);
      }
    } finally {
      setIsUpdatingGps(false);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Top Header: Audit Badge & Anti-Tamper Status */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-400 uppercase font-black tracking-wider flex items-center gap-1.5">
              <span>Regionalização Auditada por Acesso</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 font-normal hidden sm:inline">• Incontestável</span>
            </div>
            <div className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                {location.municipio} - {location.uf}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                Região {location.regiao}
              </span>
            </div>
          </div>
        </div>

        {/* Sync via GPS / Network Button */}
        {!disabled && (
          <button
            type="button"
            onClick={handleSyncGps}
            disabled={isUpdatingGps}
            title="Sincronizar precisão de localização via sensor GPS ou rede do aparelho"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700 shadow-sm"
          >
            <Compass className={`w-3.5 h-3.5 text-blue-400 ${isUpdatingGps ? 'animate-spin' : ''}`} />
            <span>{isUpdatingGps ? 'Calibrando...' : 'Aferir via GPS / Rede'}</span>
          </button>
        )}
      </div>

      {/* Audit Certificate Strip */}
      <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Origem: <strong>{location.detalheMetodo}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Selo: <strong className="text-slate-200">{location.auditHash || 'AUD-VERIFICADO'}</strong></span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
          <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
          <span>
            Para garantir a <strong>idoneidade e a total ausência de contestação</strong> dos votos regionais, a localização é vinculada exclusivamente ao acesso real verificado deste terminal.
          </span>
        </div>
      </div>

      {/* Feedback alerts */}
      {gpsSuccess && (
        <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{gpsSuccess}</span>
        </div>
      )}

      {gpsError && (
        <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs flex items-center gap-2 animate-fade-in">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}
    </div>
  );
};
