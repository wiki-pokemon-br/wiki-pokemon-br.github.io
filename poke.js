// Dados e utilitários da PokéAPI (https://pokeapi.co — gratuita e pública)
export const API = "https://pokeapi.co/api/v2/";
export const art = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const TYPES = {
  normal:   ["Normal",   "#A8A77A"], fire:    ["Fogo",     "#EE8130"],
  water:    ["Água",     "#6390F0"], electric:["Elétrico", "#F7D02C"],
  grass:    ["Planta",   "#7AC74C"], ice:     ["Gelo",     "#96D9D6"],
  fighting: ["Lutador",  "#C22E28"], poison:  ["Venenoso", "#A33EA1"],
  ground:   ["Terrestre","#E2BF65"], flying:  ["Voador",   "#A98FF3"],
  psychic:  ["Psíquico", "#F95587"], bug:     ["Inseto",   "#A6B91A"],
  rock:     ["Pedra",    "#B6A136"], ghost:   ["Fantasma", "#735797"],
  dragon:   ["Dragão",   "#6F35FC"], dark:    ["Sombrio",  "#705746"],
  steel:    ["Aço",      "#B7B7CE"], fairy:   ["Fada",     "#D685AD"],
};

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

export const idFromUrl = (url) => Number(url.split("/").filter(Boolean).pop());
export const pad = (n) => "#" + String(n).padStart(4, "0");
export const nice = (s) => s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

export function typeBadge(t) {
  const [label, color] = TYPES[t] || [t, "#888"];
  return `<span class="type" style="--c:${color}">${label}</span>`;
}

const cache = new Map();
export async function getJSON(url) {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => {
    if (!r.ok) throw new Error("Erro " + r.status);
    return r.json();
  }));
  return cache.get(url);
}
