# Health Hub - LEARNINGS.md

## בעיות שהתגלו ב-QA אדברסרי (v1.0 → v1.1)

### Bug Museum נוסף

#### Bug #1: Popup blocker breaks BYOC
- **Pattern:** async/await שובר את ה-user-gesture chain
- **Symptom:** window.open חוסם אחרי await
- **Detection:** קוד inspection - חיפוש "setTimeout(...window.open"
- **Fix:** Open window FIRST, then async work
- **Generalization:** כל window.open/window.confirm צריך להיות סינכרוני בinit של click handler

#### Bug #2: State without persistence
- **Pattern:** state-in-memory only when not connected
- **Symptom:** טוגלים נעלמים בreload
- **Detection:** "האם זה ישרוד reload?" - שאלה שצריך לשאול על כל state change
- **Fix:** localStorage cache + auto-save on every state mutation
- **Generalization:** Hybrid online/offline apps - כל אקשן חייב localCache fallback

#### Bug #6: Filter strict matching
- **Pattern:** קטגוריה לא מוכרת → item נעלם מ-UI
- **Detection:** קטגוריות hardcoded - מה קורה אם user מוסיף עם custom value?
- **Fix:** Fallback to 'other' category in filter

### Pattern: BYOC (Bring Your Own Claude)
- **Concept:** App generates prompt → copies to clipboard → opens claude.ai → user does the AI part
- **Pros:** Zero API cost, full transparency, uses existing Max plan
- **Cons:** ~3 user actions per interaction (copy/paste/copy/paste)
- **Best for:** Personal tools where user already has Claude subscription
- **Key trick:** sessionStorage stores prompt+snapshot per-persona for round-trip

### Pattern: localStorage + Supabase hybrid
- **Strategy:** Always write to localCache first, then async to Supabase
- **Benefit:** Instant UI updates + offline support + cloud sync
- **Risk:** Conflict resolution on sync (last-write-wins by timestamp)

---

## Session retrospectives

### 2026-05-18: Session creation
- **Trigger:** Built MVP from scratch
- **Risk Level:** 2 (new app, new tech stack integration)
- **Outcome:** v1.1 delivered after self-Adversarial QA (8 bugs fixed)
- **Open warnings:** GitHub MCP timed out 2x during upload — needed manual recovery
