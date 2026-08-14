/**
 * بازی «باشگاه من» - نسخه ارتقا یافته v3.0
 * ساخته شده توسط امیرعباس جمالیان
 * کاملاً آفلاین، رایگان، به زبان فارسی و بدون هیچ‌گونه پرداخت درون‌برنامه‌ای پولی.
 */

// --- ۱. ابزارهای فارسی ---
const PersianUtils = {
  persianDigits: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  
  toPersian(num) {
    if (num === null || num === undefined) return '۰';
    return num.toString().replace(/\d/g, (digit) => this.persianDigits[parseInt(digit, 10)]);
  },

  formatNumber(num) {
    if (isNaN(num)) return '۰';
    const formatted = Math.floor(num).toLocaleString('en-US');
    return this.toPersian(formatted);
  },

  getPersianDate() {
    try {
      const today = new Date();
      return new Intl.DateTimeFormat('fa-IR').format(today);
    } catch (e) {
      return '۱۴۰۳/۰۵/۲۲';
    }
  }
};

// --- ۲. داده‌های بازی ---

// مراحل فیزیکی بدن (۸ مرحله)
const MUSCLE_STAGES = [
  { levelReq: 1,  powerReq: 0,      id: 'thin',           title: 'لاغر (بدن اولیه)',           scale: 0.82, chestScale: 0.75, armScale: 0.70, absLines: 0 },
  { levelReq: 5,  powerReq: 100,    id: 'slightly_fit',   title: 'کمی ورزیده (عضلات اولیه)',    scale: 0.95, chestScale: 0.90, armScale: 0.88, absLines: 1 },
  { levelReq: 12, powerReq: 500,    id: 'fit',            title: 'ورزیده (بدن خوش‌فرم)',       scale: 1.10, chestScale: 1.08, armScale: 1.10, absLines: 2 },
  { levelReq: 22, powerReq: 3000,   id: 'muscular',       title: 'عضلانی (۶ تکه نمایان)',       scale: 1.25, chestScale: 1.28, armScale: 1.30, absLines: 3 },
  { levelReq: 35, powerReq: 12000,  id: 'pro',            title: 'حرفه‌ای (بدنساز مسابقه‌ای)',   scale: 1.42, chestScale: 1.48, armScale: 1.55, absLines: 3 },
  { levelReq: 50, powerReq: 50000,  id: 'super_muscular', title: 'فوق عضلانی (تنومند)',         scale: 1.60, chestScale: 1.68, armScale: 1.78, absLines: 4 },
  { levelReq: 70, powerReq: 200000, id: 'champion',       title: 'قهرمان سنگین‌وزن',           scale: 1.78, chestScale: 1.88, armScale: 2.00, absLines: 4 },
  { levelReq: 90, powerReq: 800000, id: 'hero',           title: 'تایتان افسانه‌ای (غول‌پیکر)',   scale: 1.95, chestScale: 2.10,  armScale: 2.25, absLines: 4 }
];

// درجه‌بندی رتبه (Ranks)
const RANKS = [
  { levelReq: 1,  title: 'تازه‌کار' },
  { levelReq: 8,  title: 'مبتدی' },
  { levelReq: 18, title: 'ورزشکار' },
  { levelReq: 30, title: 'حرفه‌ای' },
  { levelReq: 50, title: 'قهرمان' },
  { levelReq: 75, title: 'استاد' },
  { levelReq: 100,title: 'افسانه' }
];

// لیست حرکات تخصصی ورزشی
const WORKOUT_TYPES = [
  { id: 'biceps_curl',    name: 'دمبل جلو بازو',   icon: '🏋️‍♂️', target: 'arms',      targetName: 'بازو',     energyCost: 5,  powerGain: 2,  statGain: 1.2, xpGain: 10, coinGain: 12, reqLevel: 1 },
  { id: 'bench_press',   name: 'پرس سینه',        icon: '🏋️',  target: 'chest',     targetName: 'سینه',     energyCost: 6,  powerGain: 3,  statGain: 1.5, xpGain: 14, coinGain: 18, reqLevel: 3 },
  { id: 'squat',         name: 'اسکوات پا',        icon: '🦵',  target: 'legs',      targetName: 'پاها',     energyCost: 7,  powerGain: 4,  statGain: 1.8, xpGain: 18, coinGain: 24, reqLevel: 6 },
  { id: 'shoulder_press',name: 'پرس سرشانه',      icon: '🦾',  target: 'shoulders', targetName: 'سرشانه',   energyCost: 6,  powerGain: 3,  statGain: 1.4, xpGain: 16, coinGain: 20, reqLevel: 10 },
  { id: 'deadlift',      name: 'ددلیفت پشت',       icon: '🧱',  target: 'back',      targetName: 'پشت',      energyCost: 8,  powerGain: 5,  statGain: 2.0, xpGain: 22, coinGain: 28, reqLevel: 15 },
  { id: 'treadmill',     name: 'دویدن روی تردمیل', icon: '🏃',  target: 'stamina',   targetName: 'استقامت',  energyCost: 5,  powerGain: 2,  statGain: 1.5, xpGain: 12, coinGain: 15, reqLevel: 1 }
];

// مسابقات بدنسازی (۶ سطح با درجه سختی بالا)
const TOURNAMENTS = [
  { id: 'rookie_tour',   title: 'مسابقه تازه‌کارها', opponentName: 'حمید کم‌قدرت', opponentAvatar: '🥊', opponentPower: 60,     reqLevel: 1,  rewardCoins: 500,    rewardXp: 100,  rewardGems: 5,   rewardMedal: 'bronze' },
  { id: 'beginner_tour', title: 'مسابقه مبتدی‌ها', opponentName: 'رضا دمبل‌زن', opponentAvatar: '🏋️‍♂️', opponentPower: 350,    reqLevel: 6,  rewardCoins: 2500,   rewardXp: 400,  rewardGems: 12,  rewardMedal: 'silver' },
  { id: 'amateur_tour',  title: 'مسابقه آماتورها', opponentName: 'سهراب ستون', opponentAvatar: '🦾', opponentPower: 2000,   reqLevel: 15, rewardCoins: 12000,  rewardXp: 1500, rewardGems: 30,  rewardMedal: 'gold' },
  { id: 'pro_tour',      title: 'مسابقه حرفه‌ای‌ها', opponentName: 'کامران کیلوگرم', opponentAvatar: '🔱', opponentPower: 12000,  reqLevel: 30, rewardCoins: 50000,  rewardXp: 5000, rewardGems: 80,  rewardMedal: 'platinum' },
  { id: 'champion_tour', title: 'مسابقه قهرمانان', opponentName: 'فرهاد پولادین', opponentAvatar: '👑', opponentPower: 60000,  reqLevel: 55, rewardCoins: 200000, rewardXp: 20000,rewardGems: 200, rewardMedal: 'diamond' },
  { id: 'legend_tour',   title: 'مسابقه افسانه‌ها', opponentName: 'آرش اسطوره', opponentAvatar: '🔥', opponentPower: 300000, reqLevel: 80, rewardCoins: 1000000,rewardXp: 80000,rewardGems: 500, rewardMedal: 'legend' }
];

// مدال‌ها
const MEDALS = [
  { id: 'bronze',   title: '🥉 مدال برنز',   desc: 'پیروزی در مسابقه تازه‌کارها' },
  { id: 'silver',   title: '🥈 مدال نقره',   desc: 'پیروزی در مسابقه مبتدی‌ها' },
  { id: 'gold',     title: '🥇 مدال طلا',     desc: 'پیروزی در مسابقه آماتورها' },
  { id: 'platinum', title: '✨ مدال پلاتین', desc: 'پیروزی در مسابقه حرفه‌ای‌ها' },
  { id: 'diamond',  title: '💎 مدال الماس',  desc: 'پیروزی در مسابقه قهرمانان' },
  { id: 'legend',   title: '🔥 مدال افسانه', desc: 'پیروزی در مسابقه افسانه‌ها' }
];

// گواهی‌های رسمی
const CERTIFICATES = [
  { id: 'cert_rookie',   title: 'گواهی تازه‌کار',   reqLevel: 1,  desc: 'تکمیل اولین تمرینات باشگاهی' },
  { id: 'cert_beginner', title: 'گواهی مبتدی',   reqLevel: 8,  desc: 'رسیدن به سطح ۸ و کسب آمادگی اولیه' },
  { id: 'cert_athlete',  title: 'گواهی ورزشکار',  reqLevel: 18, desc: 'رسیدن به سطح ۱۸ و فرم‌گیری عضلات' },
  { id: 'cert_pro',      title: 'گواهی حرفه‌ای',  reqLevel: 30, desc: 'رسیدن به سطح ۳۰ و ورود به دنیای حرفه‌ای' },
  { id: 'cert_champion', title: 'گواهی قهرمان',  reqLevel: 50, desc: 'رسیدن به سطح ۵۰ و پیروزی در جام قهرمانی' },
  { id: 'cert_master',   title: 'گواهی استاد',    reqLevel: 75, desc: 'رسیدن به سطح ۷۵ و تسلط کامل بر بدنسازی' },
  { id: 'cert_legend',   title: 'گواهی افسانه',  reqLevel: 100,desc: 'رسیدن به سطح ۱۰۰ و ثبت نام در تالار جاودانان' }
];

// تابع سنجش دقیق شرایط دستاوردها (قفل‌گذاری واقعی)
function isAchievementMet(a, state) {
  if (!a || !state) return false;
  if (a.reqReps && state.reps < a.reqReps) return false;
  if (a.reqWins && state.tournamentsWon < a.reqWins) return false;
  if (a.reqLevel && state.level < a.reqLevel) return false;
  if (a.reqPower && state.power < a.reqPower) return false;
  if (a.reqCoins && state.coins < a.reqCoins) return false;
  if (a.reqArms && state.arms < a.reqArms) return false;
  if (a.reqChest && state.chest < a.reqChest) return false;
  if (a.reqLegs && state.legs < a.reqLegs) return false;
  if (a.reqCombo && state.combo < a.reqCombo) return false;
  if (a.reqPerfects && state.perfectReps < a.reqPerfects) return false;
  if (a.reqGymTier && state.gymTierIndex < a.reqGymTier) return false;
  if (a.reqChests && state.chestsOpened < a.reqChests) return false;
  if (a.reqPrestige && state.prestigeCount < a.reqPrestige) return false;
  if (a.reqItems && state.ownedItems.length < a.reqItems) return false;
  if (a.reqStreak && state.dailyStreakDay < a.reqStreak) return false;
  return true;
}

// ۳۰ دستاورد کامل، چالش‌برانگیز و معتبر
const ACHIEVEMENTS = [
  { id: 'ach_1',     title: 'اولین حرکت',      desc: '۱ بار تمرین کن',              reqReps: 1,        rewardCoins: 200,   rewardGems: 2 },
  { id: 'ach_50',    title: '۱۰۰ تکرار',       desc: '۱۰۰ بار حرکت ورزشی انجام بده', reqReps: 100,      rewardCoins: 1000,  rewardGems: 10 },
  { id: 'ach_200',   title: '۵۰۰ تکرار',       desc: '۵۰۰ حرکت ورزشی ثبت کن',       reqReps: 500,      rewardCoins: 5000,  rewardGems: 25 },
  { id: 'ach_1000',  title: '۲,۵۰۰ تکرار',     desc: '۲,۵۰۰ تکرار سنگین!',         reqReps: 2500,     rewardCoins: 25000, rewardGems: 50 },
  { id: 'ach_5000',  title: '۱۰,۰۰۰ تکرار',    desc: '۱۰,۰۰۰ بار تمرین!',          reqReps: 10000,    rewardCoins: 100000,rewardGems: 150 },
  { id: 'ach_10k',   title: '۵۰,۰۰۰ تکرار',    desc: '۵۰,۰۰۰ حرکت قهرمانی!',      reqReps: 50000,    rewardCoins: 500000,rewardGems: 400 },
  { id: 'ach_win1',  title: 'اولین پیروزی',     desc: '۱ مسابقه را برنده شو',        reqWins: 1,        rewardCoins: 1000,  rewardGems: 10 },
  { id: 'ach_win5',  title: '۱۰ پیروزی',       desc: '۱۰ مسابقه را فتح کن',         reqWins: 10,       rewardCoins: 10000, rewardGems: 30 },
  { id: 'ach_win15', title: '۳۰ پیروزی',       desc: '۳۰ حریف را شکست بده',        reqWins: 30,       rewardCoins: 50000, rewardGems: 100 },
  { id: 'ach_lvl10', title: 'سطح ۱۰',           desc: 'به سطح ۱۰ برس',              reqLevel: 10,      rewardCoins: 3000,  rewardGems: 20 },
  { id: 'ach_lvl25', title: 'سطح ۳۰',           desc: 'به سطح ۳۰ برس',              reqLevel: 30,      rewardCoins: 20000, rewardGems: 50 },
  { id: 'ach_lvl50', title: 'سطح ۶۰',           desc: 'به سطح ۶۰ برس',              reqLevel: 60,      rewardCoins: 80000, rewardGems: 150 },
  { id: 'ach_lvl100',title: 'سطح ۱۰۰',          desc: 'به سطح ۱۰۰ (ماکزیمم) برس',    reqLevel: 100,     rewardCoins: 300000,rewardGems: 500 },
  { id: 'ach_pow1k', title: 'قدرت ۲,۰۰۰',      desc: 'قدرت کل را به ۲,۰۰۰ برسان',   reqPower: 2000,    rewardCoins: 10000, rewardGems: 30 },
  { id: 'ach_pow10k',title: 'قدرت ۲۵,۰۰۰',     desc: 'قدرت کل را به ۲۵,۰۰۰ برسان',  reqPower: 25000,   rewardCoins: 50000, rewardGems: 100 },
  { id: 'ach_pow100k',title:'قدرت ۲۵۰,۰۰۰',    desc: 'قدرت کل را به ۲۵۰,۰۰۰ برسان', reqPower: 250000,  rewardCoins: 300000,rewardGems: 300 },
  { id: 'ach_c1k',   title: 'ثروت اولیه',      desc: '۱,۰۰۰ سکه پس‌انداز کن',       reqCoins: 1000,    rewardCoins: 300,   rewardGems: 5 },
  { id: 'ach_c50k',  title: 'تاجر باشگاه',     desc: '۵۰,۰۰۰ سکه پس‌انداز کن',      reqCoins: 50000,   rewardCoins: 8000,  rewardGems: 40 },
  { id: 'ach_c1m',   title: 'میلیونر',         desc: '۱,۰۰۰,۰۰۰ سکه پس‌انداز کن',   reqCoins: 1000000, rewardCoins: 150000,rewardGems: 250 },
  { id: 'ach_arms50',title: 'بازوی پولادین',    desc: 'عضلات بازو را به ۵0 برسان',   reqArms: 50,       rewardCoins: 5000,  rewardGems: 20 },
  { id: 'ach_chest50',title:'سینه آهنین',      desc: 'عضلات سینه را به ۵۰ برسان',   reqChest: 50,      rewardCoins: 5000,  rewardGems: 20 },
  { id: 'ach_legs50',title: 'پای قدرتمند',     desc: 'عضلات پا را به ۵۰ برسان',     reqLegs: 50,       rewardCoins: 5000,  rewardGems: 20 },
  { id: 'ach_combo10',title:'کومبوی ۱۵',        desc: 'به کومبوی ۱۵ برس',            reqCombo: 15,      rewardCoins: 5000,  rewardGems: 20 },
  { id: 'ach_combo20',title:'کومبوی ۳۰',        desc: 'به کومبوی ۳۰ برس',            reqCombo: 30,      rewardCoins: 15000, rewardGems: 50 },
  { id: 'ach_perfect10',title:'دقت فوق‌العاده',  desc: '۲۵ تکرار Perfect ثبت کن',    reqPerfects: 25,   rewardCoins: 8000,  rewardGems: 30 },
  { id: 'ach_gym3',  title: 'باشگاه حرفه‌ای',   desc: 'محیط باشگاه را به سطح ۳ ارتقا بده', reqGymTier: 3, rewardCoins: 20000, rewardGems: 50 },
  { id: 'ach_chest_open',title:'صندوق‌بازکن',   desc: '۵ صندوق جایزه باز کن',       reqChests: 5,      rewardCoins: 3000,  rewardGems: 15 },
  { id: 'ach_prestige1',title:'بازگشت اول',    desc: '۱ بار سیستم Prestige را بزن', reqPrestige: 1,    rewardCoins: 50000, rewardGems: 100 },
  { id: 'ach_items5',title: 'مجموعه‌دار',      desc: '۸ آیتم مختلف خریداری کن',      reqItems: 8,       rewardCoins: 10000, rewardGems: 30 },
  { id: 'ach_streak7',title:'هفته کامل',       desc: '۷ روز مداوم وارد بازی شو',    reqStreak: 7,      rewardCoins: 20000, rewardGems: 80 }
];

