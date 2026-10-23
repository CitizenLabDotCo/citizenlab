import {
  CSSProperties,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  A11yResults,
  A11yTone,
  axeSummary,
  axeTitle,
  Checklist,
  checklistCounts,
  formatDate,
  KEYBOARD_LABEL,
  KEYBOARD_TONE,
  keyboardStatus,
  reviewedLine,
  worstCount,
} from '../lib/a11y';
import { storyUrl } from '../lib/frame';
import { channelOf, isRendered } from '../lib/preview';
import {
  OFFICE_LABEL,
  STATUS_LABEL,
  StoryGroup,
  Status,
  Office,
} from '../lib/stories';

import Icon from './Icon';

import type { FrameGlobals } from '../lib/frame';
import { plural } from '../lib/plural';

// How much of the component file follows the tokens, as a ring. Only a
// partial score gets one: at 0 or 100 (or unscanned) the status chip says
// it all.
export const ScoreRing = ({
  score,
  status,
  size = 32,
}: {
  score?: number;
  status: Status;
  size?: number;
}) => {
  const r = 13;
  const c = 2 * Math.PI * r;
  const pct = score === undefined ? null : Math.round(score * 100);
  if (pct === null || pct <= 0 || pct >= 100) return null;
  const label = `Follows tokens: ${pct}%`;
  return (
    <span
      className={`wb-score wb-score-${status}`}
      title={label}
      data-testid="wb-score"
    >
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <circle className="wb-score-track" cx="16" cy="16" r={r} />
        <circle
          className="wb-score-arc"
          cx="16"
          cy="16"
          r={r}
          strokeDasharray={`${(c * pct) / 100} ${c}`}
          transform="rotate(-90 16 16)"
        />
      </svg>
      <span aria-hidden="true">{`${pct}%`}</span>
      <span className="wb-visually-hidden">{label}</span>
    </span>
  );
};

export const StatusChip = ({ status }: { status: Status }) => (
  <span className={`wb-chip wb-chip-${status}`} data-testid="wb-status">
    <span className="wb-chip-dot" aria-hidden="true" />
    {STATUS_LABEL[status]}
  </span>
);

export const OfficeChip = ({ office }: { office: Office }) => (
  <span className="wb-chip wb-chip-office" data-testid="wb-office">
    {OFFICE_LABEL[office]}
  </span>
);

// The accessibility line of a card (SPEC 7.6): one chip in the worst tone
// of the axe run, the keyboard test and the review, naming the worst of
// them. Its tooltip carries all three; the A11y panel has the full picture.
const TONE_RANK: A11yTone[] = ['none', 'pass', 'warn', 'fail'];

export const A11yBadges = ({
  group,
  results,
  checklist,
}: {
  group: StoryGroup;
  results: A11yResults | null;
  checklist: Checklist | null;
}) => {
  const axe = axeSummary(results, group);
  const kb = keyboardStatus(results, group, checklist);
  const reviewed = checklist && reviewedLine(checklist);
  const counts = checklist && checklistCounts(checklist);
  if (axe.checked === 0 && !reviewed) return null;
  const axeTone: A11yTone =
    axe.worst === 'critical' ? 'fail' : axe.worst ? 'warn' : 'pass';
  const kbTone: A11yTone = kb === 'unknown' ? 'none' : KEYBOARD_TONE[kb];
  const reviewTone: A11yTone = counts && counts.fail > 0 ? 'fail' : 'none';
  const tones: A11yTone[] = [
    axe.checked > 0 ? axeTone : 'none',
    kbTone,
    reviewTone,
  ];
  const tone = tones.reduce((a, b) =>
    TONE_RANK.indexOf(b) > TONE_RANK.indexOf(a) ? b : a
  );
  const worst = worstCount(axe);
  const reviewLabel =
    counts && counts.fail > 0
      ? plural(counts.fail, 'check fails', 'checks fail')
      : undefined;
  // The label names the source that set the chip's tone, so a red chip
  // never reads like a warning.
  const label =
    (tones[0] === tone && tone !== 'pass' && worst) ||
    (reviewTone === tone && reviewLabel) ||
    (kbTone === tone && (tone === 'fail' || tone === 'warn')
      ? KEYBOARD_LABEL[kb]
      : undefined) ||
    worst ||
    reviewLabel ||
    (axe.checked > 0 ? 'Axe pass' : 'Reviewed');
  const reviewTitle =
    reviewed && counts
      ? `Reviewed by ${checklist.reviewer} on ${formatDate(
          checklist.reviewedAt ?? ''
        )}: ${counts.pass} pass, ${counts.fail} fail, ${
          counts['needs-human']
        } ${counts['needs-human'] === 1 ? 'needs' : 'need'} a person`
      : '';
  const title = [
    axe.checked > 0 && axeTitle(axe),
    kb !== 'unknown' && KEYBOARD_LABEL[kb],
    reviewTitle,
  ]
    .filter(Boolean)
    .join('\n');
  return (
    <span
      className={`wb-thumb-a11y wb-a11y-mini wb-a11y-tone-${tone}`}
      title={title}
      data-testid="wb-thumb-a11y"
      data-tone={tone}
    >
      <Icon name="a11y" size={14} />
      <span className="wb-thumb-a11y-text" aria-hidden="true">
        {label}
      </span>
      <span className="wb-visually-hidden">{title}</span>
    </span>
  );
};

