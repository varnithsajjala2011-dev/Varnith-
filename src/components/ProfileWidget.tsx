import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { LucideIcon } from './LucideIcon';
import { audio } from '../utils/audio';

// Cool retro-styled gaming handle generators
const ADJECTIVES = ['Neon', 'Cyber', 'Pixel', 'Retro', 'Cosmo', 'Alpha', 'Quantum', 'Astro', 'Mega', 'Slick', 'Vortex', 'Hyper', 'Sonic'];
const NOUNS = ['Brain', 'Mind', 'Genius', 'Master', 'Solver', 'Seeker', 'Sage', 'Runner', 'Wizard', 'Warp', 'Coder', 'Hacker', 'Surfer'];

interface ProfileProps {
  profile: PlayerProfile;
  onChangeProfile: (updated: PlayerProfile) => void;
}

export const ProfileWidget: React.FC<ProfileProps> = ({ profile, onChangeProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.username);
  const [isMuted, setIsMuted] = useState(audio.isMuted());

  const generateRandomName = () => {
    audio.playClick();
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const rolledName = `${adj}${noun}${num}`;
    setTempName(rolledName);
    if (!isEditing) {
      saveNewName(rolledName);
    }
  };

  const saveNewName = (nameToSave: string) => {
    const trimmed = nameToSave.trim().substring(0, 18);
    if (trimmed) {
      onChangeProfile({
        ...profile,
        username: trimmed
      });
    }
  };

  const handleMuteToggle = () => {
    const nextMute = audio.toggleMute();
    setIsMuted(nextMute);
    audio.playClick();
  };

  // Level thresholds: 100 XP per level
  const xpNeededForNextLevel = 100;
  const currentLevelXp = profile.experience % 100;
  const percentage = Math.min((currentLevelXp / xpNeededForNextLevel) * 100, 100);

  return (
    <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-5 shadow-[6px_6px_0px_rgba(30,27,75,1)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Left Side: Avatar and Info */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {/* Pop character avatar */}
            <div className="relative w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center border-4 border-indigo-950 text-white shadow-[3px_3px_0px_#1e1b4b]">
              <span className="text-3xl font-display font-black select-none">
                {profile.username.charAt(0).toUpperCase()}
              </span>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 border-2 border-indigo-950 text-[10px] font-mono font-black text-black px-1.5 py-0.5 rounded-lg uppercase tracking-wider shadow">
                LVL {profile.level}
              </div>
            </div>
          </div>
 
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    maxLength={18}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-indigo-950 border-3 border-indigo-950 rounded-xl px-3 py-1.5 text-sm text-yellow-300 outline-none focus:ring-2 focus:ring-pink-500 font-bold"
                    placeholder="Enter handle..."
                  />
                  <button
                    onClick={() => {
                      audio.playClick();
                      saveNewName(tempName);
                      setIsEditing(false);
                    }}
                    className="p-2 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-indigo-900 rounded-xl transition-all font-bold cursor-pointer"
                    title="Confirm Name"
                  >
                    <LucideIcon name="CheckCircle" size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-display font-black text-white tracking-tight uppercase leading-none">
                    @{profile.username}
                  </h3>
                  <button
                    onClick={() => {
                      audio.playClick();
                      setIsEditing(true);
                    }}
                    className="text-indigo-200 hover:text-yellow-400 transition-colors p-1"
                    title="Rename Pilot"
                  >
                    <LucideIcon name="Shield" size={15} />
                  </button>
                </div>
              )}
              
              <button
                onClick={generateRandomName}
                className="text-xs bg-indigo-950 hover:bg-indigo-800 text-yellow-400 hover:text-yellow-300 border-2 border-indigo-950 rounded-xl px-2.5 py-1 flex items-center gap-1.5 transition-all font-bold cursor-pointer"
                title="Generate Random Pilot Name"
              >
                <LucideIcon name="Zap" size={12} className="text-yellow-400 animate-pulse" />
                <span>Reroll</span>
              </button>
            </div>
 
            {/* Experience mini-gauge */}
            <div className="mt-3.5 w-full max-w-xs">
              <div className="flex justify-between text-[10px] text-indigo-200 mb-1 font-mono font-extrabold tracking-wider">
                <span>XP DATASTREAM</span>
                <span>{currentLevelXp} / {xpNeededForNextLevel} XP</span>
              </div>
              <div className="h-4 w-full bg-indigo-950 rounded-full overflow-hidden p-[2px] border-2 border-indigo-950">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
 
        {/* Right Side: High Scores / Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 bg-indigo-950 border-2 border-indigo-950 rounded-2xl p-2.5 shadow-inner">
            <div className="text-center px-1.5">
              <div className="text-[9px] text-pink-400 font-mono font-black tracking-wider uppercase">Sprint HS</div>
              <div className="text-white font-extrabold font-mono text-sm leading-none mt-1">
                {profile.highScores.sprint || 0}
              </div>
            </div>
            <div className="h-6 w-[2px] bg-indigo-900" />
            <div className="text-center px-1.5">
              <div className="text-[9px] text-yellow-400 font-mono font-black tracking-wider uppercase">Survival HS</div>
              <div className="text-white font-extrabold font-mono text-sm leading-none mt-1">
                {profile.highScores.survival || 0}
              </div>
            </div>
            <div className="h-6 w-[2px] bg-indigo-900" />
            <div className="text-center px-1.5">
              <div className="text-[9px] text-cyan-400 font-mono font-black tracking-wider uppercase">Frenzy HS</div>
              <div className="text-white font-extrabold font-mono text-sm leading-none mt-1">
                {profile.highScores.time_attack || 0}
              </div>
            </div>
          </div>
 
          {/* Sound Control */}
          <button
            onClick={handleMuteToggle}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border-3 border-indigo-950 cursor-pointer ${
              isMuted 
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#1e1b4b]' 
                : 'bg-indigo-950 hover:bg-indigo-800 text-cyan-400 shadow-[2px_2px_0px_#1e1b4b] hover:shadow-[1px_1px_0px_#1e1b4b]'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <LucideIcon name={isMuted ? 'VolumeX' : 'Volume2'} size={18} className="stroke-[2.5]" />
          </button>
        </div>
 
      </div>
    </div>
  );
};
