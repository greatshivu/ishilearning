import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search } from 'lucide-react';

interface DictionaryEntry {
  id: number;
  englishWord: string;
  kannadaWord: string;
  meaning: string;
  example: string;
}

const DictionaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDictionary = async () => {
      const res = await api.get('/content/dictionary', { params: { search } });
      setEntries(res.data);
    };
    const timer = setTimeout(fetchDictionary, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">English–Kannada Dictionary</h1>
        <p className="text-gray-600 dark:text-gray-400">Translate technical terms and common phrases easily.</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search for a word (English or Kannada)..."
          className="w-full rounded-full border border-gray-300 py-4 pl-12 pr-6 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-blue-600">{entry.englishWord}</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{entry.kannadaWord}</span>
              </div>
            </div>
            <p className="mb-2 text-lg text-gray-700 dark:text-gray-300">{entry.meaning}</p>
            {entry.example && (
               <div className="mt-4 border-l-4 border-blue-200 pl-4 italic text-gray-500">
                 "{entry.example}"
               </div>
            )}
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-gray-500 py-12">No entries found for "{search}"</p>
        )}
      </div>
    </div>
  );
};

export default DictionaryPage;
