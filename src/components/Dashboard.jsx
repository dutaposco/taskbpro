import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, AlertCircle, TrendingUp, Users } from 'lucide-react';

const STATUS_COLOR = {
  todo:       '#64748b',
  inprogress: '#6366f1',
  review:     '#f59e0b',
  done:       '#10b981',
};

const PRIO_COLOR = {
  low: '#10b981', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444'
};

export default function Dashboard({ tasks, members, projects }) {
  const total      = tasks.length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const inprogress = tasks.filter(t => t.status === 'inprogress').length;
  const overdue    = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
  const pct        = total ? Math.round((done / total) * 100) : 0;

  const statuses = ['todo', 'inprogress', 'review', 'done'];
  const prioList  = ['critical', 'high', 'medium', 'low'];

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}j lalu`;
    return `${Math.floor(hrs / 24)}h lalu`;
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tasks',   value: total,      sub: `${projects.length} project`,   icon: <Circle size={20}/>,       color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Selesai',       value: done,       sub: `${pct}% selesai`,              icon: <CheckCircle2 size={20}/>, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
          { label: 'In Progress',   value: inprogress, sub: 'Sedang dikerjakan',            icon: <TrendingUp size={20}/>,   color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Overdue',       value: overdue,    sub: 'Melewati deadline',            icon: <AlertCircle size={20}/>,  color: '#ef4444', bg: 'rgba(239,68,68,0.15)'  },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex flex-col">
              <p className="text-sm font-bold text-text-muted mb-1">{s.label}</p>
              <p className="text-3xl font-extrabold mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-semibold text-text-secondary">{s.sub}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex flex-col">
          <p className="text-lg font-extrabold text-text-main mb-6">Status Distribution</p>
          <div className="flex flex-col gap-5">
            {statuses.map(s => {
              const count = tasks.filter(t => t.status === s).length;
              const pct   = total ? Math.round((count / total) * 100) : 0;
              const labels = { todo: 'To Do', inprogress: 'In Progress', review: 'Review', done: 'Done' };
              return (
                <div key={s} className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span style={{ color: STATUS_COLOR[s] }}>{labels[s]}</span>
                    <span className="text-text-muted">{count} tasks · {pct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: STATUS_COLOR[s] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex flex-col">
          <p className="text-lg font-extrabold text-text-main mb-6">Prioritas Tasks</p>
          <div className="flex flex-col gap-5">
            {prioList.map(p => {
              const count = tasks.filter(t => t.priority === p).length;
              const pct   = total ? Math.round((count / total) * 100) : 0;
              const labels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
              return (
                <div key={p} className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span style={{ color: PRIO_COLOR[p] }}>{labels[p]}</span>
                    <span className="text-text-muted">{count} tasks · {pct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: PRIO_COLOR[p] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex flex-col">
          <p className="text-lg font-extrabold text-text-main mb-6">Task Terbaru</p>
          <div className="flex flex-col gap-2">
            {recentTasks.length === 0 && <p className="text-sm font-medium text-text-muted">Belum ada task</p>}
            {recentTasks.map(t => (
              <div key={t.id} className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-border">
                <div className="w-3 h-3 rounded-full mt-1 shrink-0 shadow-sm" style={{ background: STATUS_COLOR[t.status] }} />
                <div>
                  <p className="text-sm font-bold text-text-main leading-tight">{t.title}</p>
                  <p className="text-xs font-semibold text-text-muted mt-1.5">{t.created_at ? timeAgo(t.created_at) : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Workload */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex flex-col">
          <p className="text-lg font-extrabold text-text-main mb-6">Workload Tim</p>
          <div className="flex flex-col gap-2">
            {members.length === 0 && <p className="text-sm font-medium text-text-muted">Belum ada member</p>}
            {members.map(m => {
              const mtasks  = tasks.filter(t => t.assignee_id === m.id);
              const mdone   = mtasks.filter(t => t.status === 'done').length;
              const initials = m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
              return (
                <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm" 
                    style={{ background: m.avatar_color }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-main truncate">{m.name}</p>
                    <p className="text-xs font-semibold text-text-muted mt-0.5">{mtasks.length} tasks · {mdone} selesai</p>
                  </div>
                  {mtasks.length > 0 && (
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(mdone/mtasks.length)*100}%`, background: m.avatar_color }} 
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
