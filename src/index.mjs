/**
 * Carolingian window styles: the Swipe dialog look for Foundry's own ApplicationV2 windows and
 * DialogV2 dialogs, shared by Carolingian modules (Swipe, Carolingian UI).
 *
 * CSS only on Foundry's existing markup. The kit adds the class `cws` to DialogV2 dialogs and
 * framed ApplicationV2 forms (document sheets excepted, see mark()), injects its stylesheets once
 * (the newest installed copy of the kit wins and takes over the votes of an older one), and
 * toggles `body.crlngn-ws` while any module votes on. A window opts out with `crlngn-ws-off`.
 *
 * What it adds besides CSS, all as classes or attributes on existing elements:
 * - hints taller than two lines get `cws-hint-long` / `cws-hint-open`, `role="button"`,
 *   `tabindex` and `aria-expanded`, and open or close on click, Enter or Space (not where
 *   Carolingian UI shows hints as tooltips, `.crlngn-hints`);
 * - submenu settings whose button repeats the label get `cws-submenu-same`;
 * - footer buttons with no text get `cws-icon-only`, so they keep their icon;
 * - a pick from the open category list on a narrow window blurs the button so the list closes.
 *
 * Stylesheets: tokens.css (the --cws-* defaults) goes into the sublayer `modules.crlngn-ws`, so a
 * host's own mapping wins whether it is in the modules layer or unlayered. base.css is imported
 * unlayered, so it wins over Foundry's layered styles and over Carolingian UI's unlayered rules
 * by specificity. priority.css holds only !important declarations and is imported into
 * `layouts.crlngn-ws`, the layer whose !important beats a game system's or module's !important.
 *
 * Bundled into each host module; imports nothing from them.
 */

import { compareVersions, VoteSet } from './core.mjs';

export { compareVersions, VoteSet } from './core.mjs';

export const VERSION = '0.2.5';
export const BODY_CLASS = 'crlngn-ws';
export const APP_CLASS = 'cws';
/** Set while a window is first marked, so its switch to the kit's look does not animate. */
const SETTLING_CLASS = 'cws-settling';
export const OPT_OUT_CLASS = 'crlngn-ws-off';
export const APP_SELECTORS = Object.freeze([
  'dialog.application.dialog',
  'form.application:has(> .window-header)',
  '.application.category-browser'
]);

/** Windows left alone even when they match APP_SELECTORS: actor sheets, and dnd5e's own apps (Swipe styles them) */
export const EXCLUDED_SELECTOR = '.sheet.actor, .dnd5e2';

/** Document sheets left to their game system or module: their windows are forms too */
export const EXCLUDED_DOCUMENTS = Object.freeze(['Actor', 'Item', 'JournalEntry', 'JournalEntryPage', 'RollTable', 'Adventure']);

const GLOBAL_KEY = Symbol.for('crlngn.windowStyles');
const HINT_LONG = 'cws-hint-long';
const HINT_OPEN = 'cws-hint-open';
const HINT_SELECTOR = `body.${BODY_CLASS} .application.${APP_CLASS} p.hint.${HINT_LONG}`;
/** Windows where Carolingian UI shows hints as tooltips: the kit leaves their hints alone */
const TOOLTIP_HINTS = '.crlngn-hints';
const CATEGORY_NAV = `body.${BODY_CLASS} .application.${APP_CLASS}.category-browser aside > nav.tabs`;
const SUBMENU_SAME = 'cws-submenu-same';
const ICON_ONLY = 'cws-icon-only';

/**
 * The running copy of the kit: owns the injected stylesheet, the Foundry hooks, the document
 * listeners and the hint observer, so a newer copy can stop it and take over.
 */
class Runtime {
  /**
   * @param {string} version
   * @param {string} basePath  folder holding the kit's stylesheets, relative to the Foundry root
   * @param {VoteSet} votes
   */
  constructor(version, basePath, votes) {
    this.version = version;
    this.basePath = basePath;
    this.votes = votes;
    this.hints = new Set();
    this.hookIds = [];
    this.onClick = this.#onClick.bind(this);
    this.onPointerDown = this.#onPointerDown.bind(this);
    this.navOpenAtPress = false;
    this.onKeyDown = this.#onKeyDown.bind(this);
    this.observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver((entries) => { for (const entry of entries) this.measure(entry.target); })
      : null;
  }

