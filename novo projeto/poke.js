// Dados e utilitários da PokéAPI (https://pokeapi.co — gratuita e pública)
export const API = "https://pokeapi.co/api/v2/";
const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/";
export const art = (id) => `${SPRITES}pokemon/other/official-artwork/${id}.png`;
export const sprite = (id) => `${SPRITES}pokemon/${id}.png`;
export const itemIcon = (nome) => `${SPRITES}items/${nome}.png`;

export const TYPES = {
  normal:   ["Normal",   "#A8A77A", "⚪"], fire:    ["Fogo",     "#EE8130", "🔥"],
  water:    ["Água",     "#6390F0", "💧"], electric:["Elétrico", "#F7D02C", "⚡"],
  grass:    ["Planta",   "#7AC74C", "🍃"], ice:     ["Gelo",     "#96D9D6", "❄️"],
  fighting: ["Lutador",  "#C22E28", "🥊"], poison:  ["Venenoso", "#A33EA1", "☠️"],
  ground:   ["Terrestre","#E2BF65", "⛰️"], flying:  ["Voador",   "#A98FF3", "🪶"],
  psychic:  ["Psíquico", "#F95587", "🔮"], bug:     ["Inseto",   "#A6B91A", "🐛"],
  rock:     ["Pedra",    "#B6A136", "🪨"], ghost:   ["Fantasma", "#735797", "👻"],
  dragon:   ["Dragão",   "#6F35FC", "🐉"], dark:    ["Sombrio",  "#705746", "🌑"],
  steel:    ["Aço",      "#B7B7CE", "⚙️"], fairy:   ["Fada",     "#D685AD", "✨"],
};

export const CATEGORIAS = { physical: "Físico", special: "Especial", status: "Status" };

export const GENS = [
  ["Todas", 1, 1025], ["1ª · Kanto", 1, 151], ["2ª · Johto", 152, 251],
  ["3ª · Hoenn", 252, 386], ["4ª · Sinnoh", 387, 493], ["5ª · Unova", 494, 649],
  ["6ª · Kalos", 650, 721], ["7ª · Alola", 722, 809], ["8ª · Galar", 810, 905],
  ["9ª · Paldea", 906, 1025],
];

export const STATS = {
  hp: "HP", attack: "Ataque", defense: "Defesa",
  "special-attack": "Atq. Esp.", "special-defense": "Def. Esp.", speed: "Velocidade",
};
export const STAT_LABELS = Object.values(STATS);

// Tabela de tipos: atacante -> { defensor: multiplicador }
const CHART = {
  normal: { rock: .5, steel: .5, ghost: 0 },
  fire: { grass: 2, ice: 2, bug: 2, steel: 2, fire: .5, water: .5, rock: .5, dragon: .5 },
  water: { fire: 2, ground: 2, rock: 2, water: .5, grass: .5, dragon: .5 },
  electric: { water: 2, flying: 2, electric: .5, grass: .5, dragon: .5, ground: 0 },
  grass: { water: 2, ground: 2, rock: 2, fire: .5, grass: .5, poison: .5, flying: .5, bug: .5, dragon: .5, steel: .5 },
  ice: { grass: 2, ground: 2, flying: 2, dragon: 2, fire: .5, water: .5, ice: .5, steel: .5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: .5, flying: .5, psychic: .5, bug: .5, fairy: .5, ghost: 0 },
  poison: { grass: 2, fairy: 2, poison: .5, ground: .5, rock: .5, ghost: .5, steel: 0 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: .5, bug: .5, flying: 0 },
  flying: { grass: 2, fighting: 2, bug: 2, electric: .5, rock: .5, steel: .5 },
  psychic: { fighting: 2, poison: 2, psychic: .5, steel: .5, dark: 0 },
  bug: { grass: 2, psychic: 2, dark: 2, fire: .5, fighting: .5, poison: .5, flying: .5, ghost: .5, steel: .5, fairy: .5 },
  rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: .5, ground: .5, steel: .5 },
  ghost: { psychic: 2, ghost: 2, dark: .5, normal: 0 },
  dragon: { dragon: 2, steel: .5, fairy: 0 },
  dark: { psychic: 2, ghost: 2, fighting: .5, dark: .5, fairy: .5 },
  steel: { ice: 2, rock: 2, fairy: 2, fire: .5, water: .5, electric: .5, steel: .5 },
  fairy: { fighting: 2, dragon: 2, dark: 2, fire: .5, poison: .5, steel: .5 },
};

// Retorna { "4": [...], "2": [...], "0.5": [...], "0.25": [...], "0": [...] }
export function fraquezas(tipos) {
  const out = { 4: [], 2: [], 0.5: [], 0.25: [], 0: [] };
  for (const atk of Object.keys(CHART)) {
    const m = tipos.reduce((acc, def) => acc * (CHART[atk][def] ?? 1), 1);
    if (m !== 1) out[m].push(atk);
  }
  return out;
}

export const idFromUrl = (url) => Number(url.split("/").filter(Boolean).pop());
export const pad = (n) => "#" + String(n).padStart(4, "0");
export const nice = (s) => String(s).split("-").map((w) => w && w[0].toUpperCase() + w.slice(1)).join(" ");

export function typeBadge(t) {
  const [label, color, icon] = TYPES[t] || [t, "#888", ""];
  return `<span class="type" style="--c:${color}">${icon} ${label}</span>`;
}

const cache = new Map();
export async function getJSON(url) {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => {
    if (!r.ok) throw new Error("Erro " + r.status);
    return r.json();
  }));
  return cache.get(url);
}
