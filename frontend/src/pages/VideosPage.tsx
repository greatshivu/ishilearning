import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Play, Trash2 } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  url: string;
  language: string;
  type: string;
  viewCount: number;
  createdAt: string;
}

const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [langFilter, setLangFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin');

  const fetchVideos = async () => {
    const res = await api.get('/content/videos', { params: { language: langFilter, type: typeFilter } });
    setVideos(res.data);
  };

  useEffect(() => {
    fetchVideos();
  }, [langFilter, typeFilter]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      await api.delete(`/content/videos/${id}`);
      fetchVideos();
    }
  };

  const incrementView = async (id: number) => {
    await api.post(`/content/videos/${id}/view`);
    setVideos(videos.map(v => v.id === id ? { ...v, viewCount: v.viewCount + 1 } : v));
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Video Contents</h1>
        <div className="flex gap-4">
          <select
            className="rounded-md border p-2 dark:bg-gray-800"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="C#">C#</option>
            <option value="React">React</option>
            <option value="Azure">Azure</option>
          </select>
          <select
            className="rounded-md border p-2 dark:bg-gray-800"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Demo">Demo</option>
          </select>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div key={video.id} className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative flex items-center justify-center">
               <a 
                 href={video.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 onClick={() => incrementView(video.id)}
                 className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all"
               >
                 <Play className="text-white h-12 w-12" />
               </a>
            </div>
            <div className="p-4">
              <h3 className="mb-1 text-xl font-bold">{video.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{video.language} • {video.type}</span>
                <span>{video.viewCount} views</span>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(video.id)}
                  className="mt-4 flex items-center gap-2 text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideosPage;
