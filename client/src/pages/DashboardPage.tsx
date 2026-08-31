import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Habit } from '../lib/types';
import { useAuthStore } from '../store/authStore';
import {
  format,
  isSameDay,
  eachDayOfInterval,
  subDays,
  startOfMonth,
  endOfMonth,
  addDays
} from 'date-fns';
import { cn } from '../lib/utils';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/habits');
      setHabits(data.habits || []);
    } catch {
      toast.error('Could not load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const today = new Date();

  const completedToday = useMemo(
    () => habits.filter((h) => h.logs.some((l) => l.completed && isSameDay(new Date(l.date), today))),
    [habits, today]
  );

  const streakMap = useMemo(() => {
    const out: Record<number, number> = {};
    habits.forEach((h) => {
      let streak = 0;
      let cursor = today;
      const dates = new Set(h.logs.filter((l) => l.completed).map((l) => format(new Date(l.date), 'yyyy-MM-dd')));
      for (let i = 0; i < 365; i++) {
        if (dates.has(format(cursor, 'yyyy-MM-dd'))) {
          streak++;
          cursor = subDays(cursor, 1);
        } else {
          break;
        }
      }
      out[h.id] = streak;
    });
    return out;
  }, [habits, today]);

  const completionByDay = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    return days.map((d) => {
      const dayStr = format(d, 'yyyy-MM-dd');
      let done = 0;
      habits.forEach((h) => {
        if (
          h.logs.some(
            (l) => l.completed && format(new Date(l.date), 'yyyy-MM-dd') === dayStr
          )
        ) {
          done++;
        }
      });
      return {
        date: d,
        done,
        total: habits.length,
        pct: habits.length ? Math.round((done / habits.length) * 100) : 0
      };
    });
  }, [habits, today]);

  const monthGrid = useMemo(() => {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const gridStart = subDays(start, (start.getDay() + 6) % 7);
    const gridEnd = addDays(end, (6 - ((end.getDay() + 6) % 7)));
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [today]);

  const completedCount = useMemo(
    () => (date: Date) => {
      const dayStr = format(date, 'yyyy-MM-dd');
      return habits.filter((h) =>
        h.logs.some((l) => l.completed && format(new Date(l.date), 'yyyy-MM-dd') === dayStr)
      ).length;
    },
    [habits]
  );

  const toggleHabit = async (habit: Habit) => {
    const completed = completedToday.some((h) => h.id === habit.id);
    try {
      await api.post(`/habits/${habit.id}/logs`, {
        date: today.toISOString(),
        completed: !completed
      });
      toast.success(completed ? 'Removed completion' : 'Nice! Keep it going 🎉');
      fetchHabits();
    } catch {
      toast.error('Could not update');
    }
  };

  const totalPossibleToday = habits.length;
  const pctToday = totalPossibleToday
    ? Math.round((completedToday.length / totalPossibleToday) * 100)
    : 0;

  if (loading) {
    return (
      <div className="text-slate-500 py-16 text-center">
        <div className="animate-pulse text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-slate-500">{format(today, 'EEEE, MMMM d, yyyy')}</p>
          <h1 className="text-3xl font-bold text-slate-900">
            Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            {user?.name?.split(' ')[0] || 'friend'} 👋
          </h1>
        </div>
        <Link to="/habits" className="btn-primary">
          Manage Habits →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="text-sm text-slate-500 font-medium">Today's Progress</div>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-4xl font-bold text-slate-900">{pctToday}%</div>
            <div className="text-sm text-slate-500 mb-1.5">
              {completedToday.length}/{totalPossibleToday} habits
            </div>
          </div>
          <div className="mt-4 w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all"
              style={{ width: `${pctToday}%` }}
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-slate-500 font-medium">Total Habits</div>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-4xl font-bold text-slate-900">{habits.length}</div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            {habits.length === 0
              ? 'No habits yet — create one to get started.'
              : completedToday.length === habits.length
              ? '🥳 All done for today!'
              : `${habits.length - completedToday.length} habits still to complete today.`}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-slate-500 font-medium">Best Streak</div>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-4xl font-bold text-slate-900">
              {Math.max(0, ...Object.values(streakMap))}
              <span className="text-2xl ml-1">🔥</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            {habits.length === 0
              ? 'Your future streak starts here.'
              : 'Keep the momentum going every day.'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Today's Habits</h2>
          {habits.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-slate-500">
                No habits yet.{' '}
                <Link to="/habits" className="text-brand-600 hover:underline">
                  Create your first habit
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {habits.map((h) => {
                const done = completedToday.some((c) => c.id === h.id);
                const streak = streakMap[h.id] || 0;
                return (
                  <li
                    key={h.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group',
                      done
                        ? 'bg-brand-50 border-brand-200'
                        : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'
                    )}
                    onClick={() => toggleHabit(h)}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${h.color}22`, color: h.color }}
                    >
                      {h.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          'font-medium truncate',
                          done ? 'text-brand-700 line-through opacity-80' : 'text-slate-800'
                        )}
                      >
                        {h.name}
                      </div>
                      {streak > 0 && (
                        <div className="text-xs text-slate-500">🔥 {streak} day streak</div>
                      )}
                    </div>
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-all',
                        done
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'border-slate-300 text-transparent group-hover:border-brand-400'
                      )}
                    >
                      ✓
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">This Week</h2>
          <div className="space-y-3">
            {completionByDay.map(({ date, done, total, pct }) => (
              <div key={date.toISOString()} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={cn(
                    'font-medium',
                    isSameDay(date, today) ? 'text-brand-700' : 'text-slate-500'
                  )}>
                    {format(date, 'EEE, MMM d')}
                    {isSameDay(date, today) && ' (Today)'}
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {done}/{total} · {pct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            {format(today, 'MMMM yyyy')} — Overview
          </h2>
          <div className="text-sm text-slate-500">
            Green = some habits done · Dark green = all habits done
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-xs">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-slate-400 font-medium py-1">
              {d}
            </div>
          ))}
          {monthGrid.map((d) => {
            const count = completedCount(d);
            const pct = habits.length ? count / habits.length : 0;
            const inMonth = d.getMonth() === today.getMonth();
            const isToday = isSameDay(d, today);
            return (
              <div
                key={d.toISOString()}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center font-medium transition-colors relative',
                  !inMonth && 'text-slate-300 bg-transparent',
                  inMonth && !pct && habits.length > 0 && 'bg-slate-100 text-slate-500',
                  inMonth && pct > 0 && pct < 1 && 'bg-emerald-200 text-emerald-800',
                  inMonth && pct === 1 && 'bg-emerald-600 text-white'
                )}
              >
                {format(d, 'd')}
                {isToday && (
                  <span className="absolute inset-0 rounded-lg ring-2 ring-brand-500 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
