import { construtor } from "./construtor.js";

export const render = (el) =>
  construtor(el, {
    chave: "move7",
    titulo: "🔨 Construtor de movesets",
    subtitulo: "Escolha o Pokémon e monte o moveset com até 9 golpes (por nível ou TM).",
  });
