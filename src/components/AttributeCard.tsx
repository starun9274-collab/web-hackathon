import React from 'react';
import { BookOpen, Dumbbell, CheckCircle2, Sparkles } from 'lucide-react';
import { AttributeType } from '../types/rpg';

interface AttributeCardProps {
  type: AttributeType;
  value: number;
}

const ATTRIBUTE_DETAILS: Record<
  AttributeType,
  {
    label: string;
    description: string;
    sourceCategory: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeBg: string;
    textColor: string;
  }
> = {
  intellect: {
    label: 'Intellect',
    description: 'Sharpens analytical problem solving & knowledge.',
    sourceCategory: 'Study quests',
    icon: BookOpen,
    accentColor: 'from-indigo-500 to-blue-500',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    textColor: 'text-indigo-400',
  },
  strength: {
    label: 'Strength',
    description: 'Physical resilience, fortitude & endurance.',
    sourceCategory: 'Exercise quests',
    icon: Dumbbell,
    accentColor: 'from-rose-500 to-red-500',
    badgeBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    textColor: 'text-rose-400',
  },
  discipline: {
    label: 'Discipline',
    description: 'Consistency, habit mastery & unwavering willpower.',
    sourceCategory: 'Habit quests',
    icon: CheckCircle2,
    accentColor: 'from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    textColor: 'text-emerald-400',
  },
  creativity: {
    label: 'Creativity',
    description: 'Visionary expression, design & inventive spark.',
    sourceCategory: 'Creative quests',
    icon: Sparkles,
    accentColor: 'from-amber-500 to-yellow-500',
    badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    textColor: 'text-amber-400',
  },
};

export const AttributeCard: React.FC<AttributeCardProps> = ({ type, value }) => {
  const meta = ATTRIBUTE_DETAILS[type];
  const Icon = meta.icon;

  return (
    <div
      id={`attribute-card-${type}`}
      className="rpg-card p-4 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${meta.badgeBg}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-slate-200">
              {meta.label}
            </h3>
            <span className="text-[11px] text-slate-400">
              via {meta.sourceCategory}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className={`font-mono-code text-2xl font-bold ${meta.textColor}`}>
            {value}
          </span>
          <p className="text-[10px] uppercase text-slate-400 tracking-wider">Rating</p>
        </div>
      </div>
    </div>
  );
};
