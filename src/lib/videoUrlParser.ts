export type VideoType = "youtube" | "vimeo" | "mp4" | "unknown";

export interface ParsedVideoUrl {
  type: VideoType;
  embedUrl: string;
  videoId?: string;
}

export function parseVideoUrl(url: string): ParsedVideoUrl {
  if (!url) return { type: "unknown", embedUrl: url };

  const youtubeEmbedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (youtubeEmbedMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeEmbedMatch[1]}`,
      videoId: youtubeEmbedMatch[1],
    };
  }

  const youtubeWatchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (youtubeWatchMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`,
      videoId: youtubeWatchMatch[1],
    };
  }

  const youtubeShortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtubeShortMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeShortMatch[1]}`,
      videoId: youtubeShortMatch[1],
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      videoId: vimeoMatch[1],
    };
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: "mp4", embedUrl: url };
  }

  return { type: "unknown", embedUrl: url };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
