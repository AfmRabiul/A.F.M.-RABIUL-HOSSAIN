import React, { useState } from 'react';
import { SparklesIcon } from './Icons';

interface EditingToolbarProps {
  onEdit: (prompt: string) => void;
  isLoading: boolean;
  error: string | null;
}

const EditingToolbar: React.FC<EditingToolbarProps> = ({ onEdit, isLoading, error }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onEdit(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-3 text-indigo-400">Custom Edit</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Add a majestic castle in the background'"
          className="w-full h-24 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white resize-none"
          disabled={isLoading}
        />
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full mt-3 bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Apply Custom Edit
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EditingToolbar;