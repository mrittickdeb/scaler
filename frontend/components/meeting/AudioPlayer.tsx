"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Select } from "@/components/ui/Select";

export interface AudioPlayerProps {
  src?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onSeekRequest?: (time: number) => void;
  seekTarget?: number | null;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  onTimeUpdate,
  seekTarget,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (seekTarget !== null && seekTarget !== undefined && audioRef.current) {
      audioRef.current.currentTime = seekTarget;
      setCurrentTime(seekTarget);
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [seekTarget]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    setCurrentTime(curr);
    if (onTimeUpdate) {
      onTimeUpdate(curr);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleRateChange = (rateStr: string) => {
    const rate = parseFloat(rateStr);
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
      <audio
        ref={audioRef}
        src={src || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleScrubberChange}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0F6B5C]"
        />
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => skipSeconds(-5)}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#0F6B5C] hover:bg-[#0B5246] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => skipSeconds(5)}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Forward 5s"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-20">
            <Select
              value={playbackRate.toString()}
              onChange={(e) => handleRateChange(e.target.value)}
              options={[
                { value: "0.75", label: "0.75x" },
                { value: "1", label: "1.0x" },
                { value: "1.25", label: "1.25x" },
                { value: "1.5", label: "1.5x" },
                { value: "2", label: "2.0x" },
              ]}
            />
          </div>

          <button
            onClick={toggleMute}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-md"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
