# Visual Manifesto Experiment — dosel public site

Branch: `feature/visual-manifesto-experiment` · Escopo: apenas `index.html` (home EN do site público). Nada do pipeline, Intake/Dashboard ou infraestrutura foi tocado. Esta é uma proposta experimental, não uma mudança definitiva de marca.

## Conceito

**"Máquina editorial sobre papel."** O site deixa de ser uma landing "atmosférica" (serif clássica, tons de areia, vinheta) e passa a ser uma folha de prova operável: papel off-white como superfície de trabalho, tipografia preta de capa de livro (Libre Franklin 800/900), serif editorial para leitura (Source Serif 4), mono para etiquetas técnicas (Geist Mono), preto como estrutura (réguas de 1px, carimbos, molduras) e vermelho usado somente como sinal — um ponto vermelho por tela.

Assinatura de marca trabalhada (experimental): *dosel / voice, text and editorial machines for humans* — aparece na legenda do voice mark ("fig. 01") e no tagline do header ("editorial for humans").

## Aplicação do manifesto, seção a seção

| Seção | Princípio aplicado | Ponto vermelho da tela |
|---|---|---|
| Header | Masthead de jornal: régua preta de 1px, nome em Franklin 800 caps | — (cursor dot) |
| Hero | Folha pautada (linhas de impressão a cada 32px) + régua de margem vermelha; título Franklin 900 | Ponto final vermelho do título + voice mark |
| Demos | Console de áudio sobre papel quadriculado; glows reduzidos, sombra dura 6px | Console (live dot / knob / vermelho rebaixado #d8311c) |
| Pipeline | Manual técnico: números em carimbos 44×44 com borda preta, tags etiquetadas | Quadrado vermelho do chip "Vox-Humana 1.0" |
| Ecosystem | Parede de fichário sobre papel médio, grade de hairlines | — |
| About | Página de statement: Franklin 800 + pilares com régua preta de 2px | `em` "meaning" em serif itálica vermelha |
| Services | Colunas de índice com bordas pretas | Número do serviço fica vermelho no hover (estado) |
| Environment | "Estúdio perto da floresta": fundo verde-escuro quase preto (#1a231c), musgo como acento | Rec-dot do badge "Atlantic Forest · Brazil" |
| Contact | Papel mais profundo, título Franklin 900, botões-carimbo | Botão primário vermelho (decisão) |
| Footer | Colofão: tinta preta, texto claro discreto | — |

Anti-slop: sem gradientes decorativos, sem glassmorphism (blur do header removido), sem roxo/neon, glows do console reduzidos a sinais funcionais, sem emojis, cantos retos.

## Animação experimental — voice mark

- **Onde:** hero, logo abaixo do título, canvas `#voice-mark` (540×76px, 60px no mobile), com legenda mono "fig. 01 — voice, text and editorial machines for humans".
- **Mecânica:** 64 fendas verticais ao longo de uma costura horizontal — uma boca abstrata. A abertura de cada fenda = envelope de lábio (sen^0.65) × (ciclo de respiração lenta + pulsos de sílaba ao cubo + micro-vibração). Cada fenda tem serifas de 3×2px nas pontas (ticks de régua). A fenda central é vermelha (o sinal de gravação). Canvas 2D puro, sem biblioteca, ~64 fillRect por frame.
- **Performance:** `requestAnimationFrame` pausado quando a aba está oculta (`visibilitychange`) e quando o canvas sai da viewport (`IntersectionObserver`). DPR limitado a 2.
- **Estado estático:** `drawFrame(2.6)` desenha um frame fixo de boca entreaberta — a marca funciona parada.

## prefers-reduced-motion

- CSS: bloco `@media (prefers-reduced-motion: reduce)` zera animações/transições, força `.reveal` e `.scroll-hint` visíveis; `scroll-behavior: smooth` só existe sob `no-preference`.
- JS: o voice mark nunca inicia o loop se `matchMedia('(prefers-reduced-motion: reduce)')` casar — renderiza apenas o frame estático; reage a mudanças da preferência em tempo real (`change` listener).

## Decisões experimentais

- `--cream` e `--parchment` mantidos como aliases de `--paper`/`--paper-mid` para não quebrar estilos do console de demo.
- O canvas de ondas do hero antigo foi removido (era ruído atmosférico); o voice mark o substitui como única animação de canvas da página.
- Vermelhos do player de demo rebaixados de `#ff1010` para `#d8311c` (CSS e JS do waveform) — sinal, não neon.
- SVG do environment recolorido de tons de areia (#7a6040/#9b7a50) para verde/musgo (#5d6b54/#97a888).
- Player de demo (WebAudio, crossfade, LUFS): lógica intocada — apenas cores/sombras.
- **Não restilizados:** `index_pt.html`, `index_zh.html`, `index_eng.html`, `about/terms/privacy/ai-transparency`, `/demo`, `/private`. O switcher de idioma leva ao design antigo — é o maior risco visual de inconsistência se a branch for publicada parcialmente.
- Havia trabalho não commitado de um experimento anterior (codex) na working tree; foi guardado em `git stash` ("codex experiment WIP") para esta branch partir limpa de `main` — recuperável com `git stash pop`.

## O que avaliar visualmente

1. O hero pautado + Franklin 900 parece "impresso" ou apenas duro demais?
2. O voice mark comunica boca/fala sem ser literal? Distrai durante a leitura?
3. A regra "um ponto vermelho por tela" se sustenta em todas as seções?
4. A seção Environment (floresta escura) cria atmosfera ou quebra demais o ritmo do papel?
5. Botões-carimbo (sombra dura que "pressiona" no clique) — físico ou datado?
6. Mobile: header empilhado, voice mark 60px, consoles em coluna única.

## Como testar

```bash
cd /Users/Shared/dev/DOSEL/00_branding/ideia_studio
python3 -m http.server 8901
# abrir http://localhost:8901/index.html
```

Reduced motion: macOS → System Settings → Accessibility → Display → Reduce motion.
