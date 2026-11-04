// traceElement: for each longhand of the selected element, the rule that
// wins it (as DevTools' Computed tab) and, for a styled-components rule,
// the declaration and the expression in the code that wrote the value,
// joined by exact equality and by running the code's own functions. A
// property that does not join says why; nothing is guessed.
import {
  collectRules,
  Expands,
  INHERITED,
  MatchedRule,
  Painted,
  sheetKind,
  winnerOf,
} from './cascade';
import { Canonicaliser, canonicaliser } from './canonical';
import { frameDecl } from './frame';
import { IndexClient, indexClient } from './indexClient';
import { checkInternals, hostStyleOf } from './internals';
import { ruleInfo, StyledDeps, StyledTrace, traceStyled } from './trace';
import type { ElementTrace, PropTrace, Template, Why } from './types';

// SVG presentation attributes the Design tab shows as rows.
const SVG_ATTRS = new Set(['fill', 'stroke', 'stroke-width', 'opacity']);
const isSvg = (e: Element) => e.namespaceURI === 'http://www.w3.org/2000/svg';

export type {
  Editable,
  ElementTrace,
  PropTrace,
  TraceSource,
  TraceStatus,
  ViaStep,
  Why,
} from './types';
export { paintedBy } from './cascade';
export type { Painted } from './cascade';
export {
  createIndexClient,
  githubLink,
  indexClient,
  rawSourceUrl,
} from './indexClient';
export type { IndexClient } from './indexClient';
export { checkInternals } from './internals';
export { canonicaliser } from './canonical';
export type { Canonicaliser } from './canonical';

export type TraceOptions = {
  client?: IndexClient;
  // The frame's canonicaliser (a double in tests).
  canon?: Canonicaliser;
  // The workbench's own paint (paintedBy over elementEdits' applied map).
  painted?: Painted;
  // The story's file, from front/: its frame wins over a look-alike frame
  // in another story.
  storyFile?: string;
};

// A declaration whose value reads a design token.
const TOKEN = /var\(\s*(--gv-[\w-]+)/;

const tokenOf = (value: string) => TOKEN.exec(value)?.[1];

export const traceElement = async (
  frame: Window,
  el: Element,
  props: string[],
  opts: TraceOptions = {}
): Promise<ElementTrace> => {
  const client = opts.client ?? indexClient;
  const computed = frame.getComputedStyle(el);
  const valueOf = (prop: string) => computed.getPropertyValue(prop);
  const finish = (
    traces: PropTrace[],
    commit: string,
    roots: (Template | undefined)[] = []
  ): ElementTrace => {
    const counts = new Map<Template, number>();
    for (const t of roots) if (t) counts.set(t, (counts.get(t) ?? 0) + 1);
    let owner: Template | undefined;
    for (const [t, n] of counts) {
      if (!owner || n > (counts.get(owner) ?? 0)) owner = t;
    }
    return {
      ...(owner
        ? {
            owner: {
              ...(owner.name ? { name: owner.name } : {}),
              file: owner.file,
              line: owner.loc.line,
            },
          }
        : {}),
      props: traces,
      traced: traces.filter((t) => t.status !== 'untraced').length,
      total: traces.length,
      commit,
    };
  };
  const all = (why: Why, commit: string) =>
    finish(
      props.map((prop) => ({
        prop,
        value: valueOf(prop),
        status: 'untraced',
        why,
      })),
      commit
    );

  const meta = await client.meta();
  if (!meta) return all('no-index', '');
  if (!checkInternals(frame).ok) return all('internals-changed', meta.commit);

  const canon = opts.canon ?? canonicaliser(frame);
  const painted = opts.painted ?? (() => false);
  const expands: Expands = (prop, value, longhand) =>
    !!canon.longhands(prop, value)?.has(longhand);
  const matched = new Map<Element, MatchedRule[]>();
  const matchedOn = (e: Element) => {
    if (!matched.has(e)) matched.set(e, collectRules(frame, e));
    return matched.get(e) as MatchedRule[];
  };
  const deps: StyledDeps = { client, canon, meta, runs: new WeakMap() };

  const traceProp = async (prop: string): Promise<StyledTrace> => {
    const value = valueOf(prop);
    const at = async (e: Element, from?: Element): Promise<StyledTrace> => {
      const inherited = (r: StyledTrace): StyledTrace =>
        from
          ? {
              ...r,
              trace: {
                ...r.trace,
                status:
                  r.trace.status === 'untraced' ? 'untraced' : 'inherited',
                from,
              },
            }
          : r;
      const parent = e.parentElement;
      const fallback = (): Promise<StyledTrace> | StyledTrace =>
        INHERITED.has(prop) && parent
          ? at(parent, parent)
          : { trace: { prop, value, status: 'default' } };

      const w = winnerOf(e, prop, matchedOn(e), expands, painted);
      // No CSS sets it: an SVG presentation attribute can (Icon's
      // fill={props.fill}). CSS would win over it, so it counts only here.
      if (
        w.kind === 'none' &&
        SVG_ATTRS.has(prop) &&
        isSvg(e) &&
        e.hasAttribute(prop)
      ) {
        return inherited({
          trace: {
            prop,
            value,
            status: 'attribute',
            attrOn: e.tagName.toLowerCase(),
          },
        });
      }
      if (w.kind === 'none') return fallback();
      const keyword = w.declared.value.trim().toLowerCase();
      if (
        keyword === 'inherit' ||
        (keyword === 'unset' && INHERITED.has(prop))
      ) {
        return parent
          ? at(parent, parent)
          : { trace: { prop, value, status: 'default' } };
      }
      if (['initial', 'unset', 'revert', 'revert-layer'].includes(keyword)) {
        return { trace: { prop, value, status: 'default' } };
      }
      const token = tokenOf(w.declared.value);
      const withToken = (r: StyledTrace): StyledTrace =>
        token ? { ...r, trace: { ...r.trace, token } } : r;
      if (w.kind === 'inline') {
        if (w.painted) {
          return inherited(
            withToken({ trace: { prop, value, status: 'edit' } })
          );
        }
        const frame = frameDecl(
          await client.styles(),
          hostStyleOf(e),
          prop,
          opts.storyFile
        );
        return inherited(
          withToken({ trace: { prop, value, status: 'inline', ...frame } })
        );
      }
      if (sheetKind(w.matched.sheet) !== 'styled') {
        return inherited(
          withToken({
            trace: { prop, value, status: 'global', rule: ruleInfo(w.matched) },
          })
        );
      }
      return inherited(
        withToken(
          await traceStyled(e, prop, value, w.matched, w.declared, deps)
        )
      );
    };
    return at(el);
  };

  const results: StyledTrace[] = [];
  for (const prop of props) results.push(await traceProp(prop));
  return finish(
    results.map((r) => r.trace),
    meta.commit,
    results.map((r) => r.root)
  );
};
