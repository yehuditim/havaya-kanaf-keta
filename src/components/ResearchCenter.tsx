import { useState } from "react";
import { playClick, playReveal } from "./SoundEffects";

interface InfoCard {
  title: string;
  emoji: string;
  content: string;
  category: "ecology" | "navigation" | "technology" | "conservation" | "locations";
  source?: { label: string; url: string };
  /** Whether this card is especially useful for solving puzzles */
  clueRelevant?: boolean;
}

const categoryLabels: Record<string, { label: string; emoji: string; color: string }> = {
  ecology: { label: "אקולוגיה", emoji: "🌍", color: "bg-station-1/15 border-station-1/25 text-station-1" },
  navigation: { label: "ניווט ותעופה", emoji: "🧭", color: "bg-station-2/15 border-station-2/25 text-station-2" },
  technology: { label: "טכנולוגיה ומחקר", emoji: "📡", color: "bg-station-4/15 border-station-4/25 text-station-4" },
  conservation: { label: "שימור והגנה", emoji: "🛡️", color: "bg-station-3/15 border-station-3/25 text-station-3" },
  locations: { label: "מוקדי צפרות", emoji: "📍", color: "bg-primary/15 border-primary/25 text-primary" },
};

const infoCards: InfoCard[] = [
  {
    title: "הנתיב האפרו-פליארקטי",
    emoji: "🗺️",
    category: "ecology",
    clueRelevant: true,
    content:
      "ישראל נמצאת על הנתיב האפרו-פליארקטי — אחד ממסלולי הנדידה הגדולים בעולם. כמיליארד ציפורים חולפות דרכה פעמיים בשנה. ישראל היא ׳צוואר בקבוק׳ — רצועת יבשה צרה בין שלוש יבשות שאי אפשר לעקוף.",
    source: { label: "ויקיפדיה — נדידת ציפורים", url: "https://he.wikipedia.org/wiki/%D7%A0%D7%93%D7%99%D7%93%D7%AA_%D7%A6%D7%99%D7%A4%D7%95%D7%A8%D7%99%D7%9D" },
  },
  {
    title: "דואים מול נודדי לילה",
    emoji: "☀️",
    category: "navigation",
    clueRelevant: true,
    content:
      "דואים (חסידות, שקנאים, דורסים) — עופות גדולים שרוכבים על תרמיקות (זרמי אוויר חם) ביום. הם נמנעים מלחצות ימים כי אין תרמיקות מעל מים. נודדי לילה (סבכיים, זמירים) — ציפורי שיר קטנות שטסות בחשיכה כדי להימנע מטורפים ומאיבוד נוזלים בחום.",
  },
  {
    title: "היפרפגיה — תדלוק לפני הטיסה",
    emoji: "⚖️",
    category: "ecology",
    clueRelevant: true,
    content:
      "לפני נדידה ציפורים עוברות היפרפגיה — אכילה מוגברת מטורפת שמעלה את משקלן עד 50% בשומן! בנוסף יש שינויים הורמונליים, עליית ערנות, ושינויים פיזיולוגיים שמכינים את הגוף לטיסה של אלפי קילומטרים.",
  },
  {
    title: "GPS ביולוגי — ניווט מדהים",
    emoji: "🧠",
    category: "navigation",
    clueRelevant: true,
    content:
      "ציפורים נודדות מנווטות באמצעות: מצפן מגנטי מולד (חישת השדה המגנטי של כדור הארץ), ניווט לפי מיקום השמש ביום וכוכבים בלילה, זיהוי ציוני דרך גאוגרפיים כמו נהרות והרים, וזיכרון מסלולים שעובר בתורשה.",
  },
  {
    title: "תצורת V — חיסכון גאוני",
    emoji: "✈️",
    category: "navigation",
    content:
      "כשעגורים טסים בתצורת V, כל ציפור ׳רוכבת׳ על זרם האוויר שיוצרת זו שלפניה — חיסכון של עד 70% באנרגיה! הן מתחלפות בהובלה. עגורים יכולים לטוס בגובה 8,000 מטר — מעל הרי ההימלאיה!",
  },
  {
    title: "אילת והערבה — שער הכניסה",
    emoji: "🏜️",
    category: "locations",
    clueRelevant: true,
    content:
      "אילת היא ״שער הכניסה הדרומי״ של ישראל — המפגש הראשון של ציפורים עם מים וצמחייה אחרי חציית מדבר סהרה. מקום עצירה קריטי לעגורים, שקנאים ועיטים. פסטיבל הצפרות באילת (מרץ 2026) הוא אירוע בינלאומי!",
    source: { label: "פסטיבל הצפרות באילת", url: "https://www.eilatbirdfestival.com/" },
  },
  {
    title: "אגמון החולה — האב של הצפון",
    emoji: "🌿",
    category: "locations",
    clueRelevant: true,
    content:
      "עמק החולה בצפון הוא ״האב של האקולוגיה הצפונית״. ביצות, שדות חקלאיים ובריכות דגים מושכים חצי מיליארד ציפורים בשנה! עד 40,000 עגורים אפורים חונים כאן כל חורף. מרכז הצפרות פתוח למבקרים.",
    source: { label: "אגמון החולה", url: "https://www.agamon-hula.co.il/" },
  },
  {
    title: "מעגן מיכאל וצפרות עירונית",
    emoji: "🏙️",
    category: "locations",
    content:
      "מעגן מיכאל — נקודה מרכזית בחוף שמושכת עופות מים ודורסים בזכות בריכות דגים. וגם: גינות קטנות בלב ירושלים ותל אביב משמשות תחנות עצירה חיוניות לציפורי שיר! הוכחה שגם עיר יכולה לעזור.",
  },
  {
    title: "טיבוע, GPS ומכ״ם",
    emoji: "📡",
    category: "technology",
    clueRelevant: true,
    content:
      "טיבוע — טבעת אלומיניום עם מספר ייחודי מלמדת על תוחלת חיים ונאמנות לאתרים. משדרי GPS זעירים (פחות מ-5 גרם!) מאפשרים מעקב בזמן אמת. מכ״ם עוקב אחרי להקות שלמות ומונע התנגשויות עם מטוסים.",
  },
  {
    title: "eBird — מדע אזרחי",
    emoji: "📱",
    category: "technology",
    clueRelevant: true,
    content:
      "eBird הוא פרויקט מדע אזרחי גלובלי — צפרים מכל העולם מדווחים על תצפיות באפליקציה. מיליוני דיווחים עוזרים למדענים לעקוב אחרי שינויים באוכלוסיות ולתכנן שמורות. גם ילדים יכולים להשתתף!",
    source: { label: "eBird", url: "https://ebird.org/" },
  },
  {
    title: "איומים על הנודדות",
    emoji: "⚠️",
    category: "conservation",
    clueRelevant: true,
    content:
      "הרעלות מחומרי הדברה בחקלאות, ציד לא חוקי במדינות שכנות, עמודי חשמל שגורמים להתחשמלות, טורבינות רוח, זיהום אור שמבלבל נודדי לילה, ומינים פולשים (מיינה, דררה) שמתחרים על מזון וקינון.",
  },
  {
    title: "פרויקט ׳פורשים כנף׳",
    emoji: "🛡️",
    category: "conservation",
    content:
      "מאמץ ישראלי ייחודי להגנה על דורסים בסכנת הכחדה: מיגון עמודי חשמל, תחנות האכלה, גידול רבייה בשבי, וגרעיני שימור. בזכותו, אוכלוסיות נשרים וציפורים דורסות בישראל מתאוששות!",
    source: { label: "החברה להגנת הטבע", url: "https://www.teva.org.il" },
  },
  {
    title: "אירועי צפרות בישראל",
    emoji: "🎉",
    category: "conservation",
    content:
      "פסטיבל הצפרות באילת (מרץ 2026) — חגיגה בינלאומית! מירוץ ׳אלופי הנדידה׳ (Champions of the Flyway) — צוותים מתחרים לזהות כמה שיותר מינים ב-24 שעות לגיוס כספים. צפרתון קק״ל — מרתון צפרות ארצי באוקטובר.",
    source: { label: "Champions of the Flyway", url: "https://www.champions-of-the-flyway.com/" },
  },
];

