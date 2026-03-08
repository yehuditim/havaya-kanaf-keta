import { useState } from "react";

interface InfoCard {
  title: string;
  emoji: string;
  content: string;
  source?: { label: string; url: string };
}

const infoCards: InfoCard[] = [
  {
    title: "מהי נדידת ציפורים?",
    emoji: "🌍",
    content:
      "נדידה היא תנועה עונתית של ציפורים ממקום למקום — בדרך כלל בין אזורי קינון באירופה לאזורי חורף באפריקה. הציפורים טסות אלפי קילומטרים פעמיים בשנה, בעיקר כדי למצוא מזון ותנאי מזג אוויר מתאימים.",
    source: { label: "ויקיפדיה — נדידת ציפורים", url: "https://he.wikipedia.org/wiki/%D7%A0%D7%93%D7%99%D7%93%D7%AA_%D7%A6%D7%99%D7%A4%D7%95%D7%A8%D7%99%D7%9D" },
  },
  {
    title: "למה ישראל מיוחדת?",
    emoji: "🇮🇱",
    content:
      "ישראל ממוקמת על צומת דרכים בין שלוש יבשות — אפריקה, אסיה ואירופה. היא משמשת כ״צוואר בקבוק״ לנדידה: רצועת יבשה צרה שכל הציפורים חייבות לעבור דרכה. כחצי מיליארד ציפורים חוצות את שמי ישראל בכל שנה!",
    source: { label: "החברה להגנת הטבע", url: "https://www.teva.org.il" },
  },
  {
    title: "החסידה הלבנה",
    emoji: "🦩",
    content:
      "החסידה הלבנה היא אחת הציפורים הנודדות המפורסמות ביותר. היא גדולה, שחורה-לבנה עם מקור אדום ארוך. כ-500,000 חסידות — כמעט כל חסידות מזרח אירופה — עוברות דרך ישראל בכל עונת נדידה.",
    source: { label: "מרכז הצפרות — עמק החולה", url: "https://www.agamon-hula.co.il/" },
  },
  {
    title: "איך ציפורים מנווטות?",
    emoji: "🧭",
    content:
      "ציפורים נודדות משתמשות במספר שיטות ניווט: מצפן מגנטי מולד שמזהה את השדה המגנטי של כדור הארץ, ניווט לפי מיקום השמש ביום והכוכבים בלילה, וזיכרון מסלולים שעובר מדור לדור.",
  },
  {
    title: "תצורת V — למה?",
    emoji: "✈️",
    content:
      "כשציפורים כמו עגורים טסות בתצורת V, כל ציפור ״רוכבת״ על זרם האוויר שיוצרת הציפור שלפניה. זה חוסך לכל ציפור עד 70% מהאנרגיה! הציפורים מתחלפות בהובלה כשהמובילה מתעייפת.",
  },
  {
    title: "סכנות בדרך",
    emoji: "⚡",
    content:
      "ציפורים נודדות מתמודדות עם קווי חשמל, טורבינות רוח, אובדן בתי גידול, ושינויי אקלים. בישראל פעלו להסטת קווי חשמל ותיקון תשתיות כדי להציל עשרות אלפי ציפורים בשנה — פרויקט ייחודי בעולם.",
    source: { label: "BirdLife International", url: "https://www.birdlife.org/" },
  },
  {
    title: "טכנולוגיית מעקב",
    emoji: "📡",
    content:
      "חוקרים משתמשים במשדרי GPS זעירים (פחות מ-5 גרם!) וטבעות זיהוי כדי לעקוב אחרי ציפורים. כך גילו שחסידה אחת טסה 11,000 ק״מ ברצף! הנתונים עוזרים לתכנן שמורות טבע ומסלולים בטוחים.",
  },
  {
    title: "עמק החולה",
    emoji: "🌿",
    content:
      "עמק החולה בצפון ישראל הוא אחד מאתרי הצפרות החשובים בעולם. הוא משמש כ״תחנת דלק״ — מקום שבו ציפורים עייפות נחות, אוכלות ושותות לפני שממשיכות בדרכן. מרכז הצפרות פתוח למבקרים.",
    source: { label: "אגמון החולה", url: "https://www.agamon-hula.co.il/" },
  },
];

const ResearchCenter = ({ onClose }: { onClose: () => void }) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

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
              <p className="text-xs text-muted-foreground">כרטיסי מידע ומקורות לחוקרים סקרנים</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-foreground hover:scale-105 transition-transform"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          💡 <strong>טיפ מפרופסור דרור:</strong> אם נתקעתם בחידה, אולי תמצאו כאן רמז שיעזור. המידע הזה גם מעניין בפני עצמו!
        </p>

        {/* Cards grid */}
        <div className="space-y-3">
          {infoCards.map((card, index) => (
            <div
              key={index}
              className={`glass-card rounded-xl border transition-all duration-300 cursor-pointer ${
                expandedCard === index
                  ? "border-accent/30 shadow-lg"
                  : "border-border/30 hover:border-accent/20"
              }`}
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
            >
              <div className="flex items-center gap-3 p-4">
                <span className="text-2xl shrink-0">{card.emoji}</span>
                <h3 className="text-sm font-bold flex-1">{card.title}</h3>
                <span className={`text-muted-foreground text-xs transition-transform duration-200 ${expandedCard === index ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>

              {expandedCard === index && (
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
                      🔗 {card.source.label}
                      <span className="text-[10px]">↗</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* External resources section */}
        <div className="mt-8 glass-card rounded-xl p-5 border border-border/30">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            🌐 מקורות חיצוניים לחקירה נוספת
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: "ויקיפדיה — נדידת ציפורים", url: "https://he.wikipedia.org/wiki/%D7%A0%D7%93%D7%99%D7%93%D7%AA_%D7%A6%D7%99%D7%A4%D7%95%D7%A8%D7%99%D7%9D", emoji: "📖" },
              { label: "החברה להגנת הטבע", url: "https://www.teva.org.il", emoji: "🌱" },
              { label: "אגמון החולה — מרכז צפרות", url: "https://www.agamon-hula.co.il/", emoji: "🦅" },
              { label: "BirdLife International", url: "https://www.birdlife.org/", emoji: "🌍" },
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
            onClick={onClose}
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