type Props = {
  group: StoryGroup;
  href: string;
  globals: FrameGlobals;
  // Width the story is laid out at. The frame is scaled to the card's
  // width (never above 100%), so a card of any width shows the same story
  // uncropped.
  frameWidth?: number;
  a11y?: { results: A11yResults | null; checklist: Checklist | null };
};

// The story sits on the card's own surface, without page scrollbars, and
// keeps clear of the card's edges (the story decorator fills its root).
const THUMB_CSS = [
  'html,body{background:transparent!important;overflow:hidden!important}',
  '#storybook-root{position:fixed!important;inset:24px!important}',
].join('');

// Longest wait for the story to render before the frame is shown anyway
// (an error is worth seeing too).
const REVEAL_MS = 5000;

// Frames start loading this far before they scroll into view. Chromium's
// own lazy loading starts much earlier, which loads a whole gallery of
// preview frames at once.
const NEAR = '600px';

// A gallery card: the group's Default story rendered live and scaled down,
// loaded only when it nears the viewport, faded in once Storybook has
// rendered it. The frame is decoration; the card is the link.
const StoryThumb = ({
  group,
  href,
  globals,
  frameWidth = 320,
  a11y,
}: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [near, setNear] = useState(false);
  const [width, setWidth] = useState(0);
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const scale = width > 0 ? Math.min(1, width / frameWidth) : 0.75;
  const timer = useRef<number>();
  const src = storyUrl(group.defaultId, globals);
  useEffect(() => {
    const el = box.current;
    if (!el || near) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { rootMargin: NEAR }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);
  useEffect(() => {
    setLoaded(false);
    return () => window.clearTimeout(timer.current);
  }, [src]);
  const onLoad = (e: SyntheticEvent<HTMLIFrameElement>) => {
    const win = e.currentTarget.contentWindow;
    const doc = e.currentTarget.contentDocument;
    if (!win || !doc) return setLoaded(true);
    const style = doc.createElement('style');
    style.textContent = THUMB_CSS;
    doc.head.appendChild(style);
    const show = () => setLoaded(true);
    if (isRendered(win)) return show();
    channelOf(win)?.on('storyRendered', show);
    channelOf(win)?.on('storyErrored', show);
    channelOf(win)?.on('storyThrewException', show);
    timer.current = window.setTimeout(show, REVEAL_MS);
  };
  const states = group.stories.filter((s) => s.state).length;
  return (
    <a
      className="wb-card wb-thumb-card"
      href={href}
      data-testid="wb-thumb"
      data-story={group.defaultId}
    >
      <span
        ref={box}
        className={loaded ? 'wb-thumb' : 'wb-thumb wb-thumb-loading'}
        style={{ '--wb-thumb-scale': scale } as CSSProperties}
      >
        {near && (
          <iframe
            key={src}
            src={src}
            title={`${group.name} preview`}
            loading="lazy"
            tabIndex={-1}
            aria-hidden="true"
            onLoad={onLoad}
          />
        )}
      </span>
      <span className="wb-thumb-body">
        <span className="wb-thumb-head">
          <span className="wb-thumb-title">
            <span className="wb-card-title">{group.name}</span>
            <span className="wb-thumb-meta">
              {[
                group.category,
                plural(group.stories.length, 'story', 'stories'),
                states > 0 && plural(states, 'state', 'states'),
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
          <ScoreRing score={group.score?.score} status={group.status} />
        </span>
        <span className="wb-chip-row">
          <StatusChip status={group.status} />
          {a11y && (
            <A11yBadges
              group={group}
              results={a11y.results}
              checklist={a11y.checklist}
            />
          )}
        </span>
      </span>
    </a>
  );
};

export default StoryThumb;
