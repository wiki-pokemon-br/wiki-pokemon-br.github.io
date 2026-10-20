// Golpes do jogo (dados/movesets.json) + PP da PokéAPI (dados/golpes.json)
import { dados, esc } from "../ui.js";
import { TYPES, CATEGORIAS } from "../poke.js";
import { slug } from "./tms.js";

const CAT = { p: "physical", s: "special", t: "status" };
// Golpes com nome diferente no jogo -> nome na PokéAPI
const ALIAS = { "False Swipes": "false-swipe", "Fury Swipe": "fury-swipes", "Icy Fang": "ice-fang", "Mega Horn": "megahorn" };
let cache;

export function carregarGolpes() {
  return (cache ??= (async () => {
    const [ms, api, pokes] = await Promise.all([dados("movesets"), dados("golpes"), dados("pokemon")]);
    const extra = Object.fromEntries(api.map((g) => [g[0], g]));
    const golpes = Object.entries(ms.moves).map(([nome, [tipo, c, pow, acc]]) => {
      const g = extra[ALIAS[nome] || slug(nome)];
      // Golpe sem tipo na wiki: completa com a PokéAPI
      if (!tipo && g) return { nome, tipo: g[1], cat: g[2], pow: g[3] || 0, acc: g[5], pp: g[4] };
      return { nome, tipo, cat: CAT[c] || "status", pow: pow || 0, acc, pp: g?.[4] ?? null };
    });
    // TMs que não estão na lista de golpes: completa com a PokéAPI
    for (const nome of Object.values(ms.tms)) {
      if (ms.moves[nome]) continue;
      const g = extra[ALIAS[nome] || slug(nome)];
      if (g) golpes.push({ nome, tipo: g[1], cat: g[2], pow: g[3] || 0, acc: g[5], pp: g[4] });
    }
    golpes.sort((a, b) => a.nome.localeCompare(b.nome));
    const porNome = Object.fromEntries(golpes.map((g) => [g.nome, g]));
    const ids = Object.fromEntries(pokes.map(([id, nome]) => [nome, id]));
    const lista = Object.values(ms.p).map((p) => ({ ...p, id: ids[p.s] || ids[p.s.split("-")[0]] }));
    return { golpes, porNome, pokes: lista, tms: ms.tms };
  })());
}

// Golpes que um Pokémon aprende: por nível e por TM
export function golpesDoPokemon(p, { porNome, tms }) {
  const out = [];
  for (const [nv, nome] of p.l || []) if (porNome[nome]) out.push({ ...porNome[nome], origem: `Nv. ${nv}` });
  for (const n of p.m || []) {
    const nome = tms[n];
    if (porNome[nome]) out.push({ ...porNome[nome], origem: "TM" + String(n).padStart(2, "0") });
  }
  return out;
}

export function cardGolpe(g, { selecionado = false, extra = "" } = {}) {
  const [tipo, cor, icone] = TYPES[g.tipo] || [g.tipo, "#888", "❔"];
  return `
  <article class="golpe ${selecionado ? "sel" : ""}" style="--c:${cor}" data-golpe="${esc(g.nome)}">
    <div class="g-icon">${icone}</div>
    <div class="g-name">${esc(g.nome)}</div>
    <div class="g-tags"><span>${tipo}</span><span>${CATEGORIAS[g.cat] || g.cat}</span></div>
    <div class="g-stats">PP: <b>${g.pp ?? "—"}</b> · Pow: <b>${g.pow || "—"}</b> · Acc: <b>${g.acc ? g.acc + "%" : "—"}</b></div>
    ${g.origem ? `<div class="g-origem">${esc(g.origem)}</div>` : ""}
    ${extra}
  </article>`;
}

// Filtros padrão (busca, tipo, categoria, ordem do power)
export const filtrosHTML = (p) => `
  <div class="filtros-golpes">
    <label>🔍 Buscar<input id="${p}-q" type="search" placeholder="Nome do golpe…" autocomplete="off"></label>
    <label>🔥 Tipo<select id="${p}-tipo"><option value="">Todos</option>${Object.entries(TYPES).map(([k, [l]]) => `<option value="${k}">${l}</option>`).join("")}</select></label>
    <label>✊ Categoria<select id="${p}-cat"><option value="">Todas</option>${Object.entries(CATEGORIAS).map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label>
    <label>⚡ Power<select id="${p}-pow"><option value="">Padrão</option><option value="desc">Maior primeiro</option><option value="asc">Menor primeiro</option></select></label>
  </div>`;

export function aplicarFiltros(el, p, lista) {
  const $ = (id) => el.querySelector(`#${p}-${id}`);
  const q = $("q").value.trim().toLowerCase(), tipo = $("tipo").value, cat = $("cat").value, pow = $("pow").value;
  const out = lista.filter((g) => (!q || g.nome.toLowerCase().includes(q)) && (!tipo || g.tipo === tipo) && (!cat || g.cat === cat));
  if (pow) out.sort((a, b) => (pow === "desc" ? b.pow - a.pow : a.pow - b.pow));
  return out;
}

export function ligarFiltros(el, p, fn) {
  ["q", "tipo", "cat", "pow"].forEach((id) => {
    const e = el.querySelector(`#${p}-${id}`);
    e[id === "q" ? "oninput" : "onchange"] = fn;
  });
}
