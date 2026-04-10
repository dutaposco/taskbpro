import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Flag, Trash2, Save, Loader2, Calendar, Tag, User, Layers } from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const LABELS     = ['Bug', 'Feature', 'Improvement', 'Design', 'Backend', 'Frontend', 'Testing', 'Docs'];
const STATUSES   = [
  { id: 'todo',       label: 'To Do' },
  { id: 'inprogress', label: 'In Progress' },
  { id: 'review',     label: 'Review' },
  { id: 'done',       label: 'Done' },
];
const PRIO_STYLE = { 
  low:      { color: '#10b981', bg: '#ecfdf5', border: '#10b981' }, 
  medium:   { color: '#3b82f6', bg: '#eff6ff', border: '#3b82f6' }, 
  high:     { color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b' }, 
  critical: { color: '#ef4444', bg: '#fef2f2', border: '#ef4444' } 
};

const EMPTY = { title: '', description: '', status: 'todo', priority: 'medium', label: '', assignee_id: '', due_date: '' };

export default function TaskModal({ task, members, projectId, onSave, onDelete, onClose }) {
  const isEditing = !!task?.id;
  const [form,    setForm]    = useState(EMPTY);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (task) setForm({ ...EMPTY, ...task, id: task.id });
  }, [task]);

  const set = field => val =>
    setForm(p => ({ ...p, [field]: val?.target ? val.target.value : val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await onSave({ ...form, project_id: projectId });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (confirm) { await onDelete(task.id); }
    else { setConfirm(true); setTimeout(() => setConfirm(false), 3000); }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[300] p-4 lg:p-0"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-text-main">{isEditing ? 'Task Details' : 'Create New Task'}</h2>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">
              {isEditing ? `Task #${task.id?.slice(0, 6)}` : 'Set up your task requirements'}
            </p>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-border text-text-secondary hover:text-red-500 hover:border-red-100 transition-all shadow-sm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <Tag size={12} /> Task Title
            </label>
            <input
              autoFocus type="text" placeholder="What needs to be done?"
              value={form.title} onChange={set('title')}
              className={`w-full text-lg font-bold px-0 py-2 border-b-2 bg-transparent outline-none transition-all ${errors.title ? 'border-red-500 placeholder-red-200' : 'border-slate-100 focus:border-accent'}`}
            />
            {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Description</label>
            <textarea
              placeholder="Add more details about this task..."
              value={form.description} onChange={set('description')}
              className="w-full px-5 py-4 bg-slate-50 border border-border rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent-soft/50 transition-all resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Layers size={12} /> Status
              </label>
              <select 
                value={form.status} 
                onChange={set('status')} 
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm font-bold text-text-main outline-none focus:border-accent transition-all cursor-pointer"
              >
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Due Date
              </label>
              <input 
                type="date" 
                value={form.due_date} 
                onChange={set('due_date')} 
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm font-bold text-text-main outline-none focus:border-accent transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Priority Level</label>
            <div className="flex gap-3">
              {PRIORITIES.map(p => {
                const active = form.priority === p;
                const style = PRIO_STYLE[p];
                return (
                  <button
                    key={p}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-xs font-bold transition-all ${active ? 'shadow-sm' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:border-slate-100'}`}
                    style={active ? { background: style.bg, borderColor: style.border, color: style.color } : {}}
                    onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                  >
                    <Flag size={12} fill={active ? style.color : 'transparent'} />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label Selector */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Category Labels</label>
            <div className="flex flex-wrap gap-2">
              {LABELS.map(l => {
                const active = form.label === l;
                return (
                  <button
                    key={l}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${active ? 'bg-accent text-white border-accent shadow-md shadow-accent/20' : 'bg-white border-border text-slate-500 hover:bg-slate-50'}`}
                    onClick={() => setForm(prev => ({ ...prev, label: prev.label === l ? '' : l }))}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

        {/* Assignee */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Assigned Member
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${!form.assignee_id ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' : 'bg-white border-border text-slate-400 hover:bg-slate-50'}`}
                onClick={() => setForm(p => ({ ...p, assignee_id: '' }))}
              >
                Unassigned
              </button>
              {members.map(m => {
                const active = form.assignee_id === m.id;
                const initials = m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
                return (
                  <button
                    key={m.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? 'bg-white border-accent text-accent shadow-md shadow-accent/10 ring-2 ring-accent/10' : 'bg-white border-border text-slate-500 hover:bg-slate-50'}`}
                    onClick={() => setForm(p => ({ ...p, assignee_id: m.id }))}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] text-white shadow-sm" style={{ background: m.avatar_color || '#6366f1' }}>{initials}</div>
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* History */}
          {task?.history && task.history.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-border">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Task History
              </label>
              <div className="space-y-3">
                {task.history.map((h, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="flex flex-col items-center">
                       <div className="w-2.5 h-2.5 bg-accent rounded-full mt-1.5 shadow-sm shadow-accent/40" />
                       {i !== task.history.length - 1 && <div className="w-[2px] h-full bg-slate-100 my-1 rounded-full" />}
                     </div>
                     <div className="pb-2">
                       <p className="text-sm font-bold text-text-main">{h.action}</p>
                       <p className="text-xs font-medium text-text-muted mt-0.5">{new Date(h.date).toLocaleString('id-ID')}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            {isEditing && (
              <button 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${confirm ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`} 
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                <span>{confirm ? 'Confirm Delete?' : 'Delete Task'}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-text-main transition-colors" onClick={onClose}>Discard</button>
            <button 
              className="flex items-center gap-2 px-8 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/25 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{saving ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
