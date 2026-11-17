import React from 'react';

import { CommonGroundResultItem } from 'api/common_ground/types';

import { render, screen } from 'utils/testUtils/rtl';

import CommonGroundResults from '.';

const item = (
  title: string,
  agreement: CommonGroundResultItem['agreement'],
  votes: CommonGroundResultItem['votes']
): CommonGroundResultItem => ({
  id: title,
  title_multiloc: { en: title },
  agree_percent: 0,
  agreement,
  votes,
});

const agreed = item('Agreed statement', 'agree', {
  up: 1,
  down: 0,
  neutral: 0,
});
const neutralOnly = item('Neutral only statement', null, {
  up: 0,
  down: 0,
  neutral: 1,
});

jest.mock('api/common_ground/useCommonGroundResults', () => () => ({
  isLoading: false,
  data: {
    data: {
      attributes: {
        stats: {
          num_participants: 1,
          num_ideas: 2,
          votes: { up: 1, down: 0, neutral: 1 },
        },
        top_consensus_ideas: [],
        top_controversial_ideas: [],
        ideas_by_agreement: [agreed, neutralOnly],
      },
    },
  },
}));

describe('CommonGroundResults', () => {
  it('leaves statements with only neutral reactions out of the list', () => {
    render(<CommonGroundResults phaseId="phase-id" />);

    expect(screen.getByText('Agreed statement')).toBeInTheDocument();
    expect(
      screen.queryByText('Neutral only statement')
    ).not.toBeInTheDocument();
  });
});
