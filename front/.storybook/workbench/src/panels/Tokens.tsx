import { useEffect, useMemo, useRef, useState } from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import ChangesDrawer from '../components/ChangesDrawer';
import { CopiedText, HealButton, useCopy } from '../components/HealCopy';
import Icon from '../components/Icon';
import Segmented from '../components/Segmented';
import TokenRow from '../components/TokenRow';
import {
  fileFindings,
  Match,
  PanelToken,
  panelTokens,
} from '../lib/componentPanels';
import { resolveTokens } from '../lib/contrast';
import { TOKEN_META } from '../lib/data';
import { readComputedTokens, TokenMatch } from '../lib/frame';
import { formatHealTask, HealMode } from '../lib/healTask';
import type { Overrides } from '../lib/overrides';
import { channelOf, isRendered, whenRendered } from '../lib/preview';
import type { StoryGroup } from '../lib/stories';
import { DEFS } from '../lib/tokenValues';
import type { Indexes } from '../lib/useScanIndexes';

type Props = {
  storyId: string;
  group: StoryGroup;
  // The first canvas frame, null while it loads.
  frame: Window | null;
  indexes: Indexes;
  mode: Mode;
  overrides: Overrides;
  setOverride: (name: TokenName, value: string) => string | undefined;
  reset: (name?: TokenName) => void;
  healMode: HealMode;
  onCount: (n: number | undefined) => void;
};

type Filter = 'all' | Match;

// Rows shown before "Show all".
const FIRST_ROWS = 12;
// Pause after a render or an edit before the frame is read again.
const READ_MS = 60;

export const MATCH_LABEL: Record<Match, string> = {
  linked: 'Linked',
  equal: 'Matches',
  none: 'Code',
};

const MATCH_TITLE: Record<Match, string> = {
  linked: 'A style of this story reads the token.',
  equal: 'A rendered value equals the token, but the code has it hard-coded.',
  none: 'The code reaches the token; this story does not render it.',
};

const MatchChip = ({ match }: { match: Match }) => (
  <span
    className={`wb-match wb-match-${match}`}
    title={MATCH_TITLE[match]}
    data-testid="wb-token-match"
    data-match={match}
  >
    <span className="wb-chip-dot" aria-hidden="true" />
    {MATCH_LABEL[match]}
  </span>
);

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// Under a token: what the code does with it, and the heal of its hard
// values and legacy reads.
const Footer = ({
  row,
  tasks,
  hasFile,
}: {
  row: PanelToken;
  tasks: string[];
  hasFile: boolean;
}) => {
  const all = tasks.join('\n\n');
  const { copied, copy, clear } = useCopy(all);
  const reads = row.findings.length - row.heal.length;
  return (
    <div className="wb-ptoken-foot">
      <div className="wb-ptoken-foot-row">
        <span className="wb-ptoken-code">
          {row.heal.length > 0 ? (
            <>
              <span className="wb-diff-dot" aria-hidden="true" />
              {plural(row.heal.length, 'value', 'values')} to heal
              {reads > 0 && `, read ${plural(reads, 'time', 'times')}`}
            </>
          ) : reads > 0 ? (
            <>
              <Icon name="check" size={14} />
              {`Read ${plural(reads, 'time', 'times')} in this file`}
            </>
          ) : (
            <span className="wb-muted">
              {hasFile ? 'Set by another file' : 'Seen in the story'}
            </span>
          )}
        </span>
        {row.heal.length > 0 && (
          <HealButton
            onClick={() => copy(all)}
            label={row.heal.length > 1 ? `Heal ${row.heal.length}` : 'Heal'}
          />
        )}
      </div>
      {row.heal.length > 0 && (
        <ul className="wb-ptoken-heals">
          {row.heal.slice(0, 4).map((f) => (
            <li key={`${f.line}:${f.col}`}>
              <span className="wb-line">L{f.line}</span>
              <code>{f.raw.replace(/\s+/g, '')}</code>
            </li>
          ))}
          {row.heal.length > 4 && (
            <li className="wb-muted">and {row.heal.length - 4} more</li>
          )}
        </ul>
      )}
      <CopiedText copied={copied} onClose={clear} />
    </div>
  );
};

