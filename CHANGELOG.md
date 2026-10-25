# Changelog

## [0.2.1] - 2026-10-24

### Changed

- Fieldsets have a 1px accent-40 border and padding (0.5rem top, 1rem on the other sides). Their legend is in the accent colour at `--font-size-14`, without uppercase.

## [0.2.0] - 2026-10-24

### Changed

- Every framed ApplicationV2 form (`form.application:has(> .window-header)`) gets the styles, not only the category browsers: config sheets, settings submenus, module setting windows and so on. DialogV2 dialogs stay covered.
- Not covered:
  - actor sheets (`.sheet.actor`);
  - any window whose document is an Actor, Item, JournalEntry, JournalEntryPage, RollTable or Adventure;
  - dnd5e's own apps (`.dnd5e2`);
  - unframed apps;
  - windows with `crlngn-ws-off`.

### Added

- `EXCLUDED_SELECTOR` and `EXCLUDED_DOCUMENTS` exports.
- Footer buttons without text get `cws-icon-only` and keep their icon.

## [0.1.6] - 2026-10-24

### Changed

- Rows in the narrow category list have no background of their own; only the selected category keeps the accent.

## [0.1.5] - 2026-10-24

### Changed

- The category list on narrow windows sits on a full-width band in the field colour (`--cws-field`). The band runs to the window's edges, and its rows are padded back in line with the search field and the cards. Width, side margins and padding are in `priority.css`, because Carolingian UI's `.tabs.vertical` rules outrank `base.css`.

## [0.1.4] - 2026-10-24

### Changed

- A submenu card on a narrow category browser shows its name once when the button repeats the setting's name, as Foundry's own submenus do. The kit compares the two, ignoring icons and hint markers, and flags the setting with `cws-submenu-same`. The button's text stays for screen readers and the whole card still opens the submenu.

## [0.1.3] - 2026-10-24

### Changed

- Submenu settings on narrow category browsers are full-width cards instead of half-width tiles. Each card shows the setting's name, the button's text under it as an underlined accent link, and a caret on the right. A tap anywhere on the card opens the submenu; the button's `::before` covers the card, so nothing is added to the DOM.

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
