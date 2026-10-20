// Utilitários das seções: dados, copiar, sugerir
import { sendSuggestion, approvedSuggestions } from "./auth.js";

const cache = {};
// Lê um arquivo da pasta "dados" (ex.: dados("tms") -> dados/tms.json)
export const dados = (nome) =>
  (cache[nome] ??= fetch(`dados/${nome}.json`).then((r) => (r.ok ? r.json() : [])).catch(() => []));

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

let sugs;
export const sugestoes = () => (sugs ??= approvedSuggestions().catch(() => []));
export const sugestoesDe = (lista, secao, item) => lista.filter((s) => s.secao === secao && s.item === item);

// Botões padrão (o clique é tratado em app.js)
export const btnSugerir = (secao, item, titulo) =>
  `<button class="mini sug" data-acao="sugerir" data-secao="${esc(secao)}" data-item="${esc(item)}" data-titulo="${esc(titulo)}">💡 Sugerir</button>`;
export const btnCopiar = (texto, label = "📋 Copiar") =>
  `<button class="mini copy" data-acao="copiar" data-texto="${esc(texto)}">${label}</button>`;

export async function copiar(texto, btn) {
  try { await navigator.clipboard.writeText(texto); }
  catch {
    const t = document.createElement("textarea");
    t.value = texto; document.body.append(t); t.select();
    try { document.execCommand("copy"); } catch {}
    t.remove();
  }
  if (btn) {
    const old = btn.innerHTML;
    btn.innerHTML = "✅ Copiado!";
    setTimeout(() => (btn.innerHTML = old), 1400);
  }
}

export function sugerir(secao, item, titulo) {
  const dlg = document.getElementById("dlg-sugerir");
  const form = dlg.querySelector("form");
  const msg = dlg.querySelector(".dlg-msg");
  dlg.querySelector("h3").textContent = "💡 Sugerir: " + titulo;
  form.reset();
  msg.textContent = "";
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (e.submitter?.value === "cancel") return dlg.close();
    const texto = form.texto.value.trim();
    if (!texto) return;
    msg.textContent = "Enviando…";
    try {
      await sendSuggestion(secao, item, texto);
      msg.textContent = "✅ Obrigado! Sua sugestão vai aparecer depois de aprovada.";
      setTimeout(() => dlg.close(), 1600);
    } catch (err) {
      msg.textContent = "Não foi possível enviar: " + (err.message || err);
    }
  };
  dlg.showModal();
}

// Mostra itens aos poucos conforme a pessoa rola a página
export function listaInfinita(grid, sentinela, itens, card, passo = 48) {
  let mostrados = 0;
  grid.innerHTML = "";
  const mais = () => {
    grid.insertAdjacentHTML("beforeend", itens.slice(mostrados, mostrados + passo).map(card).join(""));
    mostrados += passo;
    if (mostrados >= itens.length) obs.disconnect();
  };
  const obs = new IntersectionObserver((e) => e[0].isIntersecting && mais(), { rootMargin: "600px" });
  if (!itens.length) return () => obs.disconnect();
  mais();
  obs.observe(sentinela);
  return () => obs.disconnect();
}
