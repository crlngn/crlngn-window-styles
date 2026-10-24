/**
 * Pure helpers for the window styles kit, kept free of DOM and Foundry globals so they can be
 * unit tested under Node: semantic version comparison (which installed copy of the kit wins)
 * and the per-module on/off votes that decide whether the styles apply.
 */

/**
 * Compare two "major.minor.patch" versions; missing or non-numeric parts count as 0.
 * @param {string} a
 * @param {string} b
 * @returns {number} negative when a < b, 0 when equal, positive when a > b
 */
export function compareVersions(a, b) {
  const pa = String(a ?? '').split('.').map((n) => Number.parseInt(n, 10) || 0);
  const pb = String(b ?? '').split('.').map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length, 3); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff) return diff;
  }
  return 0;
}

/**
 * One vote per module. The styles apply while any module votes on, so a module turning its
 * setting off only withdraws its own vote.
 */
export class VoteSet {
  #votes = new Map();

  /**
   * @param {string} moduleId
   * @param {boolean} on
   * @returns {boolean} whether any module votes on after this vote
   */
  set(moduleId, on) {
    if (on) this.#votes.set(moduleId, true);
    else this.#votes.delete(moduleId);
    return this.active;
  }

  /** @returns {boolean} */
  get active() {
    return this.#votes.size > 0;
  }

  /** @returns {string[]} modules currently voting on */
  get voters() {
    return [...this.#votes.keys()];
  }
}
