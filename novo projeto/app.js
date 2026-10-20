// Página principal: abas da wiki
import { requireApproved, renderHeader } from "./auth.js";
import { SITE_NAME } from "./firebase-config.js";
import { copiar, sugerir } from "./ui.js";

// [id, rótulo, arquivo da seção]
const ABAS = [
  ["pokedex",  "📕 Pokédex",  "./secoes/pokedex.js"],
  ["tms",      "💿 TMs",      "./secoes/tms.js"],
  ["atacks",   "🔀 Atacks",   "./secoes/atacks.js"],
  ["smeargle", "🎨 Smeargle", "./secoes/smeargle.js"],
  ["move7",    "🔨 MOVE7",    "./secoes/move7.js"],
  ["quests",   "🪧 Quests",   "./secoes/quests.js"],
];

const user = await requireApproved();
if (user) {
  renderHeader(user);
  document.getElementById("site-name").textContent = SITE_NAME;
  const nav = document.getElementById("abas");
  const box = document.getElementById("secao");
  nav.innerHTML = ABAS.map(([id, label]) => `<a href="#${id}" data-aba="${id}">${label}</a>`).join("");

  let limpar = null;
  async function abrir() {
    const id = location.hash.slice(1) || "pokedex";
    const aba = ABAS.find((a) => a[0] === id) || ABAS[0];
    nav.querySelectorAll("a").forEach((a) => a.classList.toggle("active", a.dataset.aba === aba[0]));
    document.title = `${aba[1].split(" ").slice(1).join(" ")} · ${SITE_NAME}`;
    if (limpar) limpar();
    box.innerHTML = `<div class="msg">Carregando…</div>`;
    try {
      const mod = await import(aba[2]);
      limpar = await mod.render(box);
    } catch (e) {
      box.innerHTML = `<div class="msg">Erro ao carregar esta aba. (${e.message})</div>`;
    }
  }
  addEventListener("hashchange", abrir);
  abrir();

  // Botões "Sugerir" e "Copiar" de todas as seções
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-acao]");
    if (!b) return;
    if (b.dataset.acao === "copiar") copiar(b.dataset.texto, b);
    if (b.dataset.acao === "sugerir") sugerir(b.dataset.secao, b.dataset.item, b.dataset.titulo);
  });
}
