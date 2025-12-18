const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------- SUPABASE ----------------
const supabaseUrl = process.env.SUPABASE_URL || 'https://tyrdretsbzjppjzxzybp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cmRyZXRzYnpqcHBqenh6eWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODEwNjQsImV4cCI6MjA4MTY1NzA2NH0.OdJyYxmCdFV3CLM8-jiBoQFMKeM_hZ-oSXP-EElMfY0';
const supabase = createClient(supabaseUrl, supabaseKey);

// ================== CATS ==================

// GET all cats
app.get('/api/cats', async (req, res) => {
  const { data, error } = await supabase.from('cats').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST new cat
app.post('/api/cats', async (req, res) => {
  const { name_cats, tag, description, images } = req.body;
  const { data, error } = await supabase.from('cats').insert([
    { name_cats, tag, description, images }
  ]).select(); // select() pour retourner le nouvel enregistrement
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// ================== AUTH ==================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data || data.password_hash !== password) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const token = `simple-token-${data.id}-${Date.now()}`;
  res.json({
    token,
    user: {
      id: data.id,
      username: data.username,
      email: data.email
    }
  });
});

// ================== FRONT ==================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ⚠️ TRÈS IMPORTANT POUR VERCEL
module.exports = app;
