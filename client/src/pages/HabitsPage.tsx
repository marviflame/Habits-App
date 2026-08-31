import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import type { Habit, HabitLog } from '../lib/types';
import { useAuthStore } from '../store/authStore';
import { startOfWeek, format, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const HABIT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Green', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' }
];

const HABIT_ICONS = ['⭐', '💧', '🏃', '📚', '🧘', '💪', '😴', '🍎', '✍️', '🎯'];

interface HabitFormData {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  color: string;
  icon: string;
}

export default function HabitsPage() {
  const user = useAuthStore((s) => s.user);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<HabitFormData>({
    name: '',
    description: '',
    frequency: 'daily',
    color: HABIT_COLORS[0].value,
    icon: HABIT_ICONS[0]
  });

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/habits');
      setHabits(data.habits || []);
    } catch (e) {
      console.error(e);
      toast.error('Could not load habits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'daily',
      color: HABIT_COLORS[0].value,
      icon: HABIT_ICONS[0]
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (h: Habit) => {
    setEditingId(h.id);
    setFormData({
      name: h.name,
      description: h.description ?? '',
      frequency: h.frequency,
      color: h.color,
      icon: h.icon
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/habits/${editingId}`, formData);
        toast.success('Habit updated');
      } else {
        await api.post('/habits', formData);
        toast.success('Habit created');
      }
      setShowModal(false);
      resetForm();
      fetchHabits();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Something went wrong');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this habit? This cannot be undone.')) return;
    try {
      await api.delete(`/habits/${id}`);
      toast.success('Habit deleted');
      fetchHabits();
    } catch {
      toast.error('Could not delete habit');
    }
  };

  const toggleHabit = async (habit: Habit, date: Date) => {
    const today = new Date();
    const completed = isCompletedOn(habit, date);
    try {
      await api.post(`/habits/${habit.id}/logs`, {
        date: date.toISOString(),
        completed: !completed
      });
      toast.success(completed ? 'Marked as not done' : 'Marked as done! 🎉');
      fetchHabits();
    } catch {
      toast.error('Could not update habit');
    }
    const _today = today; // avoid unused warn
    void _today;
  };

  const isCompletedOn = (habit: Habit, date: Date): boolean => {
    return habit.logs.some((l) => l.completed && isSameDay(new Date(l.date), date));
  };

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: subDays(start, -6) });
  }, []);

  const totalDoneToday = useMemo(() => {
    const today = new Date();
    return habits.filter((h) => isCompletedOn(h, today)).length;
  }, [habits, weekDays]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Habits</h1>
          <p className="text-slate-500 mt-1">
            {user ? `${user.name}'s habits · ` : ''}
            {habits.length} total · {totalDoneToday} done today
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <span>+</span> New Habit
        </button>
      </div>

      {loading && <div className="text-slate-500 py-8 text-center">Loading your habits...</div>}

      {!loading && habits.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No habits yet</h2>
          <p className="text-slate-500 mb-6">Create your first habit to start tracking progress.</p>
          <button onClick={openCreate} className="btn-primary">
            Create first habit
          </button>
        </div>
      )}

      {!loading && habits.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Habit</th>
                  {weekDays.map((d) => (
                    <th
                      key={d.toISOString()}
                      className="px-3 py-3 text-center font-semibold text-slate-700"
                    >
                      <div className="text-xs uppercase">{format(d, 'EEE')}</div>
                      <div className="text-lg">{format(d, 'd')}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {habits.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex items-center justify-center w-11 h-11 rounded-xl text-2xl shrink-0'
                          )}
                          style={{ backgroundColor: `${h.color}22`, color: h.color }}
                        >
                          {h.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 truncate">{h.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="badge bg-slate-100 text-slate-700 capitalize">
                              {h.frequency}
                            </span>
                            {h.description && (
                              <span className="truncate">{h.description}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((d) => {
                      const done = isCompletedOn(h, d);
                      const isFuture = d > new Date();
                      return (
                        <td key={d.toISOString()} className="px-3 py-4 text-center">
                          <button
                            onClick={() => !isFuture && toggleHabit(h, d)}
                            disabled={isFuture}
                            className={cn(
                              'w-10 h-10 rounded-lg transition-all flex items-center justify-center',
                              done
                                ? 'text-white shadow-sm'
                                : isFuture
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-pointer'
                            )}
                            style={done ? { backgroundColor: h.color } : undefined}
                            aria-label={done ? 'Mark not done' : 'Mark done'}
                          >
                            {done ? '✓' : isFuture ? '·' : ''}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(h)} className="btn-ghost text-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="btn-ghost text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm text-slate-500">
        Want a visual dashboard instead?{' '}
        <Link to="/" className="text-brand-600 hover:underline">
          Go to Dashboard →
        </Link>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Drink 8 glasses of water"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Small reminder for yourself"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Frequency</label>
                <select
                  className="input"
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value as HabitFormData['frequency']
                    })
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="label">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: ic })}
                      className={cn(
                        'w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-all',
                        formData.icon === ic
                          ? 'border-brand-500 bg-brand-50 shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Color</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={cn(
                        'w-10 h-10 rounded-lg border-2 transition-all',
                        formData.color === c.value ? 'border-slate-900 scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c.value }}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Save changes' : 'Create habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
