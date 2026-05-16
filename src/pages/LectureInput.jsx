import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateFlashcards } from '../services/gemini';
import { saveDeck } from '../services/db';

export default function LectureInput() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const cards = await generateFlashcards(text);
      if (!cards || cards.length === 0) {
        throw new Error("No flashcards were generated. Please provide more descriptive text.");
      }
      
      // Save the deck to Supabase
      const deckTitle = "Deck " + new Date().toLocaleDateString();
      const deckId = await saveDeck(deckTitle, cards);
      
      // Navigate to flashcards view with the deck ID
      navigate('/flashcards', { state: { deckId, fallbackCards: cards } });
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-margin-desktop max-w-[1000px] mx-auto w-full flex-1 flex flex-col">
      <div className="mb-lg">
        <h2 className="font-display-lg text-headline-lg text-on-surface mb-xs">New Library Entry</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Provide your scholarly text to transcribe into a study collection.</p>
      </div>

      <div className="bg-surface-container rounded-[20px] p-lg border border-outline-variant/10 flex-1 flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-surface-container/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[20px]">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin mb-4">progress_activity</span>
            <p className="font-label-md text-label-md text-primary tracking-widest uppercase">Consulting the Oracle...</p>
          </div>
        )}
        
        <div className="flex-1 border border-outline-variant/20 rounded-lg bg-surface-container-lowest p-md focus-within:border-primary/50 transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your manuscript, lecture notes, or text here..."
            className="w-full h-full bg-transparent resize-none outline-none font-body-md text-body-lg text-on-surface placeholder:text-on-surface-variant/30"
          ></textarea>
        </div>

        {error && (
          <div className="mt-md p-sm bg-error-container/20 border border-error/50 rounded-lg text-error text-label-md font-label-md">
            {error}
          </div>
        )}

        <div className="mt-lg flex justify-end items-center gap-md">
          <span className="font-label-md text-caption text-on-surface-variant/50">
            {text.length} characters
          </span>
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || loading}
            className="bg-primary disabled:opacity-50 hover:bg-on-primary-container transition-colors duration-300 text-on-primary-fixed font-label-md text-label-md py-sm px-lg rounded-full flex items-center justify-center gap-sm shadow-lg"
          >
            <span className="material-symbols-outlined text-xl">magic_button</span>
            TRANSCRIBE DECK
          </button>
        </div>
      </div>
    </section>
  );
}
