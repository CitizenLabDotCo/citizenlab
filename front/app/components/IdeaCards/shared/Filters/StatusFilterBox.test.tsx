import React from 'react';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhase, IPhaseData } from 'api/phases/types';

import { render } from 'utils/testUtils/rtl';

import StatusFilterBox from './StatusFilterBox';

jest.mock('api/idea_statuses/useIdeaStatuses');
jest.mock('api/ideas_filter_counts/useIdeasFilterCounts', () =>
  jest.fn(() => ({
    data: {
      data: {
        type: 'filter_counts',
        attributes: {
          idea_status_id: {},
          area_id: {},
          input_topic_id: {},
          total: 0,
        },
      },
    },
  }))
);
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

const mockPhase = (attributes: Partial<IPhaseData['attributes']>): IPhase => ({
  data: {
    ...phasesData[0],
    attributes: { ...phasesData[0].attributes, ...attributes },
  },
});

const renderStatusFilterBox = (phase: IPhase) =>
  render(
    <StatusFilterBox
      selectedStatusId={null}
      ideaQueryParameters={{}}
      onChange={jest.fn()}
      phase={phase}
    />
  );

describe('StatusFilterBox', () => {
  beforeEach(() => {
    jest.mocked(useIdeaStatuses).mockClear();
  });

  /*
    A phase can carry a prescreening_mode on a platform where screening is not in effect
    (tenant templates and project copies bring the value across from platforms whose
    feature flags differ). The back end serializes the flag-aware effective mode, and
    that — not the raw prescreening_mode, nor the feature flag (mocked on here) — must
    decide whether the public list offers a screening status that can never match.
  */
  it('excludes the screening status when the configured mode is not in effect', () => {
    renderStatusFilterBox(
      mockPhase({ prescreening_mode: 'all', effective_prescreening_mode: null })
    );

    expect(jest.mocked(useIdeaStatuses)).toHaveBeenCalledWith({
      queryParams: {
        participation_method: 'ideation',
        exclude_codes: ['prescreening'],
      },
    });
  });

  it('includes the screening status when the mode is in effect', () => {
    renderStatusFilterBox(
      mockPhase({
        prescreening_mode: 'all',
        effective_prescreening_mode: 'all',
      })
    );

    expect(jest.mocked(useIdeaStatuses)).toHaveBeenCalledWith({
      queryParams: { participation_method: 'ideation' },
    });
  });
});
