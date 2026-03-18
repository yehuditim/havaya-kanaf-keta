

## Plan: Improve Escape Room Stations (4 Changes)

### 1. Fix Audio Narration for Mobile

**Problem**: `NarrationPlayer` auto-plays TTS on mount without user interaction, which violates iOS/Android autoplay policies and silently fails.

**Changes to `src/components/game/NarrationPlayer.tsx`**:
- Remove auto-play on mount (`autoPlay` logic in useEffect). Audio should only start after explicit user click.
- Default `autoPlay` to `false`.
- Make the "🔊 הקרא" button always visible and prominent so users can trigger narration manually.
- This ensures compliance with mobile browser autoplay restrictions.

### 2. Better Hotspot Camouflage in SceneExplorer

**Problem**: Hotspots are too visible — large icons (w-12/w-14), bright backgrounds, pulsing borders, and labels make them easy to spot instantly.

**Changes to `src/components/game/SceneExplorer.tsx`**:
- **Reduce icon size**: From `w-12 h-12 sm:w-14 sm:h-14` to `w-8 h-8 sm:w-10 sm:h-10`
- **Remove pulsing ping animation** on undiscovered hotspots (remove `animate-ping` ring)
- **Remove `animate-pulse-glow`** from emoji
- **Remove background glow**: Change undiscovered style from `bg-background/30 border-2 border-foreground/20 backdrop-blur-sm` to nearly transparent: `bg-transparent border border-transparent`
- **Hide labels** until discovered (don't show `hs.label` for undiscovered items)
- **Add subtle hover-only glow**: `hover:bg-white/10 hover:border-white/20` — only visible when cursor is very close
- **Reduce emoji opacity** for undiscovered: `opacity-40` on the emoji, becoming full opacity when discovered
- After discovery: show the existing check mark and label normally

### 3. Fix Hints to Not Reveal Answers

**Problem**: Several hints directly reveal the answer:

| Station | Hint | Issue |
|---------|------|-------|
| Station 1 (CodeLock) | "חפשו בכרטיס ההיפרפגיה — כמה אחוז ממשקל הגוף?" | OK — guides to source |
| Station 3 (cipher hint) | "ל→כ, ג→ב, נ→מ... חשבו: מה זה ״כ ג ס ת ו ק ז ח״..." | **Reveals decoded letters** |
| Station 4 (CodeLock) | "שנת המצאת הטיבוע — ארבע ספרות, סוף המאה ה-19" | **Almost reveals 1899** |
| Station 4 (compass errors) | "מגנטי=צפון, שמש=מזרח, כוכבים=מערב, ציוני דרך=דרום" | **Reveals all answers directly** |
| Station 5 (calcHint) | "רמז: 7,150 ÷ 50 = ?" | **Reveals the exact formula and answer** |
| Station 6 (treaties) | "AEWA עוסקת בציפורי מים, CMS בכל בעלי החיים..." | OK — educational |

**Changes**:

- **Station 3** (`Station3Dangers.tsx` line 205): Change cipher hint from showing letter mappings to: `"💡 כל אות זזה מקום אחד אחורה באל״ף-בי״ת. נסו עם האות הראשונה ובנו מילה שמתחברת לחקר ציפורים."`
- **Station 4** (`Station4Lab.tsx`):
  - Compass hint (line 175): Change to `"💡 חשבו: מה מראה כיוון גם בחושך? מה עוזר ביום? מה רואים רק בלילה? ומה נראה מגובה?"`
  - CodeLock hint (line 212): Change to `"💡 חפשו בכרטיס הטכנולוגיה — באיזה עשור הומצאה שיטת המעקב הוותיקה ביותר?"`
- **Station 5** (`Station5Ringing.tsx` line 167): Change calc hint to: `"💡 חשבו על הנוסחה: מרחק חלקי מהירות. מצאתם את שני המספרים בסצנה — עכשיו חשבו!"`
  - Also change CodeLock hint (line 197): from `"7,150 ÷ 50 = ?"` to `"💡 התשובה היא מספר שעות הטיסה שחישבתם בשלב הקודם"`

### 4. No structural changes

All puzzles, phases, layouts, and game flow remain exactly as they are. Only the 3 specific areas above are modified.

---

**Files to modify**:
- `src/components/game/NarrationPlayer.tsx` — disable autoplay, click-only audio
- `src/components/game/SceneExplorer.tsx` — camouflage hotspots
- `src/components/game/Station3Dangers.tsx` — fix cipher hint
- `src/components/game/Station4Lab.tsx` — fix compass + lock hints
- `src/components/game/Station5Ringing.tsx` — fix calc + lock hints

