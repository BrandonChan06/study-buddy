import { GoogleGenerativeAI } from '@google/generative-ai';

// Security Note: Never hardcode your API key here. It must only live in your .env file!
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateFlashcards(text) {
  if (!API_KEY || API_KEY === 'MISSING_API_KEY') {
    console.warn("API Key is missing! Using mock data for demonstration.");
    // Return mock data if API key is missing to prevent crash during testing
    return Array.from({ length: 10 }).map((_, i) => ({
      question: `Mock Question ${i + 1} derived from text.`,
      answer: `Mock Answer ${i + 1}. This represents a key concept.`
    }));
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are an expert academic tutor. Analyze the following lecture text and create exactly 10 high-quality flashcards for a study deck.
      Output the result as a JSON array of objects. Each object must have exactly two keys: "question" and "answer".
      The questions should test key concepts, and the answers should be concise and accurate.
      
      Lecture Text:
      "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonString = response.text();
    
    // Strip markdown code blocks if present
    jsonString = jsonString.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    
    const parsed = JSON.parse(jsonString);
    
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid format received from Gemini: Expected an array.");
    }
    
    // Validate schema
    const validCards = parsed.filter(card => card.question && card.answer).slice(0, 10);
    
    if (validCards.length === 0) {
      throw new Error("No valid flashcards could be parsed from the response.");
    }
    
    return validCards;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Error Details: " + (error.message || String(error)));
  }
}

export async function getDailyQuote() {
  if (!API_KEY) return null;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const prompt = "Generate a short, inspiring scholarly quote about learning or knowledge. Return it as a JSON object with three keys: 'text', 'author', and 'year'. The quote should feel sophisticated and fit a 'Dark Academia' aesthetic.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonString = response.text();
    
    jsonString = jsonString.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error fetching daily quote:", error);
    return { 
      text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
      author: "Albertus Magnus",
      year: "1260"
    };
  }
}
