-- Create the 'decks' table
CREATE TABLE decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the 'flashcards' table
CREATE TABLE flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    status TEXT DEFAULT 'learning' CHECK (status IN ('learning', 'review', 'learned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
-- For this initial version, we are allowing public access (no authentication).
-- IMPORTANT: If you ever add authentication later, you must restrict these policies.

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Allow completely public read/insert/update access to decks
CREATE POLICY "Allow public select on decks" ON decks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on decks" ON decks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on decks" ON decks FOR UPDATE USING (true);

-- Allow completely public read/insert/update access to flashcards
CREATE POLICY "Allow public select on flashcards" ON flashcards FOR SELECT USING (true);
CREATE POLICY "Allow public insert on flashcards" ON flashcards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on flashcards" ON flashcards FOR UPDATE USING (true);
