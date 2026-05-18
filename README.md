# 🚀 Health Hub v1.1 - הוראות התקנה

## 📋 שלבי הקמה (פעם אחת)

### שלב 1: Supabase
1. Supabase Dashboard → SQL Editor → New Query → הדבק את `supabase_setup.sql` → Run
2. Storage → New bucket → שם: `scale-photos` → סמן **Public** ✓
3. Settings → API → העתק `Project URL` ו-`anon public` key

### שלב 2: פתיחת האפליקציה
- **מקומית:** פתח `health-hub.html` ב-Chrome/Edge/Vivaldi
- **בענן:** העלה ל-GitHub Pages תחת `t1ptip/health-hub`
- בכניסה הראשונה: ⚙️ → הזן Supabase URL + Key + נתוני פרופיל → שמור

### שלב 3: שימוש יומיומי
1. **בוקר:** מסך מדדים → "+ חדש" → צילום מהמשקל + הזנת נתונים
2. **דשבורד:** "📋 קבל סקירה משותפת" → Claude.ai נפתח → Ctrl+V → קבל תשובה
3. **חזרה לאפליקציה:** "📥 הדבק תשובה" → שמור

## 🆕 מה חדש ב-v1.1 (אחרי 8 תיקוני QA)

### 🔴 באגים קריטיים שתוקנו
- ✅ **Popup blocker fix:** Claude.ai נפתח מיד בלחיצה (לפני ה-async)
- ✅ **Offline persistence:** הכל נשמר ב-localStorage גם בלי Supabase
- ✅ **Per-persona prompts:** אפשר לפזר העתקות ולהדביק תשובות בכל סדר

### 🟡 שיפורי UX
- ✅ **תוכנית להיום בדשבורד:** מסך פתיחה מציג את ארוחות היום + סוג היום (אימון/שחרור/רגיל) + 3 כפתורי action מהירים
- ✅ **Walk modal:** רישום צעידה במודאל יפה (במקום `prompt()`)
- ✅ **Workout logging:** מודאל מפורט לאימון - תרגילים, חזרות בפועל, דירוג, הערות
- ✅ **Add pantry modal:** הוספת מוצר עם בחירת קטגוריה
- ✅ **Clipboard fallback:** אם ההעתקה האוטומטית נכשלת - מודאל עם בחירה ידנית

### 🟢 שיפורי תשתית
- ✅ **Service Worker אמיתי:** cache-first לעבודה offline מלאה
- ✅ **Pantry merge logic:** ברירת מחדל + שינויי משתמש מתמזגים נכון
- ✅ **Pantry category fallback:** מוצרים עם קטגוריה לא מוכרת נכנסים ל"אחר"
- ✅ **Coach messages offline:** נשמרים ב-localStorage גם בלי Supabase

## 🐛 ידוע - לעדכון הבא (v1.2)

- [ ] יצירת תפריט שבועי אוטומטי מ-pantry (כרגע דרך BYOC בלבד)
- [ ] עריכה/מחיקה של מדידות
- [ ] גרפים מתקדמים (recharts/chart.js)
- [ ] OCR אוטומטי לצילום משקל (כרגע - הזנה ידנית)
- [ ] חיבור ל-GYM PRO (משיכת היסטוריית אימונים)
- [ ] ייצוא PDF של הנחיות לרופא

## 🔐 פרטיות
- **0% פיצ׳רים שולחים נתונים לאיפשהו** (חוץ מ-Supabase שלך)
- **0% עלויות API** (BYOC - העתק-הדבק ל-Claude.ai)
- **100% offline-capable** אחרי טעינה ראשונה
