import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { GitBranch as GitHubIcon, ExternalLink, Copy, Check } from 'lucide-react';

interface Repo {
  id: number;
  title: string;
  gitUrl: string;
  explanation: string;
  language: string;
}

const ReposPage: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filter, setFilter] = useState('');
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
            onClick={() => copyToClipboard(codeString)}
            className="absolute right-2 top-2 z-10 rounded-md bg-gray-800 p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-700 hover:text-white group-hover/code:opacity-100"
            title="Copy to clipboard"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          </button>
          <pre className={`!my-0 rounded-lg !bg-gray-900 ${className || ''}`} {...props}>
            <code className={className}>{children}</code>
          </pre>
        </div>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  };

  useEffect(() => {
    const fetchRepos = async () => {
      const res = await api.get('/content/repos', { params: { language: filter } });
      setRepos(res.data);
    };
    fetchRepos();
  }, [filter]);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-8 text-3xl font-bold">GitHub Repositories</h1>
      <div className="mb-8">
        <select
          className="rounded-md border p-2 dark:bg-gray-800"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Languages</option>
          <option value="C#">C#</option>
          <option value="React">React</option>
          <option value="Python">Python</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <div key={repo.id} className="flex flex-col rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <GitHubIcon className="h-6 w-6" />
              <a href={repo.gitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                <ExternalLink size={20} />
              </a>
            </div>
            <h3 className="mb-2 text-xl font-bold">{repo.title}</h3>
            <div className="prose prose-sm dark:prose-invert mb-4 flex-1 max-w-none">
              <ReactMarkdown components={{ code: CodeBlock }}>{repo.explanation}</ReactMarkdown>
            </div>
            <span className="text-sm font-medium text-blue-600">{repo.language}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReposPage;
