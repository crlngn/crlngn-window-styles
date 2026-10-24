# Carolingian window styles

The Swipe VTT dialog look for Foundry VTT's own ApplicationV2 windows and DialogV2 dialogs, shared by Carolingian modules (Swipe VTT, Carolingian UI). Foundry v13 and v14.

- **CSS only on Foundry's markup.** Nothing is re-rendered, wrapped or moved. The kit adds the class `cws` to allowlisted windows, and only display, grid placement and order change.
- **One copy runs.** Each host installs the kit. The newest version installed wins and takes over the votes of an older copy.
- **Gated.** Rules apply while `body.crlngn-ws` is set, which is while any host module votes on. A window opts out with the class `crlngn-ws-off`.

## Windows covered

| Version | Windows |
| --- | --- |
| 0.1.0 | DialogV2 (`dialog.application.dialog`, except dnd5e's own `.dnd5e2` dialogs), category browsers (`.application.category-browser`: Game Settings, Configure Controls) |

## What it looks like

- **Frame and header:** a dark frame; a small inert window icon; the title centred on one line over an accent hairline; 40px header controls.
- **Fields and legends:** filled fields with no border; `fieldset` without a frame, its `legend` as an uppercase micro label.
- **Hints:** `p.hint` shows two lines. A longer hint gets a caret, and a tap, Enter or Space opens and closes it. The kit sets `role="button"`, `tabindex` and `aria-expanded` on long hints only.
- **Footers:** uppercase text buttons with their icons hidden. The default action takes the accent (`[autofocus]` in dialogs, `[type=submit]` elsewhere).
- **Category browsers:** sized by the window's width, not the screen's (container queries).
  - From 600px wide: the category list on the left and rows of label + hint beside the control.
  - Below 600px: search, a vertical category list collapsed to the active category (tap to open, pick to close; at most five rows, or the window's height, then it scrolls under a fade), cards (submenus show their button as an accent link with a caret, and the whole card opens them), with both footers on one row.

## Install in a host module

```json
"dependencies": { "@crlngn/window-styles": "github:crlngn/crlngn-window-styles#v0.1.5" }
```

Copy `styles/` into the module's build output (Vite, rollup-plugin-copy):

```js
{ src: 'node_modules/@crlngn/window-styles/styles/*', dest: 'dist/window-styles' }
```

Then, during `init`:

```js
import { WindowStyles } from '@crlngn/window-styles';

WindowStyles.install({ moduleId: 'my-module' });   // serves modules/my-module/window-styles/
WindowStyles.request('my-module', settingIsOn);     // vote; call again whenever the setting changes
```

Map the host's theme onto the tokens on `body` (see `styles/tokens.css`):

```css
body.my-module { --cws-accent: var(--my-accent); --cws-ground: var(--my-background); }
```

## Cascade layers

- **`tokens.css`** (the `--cws-*` defaults) is imported into the sublayer `modules.crlngn-ws`, so a host's mapping wins, whether the host's CSS is in the `modules` layer (Swipe) or unlayered (Carolingian UI).
- **`base.css`** is imported unlayered, so it beats Foundry's layered styles. Every selector starts with `body.crlngn-ws .application.cws:not(.crlngn-ws-off)`, so it also beats a host's unlayered window rules.
- **`priority.css`** holds only `!important` declarations, in `layouts.crlngn-ws`. Foundry declares `layouts` before `system` and `modules`, and for `!important` the earlier layer wins. So these rules beat a system's or module's `!important` whatever its specificity.

## API

| Export | |
| --- | --- |
| `install({ moduleId, basePath = 'window-styles' })` | inject the styles and hooks once; returns the version running |
| `request(moduleId, on)` | the module's vote; returns whether the styles are active |
| `isActive()`, `runningVersion()` | state |
| `APP_SELECTORS`, `BODY_CLASS`, `APP_CLASS`, `OPT_OUT_CLASS`, `VERSION` | constants |

## Develop

```bash
npm test
```

Release: bump `package.json` and `VERSION` in `src/index.mjs` together (a test checks they match), add a CHANGELOG entry, tag `vX.Y.Z`, push the tag, then bump the tag in each host's `package.json` and run `npm install`.

## License

CC BY-NC 4.0. See LICENSE.
