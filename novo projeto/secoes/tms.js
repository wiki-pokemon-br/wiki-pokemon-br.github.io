// Aba TMs (dados em dados/tms.json)
import { dados, esc, norm, btnSugerir, btnCopiar, listaInfinita } from "../ui.js";
import { TYPES, sprite, typeBadge } from "../poke.js";

export const CATS = {
  boss: ["Boss", "#e11d48"], eventos: ["Eventos", "#2563eb"], spawns: ["Spawns", "#16a34a"],
  craft: ["Craft", "#9333ea"], quest: ["Quest", "#0891b2"], desconhecido: ["Desconhecido", "#f97316"],
};
export const slug = (s) => norm(s).replace(/[.'’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const tmNum = (n) => (n ? "TM" + String(n).padStart(2, "0") : "TM??");

function card(t, ids) {
  const cor = (TYPES[t.tipo] || [, "#888"])[1];
  const [cat, catCor] = CATS[t.categoria] || CATS.desconhecido;
  const id = ids[slug(t.origem)];
  const origem = id
    ? `<img class="tm-poke" src="${sprite(id)}" alt="" loading="lazy">`
    : `<div class="tm-icon">${t.categoria === "craft" ? "⚙️" : "❓"}</div>`;
  const texto = `${tmNum(t.numero)} - ${t.nome} | Origem: ${t.origem || "?"} (${cat})`;
  return `
  <article class="tm">
    <div class="disc" style="--c:${cor}"></div>
    <div class="tm-num">${tmNum(t.numero)}</div>
    <div class="tm-name">${esc(t.nome)}</div>
    <div class="tm-types">${typeBadge(t.tipo)}${t.golpe ? `<span class="tag">${esc(t.golpe)}</span>` : ""}</div>
    ${origem}
    <div class="tm-origem">${esc(t.origem || "Desconhecido")}</div>
    <span class="cat-tag" style="--c:${catCor}">${cat}</span>
    <div class="acoes">${btnSugerir("tms", String(t.numero ?? t.nome), `${tmNum(t.numero)} ${t.nome}`)}${btnCopiar(texto)}</div>
  </article>`;
}

export async function render(el) {
  el.innerHTML = `
    <div class="painel-busca">
      <input id="tm-q" type="search" placeholder="🔍 Buscar TM por nome, número ou Pokémon…" autocomplete="off">
      <div class="chips" id="tm-chips">
        <button class="chip active" data-cat="" style="--c:#374151">Todos</button>
        ${Object.entries(CATS).map(([k, [l, c]]) => `<button class="chip" data-cat="${k}" style="--c:${c}">${l}</button>`).join("")}
      </div>
    </div>
    <div class="count" id="tm-count"></div>
    <div class="grid tm-grid" id="tm-grid"></div>
    <div id="tm-fim"></div>`;

  const [tms, pokes] = await Promise.all([dados("tms"), dados("pokemon")]);
  const ids = Object.fromEntries(pokes.map(([id, nome]) => [nome, id]));
  const $ = (id) => el.querySelector("#" + id);
  let cat = "", parar = () => {};

  function filtrar() {
    const q = norm($("tm-q").value).replace(/^tm\s*0*/, "");
    const itens = tms.filter((t) =>
      (!cat || t.categoria === cat) &&
      (!q || norm(t.nome).includes(q) || norm(t.origem).includes(q) || String(t.numero) === q));
    $("tm-count").textContent = `💿 ${itens.length} TMs`;
    parar();
    parar = listaInfinita($("tm-grid"), $("tm-fim"), itens, (t) => card(t, ids));
    if (!itens.length) $("tm-grid").innerHTML = `<div class="msg">Nenhum TM encontrado.</div>`;
  }

  $("tm-q").oninput = filtrar;
  $("tm-chips").onclick = (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    cat = b.dataset.cat;
    $("tm-chips").querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
    filtrar();
  };
  filtrar();
  return () => parar();
}
