# AGENTS.md - A - DEBRIEF PRIMER PWA

## Role
Ce dossier contient la PWA "Debrief Primer" (saisie/structuration de debrief).

## Perimetre technique
- App statique principale: `index.html`.
- PWA assets: `manifest.webmanifest`, `sw.js`, `icons/`.
- Jeux de tests mail: `TEST_EMAIL_DEBRIEF.eml`, `TEST_EMAIL_DEBRIEF.txt`.

## Regle AGENTS (obligatoire)
Si un agent modifie ce dossier, il doit mettre a jour dans le meme changement:
1. ce `AGENTS.md`,
2. `../AGENTS.md` (racine RETEX),
3. tout `AGENTS.md` d'un dossier couple impacte.

## Points de vigilance
- Garder les parcours PWA offline coherents (manifest/service worker).
- Valider les imports de debriefs de test apres changement de parsing UI.
- Encodage texte requis: `UTF-8`.
