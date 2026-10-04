/* ═══════════════════════════════════════════════════
   LyricLab — Full App Architecture
   ═══════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);
const norm = (s) => s.toLocaleLowerCase('tr-TR').replace(/[.,!?"'''""()]/g, '').trim();
const cleanWord = (w) => w.replace(/^[^a-zA-ZçÇğĞıİöÖşŞüÜ']+|[^a-zA-ZçÇğĞıİöÖşŞüÜ']+$/g, '');

// ─── FIREBASE INIT ───
const firebaseConfig = {
  apiKey: "AIzaSyBlqVAOrDqdj4qnR1-UxsUuPaSQR8XvH_c",
  authDomain: "lyriclab-8f414.firebaseapp.com",
  projectId: "lyriclab-8f414",
  storageBucket: "lyriclab-8f414.firebasestorage.app",
  messagingSenderId: "545686152506",
  appId: "1:545686152506:web:2c2b84137b85a0b89b5c03"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ─── STATE & LOCALSTORAGE ───
let profile = {
  xp: 0,
  level: 1,
  streak: 0,
  activities: [], // { songTitle, artist, diff, date, blanks, failures, rating }
  vocabulary: {}, // "word": { count, lastUsed }
  totalLyricsPlayed: 0
};

try {
  const saved = localStorage.getItem('lyriclab_profile');
  if (saved) profile = Object.assign(profile, JSON.parse(saved));
} catch {}

function saveProfile() {
  // calculate level (every 100 xp is a level)
  profile.level = Math.floor(profile.xp / 100) + 1;
  localStorage.setItem('lyriclab_profile', JSON.stringify(profile));
  renderAppScreens();
}

// ─── SONGS DB ───
const secondhandRaw = `[00:01.69]How am I supposed to let you go?
[00:04.89]How am I supposed to let you walk away?
[00:08.24]How am I supposed to let you go?
[00:11.49]You're all I ever wanted in my life
[00:14.89]All I ever wanted in my
[00:18.04]You're all I ever wanted in my
[00:21.44]All I ever wanted in my life, life, life
[00:28.04]You're all I ever wanted in my
[00:31.34]You're all I ever wanted in my (You're only, uh)
[00:34.74]You're all I ever wanted in my
[00:39.24]And I'm like, "What's up? What's up?" (Up) Sippin' on Fanta (Yeah)
[00:43.19]Black like Wakanda (Oh), let me remind ya (Oh)
[00:46.54]Rockin' designer, racks in my binder
[00:49.84]She my type of liner, you will never find her
[00:53.24]I would do the same if I ain't have cash and I had time for her
[00:57.19]Who said we had to be secondhand lovers? (Lover)
[01:00.54]You know we play the game, we need each other
[01:04.44]Need each other
[01:07.82]Angel dust (Angel dust)
[01:09.78]Shawty always got me trippin' like angel dust (Yo, angel dust)
[01:12.62]Everywhere she goes, you always see me, I'm flockin', I'm flockin'
[01:16.17]Shawty, you're stuck with me like I'm stuck in your teeth, no flossin'
[01:19.27]My phone gon' ring-ring, I pull up in a GT (Yeah)
[01:22.42]Wrap it first, easy, all because she pretty
[01:25.62]Her friends talkin' down on me, she petty, she don't listen
[01:28.72]She double down off the Hennessy, she sluttin' me, she sluttin' me
[01:32.32]Slap the devil and told him that my girl hotter (How am I supposed to let you go?)
[01:35.22]If I'm way too tall, no, no, with the way you whine, yo, yo (How am I supposed to let you walk away?)
[01:38.32]Who taught ya, who taught ya? (Ayy)
[01:40.37]Got my hands all on ya body (How am I supposed to let you go? Ayy)
[01:44.02]Please don't break my heart (You're all I ever wanted in my life)
[01:47.97]You're all I ever wanted in my (You're all I ever wanted, huh)
[01:51.32]You're all I ever wanted in my (You're only, uh)
[01:54.67]You're all I ever wanted in my
[01:59.37]And I'm like, "What's up? What's up?" Sippin' on Fanta
[02:03.22]Black like Wakanda, let me remind ya (Oh)
[02:06.52]Rockin' designer, racks in my binder
[02:09.82]She my type of liner, you will never find her
[02:13.17]I wouldn't do the same if I ain't have cash and I had time for her
[02:17.12]Who said we had to be secondhand lovers? (Lover)
[02:20.60]You know we stay together, we need each other
[02:24.40]We need each other
[02:25.85]This a Lamborghini, baby, are you with me?
[02:29.05]She do Bobby, Whitney, that booty always tempting
[02:32.40]Why are you here sipping? I sing a whole symphony
[02:35.70]I took her to the Gucci store and walked out with some Tiffany
[02:39.00]Now we in here singin' all these love songs, all these love songs
[02:43.25]Girl, you gave me love, shawty, swingin' in your undertone, yeah
[02:47.40]You know I be in, yeah, on a mission, I need you to get down and do that
[02:53.35]Let's go, let's go, outside, outside
[02:55.85]This here be my time, she here like a hog tie
[02:59.85]Let's go, let's go, outside, outside
[03:02.40]A chopper outside, my Black Hawk is outside
[03:07.95]You're all I ever wanted in my
[03:11.31]You're all I ever wanted in my (You're only, uh)
[03:14.61]You're all I ever wanted in my
[03:19.26]And I'm like, "What's up? What's up?" (Up) Sippin' on Fanta (Yeah)
[03:23.21]Black like Wakanda (Oh), let me remind ya (Oh)
[03:26.61]Rockin' designer, racks in my binder
[03:29.91]She my type of liner, you will never find her
[03:34.99]How am I supposed to let you go?
[03:38.14]How am I supposed to let you walk away?
[03:41.44]How am I supposed to let you go?
[03:44.64]You're all I ever wanted in my—`;

const vAllahRaw = `[00:01.73] Sana öyle dokununca, you like it
[00:04.73] O kalbin kime ait?
[00:08.35] Çıkar mı sana sahip?
[00:12.06] Hakimim, body'neyim hakim
[00:14.80] (Spankito)
[00:16.20] Kız, bu chain'ler atkı gibi kaplar boynumu
[00:20.16] Düşüremez hiçbi' pussy modumu
[00:23.48] Dikkat et, kız, hâlâ gizli konumum
[00:27.57] Param up now, tek yol para, yol
[00:30.50] Boş ver, kız, kay DM'ime, on the low
[00:33.87] Karakolluk niffolarım, karambol
[00:37.65] Fire, bütün şehir yanıyo', kız yanıyo'
[00:43.23] Ey, Lamborghini Gallardo, bağlar mob ties like Soprano, eh
[00:47.22] Hood'da niffolar asker, mi hermanos, dedim "Vamos", eh
[00:50.48] Vahşet buralar, kaos, finger snap'im sanki Thanos
[00:54.02] Club lit her yer models, modum yüksek, poppin' bottles, eh
[00:57.46] Bizimle gelmediyse bilin ki değil bizden
[01:00.73] Yürüdüğüm yollar zordu, buralar taş, diken
[01:04.55] Mami, çalış, Mami, çalış, Mami, çalış
[01:07.72] Göster bana değerini yeniden
[01:12.58] AMG custom whip, baby, gel strip, hep lit, niffolar çitlenbik
[01:18.04] Niffolar ki'tlendik, locked in, söyle onlara, biz geldik
[01:20.56] Free bro, free smoke, bura sislendi
[01:22.06] Oldun herkes, olamadın hiç kendin
[01:24.82] Kız, bu chain'ler atkı gibi kaplar boynumu
[01:28.70] Düşüremez hiçbi' pussy modumu
[01:32.10] Dikkat et, kız, hâlâ gizli konumum
[01:35.95] Param up now, tek yol para, yol
[01:39.04] Boş ver, kız, kay DM'ime, on the low
[01:42.99] Karakolluk niffolarım, karambol
[01:46.29] Fire, bütün şehir yanıyo', kız yanıyo'
[01:50.48] Sana öyle dokununca, you like it
[01:54.47] O kalbin kime ait?
[01:57.95] Çıkar mı sana sahip?
[02:01.68] Hakimim, body'neyim hakim (Ay)
[02:05.19] Solo winner, sikiyim birinin yanını, bende hep mutluluk sorunu var
[02:08.39] Sakın üstüne alınma bu yazdıklarımı, bar'ların kaç tane sahibi var? (Ah)
[02:11.91] Ölümü dilemek senin olayın, yok olmamı istemek senin olayın
[02:15.34] Nomad gibi gezerim bi' onda, bi' bunda, bi' bırakmadın ki senin olayım (Ah; Shot)
[02:18.99] Sabahı, öğlesi, akşamı, gecesi, dörde ayırdım, Giuseppe Parini (Mm)
[02:22.41] Touchdown, sabaha Amalfi'deyim, gecesi birlikte, Espresso Martini (Mm)
[02:25.62] Sınama sabrımı, slut, bunun vakti mi, slut? Bu sözler tehlike gece vaktinde
[02:28.96] Bi' dövüşür gibi, bi' sevişir gibi, birlikte bitirelim bütün takvimi (Ah)
[02:33.43] Kız, bu chain'ler atkı gibi kaplar boynumu
[02:37.30] Düşüremez hiçbi' pussy modumu
[02:40.72] Dikkat et, kız, hâlâ gizli konumum
[02:44.55] Param up now, tek yol para, yol
[02:47.67] Boş ver, kız, kay DM'ime, on the low
[02:51.10] Karakolluk niffolarım, karambol
[02:54.84] Fire, bütün şehir yanıyo', kız yanıyo'
[02:58.85] Sana öyle dokununca, you like it
[03:03.21] O kalbin kime ait
[03:06.67] Çıkar mı sana sahip?
[03:10.20] Hakimim, body'neyim hakim`;

const mothToAFlameRaw = `[00:05.40] Oh-woah
[00:09.11] Woah-oh-oh
[00:12.82] Woah
[00:15.87] Like a moth to a flame
[00:21.40] I'll pull you in, I pulled you back to
[00:25.94] What you need initially
[00:32.01] It's just one call away
[00:37.44] And you'll leave him, you're loyal to me
[00:42.21] But this time, I let you be
[00:46.48] 'Cause he seems like he's good for you
[00:50.60] And he makes you feel like you should
[00:54.37] And all your friends say he's the one
[00:58.50] His love for you is true
[01:02.47] But does he know you call me when he sleeps?
[01:10.56] But does he know the pictures that you keep?
[01:18.59] But does he know the reasons that you cry?
[01:26.53] Or tell me, does he know where your heart lies?
[01:34.63] Where it truly lies
[01:39.38] Yeah
[01:40.52] You should be with him, I let you go from time
[01:48.18] You should stay with him
[01:50.44] 'Cause he seems like he's good for you
[01:54.52] And he makes you feel like you should
[01:58.49] And all your friends say he's the one
[02:02.64] His love for you is true (Hey)
[02:06.47] But does he know you call me when he sleeps? (No, no)
[02:14.63] But does he know the pictures that you keep? (Oh)
[02:22.40] But does he know the reasons that you cry?
[02:30.27] Or tell me, does he know where your heart lies?
[02:38.67] Where it truly lies
[02:44.39] Right here with me, babe
[02:47.61] Where it truly lies
[02:52.31] My bed
[02:54.79] Where it truly lies
[03:00.58] In my heart
[03:02.88] Where it truly lies
[03:10.78] Where it truly lies
[03:27.04] Where it truly lies
[03:32.76] (Hey)
[03:42.81] Where it truly lies`;

function parseTimedLyrics(raw) {
  return raw.split('\n').map((rawLine) => {
    const m = rawLine.match(/^\s*\[(\d+)(?::(\d{2})(?:\.(\d+))?)?\]\s*(.*)$/);
    if (!m) return null;
    const time = m[2] != null ? Number(m[1]) * 60 + Number(m[2]) + Number('0.' + (m[3] || '0')) : Number(m[1]);
    const text = (m[4] || '').trim();
    if (!text) return null;
    return { time, text };
  }).filter(Boolean).sort((a, b) => a.time - b.time);
}

let defaultSongs = [
  { id: 'zKSaL0bJJvc', title: 'Secondhand', artist: 'Don Toliver', img: 'https://i.ytimg.com/vi/zKSaL0bJJvc/hqdefault.jpg', lines: parseTimedLyrics(secondhandRaw) },
  { id: 'FrIBZl8syac', title: 'Karambol', artist: 'Murda & Motive', img: 'https://i.ytimg.com/vi/FrIBZl8syac/hqdefault.jpg', lines: parseTimedLyrics(vAllahRaw) },
  { id: 'u9n7Cw-4_HQ', title: 'Moth To A Flame', artist: 'The Weeknd', img: 'https://i.ytimg.com/vi/u9n7Cw-4_HQ/hqdefault.jpg', lines: parseTimedLyrics(mothToAFlameRaw) }
];

let songs = [...defaultSongs];

db.ref('songs').on('value', (snapshot) => {
  const data = snapshot.val();
  let customSongs = [];
  if (data) {
    customSongs = Object.keys(data).map(key => ({ ...data[key], fbKey: key }));
  }
  songs = [...defaultSongs, ...customSongs];
  if (document.getElementById('homeFeaturedSongs')) {
    renderAppScreens();
  }
});

const distractors = ['night', 'light', 'heart', 'dream', 'love', 'time', 'world', 'fire', 'life', 'mind', 'soul', 'game', 'pain', 'rain', 'home', 'star', 'cold', 'gold', 'dark', 'high', 'free', 'hope', 'lost', 'fast', 'deep', 'real', 'wild', 'long', 'true', 'blue', 'walk', 'run', 'fly', 'cry', 'smile', 'laugh'];

// ─── TAB NAVIGATION ───
const screens = ['screenHome', 'screenActivity', 'screenVocabulary', 'screenRewards', 'screenProfile', 'screenImport'];
const titles = {
  screenHome: 'LYRICLAB',
  screenActivity: 'AKTİVİTE',
  screenVocabulary: 'SÖZCÜK DAĞARCIĞI',
  screenRewards: 'ÖDÜLLER',
  screenProfile: 'PROFİL',
  screenImport: 'ŞARKI EKLE'
};

function showScreen(screenId) {
  screens.forEach(id => {
    const el = $(id);
    if(el) {
      if(id === screenId) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
  
  // Update header
  $('headerTitle').innerHTML = titles[screenId] || 'LYRICLAB';
  
  // Update Bottom Nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    if(btn.dataset.target === screenId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  renderAppScreens();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.onclick = () => showScreen(btn.dataset.target);
});

// ─── RENDERING APP SCREENS ───
function renderAppScreens() {
  // HOME
  const totalWords = Object.keys(profile.vocabulary).length;
  $('homeLevelValue').textContent = profile.level;
  $('homeWordsCount').textContent = totalWords;
  $('homeLyricsCount').textContent = profile.totalLyricsPlayed;
  $('homeStreak').textContent = profile.streak;
  
  const progressPerc = (profile.xp % 100) / 100;
  $('homeLevelProgress').style.strokeDashoffset = 283 - (283 * progressPerc);

  $('homeFeaturedSongs').innerHTML = songs.map((s, i) => `
    <div class="song-card" onclick="openPreGame(${i})">
      <img src="${s.img || 'https://via.placeholder.com/300x150/111/fff?text=🎵'}" class="song-card-img" />
      <div class="song-card-info">
        <div class="song-card-title">${s.title}</div>
        <div class="song-card-artist">${s.artist}</div>
      </div>
      ${i >= defaultSongs.length ? `<button class="delete-song-btn" onclick="deleteSong(${i}, event)">🗑️</button>` : ''}
    </div>
  `).join('');

  // ACTIVITY
  if(profile.activities.length === 0) {
    $('activityList').innerHTML = `<div style="padding: 20px; text-align: center; color: #888;">Henüz aktivite yok. Bir şarkı oynayın!</div>`;
  } else {
    $('activityList').innerHTML = profile.activities.slice().reverse().map(act => `
      <div class="act-item">
        <div class="act-avatar" style="background:#1da1f2; color:white; display:flex; align-items:center; justify-content:center;">🎵</div>
        <div class="act-content">
          <div class="act-title">${act.songTitle}</div>
          <div class="act-artist">${act.artist}</div>
          <div style="font-size:0.7rem; color:#888; margin-bottom:8px;">SEÇİM / ${act.diff.toUpperCase()} • ${act.date}</div>
          <div class="act-stats">
            <span style="color:#22c55e;">● ${act.blanks}/${act.blanks} boşluklar</span>
            <span style="color:#ef4444;">● ${act.failures} başarısızlıklar</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // VOCABULARY
  $('vocabTotalCount').textContent = `${totalWords} sözcük`;
  if(totalWords === 0) {
    $('vocabList').innerHTML = `<div style="padding: 20px; text-align: center; color: #888;">Kelime hazineniz boş. Oyun oynayarak kelime kazanın!</div>`;
  } else {
    const vocabArr = Object.entries(profile.vocabulary).sort((a,b) => a[0].localeCompare(b[0]));
    $('vocabList').innerHTML = vocabArr.map(([word, data]) => {
      let strength = Math.min(4, Math.ceil(data.count / 2));
      let bars = '';
      for(let i=0; i<4; i++) bars += `<div class="strength-bar ${i<strength ? 'active':''}"></div>`;
      return `
      <div class="vocab-item">
        <div>
          <div class="vocab-word" style="text-transform: capitalize;">${word}</div>
          <div class="vocab-meta">${data.count} kez bildiniz</div>
        </div>
        <div class="vocab-strength">
          <span style="font-size:0.7rem; color:#888; margin-right:4px;">Güç:</span>
          ${bars}
        </div>
      </div>
    `}).join('');
  }
}

// ─── GAME STATE ───
let ytPlayer = null;
let ytReady = false;
let gameRunning = false;
let gameTimer = null;
let currentSongIndex = 0;
let currentDiff = 'hard';

let activeLineWords = [];
let activeBlanks = [];
let filledBlanks = [];
let currentChoices = [];
let songBlanksMap = [];
let songHasStarted = false;

// Session stats
let sessionFailures = 0;
let sessionWordsGained = [];

// ─── PRE-GAME SCREEN ───
function calculateBlanksForDiff(song, diff) {
  let count = 0;
  song.lines.forEach(line => {
    const words = line.text.split(/\s+/).filter(w => !w.includes('(') && !w.includes(')'));
    const valid = words.filter(w => cleanWord(w).length > 1);
    if(diff === 'expert') count += valid.length;
    else if(diff === 'hard') count += Math.max(1, Math.floor(valid.length * 0.5));
    else if(diff === 'medium') count += Math.min(2, valid.length);
    else count += valid.length > 0 ? 1 : 0; // easy
  });
  return count;
}

function openPreGame(idx) {
  currentSongIndex = idx;
  const song = songs[idx];
  $('preGameTitle').textContent = song.title;
  $('preGameArtist').textContent = song.artist;
  
  const totalValid = calculateBlanksForDiff(song, 'expert');
  $('descEasy').textContent = `${calculateBlanksForDiff(song, 'easy')} KELİMEYİ ${totalValid} KELİMEDEN DOLDURUN`;
  $('descMedium').textContent = `${calculateBlanksForDiff(song, 'medium')} KELİMEYİ ${totalValid} KELİMEDEN DOLDURUN`;
  $('descHard').textContent = `${calculateBlanksForDiff(song, 'hard')} KELİMEYİ ${totalValid} KELİMEDEN DOLDURUN`;
  $('descExpert').textContent = `${totalValid} KELİMEYİ ${totalValid} KELİMEDEN DOLDURUN`;
  
  $('modalPreGame').style.display = 'flex';
}

$('preGameBackBtn').onclick = () => {
  $('modalPreGame').style.display = 'none';
};

document.querySelectorAll('.diff-card').forEach(card => {
  card.onclick = () => {
    currentDiff = card.dataset.diff;
    $('modalPreGame').style.display = 'none';
    startPractice();
  };
});

// ─── GAMEPLAY LOGIC ───
function startPractice() {
  $('modalPractice').style.display = 'flex';
  const song = songs[currentSongIndex];
  
  sessionFailures = 0;
  sessionWordsGained = [];
  precomputeBlanks();
  
  // Initialize YouTube
  if(!ytPlayer) {
    const make = () => {
      ytPlayer = new YT.Player('ytHolder', {
        videoId: song.id || 'zKSaL0bJJvc',
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 1 },
        events: { onReady: () => { ytReady = true; beginGameLoop(); } }
      });
    };
    if (window.YT && YT.Player) make();
    else window.onYouTubeIframeAPIReady = () => { ytReady = true; make(); };
  } else {
    ytPlayer.loadVideoById(song.id || 'zKSaL0bJJvc');
    beginGameLoop();
  }
}

function beginGameLoop() {
  if(!ytReady) {
    setTimeout(beginGameLoop, 500);
    return;
  }
  lineIndex = 0;
  gameRunning = true;
  
  const lines = songs[currentSongIndex].lines;
  const start = Math.max(0, Number(lines[0].time) - 1 || 0);
  ytPlayer.seekTo(start, true);
  ytPlayer.playVideo();
  
  prepareLine(0);
  renderGameUI();
  
  clearInterval(gameTimer);
  gameTimer = setInterval(gameTick, 50);
}

function prepareLine(idx) {
  const line = songs[currentSongIndex].lines[idx];
  const rawWords = line.text.split(/\s+/).filter(Boolean); 
  
  activeLineWords = [];
  activeBlanks = [];
  filledBlanks = [];
  
  const cleanWordsForTarget = rawWords.map(w => cleanWord(w));
  
  let blankIndices = songBlanksMap[idx] || [];
  
  for (let i = 0; i < rawWords.length; i++) {
    if (blankIndices.includes(i)) {
      activeLineWords.push({ text: rawWords[i], clean: cleanWordsForTarget[i], isBlank: true });
      activeBlanks.push(cleanWordsForTarget[i]);
    } else {
      activeLineWords.push({ text: rawWords[i], isBlank: false });
    }
  }
  generateChoices();
}

function generateChoices() {
  if (filledBlanks.length >= activeBlanks.length) { currentChoices = []; return; }
  const target = activeBlanks[filledBlanks.length];
  let opts = [target];
  
  let attempts = 0;
  while (opts.length < 4 && attempts < 20) {
    let d = distractors[Math.floor(Math.random() * distractors.length)];
    if (!opts.map(norm).includes(norm(d))) opts.push(d);
    attempts++;
  }
  currentChoices = [...new Set(opts)].sort(() => Math.random() - 0.5);
  while(currentChoices.length < 4) currentChoices.push(Math.random().toString(36).substring(7));
  currentChoices = currentChoices.slice(0, 4);
}

function formatLinePreview(lineIdx) {
  if (lineIdx < 0 || lineIdx >= songs[currentSongIndex].lines.length) return '';
  const line = songs[currentSongIndex].lines[lineIdx];
  const blanksForLine = songBlanksMap[lineIdx] || [];
  if (blanksForLine.length === 0) return line.text;
  
  const rawWords = line.text.split(/\s+/).filter(Boolean);
  return rawWords.map((w, i) => blanksForLine.includes(i) ? '•' : w).join(' ');
}

function renderGameUI() {
  const song = songs[currentSongIndex];
  $('lineCount').textContent = `${lineIndex + 1} / ${song.lines.length} SATIR`;
  $('progressBar').style.width = `${((lineIndex + 1) / song.lines.length) * 100}%`;

  $('lyricPrev1').textContent = lineIndex > 0 ? song.lines[lineIndex - 1].text : '';
  $('lyricNext1').textContent = formatLinePreview(lineIndex + 1);

  let blankCounter = 0;
  const shown = activeLineWords.map((wObj) => {
    if (wObj.isBlank) {
      if (blankCounter < filledBlanks.length) { blankCounter++; return `<span class="blank filled">${wObj.text}</span>`; }
      else if (blankCounter === filledBlanks.length) { blankCounter++; return `<span class="blank active">___</span>`; }
      else { blankCounter++; return `<span class="blank">•</span>`; }
    } else return wObj.text;
  }).join(' ');
  $('lyricCurrent').innerHTML = shown;

  for (let i = 0; i < 4; i++) {
    const btn = $(`choiceBtn${i}`);
    if (i < currentChoices.length && filledBlanks.length < activeBlanks.length) {
      btn.textContent = currentChoices[i];
      btn.dataset.word = currentChoices[i];
      btn.disabled = false;
    } else {
      btn.textContent = '...';
      btn.disabled = true;
    }
  }
}

function check(selectedWord) {
  if (!gameRunning) return;

  if (filledBlanks.length >= activeBlanks.length) return;
  const target = activeBlanks[filledBlanks.length];
  
  if (norm(selectedWord) === norm(target)) {
    profile.xp += 10;
    sessionWordsGained.push(norm(target)); // Save to vocab later
    
    $('score').textContent = profile.xp + ' XP';
    filledBlanks.push(target);
    $('feedback').textContent = '';
    
    if (filledBlanks.length >= activeBlanks.length) {
      lineIndex++;
      if (lineIndex >= songs[currentSongIndex].lines.length) {
        endGame();
        return;
      }
      prepareLine(lineIndex);
      renderGameUI();
    } else {
      generateChoices();
      renderGameUI();
    }
  } else {
    sessionFailures++;
    $('feedback').textContent = '✗';
    const activeBlank = document.querySelector('.blank.active');
    if (activeBlank) {
      activeBlank.classList.add('error');
      setTimeout(() => activeBlank.classList.remove('error'), 400);
    }
  }
}

for (let i = 0; i < 4; i++) $(`choiceBtn${i}`).onclick = (e) => check(e.target.dataset.word);

function precomputeBlanks() {
  songBlanksMap = [];
  const lines = songs[currentSongIndex].lines;
  lines.forEach((line, idx) => {
    const rawWords = line.text.split(/\s+/).filter(Boolean); 
    const validIndices = rawWords.map((w, i) => {
        let clean = cleanWord(w);
        if (w.includes('(') || w.includes(')')) return -1;
        return clean.length > 1 && !/^[-—]+$/.test(clean) ? i : -1;
    }).filter(i => i !== -1);
      
    let blankIndices = [];
    if (currentDiff === 'expert') blankIndices = validIndices; 
    else if (currentDiff === 'hard') {
      let shuffled = [...validIndices].sort(() => Math.random() - 0.5);
      blankIndices = shuffled.slice(0, Math.max(1, Math.floor(validIndices.length * 0.5)));
    } else if (currentDiff === 'medium') {
      let shuffled = [...validIndices].sort(() => Math.random() - 0.5);
      blankIndices = shuffled.slice(0, Math.min(2, validIndices.length));
    } else {
      if (validIndices.length > 0) blankIndices = [validIndices[validIndices.length - 1]];
    }
    blankIndices.sort((a,b) => a-b);
    songBlanksMap[idx] = blankIndices;
  });
}

function gameTick() {
  if (!ytPlayer || !gameRunning) return;
  const t = ytPlayer.getCurrentTime();
  const lines = songs[currentSongIndex].lines;
  const currentLine = lines[lineIndex];
  const nextLine = lines[lineIndex + 1];
  
  let endTime = nextLine ? nextLine.time : currentLine.time + 5;
  
  if (t >= endTime) {
    if (filledBlanks.length < activeBlanks.length) {
      ytPlayer.seekTo(Math.max(0, currentLine.time - 0.2), true);
    } else {
      $('feedback').textContent = '';
      lineIndex++;
      if (lineIndex >= lines.length) {
        endGame();
        return;
      }
      prepareLine(lineIndex);
      renderGameUI();
    }
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(gameTimer);
  ytPlayer.pauseVideo();
  
  const song = songs[currentSongIndex];
  const blanksTotal = calculateBlanksForDiff(song, currentDiff);
  
  // Update Profile Stats
  profile.totalLyricsPlayed++;
  sessionWordsGained.forEach(w => {
    if(!profile.vocabulary[w]) profile.vocabulary[w] = {count: 0};
    profile.vocabulary[w].count++;
  });
  
  profile.activities.push({
    songTitle: song.title,
    artist: song.artist,
    diff: currentDiff,
    date: new Date().toLocaleDateString('tr-TR'),
    blanks: blanksTotal,
    failures: sessionFailures
  });
  
  saveProfile();
  
  $('modalPractice').style.display = 'none';
  showScreen('screenActivity');
  alert(`Tebrikler! ${profile.xp} XP kazandınız.`);
}

$('gameExitBtn').onclick = () => {
  gameRunning = false;
  clearInterval(gameTimer);
  if(ytPlayer) ytPlayer.pauseVideo();
  $('modalPractice').style.display = 'none';
};

// ─── ADD SONG LOGIC ───
$('btnGoToImport').onclick = () => showScreen('screenImport');
$('loadYoutube').onclick = () => {
    alert("YouTube URL algılandı. Lütfen şarkı detaylarını ve sözlerini girin.");
};
$('saveSong').onclick = () => {
  const raw = $('lyricsInput').value.trim();
  if (!raw) return;
  const lines = parseTimedLyrics(raw);
  const u = $('youtubeUrl').value.trim();
  let id = '';
  try { id = new URL(u).searchParams.get('v') || new URL(u).pathname.split('/').pop(); } catch{}
  
  const newSong = {
    id: id || 'zKSaL0bJJvc',
    title: $('songName').value.trim() || 'Yeni Şarkı',
    artist: $('songArtist').value.trim() || 'Bilinmeyen',
    img: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    lines
  };
  
  db.ref('songs').push(newSong)
    .then(() => {
      alert('Şarkı başarıyla Global Kütüphaneye eklendi! Artık herkes görebilir.');
      $('songName').value = '';
      $('songArtist').value = '';
      $('youtubeUrl').value = '';
      $('lyricsInput').value = '';
      showScreen('screenHome');
    })
    .catch(err => alert('Veritabanı Hatası: ' + err.message));
};

// ─── SYNC STUDIO LOGIC ───
let syncLines = [];
let syncCurrentIndex = 0;
let syncYtPlayer = null;
let syncYtReady = false;

$('btnStartSync').onclick = () => {
  const rawText = $('lyricsInput').value.trim();
  if(!rawText) return alert('Lütfen önce düz şarkı sözlerini yapıştırın!');
  const url = $('youtubeUrl').value.trim();
  if(!url) return alert('Lütfen YouTube URL yapıştırın!');
  
  let id = '';
  try { id = new URL(url).searchParams.get('v') || new URL(url).pathname.split('/').pop(); } catch{}
  if(!id) return alert('Geçersiz YouTube linki.');

  // Ignore existing timestamps if any
  syncLines = rawText.split('\n').map(l => l.replace(/^\[.*?\]\s*/, '').trim()).filter(Boolean);
  if(syncLines.length === 0) return alert('Geçerli metin bulunamadı.');
  
  syncCurrentIndex = 0;
  $('modalSyncStudio').style.display = 'flex';
  renderSyncUI();

  if(!syncYtPlayer) {
    const make = () => {
      syncYtPlayer = new YT.Player('syncYtHolder', {
        videoId: id,
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 1 },
        events: { onReady: () => { syncYtReady = true; } }
      });
    };
    if (window.YT && YT.Player) make();
    else window.onYouTubeIframeAPIReady = () => { syncYtReady = true; make(); };
  } else {
    syncYtPlayer.loadVideoById(id);
  }
};

