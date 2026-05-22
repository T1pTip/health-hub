// Health Hub v2.0.0 - app.js (single module)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

(function(){
  if (window.__HH_LOADED) return;
  window.__HH_LOADED = true;

  const LS_KEY_CFG = 'hh_supabase_cfg';
  const LS_KEY_CACHE = 'hh_cache_v2';
  const APP_VER = '2.2.0';

  let supa = null;
  let cfg = JSON.parse(localStorage.getItem(LS_KEY_CFG) || '{}');
  let currentScreen = 'dashboard';
  const localCache = JSON.parse(localStorage.getItem(LS_KEY_CACHE) || '{}');

  function saveLocalCache(){
    localStorage.setItem(LS_KEY_CACHE, JSON.stringify({
      profile: state.profile, pantry: state.pantry,
      coachMessages: state.coachMessages.slice(0,20),
      latestMetrics: state.latestMetrics,
      latestActivity: state.latestActivity,
      metricsHistory: state.metricsHistory.slice(0,30),
      foods: state.foods, dailyMenus: state.dailyMenus,
      workoutOverrides: state.workoutOverrides,
      bloodTests: state.bloodTests.slice(0,30),
    }));
  }

  const state = {
    profile: localCache.profile || { name:'מורן', age:42.8, height_cm:180, start_weight:75.05,
      target_weight_min:71.5, target_weight_max:73, target_bf_min:11, target_bf_max:13, diet_phase:'transitioning' },
    latestMetrics: localCache.latestMetrics || null,
    latestActivity: localCache.latestActivity || null,
    metricsHistory: localCache.metricsHistory || [],
    pantry: localCache.pantry || [],
    currentMenu: null, workouts: [],
    coachMessages: localCache.coachMessages || [],
    foods: localCache.foods || [],
    dailyMenus: localCache.dailyMenus || {},
    workoutOverrides: localCache.workoutOverrides || {},
    bloodTests: localCache.bloodTests || [],
  };

  const DEFAULT_MENU = { days: [
    { day:'ראשון', training:true, lunch:'355g סטייק דנבר + ירקות ירוקים מוקפצים', dinner:'סלט עשיר + חצי אבוקדו + טונה + 3 ביצים + אגוזי מלך', cal:2700, protein:135 },
    { day:'שני', training:false, lunch:'300g פרגית + ירקות ירוקים מוקפצים', dinner:'סלט עשיר + חצי אבוקדו + 3 ביצים + סקיני פסטה + 2 כפות טחינה', cal:2650, protein:128 },
    { day:'שלישי', training:false, lunch:'285g שיפודי טלה + ירקות + גרעיני דלעת', dinner:'סלט עשיר + אבוקדו שלם + טונה + 3 ביצים + אגוזי מלך + זיתים', cal:2780, protein:140 },
    { day:'רביעי', training:true, lunch:'300g חזה עוף + 3 ביצים מקושקשות + ירקות + אגוזי מלך', dinner:'4 ביצים + אבוקדו שלם + סקיני פסטה + סלט + טחינה + סרדינים', cal:3050, protein:155 },
    { day:'חמישי', training:false, lunch:'300g פרגית + ירקות + גרעיני דלעת', dinner:'סלט עשיר + אבוקדו שלם + טונה + 3 ביצים + אגוזי מלך + טחינה', cal:2720, protein:135 },
    { day:'שישי', training:true, release:true, lunch:'300g חזה עוף + 2 ביצים + ירקות', dinner:'300g סלמון + סלט ירוק עשיר + חצי אבוקדו', cal:2900, protein:150 },
    { day:'שבת', training:false, lunch:'300g סלמון + ירקות ירוקים מוקפצים', dinner:'סלט עשיר + חצי אבוקדו + טונה + 3 ביצים + אגוזי מלך', cal:2700, protein:140 },
  ], rules: ['תיבול: לימון, כורכום, פלפל שחור, חומץ תפוחים','חוק ה-30: לגימות קטנות, 30 דק׳ המתנה לשתייה','שמן זית + קוקוס + חמאה להקפצה','אלקטרוליטים מהאוכל','אבוקדו, טחינה, אגוזים = מגנזיום/אשלגן']};

  const DEFAULT_PANTRY = [
    {name:'סטייק דנבר',cat:'protein'},{name:'פרגית',cat:'protein'},{name:'שיפודי טלה',cat:'protein'},
    {name:'חזה עוף',cat:'protein'},{name:'סלמון',cat:'protein'},{name:'טונה בשמן זית',cat:'protein'},
    {name:'סרדינים',cat:'protein'},{name:'ביצים',cat:'protein'},{name:'אבוקדו',cat:'vegetable'},
    {name:'ירקות ירוקים',cat:'vegetable'},{name:'סקיני פסטה',cat:'vegetable'},{name:'אגוזי מלך',cat:'nut'},
    {name:'גרעיני דלעת',cat:'nut'},{name:'שקדים',cat:'nut'},{name:'זיתים',cat:'nut'},
    {name:'שמן זית',cat:'oil'},{name:'שמן קוקוס',cat:'oil'},{name:'חמאה',cat:'oil'},
    {name:'טחינה גולמית',cat:'oil'},{name:'שמן MCT',cat:'oil'},{name:'בטטה',cat:'carb'},
    {name:'קינואה',cat:'carb'},{name:'אורז מלא',cat:'carb'},{name:'פירות יער',cat:'carb'},
    {name:'בננה',cat:'carb'},{name:'תפוח',cat:'carb'},{name:'לימון',cat:'other'},
    {name:'חומץ תפוחים',cat:'other'},{name:'מלח ים/הימלאיה',cat:'other'},{name:'כורכום',cat:'other'},
  ];

  const DEFAULT_WORKOUTS = [
    { day:'ראשון', is_release:false, time:'בוקר, בצום', exercises:[
      {name:'דדליפט',sets:4,reps:'6-8',muscle:'גב/רגליים'},
      {name:'משיכה עליונה',sets:3,reps:'8-10',muscle:'גב עליון'},
      {name:'חתירה עם משקולת',sets:3,reps:'10-12',muscle:'גב'},
      {name:'בייספס - הרמה',sets:3,reps:'10-12',muscle:'יד קדמית'},
      {name:'פלאנק',sets:3,reps:'45 שניות',muscle:'ליבה'},
    ]},
    { day:'רביעי', is_release:false, time:'בוקר, בצום', exercises:[
      {name:'סקוואט',sets:4,reps:'8-10',muscle:'רגליים'},
      {name:'לחיצת חזה',sets:4,reps:'8-10',muscle:'חזה'},
      {name:'לחיצת כתפיים',sets:3,reps:'10-12',muscle:'כתפיים'},
      {name:'טריצפס',sets:3,reps:'10-12',muscle:'יד אחורית'},
      {name:'אב ויל',sets:3,reps:'10',muscle:'ליבה'},
    ]},
    { day:'שישי', is_release:true, time:'בוקר, בצום', exercises:[
      {name:'הליכה/ריצה קלה',sets:1,reps:'20-30 דק׳',muscle:'אירובי'},
      {name:'מתיחות דינמיות',sets:1,reps:'10 דק׳',muscle:'גמישות'},
      {name:'תרגול ליבה קל',sets:2,reps:'12',muscle:'ליבה'},
    ]},
  ];

  const FOOD_CATEGORIES = {protein:'🥩 חלבון',carbs:'🌾 פחמימות',fat:'🫒 שומנים',veg:'🥦 ירקות',fruit:'🍎 פירות',dairy:'🧀 חלב',sweets:'🍫 מתוקים',drinks:'🥤 שתייה'};

  const FALLBACK_FOODS = [
    {name_he:'ביצה',category:'protein',cal_per_100g:155,protein_per_100g:13,fat_per_100g:11,carbs_per_100g:1.1},
    {name_he:'חזה עוף',category:'protein',cal_per_100g:165,protein_per_100g:31,fat_per_100g:3.6,carbs_per_100g:0},
    {name_he:'סלמון',category:'protein',cal_per_100g:208,protein_per_100g:20,fat_per_100g:13,carbs_per_100g:0},
    {name_he:'טונה במים',category:'protein',cal_per_100g:116,protein_per_100g:26,fat_per_100g:1,carbs_per_100g:0},
    {name_he:'אבוקדו',category:'fat',cal_per_100g:160,protein_per_100g:2,fat_per_100g:15,carbs_per_100g:9},
    {name_he:'שמן זית',category:'fat',cal_per_100g:884,protein_per_100g:0,fat_per_100g:100,carbs_per_100g:0},
  ];

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  function toast(msg, ms=2400){
    const t = document.createElement('div'); t.className='toast'; t.textContent=msg;
    document.body.appendChild(t); setTimeout(()=>t.remove(), ms);
  }
  function showModal(html){ $('#modalContent').innerHTML=html; $('#modalOverlay').classList.add('show'); }
  function closeModal(){ $('#modalOverlay').classList.remove('show'); }
  async function copyToClipboard(text){
    try { await navigator.clipboard.writeText(text); return true; }
    catch(e){ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); const ok=document.execCommand('copy'); ta.remove(); return ok; }
  }
  function formatDate(d){ if(!d) return ''; return new Date(d).toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit',year:'numeric'}); }
  function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function calcBMI(w,h){ if(!w||!h) return null; return (w/Math.pow(h/100,2)).toFixed(1); }
  function calcBMR(w,h,age,male=true){ if(!w||!h||!age) return null; return Math.round(10*w+6.25*h-5*age+(male?5:-161)); }
  function calcTDEE(bmr, walkKm=11, training=false){ if(!bmr) return null; return Math.round(bmr*1.2 + walkKm*70 + (training?350:0)); }
  function trendArrow(curr, prev){
    if(prev==null||curr==null) return {arrow:'·',cls:'flat'};
    const d = curr-prev; if(Math.abs(d)<0.05) return {arrow:'·',cls:'flat'};
    return d>0 ? {arrow:'↑ '+d.toFixed(1),cls:'up'} : {arrow:'↓ '+Math.abs(d).toFixed(1),cls:'down'};
  }
  // ============ SUPABASE ============
  async function initSupabase(){
    if(!cfg.url||!cfg.key) return false;
    try { supa = createClient(cfg.url, cfg.key); return true; }
    catch(e){ console.error('Supabase init failed:',e); return false; }
  }

  async function loadAllData(){
    if(!supa) return;
    try {
      const { data: profile } = await supa.from('user_profile').select('*').limit(1).maybeSingle();
      if(profile) state.profile = {...state.profile, ...profile};
      const { data: metrics } = await supa.from('body_metrics').select('*').order('measured_at',{ascending:false}).limit(30);
      if(metrics?.length){ state.metricsHistory=metrics; state.latestMetrics=metrics[0]; }
      const { data: activity } = await supa.from('health_daily').select('*').order('day',{ascending:false}).limit(1);
      state.latestActivity = activity?.length ? activity[0] : null;
      const { data: pantry } = await supa.from('pantry_items').select('*').order('name');
      state.pantry = pantry||[];
      const { data: msgs } = await supa.from('coach_messages').select('*').order('created_at',{ascending:false}).limit(50);
      state.coachMessages = msgs||[];
      const { data: foods } = await supa.from('foods').select('*').order('name_he');
      state.foods = foods||[];
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-30);
      const { data: menus } = await supa.from('daily_menus').select('*').gte('menu_date',cutoff.toISOString().slice(0,10)).order('menu_date',{ascending:false});
      state.dailyMenus = {};
      (menus||[]).forEach(m => state.dailyMenus[m.menu_date]=m);
      const { data: blood } = await supa.from('blood_tests').select('*').order('test_date',{ascending:false}).limit(30);
      state.bloodTests = blood||[];
      saveLocalCache();
    } catch(e){ console.error('loadAllData failed:',e); toast('שגיאה בטעינה'); }
  }

  async function saveMetric(d){
    if(!supa){ toast('Supabase לא מחובר'); return false; }
    const en = {...d, source:'manual', bmi:calcBMI(d.weight,state.profile.height_cm), bmr:calcBMR(d.weight,state.profile.height_cm,state.profile.age)};
    const { error } = await supa.from('body_metrics').insert(en);
    if(error){ console.error(error); toast('שגיאה'); return false; }
    await loadAllData(); return true;
  }
  async function saveProfile(updates){
    if(!supa) return false;
    const { error } = await supa.from('user_profile').update({...updates, updated_at:new Date()}).eq('id',state.profile.id);
    if(error){ console.error(error); return false; }
    state.profile = {...state.profile, ...updates}; return true;
  }
  async function saveCoachMessage(persona, prompt, response, snapshot){
    const msg = {persona, prompt_sent:prompt, response, context_snapshot:snapshot, created_at:new Date().toISOString()};
    state.coachMessages.unshift(msg);
    if(state.coachMessages.length>50) state.coachMessages = state.coachMessages.slice(0,50);
    saveLocalCache();
    if(supa){ const { error } = await supa.from('coach_messages').insert(msg); if(error){ console.error(error); toast('💾 נשמר מקומית'); } }
    else toast('💾 נשמר מקומית');
    return true;
  }
  async function uploadPhoto(file){
    if(!supa) return null;
    const fn = `scale-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supa.storage.from('scale-photos').upload(fn,file);
    if(error){ console.error(error); toast('שגיאה'); return null; }
    return supa.storage.from('scale-photos').getPublicUrl(fn).data.publicUrl;
  }
  async function uploadBloodTestPDF(file){
    if(!supa){ toast('Supabase לא מחובר'); return null; }
    const fn = `blood-${Date.now()}.${file.name.split('.').pop()||'pdf'}`;
    const { error } = await supa.storage.from('blood-tests').upload(fn,file,{contentType:file.type||'application/pdf'});
    if(error){ console.error(error); toast('שגיאה: '+error.message); return null; }
    return {url:supa.storage.from('blood-tests').getPublicUrl(fn).data.publicUrl, fileName:fn};
  }
  async function saveBloodTest(rec){
    if(!supa){ toast('Supabase לא מחובר'); return false; }
    const op = rec.id ? supa.from('blood_tests').update(rec).eq('id',rec.id) : supa.from('blood_tests').insert(rec);
    const { data, error } = await op.select().single();
    if(error){ console.error(error); toast('שגיאה: '+error.message); return false; }
    if(rec.id){ const i=state.bloodTests.findIndex(b=>b.id===rec.id); if(i>=0) state.bloodTests[i]=data; }
    else state.bloodTests.unshift(data);
    saveLocalCache(); return data;
  }
  async function saveDailyMenu(dateStr, items, notes){
    const totals = calcMenuTotals(items);
    const rec = {menu_date:dateStr, items, total_calories:totals.cal, total_protein:totals.protein, total_fat:totals.fat, total_carbs:totals.carbs, notes:notes||null, updated_at:new Date().toISOString()};
    state.dailyMenus[dateStr] = rec; saveLocalCache();
    if(!supa) return true;
    const { error } = await supa.from('daily_menus').upsert(rec,{onConflict:'menu_date'});
    if(error){ console.error(error); toast('שגיאה: '+error.message); return false; }
    return true;
  }

  function calcMenuTotals(items){
    const t={cal:0,protein:0,fat:0,carbs:0};
    if(!Array.isArray(items)) return t;
    const map = new Map();
    [...state.foods,...FALLBACK_FOODS].forEach(f=>{ if(f.id!=null) map.set('id:'+f.id,f); map.set('name:'+f.name_he,f); });
    items.forEach(it=>{
      const g = parseFloat(it.grams)||0, f = g/100;
      let food = it.food_id!=null ? map.get('id:'+it.food_id) : null;
      if(!food && it.food_name) food = map.get('name:'+it.food_name);
      if(food){
        t.cal += (parseFloat(food.cal_per_100g)||0)*f;
        t.protein += (parseFloat(food.protein_per_100g)||0)*f;
        t.fat += (parseFloat(food.fat_per_100g)||0)*f;
        t.carbs += (parseFloat(food.carbs_per_100g)||0)*f;
      }
    });
    return {cal:Math.round(t.cal), protein:Math.round(t.protein*10)/10, fat:Math.round(t.fat*10)/10, carbs:Math.round(t.carbs*10)/10};
  }
  function getMenuForDate(dateStr){
    if(state.dailyMenus[dateStr]) return {custom:true, ...state.dailyMenus[dateStr]};
    const d = new Date(dateStr), names=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
    const tmpl = DEFAULT_MENU.days.find(x=>x.day===names[d.getDay()]);
    return {custom:false, template:tmpl, menu_date:dateStr};
  }
  function getWorkoutForDay(day){
    if(state.workoutOverrides[day]) return {custom:true, day, exercises:state.workoutOverrides[day]};
    const def = DEFAULT_WORKOUTS.find(w=>w.day===day);
    return def ? {custom:false, ...def} : null;
  }

  // ============ RENDER ============
  function renderDashboard(){
    const m = state.latestMetrics, prev = state.metricsHistory[1], p = state.profile;
    const phaseLabel = {keto:'🥩 קיטו', transitioning:'🔄 מעבר', regular:'🍽️ רגיל'}[p.diet_phase] || p.diet_phase;
    const bmi = m ? calcBMI(m.weight, p.height_cm) : '-';
    const bmr = m ? calcBMR(m.weight, p.height_cm, p.age) : '-';
    const names = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
    const todayName = names[new Date().getDay()];
    const todayDate = new Date().toISOString().slice(0,10);
    const menuToday = getMenuForDate(todayDate);
    const isTraining = ['ראשון','רביעי','שישי'].includes(todayName);
    const tdee = bmr!=='-' ? calcTDEE(bmr, 11, isTraining) : '-';
    const wT = m&&prev ? trendArrow(parseFloat(m.weight),parseFloat(prev.weight)) : {arrow:'·',cls:'flat'};
    const bfT = m&&prev ? trendArrow(parseFloat(m.body_fat_pct),parseFloat(prev.body_fat_pct)) : {arrow:'·',cls:'flat'};
    const mmT = m&&prev ? trendArrow(parseFloat(m.muscle_mass),parseFloat(prev.muscle_mass)) : {arrow:'·',cls:'flat'};

    let html = '';
    if(!supa){
      html += `<div class="hint-box"><strong>⚙️ הגדרה ראשונית:</strong> לחץ ⚙️ למעלה והזן Supabase URL + Key.</div>`;
    }
    const dayCls = isTraining ? (todayName==='שישי'?'release':'training') : '';
    const dayBadge = todayName==='שישי'?'🍦 יום שחרור':isTraining?'🏋️ אימון בוקר בצום':'☀️ יום רגיל';
    html += `<div class="card" style="border:2px solid var(--accent)"><h3 class="card-title"><span><span class="emoji">📅</span> היום - ${todayName}</span><span class="text-xs" style="color:var(--accent)">${dayBadge}</span></h3>`;
    if(menuToday.custom){
      const items = menuToday.items||[];
      html += `<div class="day-card ${dayCls}" style="margin:0">`;
      items.forEach(it => { html += `<div class="meal-row"><span class="meal-label">${escapeHtml(it.meal||'')}:</span><span>${escapeHtml(it.food_name||'')} (${it.grams}g)</span></div>`; });
      html += `<div class="macros-row"><span>${menuToday.total_calories||0} קל'</span><span>${menuToday.total_protein||0}g חלבון</span><span>תחזוקה: ${tdee}</span></div></div>`;
    } else if(menuToday.template){
      const t = menuToday.template;
      html += `<div class="day-card ${dayCls}" style="margin:0"><div class="meal-row"><span class="meal-label">צהריים:</span><span>${escapeHtml(t.lunch||'')}</span></div><div class="meal-row"><span class="meal-label">ערב:</span><span>${escapeHtml(t.dinner||'')}</span></div><div class="macros-row"><span>~${t.cal} קל'</span><span>~${t.protein}g חלבון</span><span>תחזוקה: ${tdee}</span></div></div>`;
    }
    html += `<div class="btn-row mt-3"><button class="btn secondary" style="font-size:13px" data-action="edit-menu-day" data-date="${todayDate}">✏️ ערוך תפריט</button><button class="btn secondary" style="font-size:13px" data-action="new-metric">⚖️ משקל</button></div></div>`;

    html += `<div class="card"><h3 class="card-title"><span><span class="emoji">📍</span> תמונת מצב</span><span class="text-xs text-dim">${phaseLabel}</span></h3>`;
    html += `<div class="status-grid"><div class="status-tile"><div class="status-label">משקל</div><div class="status-value">${m?m.weight:'-'}<span class="status-unit">ק"ג</span></div><div class="status-trend ${wT.cls}">${wT.arrow}</div></div>`;
    html += `<div class="status-tile"><div class="status-label">אחוז שומן</div><div class="status-value">${m&&m.body_fat_pct?m.body_fat_pct:'-'}<span class="status-unit">%</span></div><div class="status-trend ${bfT.cls}">${bfT.arrow}</div></div>`;
    html += `<div class="status-tile"><div class="status-label">מסת שריר</div><div class="status-value">${m&&m.muscle_mass?m.muscle_mass:'-'}<span class="status-unit">ק"ג</span></div><div class="status-trend ${mmT.cls}">${mmT.arrow}</div></div>`;
    const a = state.latestActivity;
    html += `<div class="status-tile"><div class="status-label">BMI</div><div class="status-value">${bmi}</div></div>`;
    html += `<div class="status-tile"><div class="status-label">צעדים</div><div class="status-value">${a?a.steps:'-'}</div></div>`;
    html += `<div class="status-tile"><div class="status-label">מרחק</div><div class="status-value">${a?a.distance_km:'-'}<span class="status-unit">ק"מ</span></div></div>`;
    html += `<div class="status-tile"><div class="status-label">קלוריות</div><div class="status-value">${a?a.calories:'-'}<span class="status-unit">קל'</span></div></div></div></div>`;

    html += `<div class="ai-panel"><div class="ai-persona"><div class="ai-avatar">👩‍⚕️</div><div><div class="ai-name">ד"ר נועה לבנת</div><div class="ai-role">דיאטנית קלינית</div></div></div><div class="btn-row mt-2"><button class="btn" data-action="byoc-dietitian">📋 קבל הנחיה</button><button class="btn secondary" data-action="paste-dietitian">📥 הדבק תשובה</button></div></div>`;
    html += `<div class="ai-panel"><div class="ai-persona"><div class="ai-avatar trainer">🏋️</div><div><div class="ai-name">אסף ברק</div><div class="ai-role">מאמן כושר</div></div></div><div class="btn-row mt-2"><button class="btn" data-action="byoc-trainer" style="background:var(--accent-2)">📋 קבל הנחיה</button><button class="btn secondary" data-action="paste-trainer">📥 הדבק תשובה</button></div></div>`;
    html += `<div class="ai-panel" style="border-color:var(--accent-warn)"><div class="ai-persona"><div class="ai-avatar" style="background:var(--accent-warn);color:#0f172a">👥</div><div><div class="ai-name">סקירה משותפת</div><div class="ai-role">לבנת + ברק</div></div></div><div class="btn-row mt-2"><button class="btn warn" data-action="byoc-team">📋 סקירה</button><button class="btn secondary" data-action="paste-team">📥 הדבק</button></div></div>`;
    html += `<div class="ai-panel" style="border-color:#ef4444"><div class="ai-persona"><div class="ai-avatar" style="background:#ef4444">🩸</div><div><div class="ai-name">ד"ר אביגיל שמיר</div><div class="ai-role">רופאת משפחה + מומחית דם</div></div></div><div class="btn-row mt-2"><button class="btn" style="background:#ef4444" data-action="byoc-doctor">📋 ניתוח בדיקת דם</button><button class="btn secondary" data-action="paste-doctor">📥 הדבק</button></div></div>`;

    $('#dashboardContent').innerHTML = html;
  }

  function renderMenu(){
    let html = `<div class="card"><h3 class="card-title"><span><span class="emoji">🍽️</span> תפריט שבועי</span></h3><div class="text-xs text-dim mb-2">לחץ ✏️ ליום לערוך עם חישוב קלוריות אוטומטי</div></div>`;
    const today = new Date();
    const names = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
    for(let i=0; i<7; i++){
      const d = new Date(today); d.setDate(d.getDate()-today.getDay()+i);
      const dateStr = d.toISOString().slice(0,10);
      const dayName = names[d.getDay()];
      const m = getMenuForDate(dateStr);
      const isTr = ['ראשון','רביעי','שישי'].includes(dayName);
      const cls = isTr ? (dayName==='שישי'?'release':'training') : '';
      const badge = dayName==='שישי' ? '<span class="badge release">שחרור 🍦</span>' : isTr ? '<span class="badge">אימון 🏋️</span>' : '';
      html += `<div class="day-card ${cls}"><div class="day-name">${dayName} ${badge} <span class="text-xs text-dim">${dateStr}</span></div>`;
      if(m.custom){
        const items = m.items||[];
        items.forEach(it=>{ html += `<div class="meal-row"><span class="meal-label">${escapeHtml(it.meal||'')}:</span><span>${escapeHtml(it.food_name||'')} (${it.grams}g)</span></div>`; });
        html += `<div class="macros-row"><span>${m.total_calories||0} קל'</span><span>${m.total_protein||0}g חלבון</span><span>${m.total_fat||0}g שומן</span><span>${m.total_carbs||0}g פחמ'</span></div>`;
      } else if(m.template){
        html += `<div class="meal-row"><span class="meal-label">צהריים:</span><span>${escapeHtml(m.template.lunch||'')}</span></div><div class="meal-row"><span class="meal-label">ערב:</span><span>${escapeHtml(m.template.dinner||'')}</span></div><div class="macros-row"><span>~${m.template.cal} קל'</span><span>~${m.template.protein}g חלבון</span></div>`;
      }
      html += `<button class="btn secondary mt-3" style="font-size:13px" data-action="edit-menu-day" data-date="${dateStr}">✏️ ערוך</button></div>`;
    }
    html += `<div class="card mt-3"><h3 class="card-title"><span><span class="emoji">📜</span> כללי הברזל</span></h3><ul class="text-sm" style="padding-right:18px;line-height:1.7">${DEFAULT_MENU.rules.map(r=>'<li>'+r+'</li>').join('')}</ul></div>`;
    $('#menuContent').innerHTML = html;
  }

  function renderWorkouts(){
    let html = `<div class="card"><h3 class="card-title"><span><span class="emoji">🏋️</span> תוכנית אימונים</span></h3><div class="text-sm text-dim">3 אימוני בוקר בצום</div></div>`;
    DEFAULT_WORKOUTS.forEach(w=>{
      const cur = getWorkoutForDay(w.day);
      const cls = w.is_release ? 'release' : '';
      const hc = w.is_release ? 'color:#0f172a' : '';
      html += `<div class="workout-day ${cls}"><div class="workout-day-header" style="${hc}"><span>${w.day} - ${w.is_release?'שחרור 🌅':'אימון'}</span><span class="text-xs">${w.time}</span></div>`;
      cur.exercises.forEach(e=>{ html += `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;${hc};border-bottom:1px solid rgba(255,255,255,0.1)"><span>${escapeHtml(e.name)} <span style="opacity:0.7;font-size:11px">(${e.muscle})</span></span><span>${e.sets>0?e.sets+'×':''}${e.reps}</span></div>`; });
      html += `<button class="btn secondary mt-3" data-action="edit-workout" data-day="${w.day}">✏️ ערוך תרגילים</button></div>`;
    });
    $('#workoutsContent').innerHTML = html;
  }

  function renderMetrics(){
    let html = `<div class="card"><h3 class="card-title"><span><span class="emoji">📊</span> מדדים</span><button class="btn" style="width:auto;padding:8px 14px;margin:0" data-action="new-metric">+ חדש</button></h3></div>`;
    if(state.metricsHistory.length){
      const ws = state.metricsHistory.slice(0,14).reverse().map(m=>parseFloat(m.weight));
      const mx = Math.max(...ws), mn = Math.min(...ws), rg = mx-mn||1;
      html += `<div class="card"><h3 class="card-title"><span><span class="emoji">📈</span> משקל - 14 אחרונות</span></h3><div class="mini-chart">${ws.map(w=>'<div class="bar" style="height:'+((w-mn)/rg*100+10)+'%" title="'+w+'"></div>').join('')}</div><div class="text-xs text-dim mt-2">${mn.toFixed(1)} - ${mx.toFixed(1)} ק"ג</div></div>`;
      html += `<div class="card"><h3 class="card-title"><span><span class="emoji">📋</span> כל המדידות</span></h3>`;
      state.metricsHistory.forEach(m=>{ html += `<div class="day-card" style="margin-bottom:6px;border-right-color:var(--accent-2)"><div class="day-name">${formatDate(m.measured_at)}</div><div class="text-sm text-dim">משקל: <strong>${m.weight}ק"ג</strong> · שומן: <strong>${m.body_fat_pct||'-'}%</strong> · שריר: <strong>${m.muscle_mass||'-'}ק"ג</strong></div></div>`; });
      html += `</div>`;
    } else {
      html += `<div class="card"><div class="empty-state"><span class="emoji">📭</span><div>עדיין לא נרשמו מדידות</div></div></div>`;
    }
    $('#metricsContent').innerHTML = html;
  }

  function renderBlood(){
    let html = `<div class="card"><h3 class="card-title"><span><span class="emoji">🩸</span> בדיקות דם</span><button class="btn" style="width:auto;padding:8px 14px;margin:0;background:#ef4444" data-action="upload-blood">📎 העלה PDF</button></h3><div class="text-xs text-dim">העלה PDF → ד"ר אביגיל שמיר תנתח</div></div>`;
    if(state.bloodTests.length){
      state.bloodTests.forEach(b=>{
        html += `<div class="card"><h3 class="card-title"><span>📅 ${formatDate(b.test_date)}</span>${b.pdf_url?'<a href="'+b.pdf_url+'" target="_blank" style="color:var(--accent)">📄 PDF</a>':''}</h3>`;
        if(b.analysis) html += `<div style="white-space:pre-wrap;line-height:1.5;font-size:13px">${escapeHtml(b.analysis.substring(0,500))}${b.analysis.length>500?'...':''}</div>`;
        else html += `<div class="text-sm text-dim">ממתינה לניתוח - לחץ "📋 ניתוח" בדשבורד</div>`;
        html += `</div>`;
      });
    } else {
      html += `<div class="card"><div class="empty-state"><span class="emoji">📭</span><div>אין בדיקות דם</div></div></div>`;
    }
    $('#bloodContent').innerHTML = html;
  }
  // ============ BYOC PROMPTS ============
  function buildContextSnapshot(){
    const m = state.latestMetrics, p = state.profile;
    const today = new Date().toISOString().slice(0,10);
    const recentMenus = [];
    for(let i=0;i<7;i++){ const d=new Date(); d.setDate(d.getDate()-i); const ds=d.toISOString().slice(0,10); if(state.dailyMenus[ds]) recentMenus.push(state.dailyMenus[ds]); }
    return {
      profile: p,
      latest_metrics: m,
      this_week_menu: getMenuForDate(today),
      recent_custom_menus: recentMenus,
      workouts_plan: DEFAULT_WORKOUTS.map(w=>({...w, exercises:getWorkoutForDay(w.day).exercises})),
      blood_tests_recent: state.bloodTests.slice(0,3).map(b=>({date:b.test_date, analysis:b.analysis?.substring(0,500)})),
      pantry_in_stock: state.pantry.filter(p=>p.in_stock).map(p=>p.name),
      timestamp: new Date().toISOString(),
    };
  }
  function buildDietitianPrompt(snap){
    return `אתה ד"ר נועה לבנת, דיאטנית קלינית מנוסה. ענה בעברית בלבד.\n\nנתוני מטופל:\n${JSON.stringify(snap, null, 2)}\n\nתן הנחיה תזונתית מעשית ל-7 הימים הבאים, התייחס למצב הנוכחי וליעדים. אם יש מגמה בעיתית - הדגש. כתוב בטון אישי, חם ומקצועי.`;
  }
  function buildTrainerPrompt(snap){
    return `אתה אסף ברק, מאמן כושר ותיק. ענה בעברית בלבד.\n\nנתוני מתאמן:\n${JSON.stringify(snap, null, 2)}\n\nתן המלצה לאימונים השבועיים. התייחס לשגרת ראשון/רביעי/שישי. אם משקל/שריר משתנה - הסבר איך לכוון. כתוב בטון אישי וישיר.`;
  }
  function buildTeamPrompt(snap){
    return `סקירה משותפת - ד"ר נועה לבנת + אסף ברק. ענה בעברית בלבד.\n\nנתונים:\n${JSON.stringify(snap, null, 2)}\n\nכתוב סקירה משולבת: 1) תזונה (לבנת) 2) אימונים (ברק) 3) המלצה מאוחדת. בכל חלק שיהיה ברור מי מדבר.`;
  }
  function buildDoctorPrompt(snap){
    return `אתה ד"ר אביגיל שמיר, רופאת משפחה מומחית בניתוח בדיקות דם. ענה בעברית בלבד.\n\nנתוני מטופל:\n${JSON.stringify(snap, null, 2)}\n\nאם יש בדיקת דם אחרונה - נתח אותה: ערכים תקינים, חורגים, מגמות. תן המלצות מעשיות (מזון, תוספים, הליכה לרופא). הצג חריגות קלות מול חמורות. כתוב בטון אישי ומרגיע אך מקצועי.`;
  }

  function showPromptFallback(persona, prompt){
    const labels = {dietitian:'דיאטנית',trainer:'מאמן',team:'סקירה',doctor:'רופא'};
    showModal(`<div class="modal-header"><h3 class="modal-title">📋 הנחיה - ${labels[persona]}</h3><button class="modal-close" data-action="close-modal">×</button></div><div class="text-sm text-dim mb-2">1. העתק טקסט → לחץ ${persona==='doctor'?'ב-Claude (גם העלה PDF)':'ב-ChatGPT/Claude'}\n2. העתק התשובה → חזור לכאן ולחץ "הדבק תשובה"</div><textarea readonly style="min-height:300px;font-size:12px" id="prompt-text">${escapeHtml(prompt)}</textarea><div class="btn-row mt-3"><button class="btn" data-action="copy-prompt">📋 העתק</button><button class="btn secondary" data-action="close-modal">סגור</button></div>`);
  }

  // ============ HANDLERS ============
  async function handleAction(action, dataset){
    if(action==='close-modal'){ closeModal(); return; }
    if(action==='switch-tab'){ switchScreen(dataset.screen); return; }
    if(action==='open-settings'){ showSettings(); return; }
    if(action==='show-history'){ showHistory(); return; }
    if(action==='copy-prompt'){ const ok=await copyToClipboard($('#prompt-text').value); toast(ok?'הועתק!':'שגיאה'); return; }
    if(action==='save-settings'){
      cfg = {url:$('#cfg-url').value.trim(), key:$('#cfg-key').value.trim()};
      localStorage.setItem(LS_KEY_CFG, JSON.stringify(cfg));
      const ok = await initSupabase();
      if(ok){ await loadAllData(); renderCurrentScreen(); closeModal(); toast('✅ הוגדר'); }
      else toast('שגיאה בחיבור');
      return;
    }
    if(action==='new-metric'){
      const today = new Date().toISOString().slice(0,16);
      showModal(`<div class="modal-header"><h3 class="modal-title">⚖️ מדידה חדשה</h3><button class="modal-close" data-action="close-modal">×</button></div><div class="form-row"><label class="form-label">תאריך</label><input type="datetime-local" id="m-date" value="${today}"></div><div class="form-row"><label class="form-label">משקל (ק"ג)</label><input type="number" step="0.1" id="m-weight"></div><div class="form-row"><label class="form-label">אחוז שומן (%)</label><input type="number" step="0.1" id="m-bf"></div><div class="form-row"><label class="form-label">מסת שריר (ק"ג)</label><input type="number" step="0.1" id="m-mm"></div><button class="btn" data-action="save-metric">שמור</button>`);
      return;
    }
    if(action==='save-metric'){
      const w = parseFloat($('#m-weight').value); if(!w){ toast('חסר משקל'); return; }
      const ok = await saveMetric({measured_at:$('#m-date').value, weight:w, body_fat_pct:parseFloat($('#m-bf').value)||null, muscle_mass:parseFloat($('#m-mm').value)||null});
      if(ok){ closeModal(); renderCurrentScreen(); toast('✅ נשמר'); }
      return;
    }
    if(action==='upload-blood'){
      showModal(`<div class="modal-header"><h3 class="modal-title">🩸 העלה בדיקת דם</h3><button class="modal-close" data-action="close-modal">×</button></div><div class="form-row"><label class="form-label">תאריך הבדיקה</label><input type="date" id="b-date" value="${new Date().toISOString().slice(0,10)}"></div><div class="form-row"><label class="form-label">PDF</label><input type="file" id="b-file" accept=".pdf,application/pdf"></div><div class="form-row"><label class="form-label">הערות</label><textarea id="b-notes" rows="3"></textarea></div><button class="btn" data-action="save-blood">שמור</button>`);
      return;
    }
    if(action==='save-blood'){
      const file = $('#b-file').files[0]; if(!file){ toast('בחר קובץ'); return; }
      toast('מעלה...');
      const up = await uploadBloodTestPDF(file); if(!up) return;
      const ok = await saveBloodTest({test_date:$('#b-date').value, pdf_url:up.url, pdf_filename:up.fileName, notes:$('#b-notes').value||null});
      if(ok){ closeModal(); renderCurrentScreen(); toast('✅ נשמר'); }
      return;
    }
    if(action&&action.startsWith('byoc-')){
      const persona = action.substring(5);
      const snap = buildContextSnapshot();
      sessionStorage.setItem('hh_snapshot_'+persona, JSON.stringify(snap));
      const builders = {dietitian:buildDietitianPrompt, trainer:buildTrainerPrompt, team:buildTeamPrompt, doctor:buildDoctorPrompt};
      const prompt = builders[persona](snap);
      sessionStorage.setItem('hh_prompt_'+persona, prompt);
      showPromptFallback(persona, prompt);
      return;
    }
    if(action&&action.startsWith('paste-')){
      const persona = action.substring(6);
      showModal(`<div class="modal-header"><h3 class="modal-title">📥 הדבק תשובה</h3><button class="modal-close" data-action="close-modal">×</button></div><div class="form-row"><label class="form-label">התשובה מ-Claude/ChatGPT</label><textarea id="r-text" rows="15" placeholder="הדבק כאן..."></textarea></div><button class="btn" data-action="save-paste" data-persona="${persona}">שמור</button>`);
      return;
    }
    if(action==='save-paste'){
      const persona = dataset.persona;
      const text = $('#r-text').value.trim(); if(!text){ toast('ריק'); return; }
      const snap = JSON.parse(sessionStorage.getItem('hh_snapshot_'+persona)||'null');
      const prompt = sessionStorage.getItem('hh_prompt_'+persona)||'';
      if(persona==='doctor' && state.bloodTests[0] && !state.bloodTests[0].analysis){
        const updated = {...state.bloodTests[0], analysis:text, analysis_date:new Date().toISOString()};
        await saveBloodTest(updated);
      } else {
        await saveCoachMessage(persona, prompt, text, snap);
      }
      closeModal(); renderCurrentScreen(); toast('✅ נשמר');
      return;
    }
    if(action==='edit-menu-day'){
      toast('עריכת תפריט - בניה בגרסה הבאה'); return;
    }
    if(action==='edit-workout'){
      toast('עריכת אימון - בניה בגרסה הבאה'); return;
    }
  }

  function showHistory(){
    let html = `<div class="modal-header"><h3 class="modal-title">📜 היסטוריה</h3><button class="modal-close" data-action="close-modal">×</button></div>`;
    if(state.coachMessages.length){
      state.coachMessages.slice(0,20).forEach(m=>{
        const cls = m.persona==='trainer'?'trainer':'';
        html += `<div class="history-item ${cls}"><div class="history-date">${formatDate(m.created_at)} · ${m.persona}</div><div class="history-preview">${escapeHtml((m.response||'').substring(0,200))}</div></div>`;
      });
    } else html += `<div class="empty-state"><span class="emoji">📜</span><div>אין עדיין היסטוריה</div></div>`;
    showModal(html);
  }

  function showSettings(){
    showModal(`<div class="modal-header"><h3 class="modal-title">⚙️ הגדרות</h3><button class="modal-close" data-action="close-modal">×</button></div><div class="hint-box"><strong>מדריך:</strong> הסק מ-Supabase → Settings → API: URL ו-anon key</div><div class="form-row"><label class="form-label">Supabase URL</label><input type="url" id="cfg-url" value="${escapeHtml(cfg.url||'')}" placeholder="https://xxx.supabase.co"></div><div class="form-row"><label class="form-label">Anon Key</label><input type="text" id="cfg-key" value="${escapeHtml(cfg.key||'')}" placeholder="sb_publishable_... או eyJ..."></div><button class="btn" data-action="save-settings">שמור והתחבר</button><div class="text-xs text-dim mt-3">גרסה ${APP_VER}</div>`);
  }

  function switchScreen(name){
    currentScreen = name;
    $('.screen').forEach(s=>s.classList.remove('active'));
    $('#screen-'+name).classList.add('active');
    $('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.screen===name));
    renderCurrentScreen();
  }
  function renderCurrentScreen(){
    if(currentScreen==='dashboard') renderDashboard();
    else if(currentScreen==='menu') renderMenu();
    else if(currentScreen==='workouts') renderWorkouts();
    else if(currentScreen==='metrics') renderMetrics();
    else if(currentScreen==='blood') renderBlood();
  }

  // ============ INIT ============
  document.addEventListener('click', e=>{
    const btn = e.target.closest('[data-action]');
    if(btn){ const a=btn.dataset.action; handleAction(a, btn.dataset); return; }
    const tab = e.target.closest('.tab-btn');
    if(tab && tab.dataset.screen){ switchScreen(tab.dataset.screen); return; }
  });
  $('#modalOverlay').addEventListener('click', e=>{ if(e.target===e.currentTarget) closeModal(); });
  $('#btnSettings')?.addEventListener('click', showSettings);
  $('#btnHistory')?.addEventListener('click', showHistory);

  async function init(){
    renderDashboard();
    if(cfg.url && cfg.key){
      const ok = await initSupabase();
      if(ok){ await loadAllData(); renderCurrentScreen(); }
    }
  }
  init().catch(e=>{ console.error('init error:',e); toast('שגיאה בטעינה'); });
})();
