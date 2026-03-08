interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
  /** Start time in seconds */
  start?: number;
  /** End time in seconds */
  end?: number;
}

/**
 * Embedded YouTube player for educational videos.
 * Videos are curated and pre-selected for relevance.
 */
const YouTubeEmbed = ({ videoId, title = "סרטון", className = "", start, end }: YouTubeEmbedProps) => {
  let src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  if (start) src += `&start=${start}`;
  if (end) src += `&end=${end}`;

  return (
    <div className={`rounded-xl overflow-hidden border border-border/25 bg-black/20 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/15">
        <span className="text-sm">🎬</span>
        <span className="text-[11px] font-bold text-foreground/70">{title}</span>
        <span className="text-[9px] text-muted-foreground mr-auto">צפו בסרטון כדי למצוא רמזים!</span>
      </div>
      <div className="aspect-video">
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default YouTubeEmbed;