  /** Inject the stylesheets, register hooks and listeners, and mark windows already open. */
  start() {
    const style = document.createElement('style');
    style.dataset.crlngnWindowStyles = this.version;
    const url = (file) => `${this.basePath}/${file}?v=${this.version}`;
    style.textContent = [
      `@import url("${url('tokens.css')}") layer(modules.crlngn-ws);`,
      `@import url("${url('base.css')}");`,
      `@import url("${url('priority.css')}") layer(layouts.crlngn-ws);`
    ].join('\n');
    document.head.appendChild(style);
    this.style = style;

    this.hookIds.push(['renderApplicationV2', Hooks.on('renderApplicationV2', (app, element) => this.mark(element ?? app?.element, app))]);
    this.hookIds.push(['closeApplicationV2', Hooks.on('closeApplicationV2', () => this.prune())]);
    document.addEventListener('pointerdown', this.onPointerDown, true);
    document.addEventListener('click', this.onClick);
    document.addEventListener('keydown', this.onKeyDown);

    for (const app of foundry.applications?.instances?.values?.() ?? []) {
      if (app.rendered) this.mark(app.element, app);
    }
  }

  /** Undo start(); the votes are kept for the copy that takes over. */
  stop() {
    this.style?.remove();
    for (const [hook, id] of this.hookIds) Hooks.off(hook, id);
    this.hookIds = [];
    document.removeEventListener('pointerdown', this.onPointerDown, true);
    document.removeEventListener('click', this.onClick);
    document.removeEventListener('keydown', this.onKeyDown);
    this.observer?.disconnect();
    this.hints.clear();
  }

  /** Toggle the body class from the votes, then re-measure hints for the new layout. */
  applyBodyClass() {
    document.body?.classList.toggle(BODY_CLASS, this.votes.active);
    requestAnimationFrame(() => { for (const hint of this.hints) this.measure(hint); });
  }

  /**
   * Add the window class to an allowlisted window and start watching its hints. Framed forms are
   * covered except document sheets (actors, items, journals, tables, adventures), which belong to
   * the game system or their module.
   * @param {HTMLElement|undefined} element
   * @param {foundry.applications.api.ApplicationV2} [app]
   */
  mark(element, app) {
    if (!(element instanceof HTMLElement)) return;
    if (element.classList.contains(OPT_OUT_CLASS) || element.matches(EXCLUDED_SELECTOR)) return;
    if (!element.matches(APP_SELECTORS.join(', '))) return;
    if (EXCLUDED_DOCUMENTS.includes(app?.document?.documentName)) return;
    if (!element.classList.contains(APP_CLASS)) {
      element.classList.add(SETTLING_CLASS);
      requestAnimationFrame(() => requestAnimationFrame(() => element.classList.remove(SETTLING_CLASS)));
    }
    element.classList.add(APP_CLASS);
    this.prune();
    for (const hint of element.querySelectorAll('p.hint')) {
      if (this.hints.has(hint)) continue;
      this.hints.add(hint);
      this.observer?.observe(hint);
      this.measure(hint);
    }
    this.markSubmenus(element);
    for (const button of element.querySelectorAll('.form-footer > button')) {
      button.classList.toggle(ICON_ONLY, !button.textContent.trim());
    }
  }

  /**
   * Flag submenu settings whose button repeats the setting's name (Foundry's own submenus do),
   * so the narrow layout shows the name once; icons and hint markers in the label are ignored.
   * @param {HTMLElement} element
   */
  markSubmenus(element) {
    const text = (node) => {
      const copy = node.cloneNode(true);
      for (const extra of copy.querySelectorAll('i, svg, [class*="hint"]')) extra.remove();
      return copy.textContent.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
    };
    for (const button of element.querySelectorAll('.form-group > .form-fields > button[data-action="openSubmenu"]')) {
      const group = button.closest('.form-group');
      const label = group.querySelector(':scope > label');
      group.classList.toggle(SUBMENU_SAME, !!label && text(label) === text(button));
    }
  }

  /** Stop watching hints that a re-render or a closed window took out of the page. */
  prune() {
    for (const hint of this.hints) {
      if (hint.isConnected) continue;
      this.observer?.unobserve(hint);
      this.hints.delete(hint);
    }
  }

