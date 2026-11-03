/**
 * Anime Nexus - Official Anime Poster Visuals & High-Fidelity Poster Generator
 * Provides authentic anime key visual poster art and generates styled vector anime posters
 * complete with Japanese Kanji typography, studio badges, and attack seals.
 */

// Canonical Anime Key Visual Posters
export const OFFICIAL_ANIME_POSTERS = {
  // SLICE OF LIFE
  'sol-1': 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', // Frieren
  'sol-2': 'https://cdn.myanimelist.net/images/anime/8/89913l.jpg',   // Laid-Back Camp
  'sol-3': 'https://cdn.myanimelist.net/images/anime/10/90342l.jpg',  // A Place Further Than the Universe
  'sol-4': 'https://cdn.myanimelist.net/images/anime/10/64467l.jpg',  // Barakamon
  'sol-5': 'https://cdn.myanimelist.net/images/anime/10/76120l.jpg',  // K-On!
  'sol-6': 'https://cdn.myanimelist.net/images/anime/13/36753l.jpg',  // Hyouka
  'sol-7': 'https://cdn.myanimelist.net/images/anime/12/55519l.jpg',  // Non Non Biyori
  'sol-8': 'https://cdn.myanimelist.net/images/anime/6/82898l.jpg',   // March Comes In Like a Lion
  'sol-9': 'https://cdn.myanimelist.net/images/anime/1448/127956l.jpg',// Bocchi the Rock!
  'sol-10': 'https://cdn.myanimelist.net/images/anime/3/75617l.jpg',  // Nichijou

  // MYSTERY
  'myst-1': 'https://cdn.myanimelist.net/images/anime/9/9453l.jpg',    // Death Note
  'myst-2': 'https://cdn.myanimelist.net/images/anime/10/18740l.jpg',  // Monster
  'myst-3': 'https://cdn.myanimelist.net/images/anime/1935/127974l.jpg', // Steins;Gate
  'myst-4': 'https://cdn.myanimelist.net/images/anime/10/77957l.jpg',  // Erased
  'myst-5': 'https://cdn.myanimelist.net/images/anime/5/43399l.jpg',   // Psycho-Pass
  'myst-6': 'https://cdn.myanimelist.net/images/anime/1038/114631l.jpg',// Odd Taxi
  'myst-7': 'https://cdn.myanimelist.net/images/anime/1125/96929l.jpg', // The Promised Neverland
  'myst-8': 'https://cdn.myanimelist.net/images/anime/12/35925l.jpg',  // Another
  'myst-9': 'https://cdn.myanimelist.net/images/anime/7/49557l.jpg',   // Danganronpa
  'myst-10': 'https://cdn.myanimelist.net/images/anime/11/40451l.jpg', // Shinsekai Yori

  // ACTION
  'act-1': 'https://cdn.myanimelist.net/images/anime/1607/117271l.jpg', // Dragon Ball Z
  'act-2': 'https://cdn.myanimelist.net/images/anime/12/76049l.jpg',   // One Punch Man
  'act-3': 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',   // Attack on Titan
  'act-4': 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',  // Demon Slayer
  'act-5': 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg', // Jujutsu Kaisen
  'act-6': 'https://cdn.myanimelist.net/images/anime/10/78745l.jpg',   // My Hero Academia
  'act-7': 'https://cdn.myanimelist.net/images/anime/1223/96541l.jpg',  // FMA Brotherhood
  'act-8': 'https://cdn.myanimelist.net/images/anime/1764/126627l.jpg', // Bleach TYBW
  'act-9': 'https://cdn.myanimelist.net/images/anime/1208/141044l.jpg', // Solo Leveling
  'act-10': 'https://cdn.myanimelist.net/images/anime/8/80356l.jpg',   // Mob Psycho 100

  // ROMANCE
  'rom-1': 'https://cdn.myanimelist.net/images/anime/1295/106591l.jpg', // Kaguya-sama
  'rom-2': 'https://cdn.myanimelist.net/images/anime/5/87048l.jpg',    // Your Name
  'rom-3': 'https://cdn.myanimelist.net/images/anime/13/22123l.jpg',   // Toradora!
  'rom-4': 'https://cdn.myanimelist.net/images/anime/1299/110774l.jpg', // Clannad After Story
  'rom-5': 'https://cdn.myanimelist.net/images/anime/4/75204l.jpg',    // Fruits Basket
  'rom-6': 'https://cdn.myanimelist.net/images/anime/1404/111785l.jpg', // Horimiya
  'rom-7': 'https://cdn.myanimelist.net/images/anime/1301/93586l.jpg',  // Bunny Girl Senpai
  'rom-8': 'https://cdn.myanimelist.net/images/anime/1880/101146l.jpg', // Weathering with You
  'rom-9': 'https://cdn.myanimelist.net/images/anime/1149/134440l.jpg', // Dangers in My Heart
  'rom-10': 'https://cdn.myanimelist.net/images/anime/4/41663l.jpg',   // Kamisama Kiss

  // SPRING
  'spr-1': 'https://cdn.myanimelist.net/images/anime/3/67177l.jpg',    // Your Lie in April
  'spr-2': 'https://cdn.myanimelist.net/images/anime/7/76014l.jpg',    // Haikyuu!!
  'spr-3': 'https://cdn.myanimelist.net/images/anime/1441/122795l.jpg', // Spy x Family
  'spr-4': 'https://cdn.myanimelist.net/images/anime/1795/95088l.jpg',  // Violet Evergarden
  'spr-5': 'https://cdn.myanimelist.net/images/anime/1812/134736l.jpg', // Oshi no Ko
  'spr-6': 'https://cdn.myanimelist.net/images/anime/4/5123l.jpg',     // Gurren Lagann
  'spr-7': 'https://cdn.myanimelist.net/images/anime/8/77838l.jpg',    // KonoSuba
  'spr-8': 'https://cdn.myanimelist.net/images/anime/4/19644l.jpg',    // Cowboy Bebop
  'spr-9': 'https://cdn.myanimelist.net/images/anime/1243/134379l.jpg', // Skip and Loafer
  'spr-10': 'https://cdn.myanimelist.net/images/anime/1085/114792l.jpg',// Fruits Basket Final

  // SUMMER
  'sum-1': 'https://cdn.myanimelist.net/images/anime/1154/93983l.jpg',  // Grand Blue
  'sum-2': 'https://cdn.myanimelist.net/images/anime/1143/121873l.jpg', // Summer Time Rendering
  'sum-3': 'https://cdn.myanimelist.net/images/anime/7/51187l.jpg',    // Free!
  'sum-4': 'https://cdn.myanimelist.net/images/anime/5/79697l.jpg',    // Anohana
  'sum-5': 'https://cdn.myanimelist.net/images/anime/11/73775l.jpg',   // Haruhi Suzumiya
  'sum-6': 'https://cdn.myanimelist.net/images/anime/1297/115784l.jpg', // Sonny Boy
  'sum-7': 'https://cdn.myanimelist.net/images/anime/6/15779l.jpg',    // Summer Wars
  'sum-8': 'https://cdn.myanimelist.net/images/anime/1384/136408l.jpg', // Zom 100
  'sum-9': 'https://cdn.myanimelist.net/images/anime/8/64627l.jpg',    // Terror in Resonance
  'sum-10': 'https://cdn.myanimelist.net/images/anime/13/24647l.jpg',  // FLCL

  // AUTUMN
  'aut-1': 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg', // Chainsaw Man
  'aut-2': 'https://cdn.myanimelist.net/images/anime/1861/126462l.jpg', // Cyberpunk Edgerunners
  'aut-3': 'https://cdn.myanimelist.net/images/anime/1258/126929l.jpg', // Blue Lock
  'aut-4': 'https://cdn.myanimelist.net/images/anime/11/75274l.jpg',   // Bakemonogatari
  'aut-5': 'https://cdn.myanimelist.net/images/anime/2/73249l.jpg',    // Fate/Zero
  'aut-6': 'https://cdn.myanimelist.net/images/anime/1769/138443l.jpg', // Pluto
  'aut-7': 'https://cdn.myanimelist.net/images/anime/5/71553l.jpg',    // Death Parade
  'aut-8': 'https://cdn.myanimelist.net/images/anime/11/29085l.jpg',   // Samurai Champloo
  'aut-9': 'https://cdn.myanimelist.net/images/anime/10/71772l.jpg',   // Durarara!!
  'aut-10': 'https://cdn.myanimelist.net/images/anime/1908/103632l.jpg',// Psycho-Pass 3

  // WINTER
  'win-1': 'https://cdn.myanimelist.net/images/anime/1500/103005l.jpg', // Vinland Saga
  'win-2': 'https://cdn.myanimelist.net/images/anime/11/79410l.jpg',   // Re:Zero
  'win-3': 'https://cdn.myanimelist.net/images/anime/1169/93121l.jpg',  // Golden Kamuy
  'win-4': 'https://cdn.myanimelist.net/images/anime/1879/100467l.jpg', // Dororo
  'win-5': 'https://cdn.myanimelist.net/images/anime/1758/139369l.jpg', // Dungeon Meshi
  'win-6': 'https://cdn.myanimelist.net/images/anime/1530/117776l.jpg', // Mushoku Tensei
  'win-7': 'https://cdn.myanimelist.net/images/anime/11/59389l.jpg',   // Noragami
  'win-8': 'https://cdn.myanimelist.net/images/anime/11/4988l.jpg',    // Ergo Proxy
  'win-9': 'https://cdn.myanimelist.net/images/anime/11/75567l.jpg',   // Wolf's Rain
  'win-10': 'https://cdn.myanimelist.net/images/anime/10/73245l.jpg',  // Gintama

  // SHOUNEN
  'shn-1': 'https://cdn.myanimelist.net/images/anime/1244/138851l.jpg', // One Piece
  'shn-2': 'https://cdn.myanimelist.net/images/anime/1565/111305l.jpg', // Naruto Shippuden
  'shn-3': 'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg',  // Hunter x Hunter
  'shn-4': 'https://cdn.myanimelist.net/images/anime/2/88336l.jpg',    // Black Clover
  'shn-5': 'https://cdn.myanimelist.net/images/anime/1613/102576l.jpg', // Dr. Stone
  'shn-6': 'https://cdn.myanimelist.net/images/anime/1482/101859l.jpg', // Fire Force
  'shn-7': 'https://cdn.myanimelist.net/images/anime/1830/118995l.jpg', // Tokyo Revengers
  'shn-8': 'https://cdn.myanimelist.net/images/anime/12/65545l.jpg',   // Yu Yu Hakusho
  'shn-9': 'https://cdn.myanimelist.net/images/anime/1344/136015l.jpg', // Rurouni Kenshin
  'shn-10': 'https://cdn.myanimelist.net/images/anime/9/75260l.jpg',   // Soul Eater

  // SHOUJO
  'shj-1': 'https://cdn.myanimelist.net/images/anime/3/65113l.jpg',    // Sailor Moon Crystal
  'shj-2': 'https://cdn.myanimelist.net/images/anime/7/75949l.jpg',    // Ouran High School
  'shj-3': 'https://cdn.myanimelist.net/images/anime/11/11666l.jpg',   // Cardcaptor Sakura
  'shj-4': 'https://cdn.myanimelist.net/images/anime/3/5079l.jpg',     // Nana
  'shj-5': 'https://cdn.myanimelist.net/images/anime/12/68097l.jpg',   // Yona of the Dawn
  'shj-6': 'https://cdn.myanimelist.net/images/anime/13/64515l.jpg',   // Ao Haru Ride
  'shj-7': 'https://cdn.myanimelist.net/images/anime/10/25366l.jpg',   // Kimi ni Todoke
  'shj-8': 'https://cdn.myanimelist.net/images/anime/6/26458l.jpg',    // Maid Sama!
  'shj-9': 'https://cdn.myanimelist.net/images/anime/8/80407l.jpg',    // Orange
  'shj-10': 'https://cdn.myanimelist.net/images/anime/9/42609l.jpg',   // My Little Monster

  // KODOMO
  'kod-1': 'https://cdn.myanimelist.net/images/anime/13/11497l.jpg',   // Pokemon
  'kod-2': 'https://cdn.myanimelist.net/images/anime/12/58951l.jpg',   // Doraemon
  'kod-3': 'https://cdn.myanimelist.net/images/anime/10/10996l.jpg',   // Digimon Adventure
  'kod-4': 'https://cdn.myanimelist.net/images/anime/4/75923l.jpg',    // My Neighbor Totoro
  'kod-5': 'https://cdn.myanimelist.net/images/anime/4/22806l.jpg',    // Crayon Shin-chan
  'kod-6': 'https://cdn.myanimelist.net/images/anime/10/64461l.jpg',   // Yo-kai Watch
  'kod-7': 'https://cdn.myanimelist.net/images/anime/12/28532l.jpg',   // Beyblade
  'kod-8': 'https://cdn.myanimelist.net/images/anime/12/75932l.jpg',   // Ponyo
  'kod-9': 'https://cdn.myanimelist.net/images/anime/10/75947l.jpg',   // Inazuma Eleven
  'kod-10': 'https://cdn.myanimelist.net/images/anime/12/84687l.jpg',  // Little Witch Academia

  // SEINEN
  'sei-1': 'https://cdn.myanimelist.net/images/anime/11/79883l.jpg',   // Berserk
  'sei-2': 'https://cdn.myanimelist.net/images/anime/5/64449l.jpg',    // Tokyo Ghoul
  'sei-3': 'https://cdn.myanimelist.net/images/anime/11/3833l.jpg',    // Ghost in the Shell SAC
  'sei-4': 'https://cdn.myanimelist.net/images/anime/7/73199l.jpg',    // Parasyte
  'sei-5': 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg',    // Hellsing Ultimate
  'sei-6': 'https://cdn.myanimelist.net/images/anime/7/37397l.jpg',    // Kingdom
  'sei-7': 'https://cdn.myanimelist.net/images/anime/8/75924l.jpg',    // Vagabond Heritage
  'sei-8': 'https://cdn.myanimelist.net/images/anime/10/59489l.jpg',   // Ping Pong
  'sei-9': 'https://cdn.myanimelist.net/images/anime/6/15779l.jpg',    // Black Lagoon
  'sei-10': 'https://cdn.myanimelist.net/images/anime/3/77196l.jpg',   // Ajin

  // JOSEI
  'jos-1': 'https://cdn.myanimelist.net/images/anime/12/32331l.jpg',   // Chihayafuru
  'jos-2': 'https://cdn.myanimelist.net/images/anime/11/4849l.jpg',    // Nodame Cantabile
  'jos-3': 'https://cdn.myanimelist.net/images/anime/4/77443l.jpg',    // Rakugo Shinju
  'jos-4': 'https://cdn.myanimelist.net/images/anime/7/6225l.jpg',     // Paradise Kiss
  'jos-5': 'https://cdn.myanimelist.net/images/anime/9/26197l.jpg',    // Princess Jellyfish
  'jos-6': 'https://cdn.myanimelist.net/images/anime/7/75936l.jpg',    // Honey and Clover
  'jos-7': 'https://cdn.myanimelist.net/images/anime/8/38229l.jpg',    // Kids on the Slope
  'jos-8': 'https://cdn.myanimelist.net/images/anime/11/31411l.jpg',   // Usagi Drop
  'jos-9': 'https://cdn.myanimelist.net/images/anime/11/13926l.jpg',   // Ristorante Paradiso
  'jos-10': 'https://cdn.myanimelist.net/images/anime/1769/93444l.jpg'  // Wotakoi
};