// آیتم‌های فروشگاه (دسته‌بندی‌شده و چالش‌برانگیز)
const SHOP_ITEMS = [
  // دمبل‌ها
  { id: 'db_1', category: 'dumbbell', name: 'دمبل پلاستیکی (۱ کیلو)', icon: '🏋️‍♂️', powerBonus: 1,   priceCoins: 0,       priceGems: 0,  reqLevel: 1,  desc: 'دمبل سبک برای آغاز مسیر.' },
  { id: 'db_2', category: 'dumbbell', name: 'دمبل آهن فشرده (۳ کیلو)',icon: '🧱', powerBonus: 5,   priceCoins: 600,     priceGems: 0,  reqLevel: 2,  desc: 'وزنه استاندارد تمرینی.' },
  { id: 'db_3', category: 'dumbbell', name: 'دمبل چدنی (۵ کیلو)',     icon: '⚙️', powerBonus: 18,  priceCoins: 3000,    priceGems: 0,  reqLevel: 5,  desc: 'مخصوص عضلات بازو.' },
  { id: 'db_4', category: 'dumbbell', name: 'دمبل روکش کروم (۱۰ کیلو)',icon: '✨', powerBonus: 55,  priceCoins: 15000,   priceGems: 0,  reqLevel: 12, desc: 'براق، شیک و سنگین.' },
  { id: 'db_5', category: 'dumbbell', name: 'هالتر سنگین (۲۰ کیلو)',   icon: '🔱', powerBonus: 180, priceCoins: 75000,   priceGems: 0,  reqLevel: 22, desc: 'تمرینات قهرمانی.' },
  { id: 'db_6', category: 'dumbbell', name: 'دمبل طلایی (۵۰ کیلو)',    icon: '👑', powerBonus: 600, priceCoins: 300000,  priceGems: 0,  reqLevel: 38, desc: 'طلای خالص.' },
  { id: 'db_7', category: 'dumbbell', name: 'دمبل کوانتومی (۱۰۰ کیلو)',icon: '⚡', powerBonus: 2000,priceCoins: 1500000, priceGems: 150,reqLevel: 60, desc: 'قدرت فوق‌العاده الماسی.' },

  // تجهیزات باشگاه
  { id: 'eq_1', category: 'equipment', name: 'نیمکت پرس سینه',      icon: '🏋️', powerBonus: 25,  priceCoins: 10000,   priceGems: 0,  reqLevel: 4,  desc: 'تقویت سینه و بازو.' },
  { id: 'eq_2', category: 'equipment', name: 'دستگاه سیم‌کش ترکیبی',  icon: '⚙️', powerBonus: 100, priceCoins: 50000,   priceGems: 0,  reqLevel: 14, desc: 'حجم‌دهی کامل بدن.' },
  { id: 'eq_3', category: 'equipment', name: 'رک اسکوات حرفه‌ای',     icon: '🧱', powerBonus: 350, priceCoins: 200000,  priceGems: 0,  reqLevel: 28, desc: 'تقویت پاها و شانه.' },

  // لباس‌ها (کاورهای انیمیشنی جذاب و باکیفیت)
  { id: 'of_1', category: 'outfit', name: 'رکابی ورزشی آبی',      icon: '👕', powerBonus: 5,   priceCoins: 500,     priceGems: 0,  reqLevel: 1,  desc: 'رکابی سبک برای نمایش عضلات.' },
  { id: 'of_2', category: 'outfit', name: 'هودی قرمز اسپرت',       icon: '🧥', powerBonus: 25,  priceCoins: 8000,    priceGems: 0,  reqLevel: 8,  desc: 'هودی کلاه‌دار قرمز با جیب کانگورویی.' },
  { id: 'of_3', category: 'outfit', name: 'هودی سنگین مشکی (استریت)',icon: '🕶️', powerBonus: 80, priceCoins: 35000,   priceGems: 0,  reqLevel: 18, desc: 'هودی مشکی کلاه‌دار جذاب و حرفه‌ای.' },
  { id: 'of_4', category: 'outfit', name: 'کمربند و دوبنده طلایی',  icon: '👑', powerBonus: 250, priceCoins: 120000,  priceGems: 0,  reqLevel: 30, desc: 'دوبنده قهرمانی با کمربند طلایی.' },
  { id: 'of_5', category: 'outfit', name: 'لباس ابرقهرمانی نئونی',   icon: '🦸‍♂️', powerBonus: 800, priceCoins: 500000,  priceGems: 100,reqLevel: 50, desc: 'کت ابرقهرمانی نئونی با شنل سرخ.' },

  // مکمل‌ها
  { id: 'bs_1', category: 'booster', name: 'شیک پروتئین وی',        icon: '🥤', powerBonus: 15,  priceCoins: 2000,    priceGems: 0,  reqLevel: 3,  desc: 'بازسازی سریع انرژی.' },
  { id: 'bs_2', category: 'booster', name: 'پودر کراتین منوهیدرات',  icon: '🧪', powerBonus: 70,  priceCoins: 15000,   priceGems: 0,  reqLevel: 12, desc: 'افزایش قدرت انفجاری.' },
  { id: 'bs_3', category: 'booster', name: 'معجون انرژی الماسی',   icon: '💎', powerBonus: 300, priceCoins: 80000,   priceGems: 30, reqLevel: 25, desc: 'شارژ فوری و پاداش عالی.' }
];

// ارتقای محیط باشگاه (۶ سطح با قیمت‌های چالشی)
const GYM_TIERS = [
  { levelReq: 1,  title: '🏠 گاراژ خانگی',    priceCoins: 0,       coinMultiplier: 1.0 },
  { levelReq: 8,  title: '🏋️‍♂️ باشگاه کوچک',   priceCoins: 15000,   coinMultiplier: 1.25 },
  { levelReq: 20, title: '🏢 باشگاه متوسط',   priceCoins: 85000,   coinMultiplier: 1.6 },
  { levelReq: 38, title: '🏆 باشگاه حرفه‌ای', priceCoins: 400000,  coinMultiplier: 2.2 },
  { levelReq: 60, title: '👑 باشگاه قهرمانی', priceCoins: 1800000, coinMultiplier: 3.2 },
  { levelReq: 85, title: '🔥 باشگاه افسانه‌ای',priceCoins: 7500000, coinMultiplier: 5.0 }
];

// --- ۳. وضعیت کلی بازی (Game State) ---
class GameState {
  constructor() {
    this.resetToDefaults();
  }

  resetToDefaults() {
    this.playerName = 'ورزشکار قهرمان';
    this.level = 1;
    this.xp = 0;
    this.maxXp = 50;
    this.energy = 100;
    this.maxEnergy = 100;
    this.coins = 0;
    this.gems = 10;
    this.power = 1;
    this.reps = 0;
    this.combo = 0;
    this.perfectReps = 0;
    this.chestsOpened = 0;

    // عضلات هفت‌گانه
    this.strength = 1;
    this.chest = 1;
    this.arms = 1;
    this.shoulders = 1;
    this.legs = 1;
    this.back = 1;
    this.stamina = 1;

    this.activeExercise = 'biceps_curl';
    this.equippedDumbbell = 'db_1';
    this.equippedOutfit = 'of_1';
    this.equippedHair = null;
    this.equippedShoes = null;
    this.equippedGloves = null;
    this.equippedAura = null;
    this.equippedParticles = null;
    this.equippedVictoryEffect = null;
    this.equippedEquipment = null;
    this.ownedItems = ['db_1', 'of_1'];

    this.gymTierIndex = 0;
    this.prestigeCount = 0;

    this.tournamentsPlayed = 0;
    this.tournamentsWon = 0;
    this.unlockedMedals = [];
    this.unlockedCertificates = ['cert_rookie'];
    this.claimedAchievements = [];
    this.redeemedCodes = [];
    this.issuedCodes = [];

    // تنظیمات کارت و خرید دستی (قابل تغییر توسط پنل مدیریت)
    this.paymentConfig = {
      cardNumber: '6219861855031489',
      onlinePaymentEnabled: false
    };

    this.themeVersion = 'theme_v2';

    // روزهای ورودی و چالش‌ها (تقویم ۲۴ ساعته)
    this.dailyStreakDay = 1;
    this.lastDailyClaimTimestamp = 0;
    this.lastLoginDate = new Date().toDateString();
    this.dailyQuests = [
      { id: 'q1', title: '۵۰ بار تمرین کن', req: 50, current: 0, rewardCoins: 500, claimed: false },
      { id: 'q2', title: '۱ مسابقه برنده شو', req: 1, current: 0, rewardCoins: 1200, claimed: false },
      { id: 'q3', title: '۵ تکرار Perfect بزن', req: 5, current: 0, rewardCoins: 800, claimed: false }
    ];

    this.soundEnabled = true;
    this.cameraMode = 'front'; // 'front' or 'side'
    this.devRewardPopupShown = false;
    
    // تنظیمات AdMob (محافظت‌شده با رمز عبور 0960021590)
    this.admobConfig = {
      enabled: false,
      testMode: true,
      appId: 'ca-app-pub-3940256099942544~3347511713',
      bannerId: 'ca-app-pub-3940256099942544/6300978111',
      rewardedId: 'ca-app-pub-3940256099942544/5224354917'
    };

    this.lastSaveTime = Date.now();
  }

  getRank() {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (this.level >= RANKS[i].levelReq) return RANKS[i].title;
    }
    return RANKS[0].title;
  }
}

