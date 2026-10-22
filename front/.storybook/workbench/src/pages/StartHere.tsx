import { useEffect, useState } from 'react';

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
    <article className="wb-page">
      <h1>Start here</h1>
      <p>
        The workbench shows the design system of the platform as it is today and
        as the redesign wants it: the tokens, the components built on them, and
        the pages they reach. Designers can try token changes live and share
        them as a link; developers can see which components still use hard-coded
        values and heal them.
      </p>
      <h2>How to use it</h2>
      <ul>
        <li>Foundations: one page per token category, with live edit.</li>
        <li>Components and Patterns: every story, with the tokens it uses.</li>
        <li>Review: the real pages before and after a change.</li>
        <li>
          Proposal: turn the edits of a session into a change to the token
          source.
        </li>
      </ul>
      <p className="wb-muted">
        These sections fill in as the workbench is built.
      </p>

      <h2>Data</h2>
      {state === null ? (
        <p className="wb-muted">Loading.</p>
      ) : (
        <>
          <p>
            {state.stories} stories, {state.tokens} tokens.
          </p>
          {state.missing.length === 0 ? (
            <p data-testid="wb-missing-none">All data files were found.</p>
          ) : (
            <>
              <p>
                These data files are not in this build, so the pages that use
                them show less:
              </p>
              <ul data-testid="wb-missing">
                {state.missing.map((m) => (
                  <li key={m}>
                    <code>{m.replace(/^\.\.\//, '')}</code>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </article>
  );
};

export default StartHere;
