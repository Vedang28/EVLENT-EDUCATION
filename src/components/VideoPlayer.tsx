import { useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { parseVideoUrl, formatTime } from "@/lib/videoUrlParser";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { toast } from "sonner";

interface VideoPlayerProps {
  url: string;
  lessonId?: string;
}

const SPEED_OPTIONS = ["0.5", "0.75", "1", "1.25", "1.5", "2"];

export default function VideoPlayer({ url, lessonId }: VideoPlayerProps) {
  const parsed = parseVideoUrl(url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speed, setSpeed] = useState(() => localStorage.getItem("video-playback-speed") || "1");
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeOffered = useRef(false);

  const { savedPosition, updatePosition, saveImmediately } = useVideoProgress(lessonId);

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    setShowControls(true);
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (lessonId) updatePosition(video.currentTime, video.duration);
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      video.playbackRate = parseFloat(speed);

      if (savedPosition > 10 && !resumeOffered.current) {
        resumeOffered.current = true;
        toast(`Resume from ${formatTime(savedPosition)}?`, {
          action: {
            label: "Resume",
            onClick: () => {
              if (videoRef.current) videoRef.current.currentTime = savedPosition;
            },
          },
          duration: 8000,
        });
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      if (lessonId) saveImmediately(video.duration, video.duration);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
    };
  }, [savedPosition, speed, lessonId, updatePosition, saveImmediately]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = value[0];
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        video.volume = 0.5;
        setVolume(0.5);
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const changeSpeed = (newSpeed: string) => {
    setSpeed(newSpeed);
    localStorage.setItem("video-playback-speed", newSpeed);
    if (videoRef.current) videoRef.current.playbackRate = parseFloat(newSpeed);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  if (parsed.type === "youtube" || parsed.type === "vimeo") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-video">
            <iframe
              src={parsed.embedUrl}
              className="h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (parsed.type === "mp4") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative aspect-video bg-black group"
            onMouseMove={scheduleHideControls}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={parsed.embedUrl}
              className="h-full w-full cursor-pointer"
              onClick={togglePlay}
              playsInline
            />

            {/* Controls overlay */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Progress bar */}
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 1}
                step={0.1}
                onValueChange={handleSeek}
                className="mb-2 cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
              />

              {/* Controls row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                {/* Time */}
                <span className="text-xs text-white font-mono min-w-[80px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <div className="flex-1" />

                {/* Speed */}
                <Select value={speed} onValueChange={changeSpeed}>
                  <SelectTrigger className="h-7 w-16 text-xs bg-transparent text-white border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEED_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Volume */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={handleVolumeChange}
                  className="w-20 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                />

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Big play button overlay when paused */}
            {!isPlaying && currentTime === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={togglePlay}
                >
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback: unknown URL type - render as iframe (backward compatible)
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video">
          <iframe
            src={url}
            className="h-full w-full"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </CardContent>
    </Card>
  );
}
