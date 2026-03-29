import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Coins, Zap, Heart, ArrowRight, RotateCcw, BookOpen, X } from 'lucide-react';

// --- Types ---
interface GameEvent {
  id: number;
  title: string;
  damage: number;
  insurance_type: string;
  insurance_cost: number;
  theory_base: string;
}

// Добавлен стейт PRE_STORY для предыстории сезона
type GameState = 'START' | 'THEORY' | 'SEASON_PICK' | 'PRE_STORY' | 'PLAYING' | 'SUMMARY';

const PRE_STORIES: Record<string, string> = {
  spring: "Прошло только 2 дня весны, а ты уже умудрился провалиться в лужу и испортить новые кроссы. Подумай: вот была бы страховка, не пришлось бы тратить свои карманные деньги на новые!",
  summer: "Прошло только 2 дня каникул, а ты уже случайно выронил телефон из кармана, прыгая с пирса. Эх, а ведь со страховкой можно было бы не переживать за ремонт...",
  autumn: "Началась учеба. В первый же день кто-то случайно сел на твой рюкзак в раздевалке. Планшет хрустнул. Со страховкой тебе бы сразу выплатили компенсацию.",
  winter: "Первый гололед. Ты эффектно поскользнулся по пути на каток и порвал новую куртку. Если бы ты подумал о защите заранее, бюджет бы не пострадал."
};

