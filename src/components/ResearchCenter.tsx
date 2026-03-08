import { useState } from "react";
import { playClick } from "./SoundEffects";

interface InfoCard {
  title: string;
  emoji: string;
  content: string;
  category: "ecology" | "navigation" | "technology" | "conservation" | "locations";
  source?: { label: string; url: string };
}

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  ecology: { label: "אקולוגיה", emoji: "🌍" },
  navigation: { label: "ניווט ותעופה", emoji: "🧭" },
  technology: { label: "טכנולוגיה ומחקר", emoji: "📡" },
  conservation: { label: "שימור והגנה", emoji: "🛡️" },
  locations: { label: "מוקדי צפרות", emoji: "📍" },
};

const infoCards: InfoCard[] = [
  {
    title: "הנתיב האפרו-פליארקטי",
    emoji: "🗺️",
    category: "ecology",
    content:
      "ישראל נמצאת על הנתיב האפרו-פליארקטי — אחד ממסלולי הנדידה הגדולים בעולם. כמיליארד ציפורים חולפות דרכה פעמיים בשנה. ישראל היא ׳צוואר בקבוק׳ — רצועת יבשה צרה בין שלוש יבשות שאי אפשר לעקוף.",
    source: { label: "ויקיפדיה — נדידת ציפורים", url: "https://he.wikipedia.org/wiki/%D7%A0%D7%93%D7%99%D7%93%D7%AA_%D7%A6%D7%99%D7%A4%D7%95%D7%A8%D7%99%D7%9D" },
  },
  {
    title: "דואים מול נודדי לילה",
    emoji: "☀️🌙",
    category: "navigation",
    content:
      "דואים (חסידות, שקנאים, דורסים) — עופות גדולים שרוכבים על תרמיקות (זרמי אוויר חם) ביום. הם נמנעים מלחצות ימים כי אין תרמיקות מעל מים. נודדי לילה (סבכיים, זמירים) — ציפורי שיר קטנות שטסות בחשיכה כדי להימנע מטורפים ומאיבוד נוזלים בחום.",
  },
  {
    title: "היפרפגיה — תדלוק לפני הטיסה",
    emoji: "⚖️",
    category: "ecology",
    content:
      "לפני נדידה ציפורים עוברות היפרפגיה — אכילה מוגברת מטורפת שמעלה את משקלן עד 50% בשומן! בנוסף יש שינויים הורמונליים, עליית ערנות, ושינויים פיזיולוגיים שמכינים את הגוף לטיסה של אלפי קילומטרים.",
  },
  {
    title: "GPS ביולוגי — ניווט מדהים",
    emoji: "🧠",
    category: "navigation",
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
    title: "אילת והערבה",
    emoji: "🏜️",
    category: "locations",
    content:
      "אילת היא ״שער הכניסה הדרומי״ של ישראל — המפגש הראשון של ציפורים עם מים וצמחייה אחרי חציית מדבר סהרה. מקום עצירה קריטי לעגורים, שקנאים ועיטים. פסטיבל הצפרות באילת (מרץ 2026) הוא אירוע בינלאומי!",
    source: { label: "פסטיבל הצפרות באילת", url: "https://www.eilatbirdfestival.com/" },
  },
  {
    title: "אגמון החולה",
    emoji: "🌿",
    category: "locations",
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
    content:
      "טיבוע — טבעת אלומיניום עם מספר ייחודי מלמדת על תוחלת חיים ונאמנות לאתרים. משדרי GPS זעירים (פחות מ-5 גרם!) מאפשרים מעקב בזמן אמת. מכ״ם עוקב אחרי להקות שלמות ומונע התנגשויות עם מטוסים.",
  },
  {
    title: "eBird — מדע אזרחי",
    emoji: "📱",
    category: "technology",
    content:
      "eBird הוא פרויקט מדע אזרחי גלובלי — צפרים מכל העולם מדווחים על תצפיות באפליקציה. מיליוני דיווחים עוזרים למדענים לעקוב אחרי שינויים באוכלוסיות ולתכנן שמורות. גם ילדים יכולים להשתתף!",
    source: { label: "eBird", url: "https://ebird.org/" },
  },
  {
    title: "איומים על הנודדות",
    emoji: "⚠️",
    category: "conservation",
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

  const filteredCards = activeCategory
    ? infoCards.filter((c) => c.category === activeCategory)
    : infoCards;

  return (
    <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm overflow-auto">
      <div className="max-w-2xl mx-auto p-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-2xl border border-accent/30">
              📚
            </div>
            <div>
              <h2 className="text-xl font-black text-accent">מרכז החקר</h2>
              <p className="text-xs text-muted-foreground">13 כרטיסי מידע מדעיים • מקורות מאומתים</p>
            </div>
          </div>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-foreground hover:scale-105 transition-transform"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          💡 <strong>טיפ מפרופסור דרור:</strong> נתקעתם בחידה? חפשו כאן רמזים. המידע מבוסס על מחקר מדעי אמיתי!
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => { playClick(); setActiveCategory(null); }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              !activeCategory ? "bg-primary/20 border-primary/30 text-primary font-bold" : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            הכל ({infoCards.length})
          </button>
          {Object.entries(categoryLabels).map(([key, { label, emoji }]) => {
            const count = infoCards.filter((c) => c.category === key).length;
            return (
              <button
                key={key}
                onClick={() => { playClick(); setActiveCategory(activeCategory === key ? null : key); }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  activeCategory === key ? "bg-primary/20 border-primary/30 text-primary font-bold" : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {emoji} {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {filteredCards.map((card, index) => {
            const realIndex = infoCards.indexOf(card);
            return (
              <div
                key={realIndex}
                className={`glass-card rounded-xl border transition-all duration-300 cursor-pointer ${
                  expandedCard === realIndex ? "border-accent/30 shadow-lg" : "border-border/30 hover:border-accent/20"
                }`}
                onClick={() => { playClick(); setExpandedCard(expandedCard === realIndex ? null : realIndex); }}
              >
                <div className="flex items-center gap-3 p-4">
                  <span className="text-2xl shrink-0">{card.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold">{card.title}</h3>
                    <span className="text-[10px] text-muted-foreground">
                      {categoryLabels[card.category]?.emoji} {categoryLabels[card.category]?.label}
                    </span>
                  </div>
                  <span className={`text-muted-foreground text-xs transition-transform duration-200 ${expandedCard === realIndex ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </div>

                {expandedCard === realIndex && (
                  <div className="px-4 pb-4 animate-slide-up">
                    <div className="bg-muted/30 rounded-lg p-4 mb-3 border border-border/20">
                      <p className="text-sm text-foreground/90 leading-[1.9]">{card.content}</p>
                    </div>
                    {card.source && (
                      <a
                        href={card.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20"
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

        {/* External resources */}
        <div className="mt-8 glass-card rounded-xl p-5 border border-border/30">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">🌐 מקורות לחקירה עצמאית</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/20 transition-all hover:scale-[1.02] text-sm"
              >
                <span>{link.emoji}</span>
                <span className="text-foreground/80">{link.label}</span>
                <span className="text-muted-foreground text-[10px] mr-auto">↗</span>
              </a>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => { playClick(); onClose(); }}
            className="bg-accent/20 text-accent px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent/30 transition-colors border border-accent/20"
          >
            🔙 חזרה למשחק
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchCenter;
