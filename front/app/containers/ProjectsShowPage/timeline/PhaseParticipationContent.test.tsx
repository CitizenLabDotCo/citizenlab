import React from 'react';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { render, screen, waitFor } from 'utils/testUtils/rtl';

import PhaseParticipationContent from './PhaseParticipationContent';

// Every piece of content a phase can render, stubbed down to one marker, so the
// assertions are about which branches fire rather than what the leaves draw.
jest.mock('components/StatusModule', () => () => (
  <div data-testid="phase-content" />
));
jest.mock('./Ideas', () => () => <div data-testid="phase-content" />);
jest.mock('./VotingResults', () => () => <div data-testid="phase-content" />);
jest.mock('./CommonGround/CommonGroundTabs', () => () => (
  <div data-testid="phase-content" />
));
jest.mock('./PhaseReport', () => () => <div data-testid="phase-content" />);
jest.mock('../shared/survey', () => () => <div data-testid="phase-content" />);
jest.mock('../shared/poll', () => () => <div data-testid="phase-content" />);
jest.mock('../shared/volunteering', () => () => (
  <div data-testid="phase-content" />
));
jest.mock(
  'containers/ProjectsShowPage/shared/document_annotation',
  () => () => <div data-testid="phase-content" />
);

const buildPhase = (
  participation_method: ParticipationMethod,
  attributes: Partial<IPhaseData['attributes']> = {},
  relationships: Partial<IPhaseData['relationships']> = {}
): IPhaseData => {
  const base = phasesData[0];

  return {
    ...base,
    attributes: { ...base.attributes, participation_method, ...attributes },
    relationships: { ...base.relationships, ...relationships },
  };
};

const publicReport = {
  report: { data: { id: 'report-id', type: 'report' } },
};

const withContent: [string, IPhaseData][] = [
  ['ideation', buildPhase('ideation')],
  ['proposals', buildPhase('proposals')],
  ['voting', buildPhase('voting', { voting_method: 'budgeting' })],
  ['common ground', buildPhase('common_ground')],
  ['poll', buildPhase('poll')],
  ['volunteering', buildPhase('volunteering')],
  [
    'an embedded external survey',
    buildPhase('survey', {
      survey_service: 'typeform',
      survey_embed_url: 'https://example.com',
    }),
  ],
  [
    'document annotation',
    buildPhase('document_annotation', {
      document_annotation_embed_url: 'https://example.com',
    }),
  ],
  [
    'information with a public report',
    buildPhase('information', { report_public: true }, publicReport),
  ],
];

const withoutContent: [string, IPhaseData][] = [
  ['a native survey', buildPhase('native_survey')],
  ['a community monitor survey', buildPhase('community_monitor_survey')],
  ['an external survey without an embed url', buildPhase('survey')],
  ['document annotation without a document', buildPhase('document_annotation')],
  [
    'information with a private report',
    buildPhase('information', { report_public: false }, publicReport),
  ],
  ['information without a report', buildPhase('information')],
];

// Rendered into a host element so "renders nothing" can be asserted without the
// test providers' own markup getting in the way.
const renderPhase = (phase: IPhaseData) =>
  render(
    <div data-testid="host">
      <PhaseParticipationContent
        project={project1}
        phase={phase}
        wrapReportInSuspense
      />
    </div>
  );

describe('PhaseParticipationContent', () => {
  it.each(withContent)('renders content for %s', async (_, phase) => {
    renderPhase(phase);

    await waitFor(() => {
      expect(screen.queryAllByTestId('phase-content').length).toBeGreaterThan(
        0
      );
    });
  });

  // An empty wrapper left behind here is what the surrounding section paints as
  // a blank coloured band, so nothing at all may reach the DOM.
  it.each(withoutContent)('renders nothing at all for %s', async (_, phase) => {
    renderPhase(phase);

    await waitFor(() => {
      expect(screen.getByTestId('host')).toBeEmptyDOMElement();
    });
  });
});
