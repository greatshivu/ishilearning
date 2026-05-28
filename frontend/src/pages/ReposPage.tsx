import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { GitBranch as GitHubIcon, ExternalLink } from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  url: string;
  description: string;
  language: string;
}

const ReposPage: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filter, setFilter] = useState('');

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
              <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                <ExternalLink size={20} />
              </a>
            </div>
            <h3 className="mb-2 text-xl font-bold">{repo.name}</h3>
            <p className="mb-4 flex-1 text-sm text-gray-600 dark:text-gray-400">{repo.description}</p>
            <span className="text-sm font-medium text-blue-600">{repo.language}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReposPage;
