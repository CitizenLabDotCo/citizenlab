import React from 'react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { createDraftPhase } from 'utils/phasePreview/draftPhase';
import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import PhasePreview from '.';

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
  expect(
    screen.getByText('What residents see while the phase is open')
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Ended' }));
  expect(
    screen.getByText('What residents see after the phase ends')
  ).toBeInTheDocument();

  rerender(renderPreview({ start_at: inDays(-1), end_at: inDays(6) }));
  expect(
    screen.getByText('What residents see after the phase ends')
  ).toBeInTheDocument();

  rerender(renderPreview({ start_at: inDays(3), end_at: inDays(6) }));
  expect(
    screen.getByText('What residents see before the phase starts')
  ).toBeInTheDocument();
});
