# 🩺 Health Hub - PWA אישית לבריאות

לוח בקרה אישי למעבר מקיטו לתזונה רגילה, מעקב מדדים, אימונים, ו-AI dietitian + trainer (BYOC).

## 🌐 גרסה חיה

**https://t1ptip.github.io/health-hub/**

---

## 🚀 התקנה ראשונית (5 דקות)

יש **2 דרכים** להגדיר את האפליקציה - בחר את מה שמתאים לך.

### דרך A - Setup Wizard מודרך (מומלץ ⭐)

הכלי המודרך עושה את כל הצעדים בידיך עם בדיקת חיבור אוטומטית בסוף:

**https://t1ptip.github.io/health-hub/setup.html**

ה-Wizard ידריך אותך ב-5 שלבים:
1. **יצירת פרויקט Supabase + הרצת SQL** - הוראות מובנות + העתקת SQL ל-clipboard + פתיחת SQL Editor ישירות
2. **יצירת bucket** `scale-photos` (Public)
3. **הזנת מפתחות** - URL + anon key מ-Supabase
4. **בדיקת חיבור אוטומטית** - בודק 4 דברים (URL/Auth/Tables/Bucket) ומציג ❌/✅ לכל אחד
5. **סיום + redirect** לאפליקציה

### דרך B - ידני

1. **Supabase Dashboard** → New Project (אם אין) → SQL Editor → הדבק את `supabase_setup.sql` → Run
2. **Storage** → New bucket → שם: `scale-photos` → Public ✓
3. **Settings → API** → העתק `Project URL` ו-`anon public` key
4. פתח את https://t1ptip.github.io/health-hub/ → ⚙️ → הדבק → שמור

---

## 📂 מבנה הריפו

```
health-hub/
├── index.html              # האפליקציה הראשית (PWA, single-file)
├── setup.html              # Setup Wizard מודרך (5 שלבים)
├── supabase_setup.sql      # סקריפט יצירת טבלאות
├── README.md               # קובץ זה
├── LEARNINGS.md            # תיעוד באגים שתוקנו ב-QA
└── .gitignore
```

---

## 🆕 מה חדש ב-v1.1

### 🔴 באגים קריטיים שתוקנו (8 סך הכל)
- ✅ Popup blocker bypass (window.open סינכרוני)
- ✅ Offline persistence מלא (localStorage cache)
- ✅ Per-persona BYOC prompts (אפשר לפזר העתקות והדבקות)
- ✅ Pantry merge logic (defaults + user changes)
- ✅ Pantry "other" fallback (קטגוריות לא מוכרות)
- ✅ Service Worker אמיתי (cache-first, same-origin)
- ✅ Workout logging מלא (מודאל עם תרגילים)
- ✅ Walk/pantry modals יפים (במקום `prompt()`)

### 🟢 שיפורי UX
- ✅ דשבורד עם "תוכנית להיום" + quick actions
- ✅ TDEE דינמי לפי יום אימון/מנוחה
- ✅ Setup Wizard מודרך עם 4 בדיקות אוטומטיות
- ✅ Clipboard fallback modal

---

## 🐛 לעדכון הבא (v1.2)

- [ ] יצירת תפריט שבועי אוטומטי מ-pantry
- [ ] עריכה/מחיקה של מדידות
- [ ] גרפים מתקדמים (Chart.js)
- [ ] OCR לצילום משקל חכם
- [ ] חיבור ל-GYM PRO v2
- [ ] ייצוא PDF של הנחיות

---

## 🔐 פרטיות + עלויות

- **0% עלויות API** - BYOC (Bring Your Own Claude) דרך Claude.ai החינמי/Pro/Max שלך
- **0% Vendor lock-in** - הקוד מקור פתוח, ה-DB שלך, המפתחות שלך
- **100% offline-capable** - אחרי טעינה ראשונה, השרת לא דרוש
- כל הנתונים שלך נשמרים רק ב-Supabase project שלך (לא נשלחים לאף אחד אחר)

---

## 📜 רישיון

לשימוש אישי. הקוד פתוח לצפייה ושיפורים אבל ללא אחריות.

---

*נבנה ב-2026-05-18 ב-Claude Desktop (Opus 4.7) דרך Filesystem MCP + GitHub MCP + gh CLI fallback.*
