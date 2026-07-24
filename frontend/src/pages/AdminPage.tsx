import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { BarChart, Users, MessageSquare, Settings, Plus, Download, ToggleLeft, ToggleRight, Eye, Edit3, Bold, Heading1, Heading2, Code, List, FileText, Trash2, Edit, Copy, Check as CheckIcon } from 'lucide-react';

const MarkdownEditor = ({ value, onChange, placeholder, height = "h-64", preview }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    const isCodeBlock = !inline && (match || codeString.includes('\n'));

    if (isCodeBlock) {
      return (
        <div className="relative group/code my-4">
          <button 
            type="button"
            onClick={() => copyToClipboard(codeString)}
            className="absolute right-2 top-2 z-10 rounded-md bg-gray-800 p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-700 hover:text-white group-hover/code:opacity-100"
            title="Copy to clipboard"
          >
            {copied ? <CheckIcon size={12} className="text-green-500" /> : <Copy size={12} />}
          </button>
          <pre className={`!my-0 rounded-lg !bg-gray-900 ${className || ''}`} {...props}>
            <code className={className}>{children}</code>
          </pre>
        </div>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  };

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    const newValue = `${beforeText}${before}${selectedText}${after}${afterText}`;
    onChange(newValue);
    
    // Reset focus and selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const cursorPos = start + before.length + selectedText.length + after.length;
        textareaRef.current.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  };

  return (
    <div className="space-y-2">
      {!preview && (
        <div className="flex flex-wrap gap-2 rounded-t-lg border-x border-t bg-gray-50 p-2 dark:bg-gray-900 dark:border-gray-800">
          <button type="button" onClick={() => insertText('# ', '')} className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800" title="Heading 1"><Heading1 size={18} /></button>
          <button type="button" onClick={() => insertText('## ', '')} className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800" title="Heading 2"><Heading2 size={18} /></button>
          <button type="button" onClick={() => insertText('**', '**')} className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800" title="Bold"><Bold size={18} /></button>
          <button type="button" onClick={() => insertText('```\n', '\n```')} className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800" title="Code Block"><Code size={18} /></button>
          <button type="button" onClick={() => insertText('- ', '')} className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800" title="List"><List size={18} /></button>
        </div>
      )}
      {preview ? (
        <div className={`prose prose-sm dark:prose-invert max-w-none overflow-auto rounded-lg border p-4 bg-white dark:bg-gray-950 ${height}`}>
          <ReactMarkdown components={{ code: CodeBlock }}>{value || "Nothing to preview"}</ReactMarkdown>
        </div>
      ) : (
        <textarea 
          ref={textareaRef}
          placeholder={placeholder} 
          required 
          className={`w-full ${preview ? '' : 'rounded-b-lg'} border p-3 dark:bg-gray-800 font-mono ${height} focus:ring-2 focus:ring-blue-500 outline-none`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [chatbotEnabled, setChatbotEnabled] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

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

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, contentType: type });
    setActiveTab('add-content');
  };

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
          <SidebarLink icon={<Plus size={20} />} label="Add Content" active={activeTab === 'add-content'} onClick={() => { setActiveTab('add-content'); setEditingItem(null); }} />
          <SidebarLink icon={<FileText size={20} />} label="Manage Content" active={activeTab === 'manage-content'} onClick={() => setActiveTab('manage-content')} />
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

        {activeTab === 'add-content' && <AddContentForms initialData={editingItem} onComplete={() => { setActiveTab('manage-content'); setEditingItem(null); }} />}

        {activeTab === 'manage-content' && <ManageContent onEdit={handleEdit} />}

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

const ManageContent = ({ onEdit }: { onEdit: (item: any, type: string) => void }) => {
  const [type, setType] = useState('video');
  const [items, setItems] = useState<any[]>([]);

  const fetchItems = async () => {
    try {
      let endpoint = '';
      if (type === 'video') endpoint = '/content/videos';
      else if (type === 'snippet') endpoint = '/content/snippets';
      else if (type === 'repo') endpoint = '/content/repos';
      else if (type === 'blog') endpoint = '/content/blogs';
      else if (type === 'dictionary') endpoint = '/content/dictionary';
      
      const res = await api.get(endpoint);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      let endpoint = '';
      if (type === 'video') endpoint = `/content/videos/${id}`;
      else if (type === 'snippet') endpoint = `/content/snippets/${id}`;
      else if (type === 'repo') endpoint = `/content/repos/${id}`;
      else if (type === 'blog') endpoint = `/content/blogs/${id}`;
      else if (type === 'dictionary') endpoint = `/content/dictionary/${id}`;
      
      await api.delete(endpoint);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Content</h1>
      <div className="flex gap-4">
        {['video', 'snippet', 'repo', 'blog', 'dictionary'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-lg px-4 py-2 capitalize ${type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
          >
            {t}s
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b dark:border-gray-800">
              <th className="p-4 font-semibold">Title / Word</th>
              <th className="p-4 font-semibold">Details</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-4 font-medium">{item.title || item.englishWord}</td>
                <td className="p-4 text-sm text-gray-500">
                  {item.language || item.kannadaWord} {item.subject ? `• ${item.subject}` : ''}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(item, type)} className="rounded p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="rounded p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">No {type}s found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AddContentForms = ({ initialData, onComplete }: { initialData?: any, onComplete?: () => void }) => {
  const [type, setType] = useState('video');
  const [formData, setFormData] = useState<any>({});
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.contentType);
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (type === 'video') endpoint = '/content/videos';
      else if (type === 'snippet') endpoint = '/content/snippets';
      else if (type === 'repo') endpoint = '/content/repos';
      else if (type === 'blog') endpoint = '/content/blogs';
      else if (type === 'dictionary') endpoint = '/content/dictionary';

      if (initialData) {
        await api.put(`${endpoint}/${initialData.id}`, formData);
        alert('Content updated successfully!');
      } else {
        await api.post(endpoint, formData);
        alert('Content added successfully!');
      }
      
      setFormData({});
      if (onComplete) onComplete();
    } catch (err) {
      alert(`Failed to ${initialData ? 'update' : 'add'} content`);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Content</h1>
        <button 
          type="button"
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          {preview ? <><Edit3 size={16} /> Edit Mode</> : <><Eye size={16} /> Preview Mode</>}
        </button>
      </div>

      <select className="w-full rounded-lg border p-3 dark:bg-gray-800" value={type} onChange={(e) => {
        setType(e.target.value);
        setFormData({});
        setPreview(false);
      }}>
        <option value="video">Video</option>
        <option value="snippet">Code Snippet</option>
        <option value="repo">Repository</option>
        <option value="blog">Blog</option>
        <option value="dictionary">Dictionary Entry</option>
      </select>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {type === 'video' && (
          <>
            <input placeholder="Title" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <input placeholder="YouTube URL" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.url || ''} onChange={(e) => setFormData({...formData, url: e.target.value})} />
            <input placeholder="Language (C#, React...)" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.language || ''} onChange={(e) => setFormData({...formData, language: e.target.value})} />
            <input placeholder="Type (Tutorial, Demo...)" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.type || ''} onChange={(e) => setFormData({...formData, type: e.target.value})} />
          </>
        )}
        {type === 'snippet' && (
          <>
            <input placeholder="Title" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <MarkdownEditor 
              placeholder="Explanation (Supports Markdown)" 
              value={formData.explanation} 
              onChange={(val: string) => setFormData({...formData, explanation: val})} 
              height="h-32"
              preview={preview}
            />
            <div className="space-y-4 rounded-lg border p-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Code Blocks</h3>
                <button 
                  type="button" 
                  onClick={() => setFormData({
                    ...formData, 
                    codeBlocks: [...(formData.codeBlocks || []), { title: '', code: '', language: '' }]
                  })}
                  className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                >
                  <Plus size={16} /> Add Block
                </button>
              </div>
              {(formData.codeBlocks || []).map((block: any, index: number) => (
                <div key={index} className="grid gap-2 border-t pt-4 dark:border-gray-800">
                  <div className="flex gap-2">
                    <input 
                      placeholder="Block Title" 
                      className="flex-1 rounded border p-2 text-sm dark:bg-gray-800" 
                      value={block.title || ''} 
                      onChange={(e) => {
                        const newBlocks = [...formData.codeBlocks];
                        newBlocks[index].title = e.target.value;
                        setFormData({...formData, codeBlocks: newBlocks});
                      }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newBlocks = formData.codeBlocks.filter((_: any, i: number) => i !== index);
                        setFormData({...formData, codeBlocks: newBlocks});
                      }}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea 
                    placeholder="Code" 
                    className="h-32 w-full rounded border p-2 font-mono text-sm dark:bg-gray-800" 
                    value={block.code || ''} 
                    onChange={(e) => {
                      const newBlocks = [...formData.codeBlocks];
                      newBlocks[index].code = e.target.value;
                      setFormData({...formData, codeBlocks: newBlocks});
                    }} 
                  />
                  <input 
                    placeholder="Language" 
                    className="rounded border p-2 text-sm dark:bg-gray-800" 
                    value={block.language || ''} 
                    onChange={(e) => {
                      const newBlocks = [...formData.codeBlocks];
                      newBlocks[index].language = e.target.value;
                      setFormData({...formData, codeBlocks: newBlocks});
                    }} 
                  />
                </div>
              ))}
            </div>
            <input placeholder="Subject" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.subject || ''} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
          </>
        )}
        {type === 'repo' && (
          <>
            <input placeholder="Title" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <input placeholder="Git Repository URL" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.gitUrl || ''} onChange={(e) => setFormData({...formData, gitUrl: e.target.value})} />
            <MarkdownEditor 
              placeholder="Explanation (Supports Markdown)" 
              value={formData.explanation} 
              onChange={(val: string) => setFormData({...formData, explanation: val})} 
              height="h-40"
              preview={preview}
            />
            <input placeholder="Language" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.language || ''} onChange={(e) => setFormData({...formData, language: e.target.value})} />
            <input placeholder="Subject" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.subject || ''} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
          </>
        )}
        {type === 'blog' && (
          <>
            <input placeholder="Title" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <input placeholder="Summary" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.summary || ''} onChange={(e) => setFormData({...formData, summary: e.target.value})} />
            <MarkdownEditor 
              placeholder="Content (Supports Markdown)" 
              value={formData.content} 
              onChange={(val: string) => setFormData({...formData, content: val})} 
              height="h-96"
              preview={preview}
            />
          </>
        )}        {type === 'dictionary' && (
          <>
            <input placeholder="English Word" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.englishWord || ''} onChange={(e) => setFormData({...formData, englishWord: e.target.value})} />
            <input placeholder="Kannada Word" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.kannadaWord || ''} onChange={(e) => setFormData({...formData, kannadaWord: e.target.value})} />
            <textarea placeholder="Meaning" required className="rounded-lg border p-3 dark:bg-gray-800" value={formData.meaning || ''} onChange={(e) => setFormData({...formData, meaning: e.target.value})} />
            <textarea placeholder="Example" className="rounded-lg border p-3 dark:bg-gray-800" value={formData.example || ''} onChange={(e) => setFormData({...formData, example: e.target.value})} />
          </>
        )}
        <button type="submit" className="rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700">Add Content</button>
      </form>
    </div>
  );
};

export default AdminPage;
