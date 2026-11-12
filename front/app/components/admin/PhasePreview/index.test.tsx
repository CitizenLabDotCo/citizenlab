import React from 'react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { createDraftPhase } from 'utils/phasePreview/draftPhase';
import { act, fireEvent, render, screen } from 'utils/testUtils/rtl';

import PhasePreview from '.';

beforeEach(() => jest.useFakeTimers());

afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

const day = 24 * 60 * 60 * 1000;
const inDays = (days: number) =>
  new Date(Date.now() + days * day).toISOString();

const renderPreview = (draft: { start_at?: string; end_at?: string }) => (
  <PhasePreview
    src="/en/projects/project/1"
    title="Phase preview"
    snapshot={{
      project: project1,
      phase: createDraftPhase(project1.id, draft),
      draft,
      unsaved: true,
    }}
  />
);

it('follows edited dates into another lifecycle after a manual choice', () => {
  const { rerender } = render(
    renderPreview({ start_at: inDays(-1), end_at: inDays(5) })
  );
  expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  fireEvent.click(screen.getByRole('button', { name: 'Ended' }));
  expect(screen.getByRole('button', { name: 'Ended' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  rerender(renderPreview({ start_at: inDays(-1), end_at: inDays(6) }));
  expect(screen.getByRole('button', { name: 'Ended' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  rerender(renderPreview({ start_at: inDays(3), end_at: inDays(6) }));
  expect(screen.getByRole('button', { name: 'Before' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

it('offers only the three lifecycle states', () => {
  render(renderPreview({ start_at: inDays(-1), end_at: inDays(5) }));

  expect(
    screen.getAllByRole('button').map((button) => button.textContent)
  ).toEqual(['Before', 'Open', 'Ended']);
  expect(screen.queryByText(/What residents see/)).not.toBeInTheDocument();
});

it('includes saved participation in Open and Ended snapshots', () => {
  render(renderPreview({ start_at: inDays(-1), end_at: inDays(5) }));
  const frame = screen.getByTitle('Phase preview');

  if (!(frame instanceof HTMLIFrameElement) || !frame.contentWindow) {
    throw new Error('Preview iframe is missing');
  }

  const postMessage = jest.spyOn(frame.contentWindow, 'postMessage');

  for (const [label, lifecycle, showParticipation] of [
    ['Before', 'before', false],
    ['Open', 'open', true],
    ['Ended', 'ended', true],
  ] as const) {
    fireEvent.click(screen.getByRole('button', { name: label }));
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: { type: 'phase-preview-ready' },
      })
    );

    expect(postMessage).toHaveBeenLastCalledWith(
      {
        type: 'phase-preview-snapshot',
        snapshot: expect.objectContaining({ lifecycle, showParticipation }),
      },
      window.location.origin
    );
  }

  postMessage.mockRestore();
});