  /**
   * Mark a hint as long when its text runs past the two-line clamp. Open hints keep their state;
   * hidden ones (inactive tabs, or visually hidden 1px submenu hints) are not long, and are
   * measured again when they get a size.
   * @param {HTMLElement} hint
   */
  measure(hint) {
    if (!hint.isConnected || hint.classList.contains(HINT_OPEN)) return;
    const long = document.body.classList.contains(BODY_CLASS) && !hint.closest(TOOLTIP_HINTS)
      && hint.clientWidth > 1 && hint.scrollHeight > hint.clientHeight + 1;
    if (long === hint.classList.contains(HINT_LONG)) return;
    hint.classList.toggle(HINT_LONG, long);
    if (long) {
      hint.setAttribute('role', 'button');
      hint.setAttribute('tabindex', '0');
      hint.setAttribute('aria-expanded', 'false');
    } else {
      hint.removeAttribute('role');
      hint.removeAttribute('tabindex');
      hint.removeAttribute('aria-expanded');
    }
  }

  /** @param {HTMLElement} hint */
  toggle(hint) {
    const open = hint.classList.toggle(HINT_OPEN);
    hint.setAttribute('aria-expanded', String(open));
  }

  /**
   * Remember whether a narrow window's collapsible category list was already open when it was
   * pressed (capture phase, before the press moves focus), so the click can tell a pick from the
   * tap that opens the list.
   * @param {PointerEvent} event
   */
  #onPointerDown(event) {
    const nav = event.target instanceof Element ? event.target.closest(CATEGORY_NAV) : null;
    this.navOpenAtPress = !!nav && nav.matches(':focus-within');
  }

  /**
   * Toggle a long hint; after a category is picked from an open collapsible list, blur the
   * button so the list closes (it opens while focus is inside it, see base.css).
   * @param {MouseEvent} event
   */
  #onClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    const hint = target?.closest(HINT_SELECTOR);
    if (hint) this.toggle(hint);
    const button = target?.closest(`${CATEGORY_NAV} > button`);
    const content = button?.closest('.window-content');
    if (button && this.navOpenAtPress && content && getComputedStyle(content).display === 'grid') button.blur();
    this.navOpenAtPress = false;
  }

  /** @param {KeyboardEvent} event */
  #onKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const hint = event.target instanceof Element ? event.target.closest(HINT_SELECTOR) : null;
    if (!hint) return;
    event.preventDefault();
    this.toggle(hint);
  }
}

/** @returns {Runtime|undefined} */
function runtime() {
  return globalThis[GLOBAL_KEY];
}

/**
 * Install the kit for a host module. Call once during the host's `init` hook (after Foundry's
 * stylesheets are in the page). When another copy is already running, the newer version stays
 * and the older one is stopped; its votes carry over.
 * @param {object} options
 * @param {string} options.moduleId  the host module's id
 * @param {string} [options.basePath="window-styles"]  folder inside the module holding styles/
 * @returns {string} the version now running
 */
export function install({ moduleId, basePath = 'window-styles' }) {
  const current = runtime();
  if (current && compareVersions(current.version, VERSION) >= 0) return current.version;
  const votes = current?.votes ?? new VoteSet();
  current?.stop();
  const next = new Runtime(VERSION, `modules/${moduleId}/${basePath}`, votes);
  globalThis[GLOBAL_KEY] = next;
  next.start();
  next.applyBodyClass();
  return VERSION;
}

/**
 * Vote for or against the styles on behalf of a module. They apply while any module votes on.
 * @param {string} moduleId
 * @param {boolean} on
 * @returns {boolean} whether the styles are active after this vote
 */
export function request(moduleId, on) {
  const current = runtime();
  if (!current) return false;
  current.votes.set(moduleId, !!on);
  current.applyBodyClass();
  return current.votes.active;
}

/** @returns {boolean} whether any module currently votes the styles on */
export function isActive() {
  return !!runtime()?.votes.active;
}

/** @returns {string|null} the version of the copy that is running, if any */
export function runningVersion() {
  return runtime()?.version ?? null;
}

export const WindowStyles = { VERSION, APP_SELECTORS, EXCLUDED_SELECTOR, EXCLUDED_DOCUMENTS, install, request, isActive, runningVersion };