// The tokens the story renders, merged with the tokens its file reaches in
// the scan. Each row edits the token like Foundations does; the edits are
// the same session, listed in the shared Changes drawer.
const Tokens = ({
  storyId,
  group,
  frame,
  indexes,
  mode,
  overrides,
  setOverride,
  reset,
  healMode,
  onCount,
}: Props) => {
  const [computed, setComputed] = useState<TokenMatch[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [all, setAll] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const timer = useRef<number>();

  const read = useMemo(
    () => () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        try {
          if (frame)
            setComputed(readComputedTokens(frame.document, TOKEN_META));
        } catch {
          // The frame navigated away mid-read; the next render reads again.
        }
      }, READ_MS);
    },
    [frame]
  );

  useEffect(() => {
    setComputed(null);
    if (!frame) return undefined;
    const cancel = whenRendered(frame, read);
    const channel = channelOf(frame);
    channel?.on('storyRendered', read);
    return () => {
      cancel();
      channel?.off('storyRendered', read);
      window.clearTimeout(timer.current);
    };
  }, [frame, read]);
  // An edit can make a hard value equal a token, or stop it.
  useEffect(() => {
    if (frame && isRendered(frame)) read();
  }, [overrides, mode, frame, read]);
  useEffect(() => {
    setFilter('all');
    setAll(false);
  }, [storyId]);

  const findings = useMemo(
    () => (indexes.scan ? fileFindings(indexes.scan, group.file) : []),
    [indexes.scan, group.file]
  );
  const rows = useMemo(
    () => panelTokens(computed, findings, TOKEN_META),
    [computed, findings]
  );
  const ready = computed !== null && indexes.loaded;
  useEffect(
    () => onCount(ready ? rows.length : undefined),
    [ready, rows.length, onCount]
  );

  const live = useMemo(() => resolveTokens(DEFS, overrides), [overrides]);
  const byName = useMemo(() => new Map(TOKEN_META.map((t) => [t.name, t])), []);
  const routes = group.score?.routes ?? [];
  const count = (m: Match) => rows.filter((r) => r.match === m).length;
  const filtered =
    filter === 'all' ? rows : rows.filter((r) => r.match === filter);
  const shown = all ? filtered : filtered.slice(0, FIRST_ROWS);
  const edits = Object.keys(overrides).length;
  const toHeal = rows.reduce((n, r) => n + r.heal.length, 0);

  return (
    <div className="wb-ptokens-panel" data-testid="wb-panel-tokens">
      <div className="wb-ptokens-head">
        <span className="wb-ptokens-sum">
          {ready ? (
            <>
              <strong>{plural(rows.length, 'token', 'tokens')}</strong>
              {toHeal > 0 && (
                <span className="wb-muted">{`, ${toHeal} to heal`}</span>
              )}
            </>
          ) : (
            <span className="wb-muted">Reading the story...</span>
          )}
        </span>
        <button
          type="button"
          className="wb-changes-toggle wb-icon-button"
          data-testid="wb-ptokens-changes"
          aria-expanded={drawer}
          onClick={() => setDrawer((d) => !d)}
        >
          <Icon name="edit" size={14} />
          Changes
          <span className={edits > 0 ? 'wb-count wb-count-on' : 'wb-count'}>
            {edits}
          </span>
        </button>
      </div>
      {drawer && (
        <ChangesDrawer
          meta={TOKEN_META}
          mode={mode}
          overrides={overrides}
          onReset={reset}
          onClose={() => setDrawer(false)}
        />
      )}

      {!ready ? (
        <div className="wb-controls-loading" aria-label="Reading the story">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="wb-skeleton-line" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="wb-panel-empty" data-testid="wb-tokens-none">
          <span className="wb-panel-empty-icon">
            <Icon name="tokens" size={20} />
          </span>
          <strong>No tokens here yet</strong>
          <p>
            {group.file
              ? 'The story reads no token, and its file has no value a token could replace.'
              : 'The story reads no token. Its file is not in the scan.'}
          </p>
        </div>
      ) : (
        <>
          <Segmented<Filter>
            label="Show"
            value={filter}
            onChange={(f) => {
              setFilter(f);
              setAll(false);
            }}
            testId="wb-ptokens-filter"
            options={[
              { value: 'all', label: 'All', count: rows.length },
              ...(['linked', 'equal', 'none'] as Match[]).map((m) => ({
                value: m,
                label: MATCH_LABEL[m],
                count: count(m),
                title: MATCH_TITLE[m],
              })),
            ]}
          />
          {filtered.length === 0 ? (
            <p className="wb-panel-none">
              {`No token is ${MATCH_LABEL[
                filter as Match
              ].toLowerCase()} in this story.`}
            </p>
          ) : (
            <table role="table" className="wb-table wb-tokens wb-ptokens">
              <caption className="wb-visually-hidden">
                Tokens of this story
              </caption>
              <tbody role="rowgroup">
                {shown.map((r) => {
                  const token = byName.get(r.name);
                  if (!token) return null;
                  return (
                    <TokenRow
                      key={r.name}
                      token={token}
                      meta={TOKEN_META}
                      mode={mode}
                      override={overrides[r.name as TokenName]}
                      live={live}
                      usage={indexes.usage.get(r.name)}
                      hasScan={indexes.hasScan}
                      onSet={setOverride}
                      onReset={reset}
                      badge={<MatchChip match={r.match} />}
                      footer={
                        <Footer
                          row={r}
                          hasFile={!!group.file}
                          tasks={r.heal.map((f) =>
                            formatHealTask(
                              f,
                              group.name,
                              storyId,
                              routes,
                              healMode
                            )
                          )}
                        />
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          )}
          {!all && filtered.length > FIRST_ROWS && (
            <button
              type="button"
              className="wb-controls-more"
              onClick={() => setAll(true)}
            >
              {`Show all ${filtered.length} tokens`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Tokens;
