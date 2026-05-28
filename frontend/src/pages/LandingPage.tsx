import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code, Video, Globe, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-blue-600 px-4 text-center text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('/assets/hero.png')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-4xl">
          <img src="public/logo.svg" className="mx-auto" width="512" height="512" />
          <p className="mb-8 text-xl text-blue-100 md:text-2xl">
            Learn C#, Azure, AI, MAUI, React, and more with high-quality content and real-world projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user ? (
              <>
                <Link to="/register" className="rounded-full bg-white px-8 py-3 text-lg font-bold text-blue-600 hover:bg-gray-100 transition-all">
                  Start Learning
                </Link>
                <Link to="/login" className="rounded-full border-2 border-white px-8 py-3 text-lg font-bold text-white hover:bg-white hover:text-blue-600 transition-all">
                  Browse Content
                </Link>
              </>
            ) : (
              <Link to="/videos" className="rounded-full bg-white px-8 py-3 text-lg font-bold text-blue-600 hover:bg-gray-100 transition-all">
                Continue Learning
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4">
        <h2 className="mb-12 text-center text-4xl font-bold">What We Offer</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <CategoryCard
            icon={<Video className="h-8 w-8 text-red-500" />}
            title="Video Content"
            description="High-quality video tutorials on the latest tech stacks."
          />
          <CategoryCard
            icon={<Code className="h-8 w-8 text-green-500" />}
            title="Code Snippets"
            description="Production-ready snippets with detailed explanations."
          />
          <CategoryCard
            icon={<BookOpen className="h-8 w-8 text-purple-500" />}
            title="Tech Blogs"
            description="Deep dives into complex architectural patterns."
          />
          <CategoryCard
            icon={<Globe className="h-8 w-8 text-blue-500" />}
            title="English-Kannada Dictionary"
            description="Technical terms explained in your native language."
          />
          <CategoryCard
            icon={<MessageSquare className="h-8 w-8 text-yellow-500" />}
            title="AI Chatbot"
            description="Get instant help from our Azure-powered AI assistant."
          />
        </div>
      </section>
    </div>
  );
};

const CategoryCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="rounded-2xl border bg-white p-8 shadow-sm transition-transform hover:-translate-y-2 dark:border-gray-700 dark:bg-gray-800">
    <div className="mb-4">{icon}</div>
    <h3 className="mb-2 text-2xl font-bold">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export default LandingPage;
