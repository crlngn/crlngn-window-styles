# Changelog

## [0.1.2] - 2026-10-24

### Changed

- The open category list on narrow windows shows at most five rows, or less when the window has less room, and scrolls beyond that. With more than five categories its bottom edge fades. Where the browser supports scroll-driven animations, the fade follows the scroll instead: bottom at the start, both edges while scrolling, top at the end, and none when nothing scrolls.

## [0.1.1] - 2026-10-24

### Changed

- Narrow category browsers show the categories as a vertical list collapsed to the active one, with a caret, instead of a horizontal chip track. Tapping the active category opens the list, and picking one closes it again. Keyboard focus inside the list keeps it open.

## [0.1.0] - 2026-10-24

### Added

- The Swipe dialog look for DialogV2 dialogs and ApplicationV2 category browsers (Game Settings, Configure Controls):
  - header with an inert icon, a centred one-line title, an accent hairline and 40px controls;
  - filled fields, and legends as micro labels;
  - two-line hints with a caret that a tap, Enter or Space opens and closes;
  - uppercase footer buttons without icons, with the default action in the accent colour.
- Category browsers lay out by window width: a category list and label/control rows when wide; a chip track, cards and submenu tiles when narrow.
- `install`, `request` (one vote per module; active while any votes on), `isActive`, `runningVersion`. The newest installed copy of the kit runs and takes over the votes of an older one.
- `tokens.css` (`--cws-*` with Swipe VTT defaults, in `modules.crlngn-ws`), `base.css` (unlayered) and `priority.css` (`!important` only, in `layouts.crlngn-ws`).
