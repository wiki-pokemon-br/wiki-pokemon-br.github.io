import { construtor } from "./construtor.js";

export const render = (el) =>
  construtor(el, {
    chave: "smeargle",
    fixo: "smeargle",
    titulo: "🎨 Selecione os golpes para o Smeargle",
    subtitulo: "Escolha até 9 golpes que o Smeargle vai copiar.",
  });