const ResearchCenter = ({ onClose }: { onClose: () => void }) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [discoveredCards, setDiscoveredCards] = useState<Set<number>>(new Set());

  const filteredCards = activeCategory
    ? infoCards.filter((c) => c.category === activeCategory)
    : infoCards;

  const handleExpand = (realIndex: number) => {
    playClick();
    if (expandedCard === realIndex) {
      setExpandedCard(null);
    } else {
      setExpandedCard(realIndex);
      if (!discoveredCards.has(realIndex)) {
        playReveal();
        setDiscoveredCards((prev) => new Set([...prev, realIndex]));
      }
    }
  };

  const clueCount = infoCards.filter((c) => c.clueRelevant).length;
  const discoveredClues = infoCards.filter((c, i) => c.clueRelevant && discoveredCards.has(i)).length;

  return (
    <div className="fixed inset-0 z-40 bg-background/98 backdrop-blur-md overflow-auto">
      <div className="max-w-2xl mx-auto p-5 py-6">
        {/* ═══ HEADER ═══ */}
        <div className="glass-card rounded-2xl p-5 mb-5 border border-accent/20 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <div className="absolute top-2 right-8 text-6xl">📚</div>
            <div className="absolute bottom-2 left-8 text-5xl">🔍</div>
            <div className="absolute top-4 left-[40%] text-4xl">🧬</div>
          </div>

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-3xl shadow-md shadow-accent/10 shrink-0">
                📚
              </div>
              <div>
                <h2 className="text-xl font-black text-accent mb-0.5">ארכיון המחקר של פרופסור דרור</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  כרטיסי מחקר סודיים • כל כרטיס מכיל רמזים שיעזרו לכם לפצח את החידות
                </p>
              </div>
            </div>
            <button
              onClick={() => { playClick(); onClose(); }}
              className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-foreground hover:scale-105 transition-transform shrink-0 border border-border/30"
            >
              ✕
            </button>
          </div>

          {/* Progress tracker */}
          <div className="mt-4 bg-muted/30 rounded-xl p-3 border border-border/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                🔓 רמזים שנחשפו: {discoveredClues}/{clueCount}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {discoveredCards.size}/{infoCards.length} כרטיסים נקראו
              </span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-accent to-accent/60 rounded-full transition-all duration-700"
                style={{ width: `${(discoveredCards.size / infoCards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Story message */}
          <div className="mt-3 flex items-start gap-2.5 bg-primary/5 rounded-lg p-3 border border-primary/10">
            <span className="text-lg shrink-0">👨‍🔬</span>
            <p className="text-xs text-foreground/80 italic leading-[1.8]">
              ״הכרטיסים האלה הם חלק מהמחקר שלי. קראו אותם בעיון — 
              <strong className="text-primary not-italic"> הם מכילים תשובות לחידות!</strong> 
              ככל שתקראו יותר, כך תהיו מוכנים טוב יותר. חפשו את הסימן 🔑 — הוא מסמן כרטיסים עם רמזים ישירים.״
            </p>
          </div>
        </div>

        {/* ═══ CATEGORY FILTERS ═══ */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => { playClick(); setActiveCategory(null); }}
            className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-medium ${
              !activeCategory
                ? "bg-primary/15 border-primary/25 text-primary font-bold shadow-sm"
                : "bg-muted/30 border-border/25 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            📋 הכל ({infoCards.length})
          </button>
          {Object.entries(categoryLabels).map(([key, { label, emoji, color }]) => {
            const count = infoCards.filter((c) => c.category === key).length;
            return (
              <button
                key={key}
                onClick={() => { playClick(); setActiveCategory(activeCategory === key ? null : key); }}
                className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-medium ${
                  activeCategory === key ? `${color} font-bold shadow-sm` : "bg-muted/30 border-border/25 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {emoji} {label} ({count})
              </button>
            );
          })}
        </div>

        {/* ═══ CARDS ═══ */}
        <div className="space-y-2.5">
          {filteredCards.map((card) => {
            const realIndex = infoCards.indexOf(card);
            const isExpanded = expandedCard === realIndex;
            const isDiscovered = discoveredCards.has(realIndex);
            const catStyle = categoryLabels[card.category];

            return (
              <div
                key={realIndex}
                className={`glass-card rounded-xl border transition-all duration-300 cursor-pointer ${
                  isExpanded
                    ? "border-accent/30 shadow-lg shadow-accent/5"
                    : "border-border/25 hover:border-accent/15 hover:shadow-md"
                }`}
                onClick={() => handleExpand(realIndex)}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    isDiscovered ? "bg-accent/10 border border-accent/20" : "bg-muted/40 border border-border/25"
                  }`}>
                    {card.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold truncate">{card.title}</h3>
                      {card.clueRelevant && (
                        <span className="text-[10px] shrink-0" title="כרטיס עם רמז לחידות">🔑</span>
                      )}
                    </div>
                    <span className={`inline-block text-[10px] mt-0.5 px-2 py-0.5 rounded-md border ${catStyle.color}`}>
                      {catStyle.emoji} {catStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isDiscovered && (
                      <span className="w-2 h-2 rounded-full bg-accent shadow-sm shadow-accent/50" />
                    )}
                    <span className={`text-muted-foreground text-xs transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div className="bg-muted/25 rounded-lg p-4 mb-3 border border-border/15">
                      <p className="text-[13px] text-foreground/90 leading-[2]">{card.content}</p>
                    </div>
                    {card.source && (
                      <a
                        href={card.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors bg-accent/8 px-3 py-2 rounded-lg border border-accent/15 hover:bg-accent/15"
                      >
                        🔗 {card.source.label} <span className="text-[10px]">↗</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══ EXTERNAL RESOURCES ═══ */}
        <div className="mt-6 glass-card rounded-xl p-5 border border-border/25">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            🌐 מקורות לחקירה עצמאית
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "ויקיפדיה — נדידת ציפורים", url: "https://he.wikipedia.org/wiki/%D7%A0%D7%93%D7%99%D7%93%D7%AA_%D7%A6%D7%99%D7%A4%D7%95%D7%A8%D7%99%D7%9D", emoji: "📖" },
              { label: "אגמון החולה", url: "https://www.agamon-hula.co.il/", emoji: "🌿" },
              { label: "החברה להגנת הטבע", url: "https://www.teva.org.il", emoji: "🌱" },
              { label: "eBird — מדע אזרחי", url: "https://ebird.org/", emoji: "📱" },
              { label: "BirdLife International", url: "https://www.birdlife.org/", emoji: "🌍" },
              { label: "Champions of the Flyway", url: "https://www.champions-of-the-flyway.com/", emoji: "🏆" },
            ].map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/25 hover:bg-muted/45 border border-border/15 transition-all hover:scale-[1.02] text-sm"
              >
                <span>{link.emoji}</span>
                <span className="text-foreground/80 text-xs">{link.label}</span>
                <span className="text-muted-foreground text-[10px] mr-auto">↗</span>
              </a>
            ))}
          </div>
        </div>

        <div className="text-center mt-5">
          <button
            onClick={() => { playClick(); onClose(); }}
            className="bg-gradient-to-l from-accent to-accent/80 text-accent-foreground px-8 py-3 rounded-xl text-sm font-black hover:scale-105 transition-all duration-300 shadow-lg shadow-accent/20"
          >
            🔙 חזרה למשימה
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchCenter;
