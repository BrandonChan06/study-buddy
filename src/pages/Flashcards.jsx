import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getCardsForDeck, updateCardStatus, deleteCard, updateCard } from '../services/db';

export default function Flashcards() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState({ learned: 0, review: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ question: '', answer: '' });

  useEffect(() => {
    async function loadCards() {
      if (location.state?.deckId) {
        try {
          const dbCards = await getCardsForDeck(location.state.deckId);
          if (dbCards && dbCards.length > 0) {
            setCards(dbCards);
            return;
          }
        } catch (e) {
          console.error("Failed to load cards from DB:", e);
        }
      }
      
      if (location.state?.fallbackCards) {
        setCards(location.state.fallbackCards);
      } else {
        // Fallback sample data if no state is passed
        setCards([
          { id: 'mock1', question: "What is the primary aesthetic of Study Buddy?", answer: "Dark Academia Minimalism" },
          { id: 'mock2', question: "What font is used for headers in this design system?", answer: "Playfair Display" },
          { id: 'mock3', question: "What is the accent color used?", answer: "UTM Maroon (#800000)" }
        ]);
      }
    }
    loadCards();
  }, [location]);

  const handleNext = async (status) => {
    setIsFlipped(false);
    
    // Update DB if not a mock card
    const currentCard = cards[currentIndex];
    if (currentCard.id && !currentCard.id.startsWith('mock')) {
      await updateCardStatus(currentCard.id, status);
    }

    setProgress(prev => ({
      ...prev,
      [status]: prev[status] + 1
    }));
    setTimeout(() => {
      setCurrentIndex(prev => Math.min(prev + 1, cards.length - 1));
    }, 150);
  };

  if (!cards.length) return <div className="p-xl text-center">Loading...</div>;

  const handleEditClick = () => {
    setEditForm({ question: currentCard.question, answer: currentCard.answer });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (currentCard.id && !currentCard.id.startsWith('mock')) {
        await updateCard(currentCard.id, editForm.question, editForm.answer);
      }
      
      setCards(prev => prev.map((c, i) => i === currentIndex ? { ...c, question: editForm.question, answer: editForm.answer } : c));
      setIsEditing(false);
    } catch (e) {
      alert("Failed to save changes: " + e.message);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this flashcard?");
    if (!confirmed) return;

    try {
      if (currentCard.id && !currentCard.id.startsWith('mock')) {
        await deleteCard(currentCard.id);
      }
      
      setCards(prev => prev.filter((_, i) => i !== currentIndex));
      setIsFlipped(false);
      setIsEditing(false);
      
      // If we deleted the last card, we need to shift index back
      if (currentIndex > 0 && currentIndex >= cards.length - 1) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (e) {
      alert("Failed to delete card: " + e.message);
    }
  };

  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length - 1 && (progress.learned + progress.review >= cards.length);

  return (
    <section className="p-margin-desktop flex-1 flex flex-col items-center justify-center max-w-[800px] mx-auto w-full relative">
      <div className="w-full flex justify-between items-center mb-lg">
        <Link to="/dashboard" className="text-on-surface-variant hover:text-primary flex items-center gap-xs font-label-md text-label-md transition-colors">
          <span className="material-symbols-outlined">arrow_back</span> Return to Library
        </Link>
        <div className="font-label-md text-caption text-on-surface-variant tracking-widest">
          CARD {Math.min(currentIndex + 1, cards.length)} OF {cards.length}
        </div>
      </div>

      {!isComplete && cards.length > 0 ? (
        <div className="w-full aspect-[16/9] perspective-1000 mb-lg relative group">
          <div 
            onClick={() => !isEditing && setIsFlipped(!isFlipped)}
            className={`w-full h-full ${!isEditing ? 'cursor-pointer' : ''} transition-transform duration-700 preserve-3d absolute inset-0 ${isFlipped ? 'rotate-y-180' : ''}`}
          >
            {/* Front of Card */}
            <div className={`backface-hidden absolute inset-0 bg-surface-container rounded-[20px] p-xl flex flex-col items-center justify-center border border-outline-variant/20 shadow-2xl ${isEditing ? 'z-20' : ''}`}>
              <div className="absolute top-md left-md flex items-center gap-sm">
                <span className="px-xs py-[2px] bg-primary-container/20 rounded border border-primary/20 text-[10px] text-primary italic uppercase tracking-widest">Question</span>
              </div>
              
              {!isEditing && (
                <div className="absolute top-md right-md flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(); }} className="p-xs text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-xs text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              )}

              {isEditing && !isFlipped ? (
                <div className="w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
                  <textarea 
                    value={editForm.question}
                    onChange={(e) => setEditForm({...editForm, question: e.target.value})}
                    className="w-full flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-md text-on-surface font-display-lg text-headline-md text-center focus:outline-none focus:border-primary/50 resize-none mb-md"
                  />
                  <div className="flex justify-end gap-sm">
                    <button onClick={() => setIsEditing(false)} className="px-md py-xs rounded-full border border-outline-variant/30 text-on-surface-variant font-label-md text-caption hover:bg-surface-container-high transition-colors">Cancel</button>
                    <button onClick={handleSaveEdit} className="px-md py-xs rounded-full bg-primary text-on-primary-fixed font-label-md text-caption hover:bg-on-primary-container transition-colors">Save Question</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-display-lg text-headline-lg text-center text-on-surface leading-snug">
                    {currentCard.question}
                  </h3>
                  <div className="absolute bottom-md text-on-surface-variant/40 flex items-center gap-xs font-label-md text-caption">
                    <span className="material-symbols-outlined text-sm">touch_app</span> Tap to reveal
                  </div>
                </>
              )}
            </div>

            {/* Back of Card */}
            <div className={`backface-hidden absolute inset-0 bg-surface-container-high rounded-[20px] p-xl flex flex-col items-center justify-center border border-primary/30 shadow-2xl rotate-y-180 ${isEditing ? 'z-20' : ''}`}>
              <div className="absolute top-md left-md">
                <span className="px-xs py-[2px] bg-secondary-container/30 rounded border border-secondary/30 text-[10px] text-secondary italic uppercase tracking-widest">Answer</span>
              </div>

              {!isEditing && (
                <div className="absolute top-md right-md flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(); }} className="p-xs text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-xs text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              )}

              {isEditing && isFlipped ? (
                <div className="w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
                  <textarea 
                    value={editForm.answer}
                    onChange={(e) => setEditForm({...editForm, answer: e.target.value})}
                    className="w-full flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-md text-on-surface-variant font-body-md text-body-lg text-center focus:outline-none focus:border-secondary/50 resize-none mb-md"
                  />
                  <div className="flex justify-end gap-sm">
                    <button onClick={() => setIsEditing(false)} className="px-md py-xs rounded-full border border-outline-variant/30 text-on-surface-variant font-label-md text-caption hover:bg-surface-container-high transition-colors">Cancel</button>
                    <button onClick={handleSaveEdit} className="px-md py-xs rounded-full bg-secondary text-on-secondary font-label-md text-caption hover:bg-secondary-fixed transition-colors">Save Answer</button>
                  </div>
                </div>
              ) : (
                <p className="font-body-md text-body-lg text-center text-on-surface-variant leading-relaxed">
                  {currentCard.answer}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-surface-container rounded-[20px] p-xl border border-outline-variant/20 text-center shadow-2xl mb-lg">
          <span className="material-symbols-outlined text-6xl text-primary mb-md">workspace_premium</span>
          <h2 className="font-display-lg text-headline-lg text-on-surface mb-sm">Session Complete</h2>
          <p className="font-body-md text-body-lg text-on-surface-variant mb-xl">You have reviewed all cards in this deck.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-primary hover:bg-on-primary-container transition-colors text-on-primary-fixed font-label-md text-label-md py-sm px-xl rounded-full">
            RETURN TO DASHBOARD
          </button>
        </div>
      )}

      {/* Progress & Controls */}
      {!isComplete && (
        <div className="w-full flex justify-between items-center bg-surface-container-lowest p-md rounded-2xl border border-outline-variant/10">
          <div className="flex items-center gap-md">
            <div className="text-center">
              <p className="font-display-lg text-headline-md text-secondary">{progress.learned}</p>
              <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest">Learned</p>
            </div>
            <div className="w-[1px] h-8 bg-outline-variant/20"></div>
            <div className="text-center">
              <p className="font-display-lg text-headline-md text-primary">{progress.review}</p>
              <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest">Review</p>
            </div>
          </div>

          <div className={`flex gap-sm transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext('review'); }}
              className="px-lg py-sm rounded-full border border-primary/50 text-primary hover:bg-primary/10 font-label-md text-label-md transition-colors"
            >
              Needs Review
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext('learned'); }}
              className="px-lg py-sm rounded-full bg-secondary text-on-secondary hover:bg-secondary-fixed transition-colors font-label-md text-label-md"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
