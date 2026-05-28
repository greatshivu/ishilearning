import React, { useState } from 'react';
import api from '../services/api';
import { Send } from 'lucide-react';

const FeedbackPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/feedback', message );
      setSuccess('Thank you for your feedback!');
      setMessage('');
    } catch (err) {
      setError('Failed to submit feedback.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Submit Feedback</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        We value your thoughts and suggestions. Let us know how we can improve IshiLearning.
      </p>

      {success && <p className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">{success}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            required
            className="mt-1 w-full rounded-xl border p-4 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 h-40"
            placeholder="Tell us what you think..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
        >
          <Send size={18} /> Send Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackPage;
