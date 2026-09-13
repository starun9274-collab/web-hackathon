import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  Sword,
  Flame,
  Trophy,
  Award,
  BookOpen,
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  Lock,
  Play,
  Star,
  ChevronDown,
  ChevronUp,
  Compass,
  RefreshCw,
  Layers,
  Eye,
  Crown,
  ScrollText,
} from 'lucide-react';
import { QuestCategory, AttributeType } from '../types/rpg';
import { CATEGORY_CONFIG, getXpRequiredForNextLevel } from '../utils/rpgFormulas';

interface LandingPageProps {
  onStartGuest: () => void;
  onOpenAuth: (isSignUp?: boolean) => void;
}

interface DemoQuest {
  id: string;
  title: string;
  category: QuestCategory;
  completed: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGuest,
  onOpenAuth,
}) => {
  // --- Feature 1: Interactive Live Quest Forge & Level-Up Simulator State ---
  const [demoLevel, setDemoLevel] = useState(1);
  const [demoCurrentXP, setDemoCurrentXP] = useState(45);
  const [demoCoins, setDemoCoins] = useState(60);
  const [demoStreak, setDemoStreak] = useState(3);
  const [demoAttributes, setDemoAttributes] = useState({
    intellect: 12,
    strength: 10,
    discipline: 14,
    creativity: 11,
  });
  const [demoQuests, setDemoQuests] = useState<DemoQuest[]>([
    {
      id: 'demo-1',
      title: 'Study 30 pages of System Design Codex',
      category: 'Study',
      completed: false,
    },
    {
      id: 'demo-2',
      title: 'Complete 40 pushups & 5km interval run',
      category: 'Exercise',
      completed: false,
    },
    {
      id: 'demo-3',
      title: '15-minute morning mindfulness & meditation',
      category: 'Habit',
      completed: false,
    },
    {
      id: 'demo-4',
      title: 'Compose 500 words of creative writing',
      category: 'Creative',
      completed: false,
    },
  ]);
  const [customTitle, setCustomTitle] = useState('');
  const [customCat, setCustomCat] = useState<QuestCategory>('Study');
  const [levelUpAlert, setLevelUpAlert] = useState<string | null>(null);
  const [lastGain, setLastGain] = useState<{ xp: number; coins: number; attr: string } | null>(null);

  // --- Feature 2: Interactive Attribute Matrix State ---
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType>('intellect');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const xpTarget = getXpRequiredForNextLevel(demoLevel);
  const xpPercent = Math.min(100, Math.round((demoCurrentXP / xpTarget) * 100));

  const handleCompleteDemoQuest = (id: string) => {
    const target = demoQuests.find((q) => q.id === id);
    if (!target || target.completed) return;

    const config = CATEGORY_CONFIG[target.category];
    const earnedXP = config.xp;
    const earnedCoins = config.coins;
    const attr = config.attribute;

    let nextXP = demoCurrentXP + earnedXP;
    let nextLevel = demoLevel;
    let leveled = false;

    while (nextXP >= getXpRequiredForNextLevel(nextLevel)) {
      nextXP -= getXpRequiredForNextLevel(nextLevel);
      nextLevel += 1;
      leveled = true;
    }

    setDemoCurrentXP(nextXP);
    setDemoLevel(nextLevel);
    setDemoCoins((c) => c + earnedCoins);
    setDemoStreak((s) => s + 1);
    setDemoAttributes((prev) => ({
      ...prev,
      [attr]: prev[attr] + 1,
    }));

    setDemoQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, completed: true } : q))
    );

    setLastGain({ xp: earnedXP, coins: earnedCoins, attr });
    setTimeout(() => setLastGain(null), 3500);

    if (leveled) {
      setLevelUpAlert(`LEVEL UP! You ascended to Level ${nextLevel}!`);
      setTimeout(() => setLevelUpAlert(null), 4000);
    }
  };

  const handleAddCustomDemoQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    const newQ: DemoQuest = {
      id: 'demo-custom-' + Date.now(),
      title: customTitle.trim(),
      category: customCat,
      completed: false,
    };
    setDemoQuests((prev) => [newQ, ...prev]);
    setCustomTitle('');
  };

  const handleResetSimulator = () => {
    setDemoLevel(1);
    setDemoCurrentXP(45);
    setDemoCoins(60);
    setDemoStreak(3);
    setDemoAttributes({
      intellect: 12,
      strength: 10,
      discipline: 14,
      creativity: 11,
    });
    setDemoQuests([
      {
        id: 'demo-1',
        title: 'Study 30 pages of System Design Codex',
        category: 'Study',
        completed: false,
      },
      {
        id: 'demo-2',
        title: 'Complete 40 pushups & 5km interval run',
        category: 'Exercise',
        completed: false,
      },
      {
        id: 'demo-3',
        title: '15-minute morning mindfulness & meditation',
        category: 'Habit',
        completed: false,
      },
      {
        id: 'demo-4',
        title: 'Compose 500 words of creative writing',
        category: 'Creative',
        completed: false,
      },
    ]);
    setLevelUpAlert(null);
  };

  // Attribute Matrix details
  const attributeDetails: Record<
    AttributeType,
    {
      name: string;
      icon: typeof BookOpen;
      color: string;
      borderColor: string;
      bgColor: string;
      desc: string;
      rankTitles: string[];
      questExamples: string[];
      perk: string;
    }
  > = {
    intellect: {
      name: 'Intellect',
      icon: BookOpen,
      color: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      bgColor: 'bg-indigo-500/10',
      desc: 'Governs analytical cognition, continuous learning, coding, and problem solving.',
      rankTitles: ['Scholar Initiate (1-15)', 'Lorekeeper (16-30)', 'Archmage of Reason (31+)'],
      questExamples: ['Algorithm exercises', 'Language immersion', 'Scientific literature reading'],
      perk: '+15% bonus comprehension efficiency and deep focus endurance.',
    },
    strength: {
      name: 'Strength',
      icon: Dumbbell,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      bgColor: 'bg-rose-500/10',
      desc: 'Forges bodily vitality, endurance, resistance to fatigue, and physical constitution.',
      rankTitles: ['Iron Apprentice (1-15)', 'Vanguard Guardian (16-30)', 'Titan of Vitality (31+)'],
      questExamples: ['Resistance training', 'HIIT cardio sprints', 'Posture correction drills'],
      perk: '+20% stamina recovery and daily physical energy reserve.',
    },
    discipline: {
      name: 'Discipline',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      desc: 'The bedrock of habit persistence, routine adherence, and unbreakable streak armor.',
      rankTitles: ['Sentinel of Habits (1-15)', 'Warden of Will (16-30)', 'Sovereign of Resolve (31+)'],
      questExamples: ['Early morning waking', 'Consistent hydration (2L)', 'Evening reflection log'],
      perk: 'Unlocks streak preservation shields and anti-slump habit forgiveness.',
    },
    creativity: {
      name: 'Creativity',
      icon: Sparkles,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
      desc: 'Fuels innovative thinking, expressive writing, design mastery, and lateral synthesis.',
      rankTitles: ['Artisan Weaver (1-15)', 'Master Visionary (16-30)', 'Cosmic Architect (31+)'],
      questExamples: ['UI design prototyping', 'Music production drill', 'Worldbuilding fiction draft'],
      perk: 'Unlocks custom cosmetic forge recipes and rare guild insignia themes.',
    },
  };

  const faqs = [
    {
      q: 'Do I have to sign up to use Life RPG?',
      a: 'Not at all! You can click "Start Playing as Guest" right now. Your character progression, quests, attributes, and inventory are saved locally in your browser so you can start immediately with zero friction.',
    },
    {
      q: 'Can I sync my progress to the cloud later?',
      a: 'Yes! Whenever you want to back up your hero across devices, click "Sign In / Sync" to link with Firebase Cloud Firestore. Your adventures and stats will be securely stored in the cloud.',
    },
    {
      q: 'How does the non-linear leveling formula work?',
      a: 'Life RPG uses the polynomial curve XP = 100 × (Level)^1.5. Early levels feel fast and motivating, while higher tiers represent true mastery and dedication.',
    },
    {
      q: 'Is Life RPG completely free?',
      a: 'Yes, 100% free and open. There are no paywalls, hidden microtransactions, or locked core mechanics.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 translate-x-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[160px] pointer-events-none" />

      {/* Sticky Header / Navigation */}
      <header
        id="landing-header"
        className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white block leading-tight">
                LIFE RPG
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold block">
                Ascension Realm
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#simulator" className="hover:text-amber-400 transition-colors">
              Live Quest Forge
            </a>
            <a href="#attributes" className="hover:text-amber-400 transition-colors">
              4-Pillar Matrix
            </a>
            <a href="#features" className="hover:text-amber-400 transition-colors">
              RPG Systems
            </a>
            <a href="#armory" className="hover:text-amber-400 transition-colors">
              Armory
            </a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              id="header-sign-in-btn"
              onClick={() => onOpenAuth(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              id="header-instant-play-btn"
              onClick={onStartGuest}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm shadow-amber-500/20 transition-all cursor-pointer font-sans"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Instant Play</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ===================== HERO SECTION ===================== */}
        <section
          id="hero"
          className="relative px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 text-center max-w-5xl mx-auto"
        >
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Zero-Sign-Up Instant Quest Engine Active</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
            Gamify Your Life. <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Level Up in Reality.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Turn ordinary study sessions, workouts, and daily habits into epic RPG quests.
            Earn XP, ascend 4 core attributes, maintain unstoppable streaks, and forge real discipline.
          </p>

          {/* Primary Call-to-Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              id="hero-play-free-btn"
              onClick={onStartGuest}
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sword className="h-4 w-4" />
              <span>Enter the Realm (Play Free — No Sign-Up)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#simulator"
              id="hero-try-sim-btn"
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 font-semibold text-sm transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Try Live Simulator Below</span>
            </a>
          </div>

          {/* Value Props Bar */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="rpg-card p-3.5 border-white/5 bg-slate-900/40">
              <div className="text-amber-400 font-display font-bold text-lg">4 Pillars</div>
              <div className="text-xs text-slate-400 mt-0.5">Intellect, Strength, Discipline, Creativity</div>
            </div>
            <div className="rpg-card p-3.5 border-white/5 bg-slate-900/40">
              <div className="text-amber-400 font-display font-bold text-lg">Non-Linear</div>
              <div className="text-xs text-slate-400 mt-0.5">Polynomial XP progression curve (Level^1.5)</div>
            </div>
            <div className="rpg-card p-3.5 border-white/5 bg-slate-900/40">
              <div className="text-amber-400 font-display font-bold text-lg">Streak Armor</div>
              <div className="text-xs text-slate-400 mt-0.5">Anti-slump daily habit tracking & streak buffs</div>
            </div>
            <div className="rpg-card p-3.5 border-white/5 bg-slate-900/40">
              <div className="text-amber-400 font-display font-bold text-lg">Instant Play</div>
              <div className="text-xs text-slate-400 mt-0.5">Zero mandatory registration to get started</div>
            </div>
          </div>
        </section>

        {/* ===================== FEATURE 1: INTERACTIVE LIVE QUEST FORGE & LEVEL-UP SIMULATOR ===================== */}
        <section
          id="simulator"
          className="py-16 sm:py-24 border-y border-white/5 bg-slate-950/40 relative overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3 border border-amber-500/20">
                <Target className="h-3.5 w-3.5" />
                <span>Feature Showcase 1</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Interactive Quest Forge & Live Level Simulator
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Experience how Life RPG turns real actions into RPG progression right here.
                Click to complete quests and watch your live XP, coins, attributes, and rank ascend!
              </p>
            </div>

            {/* Simulator Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Live Character Status Card */}
              <div className="lg:col-span-5 rpg-card p-6 sm:p-7 border-amber-500/20 bg-slate-900/80 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 font-display font-bold text-xl border border-amber-500/30">
                      {demoLevel}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-base">
                          Novice Adventurer
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                          Simulator Active
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">Rank: Initiate • Level {demoLevel}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetSimulator}
                    title="Reset Simulator"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Level Up Notification Banner */}
                {levelUpAlert && (
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2 animate-bounce">
                    <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{levelUpAlert}</span>
                  </div>
                )}

                {/* Last Gain Toast */}
                {lastGain && (
                  <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>+{lastGain.xp} XP • +{lastGain.coins} Gold • +1 {lastGain.attr.toUpperCase()}</span>
                  </div>
                )}

                {/* XP Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">Level Progression</span>
                    <span className="text-amber-400 font-mono">
                      {demoCurrentXP} / {xpTarget} XP ({xpPercent}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-950 p-0.5 border border-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 shadow-sm shadow-amber-500/50"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Live Stats Row */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/40 border border-white/5 p-3 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Realm Gold</div>
                      <div className="text-sm font-bold text-white font-mono">{demoCoins} Gold</div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-black/40 border border-white/5 p-3 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                      <Flame className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Habit Streak</div>
                      <div className="text-sm font-bold text-white font-mono">{demoStreak} Days</div>
                    </div>
                  </div>
                </div>

                {/* Attributes Mini-Pillars */}
                <div className="mt-5 pt-4 border-t border-white/5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Ascended Attributes
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" /> Intellect
                      </span>
                      <span className="font-mono font-bold text-white">{demoAttributes.intellect}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      <span className="flex items-center gap-1.5">
                        <Dumbbell className="h-3.5 w-3.5" /> Strength
                      </span>
                      <span className="font-mono font-bold text-white">{demoAttributes.strength}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Discipline
                      </span>
                      <span className="font-mono font-bold text-white">{demoAttributes.discipline}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Creativity
                      </span>
                      <span className="font-mono font-bold text-white">{demoAttributes.creativity}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                  <button
                    type="button"
                    onClick={onStartGuest}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <span>Play Full Version as Guest Hero</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Quests to Complete & Custom Quest Forge */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-amber-400" />
                    <span>Interactive Quest Board</span>
                  </h3>
                  <span className="text-xs text-slate-400">Click any quest to complete it</span>
                </div>

                {/* Quests List */}
                <div className="space-y-2.5">
                  {demoQuests.map((q) => {
                    const cfg = CATEGORY_CONFIG[q.category];
                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          q.completed
                            ? 'bg-slate-900/30 border-white/5 opacity-60'
                            : 'bg-slate-900/80 border-white/10 hover:border-amber-500/40 hover:bg-slate-900 shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleCompleteDemoQuest(q.id)}
                            disabled={q.completed}
                            className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              q.completed
                                ? 'bg-emerald-500 text-slate-950'
                                : 'border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 text-amber-400'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                q.completed ? 'line-through text-slate-500' : 'text-slate-100'
                              }`}
                            >
                              {q.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${cfg.color}`}
                              >
                                {q.category}
                              </span>
                              <span className="text-[11px] text-amber-400/80 font-mono">
                                +{cfg.xp} XP • +{cfg.coins} Gold
                              </span>
                            </div>
                          </div>
                        </div>

                        {q.completed ? (
                          <span className="text-xs text-emerald-400 font-semibold shrink-0">
                            Claimed ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCompleteDemoQuest(q.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-colors shrink-0 cursor-pointer"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom Quest Forge Input */}
                <form
                  onSubmit={handleAddCustomDemoQuest}
                  className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3"
                >
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Forge a Custom Real-World Task:</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Read Chapter 5 of Psychology book"
                      className="flex-1 rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                    <select
                      value={customCat}
                      onChange={(e) => setCustomCat(e.target.value as QuestCategory)}
                      className="rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="Study">Study (Intellect)</option>
                      <option value="Exercise">Exercise (Strength)</option>
                      <option value="Habit">Habit (Discipline)</option>
                      <option value="Creative">Creative (Creativity)</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Forge Quest
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FEATURE 2: 4-PILLAR ATTRIBUTE MATRIX & REWARD ARMORY ===================== */}
        <section
          id="attributes"
          className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3 border border-indigo-500/20">
              <Layers className="h-3.5 w-3.5" />
              <span>Feature Showcase 2</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              The 4-Pillar Attribute Matrix & Armory
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Your real actions develop 4 fundamental dimensions of personal power.
              Select an attribute to inspect its rank progression, real-world examples, and unlocked perks.
            </p>
          </div>

          {/* 4 Pillars Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {(['intellect', 'strength', 'discipline', 'creativity'] as AttributeType[]).map((attr) => {
              const info = attributeDetails[attr];
              const Icon = info.icon;
              const isSel = selectedAttribute === attr;
              return (
                <button
                  key={attr}
                  type="button"
                  onClick={() => setSelectedAttribute(attr)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSel
                      ? `${info.borderColor} ${info.bgColor} shadow-lg shadow-amber-500/5`
                      : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${info.color}`} />
                  <div className="font-display font-bold text-sm text-white">{info.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Click to view ranks & perks</div>
                </button>
              );
            })}
          </div>

          {/* Selected Attribute In-Depth Breakdown */}
          {(() => {
            const current = attributeDetails[selectedAttribute];
            const CurIcon = current.icon;
            return (
              <div className="rpg-card p-6 sm:p-8 border-white/10 bg-slate-900/70 mb-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-xl ${current.bgColor} ${current.borderColor} border`}>
                      <CurIcon className={`h-6 w-6 ${current.color}`} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">
                        {current.name} Mastery Codex
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">{current.desc}</p>
                    </div>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-amber-400 self-start md:self-auto">
                    {current.perk}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Rank Tiers */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Ascension Titles
                    </h4>
                    <div className="space-y-2">
                      {current.rankTitles.map((tier, idx) => (
                        <div
                          key={tier}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs text-slate-300"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span>{tier}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real World Tasks */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Real-World Training Quests
                    </h4>
                    <div className="space-y-2">
                      {current.questExamples.map((ex) => (
                        <div
                          key={ex}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Virtual Armory Preview */}
          <div id="armory" className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-400" />
                  <span>The Guild Reward Armory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Spend your hard-earned gold coins on prestige themes, badges, and tangible rewards.
                </p>
              </div>
              <button
                type="button"
                onClick={onStartGuest}
                className="hidden sm:flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rpg-card p-5 border-white/5 bg-slate-900/60 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Theme
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">120 Gold</span>
                </div>
                <h4 className="font-display font-bold text-sm text-white">Obsidian Dragon Theme</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Deep onyx card gradients with radiant golden dragon border embers.
                </p>
              </div>

              <div className="rpg-card p-5 border-white/5 bg-slate-900/60 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Badge
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">80 Gold</span>
                </div>
                <h4 className="font-display font-bold text-sm text-white">Warden of Discipline</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Bestowed on heroes who maintain a 7+ day consecutive habit streak.
                </p>
              </div>

              <div className="rpg-card p-5 border-white/5 bg-slate-900/60 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Accessory
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">150 Gold</span>
                </div>
                <h4 className="font-display font-bold text-sm text-white">Chronos Hourglass</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  A mystical timepiece honoring master of time allocation and deep focus.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== CORE ARCHITECTURE / PHILOSOPHY ===================== */}
        <section id="features" className="py-16 sm:py-24 border-t border-white/5 bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
                Why Life RPG Actually Works
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Traditional to-do apps feel like chores. Life RPG is mathematically calibrated to trigger genuine behavioral momentum.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rpg-card p-6 border-white/5 bg-slate-900/50">
                <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white mb-2">
                  Immediate Neurochemical Feedback
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Checking off a task immediately yields XP, attribute increments, and celebratory audio-visual rewards, anchoring daily effort to positive reinforcement.
                </p>
              </div>

              <div className="rpg-card p-6 border-white/5 bg-slate-900/50">
                <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white mb-2">
                  Holistic Self-Balancing
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  By mapping actions across Intellect, Strength, Discipline, and Creativity, the attribute radar immediately highlights if your life is tipping out of equilibrium.
                </p>
              </div>

              <div className="rpg-card p-6 border-white/5 bg-slate-900/50">
                <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white mb-2">
                  Zero Lock-In & Cloud Privacy
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Play completely offline with client-side localStorage, or sync securely via Google Cloud Firestore with row-level security rules.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FAQ ACCORDION (SEO OPTIMIZED) ===================== */}
        <section id="faq" className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Everything you need to know about embarking on your Life RPG journey.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={f.q}
                  className="rounded-xl border border-white/5 bg-slate-900/50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{f.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ===================== CALL TO ACTION BANNER ===================== */}
        <section className="py-16 px-4 text-center max-w-4xl mx-auto">
          <div className="rpg-card p-8 sm:p-12 border-amber-500/30 bg-gradient-to-b from-slate-900 to-amber-950/20 shadow-2xl relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Sword className="h-7 w-7" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Your Real-Life Quest Awaits
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto">
              Start leveling up today. No credit cards, no mandatory sign-up walls. Just pure personal mastery.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                id="cta-start-journey-btn"
                onClick={onStartGuest}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Launch Free Character</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                id="cta-sign-in-btn"
                onClick={() => onOpenAuth(false)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold text-sm transition-all cursor-pointer"
              >
                Sign In / Sync Firebase
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-display font-semibold">
            <Shield className="h-4 w-4 text-amber-400" />
            <span>LIFE RPG REALM</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#simulator" className="hover:text-slate-300 transition-colors">
              Quest Forge
            </a>
            <a href="#attributes" className="hover:text-slate-300 transition-colors">
              Attributes
            </a>
            <a href="#armory" className="hover:text-slate-300 transition-colors">
              Armory
            </a>
            <a href="#faq" className="hover:text-slate-300 transition-colors">
              FAQ
            </a>
          </div>
          <div>© {new Date().getFullYear()} Life RPG. Built for real-world personal mastery.</div>
        </div>
      </footer>
    </div>
  );
};
