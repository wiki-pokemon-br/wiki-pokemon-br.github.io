// Login, controle de acesso e cabeçalho compartilhado entre as páginas.
// A aprovação dos membros é feita direto no painel do Firebase (veja LEIAME.md).
import { firebaseConfig, SITE_NAME } from "./firebase-config.js";

// Modo demo para testes no computador (localhost/?demo). No site publicado nunca é ativado.
const DEMO_LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname) && (() => {
  try {
    if (location.search.includes("demo")) localStorage.setItem("pokewiki-demo", "1");
    return localStorage.getItem("pokewiki-demo") === "1";
  } catch { return false; }
})();
export const DEMO = DEMO_LOCAL || !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("COLE");
const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const DEMO_KEY = "pokewiki-demo-user";

let fb = null;
async function loadFirebase() {
  if (fb) return fb;
  const [app, auth, store] = await Promise.all([
    import(FB + "firebase-app.js"),
    import(FB + "firebase-auth.js"),
    import(FB + "firebase-firestore.js"),
  ]);
  const a = app.initializeApp(firebaseConfig);
  fb = { ...auth, ...store, auth: auth.getAuth(a), db: store.getFirestore(a) };
  return fb;
}

function readDemo() {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY)); } catch { return null; }
}

// Retorna { uid, email, name, photo, status } ou null
export async function currentUser() {
  if (DEMO) return readDemo();

  const f = await loadFirebase();
  const user = await new Promise((resolve) => {
    const off = f.onAuthStateChanged(f.auth, (u) => { off(); resolve(u); });
  });
  if (!user) return null;

  // Primeiro acesso: cria o cadastro como "pending" (aguardando aprovação)
  const ref = f.doc(f.db, "users", user.uid);
  let snap = await f.getDoc(ref);
  if (!snap.exists()) {
    await f.setDoc(ref, {
      email: user.email,
      name: user.displayName || "",
      status: "pending",
      createdAt: f.serverTimestamp(),
    });
    snap = await f.getDoc(ref);
  }
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || user.email,
    photo: user.photoURL || "",
    status: snap.data().status,
  };
}

export async function login() {
  if (DEMO) {
    try {
      localStorage.setItem(DEMO_KEY, JSON.stringify({
        uid: "demo", email: "demo@pokewiki", name: "Treinadora Demo", photo: "", status: "approved",
      }));
    } catch {}
    return;
  }
  const f = await loadFirebase();
  await f.signInWithPopup(f.auth, new f.GoogleAuthProvider());
}

export async function logout() {
  if (DEMO) { try { localStorage.removeItem(DEMO_KEY); } catch {} }
  else { const f = await loadFirebase(); await f.signOut(f.auth); }
  location.href = "login.html";
}

// Use no topo de cada página protegida
export async function requireApproved() {
  const u = await currentUser();
  if (!u || u.status !== "approved") {
    location.href = "login.html";
    return null;
  }
  document.body.classList.remove("loading");
  return u;
}

// ---------- Sugestões da comunidade ----------
// Ficam na coleção "sugestoes" como "pending". Para aparecer no site,
// troque o status para "approved" no painel do Firebase.
const DEMO_SUG = "pokewiki-demo-sugestoes";

export async function sendSuggestion(secao, item, texto) {
  const user = await currentUser();
  const sug = { secao, item, texto, status: "pending", uid: user.uid, email: user.email, name: user.name };
  if (DEMO) {
    try {
      const all = JSON.parse(localStorage.getItem(DEMO_SUG) || "[]");
      all.push(sug);
      localStorage.setItem(DEMO_SUG, JSON.stringify(all));
    } catch {}
    return;
  }
  const f = await loadFirebase();
  await f.addDoc(f.collection(f.db, "sugestoes"), { ...sug, createdAt: f.serverTimestamp() });
}

export async function approvedSuggestions() {
  if (DEMO) return [];
  const f = await loadFirebase();
  const snap = await f.getDocs(f.query(f.collection(f.db, "sugestoes"), f.where("status", "==", "approved")));
  return snap.docs.map((d) => d.data());
}

export function renderHeader(user) {
  const el = document.querySelector("header.top");
  el.innerHTML = `
    <a class="brand" href="index.html"><span class="ball"></span>${SITE_NAME}</a>
    <div class="me">
      ${user.photo ? `<img src="${user.photo}" alt="">` : `<span class="avatar">${(user.name || "?")[0]}</span>`}
      <span class="me-name">${user.name}</span>
      <button class="btn ghost" id="logout">Sair</button>
    </div>
    ${DEMO ? `<div class="demo-tag">MODO DEMO</div>` : ""}`;
  el.querySelector("#logout").onclick = logout;
}
