# Changelog

## [0.1.0] - 2026-10-24

### Added

- The Swipe dialog look for DialogV2 dialogs and ApplicationV2 category browsers (Game Settings, Configure Controls):
  - header with an inert icon, a centred one-line title, an accent hairline and 40px controls;
  - filled fields, and legends as micro labels;
  - two-line hints with a caret that a tap, Enter or Space opens and closes;
  - uppercase footer buttons without icons, with the default action in the accent colour.
- Category browsers lay out by window width: a category list and label/control rows when wide; a chip track, cards and submenu tiles when narrow.
- `install`, `request` (one vote per module; active while any votes on), `isActive`, `runningVersion`. The newest installed copy of the kit runs and takes over the votes of an older one.
- `tokens.css` (`--cws-*` with Swipe VTT defaults), `base.css` (unlayered) and `priority.css` (`!important` only, in `layouts.crlngn-ws`).
