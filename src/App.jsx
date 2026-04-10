import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, KanbanSquare, Users, Plus, Search, Bell,
  FolderKanban, X, Loader2, Check, AlertCircle, UserPlus, Menu, Edit3, Trash2
} from 'lucide-react';
import './index.css';

const PROJECT_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#6366f1'];

export default function App() {
  const [view, setView] = useState('board');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, memRes, taskRes] = await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('members').select('*'),
          supabase.from('tasks').select('*')
        ]);
        const projData = projRes.data || [];
        const memData = memRes.data || [];
        const taskData = taskRes.data || [];
        
        setProjects(projData);
        setMembers(memData);
        setTasks(taskData);
        if (projData.length > 0) setActiveProject(projData[0]);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalTask, setModalTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newProjOpen, setNewProjOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [notif, setNotif] = useState(null);

  const notify = (msg, type = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  // ----- Project CRUD -----
  const handleCreateProject = async () => {
    if (!newProjName.trim()) return;
    try {
      const np = { name: newProjName.trim(), color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length] };
      const { data, error } = await supabase.from('projects').insert([np]).select();
      if (error) throw error;
      const created = data[0];
      setProjects(p => [...p, created]);
      setActiveProject(created);
      setNewProjName(''); setNewProjOpen(false);
      notify('Project berhasil dibuat!');
    } catch (e) {
      notify('Gagal membuat project', 'error');
    }
  };

  const handleEditProject = async (id, oldName) => {
    const newName = window.prompt("Ubah nama project:", oldName);
    if (!newName || newName === oldName) return;
    try {
      const { error } = await supabase.from('projects').update({ name: newName }).eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
      if (activeProject?.id === id) setActiveProject(prev => ({ ...prev, name: newName }));
      notify('Project berhasil diubah!');
    } catch { notify('Gagal ubah project', 'error'); }
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Yakin mau delete project "${name}"? Semua task di dalamnya akan terhapus juga!`)) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.project_id !== id));
      if (activeProject?.id === id) setActiveProject(projects.find(p => p.id !== id) || null);
      notify('Project berhasil dihapus!');
    } catch { notify('Gagal hapus project', 'error'); }
  };

  // ----- Member CRUD -----
  const handleAddMember = async () => {
    const name = window.prompt("Nama Member Baru:");
    if (!name) return;
    const email = window.prompt("Email Member:");
    try {
       const color = PROJECT_COLORS[members.length % PROJECT_COLORS.length];
       const { data, error } = await supabase.from('members').insert([{ name, email: email || '', avatar_color: color }]).select();
       if (error) throw error;
       setMembers(prev => [...prev, data[0]]);
       notify('Member ditambahkan!');
    } catch { notify('Gagal tambah member', 'error'); }
  };

  const handleEditMember = async (m) => {
    const name = window.prompt("Ubah nama member:", m.name);
    if (!name) return;
    const email = window.prompt("Ubah email member:", m.email);
    try {
       const { error } = await supabase.from('members').update({ name, email: email || '' }).eq('id', m.id);
       if (error) throw error;
       setMembers(prev => prev.map(mm => mm.id === m.id ? { ...mm, name, email } : mm));
       notify('Member diubah!');
    } catch { notify('Gagal ubah member', 'error'); }
  };

  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Yakin delete member "${name}"?`)) return;
    try {
       const { error } = await supabase.from('members').delete().eq('id', id);
       if (error) throw error;
       setMembers(prev => prev.filter(mm => mm.id !== id));
       notify('Member dihapus!');
    } catch { notify('Gagal hapus member', 'error'); }
  };

  // ----- Task CRUD -----
  const handleSaveTask = async (formData) => {
    const isEdit = !!formData.id;
    try {
      if (isEdit) {
        const { data, error } = await supabase.from('tasks').update(formData).eq('id', formData.id).select();
        if (error) throw error;
        setTasks(prev => prev.map(t => t.id === data[0].id ? data[0] : t));
      } else {
        const { data, error } = await supabase.from('tasks').insert([formData]).select();
        if (error) throw error;
        setTasks(prev => [...prev, data[0]]);
      }
      setModalOpen(false);
      notify(isEdit ? 'Task diperbarui!' : 'Task dibuat!');
    } catch (e) {
      notify('Gagal menyimpan task', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
      setModalOpen(false);
      notify('Task dihapus!', 'info');
    } catch (e) {
      notify('Gagal menghapus task', 'error');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const historyItem = { action: `Moved to ${newStatus}`, date: new Date().toISOString() };
    const newHistory = [...(task.history || []), historyItem];
    
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, history: newHistory } : t));
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus, history: newHistory }).eq('id', taskId);
      if (error) throw error;
    } catch (e) {
      notify('Gagal mengubah status', 'error');
    }
  };

  const projectTasks = tasks.map(t => ({
    ...t,
    assignee: members.find(m => m.id === t.assignee_id)
  })).filter(t => t.project_id === activeProject?.id);

  const filteredTasks = projectTasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-bg relative">
      {/* Mobile nav overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      <aside className={`w-[280px] bg-white border-r border-border flex flex-col shrink-0 fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <KanbanSquare size={22} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-text-main">TaskBpro</span>
          </div>
          <button className="md:hidden text-text-muted hover:text-text-main" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 flex-1 space-y-1 overflow-y-auto">
          {[
            { id: 'board', icon: <KanbanSquare size={18} />, label: 'Board' },
            { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
            { id: 'members', icon: <Users size={18} />, label: 'Members' },
          ].map(item => (
            <button
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-semibold w-full text-left transition-all duration-200 ${
                view === item.id 
                  ? 'bg-accent-soft text-accent shadow-sm' 
                  : 'text-text-secondary hover:bg-slate-50 hover:text-text-main'
              }`}
              onClick={() => { setView(item.id); setMobileMenuOpen(false); }}
            >
              {item.icon} <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-[11px] font-bold text-text-muted uppercase mb-4 px-4 tracking-wider flex items-center justify-between">
            <span>My Projects</span>
          </div>
          <div className="space-y-1 mb-4">
            {projects.map(p => (
              <div 
                key={p.id} 
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all duration-200 cursor-pointer group ${
                  activeProject?.id === p.id 
                    ? 'bg-slate-100 text-text-main shadow-sm' 
                    : 'text-text-secondary hover:bg-slate-50'
                }`}
                onClick={() => { setActiveProject(p); setView('board'); setMobileMenuOpen(false); }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm shrink-0" style={{ background: p.color }} />
                  <span className="truncate">{p.name}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); handleEditProject(p.id, p.name); }} className="hover:text-accent"><Edit3 size={14} /></button>
                   <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id, p.name); }} className="hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
          <button 
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-accent hover:bg-accent-soft w-full text-left transition-all"
            onClick={() => setNewProjOpen(true)}
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 border border-border/50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)' }}>BP</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-text-main truncate">Tim Bpro</p>
              <p className="text-[11px] font-semibold text-text-muted uppercase">Premium Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-[70px] md:h-[80px] px-4 md:px-8 flex items-center gap-4 bg-white border-b border-border">
          <button className="md:hidden p-2 rounded-xl text-text-secondary hover:bg-slate-100" onClick={() => setMobileMenuOpen(true)}>
             <Menu size={20} />
          </button>
          
          <h1 className="text-xl md:text-2xl font-extrabold text-text-main tracking-tight flex-1 truncate">
            {view === 'board' ? activeProject?.name : view.charAt(0).toUpperCase() + view.slice(1)}
          </h1>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="bg-slate-100/80 border-transparent focus:bg-white focus:border-accent/30 focus:ring-4 focus:ring-accent-soft/50 py-2.5 pl-12 pr-6 rounded-2xl w-[200px] lg:w-[320px] text-sm font-medium outline-none transition-all duration-300"
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            {view === 'board' && (
              <button 
                className="bg-accent text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-accent/25 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 text-sm"
                onClick={() => { setModalTask({ status: 'todo' }); setModalOpen(true); }}
              >
                <Plus size={18} /> <span className="hidden md:inline">New Task</span>
              </button>
            )}
            {view === 'members' && (
               <button 
                className="bg-accent text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-accent/25 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 text-sm"
                onClick={handleAddMember}
               >
                 <UserPlus size={18} /> <span className="hidden md:inline">Add Member</span>
               </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-bg/50">
          <AnimatePresence mode="wait">
            {view === 'board' && (
              <motion.div 
                key="board" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {!activeProject ? (
                   <div className="flex flex-col items-center justify-center p-12 h-full text-center">
                     <p className="text-text-muted font-semibold text-lg">Pilih project di sidebar atau buat baru.</p>
                   </div>
                ) : (
                  <Board 
                    tasks={filteredTasks} 
                    members={members} 
                    onTaskClick={t => { setModalTask(t); setModalOpen(true); }} 
                    onAddTask={s => { setModalTask({ status: s }); setModalOpen(true); }} 
                    onStatusChange={handleStatusChange} 
                  />
                )}
              </motion.div>
            )}
            {view === 'dashboard' && (
              <motion.div
                key="dash"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-4 md:p-8"
              >
                <Dashboard tasks={tasks} members={members} projects={projects} />
              </motion.div>
            )}
            {view === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 md:p-8 max-w-5xl mx-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl p-6 border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative group">
                      <div className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-sm ring-4 ring-slate-50" style={{ background: m.avatar_color }}>
                        {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text-main text-lg truncate">{m.name}</h3>
                        <p className="text-sm font-medium text-text-muted truncate">{m.email}</p>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleEditMember(m)} className="p-1.5 bg-slate-100 rounded text-text-secondary hover:text-accent"><Edit3 size={14}/></button>
                         <button onClick={() => handleDeleteMember(m.id, m.name)} className="p-1.5 bg-slate-100 rounded text-text-secondary hover:text-red-500"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="text-text-muted font-medium py-8">Belum ada member. Tambahkan yang baru di pojok kanan atas.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals & Notifications */}
      <AnimatePresence>
        {modalOpen && (
          <TaskModal 
            task={modalTask} 
             members={members} 
             projectId={activeProject?.id} 
             onSave={handleSaveTask} 
             onDelete={handleDeleteTask} 
             onClose={() => setModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newProjOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setNewProjOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-extrabold text-text-main mb-6">Create New Project</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Project Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Marketing Campaign" 
                    value={newProjName} 
                    onChange={e => setNewProjName(e.target.value)} 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-border rounded-2xl text-sm font-medium outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft/50 transition-all" 
                    autoFocus 
                  />
                </div>
                <div className="flex gap-4 justify-end">
                  <button 
                    className="px-6 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:bg-slate-100 transition-colors" 
                    onClick={() => setNewProjOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-8 py-3 bg-accent text-white rounded-2xl text-sm font-bold shadow-lg shadow-accent/25 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all" 
                    onClick={handleCreateProject}
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {notif && (
        <motion.div 
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-4 md:bottom-8 right-4 md:right-8 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-border flex items-center gap-4 z-[1000] min-w-[280px]"
        >
          <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${notif.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {notif.type === 'success' ? <Check size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-red-600" />}
          </div>
          <div>
            <p className="text-sm font-bold text-text-main">{notif.msg}</p>
            <p className="text-[11px] font-bold text-text-muted uppercase mt-0.5">Notification</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