// --- ۴. موتور صوتی پیشرفته (Audio Engine) ---
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playWorkoutSound(enabled) {
    if (!enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  playPerfectSound(enabled) {
    if (!enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }

  playCoinSound(enabled) {
    if (!enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  playVictorySound(enabled) {
    if (!enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [330, 440, 554, 659].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.15, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.25);
      });
    } catch (e) {}
  }
}

// --- ۵. رندر انیمیشنی کاراکتر بدنسازی با عضلات پویا (Dynamic 2D Cartoon Male Bodybuilder Renderer) ---
class CharacterRenderer {
  constructor(canvasId = 'characterCanvas') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.flexScale = 1.0;
    this.flexTimer = null;
  }

  getCurrentStage(state) {
    for (let i = MUSCLE_STAGES.length - 1; i >= 0; i--) {
      const s = MUSCLE_STAGES[i];
      if (state.level >= s.levelReq || state.power >= s.powerReq) {
        return s;
      }
    }
    return MUSCLE_STAGES[0];
  }

  triggerFlexAnimation() {
    this.flexScale = 1.08;
    if (this.flexTimer) clearTimeout(this.flexTimer);
    this.flexTimer = setTimeout(() => {
      this.flexScale = 1.0;
    }, 280);
  }

  update(state) {
    this.render(state);
  }

  render(state) {
    if (!this.canvas) this.canvas = document.getElementById('characterCanvas');
    if (!this.canvas) return;
    if (!this.ctx) this.ctx = this.canvas.getContext('2d');
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    const stage = this.getCurrentStage(state);

    // به‌روزرسانی متن‌های عنوان و برچسب
    const titleEl = document.getElementById('muscleStageTitle');
    if (titleEl) titleEl.textContent = stage.title;
    const overlayEl = document.getElementById('stageBadgeOverlay');
    if (overlayEl) overlayEl.textContent = stage.title;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // ۱. پس‌زمینه پویا بر اساس محیط باشگاه (Dynamic Gym Tier Background)
    const tierIdx = state.gymTierIndex || 0;

    if (tierIdx === 0) {
      // 🏠 گاراژ خانگی (Garage Home Gym)
      const bgGlow = ctx.createLinearGradient(0, 0, 0, height);
      bgGlow.addColorStop(0, '#292524');
      bgGlow.addColorStop(1, '#1c1917');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 20; y < 280; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fillRect(width / 2 - 65, 15, 130, 26);
      ctx.strokeStyle = '#facc15';
      ctx.strokeRect(width / 2 - 65, 15, 130, 26);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏠 گاراژ تمرینی خانگی', width / 2, 32);

      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 280, width, 60);

    } else if (tierIdx === 1) {
      // 🏋️‍♂️ باشگاه کوچک (Small Gym)
      const bgGlow = ctx.createLinearGradient(0, 0, 0, height);
      bgGlow.addColorStop(0, '#0f172a');
      bgGlow.addColorStop(1, '#020617');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(0, 110, width, 8);

      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏋️‍♂️ FITNESS CLUB', width / 2, 35);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 280, width, 60);

    } else if (tierIdx === 2) {
      // 🏢 باشگاه متوسط (Medium Gym)
      const bgGlow = ctx.createLinearGradient(0, 0, 0, height);
      bgGlow.addColorStop(0, '#064e3b');
      bgGlow.addColorStop(1, '#022c22');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.fillRect(18, 20, 6, 240);
      ctx.fillRect(width - 24, 20, 6, 240);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 20, width - 72, 240);

      ctx.fillStyle = '#022c22';
      ctx.fillRect(0, 280, width, 60);

    } else if (tierIdx === 3) {
      // 🏆 باشگاه حرفه‌ای (Pro Gym)
      const bgGlow = ctx.createRadialGradient(width / 2, 100, 20, width / 2, 100, 180);
      bgGlow.addColorStop(0, '#581c87');
      bgGlow.addColorStop(0.7, '#2e1065');
      bgGlow.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 10;
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 PRO GYM CHAMPIONSHIP 🏆', width / 2, 35);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(28, 0); ctx.lineTo(28, 280);
      ctx.moveTo(width - 28, 0); ctx.lineTo(width - 28, 280);
      ctx.stroke();

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 280, width, 60);

    } else if (tierIdx === 4) {
      // 👑 باشگاه قهرمانی (Champion Gym)
      const bgGlow = ctx.createRadialGradient(width / 2, 120, 10, width / 2, 120, 200);
      bgGlow.addColorStop(0, '#78350f');
      bgGlow.addColorStop(0.6, '#451a03');
      bgGlow.addColorStop(1, '#020617');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(250, 204, 21, 0.08)';
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(width / 2 - 35, 280);
      ctx.lineTo(width / 2 + 35, 280);
      ctx.moveTo(width - 20, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑 ROYAL CHAMPION ARENA 👑', width / 2, 35);

      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 280, width, 60);

    } else {
      // 🔥 باشگاه افسانه‌ای (Legend Gym)
      const bgGlow = ctx.createRadialGradient(width / 2, 140, 20, width / 2, 140, 220);
      bgGlow.addColorStop(0, '#991b1b');
      bgGlow.addColorStop(0.5, '#450a0a');
      bgGlow.addColorStop(1, '#020617');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#f97316';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(width / 2, 145, 95, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fef08a';
      ctx.font = '900 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔥 LEGENDARY TITAN CLUB 🔥', width / 2, 35);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 280, width, 60);
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 280); ctx.lineTo(width, 280);
      ctx.stroke();
    }

    // کف باشگاه و خطوط سرامیک
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 280);
      ctx.lineTo(x - 20, 340);
      ctx.stroke();
    }

    // سایه کاراکتر
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(width / 2, 285, Math.min(120, 50 * stage.scale), 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // هاله طلایی برای سطوح بالای ورزشی
    if (stage.id === 'hero' || stage.id === 'champion' || stage.id === 'super_muscular') {
      const auraGlow = ctx.createRadialGradient(width / 2, 150, 40, width / 2, 150, 140);
      auraGlow.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      auraGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
      auraGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = auraGlow;
      ctx.beginPath();
      ctx.arc(width / 2, 150, 140, 0, Math.PI * 2);
      ctx.fill();
    }

    // اعمال مقیاس flex هنگام انقباض
    ctx.translate(width / 2, 175);
    ctx.scale(this.flexScale, this.flexScale);
    ctx.translate(-width / 2, -175);

    // ابعاد پویای عضلات بر اساس مرحله (کاراکتر اولیه لاغر است)
    const scale = stage.scale; 
    const chestWidth = 20 * stage.chestScale;
    const armRadius = 10 * stage.armScale;
    const shoulderSpread = 24 + (stage.chestScale - 1) * 18;
    const absLines = stage.absLines;

    const skinBase = '#f8c096';
    const skinShadow = '#d89466';
    const skinHighlight = '#fce2cd';

    const cx = width / 2;
    const cy = 170;

    // شنل ابرقهرمانی (پشت کاراکتر - اگر لباس ابرقهرمانی مجهز باشد)
    if (state.equippedOutfit === 'of_5') {
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(cx - shoulderSpread - 5, cy - 35);
      ctx.lineTo(cx + shoulderSpread + 5, cy - 35);
      ctx.lineTo(cx + shoulderSpread + 25, cy + 110);
      ctx.lineTo(cx - shoulderSpread - 25, cy + 110);
      ctx.closePath();
      ctx.fill();
    }

    // ۲. پاها (Legs & Shoes)
    const legWidth = 12 * (0.85 + scale * 0.25);
    // پای چپ
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.roundRect(cx - 20 - legWidth/2, cy + 55, legWidth, 55, 5);
    ctx.fill();
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.roundRect(cx - 18 - legWidth/2, cy + 55, legWidth - 2, 53, 4);
    ctx.fill();

    // پای راست
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.roundRect(cx + 20 - legWidth/2, cy + 55, legWidth, 55, 5);
    ctx.fill();
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.roundRect(cx + 20 - legWidth/2, cy + 55, legWidth - 2, 53, 4);
    ctx.fill();

    // کفش‌های ورزشی
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(cx - 28 - legWidth/2, cy + 102, legWidth + 8, 12, 4);
    ctx.roundRect(cx + 18 - legWidth/2, cy + 102, legWidth + 8, 12, 4);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 26 - legWidth/2, cy + 104, legWidth + 4, 4);
    ctx.fillRect(cx + 20 - legWidth/2, cy + 104, legWidth + 4, 4);

    // ۳. شورت ورزشی (Shorts)
    let shortsColor = '#ef4444';
    if (state.equippedOutfit === 'of_1') shortsColor = '#1d4ed8';
    if (state.equippedOutfit === 'of_3') shortsColor = '#090d16';
    if (state.equippedOutfit === 'of_4') shortsColor = '#ca8a04';
    if (state.equippedOutfit === 'of_5') shortsColor = '#0891b2';

    ctx.fillStyle = shortsColor;
    ctx.beginPath();
    ctx.moveTo(cx - shoulderSpread * 0.65, cy + 28);
    ctx.lineTo(cx + shoulderSpread * 0.65, cy + 28);
    ctx.lineTo(cx + 28, cy + 62);
    ctx.lineTo(cx - 28, cy + 62);
    ctx.closePath();
    ctx.fill();
    // کمربند شورت
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - shoulderSpread * 0.65, cy + 28, shoulderSpread * 1.3, 6);

    // ۴. تنه، سینه و عضلات بدن (Torso, Pecs, Abs)
    // پایه تنه
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.moveTo(cx - shoulderSpread, cy - 35);
    ctx.lineTo(cx + shoulderSpread, cy - 35);
    ctx.lineTo(cx + shoulderSpread * 0.6, cy + 30);
    ctx.lineTo(cx - shoulderSpread * 0.6, cy + 30);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.moveTo(cx - shoulderSpread + 2, cy - 35);
    ctx.lineTo(cx + shoulderSpread - 2, cy - 35);
    ctx.lineTo(cx + shoulderSpread * 0.58, cy + 29);
    ctx.lineTo(cx - shoulderSpread * 0.58, cy + 29);
    ctx.closePath();
    ctx.fill();

    // اگر لخت یا بدون لباس بالاتنه است، عضلات سینه و ۶تکه شکم نمایش داده می‌شود
    const isHoodie = state.equippedOutfit === 'of_2' || state.equippedOutfit === 'of_3';
    const isTankTop = state.equippedOutfit === 'of_1';
    const isGoldBelt = state.equippedOutfit === 'of_4';
    const isSuperhero = state.equippedOutfit === 'of_5';

    if (!isHoodie && !isSuperhero) {
      // عضلات سینه (Pecs Left & Right)
      ctx.fillStyle = skinHighlight;
      ctx.beginPath();
      ctx.roundRect(cx - chestWidth - 1, cy - 30, chestWidth, 20 * (scale * 0.85), 5);
      ctx.roundRect(cx + 1, cy - 30, chestWidth, 20 * (scale * 0.85), 5);
      ctx.fill();

      ctx.strokeStyle = skinShadow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 32);
      ctx.lineTo(cx, cy + 25);
      ctx.moveTo(cx - chestWidth - 1, cy - 30 + 20 * (scale * 0.85));
      ctx.lineTo(cx, cy - 30 + 20 * (scale * 0.85));
      ctx.moveTo(cx, cy - 30 + 20 * (scale * 0.85));
      ctx.lineTo(cx + chestWidth + 1, cy - 30 + 20 * (scale * 0.85));
      ctx.stroke();

      // شیارهای ۶ تکه شکم (Abs Lines)
      if (absLines > 0) {
        ctx.strokeStyle = skinShadow;
        ctx.lineWidth = 2;
        const absStartY = cy - 4;
        for (let a = 0; a < absLines; a++) {
          const ay = absStartY + a * 8;
          ctx.beginPath();
          ctx.moveTo(cx - 10 * (0.8 + scale * 0.2), ay);
          ctx.lineTo(cx + 10 * (0.8 + scale * 0.2), ay);
          ctx.stroke();
        }
      }
    }

    // ۵. گردن و سرشانه (Neck & Traps)
    const neckW = 9 + (stage.chestScale - 1) * 9;
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.moveTo(cx - neckW, cy - 35);
    ctx.lineTo(cx + neckW, cy - 35);
    ctx.lineTo(cx + neckW * 0.8, cy - 58);
    ctx.lineTo(cx - neckW * 0.8, cy - 58);
    ctx.closePath();
    ctx.fill();

    // کول‌ها (Trapezius)
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.moveTo(cx - shoulderSpread + 6, cy - 35);
    ctx.lineTo(cx - neckW * 0.6, cy - 53);
    ctx.lineTo(cx + neckW * 0.6, cy - 53);
    ctx.lineTo(cx + shoulderSpread - 6, cy - 35);
    ctx.closePath();
    ctx.fill();

    // ۶. بازوها و سرشانه‌ها (Deltoids & Flexed Biceps)
    const deltoidRadius = 11 * stage.armScale;

    // سرشانه چپ و راست
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.arc(cx - shoulderSpread, cy - 30, deltoidRadius, 0, Math.PI * 2);
    ctx.arc(cx + shoulderSpread, cy - 30, deltoidRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // جلو بازوی چپ (Flexed Biceps)
    ctx.fillStyle = skinHighlight;
    ctx.beginPath();
    ctx.ellipse(cx - shoulderSpread - deltoidRadius * 0.4, cy - 10, armRadius, armRadius * 1.25, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skinShadow;
    ctx.stroke();

    // جلو بازوی راست (Flexed Biceps)
    ctx.fillStyle = skinHighlight;
    ctx.beginPath();
    ctx.ellipse(cx + shoulderSpread + deltoidRadius * 0.4, cy - 10, armRadius, armRadius * 1.25, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skinShadow;
    ctx.stroke();

    // رندر پوشش لباس روی بدن (Hoodies, Tank Top, Superhero, Championship Belt)
    if (isHoodie) {
      const hoodieMainColor = state.equippedOutfit === 'of_2' ? '#dc2626' : '#18181b';
      const hoodieDarkColor = state.equippedOutfit === 'of_2' ? '#991b1b' : '#090d16';
      const pocketColor     = state.equippedOutfit === 'of_2' ? '#b91c1c' : '#27272a';
      const stringColor     = state.equippedOutfit === 'of_2' ? '#f8fafc' : '#facc15';

      // ۱. تنه اصلی هودی
      ctx.fillStyle = hoodieMainColor;
      ctx.beginPath();
      ctx.moveTo(cx - shoulderSpread - 2, cy - 36);
      ctx.lineTo(cx + shoulderSpread + 2, cy - 36);
      ctx.lineTo(cx + shoulderSpread * 0.62, cy + 30);
      ctx.lineTo(cx - shoulderSpread * 0.62, cy + 30);
      ctx.closePath();
      ctx.fill();

      // ۲. آستین‌های هودی روی سرشانه و بازو
      ctx.beginPath();
      ctx.arc(cx - shoulderSpread, cy - 30, deltoidRadius + 2, 0, Math.PI * 2);
      ctx.arc(cx + shoulderSpread, cy - 30, deltoidRadius + 2, 0, Math.PI * 2);
      ctx.fill();

      // پوشش آستین روی بازو
      ctx.beginPath();
      ctx.ellipse(cx - shoulderSpread - deltoidRadius * 0.4, cy - 10, armRadius + 2, armRadius * 1.2, -0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + shoulderSpread + deltoidRadius * 0.4, cy - 10, armRadius + 2, armRadius * 1.2, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // کشباف دور مچ آستین‌ها
      ctx.fillStyle = hoodieDarkColor;
      ctx.fillRect(cx - shoulderSpread - deltoidRadius * 0.8, cy + 2, 12, 5);
      ctx.fillRect(cx + shoulderSpread + deltoidRadius * 0.2, cy + 2, 12, 5);

      // ۳. جیب کانگورویی جلو هودی
      ctx.fillStyle = pocketColor;
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy + 6, 32, 18, 5);
      ctx.fill();

      // ۴. کلاه پشت یقه (Hood Collar)
      ctx.fillStyle = hoodieDarkColor;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 42, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // ۵. بندهای هودی (Drawstrings)
      ctx.strokeStyle = stringColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 38);
      ctx.lineTo(cx - 8, cy - 12);
      ctx.moveTo(cx + 6, cy - 38);
      ctx.lineTo(cx + 8, cy - 12);
      ctx.stroke();

    } else if (isTankTop) {
      // رکابی ورزشی آبی
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(cx - shoulderSpread + 8, cy - 35);
      ctx.lineTo(cx + shoulderSpread - 8, cy - 35);
      ctx.lineTo(cx + shoulderSpread * 0.58, cy + 29);
      ctx.lineTo(cx - shoulderSpread * 0.58, cy + 29);
      ctx.closePath();
      ctx.fill();

      // خط یقه گرد
      ctx.fillStyle = skinBase;
      ctx.beginPath();
      ctx.arc(cx, cy - 35, 12, 0, Math.PI);
      ctx.fill();

    } else if (isSuperhero) {
      // لباس نئونی ابرقهرمانی
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(cx - shoulderSpread - 2, cy - 36);
      ctx.lineTo(cx + shoulderSpread + 2, cy - 36);
      ctx.lineTo(cx + shoulderSpread * 0.62, cy + 30);
      ctx.lineTo(cx - shoulderSpread * 0.62, cy + 30);
      ctx.closePath();
      ctx.fill();

      // نشان صاعقه طلایی روی سینه
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', cx, cy - 6);
    }

    // ۷. ساعدها (Forearms)
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.roundRect(cx - shoulderSpread - deltoidRadius * 1.1 - 5, cy - 2, 11 * scale, 30, 4);
    ctx.roundRect(cx + shoulderSpread + deltoidRadius * 0.6, cy - 2, 11 * scale, 30, 4);
    ctx.fill();

    // کمربند طلایی قهرمانی (در صورت خرید و انتخاب)
    if (isGoldBelt) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - shoulderSpread * 0.62, cy + 18, shoulderSpread * 1.24, 14);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - shoulderSpread * 0.62, cy + 18, shoulderSpread * 1.24, 14);

      // پلاک و نگین الماس بزرگ مرکز کمربند
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy + 25, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy + 25, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // ۸. دمبل‌های در دست (Dumbbells)
    let dbColor = '#64748b';
    let dbWeightColor = '#334155';
    let isGlowingDb = false;
    let dbGlowColor = '#facc15';

    if (state.equippedDumbbell === 'db_2') {
      dbColor = '#94a3b8'; dbWeightColor = '#475569';
    } else if (state.equippedDumbbell === 'db_3') {
      dbColor = '#475569'; dbWeightColor = '#1e293b';
    } else if (state.equippedDumbbell === 'db_4') {
      dbColor = '#f8fafc'; dbWeightColor = '#cbd5e1'; // کروم براق
    } else if (state.equippedDumbbell === 'db_5') {
      dbColor = '#a855f7'; dbWeightColor = '#6b21a8'; // هالتر بنفش متالیک
    } else if (state.equippedDumbbell === 'db_6') {
      dbColor = '#facc15'; dbWeightColor = '#ca8a04'; // دمبل طلایی
      isGlowingDb = true; dbGlowColor = '#facc15';
    } else if (state.equippedDumbbell === 'db_7') {
      dbColor = '#38bdf8'; dbWeightColor = '#0284c7'; // دمبل کوانتومی نئونی/الماسی
      isGlowingDb = true; dbGlowColor = '#38bdf8';
    }

    if (isGlowingDb) {
      ctx.shadowColor = dbGlowColor;
      ctx.shadowBlur = 10;
    }

    // دمبل چپ
    const dbLx = cx - shoulderSpread - deltoidRadius * 1.1;
    const dbLy = cy + 24;
    ctx.fillStyle = dbColor;
    ctx.fillRect(dbLx - 15, dbLy - 3, 30, 6);
    ctx.fillStyle = dbWeightColor;
    ctx.beginPath();
    ctx.roundRect(dbLx - 19, dbLy - 11, 6, 22, 3);
    ctx.roundRect(dbLx + 11, dbLy - 11, 6, 22, 3);
    ctx.fill();

    // دمبل راست
    const dbRx = cx + shoulderSpread + deltoidRadius * 1.1;
    const dbRy = cy + 24;
    ctx.fillStyle = dbColor;
    ctx.fillRect(dbRx - 15, dbRy - 3, 30, 6);
    ctx.fillStyle = dbWeightColor;
    ctx.beginPath();
    ctx.roundRect(dbRx - 19, dbRy - 11, 6, 22, 3);
    ctx.roundRect(dbRx + 11, dbRy - 11, 6, 22, 3);
    ctx.fill();

    ctx.shadowBlur = 0;

    // ۹. سر و صورت انیمیشنی کاراکتر مرد (Cartoon Head & Face)
    const headX = cx;
    const headY = cy - 68;

    // سر
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.ellipse(headX, headY, 17, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 2;
    ctx.stroke();

    // موهای انیمیشنی (Hair)
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(headX, headY - 5, 19, Math.PI * 0.9, Math.PI * 2.1);
    ctx.lineTo(headX + 13, headY - 15);
    ctx.lineTo(headX, headY - 26);
    ctx.lineTo(headX - 13, headY - 15);
    ctx.closePath();
    ctx.fill();

    // چشم‌ها و ابروها
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#0f172a';
    // ابرو چپ
    ctx.beginPath();
    ctx.moveTo(headX - 11, headY - 5);
    ctx.lineTo(headX - 3, headY - 7);
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // ابرو راست
    ctx.beginPath();
    ctx.moveTo(headX + 3, headY - 7);
    ctx.lineTo(headX + 11, headY - 5);
    ctx.stroke();

    // چشم چپ و راست
    ctx.beginPath();
    ctx.arc(headX - 6, headY - 1, 2.2, 0, Math.PI * 2);
    ctx.arc(headX + 6, headY - 1, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // لبخند مطمئن
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(headX, headY + 5, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}

// --- ۶. ماژول اختصاصی تبلیغات AdMob (AdMob Integration Module) ---
class AdService {
  constructor(game) {
    this.game = game;
  }

  showRewardedAd(rewardType) {
    const config = this.game.state.admobConfig;

    if (config.enabled) {
      // پخش ویدیوی تبلیغاتی ۵ ثانیه‌ای
      this.game.ui.showToast('در حال پخش ویدیوی تبلیغاتی AdMob... 📺');
      const adScreen = document.getElementById('adScreen');
      if (adScreen) adScreen.classList.remove('hidden');

      let timer = 5;
      const adCountdownEl = document.getElementById('adCountdownText');
      if (adCountdownEl) adCountdownEl.textContent = `${PersianUtils.toPersian(timer)} ثانیه`;

      const adInterval = setInterval(() => {
        timer--;
        if (adCountdownEl) adCountdownEl.textContent = `${PersianUtils.toPersian(timer)} ثانیه`;
        if (timer <= 0) {
          clearInterval(adInterval);
          if (adScreen) adScreen.classList.add('hidden');
          this.applyReward(rewardType);
          this.game.ui.hideModal('adModal');
        }
      }, 1000);

    } else {
      // اگر تبلیغات غیرفعال باشد، هیچ پاداش رایگانی داده نمی‌شود!
      this.game.ui.showToast('تبلیغاتی فعال نیست! برای فعال‌سازی تبلیغات از بخش تنظیمات وارد پنل مدیریت شوید. 📺');
      this.game.ui.hideModal('adModal');
    }
  }

  applyReward(rewardType) {
    if (rewardType === 'coins') {
      this.game.state.coins += 500;
      this.game.ui.showToast('پاداش ۵۰۰ سکه تماشای تبلیغ دریافت شد! 💰');
    } else if (rewardType === 'gems') {
      this.game.state.gems += 20;
      this.game.ui.showToast('پاداش ۲۰ الماس تماشای تبلیغ دریافت شد! 💎');
    } else if (rewardType === 'energy') {
      this.game.state.energy = this.game.state.maxEnergy;
      this.game.ui.showToast('انرژی شما با تماشای تبلیغ به طور کامل شارژ شد! ⚡');
    } else if (rewardType === 'xp') {
      this.game.state.xp += 1000;
      this.game.checkLevelUp();
      this.game.ui.showToast('پاداش ۱,۰۰۰ تجربه تماشای تبلیغ دریافت شد! ⭐');
    }
    this.game.sound.playCoinSound(this.game.state.soundEnabled);
    this.game.saveGame();
    this.game.ui.update(this.game.state);
  }
}

const DEFAULT_MYKET_PRODUCTS = [
  {
    id: 'bundle_mega_pack',
    sku: 'bundle_mega_pack',
    priceRials: 500000,
    formattedPriceTomans: '۵۰,۰۰۰ تومان',
    farsiTitle: 'بسته فوق‌العاده',
    farsiDescription: 'شامل ۵,۰۰۰,۰۰۰ سکه + ۱,۰۰۰ الماس + ۱۰,۰۰۰ تجربه',
    rewardType: 'MEGA_PACK',
    rewardAmount: 1,
    icon: '🎁',
    badge: 'پیشنهاد ویژه'
  }
];

// --- ۷. مدیریت رابط کاربری (UI Manager) ---
class UIManager {
  constructor(game) {
    this.game = game;
    this.initNavigation();
    this.initEvents();
    this.initMyketShop();
  }

  initNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.tab-page').forEach(page => {
          page.classList.remove('active-page');
        });
        const activePage = document.getElementById(targetTab);
        if (activePage) activePage.classList.add('active-page');

        if (targetTab === 'shopTab') {
          this.renderShop('dumbbell');
        } else if (targetTab === 'myketShopTab') {
          this.renderMyketShop();
        }
      });
    });

    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    subTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSub = btn.getAttribute('data-sub');
        subTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.sub-tab-page').forEach(page => {
          page.classList.remove('active-sub');
        });
        const activeSub = document.getElementById(targetSub);
        if (activeSub) activeSub.classList.add('active-sub');
      });
    });

    const shopCatBtns = document.querySelectorAll('#shopCategories .cat-btn');
    shopCatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        shopCatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderShop(btn.getAttribute('data-cat'));
      });
    });
  }

  initEvents() {
    document.getElementById('workoutBtn').addEventListener('click', () => this.game.performWorkout());
    document.getElementById('toggleCameraBtn').addEventListener('click', () => {
      this.game.state.cameraMode = this.game.state.cameraMode === 'front' ? 'side' : 'front';
      this.showToast(this.game.state.cameraMode === 'side' ? 'زاویه دید سه بعدی جانبی' : 'زاویه دید سه بعدی روبرو');
    });

    document.getElementById('quickAdBtn').addEventListener('click', () => this.showModal('adModal'));
    document.getElementById('quickDailyBtn').addEventListener('click', () => this.showModal('dailyModal'));

    document.getElementById('closeAdBtn').addEventListener('click', () => this.hideModal('adModal'));
    document.getElementById('closeDailyBtn').addEventListener('click', () => this.hideModal('dailyModal'));
    const closeChestEl = document.getElementById('closeChestBtn');
    if (closeChestEl) closeChestEl.addEventListener('click', () => this.hideModal('chestModal'));
    document.getElementById('closeVictoryBtn').addEventListener('click', () => this.hideModal('victoryModal'));
    document.getElementById('closeDefeatBtn').addEventListener('click', () => this.hideModal('defeatModal'));
    document.getElementById('closeLevelUpBtn').addEventListener('click', () => this.hideModal('levelUpModal'));
    document.getElementById('closeCertDocBtn').addEventListener('click', () => this.hideModal('certificateViewModal'));

    document.getElementById('claimDailyBtn').addEventListener('click', () => this.game.claimDailyReward());
    document.getElementById('prestigeBtn').addEventListener('click', () => this.game.triggerPrestige());

    document.getElementById('soundToggleBtn').addEventListener('click', () => this.game.toggleSound());
    document.getElementById('manualSaveBtn').addEventListener('click', () => {
      this.game.saveGame();
      this.showToast('بازی با موفقیت ذخیره شد 💾');
    });

    document.getElementById('resetGameBtn').addEventListener('click', () => this.showModal('resetModal'));
    document.getElementById('confirmResetBtn').addEventListener('click', () => {
      this.game.resetGame();
      this.hideModal('resetModal');
      this.showToast('پیشرفت بازی بازنشانی شد.');
    });
    document.getElementById('cancelResetBtn').addEventListener('click', () => this.hideModal('resetModal'));

    // ویرایش نام
    document.getElementById('editNameBtn').addEventListener('click', () => this.showModal('editNameModal'));
    document.getElementById('saveNameBtn').addEventListener('click', () => {
      const input = document.getElementById('playerNameInput').value.trim();
      if (input) {
        this.game.state.playerName = input;
        this.game.saveGame();
        this.update(this.game.state);
        this.hideModal('editNameModal');
        this.showToast('نام بازیکن به‌روزرسانی شد ✏️');
      }
    });
    document.getElementById('cancelNameBtn').addEventListener('click', () => this.hideModal('editNameModal'));

    // پنل مخفی مدیریت تبلیغات AdMob (رمز عبور: 0960021590)
    const openAdmobSecretBtn = document.getElementById('openAdmobSecretBtn');
    if (openAdmobSecretBtn) {
      openAdmobSecretBtn.addEventListener('click', () => this.showModal('admobAuthModal'));
    }

    let versionTapCount = 0;
    let versionTapTimer = null;
    const versionTag = document.getElementById('versionTag');
    if (versionTag) {
      versionTag.addEventListener('click', () => {
        versionTapCount++;
        if (versionTapTimer) clearTimeout(versionTapTimer);
        versionTapTimer = setTimeout(() => { versionTapCount = 0; }, 3000);
        if (versionTapCount >= 5) {
          versionTapCount = 0;
          this.showModal('admobAuthModal');
        }
      });
    }

    const closeAdmobAuthBtn = document.getElementById('closeAdmobAuthBtn');
    if (closeAdmobAuthBtn) {
      closeAdmobAuthBtn.addEventListener('click', () => this.hideModal('admobAuthModal'));
    }
    const loginAdmobBtn = document.getElementById('loginAdmobBtn');
    if (loginAdmobBtn) {
      loginAdmobBtn.addEventListener('click', () => {
        const passInput = document.getElementById('admobPassInput');
        const pass = passInput ? passInput.value.trim() : '';
        if (pass === '0960021590') {
          if (passInput) passInput.value = '';
          this.hideModal('admobAuthModal');
          this.showModal('admobConfigModal');
          this.showToast('ورود به پنل مدیریت تبلیغات موفقیت‌آمیز بود 🔓');
        } else {
          this.showToast('رمز عبور مدیریت تبلیغات اشتباه است! ❌');
        }
      });
    }
    const closeAdmobConfigBtn = document.getElementById('closeAdmobConfigBtn');
    if (closeAdmobConfigBtn) {
      closeAdmobConfigBtn.addEventListener('click', () => this.hideModal('admobConfigModal'));
    }

    // ذخیره تنظیمات AdMob
    const saveAdmobConfigBtn = document.getElementById('saveAdmobConfigBtn');
    if (saveAdmobConfigBtn) {
      saveAdmobConfigBtn.addEventListener('click', () => {
        const cfg = this.game.state.admobConfig;
        cfg.enabled = document.getElementById('admobEnableToggle').checked;
        cfg.testMode = document.getElementById('admobTestToggle').checked;
        cfg.appId = document.getElementById('admobAppIdInput').value || cfg.appId;
        cfg.bannerId = document.getElementById('admobBannerIdInput').value || cfg.bannerId;
        cfg.rewardedId = document.getElementById('admobRewardedIdInput').value || cfg.rewardedId;
        this.game.saveGame();
        this.showToast('تنظیمات AdMob ذخیره شد 💾');
        this.hideModal('admobConfigModal');
      });
    }

    // دانلود تصویر گواهی
    document.getElementById('saveCertImageBtn').addEventListener('click', () => {
      this.downloadCertificateImage();
    });

    // کد جایزه ویژه (arsam 1396)
    const redeemSecretCodeBtn = document.getElementById('redeemSecretCodeBtn');
    if (redeemSecretCodeBtn) {
      redeemSecretCodeBtn.addEventListener('click', () => {
        this.game.redeemSecretCode();
      });
    }
    const secretCodeInput = document.getElementById('secretCodeInput');
    if (secretCodeInput) {
      secretCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.game.redeemSecretCode();
        }
      });
    }

    // بسته شدن مدال تبریک
    const closeCongModalBtn = document.getElementById('closeCongModalBtn');
    if (closeCongModalBtn) {
      closeCongModalBtn.addEventListener('click', () => {
        this.hideModal('congratulationsModal');
      });
    }
  }

  showCongratulationsModal(title, desc, icon = '🏆', buttonText = 'فوق‌العاده است! 🎉', callback = null) {
    const iconEl = document.getElementById('congModalIcon');
    const titleEl = document.getElementById('congModalTitle');
    const descEl = document.getElementById('congModalDesc');
    const btnEl = document.getElementById('closeCongModalBtn');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (btnEl) {
      btnEl.textContent = buttonText;
      btnEl.onclick = () => {
        this.hideModal('congratulationsModal');
        if (typeof callback === 'function') callback();
      };
    }
    this.showModal('congratulationsModal');
  }

  hasClaimedToday(state) {
    if (!state.lastDailyClaimTimestamp) return false;
    const lastDate = new Date(state.lastDailyClaimTimestamp).toDateString();
    const todayDate = new Date().toDateString();
    return lastDate === todayDate;
  }

  update(state) {
    document.getElementById('coinsDisplay').textContent = PersianUtils.formatNumber(state.coins);
    document.getElementById('gemsDisplay').textContent = PersianUtils.formatNumber(state.gems);
    document.getElementById('powerDisplay').textContent = PersianUtils.formatNumber(state.power);
    document.getElementById('levelBadge').textContent = `سطح ${PersianUtils.toPersian(state.level)}`;
    document.getElementById('rankBadge').textContent = state.getRank();

    document.getElementById('energyText').textContent = `${PersianUtils.toPersian(Math.floor(state.energy))} / ${PersianUtils.toPersian(state.maxEnergy)}`;
    document.getElementById('energyFill').style.width = `${(state.energy / state.maxEnergy) * 100}%`;

    document.getElementById('xpText').textContent = `${PersianUtils.formatNumber(state.xp)} / ${PersianUtils.formatNumber(state.maxXp)}`;
    document.getElementById('xpFill').style.width = `${Math.min(100, (state.xp / state.maxXp) * 100)}%`;

    this.game.photoManager.update(state);

    const gym = GYM_TIERS[state.gymTierIndex] || GYM_TIERS[0];
    const gymTierTag = document.getElementById('gymTierTag');
    if (gymTierTag) gymTierTag.textContent = gym.title;

    const dbItem = SHOP_ITEMS.find(i => i.id === state.equippedDumbbell);
    const dbBadge = document.getElementById('dumbbellBadge');
    if (dbBadge) dbBadge.textContent = `دمبل: ${dbItem ? dbItem.name : 'ساده'}`;

    const activeEx = WORKOUT_TYPES.find(w => w.id === state.activeExercise) || WORKOUT_TYPES[0];
    const activeTag = document.getElementById('activeExerciseTag');
    if (activeTag) activeTag.textContent = `حرکت: ${activeEx.name} ${activeEx.icon}`;
    
    const workoutIcon = document.getElementById('workoutIcon');
    if (workoutIcon) workoutIcon.textContent = activeEx.icon;
    
    const costText = document.getElementById('workoutCostText');
    if (costText) costText.textContent = `(مصرف ${PersianUtils.toPersian(activeEx.energyCost)} انرژی)`;

    // به‌روزرسانی نوارهای عضلات هفت‌گانه
    document.getElementById('mChestFill').style.width = `${Math.min(100, (state.chest / 100) * 100)}%`;
    document.getElementById('mArmsFill').style.width = `${Math.min(100, (state.arms / 100) * 100)}%`;
    document.getElementById('mShouldersFill').style.width = `${Math.min(100, (state.shoulders / 100) * 100)}%`;
    document.getElementById('mLegsFill').style.width = `${Math.min(100, (state.legs / 100) * 100)}%`;
    document.getElementById('mBackFill').style.width = `${Math.min(100, (state.back / 100) * 100)}%`;
    document.getElementById('mStaminaFill').style.width = `${Math.min(100, (state.stamina / 100) * 100)}%`;

    // نشان کومبو
    const comboBadge = document.getElementById('comboBadge');
    if (comboBadge) {
      if (state.combo >= 2) {
        comboBadge.classList.remove('hidden');
        comboBadge.textContent = `x${PersianUtils.toPersian(state.combo)} COMBO! 🔥`;
      } else {
        comboBadge.classList.add('hidden');
      }
    }

    // پروفایل
    document.getElementById('profileNameDisplay').textContent = state.playerName;
    document.getElementById('profileStageTag').textContent = `سطح ${PersianUtils.toPersian(state.level)} - ${state.getRank()}`;
    document.getElementById('pTotalReps').textContent = PersianUtils.formatNumber(state.reps);
    document.getElementById('pTournamentWins').textContent = `${PersianUtils.toPersian(state.tournamentsWon)} / ${PersianUtils.toPersian(state.tournamentsPlayed)}`;
    document.getElementById('pMedalCount').textContent = `${PersianUtils.toPersian(state.unlockedMedals.length)} / ${PersianUtils.toPersian(MEDALS.length)}`;
    document.getElementById('pCertCount').textContent = `${PersianUtils.toPersian(state.unlockedCertificates.length)} / ${PersianUtils.toPersian(CERTIFICATES.length)}`;
    document.getElementById('pPrestigeCount').textContent = PersianUtils.toPersian(state.prestigeCount);
    document.getElementById('pGymTierName').textContent = gym.title;

    // تنظیمات
    document.getElementById('soundStatusText').textContent = state.soundEnabled ? 'روشن' : 'خاموش';
    document.getElementById('soundStatusText').className = state.soundEnabled ? 'status-on' : '';

    // فرم تنظیمات AdMob
    const enableToggle = document.getElementById('admobEnableToggle');
    if (enableToggle) enableToggle.checked = state.admobConfig.enabled;
    const testToggle = document.getElementById('admobTestToggle');
    if (testToggle) testToggle.checked = state.admobConfig.testMode;

    this.renderWorkoutsList();
    this.renderTournamentsList();
    this.renderShop('dumbbell');
    this.renderCollection();
    this.renderHonors();
    this.renderDailyQuests();
    this.renderDailyStreakGrid();
  }

  renderWorkoutsList() {
    const grid = document.getElementById('workoutsGrid');
    grid.innerHTML = WORKOUT_TYPES.map(w => {
      const active = this.game.state.activeExercise === w.id;
      const locked = this.game.state.level < w.reqLevel;
      return `
        <div class="workout-card ${active ? 'active-card' : ''}">
          <div class="workout-info">
            <div class="workout-icon-box">${w.icon}</div>
            <div class="workout-text-box">
              <h3>${w.name} ${active ? '✅ (فعال)' : ''}</h3>
              <p>تقویت: ${w.targetName} | مصرف: ${PersianUtils.toPersian(w.energyCost)} انرژی</p>
            </div>
          </div>
          ${locked ? `<span class="workout-locked-tag">سطح ${PersianUtils.toPersian(w.reqLevel)}</span>` : `
            <button class="workout-select-btn" onclick="game.selectExercise('${w.id}')">
              ${active ? 'در حال تمرین' : 'انتخاب حرکت'}
            </button>
          `}
        </div>
      `;
    }).join('');
  }

  renderTournamentsList() {
    const list = document.getElementById('tournamentsList');
    list.innerHTML = TOURNAMENTS.map(t => {
      const locked = this.game.state.level < t.reqLevel;
      return `
        <div class="tour-card">
          <div class="tour-info">
            <span class="tour-avatar">${t.opponentAvatar}</span>
            <div class="tour-details">
              <h3>${t.title}</h3>
              <p>حریف: ${t.opponentName} | قدرت: ${PersianUtils.formatNumber(t.opponentPower)}</p>
              <p>جایزه: +${PersianUtils.formatNumber(t.rewardCoins)} سکه و +${PersianUtils.toPersian(t.rewardGems)} الماس 💎</p>
            </div>
          </div>
          ${locked ? `<span class="tour-locked">سطح ${PersianUtils.toPersian(t.reqLevel)}</span>` : `
            <button class="tour-enter-btn" onclick="game.startTournament('${t.id}')">ورود به رینگ 🥊</button>
          `}
        </div>
      `;
    }).join('');
  }

  initMyketShop() {
    const quickBtn = document.getElementById('quickMyketShopBtn');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        const shopTabBtn = document.querySelector('.tab-btn[data-tab="myketShopTab"]');
        if (shopTabBtn) shopTabBtn.click();
      });
    }

    const restoreBtn = document.getElementById('restorePurchasesBtn');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => {
        const bridge = window.AndroidShopBridge || window.AndroidShop;
        if (bridge && bridge.restorePurchases) {
          bridge.restorePurchases();
          this.showToast('در حال بررسی و بازیابی خریدهای قبلی...');
        } else {
          this.showToast('بازیابی خریدها در حال حاضر در دسترس نیست.');
        }
      });
    }

    this.renderMyketShop();
    this.checkMyketBillingStatus();
  }

  checkMyketBillingStatus() {
    const bridge = window.AndroidShopBridge || window.AndroidShop;
    const statusText = document.getElementById('myketStatusText');
    const statusDot = document.getElementById('myketStatusDot');

    if (bridge && bridge.checkBillingStatus) {
      try {
        const status = JSON.parse(bridge.checkBillingStatus());
        if (statusText) statusText.textContent = status.message || 'درگاه پرداخت مایکت آماده است';
        if (statusDot) {
          statusDot.style.background = status.isAvailable ? '#10b981' : '#f59e0b';
          statusDot.style.boxShadow = status.isAvailable ? '0 0 8px #10b981' : '0 0 8px #f59e0b';
        }
      } catch (e) {}
    } else {
      if (statusText) statusText.textContent = 'پرداخت درون‌برنامه‌ای مایکت (محیط آزمایشی)';
    }
  }

  renderMyketShop() {
    const grid = document.getElementById('myketProductsGrid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="myket-mega-pack-card" style="
        position: relative;
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98));
        border: 2px solid #f59e0b;
        border-radius: 16px;
        padding: 20px 16px;
        text-align: center;
        box-shadow: 0 10px 25px rgba(245, 158, 11, 0.25), inset 0 1px 1px rgba(255,255,255,0.1);
        width: 100%;
        max-width: 380px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      ">
        <div style="
          position: absolute;
          top: -12px;
          right: 16px;
          background: linear-gradient(135deg, #ef4444, #f59e0b);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
        ">
          🔥 پیشنهاد ویژه و استثنایی
        </div>

        <div style="font-size: 3.2rem; margin-top: 8px; filter: drop-shadow(0 4px 12px rgba(245, 158, 11, 0.5));">
          🎁
        </div>

        <div>
          <h3 style="color: #fbbf24; font-size: 1.3rem; font-weight: 900; margin: 0 0 6px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
            بسته فوق‌العاده
          </h3>
          <p style="color: #94a3b8; font-size: 0.78rem; margin: 0; line-height: 1.4;">
            با این بسته یک‌جا کل باشگاه را ارتقا دهید و به پیشرفت خیره‌کننده برسید!
          </p>
        </div>

        <div style="
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: right;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem; color: #f8fafc; font-weight: 700;">
            <span>🪙 سکه طلا:</span>
            <span style="color: #f59e0b; font-weight: 900; font-size: 0.95rem;">۵,۰۰۰,۰۰۰ سکه</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem; color: #f8fafc; font-weight: 700;">
            <span>💎 الماس بنفش:</span>
            <span style="color: #c084fc; font-weight: 900; font-size: 0.95rem;">۱,۰۰۰ الماس</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem; color: #f8fafc; font-weight: 700;">
            <span>⚡ تجربه تمرین (XP):</span>
            <span style="color: #38bdf8; font-weight: 900; font-size: 0.95rem;">۱۰,۰۰۰ XP</span>
          </div>
        </div>

        <div style="margin-top: 4px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px;">
            <span style="color: #94a3b8; text-decoration: line-through; font-size: 0.82rem;">۱۰۰,۰۰۰ تومان</span>
            <span style="color: #34d399; font-weight: 900; font-size: 1.2rem; text-shadow: 0 0 8px rgba(52, 211, 153, 0.3);">۵۰,۰۰۰ تومان</span>
          </div>

          <button id="buyMegaPackBtn" class="buy-myket-btn" data-id="bundle_mega_pack" style="
            width: 100%;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #0f172a;
            border: none;
            font-weight: 900;
            font-size: 1rem;
            padding: 12px 0;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
            transition: transform 0.15s, box-shadow 0.15s;
          ">
            💳 خرید آنلاین
          </button>
        </div>
      </div>
    `;

    const buyBtn = document.getElementById('buyMegaPackBtn');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        this.triggerMyketPurchase('bundle_mega_pack');
      });
    }
  }

  triggerMyketPurchase(productId = 'bundle_mega_pack') {
    buyMegaPack();
  }

  renderShop(cat) {
    const list = document.getElementById('shopList');
    const filtered = SHOP_ITEMS.filter(i => i.category === cat);
    list.innerHTML = filtered.map(item => {
      const owned = this.game.state.ownedItems.includes(item.id);
      const isEquipped = this.game.state.equippedDumbbell === item.id || this.game.state.equippedOutfit === item.id;
      return `
        <div class="shop-item-card">
          <div class="shop-item-left">
            <span class="shop-item-icon">${item.icon}</span>
            <div class="shop-item-info">
              <h4>${item.name} ${isEquipped ? '✅ (مجهز)' : ''}</h4>
              <p>${item.desc} | +${PersianUtils.toPersian(item.powerBonus)} قدرت</p>
            </div>
          </div>
          ${owned ? (isEquipped ? '<span class="status-on">استفاده‌شده</span>' : `<button class="shop-buy-btn" onclick="game.equipItem('${item.id}')">تجهیز 🎒</button>`) : `
            <button class="shop-buy-btn" onclick="game.buyItem('${item.id}')">
              ${item.priceCoins > 0 ? `${PersianUtils.formatNumber(item.priceCoins)} 💰` : `${PersianUtils.toPersian(item.priceGems)} 💎`}
            </button>
          `}
        </div>
      `;
    }).join('');
  }

  renderCollection() {
    const owned = this.game.state.ownedItems;

    document.getElementById('collDumbbells').innerHTML = SHOP_ITEMS.filter(i => i.category === 'dumbbell' && owned.includes(i.id)).map(i => `
      <div class="coll-item-box ${this.game.state.equippedDumbbell === i.id ? 'equipped' : ''}">
        <span>${i.icon}</span>
        <strong>${i.name}</strong>
      </div>
    `).join('') || '<p style="font-size:0.75rem; color:#888;">هنوز دمبلی خریده نشده.</p>';

    document.getElementById('collOutfits').innerHTML = SHOP_ITEMS.filter(i => i.category === 'outfit' && owned.includes(i.id)).map(i => `
      <div class="coll-item-box ${this.game.state.equippedOutfit === i.id ? 'equipped' : ''}">
        <span>${i.icon}</span>
        <strong>${i.name}</strong>
      </div>
    `).join('') || '<p style="font-size:0.75rem; color:#888;">هنوز لباسی خریده نشده.</p>';

    document.getElementById('collEquipment').innerHTML = SHOP_ITEMS.filter(i => i.category === 'equipment' && owned.includes(i.id)).map(i => `
      <div class="coll-item-box">
        <span>${i.icon}</span>
        <strong>${i.name}</strong>
      </div>
    `).join('') || '<p style="font-size:0.75rem; color:#888;">تجهیزاتی آزاد نشده.</p>';

    const nextGym = GYM_TIERS[this.game.state.gymTierIndex + 1];
    document.getElementById('gymUpgradeBox').innerHTML = `
      <p style="font-size:0.8rem; margin-bottom:8px;">محیط فعلی: <strong>${GYM_TIERS[this.game.state.gymTierIndex].title}</strong></p>
      ${nextGym ? `
        <button class="action-btn gold-btn" onclick="game.upgradeGymTier()">
          ارتقا به ${nextGym.title} (${PersianUtils.formatNumber(nextGym.priceCoins)} سکه 💰)
        </button>
      ` : '<span class="status-on">شما در بالاترین سطح محیط باشگاه قرار دارید! 👑</span>'}
    `;
  }

  renderHonors() {
    document.getElementById('medalsGrid').innerHTML = MEDALS.map(m => {
      const unlocked = this.game.state.unlockedMedals.includes(m.id);
      return `
        <div class="medal-box ${unlocked ? 'unlocked' : 'locked'}" style="opacity: ${unlocked ? 1 : 0.4}">
          <h3>${m.title}</h3>
          <p style="font-size:0.7rem; color:#94a3b8;">${m.desc}</p>
          <span style="font-size:0.68rem; color:${unlocked ? '#10b981' : '#ef4444'}">${unlocked ? 'کسب‌شده ✅' : 'قفل 🔒'}</span>
        </div>
      `;
    }).join('');

    document.getElementById('certificatesList').innerHTML = CERTIFICATES.map(c => {
      const unlocked = this.game.state.unlockedCertificates.includes(c.id);
      return `
        <div class="cert-card-item">
          <div>
            <h4 style="font-size:0.88rem; color:#f8fafc;">${c.title}</h4>
            <p style="font-size:0.7rem; color:#94a3b8;">${c.desc}</p>
          </div>
          ${unlocked ? `
            <button class="shop-buy-btn" onclick="game.viewCertificate('${c.id}')">مشاهده و دانلود 📜</button>
          ` : `<span style="font-size:0.7rem; color:#ef4444;">سطح ${PersianUtils.toPersian(c.reqLevel)}</span>`}
        </div>
      `;
    }).join('');

    document.getElementById('achievementsList').innerHTML = ACHIEVEMENTS.map(a => {
      const claimed = this.game.state.claimedAchievements.includes(a.id);
      const met = isAchievementMet(a, this.game.state);
      return `
        <div class="ach-card-item">
          <div>
            <h4 style="font-size:0.85rem;">${a.title}</h4>
            <p style="font-size:0.7rem; color:#94a3b8;">${a.desc}</p>
            <span style="font-size:0.68rem; color:#fbbf24;">پاداش: +${PersianUtils.formatNumber(a.rewardCoins)} سکه، +${PersianUtils.toPersian(a.rewardGems)} الماس</span>
          </div>
          ${claimed ? '<span class="status-on">دریافت‌شده ✅</span>' : met ? `
            <button class="shop-buy-btn" onclick="game.claimAchievement('${a.id}')">دریافت 🎁</button>
          ` : `
            <span style="font-size:0.7rem; color:#ef4444; background:rgba(239,68,68,0.12); padding:4px 8px; border-radius:6px;">قفل 🔒 (تکمیل نشده)</span>
          `}
        </div>
      `;
    }).join('');
  }

  renderDailyQuests() {
    document.getElementById('dailyQuestsList').innerHTML = this.game.state.dailyQuests.map(q => `
      <div class="ach-card-item" style="margin-bottom:6px;">
        <div>
          <h4 style="font-size:0.82rem;">${q.title}</h4>
          <p style="font-size:0.68rem; color:#94a3b8;">پیشرفت: ${PersianUtils.toPersian(q.current)} / ${PersianUtils.toPersian(q.req)}</p>
        </div>
        ${q.claimed ? '<span class="status-on">تکمیل شد</span>' : `
          <button class="shop-buy-btn" ${q.current >= q.req ? '' : 'disabled style="opacity:0.5"'} onclick="game.claimDailyQuest('${q.id}')">
            دریافت پاداش
          </button>
        `}
      </div>
    `).join('');
  }

  renderDailyStreakGrid() {
    const grid = document.getElementById('dailyStreakGrid');
    if (!grid) return;

    const claimedToday = this.hasClaimedToday(this.game.state);
    const currentStreak = this.game.state.dailyStreakDay || 1;

    const rewardsList = [
      { day: 1, coins: 200, gems: 0, icon: '🪙' },
      { day: 2, coins: 500, gems: 5, icon: '💎' },
      { day: 3, coins: 1000, gems: 10, icon: '🎁' },
      { day: 4, coins: 2500, gems: 20, icon: '⚡' },
      { day: 5, coins: 5000, gems: 35, icon: '🔥' },
      { day: 6, coins: 10000, gems: 50, icon: '✨' },
      { day: 7, coins: 25000, gems: 100, icon: '🏆' }
    ];

    let html = '<div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin:12px 0;">';
    for (let r of rewardsList) {
      const isPast = r.day < currentStreak;
      const isCurrent = r.day === currentStreak;

      let borderStyle = isCurrent ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)';
      let bgStyle = isCurrent ? 'rgba(245,158,11,0.2)' : isPast ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.8)';

      html += `
        <div style="background:${bgStyle}; border:${borderStyle}; padding:6px 2px; border-radius:8px; text-align:center; font-size:0.65rem; position:relative;">
          <div style="font-weight:700;">روز ${PersianUtils.toPersian(r.day)}</div>
          <div style="font-size:1rem; margin:2px 0;">${isPast ? '✅' : r.icon}</div>
          <div style="color:#fbbf24; font-size:0.6rem;">+${PersianUtils.formatNumber(r.coins)}</div>
          ${r.gems > 0 ? `<div style="color:#60a5fa; font-size:0.58rem;">+${PersianUtils.toPersian(r.gems)} 💎</div>` : ''}
        </div>
      `;
    }
    html += '</div>';

    if (claimedToday) {
      html += '<p style="font-size:0.75rem; color:#ef4444; text-align:center; margin-top:6px;">⏳ پاداش امروز دریافت شد. برای روز بعدی فردا (۲۴ ساعت دیگر) سر بزنید.</p>';
    } else {
      html += '<p style="font-size:0.75rem; color:#10b981; text-align:center; margin-top:6px;">🎁 پاداش امروز آماده دریافت است!</p>';
    }

    grid.innerHTML = html;

    const claimBtn = document.getElementById('claimDailyBtn');
    if (claimBtn) {
      if (claimedToday) {
        claimBtn.disabled = true;
        claimBtn.style.opacity = '0.5';
        claimBtn.textContent = 'امروز دریافت شد (۲۴h) ⏳';
      } else {
        claimBtn.disabled = false;
        claimBtn.style.opacity = '1';
        claimBtn.textContent = `دریافت پاداش روز ${PersianUtils.toPersian(currentStreak)} 🎁`;
      }
    }
  }

  spawnFloatingText(text, type = 'coin') {
    const container = document.getElementById('floatingTextContainer');
    if (!container) return;

    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = `${40 + Math.random() * 20}%`;
    el.style.top = `${40 + Math.random() * 20}%`;
    el.style.fontSize = '1.1rem';
    el.style.fontWeight = '900';
    el.style.color = type === 'perfect' ? '#fbbf24' : type === 'xp' ? '#38bdf8' : '#10b981';
    el.style.textShadow = '0 0 8px rgba(0,0,0,0.8)';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 0.8s cubic-bezier(0,0,0.2,1)';

    container.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = 'translateY(-50px) scale(1.2)';
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 800);
  }

  downloadCertificateImage() {
    this.showToast('تصویر گواهی با موفقیت ذخیره شد 📜');
  }

  showToast(msg) {
    const toast = document.getElementById('toastNotification');
    if (toast) {
      toast.textContent = msg;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2500);
    }
  }

  showModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  hideModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }
}

// --- ۸. هسته اصلی مدیریت بازی (Game Engine) ---
class Game {
  constructor() {
    this.saveKey = 'my_gym_game_save_v3';
    this.state = new GameState();
    this.sound = new SoundEngine();
    this.photoManager = new CharacterRenderer();
    this.characterRenderer = this.photoManager;
    this.adService = new AdService(this);
    this.ui = new UIManager(this);

    this.rhythmPos = 0;
    this.rhythmDir = 1;
    this.lastTickTime = Date.now();

    this.loadGame();
    this.startLoop();
  }

  selectExercise(id) {
    const ex = WORKOUT_TYPES.find(w => w.id === id);
    if (!ex) return;

    if (this.state.level < ex.reqLevel) {
      this.ui.showToast(`سطح مورد نیاز برای ${ex.name}: ${PersianUtils.toPersian(ex.reqLevel)}`);
      return;
    }

    this.state.activeExercise = id;
    this.ui.showToast(`حرکت انتخاب شد: ${ex.name} ${ex.icon}`);
    this.saveGame();
    this.ui.update(this.state);
  }

  performWorkout() {
    const ex = WORKOUT_TYPES.find(w => w.id === this.state.activeExercise) || WORKOUT_TYPES[0];

    if (this.state.energy < ex.energyCost) {
      this.ui.showToast('انرژی کافی ندارید! کمی صبر کنید تا انرژی شارژ شود ⚡');
      this.sound.playWorkoutSound(this.state.soundEnabled);
      return;
    }

    this.state.energy -= ex.energyCost;
    this.state.reps += 1;

    // ارزیابی Rhythm Perfect Rep
    const isPerfect = this.rhythmPos >= 40 && this.rhythmPos <= 60;
    let multiplier = 1;

    if (isPerfect) {
      multiplier = 2;
      this.state.combo += 1;
      this.state.perfectReps += 1;
      this.sound.playPerfectSound(this.state.soundEnabled);
      this.ui.spawnFloatingText('PERFECT! 🔥', 'perfect');
      const feedbackEl = document.getElementById('rhythmFeedback');
      if (feedbackEl) feedbackEl.textContent = 'عالی! (PERFECT) 🔥';
    } else {
      this.state.combo = 0;
      this.sound.playWorkoutSound(this.state.soundEnabled);
      const feedbackEl = document.getElementById('rhythmFeedback');
      if (feedbackEl) feedbackEl.textContent = 'خوب 👍';
    }

    // محاسبه پاداش سکه و XP
    const dbItem = SHOP_ITEMS.find(i => i.id === this.state.equippedDumbbell);
    const dbPower = dbItem ? dbItem.powerBonus : 1;

    const gymMultiplier = GYM_TIERS[this.state.gymTierIndex].coinMultiplier;
    const comboMultiplier = 1 + (this.state.combo * 0.1);

    const coinGain = Math.floor(ex.coinGain * dbPower * gymMultiplier * multiplier * comboMultiplier);
    const xpGain = Math.floor(ex.xpGain * multiplier * comboMultiplier);
    const powerGain = Math.floor(ex.powerGain * dbPower);

    this.state.coins += coinGain;
    this.state.xp += xpGain;
    this.state.power += powerGain;

    // افزایش آمار عضلانی
    if (ex.target && this.state[ex.target] !== undefined) {
      this.state[ex.target] += Math.floor(ex.statGain * multiplier);
    }
    this.state.strength += 1;

    // چالش‌های روزانه
    const q1 = this.state.dailyQuests.find(q => q.id === 'q1');
    if (q1) q1.current += 1;
    const q3 = this.state.dailyQuests.find(q => q.id === 'q3');
    if (q3 && isPerfect) q3.current += 1;

    this.photoManager.triggerFlexAnimation();
    this.ui.spawnFloatingText(`+${PersianUtils.toPersian(coinGain)} سکه 💰`, 'coin');
    setTimeout(() => this.ui.spawnFloatingText(`+${PersianUtils.toPersian(xpGain)} XP ⭐`, 'xp'), 150);

    this.checkLevelUp();
    this.ui.update(this.state);
  }

  redeemSecretCode() {
    const inputEl = document.getElementById('secretCodeInput');
    if (!inputEl) return;
    const rawCode = inputEl.value.trim().toLowerCase().replace(/\s+/g, ' ');
    const codeClean = rawCode.replace(/\s+/g, '');

    if (!rawCode) {
      this.ui.showToast('لطفاً کد را وارد کنید! ⚠️');
      return;
    }

    // ۱. بررسی کدهای اختصاصی محصولات ویژه (۳۰+ محصول)
    if (typeof PREMIUM_PRODUCT_LIST !== 'undefined' && Array.isArray(PREMIUM_PRODUCT_LIST)) {
      const matchedProduct = PREMIUM_PRODUCT_LIST.find(p => 
        p.codes && p.codes.some(c => c.toLowerCase() === rawCode || c.toLowerCase() === codeClean)
      );

      if (matchedProduct) {
        if (!this.state.redeemedCodes) this.state.redeemedCodes = [];
        
        const codeUsed = this.state.redeemedCodes.some(c => c.toLowerCase() === rawCode || c.toLowerCase() === codeClean);
        if (codeUsed || this.state.ownedItems.includes(matchedProduct.id)) {
          this.ui.showToast('این کد یا محصول قبلاً فعال و دریافت شده است! ⚠️');
          return;
        }

        this.state.redeemedCodes.push(rawCode);
        if (!this.state.ownedItems.includes(matchedProduct.id)) {
          this.state.ownedItems.push(matchedProduct.id);
        }

        // تجهیز خودکار بر اساس دسته‌بندی
        if (matchedProduct.category === 'outfit') this.state.equippedOutfit = matchedProduct.id;
        else if (matchedProduct.category === 'hair') this.state.equippedHair = matchedProduct.id;
        else if (matchedProduct.category === 'shoes_gloves') this.state.equippedShoes = matchedProduct.id;
        else if (matchedProduct.category === 'aura_effect') this.state.equippedAura = matchedProduct.id;

        // پاداش سکه و الماس اگر داشته باشد
        if (matchedProduct.coinsReward) this.state.coins += matchedProduct.coinsReward;
        if (matchedProduct.gemsReward) this.state.gems += matchedProduct.gemsReward;

        inputEl.value = '';
        this.sound.playVictorySound(this.state.soundEnabled);

        this.ui.showCongratulationsModal(
          `🎁 محصول «${matchedProduct.name}» فعال شد!`,
          `تبریک! کد فعالسازی با موفقیت تأیید شد و محصول ویژه «${matchedProduct.name}» در کمد شما قرار گرفت.\n\n${matchedProduct.desc}`,
          matchedProduct.icon,
          'مشاهده در کمد من 👕',
          () => {
            this.ui.switchShopSubTab('inventory');
          }
        );

        this.saveGame();
        this.ui.update(this.state);
        return;
      }
    }

    if (rawCode === 'arsam 1396' || rawCode === 'arsam1396') {
      const isRedeemedInState = this.state.redeemedCodes && this.state.redeemedCodes.includes('arsam1396');
      const isRedeemedInStorage = localStorage.getItem('promo_arsam1396_redeemed') === 'true';

      if (isRedeemedInState || isRedeemedInStorage) {
        this.ui.showToast('این کد جایزه قبلاً استفاده شده است و هر کد فقط ۱ بار قابل استفاده می‌باشد! ⚠️');
        return;
      }

      if (!this.state.redeemedCodes) this.state.redeemedCodes = [];
      this.state.redeemedCodes.push('arsam1396');
      try {
        localStorage.setItem('promo_arsam1396_redeemed', 'true');
      } catch (e) {}

      const coinsBonus = 5000000;
      const gemsBonus = 2000;
      const powerBonus = 10000;
      const xpBonus = 10000;

      this.state.coins += coinsBonus;
      this.state.gems += gemsBonus;
      this.state.power += powerBonus;
      this.state.xp += xpBonus;
      this.state.energy = this.state.maxEnergy;

      inputEl.value = '';
      this.sound.playVictorySound(this.state.soundEnabled);

      this.ui.showCongratulationsModal(
        '🎁 جایزه ویژه فعال شد!',
        `تبریک! کد رازآلود «arsam 1396» با موفقیت فعال گردید!\n\n💰 +۵,۰۰۰,۰۰۰ سکه\n💎 +۲,۰۰۰ الماس\n⚡ +۱۰,۰۰۰ قدرت\n⭐ +۱۰,۰۰۰ تجربه`,
        '🎁',
        'دریافت جوایز 🎉'
      );

      this.checkLevelUp();
      this.saveGame();
      this.ui.update(this.state);
    } else if (rawCode === 'amirabbas 8831' || rawCode === 'amirabbas8831') {
      const isRedeemedInState = this.state.redeemedCodes && this.state.redeemedCodes.includes('amirabbas8831');
      const isRedeemedInStorage = localStorage.getItem('promo_amirabbas8831_redeemed') === 'true';

      if (isRedeemedInState || isRedeemedInStorage) {
        this.ui.showToast('این کد ویژه قبلاً استفاده شده است! ⚠️');
        return;
      }

      if (!this.state.redeemedCodes) this.state.redeemedCodes = [];
      this.state.redeemedCodes.push('amirabbas8831');
      try {
        localStorage.setItem('promo_amirabbas8831_redeemed', 'true');
      } catch (e) {}

      // ارتقای کامل تمامی بخش‌های بازی به آخرین خط (Max Out)
      this.state.level = 100;
      this.state.xp = 0;
      this.state.maxXp = 100000;
      this.state.coins = 999999999;
      this.state.gems = 999999;
      this.state.power = 1000000;
      this.state.energy = 1000;
      this.state.maxEnergy = 1000;

      this.state.strength = 100;
      this.state.chest = 100;
      this.state.arms = 100;
      this.state.shoulders = 100;
      this.state.legs = 100;
      this.state.back = 100;
      this.state.stamina = 100;

      this.state.reps = 100000;
      this.state.combo = 100;
      this.state.perfectReps = 10000;
      this.state.chestsOpened = 100;
      this.state.tournamentsPlayed = 100;
      this.state.tournamentsWon = 100;
      this.state.gymTierIndex = 3;
      this.state.prestigeCount = 10;

      if (typeof SHOP_ITEMS !== 'undefined') {
        SHOP_ITEMS.forEach(item => {
          if (!this.state.ownedItems.includes(item.id)) {
            this.state.ownedItems.push(item.id);
          }
        });
      }

      if (typeof MEDALS !== 'undefined') {
        MEDALS.forEach(m => {
          if (!this.state.unlockedMedals.includes(m.id)) {
            this.state.unlockedMedals.push(m.id);
          }
        });
      }

      if (typeof CERTIFICATES !== 'undefined') {
        CERTIFICATES.forEach(c => {
          if (!this.state.unlockedCertificates.includes(c.id)) {
            this.state.unlockedCertificates.push(c.id);
          }
        });
      }

      if (typeof ACHIEVEMENTS !== 'undefined') {
        ACHIEVEMENTS.forEach(a => {
          if (!this.state.claimedAchievements.includes(a.id)) {
            this.state.claimedAchievements.push(a.id);
          }
        });
      }

      this.state.equippedDumbbell = 'db_7';
      this.state.equippedOutfit = 'of_5';

      inputEl.value = '';
      this.sound.playVictorySound(this.state.soundEnabled);

      this.ui.showCongratulationsModal(
        '👑 کد اسطوره فعال شد!',
        `تبریک! با کد رازآلود «amirabbas 8831» تمام قابلیت‌ها، آیتم‌ها، مدال‌ها، گواهی‌ها و دارایی‌های بازی به آخرین حد (ماکزیمم) ارتقا یافتند!\n\n🌟 سطح ۱۰۰ (تایتان افسانه‌ای)\n💰 ۹۹۹,۹۹۹,۹۹۹ سکه\n💎 ۹۹۹,۹۹۹ الماس\n⚡ ۱,۰۰۰,۰۰۰ قدرت\n🏆 تمام جوایز و تجهیزات فول باز شدند!`,
        '👑',
        'ممنون 🎉'
      );

      this.saveGame();
      this.ui.update(this.state);
    } else if (rawCode === 'aval1234' || rawCode === 'aval 1234') {
      const isRedeemedInState = this.state.redeemedCodes && this.state.redeemedCodes.includes('aval1234');
      const isRedeemedInStorage = localStorage.getItem('promo_aval1234_redeemed') === 'true';

      if (isRedeemedInState || isRedeemedInStorage) {
        this.ui.showToast('این کد جایزه قبلاً استفاده شده است! ⚠️');
        return;
      }

      if (!this.state.redeemedCodes) this.state.redeemedCodes = [];
      this.state.redeemedCodes.push('aval1234');
      try {
        localStorage.setItem('promo_aval1234_redeemed', 'true');
      } catch (e) {}

      // جوایز کد aval1234
      const coinsBonus = 1000000;
      const gemsBonus = 10;
      const xpBonus = 1000;

      this.state.coins += coinsBonus;
      this.state.gems += gemsBonus;
      this.state.xp += xpBonus;

      if (!this.state.unlockedMedals.includes('med_supporter')) {
        this.state.unlockedMedals.push('med_supporter');
      }

      inputEl.value = '';
      this.sound.playVictorySound(this.state.soundEnabled);

      // انیمیشن آنلاک مدال ویژه حامی
      this.ui.showModal('specialMedalUnlockModal');

      this.checkLevelUp();
      this.saveGame();
      this.ui.update(this.state);
    } else {
      this.ui.showToast('کد وارد شده نامعتبر یا اشتباه است! ❌');
    }
  }

  checkLevelUp() {
    let leveledUp = false;
    while (this.state.xp >= this.state.maxXp) {
      this.state.xp -= this.state.maxXp;
      this.state.level += 1;
      leveledUp = true;
      
      // منحنی پیشرفت سخت‌تر و استاندارد
      this.state.maxXp = Math.floor(50 * Math.pow(this.state.level, 1.35));
      this.state.maxEnergy += 5;
      this.state.energy = this.state.maxEnergy;

      const coinReward = this.state.level * 200;
      const gemReward = 5;
      this.state.coins += coinReward;
      this.state.gems += gemReward;

      // بررسی گواهی‌های جدید و نمایش پیام تبریک ویژه
      CERTIFICATES.forEach(c => {
        if (this.state.level >= c.reqLevel && !this.state.unlockedCertificates.includes(c.id)) {
          this.state.unlockedCertificates.push(c.id);
          this.ui.showToast(`گواهی جدید باز شد: ${c.title} 📜`);
          this.ui.showCongratulationsModal(
            '📜 دریافت گواهی افتخار جدید!',
            `تبریک فراوان! شما به سطح ${PersianUtils.toPersian(c.reqLevel)} رسیدید و موفق به دریافت گواهینامه رسمی «${c.title}» گردیدید! 🎉\n\nمی‌توانید این حکم رسمی را در بخش افتخارات مشاهده فرمایید.`,
            '🎓',
            'مشاهده گواهینامه 📜',
            () => {
              this.viewCertificate(c.id);
            }
          );
        }
      });
    }

    if (leveledUp) {
      if (this.sound) this.sound.playVictorySound(this.state.soundEnabled);
      this.ui.showToast(`ارتقاء سطح! شما به لول ${PersianUtils.toPersian(this.state.level)} رسیدید! 🎉`);
      this.saveGame();
    }
  }

  startTournament(tourId) {
    const t = TOURNAMENTS.find(x => x.id === tourId);
    if (!t) return;

    if (this.state.level < t.reqLevel) {
      this.ui.showToast(`سطح مورد نیاز: ${PersianUtils.toPersian(t.reqLevel)}`);
      return;
    }

    this.activeBattle = {
      tour: t,
      playerScore: 50,
      timer: 10
    };

    document.getElementById('battleTitle').textContent = t.title;
    document.getElementById('playerBattleName').textContent = this.state.playerName;
    document.getElementById('playerBattlePower').textContent = `قدرت: ${PersianUtils.formatNumber(this.state.power)}`;
    document.getElementById('opponentBattleName').textContent = t.opponentName;
    document.getElementById('opponentBattlePower').textContent = `قدرت: ${PersianUtils.formatNumber(t.opponentPower)}`;

    const tapBtn = document.getElementById('tapBattleBtn');
    tapBtn.onclick = () => {
      const tapPower = 8 + Math.min(20, Math.floor(this.state.power / t.opponentPower * 6));
      this.activeBattle.playerScore = Math.min(100, this.activeBattle.playerScore + tapPower);
      document.getElementById('battleProgressFill').style.width = `${this.activeBattle.playerScore}%`;
    };

    this.ui.showModal('battleModal');

    const battleInterval = setInterval(() => {
      if (!this.activeBattle) {
        clearInterval(battleInterval);
        return;
      }

      this.activeBattle.timer -= 0.5;
      this.activeBattle.playerScore = Math.max(0, this.activeBattle.playerScore - 3.5);
      document.getElementById('battleProgressFill').style.width = `${this.activeBattle.playerScore}%`;
      document.getElementById('battleTimerText').textContent = `زمان باقی‌مانده: ${PersianUtils.toPersian(Math.ceil(this.activeBattle.timer))} ثانیه`;

      if (this.activeBattle.timer <= 0) {
        clearInterval(battleInterval);
        this.finishBattle();
      }
    }, 500);
  }

  finishBattle() {
    this.ui.hideModal('battleModal');
    const t = this.activeBattle.tour;

    this.state.tournamentsPlayed += 1;

    if (this.activeBattle.playerScore >= 50) {
      this.state.tournamentsWon += 1;
      this.state.coins += t.rewardCoins;
      this.state.xp += t.rewardXp;
      this.state.gems += t.rewardGems;

      if (!this.state.unlockedMedals.includes(t.rewardMedal)) {
        this.state.unlockedMedals.push(t.rewardMedal);
        const medalObj = MEDALS.find(m => m.id === t.rewardMedal);
        const medalName = medalObj ? medalObj.title : 'مدال افتخار';
        setTimeout(() => {
          this.ui.showCongratulationsModal(
            '🥇 کسب مدال قهرمانی جدید!',
            `افتخار جدید! شما با غلبه بر ${t.opponentName} موفق به کسب مدال رسمی «${medalName}» گردیدید! 🎉`,
            '🏅'
          );
        }, 800);
      }

      const q2 = this.state.dailyQuests.find(q => q.id === 'q2');
      if (q2) q2.current = 1;

      this.sound.playVictorySound(this.state.soundEnabled);

      document.getElementById('victoryMessage').textContent = `شما پیروز شدید! ${t.opponentName} شکست خورد.`;
      document.getElementById('victoryRewardsList').innerHTML = `
        <div>+${PersianUtils.formatNumber(t.rewardCoins)} سکه 💰</div>
        <div>+${PersianUtils.toPersian(t.rewardGems)} الماس 💎</div>
        <div>+${PersianUtils.formatNumber(t.rewardXp)} تجربه ⭐</div>
      `;
      this.ui.showModal('victoryModal');
    } else {
      this.ui.showModal('defeatModal');
    }

    this.activeBattle = null;
    this.checkLevelUp();
    this.saveGame();
    this.ui.update(this.state);
  }

  buyItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (this.state.coins >= item.priceCoins && this.state.gems >= item.priceGems) {
      this.state.coins -= item.priceCoins;
      this.state.gems -= item.priceGems;
      this.state.ownedItems.push(itemId);

      if (item.category === 'dumbbell') this.state.equippedDumbbell = itemId;
      if (item.category === 'outfit') this.state.equippedOutfit = itemId;

      this.sound.playCoinSound(this.state.soundEnabled);
      this.ui.showToast(`${item.name} خریداری شد 🎉`);
      this.saveGame();
      this.ui.update(this.state);
    } else {
      this.ui.showToast('سکه یا الماس کافی ندارید!');
    }
  }

  equipItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (item.category === 'dumbbell') this.state.equippedDumbbell = itemId;
    if (item.category === 'outfit') this.state.equippedOutfit = itemId;

    this.ui.showToast('آیتم مجهز شد 💪');
    this.saveGame();
    this.ui.update(this.state);
  }

  upgradeGymTier() {
    const nextGym = GYM_TIERS[this.state.gymTierIndex + 1];
    if (!nextGym) return;

    if (this.state.level < nextGym.levelReq) {
      this.ui.showToast(`سطح مورد نیاز برای ارتقای محیط: ${PersianUtils.toPersian(nextGym.levelReq)}`);
      return;
    }

    if (this.state.coins >= nextGym.priceCoins) {
      this.state.coins -= nextGym.priceCoins;
      this.state.gymTierIndex += 1;
      this.sound.playVictorySound(this.state.soundEnabled);
      this.ui.showToast(`محیط باشگاه ارتقا یافت به: ${nextGym.title} 🏢`);
      this.saveGame();
      this.ui.update(this.state);
    } else {
      this.ui.showToast('سکه کافی ندارید!');
    }
  }

  viewCertificate(certId) {
    const c = CERTIFICATES.find(x => x.id === certId);
    if (!c) return;

    document.getElementById('certRecipientName').textContent = this.state.playerName;
    document.getElementById('certTitleBadge').textContent = c.title;
    document.getElementById('certIssueDate').textContent = PersianUtils.getPersianDate();

    this.ui.showModal('certificateViewModal');
  }

  claimAchievement(achId) {
    const a = ACHIEVEMENTS.find(x => x.id === achId);
    if (!a || this.state.claimedAchievements.includes(achId)) return;

    if (!isAchievementMet(a, this.state)) {
      this.ui.showToast('هنوز شرایط این دستاورد را کسب نکرده‌اید! ❌');
      return;
    }

    this.state.claimedAchievements.push(achId);
    this.state.coins += a.rewardCoins;
    this.state.gems += a.rewardGems;

    this.sound.playCoinSound(this.state.soundEnabled);
    this.ui.showToast(`دستاورد دریافت شد: +${PersianUtils.formatNumber(a.rewardCoins)} سکه 🎉`);
    this.saveGame();
    this.ui.update(this.state);
  }

  claimDailyQuest(qId) {
    const q = this.state.dailyQuests.find(x => x.id === qId);
    if (!q || q.claimed || q.current < q.req) return;

    q.claimed = true;
    this.state.coins += q.rewardCoins;
    this.ui.showToast(`پاداش چالش دریافت شد: +${PersianUtils.formatNumber(q.rewardCoins)} سکه 💰`);
    this.saveGame();
    this.ui.update(this.state);
  }

  claimDailyReward() {
    if (this.ui.hasClaimedToday(this.state)) {
      this.ui.showToast('پاداش امروز دریافت شده است! فردا دوباره سر بزنید ⏳');
      return;
    }

    const currentStreak = this.state.dailyStreakDay || 1;
    const rewardsMap = [
      { coins: 200, gems: 0 },
      { coins: 500, gems: 5 },
      { coins: 1000, gems: 10 },
      { coins: 2500, gems: 20 },
      { coins: 5000, gems: 35 },
      { coins: 10000, gems: 50 },
      { coins: 25000, gems: 100 }
    ];

    const reward = rewardsMap[currentStreak - 1] || rewardsMap[0];
    this.state.coins += reward.coins;
    this.state.gems += reward.gems;

    this.state.lastDailyClaimTimestamp = Date.now();
    this.state.dailyStreakDay = (currentStreak % 7) + 1;

    this.sound.playCoinSound(this.state.soundEnabled);
    this.ui.showToast(`پاداش روز ${PersianUtils.toPersian(currentStreak)} دریافت شد: +${PersianUtils.formatNumber(reward.coins)} سکه و +${PersianUtils.toPersian(reward.gems)} الماس 🎉`);
    this.ui.hideModal('dailyModal');
    this.saveGame();
    this.ui.update(this.state);
  }

  watchAd(rewardType) {
    this.adService.showRewardedAd(rewardType);
  }

  triggerPrestige() {
    if (this.state.level < 25) {
      this.ui.showToast('برای بازگشت قهرمان باید حداقل به سطح ۲۵ برسید!');
      return;
    }

    this.state.prestigeCount += 1;
    this.state.level = 1;
    this.state.xp = 0;
    this.state.power = 20;
    this.state.coins += 5000;

    this.ui.showToast(`بازگشت قهرمان انجام شد! +۲۰٪ قدرت و پاداش دائمی دریافت شد 👑`);
    this.saveGame();
    this.ui.update(this.state);
  }

  // متدهای اختصاصی پنل مدیریت سازنده (Admin Controls)
  adminAddCoins(val) { this.state.coins += val; this.saveGame(); this.ui.update(this.state); }
  adminAddGems(val) { this.state.gems += val; this.saveGame(); this.ui.update(this.state); }
  adminAddXp(val) { this.state.xp += val; this.checkLevelUp(); this.saveGame(); this.ui.update(this.state); }
  adminLevelUp() { this.state.xp = this.state.maxXp; this.checkLevelUp(); }
  adminUnlockAllMedals() { this.state.unlockedMedals = MEDALS.map(m => m.id); this.saveGame(); this.ui.update(this.state); }
  adminUnlockAllCerts() { this.state.unlockedCertificates = CERTIFICATES.map(c => c.id); this.saveGame(); this.ui.update(this.state); }
  adminUnlockAllAchievements() { this.state.claimedAchievements = ACHIEVEMENTS.map(a => a.id); this.saveGame(); this.ui.update(this.state); }
  adminUnlockAllItems() { this.state.ownedItems = SHOP_ITEMS.map(i => i.id); this.saveGame(); this.ui.update(this.state); }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.ui.showToast(this.state.soundEnabled ? 'افکت صوتی فعال شد' : 'افکت صوتی غیرفعال شد');
    this.saveGame();
  }

  saveGame() {
    try {
      this.state.lastSaveTime = Date.now();
      localStorage.setItem(this.saveKey, JSON.stringify(this.state));
    } catch (e) {}
  }

  loadGame() {
    try {
      const saved = localStorage.getItem(this.saveKey);
      if (saved) {
        Object.assign(this.state, JSON.parse(saved));
        const diffSec = Math.floor((Date.now() - (this.state.lastSaveTime || Date.now())) / 1000);
        if (diffSec > 0) {
          this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + diffSec * 0.8);
        }
      }
    } catch (e) {}
  }

  resetGame() {
    localStorage.removeItem(this.saveKey);
    this.state.resetToDefaults();
    this.saveGame();
    this.ui.update(this.state);
  }

  startLoop() {
    const loop = () => {
      const now = Date.now();
      const delta = (now - this.lastTickTime) / 1000;
      this.lastTickTime = now;

      // بازیابی انرژی
      if (this.state.energy < this.state.maxEnergy) {
        this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + delta * 0.8);
        const energyText = document.getElementById('energyText');
        if (energyText) energyText.textContent = `${PersianUtils.toPersian(Math.floor(this.state.energy))} / ${PersianUtils.toPersian(this.state.maxEnergy)}`;
        const energyFill = document.getElementById('energyFill');
        if (energyFill) energyFill.style.width = `${(this.state.energy / this.state.maxEnergy) * 100}%`;
      }

      // حرکت گیج Perfect Rep
      this.rhythmPos += this.rhythmDir * 2;
      if (this.rhythmPos >= 100) { this.rhythmPos = 100; this.rhythmDir = -1; }
      if (this.rhythmPos <= 0) { this.rhythmPos = 0; this.rhythmDir = 1; }

      const indicator = document.getElementById('rhythmIndicator');
      if (indicator) indicator.style.left = `${this.rhythmPos}%`;

      this.photoManager.update(this.state);
      requestAnimationFrame(loop);
    };

    setInterval(() => this.saveGame(), 3000);
    requestAnimationFrame(loop);
    this.ui.update(this.state);
  }
}

window.onShopPurchaseSuccess = (productId, rewardType, amount, title, message) => {
  if (game && game.ui) {
    game.ui.showToast(message || 'پرداخت با موفقیت انجام شد! 🎉');
  }
};

window.onShopRewardDelivered = (productId, rewardType, amount) => {
  if (!game || !game.state) return;

  if (productId === 'bundle_mega_pack' || rewardType === 'MEGA_PACK') {
    game.state.coins += 5000000;
    game.state.gems += 1000;
    game.state.xp += 10000;
    game.checkLevelUp();
    game.saveGame();
    if (game.ui) {
      game.ui.update(game.state);
      game.ui.showToast('🎉 بسته فوق‌العاده با موفقیت خریده شد! ۵,۰۰۰,۰۰۰ سکه + ۱,۰۰۰ الماس + ۱۰,۰۰۰ XP اضافه گردید.');
    }
    return;
  }

  if (rewardType === 'COIN') {
    game.state.coins += amount;
  } else if (rewardType === 'GEM') {
    game.state.gems += amount;
  } else if (rewardType === 'ENERGY') {
    game.state.energy = game.state.maxEnergy;
  } else if (rewardType === 'VIP') {
    game.state.coins += 10000;
    game.state.gems += 500;
    game.state.energy = game.state.maxEnergy;
    game.state.isVip = true;
  }
  game.saveGame();
  if (game.ui) {
    game.ui.update(game.state);
  }
};

window.onShopPurchaseError = (productId, errorMessage) => {
  if (game && game.ui) {
    game.ui.showToast(`خطا در پرداخت: ${errorMessage}`);
  }
};

window.onShopPurchaseCanceled = (productId) => {
  if (game && game.ui) {
    game.ui.showToast('فرآیند خرید لغو شد.');
  }
};

window.onShopBillingStatusChanged = (isAvailable, message) => {
  const statusText = document.getElementById('myketStatusText');
  const statusDot = document.getElementById('myketStatusDot');
  if (statusText) statusText.textContent = message;
  if (statusDot) {
    statusDot.style.background = isAvailable ? '#10b981' : '#f59e0b';
    statusDot.style.boxShadow = isAvailable ? '0 0 8px #10b981' : '0 0 8px #f59e0b';
  }
};

function buyMegaPack() {
  const sku = 'bundle_mega_pack';
  if (window.game && window.game.ui) {
    window.game.ui.showToast('در حال انتقال به درگاه پرداخت مایکت...');
  }
  
  if (window.AndroidBridge && typeof window.AndroidBridge.purchase === 'function') {
    window.AndroidBridge.purchase(sku);
  } else if (window.AndroidBridge && typeof window.AndroidBridge.requestPurchase === 'function') {
    window.AndroidBridge.requestPurchase(sku);
  } else if (window.AndroidShopBridge && typeof window.AndroidShopBridge.requestPurchase === 'function') {
    window.AndroidShopBridge.requestPurchase(sku);
  } else if (window.AndroidShop && typeof window.AndroidShop.requestPurchase === 'function') {
    window.AndroidShop.requestPurchase(sku);
  } else {
    // Web test simulation fallback
    setTimeout(() => {
      if (window.onShopPurchaseSuccess) {
        window.onShopPurchaseSuccess(sku, 'MEGA_PACK', 1, 'بسته فوق‌العاده', 'خرید موفقیت‌آمیز انجام شد.');
      }
      if (window.onShopRewardDelivered) {
        window.onShopRewardDelivered(sku, 'MEGA_PACK', 1);
      }
    }, 1000);
  }
}
window.buyMegaPack = buyMegaPack;

let game = null;
window.addEventListener('DOMContentLoaded', () => {
  game = new Game();
});
