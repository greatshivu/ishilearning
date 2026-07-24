import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { Copy, Check, Eye, Calendar, ChevronRight } from 'lucide-react';

interface CodeBlock {
  id: number;
  title: string;
  code: string;
  language: string;
}

interface Snippet {
  id: number;
  title: string;
  code?: string;
  explanation: string;
  language?: string;
  subject: string;
  summary?: string;
  viewCount: number;
  createdAt: string;
  codeBlocks: CodeBlock[];
}

const SnippetsPage: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [langFilter, setLangFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [copiedId, setCopiedId] = useState<number | string | null>(null);

  const fetchSnippets = async () => {
    const res = await api.get('/content/snippets', { params: { language: langFilter, subject: subjectFilter } });
    setSnippets(res.data);
  };

  const copyToClipboard = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    fetchSnippets();
  }, [langFilter, subjectFilter]);

  const handleSnippetClick = async (snippet: Snippet) => {
    await api.post(`/content/snippets/${snippet.id}/view`);
    setSelectedSnippet(snippet);
    setSnippets(snippets.map(s => s.id === snippet.id ? { ...s, viewCount: s.viewCount + 1 } : s));
  };

  if (selectedSnippet) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <button onClick={() => setSelectedSnippet(null)} className="mb-6 text-blue-500 hover:underline">← Back to Snippets</button>
        <div className="mb-8 rounded-xl border bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-extrabold">{selectedSnippet.title}</h1>
            <div className="flex gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(selectedSnippet.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Eye size={16} /> {selectedSnippet.viewCount} views</span>
            </div>
          </div>
          
          <div className="prose prose-lg dark:prose-invert mb-8 max-w-none">
            <ReactMarkdown>{selectedSnippet.explanation}</ReactMarkdown>
          </div>

          <div className="space-y-8">
            {selectedSnippet.code && (
                <CodeDisplay 
                    code={selectedSnippet.code} 
                    language={selectedSnippet.language || 'Plain Text'} 
                    id="main" 
                    title="Main Code"
                    copiedId={copiedId}
                    onCopy={copyToClipboard}
                />
            )}
            {selectedSnippet.codeBlocks.map((block) => (
              <CodeDisplay 
                key={block.id}
                code={block.code}
                language={block.language}
                id={block.id}
                title={block.title}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t dark:border-gray-700">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900/30">{selectedSnippet.subject}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
        <h1 className="text-4xl font-bold">Code Snippets</h1>
        <div className="flex flex-wrap gap-4">
          <input
            placeholder="Filter by Subject..."
            className="rounded-lg border p-2.5 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
          <select
            className="rounded-lg border p-2.5 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="C#">C#</option>
            <option value="JavaScript">JavaScript</option>
            <option value="TypeScript">TypeScript</option>
            <option value="SQL">SQL</option>
            <option value="React">React</option>
            <option value="Python">Python</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {snippets.map((snippet) => (
          <div 
            key={snippet.id} 
            onClick={() => handleSnippetClick(snippet)}
            className="group cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/20">{snippet.subject}</span>
              <ChevronRight className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="mb-3 text-xl font-bold group-hover:text-blue-500 transition-colors">{snippet.title}</h2>
            <p className="mb-4 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
              {snippet.summary || snippet.explanation.substring(0, 100) + '...'}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-3">
                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(snippet.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Eye size={14} /> {snippet.viewCount}</span>
              </div>
              <span className="font-mono text-blue-500">{snippet.language || (snippet.codeBlocks.length > 0 ? snippet.codeBlocks[0].language : '')}</span>
            </div>
          </div>
        ))}
        {snippets.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500">
            No snippets found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

const CodeDisplay = ({ 
  code, 
  language, 
  id, 
  title, 
  copiedId, 
  onCopy 
}: { 
  code: string, 
  language: string, 
  id: number | string, 
  title?: string, 
  copiedId: number | string | null, 
  onCopy: (text: string, id: number | string) => void 
}) => (
  <div className="mb-6">
    {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
    <div className="relative group/code rounded-lg bg-gray-900 p-4 font-mono text-sm text-blue-300">
      <button 
        onClick={() => onCopy(code, id)}
        className="absolute right-3 top-3 rounded-md bg-gray-800 p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-gray-700 hover:text-white group-hover/code:opacity-100"
        title="Copy to clipboard"
      >
        {copiedId === id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
      </button>
      <div className="mb-2 text-xs text-gray-500 flex justify-between items-center">
          <span>{language}</span>
      </div>
      <pre className="overflow-x-auto"><code>{code}</code></pre>
    </div>
  </div>
);

export default SnippetsPage;
