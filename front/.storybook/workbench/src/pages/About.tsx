import { useEffect, useState } from 'react';

import type { IndexMeta } from '../../../../scripts/design-system/index/schema';
import {
  loadIndexMeta,
  loadStoryAudit,
  StoryAudit,
  StoryAuditEntry,
} from '../lib/data';

const REPO = 'https://github.com/CitizenLabDotCo/citizenlab';

const pct = (n: number, of: number) =>
  of ? `${Math.round((n / of) * 100)}%` : 'none';

// The audit's counts: rendered, errored, blank, and the share of the
// default target's values that trace to a line of code.
const auditCounts = (audit: StoryAudit) => {
  const all: StoryAuditEntry[] = Object.values(audit.stories);
  const traced = all.reduce((n, s) => n + (s.trace?.traced ?? 0), 0);
  const total = all.reduce((n, s) => n + (s.trace?.total ?? 0), 0);
  return {
    stories: all.length,
    rendered: all.filter((s) => s.rendered && !s.blank).length,
    errors: all.filter((s) => !s.rendered).length,
    blank: all.filter((s) => s.rendered && s.blank).length,
    traced,
    total,
  };
};

const Numbers = () => {
  const [meta, setMeta] = useState<IndexMeta | null | undefined>();
  const [audit, setAudit] = useState<StoryAudit | null | undefined>();
  useEffect(() => {
    loadIndexMeta().then(setMeta);
    loadStoryAudit().then(setAudit);
  }, []);
  if (meta === undefined || audit === undefined) return null;
  const counts = audit ? auditCounts(audit) : null;
  return (
    <dl className="wb-about-numbers" data-testid="wb-about-numbers">
      {meta ? (
        <>
          <div>
            <dt>Style templates indexed</dt>
            <dd>{meta.templates.toLocaleString('en')}</dd>
            <dd className="wb-muted">
              in {meta.files.toLocaleString('en')} files, at commit{' '}
              <a href={`${REPO}/commit/${meta.commit}`}>
                <code>{meta.commit.slice(0, 10)}</code>
              </a>
            </dd>
          </div>
          <div>
            <dt>Interpolated values the index can follow</dt>
            <dd>{pct(meta.exprsKnown, meta.exprs)}</dd>
            <dd className="wb-muted">
              {meta.exprsKnown.toLocaleString('en')} of{' '}
              {meta.exprs.toLocaleString('en')}; the rest show "not traced"
            </dd>
          </div>
        </>
      ) : (
        <div>
          <dt>Code index</dt>
          <dd>None in this build: values are not traced</dd>
        </div>
      )}
      {counts ? (
        <>
          <div>
            <dt>Stories that render</dt>
            <dd>
              {counts.rendered} of {counts.stories}
            </dd>
            <dd className="wb-muted">
              {counts.errors} error, {counts.blank} blank, measured at commit{' '}
              <code>{audit?.commit.slice(0, 10)}</code>
            </dd>
          </div>
          {counts.total > 0 && (
            <div>
              <dt>Values traced on each story's default element</dt>
              <dd>{pct(counts.traced, counts.total)}</dd>
              <dd className="wb-muted">
                {counts.traced.toLocaleString('en')} of{' '}
                {counts.total.toLocaleString('en')} values
              </dd>
            </div>
          )}
        </>
      ) : (
        <div>
          <dt>Story audit</dt>
          <dd>None in this build</dd>
        </div>
      )}
    </dl>
  );
};

// How the workbench knows where a value comes from, in plain words, for a
// developer checking it.
const About = () => (
  <article className="wb-page wb-about" data-testid="wb-about">
    <header className="wb-page-head">
      <h1>How it works</h1>
      <p className="wb-lead">
        Every value the Design tab shows is read from the code, or it says "not
        traced" and why. Nothing is matched by value.
      </p>
    </header>

    <section>
      <h2 className="wb-section-title">This build's numbers</h2>
      <Numbers />
    </section>

    <section>
      <h2 className="wb-section-title">From a pixel to a line of code</h2>
      <ol className="wb-about-steps">
        <li>
          <strong>The index.</strong> A fixed script (
          <code>npm run ds:index</code>) reads every styled-components template
          in <code>app/</code> with Babel and writes, per template, its CSS
          declarations and what each <code>{'${…}'}</code> reads: a prop, the
          theme, a constant, a literal or a token. The same commit always gives
          the same bytes. Each build indexes its own commit.
        </li>
        <li>
          <strong>The rule that wins.</strong> For a property of the clicked
          element, the workbench finds the CSS rule that wins in the browser's
          cascade, as the Computed tab of DevTools does.
        </li>
        <li>
          <strong>The component that wrote it.</strong> The rule's generated
          class names the styled component. Its template, as React holds it, is
          matched to the indexed template by exact string equality.
        </li>
        <li>
          <strong>The value's source.</strong> The template's own functions run
          again with the element's real props and theme, and each piece of CSS
          they produce keeps where it came from. The winning declaration's value
          is followed back through constants, maps and function returns to the
          line that writes it.
        </li>
        <li>
          <strong>The check.</strong> The value read back from the code must
          equal what the browser computes, character for character. If any step
          fails, the value says "not traced" and the reason.
        </li>
      </ol>
    </section>

    <section>
      <h2 className="wb-section-title">What a change can do</h2>
      <ul className="wb-about-list">
        <li>
          An edit replaces exactly the traced expression with a token, on one
          line. The new file is parsed again: everything outside that range must
          be unchanged, token for token, or it is left for a person.
        </li>
        <li>
          The sender (<code>scripts/design-system/send.js</code>) checks again
          on its own: it commits only a line where one value became a{' '}
          <code>var(--gv-…)</code> token, or the reverse.
        </li>
        <li>
          Each change is a commit on a <code>design-system/</code> branch with
          its preview. CI runs, and a developer reviews and approves it like any
          other pull request.
        </li>
      </ul>
    </section>

    <section>
      <h2 className="wb-section-title">What it cannot do</h2>
      <ul className="wb-about-list">
        <li>
          A value set by the caller through a prop is traced to the prop, not
          edited: changing it means changing every place that passes it.
        </li>
        <li>
          Logic (conditions, functions that compute a value, data) is never
          edited here. That is a developer's or an agent's job, by hand.
        </li>
        <li>
          A value read from the theme or a shared constant is shown with the
          line that defines it, which is never changed: the edit replaces the
          read in this component only, so others that read it stay as they are.
        </li>
        <li>
          A value the story draws around the component (its frame) is shown as
          "story frame" with its line in the story file. It is not part of the
          component and offers no edit.
        </li>
      </ul>
    </section>

    <section>
      <h2 className="wb-section-title">How to check us</h2>
      <ul className="wb-about-list">
        <li>
          <code>npm run ds:index</code> writes the index; run it twice and
          compare the folders.
        </li>
        <li>
          <code>npm run ds:trace-check -- --url &lt;storybook&gt;</code> opens
          known components and compares each traced value and line with the one
          written down from the code beforehand.
        </li>
        <li>
          <code>npm run ds:demo-check -- --url &lt;storybook&gt;</code> opens
          ten of the most used components, checks that every value of every
          section has a line or a reason, makes a change on each and times the
          send.
        </li>
        <li>
          Open DevTools on the canvas: the winning rule and its value are the
          ones the Design tab names.
        </li>
        <li>
          Every line the Design tab names links to GitHub at the commit this
          build was made from.
        </li>
      </ul>
    </section>
  </article>
);

export default About;
