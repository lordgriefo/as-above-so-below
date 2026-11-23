const fs = require('fs');
const path = require('path');

const factData = JSON.parse(fs.readFileSync('D:/as-above-so-below/dj_fact_cards.json', 'utf8'));
const songbookText = fs.readFileSync('D:/as-above-so-below/As Above So Below - An Occult Songbook.txt', 'utf8');
const mp3Files = fs.readdirSync('D:/as-above-so-below/30_master_tracks_mp3')
  .filter(f => f.endsWith('.mp3'))
  .sort((a, b) => parseInt(a) - parseInt(b));

const tracks = [];

mp3Files.forEach((file, idx) => {
  const numStr = String(idx + 1).padStart(2, '0');
  const card = factData.cards[numStr] || {};
  
  // Extract title from filename (e.g., '01 - Babalon Working Blues.mp3')
  const cleanTitle = file.replace(/^\d+\s*-\s*/, '').replace(/\.mp3$/, '');
  
  // Find lyrics from songbookText
  let lyrics = '';
  let stylePrompt = '';
  const trackRegex = new RegExp('(?:Track\\s*' + (idx + 1) + '|' + numStr + ')[\\s\\S]*?(?=##\\s*🎵\\s*Track|---|$)', 'i');
  const match = songbookText.match(trackRegex);
  if (match) {
    const chunk = match[0];
    const promptMatch = chunk.match(/\*\*Suno style prompt:\*\*\s*`([^`]+)`/i);
    if (promptMatch) stylePrompt = promptMatch[1];
    const lyricsMatch = chunk.match(/\*\*Lyrics:\*\*([\s\S]*?)(?=(?:---|\*\*Notes|$))/i);
    if (lyricsMatch) {
      lyrics = lyricsMatch[1].trim();
    }
  }

  // Volume determination
  let volume = 'Vol. I — The California Working';
  let side = 'Side A';
  if (idx < 5) { volume = 'Vol. I — The California Working'; side = 'Side A'; }
  else if (idx < 9) { volume = 'Vol. II — The Nightside & The Desert'; side = 'Side B'; }
  else if (idx < 14) { volume = 'Vol. III — The Golden Dawn & The Alphabet of Desire'; side = 'Side C'; }
  else if (idx < 18) { volume = 'Vol. IV — The Spheres & The Mahatmas'; side = 'Side D'; }
  else if (idx < 23) { volume = 'Vol. V — The Signal from Carcosa'; side = 'Side E'; }
  else { volume = 'Vol. VI — The Manuscripts & The Emptied Graves'; side = 'Side F'; }

  tracks.push({
    number: idx + 1,
    numStr: numStr,
    title: card.title || cleanTitle,
    subtitle: card.subtitle || '',
    artist: card.artist || "O'Shibboleth & The Magic Static Society",
    file: file,
    audioSrc: './30_master_tracks_mp3/' + encodeURIComponent(file),
    volume: volume,
    side: side,
    asciiBadge: card.ascii_badge || '[ ⚡ ]',
    eraPlace: card.era_place || 'Occult Transmissions',
    solidFacts: card.solid_facts || [],
    legendDisputed: card.legend_disputed || [],
    doNotSay: card.do_not_say || [],
    oneLineTeaser: card.one_line_teaser || '',
    transmissionError: card.transmission_error || '',
    stylePrompt: stylePrompt,
    lyrics: lyrics || 'Lyrics archived in Master Occult Songbook.'
  });
});

fs.writeFileSync('D:/as-above-so-below/tracksData.json', JSON.stringify(tracks, null, 2), 'utf8');
fs.writeFileSync('D:/as-above-so-below/tracksData.js', 'window.AASB_TRACKS = ' + JSON.stringify(tracks, null, 2) + ';\n', 'utf8');
console.log('Successfully wrote tracksData.json and tracksData.js with ' + tracks.length + ' tracks!');