/**
 * Returns authentic official anime poster URL or high-fidelity generated anime poster
 */
export function getAnimePoster(anime) {
  if (OFFICIAL_ANIME_POSTERS[anime.id]) {
    return OFFICIAL_ANIME_POSTERS[anime.id];
  }
  if (anime.image && !anime.image.includes('unsplash.com')) {
    return anime.image;
  }
  return createStylizedAnimePosterSVG(anime);
}

/**
 * High-fidelity anime poster SVG generator
 * Generates dark, glowing anime poster art with Japanese calligraphy and studio logo
 */
export function createStylizedAnimePosterSVG(anime) {
  const title = (anime.title || 'Anime').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
  const jp = (anime.japaneseTitle || title).replace(/&/g, '&amp;').replace(/'/g, '&#39;');
  const studio = (anime.studio || 'Studio').replace(/&/g, '&amp;').replace(/'/g, '&#39;');
  const rating = anime.rating || '8.5';
  const move = (anime.signatureMove || 'Secret Attack').replace(/&/g, '&amp;').replace(/'/g, '&#39;');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a0f1d"/>
          <stop offset="50%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <radialGradient id="auraGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
          <stop offset="60%" stop-color="#ef4444" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      
      <!-- Background Base -->
      <rect width="400" height="600" fill="url(#bgGrad)"/>
      <circle cx="200" cy="240" r="180" fill="url(#auraGlow)"/>

      <!-- Cyber-Anime Framing -->
      <rect x="15" y="15" width="370" height="570" fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-width="2" rx="10"/>
      <rect x="22" y="22" width="356" height="556" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" rx="8"/>

      <!-- Japanese Vertical Calligraphy Watermark -->
      <text x="350" y="80" font-family="'Noto Sans JP', sans-serif" font-weight="900" font-size="28" fill="rgba(255, 255, 255, 0.08)" writing-mode="vertical-rl">${jp.slice(0, 8)}</text>

      <!-- Center Iconic Anime Silhouette Symbol -->
      <g transform="translate(200, 240)">
        <circle r="75" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 6"/>
        <polygon points="0,-60 52,30 -52,30" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" stroke-width="2"/>
        <text y="15" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="44" fill="#ffffff">⚡</text>
      </g>

      <!-- Top Studio & Rating Tag -->
      <text x="35" y="55" font-family="'Space Grotesk', sans-serif" font-size="12" font-weight="700" fill="#38bdf8" letter-spacing="2">${studio.toUpperCase()}</text>
      <rect x="300" y="38" width="65" height="24" rx="12" fill="rgba(15, 23, 42, 0.9)" stroke="#fbbf24" stroke-width="1.5"/>
      <text x="332" y="54" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="11" font-weight="800" fill="#fbbf24">⭐ ${rating}</text>

      <!-- Bottom Title Card -->
      <rect x="15" y="440" width="370" height="145" fill="rgba(7, 10, 20, 0.92)" rx="0"/>
      <line x1="15" y1="440" x2="385" y2="440" stroke="#38bdf8" stroke-width="2"/>

      <text x="35" y="475" font-family="'Noto Sans JP', sans-serif" font-size="12" font-weight="700" fill="#94a3b8">${jp}</text>
      <text x="35" y="508" font-family="'Outfit', 'Space Grotesk', sans-serif" font-size="22" font-weight="900" fill="#ffffff">${title.length > 22 ? title.slice(0, 20) + '...' : title}</text>
      
      <!-- Signature Move Footer Tag -->
      <rect x="35" y="525" width="220" height="22" rx="4" fill="rgba(239, 68, 68, 0.2)" stroke="rgba(239, 68, 68, 0.4)"/>
      <text x="45" y="540" font-family="'Space Grotesk', sans-serif" font-size="10" font-weight="700" fill="#fca5a5">💥 ${move.slice(0, 28)}</text>
    </svg>
  `;

  try {
    if (typeof btoa !== 'undefined') {
      const b64 = btoa(unescape(encodeURIComponent(svg)));
      return `data:image/svg+xml;base64,${b64}`;
    }
  } catch (e) {}
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg).replace(/'/g, '%27')}`;
}
