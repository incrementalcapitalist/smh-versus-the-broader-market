/**
 * @file AIPromptForm.tsx
 * @description A form component for inputting AI prompts and triggering AI opinion generation
 */

import React, { useState } from 'react';
import { AI_MODELS, DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_PROMPT } from '../constants';

interface AIPromptFormProps {
  onSubmit: (model: string, systemPrompt: string, userPrompt: string) => void;
}

/**
 * AIPromptForm component for inputting prompts and selecting AI models
 * @param {AIPromptFormProps} props - The component props
 * @returns {JSX.Element} The rendered form component
 */
const AIPromptForm: React.FC<AIPromptFormProps> = ({ onSubmit }) => {
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].name);
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);
  const [userPrompt, setUserPrompt] = useState<string>(DEFAULT_USER_PROMPT);

  /**
   * Handles form submission
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(selectedModel, systemPrompt, userPrompt);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <h2 className="text-2xl font-bold mb-4">AI Prompts</h2>
      <div className="mb-4">
        <label htmlFor="ai-model" className="block mb-2">Select AI Model:</label>
        <select
          id="ai-model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded"
        >
          {AI_MODELS.map((model) => (
            <option key={model.name} value={model.name}>{model.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="system-prompt" className="block mb-2">System Prompt:</label>
        <textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded h-32"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="user-prompt" className="block mb-2">User Prompt:</label>
        <textarea
          id="user-prompt"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded h-32"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Generate AI Opinion
      </button>
    </form>
  );
};

export default AIPromptForm;