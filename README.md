# ♟ Șahist

**Învaţă şah. Joacă şah.**

Aplicație web progresivă (PWA) pentru a juca șah direct în browser — fără instalare, fără cont, fără reclame. Funcționează pe orice device cu browser modern: PC, telefon, tabletă.

---

## Cum se folosește

1. Descarcă sau clonează repository-ul
2. Deschide `index.html` direct în browser (dublu-click)
3. Apasă **⚙ Setări** pentru a alege culoarea și a porni un joc nou

Nu este nevoie de server, build step sau conexiune la internet după prima încărcare.

---

## Funcționalități (v1)

- **Tabla SVG** — scalabilă perfect pe orice ecran
- **Mutări legale complete** — en passant, roque, promovare pion, șah/mat/pat
- **Adversar local (Începător)** — capturează piesele disponibile, altfel alege aleatoriu; delay realist pentru naturalețe
- **Alege culoarea** — joci cu Alb sau cu Negru (calculatorul mută primul dacă ești Negru)
- **Evidențiere mutări** — puncte verzi pentru mutări disponibile, inel pentru capturi posibile
- **Undo** — retrage ultima pereche de mutări (a ta + a calculatorului)
- **Flip board** — întoarce tabla pentru perspectiva cealaltă
- **Promovare pion** — selector vizual la atingerea ultimei linii
- **Statistici persistente** — victorii/înfrângeri/egaluri salvate în localStorage
- **PWA** — instalabil, funcționează offline

---

## Structura proiectului

```
sahist/
├── index.html          # UI complet (board SVG, panouri, overlay setări)
├── chess-engine.js     # Motor de șah: generare mutări, FEN, validare
├── engine-local.js     # Adversar local (nivel Începător)
├── storage.js          # Persistență localStorage (setări, statistici, istoric)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (cache offline)
└── README.md
```

Arhitectura este **modulară** — fiecare fișier are un singur rol, ușor de extins:

- `chess-engine.js` nu știe nimic despre UI
- `engine-local.js` primește engine-ul ca parametru, nu e cuplat cu UI
- `storage.js` centralizează tot ce ține de persistență

---

## Roadmap (planificat)

### v2 — Deschideri
- Modul teoretic pentru 10–15 deschideri clasice (Italiană, Siciliană, Ruy Lopez etc.)
- Drill mode: aplica joacă albul, utilizatorul trebuie să urmeze teoria

### v3 — Niveluri și AI
- Nivel Intermediar: heuristică bazată pe material + control centru
- Integrare API (cheie proprie): adversar puternic via model AI
- Trei trepte: Începător (local) → Intermediar (local) → Expert (AI cu API key)

### v4 — Analiză
- Modul de analiză post-partidă
- Detectarea greșelilor și momentelor-cheie

---

## Tehnic

- **Zero dependențe** — JavaScript pur, fără framework, fără npm
- **FEN** — stare internă stocată în format FEN standard
- **Notație algebrică** — istoricul mutărilor în notație standard (e4, Nf3, O-O etc.)
- **localStorage** — date prefixate cu `sahist_` pentru a evita conflicte

---

## Licență

MIT — folosește, modifică, redistribuie liber.

---

*Dedicat tuturor care redescoperă șahul.*
