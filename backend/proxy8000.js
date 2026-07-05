// proxy8000.js — Tiny proxy that makes old Laravel-style image URLs work in MERN
// Frontend uses: http://localhost:8000/storage/${thumbnail}
// If thumbnail is a full URL (Unsplash/Cloudinary), we redirect to it
// If thumbnail is a relative path, we serve it from a static dir

const express = require('express');
const app = express();

app.get('/storage/*', (req, res) => {
  // Extract what came after /storage/
  const rest = req.params[0]; // everything after /storage/

  if (rest.startsWith('http://') || rest.startsWith('https://')) {
    // It's a full URL — redirect directly to it
    return res.redirect(302, rest);
  }

  // Relative path — try to serve from public/storage (for future local files)
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(__dirname, 'public', 'storage', rest);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // Not found — return a placeholder image
  res.redirect(302, 'https://placehold.co/400x400/f7f2ea/8B6914?text=No+Image');
});

// Health check
app.get('/', (req, res) => res.send('KhadiCraft legacy image proxy running on port 8000'));

app.listen(8000, () => {
  console.log('🖼️  Image proxy running on http://localhost:8000');
});
