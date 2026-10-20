// Construtor de movesets (usado pelas abas Smeargle e MOVE7)
import { esc, copiar } from "../ui.js";
import { sprite, typeBadge, fraquezas, TYPES, nice } from "../poke.js";
import { carregarGolpes, golpesDoPokemon, cardGolpe, filtrosHTML, aplicarFiltros, ligarFiltros } from "./golpes-dados.js";

const MAX = 9;
const lerBuilds = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const salvarBuilds = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export async function construtor(el, { chave, titulo, subtitulo, fixo }) {
  el.innerHTML = `
    <div class="construtor">
      <aside class="build-lado">
        <div class="build-img"><img id="${chave}-img" alt=""></div>
        <div class="build-num" id="${chave}-num"></div>
        <h3 id="${chave}-nome">Escolha um Pokémon</h3>
        <div class="pk-types" id="${chave}-tipos"></div>
        <div class="power">POWER TOTAL: <b id="${chave}-power">0</b></div>
        <details class="drop" id="${chave}-fr-box"><summary>🛡️ Fraquezas</summary><div id="${chave}-fr"></div></details>
        <div class="selecionados">
          <h4>📋 Golpes selecionados (<span id="${chave}-n">0</span>/${MAX})</h4>
          <ol id="${chave}-sel"></ol>
        </div>
        <button class="btn ghost" id="${chave}-limpar">🗑️ Limpar tudo</button>
      </aside>
      <section class="build-main">
        <div class="build-top">
          <div><h2>${titulo}</h2><p>${subtitulo}</p></div>
          <button class="btn" id="${chave}-copiar">📋 Copiar moveset</button>
        </div>
        ${fixo ? "" : `
        <label class="escolher">🔎 Pokémon
          <input id="${chave}-poke" list="${chave}-lista" placeholder="Digite o nome do Pokémon…" autocomplete="off">
          <datalist id="${chave}-lista"></datalist>
        </label>`}
        ${filtrosHTML(chave)}
        <div class="builds">
          <select id="${chave}-builds"><option value="">💾 Builds salvas…</option></select>
          <button class="mini copy" id="${chave}-salvar">💾 Salvar build</button>
          <button class="mini limpar" id="${chave}-apagar">🗑️ Apagar build</button>
        </div>
        <div class="aviso" id="${chave}-aviso"></div>
        <div class="grid golpe-grid" id="${chave}-grid"></div>
      </section>
    </div>`;

  const base = await carregarGolpes();
  const $ = (id) => el.querySelector(`#${chave}-${id}`);
  const KEY = "wikipokemon-builds-" + chave;
  let poke = null, lista = [], sel = [];

  function setPokemon(p) {
    poke = p;
    sel = [];
    lista = !p ? [] : fixo ? base.golpes : golpesDoPokemon(p, base);
    $("img").src = p?.id ? sprite(p.id) : "";
    $("img").style.visibility = p?.id ? "visible" : "hidden";
    $("num").textContent = p?.id ? "#" + p.id : "";
    $("nome").textContent = p ? p.n || nice(p.s) : "Escolha um Pokémon";
    $("tipos").innerHTML = p ? p.t.map(typeBadge).join("") : "";
    const fr = p ? fraquezas(p.t) : null;
    $("fr").innerHTML = fr ? [["4", "4×"], ["2", "2×"], ["0.5", "½×"], ["0.25", "¼×"], ["0", "Imune"]]
      .filter(([m]) => fr[m].length).map(([m, l]) => `<div class="fr"><b>${l}</b><div>${fr[m].map(typeBadge).join("")}</div></div>`).join("") : "";
    $("aviso").textContent = !p ? "Escolha um Pokémon para ver os golpes." : lista.length ? "" : "Nenhum golpe cadastrado para este Pokémon.";
    atualizar();
  }

  function atualizar() {
    $("n").textContent = sel.length;
    $("power").textContent = sel.reduce((s, n) => s + (base.porNome[n]?.pow || 0), 0);
    $("sel").innerHTML = sel.length
      ? sel.map((n) => `<li>${esc(n)} <button data-tirar="${esc(n)}" title="Remover">✖</button></li>`).join("")
      : `<p class="vazio">Nenhum golpe selecionado</p>`;
    const itens = aplicarFiltros(el, chave, lista);
    $("grid").innerHTML = itens.map((g) => cardGolpe(g, { selecionado: sel.includes(g.nome) })).join("");
    const builds = lerBuilds(KEY).filter((b) => fixo || b.pokemon === poke?.s);
    $("builds").innerHTML = `<option value="">💾 Builds salvas (${builds.length})…</option>` +
      builds.map((b) => `<option value="${esc(b.nome)}">${esc(b.nome)}</option>`).join("");
  }

  $("grid").onclick = (e) => {
    const c = e.target.closest(".golpe");
    if (!c) return;
    const n = c.dataset.golpe;
    if (sel.includes(n)) sel = sel.filter((x) => x !== n);
    else if (sel.length >= MAX) { $("aviso").textContent = `Máximo de ${MAX} golpes.`; return; }
    else sel.push(n);
    $("aviso").textContent = "";
    atualizar();
  };
  $("sel").onclick = (e) => {
    const b = e.target.closest("[data-tirar]");
    if (b) { sel = sel.filter((x) => x !== b.dataset.tirar); atualizar(); }
  };
  $("limpar").onclick = () => { sel = []; atualizar(); };
  $("copiar").onclick = (e) => {
    if (!poke) return;
    const txt = `${poke.n || nice(poke.s)}: ${sel.join(", ") || "(nenhum golpe)"} | Power total: ${$("power").textContent}`;
    copiar(txt, e.currentTarget);
  };
  $("salvar").onclick = () => {
    if (!poke || !sel.length) return ($("aviso").textContent = "Selecione golpes antes de salvar.");
    const nome = prompt("Nome da build:", `${poke.n || nice(poke.s)} ${new Date().toLocaleDateString("pt-BR")}`);
    if (!nome) return;
    const builds = lerBuilds(KEY).filter((b) => b.nome !== nome);
    builds.push({ nome, pokemon: poke.s, golpes: sel });
    salvarBuilds(KEY, builds);
    atualizar();
  };
  $("builds").onchange = () => {
    const b = lerBuilds(KEY).find((x) => x.nome === $("builds").value);
    if (!b) return;
    if (!fixo && b.pokemon !== poke?.s) setPokemon(base.pokes.find((p) => p.s === b.pokemon));
    sel = b.golpes.filter((n) => lista.some((g) => g.nome === n));
    atualizar();
    $("builds").value = b.nome;
  };
  $("apagar").onclick = () => {
    const nome = $("builds").value;
    if (!nome) return;
    salvarBuilds(KEY, lerBuilds(KEY).filter((b) => b.nome !== nome));
    atualizar();
  };
  ligarFiltros(el, chave, atualizar);

  if (fixo) setPokemon(base.pokes.find((p) => p.s === fixo) || { s: fixo, n: nice(fixo), t: ["normal"], id: 235 });
  else {
    $("lista").innerHTML = base.pokes.map((p) => `<option value="${esc(p.n || nice(p.s))}">`).join("");
    $("poke").onchange = $("poke").oninput = () => {
      const v = $("poke").value.trim().toLowerCase();
      const p = base.pokes.find((x) => (x.n || "").toLowerCase() === v || x.s === v);
      if (p && p !== poke) setPokemon(p);
    };
    setPokemon(null);
  }
}
