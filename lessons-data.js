/**
 * Șahist — Lecții de șah
 * Conținut educațional: deschideri, tactici, finale.
 *
 * Structura unui step:
 *   player: 'user' | 'auto'
 *   from, to: notație algebrică ('e2', 'e4')
 *   hint: text afișat înainte de mutare (doar user)
 *   explanation: text afișat după mutare
 *   promotion: 'Q'|'R'|'B'|'N' (opțional, pentru promovări)
 */

'use strict';

const LESSONS_DATA = {

  // ═══════════════════════════════════════════════════════════════
  // DESCHIDERI
  // ═══════════════════════════════════════════════════════════════
  openings: {
    label: 'Deschideri',
    icon: '♟',
    description: 'Primele mutări ale partidei stabilesc controlul centrului și dezvoltarea pieselor. O deschidere bună îți oferă un avantaj pozițional solid.',
    modules: [

      // ── Jocul Italian ────────────────────────────────────────────
      {
        id: 'italian-game',
        title: 'Jocul Italian',
        subtitle: '1.e4 e5 2.Cf3 Cc6 3.Nc4',
        description: 'Una dintre cele mai vechi deschideri cunoscute, favorizată de marii maeștri ai Renașterii. Albul dezvoltă piesele rapid, vizând punctul slab f7 din tabăra neagră. Ideală pentru începători — principiile sunt clare și atacurile directe.',
        difficulty: 1,
        examples: [
          {
            id: 'italian-01',
            title: 'Linia clasică',
            startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e2', to: 'e4',
                hint: 'Mută pionul din e2 pe e4',
                explanation: 'Prima mutare clasică. Ocupăm centrul și deschidem diagonalele pentru nebun și regină. Principiu fundamental: controlează centrul!'
              },
              {
                player: 'auto',
                from: 'e7', to: 'e5',
                explanation: 'Negrul răspunde simetric — dispută și el centrul. Cel mai popular răspuns la 1.e4.'
              },
              {
                player: 'user',
                from: 'g1', to: 'f3',
                hint: 'Mută calul din g1 pe f3',
                explanation: 'Calul atacă pionul e5 și se dezvoltă spre centru. Principiu: dezvoltă piesele înainte să ataci!'
              },
              {
                player: 'auto',
                from: 'b8', to: 'c6',
                explanation: 'Calul negruapără pionul e5 și se dezvoltă activ.'
              },
              {
                player: 'user',
                from: 'f1', to: 'c4',
                hint: 'Mută nebunul din f1 pe c4',
                explanation: 'Nebunul pe c4 vizează punctul f7 — cel mai slab pătrat din tabăra neagră la debut. Acesta este Jocul Italian! Albul e bine dezvoltat și pregătit de rocadă.'
              },
              {
                player: 'auto',
                from: 'f8', to: 'c5',
                explanation: 'Negrul răspunde cu nebunul pe c5 — Varianta Giuoco Piano ("joc liniștit"). Ambele tabere sunt bine dezvoltate.'
              },
              {
                player: 'user',
                from: 'e1', to: 'g1',
                hint: 'Fă rocada mică (mută regele din e1 pe g1)',
                explanation: 'Rocada pune regele în siguranță și activează tura. Excelent plan după ce am dezvoltat piesele!'
              }
            ]
          },
          {
            id: 'italian-02',
            title: 'Atacul cu doi cai',
            startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e2', to: 'e4',
                hint: 'Mută pionul din e2 pe e4',
                explanation: 'Deschidem centrul — mutarea cea mai activă.'
              },
              {
                player: 'auto',
                from: 'e7', to: 'e5',
                explanation: 'Negrul controlează și el centrul.'
              },
              {
                player: 'user',
                from: 'g1', to: 'f3',
                hint: 'Mută calul din g1 pe f3',
                explanation: 'Dezvoltăm calul cu tempo — atacă pionul e5.'
              },
              {
                player: 'auto',
                from: 'b8', to: 'c6',
                explanation: 'Negrul apără pionul e5.'
              },
              {
                player: 'user',
                from: 'f1', to: 'c4',
                hint: 'Mută nebunul din f1 pe c4',
                explanation: 'Nebunul italian — vizează f7.'
              },
              {
                player: 'auto',
                from: 'g8', to: 'f6',
                explanation: 'Negrul alege Apărarea cu doi cai! Calul atacă pionul e4 și pregătește un joc activ.'
              },
              {
                player: 'user',
                from: 'b1', to: 'c3',
                hint: 'Mută calul din b1 pe c3',
                explanation: 'Apărăm pionul e4 cu calul. Acum ambele tabere au câte doi cai activi — Atacul cu doi cai! Jocul devine tactic și interesant.'
              },
              {
                player: 'auto',
                from: 'f8', to: 'c5',
                explanation: 'Negrul dezvoltă nebunul — poziție echilibrată cu șanse pentru ambele tabere.'
              },
              {
                player: 'user',
                from: 'd2', to: 'd3',
                hint: 'Mută pionul din d2 pe d3',
                explanation: 'Plan solid: întărim centrul și pregătim dezvoltarea nebunului din c1. Albul are o poziție sănătoasă cu ușor avantaj spațial.'
              }
            ]
          },
          {
            id: 'italian-03',
            title: 'Varianta Evans Gambit',
            startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e2', to: 'e4',
                hint: 'Mută pionul din e2 pe e4',
                explanation: 'Deschidem jocul.'
              },
              {
                player: 'auto',
                from: 'e7', to: 'e5',
                explanation: 'Negrul răspunde simetric.'
              },
              {
                player: 'user',
                from: 'g1', to: 'f3',
                hint: 'Mută calul din g1 pe f3',
                explanation: 'Dezvoltare cu atac.'
              },
              {
                player: 'auto',
                from: 'b8', to: 'c6',
                explanation: 'Apărare solidă.'
              },
              {
                player: 'user',
                from: 'f1', to: 'c4',
                hint: 'Mută nebunul din f1 pe c4',
                explanation: 'Jocul Italian — pregătim Evans Gambit!'
              },
              {
                player: 'auto',
                from: 'f8', to: 'c5',
                explanation: 'Negrul dezvoltă nebunul — exact ce așteptam pentru Evans Gambit.'
              },
              {
                player: 'user',
                from: 'b2', to: 'b4',
                hint: 'Mută pionul din b2 pe b4 — acesta este Gambitul Evans!',
                explanation: 'Sacrificăm un pion! Dacă negrul acceptă (Nxb4), albul câștigă timp prețios pentru a construi un centru puternic cu c3 și d4. Un gambit romantic din secolul XIX!'
              },
              {
                player: 'auto',
                from: 'c5', to: 'b4',
                explanation: 'Negrul acceptă gambitul — ia pionul.'
              },
              {
                player: 'user',
                from: 'c2', to: 'c3',
                hint: 'Mută pionul din c2 pe c3',
                explanation: 'Atacăm nebunul și pregătim d4 — centrul puternic e răsplata pentru pionul sacrificat!'
              },
              {
                player: 'auto',
                from: 'b4', to: 'c5',
                explanation: 'Nebunul se retrage.'
              },
              {
                player: 'user',
                from: 'd2', to: 'd4',
                hint: 'Mută pionul din d2 pe d4',
                explanation: 'Centrul puternic cu doi pioni pe e4 și d4! Albul are inițiativă excelentă în schimbul pionului sacrificat. Evans Gambit — șah agresiv și frumos!'
              }
            ]
          }
        ]
      },

      // ── Apărarea Siciliană ────────────────────────────────────────
      {
        id: 'sicilian-defense',
        title: 'Apărarea Siciliană',
        subtitle: '1.e4 c5',
        description: 'Cea mai populară apărare la 1.e4 la nivel mondial. Negrul nu dispută imediat centrul, ci construiește un contraatac asimetric. Duce la jocuri complexe și dezechilibrate — favorite ale jucătorilor care vor să câștige cu Negrele.',
        difficulty: 2,
        examples: [
          {
            id: 'sicilian-01',
            title: 'Varianta Najdorf — introducere',
            startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            playerColor: 'b',
            steps: [
              {
                player: 'auto',
                from: 'e2', to: 'e4',
                explanation: 'Albul ocupă centrul cu e4 — cea mai populară primă mutare.'
              },
              {
                player: 'user',
                from: 'c7', to: 'c5',
                hint: 'Mută pionul din c7 pe c5',
                explanation: 'Apărarea Siciliană! În loc să disputăm centrul imediat, atacăm de pe flancul damei. Asimetria creează dezechilibre — negrul joacă pentru victorie, nu pentru remiză!'
              },
              {
                player: 'auto',
                from: 'g1', to: 'f3',
                explanation: 'Albul dezvoltă calul — cel mai solid răspuns.'
              },
              {
                player: 'user',
                from: 'd7', to: 'd6',
                hint: 'Mută pionul din d7 pe d6',
                explanation: 'Pregătim Najdorf — una dintre cele mai studiate variante din teoria șahului. Fischer și Kasparov au folosit-o ca armă principală.'
              },
              {
                player: 'auto',
                from: 'd2', to: 'd4',
                explanation: 'Albul deschide centrul — moment critic al Sicilienei.'
              },
              {
                player: 'user',
                from: 'c5', to: 'd4',
                hint: 'Capturează pionul din d4 cu pionul din c5',
                explanation: 'Schimbul pionului central! Negrul obține un pion mai puțin în centru, dar coloana c deschisă și un joc activ pe flancul damei.'
              },
              {
                player: 'auto',
                from: 'f3', to: 'd4',
                explanation: 'Albul recapturează cu calul — controlează centrul.'
              },
              {
                player: 'user',
                from: 'g8', to: 'f6',
                hint: 'Mută calul din g8 pe f6',
                explanation: 'Najdorf! Calul atacă e4 și pregătește a5 — mutarea care definește varianta Najdorf. Negrul va construi un atac pe flancul damei.'
              },
              {
                player: 'auto',
                from: 'b1', to: 'c3',
                explanation: 'Albul apără e4 și se dezvoltă.'
              },
              {
                player: 'user',
                from: 'a7', to: 'a6',
                hint: 'Mută pionul din a7 pe a6 — mutarea Najdorf!',
                explanation: 'a6 — aceasta este mutarea Najdorf! Pare mică, dar are un rol mare: împiedică Nb5+ și pregătește b5, avansând pe flancul damei. Poziție complexă cu șanse pentru ambele tabere!'
              }
            ]
          },
          {
            id: 'sicilian-02',
            title: 'Varianta Dragon',
            startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            playerColor: 'b',
            steps: [
              {
                player: 'auto',
                from: 'e2', to: 'e4',
                explanation: 'Albul cu e4.'
              },
              {
                player: 'user',
                from: 'c7', to: 'c5',
                hint: 'Mută pionul din c7 pe c5',
                explanation: 'Siciliana — jucăm asimetric!'
              },
              {
                player: 'auto',
                from: 'g1', to: 'f3',
                explanation: 'Calul alb pe f3.'
              },
              {
                player: 'user',
                from: 'd7', to: 'd6',
                hint: 'Mută pionul din d7 pe d6',
                explanation: 'Pregătim Dragonul.'
              },
              {
                player: 'auto',
                from: 'd2', to: 'd4',
                explanation: 'Albul deschide centrul.'
              },
              {
                player: 'user',
                from: 'c5', to: 'd4',
                hint: 'Capturează cu c5xd4',
                explanation: 'Schimbul central.'
              },
              {
                player: 'auto',
                from: 'f3', to: 'd4',
                explanation: 'Albul recapturează.'
              },
              {
                player: 'user',
                from: 'g8', to: 'f6',
                hint: 'Calul din g8 pe f6',
                explanation: 'Dezvoltare activă.'
              },
              {
                player: 'auto',
                from: 'b1', to: 'c3',
                explanation: 'Calul alb pe c3.'
              },
              {
                player: 'user',
                from: 'g7', to: 'g6',
                hint: 'Mută pionul din g7 pe g6 — Dragonul!',
                explanation: 'g6 — aceasta definește Varianta Dragon! Negrul va fiancheta nebunul pe g7, care va deveni "Dragonul" — o piesă extrem de activă pe diagonala mare. Unul dintre cele mai agresive sisteme din șah!'
              },
              {
                player: 'auto',
                from: 'c1', to: 'e3',
                explanation: 'Albul se pregătește de atac cu sistemul Yugoslav.'
              },
              {
                player: 'user',
                from: 'f8', to: 'g7',
                hint: 'Mută nebunul din f8 pe g7',
                explanation: 'Dragonul se trezește! Nebunul pe g7 controlează diagonala lungă a8-h1 cu forță devastatoare. Negrul va roca și contraataca pe coloana c. Poziție extrem de ascuțită!'
              }
            ]
          },
          {
            id: 'sicilian-03',
            title: 'Varianta Scheveningen',
            startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            playerColor: 'b',
            steps: [
              {
                player: 'auto',
                from: 'e2', to: 'e4',
                explanation: 'Albul cu e4.'
              },
              {
                player: 'user',
                from: 'c7', to: 'c5',
                hint: 'Pionul c7 pe c5',
                explanation: 'Siciliana!'
              },
              {
                player: 'auto',
                from: 'g1', to: 'f3',
                explanation: 'Calul alb.'
              },
              {
                player: 'user',
                from: 'd7', to: 'd6',
                hint: 'Pionul d7 pe d6',
                explanation: 'Structură Siciliană clasică.'
              },
              {
                player: 'auto',
                from: 'd2', to: 'd4',
                explanation: 'Deschidere centrală.'
              },
              {
                player: 'user',
                from: 'c5', to: 'd4',
                hint: 'Capturează cxd4',
                explanation: 'Schimb în centru.'
              },
              {
                player: 'auto',
                from: 'f3', to: 'd4',
                explanation: 'Recaptură cu calul.'
              },
              {
                player: 'user',
                from: 'g8', to: 'f6',
                hint: 'Calul g8 pe f6',
                explanation: 'Presiune pe e4.'
              },
              {
                player: 'auto',
                from: 'b1', to: 'c3',
                explanation: 'Dezvoltare albă.'
              },
              {
                player: 'user',
                from: 'e7', to: 'e6',
                hint: 'Mută pionul din e7 pe e6 — Scheveningen!',
                explanation: 'e6 definește Varianta Scheveningen! Pionii pe d6 și e6 formează un lanț solid. Negrul cedează spațiu dar construiește o fortăreață — contraatacul vine mai târziu. Kasparov a folosit această variantă în meciurile pentru titlul mondial!'
              },
              {
                player: 'auto',
                from: 'g2', to: 'g4',
                explanation: 'Albul lansează Atacul Keres! Un atac spațial agresiv pe flancul regelui.'
              },
              {
                player: 'user',
                from: 'f8', to: 'e7',
                hint: 'Nebunul din f8 pe e7',
                explanation: 'Dezvoltare solidă și pregătim rocada. Negrul se apără cu răbdare — contraatacul pe flancul damei vine imediat după rocadă. Joc dinamic și complex!'
              }
            ]
          }
        ]
      },

      // ── Apărarea Franceză ─────────────────────────────────────────
      {
        id: 'french-defense',
        title: 'Apărarea Franceză',
        subtitle: '1.e4 e6',
        description: 'O apărare solidă și strategică. Negrul cedează temporar spațiu în centru, construind o structură de pioni robustă. Duce la jocuri planificate și poziționale — favorizată de jucătorii care preferă strategia tacticii.',
        difficulty: 2,
        examples: [
          {
            id: 'french-01',
            title: 'Varianta clasică',
            startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            playerColor: 'b',
            steps: [
              {
                player: 'auto',
                from: 'e2', to: 'e4',
                explanation: 'Albul deschide cu e4.'
              },
              {
                player: 'user',
                from: 'e7', to: 'e6',
                hint: 'Mută pionul din e7 pe e6',
                explanation: 'Apărarea Franceză! Cedăm temporar centrul, dar construim o structură solidă. e6 pregătește d5 — contraatacul central.'
              },
              {
                player: 'auto',
                from: 'd2', to: 'd4',
                explanation: 'Albul ocupă centrul cu ambii pioni.'
              },
              {
                player: 'user',
                from: 'd7', to: 'd5',
                hint: 'Mută pionul din d7 pe d5',
                explanation: 'Contraatacul central! Negrul atacă pionul e4. Acum albul trebuie să decidă: apără, schimbă sau avansează cu e5.'
              },
              {
                player: 'auto',
                from: 'b1', to: 'c3',
                explanation: 'Albul apără e4 cu calul — Varianta Classică.'
              },
              {
                player: 'user',
                from: 'g8', to: 'f6',
                hint: 'Mută calul din g8 pe f6',
                explanation: 'Atacăm pionul e4! Presiunea pe centrul alb crește.'
              },
              {
                player: 'auto',
                from: 'c1', to: 'g5',
                explanation: 'Albul înțeapă calul f6 — tactică pentru a slăbi apărarea lui d5.'
              },
              {
                player: 'user',
                from: 'f8', to: 'e7',
                hint: 'Mută nebunul din f8 pe e7',
                explanation: 'Apărăm calul și pregătim rocada. Negrul are o poziție solidă — punctul slab e nebunul din c8, blocat de propriii pioni. Plan: eliberăm nebunul cu c5 sau e5!'
              },
              {
                player: 'auto',
                from: 'e4', to: 'e5',
                explanation: 'Albul avansează centrul — joc spațial tipic Francezei.'
              },
              {
                player: 'user',
                from: 'f6', to: 'd7',
                hint: 'Mută calul din f6 pe d7',
                explanation: 'Calul se retrage — tipic pentru Franceză. Planul negru: c5 pentru a ataca centrul alb. Joc pozițional și planificat!'
              }
            ]
          },
          {
            id: 'french-02',
            title: 'Varianta Schimb',
            startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            playerColor: 'b',
            steps: [
              {
                player: 'auto',
                from: 'e2', to: 'e4',
                explanation: 'Albul cu e4.'
              },
              {
                player: 'user',
                from: 'e7', to: 'e6',
                hint: 'Pionul e7 pe e6',
                explanation: 'Franceză!'
              },
              {
                player: 'auto',
                from: 'd2', to: 'd4',
                explanation: 'Centrul alb.'
              },
              {
                player: 'user',
                from: 'd7', to: 'd5',
                hint: 'Pionul d7 pe d5',
                explanation: 'Contraatac central.'
              },
              {
                player: 'auto',
                from: 'e4', to: 'd5',
                explanation: 'Albul schimbă în centru — Varianta Schimb. Poziție simetrică, dar negrul are mai multă libertate.'
              },
              {
                player: 'user',
                from: 'e6', to: 'd5',
                hint: 'Capturează exd5',
                explanation: 'Recapturăm cu pionul. Acum avem o structură simetrică — joc echilibrat. Negrul a rezolvat problema nebunului din c8!'
              },
              {
                player: 'auto',
                from: 'g1', to: 'f3',
                explanation: 'Albul se dezvoltă.'
              },
              {
                player: 'user',
                from: 'g8', to: 'f6',
                hint: 'Calul g8 pe f6',
                explanation: 'Dezvoltare activă — atacăm nimic concret, dar controlăm centrul.'
              },
              {
                player: 'auto',
                from: 'f1', to: 'd3',
                explanation: 'Albul dezvoltă nebunul.'
              },
              {
                player: 'user',
                from: 'f8', to: 'd6',
                hint: 'Nebunul f8 pe d6',
                explanation: 'Nebunul activ pe d6! În Varianta Schimb, negrul are joc ușor — fără problemele nebunului blocat din variantele clasice. Ambele tabere se dezvoltă liber!'
              }
            ]
          },
          {
            id: 'french-03',
            title: 'Varianta Winawer',
            startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            playerColor: 'b',
            steps: [
              {
                player: 'auto',
                from: 'e2', to: 'e4',
                explanation: 'Albul cu e4.'
              },
              {
                player: 'user',
                from: 'e7', to: 'e6',
                hint: 'Pionul e7 pe e6',
                explanation: 'Apărarea Franceză!'
              },
              {
                player: 'auto',
                from: 'd2', to: 'd4',
                explanation: 'Centrul alb.'
              },
              {
                player: 'user',
                from: 'd7', to: 'd5',
                hint: 'Pionul d7 pe d5',
                explanation: 'Atacul central.'
              },
              {
                player: 'auto',
                from: 'b1', to: 'c3',
                explanation: 'Calul alb apără e4.'
              },
              {
                player: 'user',
                from: 'f8', to: 'b4',
                hint: 'Mută nebunul din f8 pe b4 — Winawer!',
                explanation: 'Nebunul pe b4 — Varianta Winawer! Înțepăm calul c3, amenințând să slăbim structura de pioni albi. Cea mai ascuțită variantă a Francezei — pozițiile sunt dezechilibrate și tactice!'
              },
              {
                player: 'auto',
                from: 'e4', to: 'e5',
                explanation: 'Albul avansează — câștigă spațiu și blochează calul f6.'
              },
              {
                player: 'user',
                from: 'c7', to: 'c5',
                hint: 'Mută pionul din c7 pe c5',
                explanation: 'Contraatacul clasic! Negrul atacă centrul alb din flanc. Dacă albul nu e atent, poate pierde centrul. Poziție extrem de complexă și teoretic bogată!'
              },
              {
                player: 'auto',
                from: 'a2', to: 'a3',
                explanation: 'Albul atacă nebunul — câștigă timp dar slăbește flancul damei.'
              },
              {
                player: 'user',
                from: 'b4', to: 'c3',
                hint: 'Capturează calul din c3 cu nebunul (Nxc3)',
                explanation: 'Schimbăm nebunul pe cal! Albul rămâne cu pioni dubli pe coloana c — slăbiciune structurală pe termen lung. În schimb, albul câștigă perechea de nebuni. Joc dezechilibrat — ambele tabere au avantaje diferite!'
              }
            ]
          }
        ]
      }

    ] // modules
  }, // openings

  // ═══════════════════════════════════════════════════════════════
  // TACTICI
  // ═══════════════════════════════════════════════════════════════
  tactics: {
    label: 'Tactici',
    icon: '⚔',
    description: 'Combinații și manevre tactice care pot schimba cursul unei partide în câteva mutări.',
    modules: [

      // ── Furculița ─────────────────────────────────────────────────
      {
        id: 'fork',
        title: 'Furculița',
        subtitle: 'O piesă atacă simultan două piese adverse',
        description: 'Furculița apare când o singură piesă atacă simultan două sau mai multe piese ale adversarului. Acesta poate salva doar una — cealaltă se pierde. Calul e cel mai periculos la furculiță datorită mișcării imprevizibile în L.',
        difficulty: 1,
        examples: [
          {
            id: 'fork-knight-01',
            title: 'Furculița calului — șah și regină',
            startFEN: '6k1/8/8/3q4/4N3/8/8/4K3 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e4', to: 'f6',
                hint: 'Mută calul din e4 pe f6',
                explanation: 'FURCULIȚĂ! Calul pe f6 dă șah regelui negru de pe g8 și atacă simultan regina de pe d5! Negrul TREBUIE să scape regele — regina va fi pierdută!'
              },
              {
                player: 'auto',
                from: 'g8', to: 'h8',
                explanation: 'Regele fuge pe h8 — nu are altă opțiune. Dar regina de pe d5 rămâne fără apărare!'
              },
              {
                player: 'user',
                from: 'f6', to: 'd5',
                hint: 'Capturează regina cu calul',
                explanation: 'Excelent! Calul câștigă regina — un avantaj material uriaș! Aceasta e esența furculiței: forțezi adversarul să aleagă ce pierde!'
              }
            ]
          },
          {
            id: 'fork-knight-02',
            title: 'Furculița calului — rege și tură',
            startFEN: '2r1k3/8/8/8/4N3/8/8/4K3 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e4', to: 'd6',
                hint: 'Mută calul din e4 pe d6',
                explanation: 'FURCULIȚĂ! Calul pe d6 dă șah regelui negru de pe e8 și atacă simultan tura de pe c8! Regele trebuie să se mute — tura va fi capturată!'
              },
              {
                player: 'auto',
                from: 'e8', to: 'f8',
                explanation: 'Regele fuge pe f8 — tura de pe c8 rămâne fără apărare!'
              },
              {
                player: 'user',
                from: 'd6', to: 'c8',
                hint: 'Capturează tura cu calul',
                explanation: 'Calul câștigă tura! Schimb extrem de favorabil — cal (3 puncte) contra tură (5 puncte). Furculița a dat roade!'
              }
            ]
          },
          {
            id: 'fork-pawn-01',
            title: 'Furculița pionului — doi cai',
            startFEN: '4k3/8/2n1n3/8/3P4/8/8/4K3 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'd4', to: 'd5',
                hint: 'Mută pionul din d4 pe d5',
                explanation: 'FURCULIȚĂ DE PION! Pionul pe d5 atacă simultan ambii cai negri — calul de pe c6 și calul de pe e6! Negrul nu poate salva ambii cai cu o singură mutare!'
              },
              {
                player: 'auto',
                from: 'c6', to: 'b4',
                explanation: 'Negrul salvează un cal — dar îl pierde pe celălalt!'
              },
              {
                player: 'user',
                from: 'd5', to: 'e6',
                hint: 'Capturează calul rămas pe e6',
                explanation: 'Pionul capturează calul! Albul câștigă un cal (3 puncte) contra unui pion (1 punct) — avantaj material clar. Furculița de pion e subtilă dar eficientă!'
              }
            ]
          }
        ]
      },

      // ── Înțepătura ────────────────────────────────────────────────
      {
        id: 'pin',
        title: 'Înțepătura (Pin)',
        subtitle: 'O piesă nu poate muta fără a expune o piesă mai valoroasă',
        description: 'Înțepătura imobilizează o piesă: dacă se mută, expune regele la șah (pin absolut) sau o piesă mai valoroasă la atac (pin relativ). Nebunul și tura sunt cel mai adesea folosite pentru a înțepa piesele adverse.',
        difficulty: 2,
        examples: [
          {
            id: 'pin-bishop-01',
            title: 'Pin absolut cu nebunul',
            startFEN: 'r3k2r/ppp2ppp/2n5/8/8/8/PPPPBPPP/R3K2R w KQkq - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e2', to: 'b5',
                hint: 'Mută nebunul din e2 pe b5',
                explanation: 'PIN ABSOLUT! Nebunul pe b5 înțeapă calul de pe c6 — dacă calul se mută, regele negru de pe e8 rămâne expus pe diagonala b5-e8. Calul NU poate muta legal!'
              },
              {
                player: 'auto',
                from: 'a7', to: 'a6',
                explanation: 'Negrul atacă nebunul cu pionul — încearcă să scape de pin. Dar calul tot nu poate muta!'
              },
              {
                player: 'user',
                from: 'b5', to: 'c6',
                hint: 'Capturează calul înțepat cu nebunul',
                explanation: 'Câștigăm calul! Negrul a trebuit să piardă timp cu a6 în loc să se dezvolte, și acum pierde calul. Puterea pinului absolut!'
              },
              {
                player: 'auto',
                from: 'b7', to: 'c6',
                explanation: 'Negrul recapturează cu pionul b7 — a pierdut un cal (3 pct) contra nebunului (3 pct), dar rămâne cu pioni dubli pe coloana c, o slăbiciune permanentă.'
              },
              {
                player: 'user',
                from: 'e1', to: 'g1',
                hint: 'Rocat! Pune regele în siguranță',
                explanation: 'Albul rocat — rege în siguranță și avantaj pozițional. Principiu: exploatează tactici și apoi asigură-ți regele!'
              }
            ]
          },
          {
            id: 'pin-bishop-02',
            title: 'Pin absolut pe diagonală',
            startFEN: '6k1/8/4n3/8/8/1B6/8/6K1 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'g1', to: 'h2',
                hint: 'Mută regele alb din g1 pe h2',
                explanation: 'Regele alb se pune în siguranță — pregătim să exploatăm pinul deja existent.'
              },
              {
                player: 'auto',
                from: 'g8', to: 'h8',
                explanation: 'Regele negru se mută — calul de pe e6 NU poate muta! Nebunul alb de pe b3 înțeapă calul pe diagonala b3-g8. Dacă calul se mută, nebunul dă șah regelui!'
              },
              {
                player: 'user',
                from: 'b3', to: 'e6',
                hint: 'Capturează calul înțepat cu nebunul',
                explanation: 'Câștigăm calul! Calul a fost imobilizat de pin și nu a putut scăpa. Aceasta e frumusețea pinului absolut — piesa înțepată e complet paralizată!'
              }
            ]
          },
          {
            id: 'pin-practical-01',
            title: 'Exploatarea pinului — presiune dublă',
            startFEN: 'r3k2r/pppq1ppp/2np1n2/4p1B1/2B1P3/2N2N2/PPP2PPP/R2QK2R w KQkq - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'g5', to: 'f6',
                hint: 'Mută nebunul din g5 pe f6 — capturează calul înțepat',
                explanation: 'Nebunul capturează calul f6 care era înțepat față de regina d7! Dacă regina recaptura, pierde apărarea și se expune la atacuri. Pin relativ exploatat!'
              },
              {
                player: 'auto',
                from: 'e8', to: 'g8',
                explanation: 'Regele rocat — nu poate recaptura cu regina pe f6 deoarece ar fi în șah. Albul a câștigat calul!'
              },
              {
                player: 'user',
                from: 'c4', to: 'd5',
                hint: 'Nebunul pe d5 — atac central puternic',
                explanation: 'Nebunul pe d5 controlează diagonala lungă și amenință calul c6. Albul are avantaj material și pozițional!'
              }
            ]
          }
        ]
      },

      // ── Raza X ────────────────────────────────────────────────────
      {
        id: 'skewer',
        title: 'Raza X (Skewer)',
        subtitle: 'Inversul înțepăturii — piesa valoroasă e în față',
        description: 'Ca o înțepătură inversată: piesa valoroasă e atacată direct și trebuie să se mute, expunând piesa din spatele ei. Dacă pinul e un scut, raza X e o sabie — forțezi piesa valoroasă să se miște și câștigi ce era ascuns în spatele ei.',
        difficulty: 2,
        examples: [
          {
            id: 'skewer-rook-01',
            title: 'Raza X cu tura — pe coloană',
            startFEN: 'q7/8/8/3k4/8/8/6B1/6K1 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'g2', to: 'e4',
                hint: 'Mută nebunul din g2 pe e4',
                explanation: 'RAZA X! Nebunul pe e4 dă șah regelui negru de pe d5. Regele este FORȚAT să se mute — iar pe diagonala e4-a8, în spatele regelui, se află regina neagră! Aceasta e diferența față de înțepătură: piesa valoroasă e în față.'
              },
              {
                player: 'auto',
                from: 'd5', to: 'c5',
                explanation: 'Regele fuge pe c5 — nu are altă opțiune. Regina neagră de pe a8 e acum în bătaia nebunului!'
              },
              {
                player: 'user',
                from: 'e4', to: 'a8',
                hint: 'Nebunul capturează regina de pe a8',
                explanation: 'Excelent! Nebunul câștigă regina — avantaj material imens! Raza X a funcționat: am forțat regele să se mute, expunând piesa valoroasă din spatele lui.'
              }
            ]
          },
          {
            id: 'skewer-rook-02',
            title: 'Raza X cu tura — pe rând',
            startFEN: '7q/8/8/8/3k4/8/1Q6/6K1 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'b2', to: 'c3',
                hint: 'Mută regina din b2 pe c3',
                explanation: 'RAZA X DIAGONALĂ! Regina pe c3 dă șah regelui negru de pe d4. Regele trebuie să se mute — iar pe diagonala c3-h8, în spatele regelui, se află regina neagră! Am forțat regele să cedeze.'
              },
              {
                player: 'auto',
                from: 'd4', to: 'e4',
                explanation: 'Regele fuge pe e4. Regina neagră de pe h8 e acum în bătaia reginei albe!'
              },
              {
                player: 'user',
                from: 'c3', to: 'h8',
                hint: 'Capturează regina neagră de pe h8',
                explanation: 'Regina câștigă regina adversă! Raza X diagonală a funcționat perfect — regele a fost forțat să se mute, expunând regina din spatele lui.'
              }
            ]
          },
          {
            id: 'skewer-queen-01',
            title: 'Raza X cu regina',
            startFEN: '1q6/8/8/8/8/4k3/8/6QK w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'g1', to: 'f2',
                hint: 'Mută regina din g1 pe f2',
                explanation: 'RAZA X DIAGONALĂ! Regina pe f2 dă șah regelui negru de pe e3. Pe diagonala f2-b6, după rege urmează d4, c5, b6 — unde se află regina neagră! Regele trebuie să se mute, expunând regina adversă.'
              },
              {
                player: 'auto',
                from: 'e3', to: 'd3',
                explanation: 'Regele fuge pe d3. Regina neagră de pe b6 e acum în bătaia reginei albe!'
              },
              {
                player: 'user',
                from: 'f2', to: 'b6',
                hint: 'Capturează regina neagră de pe b6',
                explanation: 'Regina câștigă regina adversă! Raza X e una dintre cele mai spectaculoase tactici — forțezi piesa valoroasă să se mute și câștigi ce era în spatele ei.'
              }
            ]
          }
        ]
      },

      // ── Atacul descoperit ─────────────────────────────────────────
      {
        id: 'discovered-attack',
        title: 'Atacul descoperit',
        subtitle: 'O piesă se mută și dezvăluie atacul alteia',
        description: 'O piesă se mută, eliberând linia de atac a unei alte piese proprii. Adversarul trebuie să răspundă la două amenințări simultan — de multe ori imposibil. Cel mai puternic: piesa care se mută atacă și ea ceva în același timp!',
        difficulty: 2,
        examples: [
          {
            id: 'discovered-01',
            title: 'Atacul descoperit cu tura',
            startFEN: '4k3/8/8/4N3/8/8/8/3KR3 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e5', to: 'c4',
                hint: 'Mută calul din e5 pe c4',
                explanation: 'ATAC DESCOPERIT! Calul se mută de pe coloana e, descoperind atacul turii de pe e1 asupra regelui negru de pe e8. Șah descoperit! Adversarul trebuie să scape regele.'
              },
              {
                player: 'auto',
                from: 'e8', to: 'd7',
                explanation: 'Regele fuge de pe coloana e — singurul răspuns la șahul descoperit.'
              },
              {
                player: 'user',
                from: 'e1', to: 'e7',
                hint: 'Tura pe e7 — atac maxim!',
                explanation: 'Tura invadează pe rândul 7! Amenință mat și controlează spațiul adversarului. Atacul descoperit a permis turii să preia o poziție dominantă.'
              }
            ]
          },
          {
            id: 'discovered-02',
            title: 'Atacul descoperit cu nebunul',
            startFEN: '4k1r1/8/8/3N4/8/8/1B6/3K4 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'd5', to: 'f4',
                hint: 'Mută calul din d5 pe f4',
                explanation: 'ATAC DESCOPERIT! Calul se mută de pe diagonala b2-g7, descoperind nebunul de pe b2 care acum atacă tura de pe g7! Adversarul are două probleme simultan — nu le poate rezolva pe amândouă!'
              },
              {
                player: 'auto',
                from: 'e8', to: 'd7',
                explanation: 'Regele încearcă să ajute — dar tura g7 e deja pierdută!'
              },
              {
                player: 'user',
                from: 'b2', to: 'g7',
                hint: 'Nebunul capturează tura de pe g7',
                explanation: 'Nebunul câștigă tura! Atacul descoperit a funcționat: calul a eliberat diagonala, nebunul a capturat. Aceasta e puterea atacului descoperit!'
              }
            ]
          },
          {
            id: 'discovered-03',
            title: 'Șahul descoperit și mat',
            startFEN: '4k3/8/8/4N3/8/8/8/3KR3 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e5', to: 'c6',
                hint: 'Mută calul din e5 pe c6',
                explanation: 'ȘAH DESCOPERIT! Calul se mută de pe coloana e, tura de pe e1 dă șah regelui e8.'
              },
              {
                player: 'auto',
                from: 'e8', to: 'd7',
                explanation: 'Regele se retrage pe d7.'
              },
              {
                player: 'user',
                from: 'e1', to: 'e7',
                hint: 'Tura pe e7 — șah și amenințare de mat!',
                explanation: 'Tura pe e7 dă șah regelui d7 și amenință mat!'
              },
              {
                player: 'auto',
                from: 'd7', to: 'c8',
                explanation: 'Regele se refugiază pe c8.'
              },
              {
                player: 'user',
                from: 'c6', to: 'd8',
                hint: 'Calul pe d8 — șah și mat!',
                explanation: 'ȘAH MAT! Calul pe d8 colaborează cu tura e7 pentru mat. Colaborarea cal + tură prin atac descoperit a produs un final frumos!'
              }
            ]
          }
        ]
      }
    ]
  },



  // FINALE — urmează
  // ═══════════════════════════════════════════════════════════════
  endgames: {
    label: 'Finale',
    icon: '♔',
    description: 'Tehnicile de final transformă avantajul în victorie. Cunoașterea finalurilor elementare e esențială pentru orice jucător serios.',
    modules: [
      {
        id: 'king-opposition',
        title: 'Opoziția regilor',
        subtitle: 'Conceptul fundamental al finalurilor de pioni',
        description: 'Opoziția apare când cei doi regi se află față în față cu un singur pătrat între ei. Regele care NU are rândul de mutat deține opoziția — avantaj crucial în finalurile de pioni. Cel care deține opoziția forțează adversarul să cedeze teren.',
        difficulty: 2,
        examples: [
          {
            id: 'opposition-01',
            title: 'Opoziția directă — câștigă teren',
            startFEN: '8/4k3/8/8/8/8/4K3/8 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e2', to: 'e3',
                hint: 'Mută regele din e2 pe e3',
                explanation: 'Regele alb avansează spre centru. Obiectivul: să ajungem față în față cu regele negru cu el la mutare — asta înseamnă opoziție!'
              },
              {
                player: 'auto',
                from: 'e7', to: 'e6',
                explanation: 'Regele negru coboară — se apropie de confruntare.'
              },
              {
                player: 'user',
                from: 'e3', to: 'e4',
                hint: 'Mută regele din e3 pe e4',
                explanation: 'Regele avansează. Acum regii sunt față în față cu două pătrate între ei — nu e opoziție încă.'
              },
              {
                player: 'auto',
                from: 'e6', to: 'e7',
                explanation: 'Regele negru se retrage — nu vrea să cedeze opoziția.'
              },
              {
                player: 'user',
                from: 'e4', to: 'd5',
                hint: 'Mută regele din e4 pe d5 — ocolim!',
                explanation: 'Manevra cheie! În loc să urmărim direct, ocolim pentru a prelua opoziția dintr-un unghi diferit. Regele care știe să ocolească câștigă!'
              },
              {
                player: 'auto',
                from: 'e7', to: 'f7',
                explanation: 'Regele negru se mută lateral — nu poate bloca direct.'
              },
              {
                player: 'user',
                from: 'd5', to: 'd6',
                hint: 'Mută regele pe d6 — avansăm!',
                explanation: 'Regele alb avansează! Prin manevrarea laterală am evitat opoziția directă și câștigăm teren crucial spre promovarea pionului. Aceasta e esența tehnicii opoziției!'
              }
            ]
          },
          {
            id: 'opposition-02',
            title: 'Opoziția și promovarea pionului',
            startFEN: '8/8/8/3k4/3P4/3K4/8/8 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'd3', to: 'e3',
                hint: 'Mută regele din d3 pe e3',
                explanation: 'Regele alb se mută lateral — pregătim să ocolim regele negru. Nu avansăm pionul direct!'
              },
              {
                player: 'auto',
                from: 'd5', to: 'c4',
                explanation: 'Regele negru încearcă să ocolească lateral.'
              },
              {
                player: 'user',
                from: 'e3', to: 'e4',
                hint: 'Regele pe e4 — câștigă teren!',
                explanation: 'Regele alb escortează pionul! De pe d4 controlăm e5 și câmpurile din fața pionului.'
              },
              {
                player: 'auto',
                from: 'c4', to: 'c3',
                explanation: 'Regele negru încearcă să blocheze pionul din față.'
              },
              {
                player: 'user',
                from: 'e4', to: 'e5',
                hint: 'Regele pe e5 — câștigăm!',
                explanation: 'Regele alb se pozitionează perfect! Acum controlează d6 și e6, câmpurile din fața pionului. Cu pion d4 și rege e5, promovarea e inevitabilă. Opoziția și tehnica regelui au câștigat!'
              }
            ]
          },
          {
            id: 'opposition-03',
            title: 'Opoziția — cum să blochezi',
            startFEN: '8/8/8/3k4/8/8/3K4/8 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'd2', to: 'd3',
                hint: 'Mută regele din d2 pe d3',
                explanation: 'Regele alb avansează spre centru. Obiectivul: să ajungem față în față cu regele negru cu el la mutare!'
              },
              {
                player: 'auto',
                from: 'd5', to: 'c5',
                explanation: 'Regele negru se mută lateral — încearcă să ocolească.'
              },
              {
                player: 'user',
                from: 'd3', to: 'e4',
                hint: 'Mută regele pe e4 — câștigăm teren!',
                explanation: 'Regele alb ocolește lateral câștigând teren crucial față de regele adversar.'
              },
              {
                player: 'auto',
                from: 'c5', to: 'b4',
                explanation: 'Regele negru continuă să fugă lateral.'
              },
              {
                player: 'user',
                from: 'e4', to: 'd5',
                hint: 'Mută regele pe d5 — opoziție câștigată!',
                explanation: 'OPOZIȚIE DIRECTĂ! Regele alb preia opoziția față de regele negru b4 nu, ci față de... regele e acum în poziție dominantă în centru, câștigând teren crucial spre victorie!'
              }
            ]
          }
        ]
      },
      {
        id: 'queen-vs-king',
        title: 'Regină + Rege vs Rege',
        subtitle: 'Cel mai simplu mat elementar',
        description: 'Regina și Regele pot da mat regelui singur în cel mult 10 mutări dacă știi tehnica. Ideea: folosești regina pentru a restrânge mișcările regelui advers, iar regele propriu se apropie pentru a ajuta la mat.',
        difficulty: 2,
        examples: [
          {
            id: 'qk-mat-01',
            title: 'Mat cu Regina — tehnica de bază',
            startFEN: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'g1', to: 'h2',
                hint: 'Mută regina din g1 pe h2',
                explanation: 'Regina restricționează regele negru — h2 controlează toată coloana h și diagonalele. Regele negru e limitat la colțul h8.'
              },
              {
                player: 'auto',
                from: 'h8', to: 'g8',
                explanation: 'Regele negru încearcă să fugă din colț.'
              },
              {
                player: 'user',
                from: 'h2', to: 'h7',
                hint: 'Regina pe h7 — coridorul se strânge!',
                explanation: 'Regina pe h7 restricționează și mai mult regele. Regele alb se va apropia pentru mat.'
              },
              {
                player: 'auto',
                from: 'g8', to: 'f8',
                explanation: 'Regele fuge spre centru.'
              },
              {
                player: 'user',
                from: 'h7', to: 'g7',
                hint: 'Regina pe g7',
                explanation: 'ȘAH MAT! Regina pe g7 acoperă f7 și g8. Regele f8 nu are unde să fugă — regele alb de pe f6 controlează e7, e6, e5, f5, g5, g6. Acesta este matul clasic cu regină!'
              }
            ]
          },
          {
            id: 'qk-mat-02',
            title: 'Matul de colț — mat rapid',
            startFEN: 'k7/2K5/1Q6/8/8/8/8/8 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'b6', to: 'b7',
                hint: 'Mută regina din b6 pe b7',
                explanation: 'ȘAH MAT! Regina pe b7 dă mat instant — regele a8 nu are nicăieri să fugă! b8 e atacat de regele c7, a7 e atacat de regina b7. Aceasta e poziția clasică de mat în colț cu regină — rezultatul tehnicii corecte de împingere spre margine!'
              }
            ]
          },
          {
            id: 'qk-mat-03',
            title: 'Matul de colț',
            startFEN: 'k7/8/1QK5/8/8/8/8/8 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'b6', to: 'b7',
                hint: 'Mută regina din b6 pe b7',
                explanation: 'ȘAH MAT! Regina pe b7 dă mat — regele a8 nu are nicăieri să fugă! b8 e atacat de regele c6, a7 e atacat de regina b7. Aceasta e poziția clasică de mat în colț cu regină.'
              }
            ]
          }
        ]
      },
      {
        id: 'rook-vs-king',
        title: 'Tur + Rege vs Rege',
        subtitle: 'Tehnica coridorului',
        description: 'Tura și Regele pot da mat, dar tehnica e mai complexă decât cu regina. Metoda coridorului: tura împinge regele adversar spre margine rând cu rând, iar regele propriu asistă activ pentru a evita patul.',
        difficulty: 3,
        examples: [
          {
            id: 'rk-mat-01',
            title: 'Matul cu tura — poziție finală',
            startFEN: '7k/8/5KR1/8/8/8/8/8 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'g6', to: 'g8',
                hint: 'Mută tura din g6 pe g8',
                explanation: 'ȘAH MAT! Tura pe g8 dă mat — regele h8 nu poate merge pe g8 (ocupat de tură), h7 e atacat de regele f6, iar g7 e atacat de tura g8. Matul cu tura necesită regele propriu să controleze câmpurile de fugă!'
              }
            ]
          },
          {
            id: 'rk-mat-02',
            title: 'Tehnica coridorului — pasul 1',
            startFEN: '8/8/8/3k4/8/8/8/3KR3 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'e1', to: 'e5',
                hint: 'Tura pe e5 — tăiem tabla!',
                explanation: 'Tura pe e5 creează un coridor: regele negru nu mai poate trece sub rândul 5! Aceasta e esența tehnicii coridorului — reduci spațiul regelui adversar rând cu rând.'
              },
              {
                player: 'auto',
                from: 'd5', to: 'c4',
                explanation: 'Regele negru încearcă să scape în jos — dar tura taie!'
              },
              {
                player: 'user',
                from: 'e5', to: 'e4',
                hint: 'Tura urmărește pe e4',
                explanation: 'Tura urmărește regele! Coridorul se mută cu el — regele negru e limitat la rândurile 1-3 acum.'
              },
              {
                player: 'auto',
                from: 'c4', to: 'c3',
                explanation: 'Regele se mută spre colțul tablei.'
              },
              {
                player: 'user',
                from: 'd1', to: 'e1',
                hint: 'Regele alb se apropie',
                explanation: 'Regele alb avansează! Când regele alb e aproape, tura poate da matul. Principiu: tura face coridoare, regele se apropie, matul vine inevitabil.'
              }
            ]
          },
          {
            id: 'rk-mat-03',
            title: 'Atenție la pat!',
            startFEN: '8/8/8/8/8/8/7k/5KR1 w - - 0 1',
            playerColor: 'w',
            steps: [
              {
                player: 'user',
                from: 'g1', to: 'h1',
                hint: 'Tura pe h1 — șah regelui!',
                explanation: 'Tura pe h1 dă șah regelui negru de pe h2. Atenție: dacă am fi mutat tura pe h2 direct, regele nu ar mai fi avut mutări fără a fi în șah = PAT = remiză! Mereu lasă adversarului cel puțin o mutare!'
              },
              {
                player: 'auto',
                from: 'h2', to: 'g3',
                explanation: 'Regele negru fuge pe g3.'
              },
              {
                player: 'user',
                from: 'h1', to: 'h3',
                hint: 'Tura pe h3 — șah din nou!',
                explanation: 'Tura dă șah pe rândul 3! Regele negru e împins spre margine rând cu rând. Tehnica coridorului în acțiune — tura taie spațiul, regele propriu se apropie!'
              }
            ]
          }
        ]
      }
    ]
  }

};
