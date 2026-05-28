import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Snippet {
  id: number;
  title: string;
  code: string;
  explanation: string;
  language: string;
  subject: string;
  createdAt: string;
}

const SnippetsPage: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [langFilter, setLangFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const fetchSnippets = async () => {
    const res = await api.get('/content/snippets', { params: { language: langFilter, subject: subjectFilter } });
    setSnippets(res.data);
  };

  useEffect(() => {
    fetchSnippets();
  }, [langFilter, subjectFilter]);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Code Snippets</h1>
        <div className="flex gap-4">
          <input
            placeholder="Filter by Subject..."
            className="rounded-md border p-2 dark:bg-gray-800"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
          <select
            className="rounded-md border p-2 dark:bg-gray-800"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="C#">C#</option>
            <option value="JavaScript">JavaScript</option>
            <option value="SQL">SQL</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {snippets.map((snippet) => (
          <div key={snippet.id} className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-2 text-2xl font-bold">{snippet.title}</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">{snippet.explanation}</p>
            <div className="relative rounded-lg bg-gray-900 p-4 font-mono text-sm text-blue-300">
              <pre><code>{snippet.code}</code></pre>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-600 dark:bg-blue-900/30">{snippet.language}</span>
              <span className="text-gray-500">{new Date(snippet.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SnippetsPage;
