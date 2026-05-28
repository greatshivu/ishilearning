import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Users, MessageSquare, Settings, Plus, Download, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [chatbotEnabled, setChatbotEnabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, fbRes, settingsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/feedback'),
          api.get('/admin/settings')
        ]);
        setStats(statsRes.data);
        setFeedbacks(fbRes.data);
        setChatbotEnabled(settingsRes.data?.chatbotEnabled ?? false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const toggleChatbot = async () => {
    try {
      const res = await api.post('/admin/settings/chatbot', JSON.stringify(!chatbotEnabled), {headers:{'Content-Type': 'application/json'}});
      setChatbotEnabled(res.data.chatbotEnabled);
    } catch (err) {
      alert('Failed to toggle chatbot');
    }
  };

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Path,Timestamp,IP Address,Is Login\n"
      + stats.visits.map((v: any) => `${v.path},${v.timestamp},${v.ipAddress},${v.isLogin}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-8 text-xl font-bold">Admin Panel</h2>
        <nav className="space-y-2">
          <SidebarLink icon={<BarChart size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={<Plus size={20} />} label="Add Content" active={activeTab === 'add-content'} onClick={() => setActiveTab('add-content')} />
          <SidebarLink icon={<MessageSquare size={20} />} label="Feedback" active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} />
          <SidebarLink icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Visits" value={stats.totalVisits} icon={<Users className="text-blue-500" />} />
              <StatCard label="Total Logins" value={stats.logins} icon={<Users className="text-green-500" />} />
            </div>
            <div className="flex justify-end">
              <button onClick={exportReport} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                <Download size={18} /> Export CSV Report
              </button>
            </div>
          </div>
        )}

        {activeTab === 'add-content' && <AddContentForms />}

        {activeTab === 'feedback' && (
           <div className="space-y-6">
             <h1 className="text-3xl font-bold">User Feedback</h1>
             <div className="grid gap-4">
               {feedbacks.map((fb: any) => (
                 <div key={fb.id} className="rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <p className="mb-4 text-lg">{fb.message}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(fb.createdAt).toLocaleString()}</span>
                      {fb.reply ? (
                        <span className="text-green-500">Replied: {fb.reply}</span>
                      ) : (
                        <button className="text-blue-500 hover:underline">Reply</button>
                      )}
                    </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <div className="flex items-center justify-between rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h3 className="text-xl font-bold">AI Chatbot</h3>
                <p className="text-gray-500">Enable or disable the Azure-powered AI assistant for users.</p>
              </div>
              <button onClick={toggleChatbot} className="text-blue-600">
                {chatbotEnabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} className="text-gray-400" />}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors ${active ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
  >
    {icon} <span>{label}</span>
  </button>
);

const StatCard = ({ label, value, icon }: any) => (
  <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const AddContentForms = () => {
  const [type, setType] = useState('video');
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (type === 'video') endpoint = '/content/videos';
      else if (type === 'snippet') endpoint = '/content/snippets';
      else if (type === 'repo') endpoint = '/content/repos';
      else if (type === 'blog') endpoint = '/content/blogs';
      else if (type === 'dictionary') endpoint = '/content/dictionary';

      await api.post(endpoint, formData);
      alert('Content added successfully!');
      setFormData({});
    } catch (err) {
      alert('Failed to add content');
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">Add New Content</h1>
      <select className="w-full rounded-lg border p-3 dark:bg-gray-800" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="video">Video</option>
        <option value="snippet">Code Snippet</option>
        <option value="repo">Repository</option>
        <option value="blog">Blog</option>
        <option value="dictionary">Dictionary Entry</option>
      </select>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {type === 'video' && (
          <>
            <input placeholder="Title" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <input placeholder="YouTube URL" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, url: e.target.value})} />
            <input placeholder="Language (C#, React...)" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, language: e.target.value})} />
            <input placeholder="Type (Tutorial, Demo...)" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, type: e.target.value})} />
          </>
        )}
        {type === 'snippet' && (
          <>
            <input placeholder="Title" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <textarea placeholder="Code" required className="rounded-lg border p-3 dark:bg-gray-800 h-40" onChange={(e) => setFormData({...formData, code: e.target.value})} />
            <textarea placeholder="Explanation" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, explanation: e.target.value})} />
            <input placeholder="Language" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, language: e.target.value})} />
            <input placeholder="Subject" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, subject: e.target.value})} />
          </>
        )}
        {type === 'blog' && (
          <>
            <input placeholder="Title" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <input placeholder="Summary" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, summary: e.target.value})} />
            <textarea placeholder="Content (Text)" required className="rounded-lg border p-3 dark:bg-gray-800 h-64" onChange={(e) => setFormData({...formData, content: e.target.value})} />
          </>
        )}
        {type === 'dictionary' && (
          <>
            <input placeholder="English Word" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, englishWord: e.target.value})} />
            <input placeholder="Kannada Word" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, kannadaWord: e.target.value})} />
            <textarea placeholder="Meaning" required className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, meaning: e.target.value})} />
            <textarea placeholder="Example" className="rounded-lg border p-3 dark:bg-gray-800" onChange={(e) => setFormData({...formData, example: e.target.value})} />
          </>
        )}
        <button type="submit" className="rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700">Add Content</button>
      </form>
    </div>
  );
};

export default AdminPage;