$('syncExitBtn').onclick = () => {
  $('modalSyncStudio').style.display = 'none';
  if(syncYtPlayer && syncYtPlayer.pauseVideo) syncYtPlayer.pauseVideo();
};

function renderSyncUI() {
  if(syncCurrentIndex >= syncLines.length) {
    // Finished
    const finalLyrics = syncLines.map(l => `[${l.time}] ${l.text}`).join('\n');
    $('lyricsInput').value = finalLyrics;
    $('modalSyncStudio').style.display = 'none';
    if(syncYtPlayer && syncYtPlayer.pauseVideo) syncYtPlayer.pauseVideo();
    alert('Senkronizasyon tamamlandı! Kutuya zaman damgalı olarak aktarıldı. Şimdi "Kaydet ve Kütüphaneye Ekle" butonuna basabilirsiniz.');
    return;
  }
  
  $('syncPrevLine').textContent = syncCurrentIndex > 0 ? syncLines[syncCurrentIndex - 1].text : '';
  $('syncCurrentLine').textContent = typeof syncLines[syncCurrentIndex] === 'string' ? syncLines[syncCurrentIndex] : syncLines[syncCurrentIndex].text;
  $('syncNextLine').textContent = syncCurrentIndex < syncLines.length - 1 ? (typeof syncLines[syncCurrentIndex + 1] === 'string' ? syncLines[syncCurrentIndex + 1] : syncLines[syncCurrentIndex + 1].text) : '';
}

