import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flag, Calendar, MoreHorizontal } from 'lucide-react';

const COLUMNS = [
  { id: 'todo',       label: 'To Do',       color: '#64748b', bg: '#f1f5f9' },
  { id: 'inprogress', label: 'In Progress',  color: '#6366f1', bg: '#eef2ff' },
  { id: 'review',     label: 'Review',       color: '#f59e0b', bg: '#fffbeb' },
  { id: 'done',       label: 'Done',         color: '#10b981', bg: '#ecfdf5' },
];

const PRIORITY = {
  low:      { color: '#10b981', label: 'Low', bg: '#ecfdf5' },
  medium:   { color: '#3b82f6', label: 'Medium', bg: '#eff6ff' },
  high:     { color: '#f59e0b', label: 'High', bg: '#fffbeb' },
  critical: { color: '#ef4444', label: 'Critical', bg: '#fef2f2' },
};

export default function Board({ tasks, members, onTaskClick, onAddTask, onStatusChange }) {
  const [dragging, setDragging]   = useState(null);
  const [dragOver, setDragOver]   = useState(null);

  const handleDragStart = (e, task) => {
    setDragging(task);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOver(colId);
  };
  const handleDrop = (e, colId) => {
    e.preventDefault();
    if (dragging && dragging.status !== colId) onStatusChange(dragging.id, colId);
    setDragging(null); setDragOver(null);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : null;
  const isOverdue  = (d) => d && new Date(d) < new Date();

  return (
    <div className="flex gap-4 sm:gap-8 p-4 sm:p-8 h-full overflow-x-auto overflow-y-hidden">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        const isOver   = dragOver === col.id;
        
        return (
          <div
            key={col.id}
            className={`flex flex-col w-[280px] sm:w-[320px] min-w-[280px] sm:min-w-[320px] rounded-2xl transition-all duration-200 ${isOver ? 'bg-slate-200/50' : 'bg-transparent'}`}
            onDragOver={e => handleDragOver(e, col.id)}
            onDrop={e => handleDrop(e, col.id)}
            onDragLeave={() => setDragOver(null)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: col.color }} />
                <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#64748b]">{col.label}</span>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-all" 
                onClick={() => onAddTask(col.id)}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Column Body */}
            <div className="flex flex-col gap-4 overflow-y-auto px-1 pb-10 scrollbar-hide max-h-[calc(100vh-220px)]">
              <AnimatePresence>
                {colTasks.map((task, idx) => {
                  const prio     = PRIORITY[task.priority] || PRIORITY.medium;
                  const overdue  = isOverdue(task.due_date) && task.status !== 'done';
                  const assignee = task.assignee;
                  const initials = assignee?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`group bg-white border border-border rounded-2xl p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 relative ${dragging?.id === task.id ? 'opacity-40 grayscale scale-95' : ''}`}
                      draggable
                      onDragStart={e => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider" style={{ background: prio.bg, color: prio.color }}>
                          {task.label || 'Task'}
                        </span>
                        <MoreHorizontal size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <h4 className="text-sm font-bold text-text-main mb-2 leading-snug group-hover:text-accent transition-colors">
                        {task.title}
                      </h4>
                      
                      {task.description && (
                        <p className="text-xs text-text-secondary mb-4 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          {task.due_date && (
                            <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${overdue ? 'text-red-500' : 'text-text-muted'}`}>
                              <Calendar size={12} />
                              <span>{formatDate(task.due_date)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                           {assignee && (
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-2 ring-white"
                              style={{ background: assignee.avatar_color || '#6366f1' }}
                              title={assignee.name}
                            >
                              {initials}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <button 
                  className="flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-accent/30 hover:bg-white hover:text-accent transition-all duration-300" 
                  onClick={() => onAddTask(col.id)}
                >
                  <Plus size={20} className="mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Empty Column</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
