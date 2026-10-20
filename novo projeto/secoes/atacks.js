// Aba Atacks: todos os golpes do jogo e quem aprende
import { esc, listaInfinita } from "../ui.js";
import { nice } from "../poke.js";
import { carregarGolpes, golpesDoPokemon, cardGolpe, filtrosHTML, aplicarFiltros, ligarFiltros } from "./golpes-dados.js";

export async function render(el) {
  el.innerHTML = `
    <div class="secao-titulo"><h2>🔀 Atacks</h2><p>Todos os golpes do jogo. Abra "Quem aprende" para ver os Pokémon.</p></div>
    ${filtrosHTML("at")}
    <div class="count" id="at-count"></div>
    <div class="grid golpe-grid" id="at-grid"></div>
    <div id="at-fim"></div>`;

  const base = await carregarGolpes();
  // golpe -> ["Bulbasaur (Nv. 9)", ...]
  const aprende = {};
  for (const p of base.pokes)
    for (const g of golpesDoPokemon(p, base)) (aprende[g.nome] ??= []).push(`${p.n || nice(p.s)} (${g.origem})`);

  let parar = () => {};
  const card = (g) => {
    const quem = aprende[g.nome] || [];
    return cardGolpe(g, {
      extra: quem.length
        ? `<details class="quem"><summary>Quem aprende (${quem.length})</summary><p>${quem.map(esc).join(", ")}</p></details>`
        : "",
    });
  };
  function filtrar() {
    const itens = aplicarFiltros(el, "at", base.golpes);
    el.querySelector("#at-count").textContent = `🔀 ${itens.length} golpes`;
    parar();
    parar = listaInfinita(el.querySelector("#at-grid"), el.querySelector("#at-fim"), itens, card);
    if (!itens.length) el.querySelector("#at-grid").innerHTML = `<div class="msg">Nenhum golpe encontrado.</div>`;
  }
  ligarFiltros(el, "at", filtrar);
  filtrar();
  return () => parar();
}
