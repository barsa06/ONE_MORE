import React from 'react';
import { X, Volume2, Sliders, Smartphone, Check, Lock, ShieldCheck } from 'lucide-react';
import { GameSettings } from '../game/types';
import { SKINS } from '../game/Storage';
import { soundFX } from '../game/SoundFX';

interface SettingsModalProps {
  settings: GameSettings;
  highScore: number;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  highScore,
  onUpdateSettings,
  onClose,
}) => {
  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ masterVolume: val });
    soundFX.setVolumes(val, settings.sfxVolume);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ sfxVolume: val });
    soundFX.setVolumes(settings.masterVolume, val);
    soundFX.playCollectSpark();
  };

  const handleToggleScreenShake = () => {
    onUpdateSettings({ screenShake: !settings.screenShake });
  };

  const handleToggleReducedMotion = () => {
    onUpdateSettings({ reducedMotion: !settings.reducedMotion });
  };

  const handleSelectSkin = (skinId: string, unlockScore: number) => {
    if (highScore < unlockScore) return;
    onUpdateSettings({ selectedSkin: skinId });
    soundFX.playCollectPrism();
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-black tracking-wide text-white uppercase">SETTINGS & CUSTOMIZATION</h2>
          </div>
          <button
            id="settings-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-sm">
          {/* Audio Section */}
          <div>
            <h3 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> AUDIO SETTINGS
            </h3>
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {/* Master Volume */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">MASTER VOLUME</span>
                  <span className="text-white font-bold">{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={handleMasterChange}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              {/* SFX Volume */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">SFX VOLUME</span>
                  <span className="text-white font-bold">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={handleSfxChange}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Gameplay & Accessibility Section */}
          <div className="border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> ACCESSIBILITY & DISPLAY
            </h3>
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {/* Screen Shake */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Screen Shake Feedback</div>
                  <div className="text-[11px] text-slate-400">Dynamic impulse shake on near-misses and dash impacts</div>
                </div>
                <button
                  onClick={handleToggleScreenShake}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.screenShake ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      settings.screenShake ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                <div>
                  <div className="text-xs font-semibold text-white">Reduced Motion & Flashes</div>
                  <div className="text-[11px] text-slate-400">Mutes rapid flash pulses for photosensitive comfort</div>
                </div>
                <button
                  onClick={handleToggleReducedMotion}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.reducedMotion ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      settings.reducedMotion ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Ship Customization & Progression */}
          <div className="border-t border-slate-800/80 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> SHIP CUSTOMIZATION (PROGRESSION)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                BEST: <strong className="text-white">{highScore.toLocaleString()} PTS</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SKINS.map((skin) => {
                const isUnlocked = highScore >= skin.unlockScore;
                const isSelected = settings.selectedSkin === skin.id;

                return (
                  <button
                    key={skin.id}
                    onClick={() => handleSelectSkin(skin.id, skin.unlockScore)}
                    disabled={!isUnlocked}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                        : isUnlocked
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 cursor-pointer'
                        : 'bg-slate-950/30 border-slate-900 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {/* Ship Color Orb Preview */}
                    <div
                      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center border"
                      style={{
                        backgroundColor: skin.primaryColor,
                        borderColor: skin.secondaryColor,
                        boxShadow: `0 0 10px ${skin.glowColor}`,
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: skin.secondaryColor }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{skin.name}</span>
                        {isSelected ? (
                          <span className="text-[10px] font-mono text-sky-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> EQUIPPED
                          </span>
                        ) : !isUnlocked ? (
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> {skin.unlockScore.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{skin.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            id="settings-done-btn"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
