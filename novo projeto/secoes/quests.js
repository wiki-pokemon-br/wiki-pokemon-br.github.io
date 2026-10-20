// Aba Quests (dados em dados/quests.json)
import { dados, esc, norm, btnSugerir, btnCopiar } from "../ui.js";

const estrelas = (n) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));

function card(q) {
  const vip = q.acesso === "VIP";
  const recompensas = q.recompensas.map((r) => r.nome).join(", ");
  const texto = `[${q.nome}] Nível: ${q.nivel || "?"} | Recompensa: ${recompensas || "?"}`;
  const video = /^https?:\/\//i.test(q.video || "") ? q.video : "";
  return `
  <article class="quest ${vip ? "vip" : ""}">
    <div class="quest-top">
      <h3>🪧 ${esc(q.nome)}</h3>
      <span class="acesso ${vip ? "vip" : ""}">${vip ? "👑 VIP" : "🆓 Free"}</span>
    </div>
    <div class="quest-meta">
      ${q.nivel ? `<span>⬆ Nível ${esc(q.nivel)}+</span>` : ""}
      <span class="stars" title="Dificuldade ${q.dificuldade}">${estrelas(q.dificuldade)}</span>
    </div>
    ${q.descricao ? `<p>${esc(q.descricao)}</p>` : ""}
    ${q.recompensas.length ? `
      <h4>🎁 Recompensas:</h4>
      <div class="recompensas">${q.recompensas.map((r) => `
        <div class="rec">${r.img ? `<img src="${esc(r.img)}" alt="" loading="lazy">` : `<span>⭐</span>`}<small>${esc(r.nome)}</small></div>`).join("")}
      </div>` : ""}
    <div class="acoes">
      ${video ? `<a class="mini guia" href="${esc(video)}" target="_blank" rel="noopener noreferrer">▶️ Ver Guia</a>` : ""}
      ${btnSugerir("quests", q.nome, q.nome)}${btnCopiar(texto)}
    </div>
  </article>`;
}

export async function render(el) {
  el.innerHTML = `
    <div class="secao-titulo">
      <h2>🪧 Quests</h2>
      <p>Missões especiais com recompensas exclusivas</p>
    </div>
    <div class="filtros centro">
      <input id="q-busca" type="search" placeholder="Buscar quest por nome ou recompensa…" autocomplete="off">
      <select id="q-acesso"><option value="">Todos (Free/VIP)</option><option>Free</option><option>VIP</option></select>
      <select id="q-dif"><option value="">Todas as dificuldades</option>${[1, 2, 3, 4, 5].map((n) => `<option value="${n}">${estrelas(n)}</option>`).join("")}</select>
      <button class="mini limpar" id="q-limpar">✖ Limpar</button>
    </div>
    <div class="count" id="q-count"></div>
    <div class="grid quest-grid" id="q-grid"></div>`;

  const quests = await dados("quests");
  const $ = (id) => el.querySelector("#" + id);

  function filtrar() {
    const b = norm($("q-busca").value), a = $("q-acesso").value, d = Number($("q-dif").value);
    const itens = quests.filter((q) =>
      (!a || q.acesso === a) && (!d || q.dificuldade === d) &&
      (!b || norm(q.nome).includes(b) || q.recompensas.some((r) => norm(r.nome).includes(b))));
    $("q-count").textContent = `🪧 ${itens.length} quests`;
    $("q-grid").innerHTML = itens.map(card).join("") || `<div class="msg">Nenhuma quest encontrada.</div>`;
  }

  $("q-busca").oninput = filtrar;
  $("q-acesso").onchange = filtrar;
  $("q-dif").onchange = filtrar;
  $("q-limpar").onclick = () => { $("q-busca").value = ""; $("q-acesso").value = ""; $("q-dif").value = ""; filtrar(); };
  filtrar();
}
