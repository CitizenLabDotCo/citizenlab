import { useEffect, useState } from 'react';

import Icon, { IconName } from '../components/Icon';
import { NAV } from '../components/Nav';
import { loadAll, missing } from '../lib/data';

const StartHere = () => {
  const [state, setState] = useState<{
    stories: number;
    tokens: number;
    missing: string[];
  } | null>(null);

  useEffect(() => {
    let live = true;
    loadAll()
      .then(([, tokens, index]) => {
        if (!live) return;
        // index.json may be valid JSON of another shape: count what is there.
        const stories = Object.values(index?.entries ?? {}).filter(
          (e) => e?.type !== 'docs'
        ).length;
        setState({ stories, tokens: tokens.length, missing: [...missing] });
      })
      .catch(() => {
        if (!live) return;
        setState({
          stories: 0,
          tokens: 0,
          missing: [...missing, 'index.json (unreadable)'],
        });
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <article className="wb-page wb-page-wide">
      <section className="wb-hero">
        <div className="wb-hero-text">
          <p className="wb-eyebrow">Design workbench</p>
          <h1>Start here</h1>
          <p className="wb-lead">
            The design system of the platform as it is today and as the redesign
            wants it: the tokens, the components built on them, and the pages
            they reach. Try a token change live, see what it touches, and share
            it as a link.
          </p>
          <div className="wb-hero-actions">
            <a className="wb-button wb-button-primary" href="#/foundations">
              Explore Foundations
              <Icon name="arrow" size={16} />
            </a>
            <a className="wb-button" href="#/foundations/color">
              Check colour contrast
            </a>
          </div>
        </div>
        <HeroArt />
      </section>

      <h2 className="wb-section-title">Sections</h2>
      <ul className="wb-card-grid wb-section-grid">
        {SECTIONS.map((e) => (
          <li key={e.name}>
            <a className="wb-card wb-section-card" href={e.hash}>
              <span className="wb-section-icon">
                <Icon name={e.name as IconName} size={22} />
              </span>
              <span className="wb-card-title">
                {e.label}
                {e.name === 'foundations' ? (
                  <span className="wb-badge wb-badge-live">Live</span>
                ) : (
                  <span className="wb-badge wb-badge-soon">Coming</span>
                )}
              </span>
              <span className="wb-card-text">{e.hint}</span>
            </a>
          </li>
        ))}
      </ul>

      <h2 className="wb-section-title">How it works</h2>
      <ol className="wb-steps">
        <li>
          <strong>Pick a token</strong>
          <span>
            Each Foundations page shows a category, both modes side by side.
          </span>
        </li>
        <li>
          <strong>Edit its value</strong>
          <span>
            Values snap to the scale or palette; anything else is flagged.
          </span>
        </li>
        <li>
          <strong>Share the change</strong>
          <span>The Changes panel copies a link or the token source diff.</span>
        </li>
      </ol>

      <h2 className="wb-section-title">Data in this build</h2>
      {state === null ? (
        <p className="wb-muted">Loading.</p>
      ) : (
        <div className="wb-data">
          <div className="wb-stats">
            <div className="wb-stat">
              <span className="wb-stat-value">{state.stories}</span>
              <span className="wb-stat-label">stories</span>
            </div>
            <div className="wb-stat">
              <span className="wb-stat-value">{state.tokens}</span>
              <span className="wb-stat-label">tokens</span>
            </div>
          </div>
          {state.missing.length === 0 ? (
            <p className="wb-data-note" data-testid="wb-missing-none">
              <span className="wb-badge wb-badge-live">Complete</span> All data
              files were found.
            </p>
          ) : (
            <div className="wb-data-note">
              <p>
                These data files are not in this build, so the pages that use
                them show less:
              </p>
              <ul className="wb-file-list" data-testid="wb-missing">
                {state.missing.map((m) => (
                  <li key={m}>
                    <code>{m.replace(/^\.\.\//, '')}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

// Shapes in token colours: a swatch, a spacing ladder, a card with a button.
const HeroArt = () => (
  <svg
    className="wb-hero-art"
    viewBox="0 0 320 220"
    width="320"
    height="220"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="20"
      y="24"
      width="180"
      height="128"
      rx="14"
      fill="var(--gv-white)"
      stroke="var(--wb-border-strong)"
    />
    <rect
      x="36"
      y="42"
      width="72"
      height="10"
      rx="5"
      fill="var(--gv-grey-300)"
    />
    <rect
      x="36"
      y="62"
      width="120"
      height="8"
      rx="4"
      fill="var(--gv-grey-200)"
    />
    <rect
      x="36"
      y="76"
      width="96"
      height="8"
      rx="4"
      fill="var(--gv-grey-200)"
    />
    <rect
      x="36"
      y="110"
      width="72"
      height="26"
      rx="13"
      fill="var(--wb-accent)"
    />
    <rect
      x="116"
      y="110"
      width="60"
      height="26"
      rx="13"
      fill="none"
      stroke="var(--wb-accent)"
      strokeWidth="1.5"
    />
    <g transform="translate(220 24)">
      <rect width="80" height="26" rx="6" fill="var(--gv-blue-700)" />
      <rect y="30" width="80" height="26" rx="6" fill="var(--gv-blue-400)" />
      <rect y="60" width="80" height="26" rx="6" fill="var(--gv-teal-400)" />
      <rect y="90" width="80" height="26" rx="6" fill="var(--gv-teal-200)" />
      <rect
        y="120"
        width="80"
        height="26"
        rx="6"
        fill="var(--gv-teal-50)"
        stroke="var(--wb-border)"
      />
    </g>
    <g transform="translate(20 172)" fill="var(--gv-teal-200)">
      <rect y="28" width="8" height="4" rx="1" />
      <rect x="14" y="24" width="8" height="8" rx="1" />
      <rect x="28" y="20" width="8" height="12" rx="1" />
      <rect x="42" y="16" width="8" height="16" rx="1" />
      <rect x="56" y="8" width="8" height="24" rx="1" />
      <rect x="70" y="0" width="8" height="32" rx="1" fill="var(--wb-accent)" />
    </g>
    <g
      transform="translate(130 176)"
      fill="none"
      stroke="var(--wb-accent)"
      strokeWidth="1.5"
    >
      <rect width="28" height="28" rx="2" />
      <rect x="40" width="28" height="28" rx="8" />
      <rect x="80" width="28" height="28" rx="14" />
    </g>
  </svg>
);

const SECTIONS = NAV.filter((e) => e.name !== 'start');

export default StartHere;
