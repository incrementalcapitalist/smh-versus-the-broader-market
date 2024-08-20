/**
 * @file aiService.ts
 * @description Service for interacting with various AI models to generate opinions
 */

import { AIModel } from '../constants';
import { HistoricalDataPoint } from '../services/stockDataService';

interface AIModelResponse {
  choices: Array<{
    message?: {
      content: string;
    };
  }>;
}

/**
 * Generates an opinion using the specified AI model
 * @param {AIModel} model - The AI model configuration
 * @param {string} systemPrompt - The system prompt for the AI
 * @param {string} userPrompt - The user prompt for the AI
 * @param {HistoricalDataPoint[]} historicalData - Historical stock data
 * @returns {Promise<string>} A promise that resolves to the generated opinion
 */
export const getAIOpinion = async (
  model: AIModel,
  systemPrompt: string,
  userPrompt: string,
  historicalData: HistoricalDataPoint[]
): Promise<string> => {
  const fullUserPrompt = `${userPrompt}\n\nHistorical Data: ${JSON.stringify(historicalData)}`;

  let requestBody: any;
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${model.apiKey}`,
  };

  switch (model.name) {
    case 'OpenAI':
    case 'Groq':
      requestBody = {
        model: model.name === 'OpenAI' ? 'gpt-4' : 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullUserPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      };
      break;
    case 'Claude':
      requestBody = {
        prompt: `${systemPrompt}\n\nHuman: ${fullUserPrompt}\n\nAssistant:`,
        model: 'claude-2',
        max_tokens_to_sample: 500,
        temperature: 0.7,
      };
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'Gemini':
      requestBody = {
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: fullUserPrompt }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      };
      // Gemini requires the API key to be sent as a query parameter
      model.apiEndpoint += `?key=${model.apiKey}`;
      delete headers['Authorization'];
      break;
    case 'Mistral':
      requestBody = {
        model: "mistral-tiny", // or whichever model you're using
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullUserPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      };
      break;
    default:
      throw new Error(`Unsupported AI model: ${model.name}`);
  }

  try {
    console.log(`Sending request to ${model.name}:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(model.apiEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AIModelResponse = await response.json();

    let opinion: string;
    switch (model.name) {
      case 'OpenAI':
      case 'Groq':
        opinion = data.choices[0]?.message?.content || '';
        break;
      case 'Claude':
        opinion = (data as any).completion || '';
        break;
      case 'Gemini':
        opinion = (data as any).candidates[0]?.content?.parts[0]?.text || '';
        break;
      case 'Mistral':
        opinion = data.choices[0]?.message?.content || '';
        break;
      default:
        throw new Error(`Unsupported AI model: ${model.name}`);
    }

    return opinion || `No opinion provided by ${model.name}.`;
  } catch (error) {
    console.error(`Error calling ${model.name} API:`, error);
    throw error;
  }
};