/**
 * @file AIOpinionDisplay.tsx
 * @description A component for displaying AI-generated opinions
 */

import React from 'react';

interface Opinion {
  modelName: string;
  opinion: string;
}

interface AIOpinionDisplayProps {
  opinions: Opinion[];
}

/**
 * AIOpinionDisplay component for showing AI-generated opinions
 * @param {AIOpinionDisplayProps} props - The component props
 * @returns {JSX.Element} The rendered opinion display component
 */
const AIOpinionDisplay: React.FC<AIOpinionDisplayProps> = ({ opinions }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">AI-Generated Opinions</h2>
      {opinions.length === 0 ? (
        <p className="text-gray-400">No opinions generated yet. Use the form above to get AI opinions.</p>
      ) : (
        opinions.map((opinion, index) => (
          <div key={index} className="mb-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{opinion.modelName} Opinion</h3>
            <p className="whitespace-pre-wrap">{opinion.opinion}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default AIOpinionDisplay;