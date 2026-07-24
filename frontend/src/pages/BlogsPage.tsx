import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { Eye, Calendar, Copy, Check } from 'lucide-react';

interface Blog {
  id: number;
  title: string;
  content: string;
  summary: string;
  viewCount: number;
  createdAt: string;
}

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
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
            className="absolute right-3 top-3 z-10 rounded-md bg-gray-800 p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-gray-700 hover:text-white group-hover/code:opacity-100"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
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
    const fetchBlogs = async () => {
      const res = await api.get('/content/blogs');
      setBlogs(res.data);
    };
    fetchBlogs();
  }, []);

  const handleReadMore = async (blog: Blog) => {
    await api.post(`/content/blogs/${blog.id}/view`);
    setSelectedBlog(blog);
    setBlogs(blogs.map(b => b.id === blog.id ? { ...b, viewCount: b.viewCount + 1 } : b));
  };

  if (selectedBlog) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <button onClick={() => setSelectedBlog(null)} className="mb-6 text-blue-500 hover:underline">← Back to Blogs</button>
        <h1 className="mb-4 text-4xl font-extrabold">{selectedBlog.title}</h1>
        <div className="mb-8 flex gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Eye size={16} /> {selectedBlog.viewCount} views</span>
        </div>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown components={{ code: CodeBlock }}>{selectedBlog.content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-12 text-center text-4xl font-bold">Tech Blogs</h1>
      <div className="grid gap-12 lg:grid-cols-2">
        {blogs.map((blog) => (
          <div key={blog.id} className="group cursor-pointer" onClick={() => handleReadMore(blog)}>
            {/* <div className="mb-4 overflow-hidden rounded-2xl bg-gray-100 aspect-video dark:bg-gray-800">
              
              <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-80"></div>
            </div> */}
            <h2 className="mb-2 text-2xl font-bold group-hover:text-blue-500 transition-colors">{blog.title}</h2>
            <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-400">{blog.summary}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
               <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
               <span>•</span>
               <span className="flex items-center gap-1"><Eye size={14} /> {blog.viewCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