function handleSyncTick() {
  if(!syncYtReady || !syncYtPlayer || syncCurrentIndex >= syncLines.length) return;
  const t = syncYtPlayer.getCurrentTime() || 0;
  const mins = Math.floor(t / 60).toString().padStart(2, '0');
  const secs = (t % 60).toFixed(2).padStart(5, '0'); // e.g. "04.50"
  
  const text = typeof syncLines[syncCurrentIndex] === 'string' ? syncLines[syncCurrentIndex] : syncLines[syncCurrentIndex].text;
  
  syncLines[syncCurrentIndex] = {
    time: `${mins}:${secs}`,
    text: text
  };
  syncCurrentIndex++;
  renderSyncUI();
}

$('btnSyncNow').onclick = handleSyncTick;
window.addEventListener('keydown', (e) => {
  if(e.code === 'Space' && $('modalSyncStudio').style.display === 'flex') {
    e.preventDefault();
    handleSyncTick();
  }
});

// ─── DELETE SONG ───
window.deleteSong = function(idx, event) {
  event.stopPropagation();
  if(!confirm("Bu şarkıyı Global Kütüphaneden silmek istediğinize emin misiniz?")) return;
  
  const song = songs[idx];
  if (song && song.fbKey) {
    db.ref('songs/' + song.fbKey).remove()
      .catch(err => alert("Silinirken hata: " + err.message));
  }
};

// ─── INIT ───
showScreen('screenHome');