const App = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [balance, setBalance] = useState(20000);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<{ occured: boolean; insured: boolean } | null>(null);
  const [season, setSeason] = useState<string>('');
  const [showTheoryModal, setShowTheoryModal] = useState(false);

  const startSeasonSetup = async (s: string) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/events/${s.toLowerCase()}`);
      setEvents(res.data);
      setSeason(s);
      setGameState('PRE_STORY'); // Идем на экран предыстории сезона
      setCurrentIndex(0);
    } catch (error) {
      console.error("Ошибка загрузки данных с бэкенда:", error);
      alert("Бэкенд не отвечает! Убедись, что FastAPI запущен.");
    }
  };

  const handleAction = async (insured: boolean) => {
    let currentBalance = balance;
    if (insured) {
      currentBalance -= events[currentIndex].insurance_cost;
    }
    
    try {
      const res = await axios.post('http://localhost:8000/api/play', { has_insurance: insured });
      const isOccured = res.data.occured;
      
      if (isOccured && !insured) {
        currentBalance -= events[currentIndex].damage;
      }
      
      setBalance(currentBalance);
      setResult({ occured: isOccured, insured });
    } catch (error) {
      console.error("Ошибка при расчете события:", error);
    }
  };

  const nextStep = () => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setResult(null);
    } else {
      setGameState('SUMMARY');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-700 relative">
        
        {/* Header Stats */}
        {(gameState === 'PRE_STORY' || gameState === 'PLAYING') && (
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 border border-green-500/30">
              <Coins className="text-yellow-400" size={18} />
              <span className="font-bold text-green-400">{balance} ₽</span>
            </div>
            {gameState === 'PLAYING' && (
              <div className="flex gap-2">
                <button onClick={() => setShowTheoryModal(true)} className="bg-blue-500/20 text-blue-400 p-2 rounded-full hover:bg-blue-500/40 transition">
                  <BookOpen size={18} />
                </button>
                <div className="text-slate-400 text-sm font-medium bg-slate-900/80 px-3 py-1 rounded-full flex items-center">
                  Шаг {currentIndex + 1}/{events.length}
                </div>
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* 1. START SCREEN */}
          {gameState === 'START' && (
            <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 pt-16 text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                <Shield size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-black mb-4 leading-tight">Здарова! 👋</h1>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Тебе еще нет 18 лет, а ты решил задуматься о реально полезных вещах, таких как страховка. Мы тебе поможем разобраться, как не остаться с пустыми карманами!
              </p>
              <button onClick={() => setGameState('THEORY')} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20">
                Погнали!
              </button>
            </motion.div>
          )}

          {/* 2. THEORY SCREEN */}
          {gameState === 'THEORY' && (
            <motion.div key="theory" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-10 pt-20">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap className="text-yellow-400" /> Немного базы
              </h2>
              <div className="space-y-4 mb-8">
                <div className="bg-slate-700/50 p-4 rounded-2xl border-l-4 border-blue-500">
                  <p className="text-sm"><b>Страховка</b> — это договор. Ты платишь чуть-чуть сейчас, чтобы компания покрыла огромный ущерб потом.</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-2xl border-l-4 border-orange-500">
                  <p className="text-sm"><b>Риск</b> — вероятность того, что случится факап.</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-2xl border-l-4 border-green-500">
                  <p className="text-sm"><b>Страховая выплата</b> — бабки, которые тебе скидывают на ремонт или лечение, если случилась беда.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => setGameState('SEASON_PICK')} className="bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                   Окей, я в деле <ArrowRight size={20} />
                </button>
                <button onClick={() => setGameState('SEASON_PICK')} className="bg-transparent border border-slate-600 text-slate-400 py-4 rounded-2xl font-bold hover:bg-slate-800 transition">
                  Я и так умный и без теории разберусь
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. SEASON PICK */}
          {gameState === 'SEASON_PICK' && (
            <motion.div key="seasons" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-10 pt-20 text-center">
              <h2 className="text-xl font-bold mb-2">Выбирай время года</h2>
              <p className="text-slate-400 text-sm mb-6">Вот тебе родители дали на сезон деньги, и у тебя есть 20 000 рублей. Попробуй их сохранить!</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'spring', label: 'Весна', icon: '🌿' },
                  { id: 'summer', label: 'Лето', icon: '☀️' },
                  { id: 'autumn', label: 'Осень', icon: '🍂' },
                  { id: 'winter', label: 'Зима', icon: '❄️' }
                ].map(s => (
                  <button key={s.id} onClick={() => startSeasonSetup(s.id)} className="bg-slate-700/50 hover:bg-slate-600 p-6 rounded-3xl transition-all border border-slate-600 group">
                    <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">{s.icon}</span>
                    <span className="font-bold">{s.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 4. PRE_STORY (Маленькая история перед игрой) */}
          {gameState === 'PRE_STORY' && (
            <motion.div key="prestory" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 pt-24">
              <div className="bg-blue-900/40 border border-blue-500/30 p-6 rounded-3xl mb-8 shadow-inner">
                <h3 className="text-lg font-bold mb-4 text-blue-300">Начало сезона...</h3>
                <p className="text-slate-200 leading-relaxed">
                  {PRE_STORIES[season] || "Начался новый сезон. Готов к приключениям?"}
                </p>
              </div>
              <button onClick={() => setGameState('PLAYING')} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20">
                Перейти к ситуациям <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* 5. PLAYING CARD */}
          {gameState === 'PLAYING' && events[currentIndex] && (
            <motion.div key={currentIndex} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 pt-24 min-h-[500px] flex flex-col">
              {!result ? (
                <>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black mb-4 leading-tight">{events[currentIndex].title}</h3>
                    <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-xl inline-block font-bold text-sm mb-6 border border-red-500/20">
                      Риск потерять: -{events[currentIndex].damage} ₽
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => handleAction(true)} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                      <Shield size={20} /> Купить страховку ({events[currentIndex].insurance_cost} ₽)
                    </button>
                    <button onClick={() => handleAction(false)} className="w-full bg-slate-700 hover:bg-slate-600 py-4 rounded-2xl font-bold text-slate-300">
                      Надеяться на удачу 🎲
                    </button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className={`text-5xl mb-4 ${result.occured && !result.insured ? 'text-red-500' : 'text-green-500'}`}>
                      {result.occured ? (result.insured ? '😎' : '💀') : '🍀'}
                    </div>
                    <h4 className="text-xl font-bold mb-2">
                      {result.occured 
                        ? (result.insured ? "Травма/поломка случилась, но ты красава!" : "Ой-ой, это фиаско...") 
                        : "Ничего не произошло, ты молодец, что подумал о будущем!"}
                    </h4>
                    <p className="text-slate-400 mb-6 italic text-sm">
                      {result.occured && result.insured && `Ты получил компенсацию! Страховка покрыла все расходы на восстановление. Твоя выгода составила ${events[currentIndex].damage - events[currentIndex].insurance_cost} ₽.`}
                      {result.occured && !result.insured && `У тебя нет страховки, и теперь тебе нужно думать над тем, что ты потратишь свои средства на решение проблемы (-${events[currentIndex].damage} ₽).`}
                      {!result.occured && result.insured && "Страховка не пригодилась сейчас, но зато ты был спокоен!"}
                      {!result.occured && !result.insured && "В этот раз повезло. Но удача не вечна."}
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-2">
                        <Zap size={14} /> Умный блок
                      </div>
                      <p className="text-sm text-blue-100 leading-relaxed">{events[currentIndex].theory_base}</p>
                    </div>
                  </div>
                  <button onClick={nextStep} className="mt-6 w-full bg-white text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                    Дальше <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* 6. SUMMARY SCREEN */}
          {gameState === 'SUMMARY' && (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 pt-20 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Heart size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-black mb-2">Месяц пережит!</h2>
              <p className="text-slate-400 mb-8">Вот что осталось от твоих 20 000 ₽:</p>
              <div className={`text-5xl font-black mb-10 tracking-tighter ${balance > 10000 ? 'text-green-400' : 'text-red-400'}`}>
                {balance} ₽
              </div>
              <button onClick={() => { setGameState('START'); setBalance(20000); }} className="w-full bg-slate-700 hover:bg-slate-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                <RotateCcw size={20} /> Пройти еще раз
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL: "Понудить и почитать теорию" */}
        <AnimatePresence>
          {showTheoryModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm p-6 flex flex-col justify-center"
            >
              <div className="bg-slate-800 border border-slate-600 p-6 rounded-3xl relative">
                <button onClick={() => setShowTheoryModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
                <h3 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                  <BookOpen /> Душнила-мод 🤓
                </h3>
                <div className="space-y-4 text-sm text-slate-300">
                  <p><b>Франшиза</b> — это часть ущерба, которую страховая НЕ оплачивает. Например, ремонт стоит 5000, франшиза 1000. Тебе дадут 4000. В нашей игре её нет для простоты.</p>
                  <p><b>Страховая премия</b> — это те самые деньги, которые ты платишь за саму страховку (например, 500 ₽ за полис).</p>
                  <p><b>Страховая сумма</b> — максималка, которую тебе заплатят, если вещь уничтожена в ноль.</p>
                </div>
                <button onClick={() => setShowTheoryModal(false)} className="mt-6 w-full bg-blue-600 py-3 rounded-xl font-bold">
                  Понял, возвращаемся к игре
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-green-600/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default App;