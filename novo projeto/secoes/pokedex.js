// Aba Pokédex: cards com tipos, fraquezas, status, localização e sugestões
import { dados, esc, norm, sugestoes, sugestoesDe, btnSugerir, btnCopiar, listaInfinita } from "../ui.js";
import { TYPES, GENS, STAT_LABELS, sprite, typeBadge, nice, fraquezas } from "../poke.js";

const MULT = [["4", "4×"], ["2", "2×"], ["0.5", "½×"], ["0.25", "¼×"], ["0", "Imune"]];

function card(p, locs, sugs) {
  const [id, nome, tipos, stats] = p;
  const n = nice(nome);
  const fr = fraquezas(tipos);
  const loc = locs[nome] || [];
  const comunidade = sugestoesDe(sugs, "pokedex", nome);
  const texto = `${n} (#${id}) - ${tipos.map((t) => TYPES[t][0]).join("/")}\n📍 ${loc.length ? loc.join(" | ") : "Não informado"}`;
  return `
  <article class="pk">
    <a class="pk-img" href="pokemon.html?id=${id}"><img src="${sprite(id)}" alt="${n}" loading="lazy"></a>
    <div class="pk-num">#${id}</div>
    <a class="pk-name" href="pokemon.html?id=${id}">${n}</a>
    <div class="pk-types">${tipos.map(typeBadge).join("")}</div>
    <details class="drop">
      <summary>🛡️ Fraquezas</summary>
      ${MULT.filter(([m]) => fr[m].length).map(([m, l]) =>
        `<div class="fr"><b>${l}</b><div>${fr[m].map(typeBadge).join("")}</div></div>`).join("")}
    </details>
    <details class="drop">
      <summary>📊 Status</summary>
      ${stats.map((v, i) => `<div class="stat"><span>${STAT_LABELS[i]}</span><b>${v}</b><div class="bar"><i style="width:${Math.min(100, v / 2)}%"></i></div></div>`).join("")}
      <div class="stat total"><span>Total</span><b>${stats.reduce((a, b) => a + b, 0)}</b></div>
    </details>
    <div class="info">
      <h4>📍 Localização</h4>
      ${loc.length ? `<ul>${loc.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : `<p>Não informado</p>`}
    </div>
    ${comunidade.length ? `<div class="info comunidade"><h4>💡 Sugestão da Comunidade</h4><ul>${comunidade.map((s) => `<li>${esc(s.texto)}</li>`).join("")}</ul></div>` : ""}
    <div class="acoes">${btnSugerir("pokedex", nome, n)}${btnCopiar(texto)}</div>
  </article>`;
}

export async function render(el) {
  el.innerHTML = `
    <div class="toolbar">
      <span class="count" id="dex-count">…</span>
      <button class="mini filtro" id="dex-filtros">🔽 Filtros</button>
      <input id="dex-q" type="search" placeholder="🔍 Buscar Pokémon (nome, número, tipo, localização) • Separe com vírgula" autocomplete="off">
    </div>
    <div class="filtros" id="dex-painel" hidden>
      <select id="dex-gen">${GENS.map((g, i) => `<option value="${i}">${g[0]}</option>`).join("")}</select>
      <select id="dex-tipo"><option value="">Todos os tipos</option>${Object.entries(TYPES).map(([k, [l]]) => `<option value="${k}">${l}</option>`).join("")}</select>
    </div>
    <div class="grid pk-grid" id="dex-grid"></div>
    <div id="dex-fim"></div>`;

  const [lista, locs, sugs] = await Promise.all([dados("pokemon"), dados("localizacoes"), sugestoes()]);
  const $ = (id) => el.querySelector("#" + id);
  let parar = () => {};

  function filtrar() {
    const termos = norm($("dex-q").value).split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean);
    const [, de, ate] = GENS[$("dex-gen").value];
    const tipo = $("dex-tipo").value;
    const itens = lista.filter(([id, nome, tipos]) => {
      if (id < de || id > ate || (tipo && !tipos.includes(tipo))) return false;
      if (!termos.length) return true;
      const alvo = [nome, ...tipos, ...tipos.map((t) => norm(TYPES[t][0])), ...(locs[nome] || []).map(norm)];
      return termos.some((t) => String(id) === t || alvo.some((a) => a.includes(t)));
    });
    $("dex-count").textContent = `📦 ${itens.length} Pokémons`;
    parar();
    parar = listaInfinita($("dex-grid"), $("dex-fim"), itens, (p) => card(p, locs, sugs));
    if (!itens.length) $("dex-grid").innerHTML = `<div class="msg">Nenhum Pokémon encontrado 😢</div>`;
  }

  $("dex-filtros").onclick = () => ($("dex-painel").hidden = !$("dex-painel").hidden);
  $("dex-q").oninput = filtrar;
  $("dex-gen").onchange = filtrar;
  $("dex-tipo").onchange = filtrar;
  filtrar();
  return () => parar();
}
