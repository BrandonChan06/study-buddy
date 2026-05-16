import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { SearchContext } from '../App';
import { getDecks, updateDeckTitle, deleteDeck, getDecksWithReviews } from '../services/db';
import { getDailyQuote } from '../services/gemini';

export default function Dashboard() {
  const [recentDecks, setRecentDecks] = useState([]);
  const [upcomingReviews, setUpcomingReviews] = useState([]);
  const [dailyQuote, setDailyQuote] = useState({ 
    text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Albertus Magnus",
    year: "1260"
  });
  const { searchTerm } = useContext(SearchContext);
  const [editingDeckId, setEditingDeckId] = useState(null);
  const [editDeckTitle, setEditDeckTitle] = useState('');
  const [menuOpenDeckId, setMenuOpenDeckId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const decks = await getDecks();
        setRecentDecks(decks);

        const reviews = await getDecksWithReviews();
        setUpcomingReviews(reviews);

        // Load daily quote
        const cachedQuote = localStorage.getItem('dailyQuote');
        const cachedDate = localStorage.getItem('quoteDate');
        const today = new Date().toDateString();

        if (cachedQuote && cachedDate === today) {
          setDailyQuote(JSON.parse(cachedQuote));
        } else {
          const newQuote = await getDailyQuote();
          if (newQuote) {
            setDailyQuote(newQuote);
            localStorage.setItem('dailyQuote', JSON.stringify(newQuote));
            localStorage.setItem('quoteDate', today);
          }
        }
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    }
    loadData();
  }, []);

  const filteredDecks = recentDecks.filter(deck => 
    deck.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 3);

  const openDeck = (deckId) => {
    navigate('/flashcards', { state: { deckId } });
  };

  const handleEditDeckClick = (e, deck) => {
    e.stopPropagation();
    setEditingDeckId(deck.id);
    setEditDeckTitle(deck.title);
  };

  const handleSaveDeckTitle = async (e, deckId) => {
    e.stopPropagation();
    try {
      await updateDeckTitle(deckId, editDeckTitle);
      setRecentDecks(prev => prev.map(d => d.id === deckId ? { ...d, title: editDeckTitle } : d));
      setEditingDeckId(null);
    } catch (err) {
      alert("Failed to update title: " + err.message);
    }
  };

  const handleDeleteDeck = async (e, deckId) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to permanently delete this deck and all its flashcards?");
    if (!confirmed) return;
    
    try {
      await deleteDeck(deckId);
      setRecentDecks(prev => prev.filter(d => d.id !== deckId));
      setMenuOpenDeckId(null);
    } catch (err) {
      alert("Failed to delete deck: " + err.message);
    }
  };

  return (
    <section className="p-margin-desktop space-y-xl max-w-[1280px] mx-auto w-full">
      {/* Hero Section */}
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-8 bg-surface-container rounded-[20px] p-lg relative overflow-hidden flex flex-col justify-center border border-outline-variant/10">
          <div className="absolute top-0 right-0 p-lg opacity-10">
            <span className="material-symbols-outlined text-[120px]">format_quote</span>
          </div>
          <div className="relative z-10">
            <h2 className="font-display-lg text-headline-md text-primary mb-md">Scholarly Quote of the Day</h2>
            <p className="font-display-lg text-headline-lg italic text-on-surface leading-tight mb-md">"{dailyQuote.text}"</p>
            <p className="font-label-md text-label-md text-on-surface-variant tracking-widest">— {dailyQuote.author.toUpperCase()}, {dailyQuote.year}</p>
          </div>
        </div>
        <div className="col-span-4 bg-primary-container rounded-[20px] p-lg flex flex-col justify-between border border-primary/20">
          <div>
            <p className="font-label-md text-label-md text-on-primary-container/80 mb-base uppercase tracking-tighter">Current Session</p>
            <h3 className="font-display-lg text-headline-lg text-on-primary-container leading-none">Evening Focus</h3>
          </div>
          <div className="space-y-sm">
            <div className="flex justify-between items-end">
              <span className="font-body-md text-caption text-on-primary-container/70">Daily Goal: 4 hrs</span>
              <span className="font-display-lg text-headline-md text-on-primary-container">3.2 hrs</span>
            </div>
            <div className="h-1 bg-on-primary-container/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[80%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-7 bg-surface-container rounded-[20px] p-lg border border-outline-variant/10">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-display-lg text-headline-md text-on-surface">Weekly Progress</h3>
            <div className="flex gap-xs">
              <button className="px-sm py-base bg-surface-container-high rounded-full font-label-md text-caption text-on-surface-variant">Focus Hours</button>
              <button className="px-sm py-base hover:bg-surface-container-high rounded-full font-label-md text-caption text-on-surface-variant transition-colors">Pages Read</button>
            </div>
          </div>
          <div className="h-[240px] flex items-end justify-between px-md pb-md">
            {/* Chart Bars */}
            {[
              { day: 'Mon', h: '60%', active: false },
              { day: 'Tue', h: '45%', active: false },
              { day: 'Wed', h: '85%', active: false },
              { day: 'Thu', h: '95%', active: true },
              { day: 'Fri', h: '40%', active: false },
              { day: 'Sat', h: '20%', active: false },
              { day: 'Sun', h: '10%', active: false },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-sm group">
                <div 
                  className={`w-10 rounded-t-lg transition-all duration-300 ${
                    bar.active 
                      ? 'bg-primary-container border-x border-t border-primary/30 shadow-[0_-4px_12px_rgba(128,0,0,0.2)]' 
                      : 'bg-outline-variant/20 hover:bg-primary/40'
                  }`} 
                  style={{ height: bar.h }}
                ></div>
                <span className={`font-label-md text-caption ${bar.active ? 'text-primary' : 'text-on-surface-variant'}`}>{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5 flex flex-col gap-gutter">
          <div className="flex-1 bg-surface-container rounded-[20px] p-lg border border-outline-variant/10">
            <h4 className="font-label-md text-label-md text-on-surface-variant mb-md uppercase tracking-widest">Upcoming Reviews</h4>
            <div className="space-y-sm">
              {upcomingReviews.length > 0 ? upcomingReviews.map(review => (
                <div key={review.id} onClick={() => openDeck(review.id)} className="flex items-center justify-between p-sm rounded-lg bg-surface-container-high/50 border border-outline-variant/5 cursor-pointer hover:bg-surface-container-highest transition-colors">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">auto_stories</span>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface">{review.title}</p>
                      <p className="font-body-md text-caption text-on-surface-variant">{review.count} cards due</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/40">chevron_right</span>
                </div>
              )) : (
                <p className="font-body-md text-caption text-on-surface-variant text-center py-md">No cards due for review.</p>
              )}
            </div>
          </div>
          <button className="bg-primary hover:bg-on-primary-container transition-colors duration-300 text-on-primary-fixed font-label-md text-label-md py-md rounded-[20px] flex items-center justify-center gap-sm border-b border-on-primary/20 shadow-lg">
            <span className="material-symbols-outlined">play_arrow</span>
            START STUDY SESSION
          </button>
        </div>
      </div>

      {/* Recent Studies Section */}
      <div className="space-y-md">
        <div className="flex justify-between items-end">
          <h3 className="font-display-lg text-headline-md text-on-surface">Recent Study Decks</h3>
          <a className="font-label-md text-label-md text-primary hover:underline underline-offset-4 transition-all" href="#">View Library</a>
        </div>
        <div className="grid grid-cols-4 gap-gutter">
          {filteredDecks.map((deck, i) => (
            <div key={deck.id} onClick={() => openDeck(deck.id)} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-surface-container rounded-[20px] mb-sm overflow-hidden relative border border-outline-variant/10">
                <img alt="Study Deck" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" src={`https://lh3.googleusercontent.com/aida-public/${['AB6AXuDJud16-8TpN2IQdlAI9KGH-Kn_w1zLmxHQGhcAlsSK7ix3_QXMABP98KgjGTrhLt00lldme6O4148WlLDB9gegJ55UohC7uCX7Tav41oS6UpBREKo_gBpoMTahSvpVcVzVAzF-7LjOnXFJJXuWwZvfXmd2xT2-qDdLQWAQRCsyQl_dN2G3dtmxLnNQssfSlWg6in5dz_2BED0mcs2dwJN335O1K9SXBQW52kTEuV6CE0rQl0dZRydPrVEnhlWbGZx-ti3UAWw9m2Y', 'AB6AXuBGj9H7WerMkaHx4dgP5qjAimzMvl_CamgvbQTthbNv9waLmjiHUbsRKytIj79lxFetPwqoSc3GLpxAK3paSXV5_AZKQ5pshGxC0LiIyI0S1A7Ytc6p-rvigm7B9UZI-1L_jtUhKOkSXq-bswKkO3p3FBpoXXPwywp2oiYRFaqpfeDaU_eT-VGbnyl-VryU8jEylg9FE271BMDOJJ2SsKR8brJ1gloM2_twDMQbhiwqVPUDRRXugHboufDaM0wwwLq3_-EFlsCFN4g', 'AB6AXuAQBI2sBsxPSxAkgXP8v1yw78MJBaect7a3jSeFyIlOuUgwaVkiKUNj9KvwpK4n2mFg2yOyn_7732B7TpDkU_HC6SLNTK9dWLEaJW4Yo5EmyBDgy-wtz9Te-lTowNHQXezGd5A-Jm3FbQptrqg7t6RSdRcwiuNJaTGng425u1lmohGqraeTZOtsZ01m0Cv2KJrhTgOhV10rJGPE_QudO7HHFKktQJOMmWN7TlS0ecTHr0lZs7d1CWpJAdpbEUfAI6LreN7qjndJuXc'][i % 3]}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 p-md w-full">
                  {editingDeckId === deck.id ? (
                    <div className="flex items-center gap-xs mb-sm" onClick={e => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editDeckTitle}
                        onChange={(e) => setEditDeckTitle(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-sm py-xs text-on-surface font-display-lg text-headline-sm focus:outline-none focus:border-primary/50"
                        autoFocus
                      />
                      <button onClick={(e) => handleSaveDeckTitle(e, deck.id)} className="p-xs bg-primary text-on-primary-fixed rounded hover:bg-on-primary-container transition-colors">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingDeckId(null); }} className="p-xs bg-surface-container-high text-on-surface-variant rounded hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between relative">
                      <h4 className="font-display-lg text-headline-md text-on-surface leading-tight pr-sm">{deck.title}</h4>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setMenuOpenDeckId(menuOpenDeckId === deck.id ? null : deck.id); }} 
                        className="p-xs text-on-surface-variant/50 hover:text-primary opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <span className="material-symbols-outlined text-md">more_vert</span>
                      </button>

                      {menuOpenDeckId === deck.id && (
                        <div className="absolute top-full right-0 mt-1 bg-surface-container-high border border-outline-variant/20 rounded-lg shadow-xl overflow-hidden z-20 w-32" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={(e) => { handleEditDeckClick(e, deck); setMenuOpenDeckId(null); }}
                            className="w-full text-left px-sm py-xs text-label-md text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-xs"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span> Rename
                          </button>
                          <button 
                            onClick={(e) => handleDeleteDeck(e, deck.id)}
                            className="w-full text-left px-sm py-xs text-label-md text-error hover:bg-error/10 transition-colors flex items-center gap-xs"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-sm">
                    <span className="font-label-md text-caption text-on-surface-variant">
                      Active: {new Date(deck.last_active).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {recentDecks.length === 0 && (
            <div className="col-span-3 text-on-surface-variant p-lg border border-outline-variant/10 rounded-[20px] flex items-center justify-center">
              No decks saved in database yet. Generate one to see it here!
            </div>
          )}
          
          <Link to="/input" className="group cursor-pointer h-full">
            <div className="aspect-[4/5] bg-surface-container-lowest rounded-[20px] mb-sm flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-md border border-outline-variant/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-on-surface-variant">add</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">New Library Entry</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
