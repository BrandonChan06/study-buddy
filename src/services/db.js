import { supabase } from './supabaseClient';

/**
 * Saves a new deck and its flashcards to Supabase.
 * @param {string} title The title of the deck
 * @param {Array} cards Array of {question, answer} objects
 * @returns {string} The new deck ID, or mock ID if offline
 */
export async function saveDeck(title, cards) {
  if (!supabase) {
    console.warn("Supabase not configured, mocking saveDeck.");
    return "mock-deck-id";
  }

  // 1. Insert the Deck
  const { data: deckData, error: deckError } = await supabase
    .from('decks')
    .insert([{ title }])
    .select('id')
    .single();

  if (deckError) throw new Error("Failed to create deck: " + deckError.message);

  const deckId = deckData.id;

  // 2. Insert the Flashcards
  const flashcardsToInsert = cards.map(c => ({
    deck_id: deckId,
    question: c.question,
    answer: c.answer,
    status: 'learning'
  }));

  const { error: cardsError } = await supabase
    .from('flashcards')
    .insert(flashcardsToInsert);

  if (cardsError) throw new Error("Failed to save flashcards: " + cardsError.message);

  return deckId;
}

/**
 * Retrieves all decks ordered by last active.
 */
export async function getDecks() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .order('last_active', { ascending: false });

  if (error) throw new Error("Failed to fetch decks: " + error.message);
  return data;
}

/**
 * Retrieves flashcards for a specific deck.
 */
export async function getCardsForDeck(deckId) {
  if (!supabase || deckId === 'mock-deck-id') return [];

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (error) throw new Error("Failed to fetch cards: " + error.message);
  
  // Update last_active on the deck
  await supabase.from('decks').update({ last_active: new Date().toISOString() }).eq('id', deckId);
  
  return data;
}

/**
 * Updates the status of a specific flashcard.
 */
export async function updateCardStatus(cardId, status) {
  if (!supabase || !cardId) return;

  const { error } = await supabase
    .from('flashcards')
    .update({ status })
    .eq('id', cardId);

  if (error) console.error("Failed to update card status:", error.message);
}

/**
 * Updates a flashcard's question and answer.
 */
export async function updateCard(cardId, question, answer) {
  if (!supabase || !cardId || cardId.startsWith('mock')) return;

  const { error } = await supabase
    .from('flashcards')
    .update({ question, answer })
    .eq('id', cardId);

  if (error) throw new Error("Failed to update card: " + error.message);
}

/**
 * Deletes a flashcard.
 */
export async function deleteCard(cardId) {
  if (!supabase || !cardId || cardId.startsWith('mock')) return;

  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', cardId);

  if (error) throw new Error("Failed to delete card: " + error.message);
}

/**
 * Updates a deck's title.
 */
export async function updateDeckTitle(deckId, title) {
  if (!supabase || !deckId || deckId === 'mock-deck-id') return;

  const { error } = await supabase
    .from('decks')
    .update({ title })
    .eq('id', deckId);

  if (error) throw new Error("Failed to update deck title: " + error.message);
}

/**
 * Deletes an entire deck.
 */
export async function deleteDeck(deckId) {
  if (!supabase || !deckId || deckId === 'mock-deck-id') return;

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId);

  if (error) throw new Error("Failed to delete deck: " + error.message);
}
