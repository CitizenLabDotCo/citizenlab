import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import useIdeaById from 'api/ideas/useIdeaById';

import Idea from './';

const mockIdeaData = {
  id: '2',
  type: 'idea',
  attributes: {
    title_multiloc: { en: 'Test Idea' },
    body_multiploc: { en: 'Test idea body' },
  },
};

const viewId = '1';
const ideaId = '5';

jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
  };
});

describe('Insights Idea', () => {
  it('renders Idea', () => {
    render(<Idea ideaId={ideaId} />);
    expect(screen.getByTestId('insightsIdea')).toBeInTheDocument();
    expect(screen.getByTestId('insightsIdeaTitle')).toBeInTheDocument();
    expect(screen.getByTestId('insightsIdeaBody')).toBeInTheDocument();
  });
  it('calls useIdea with correct idea id', () => {
    render(<Idea ideaId={ideaId} />);
    expect(useIdeaById).toHaveBeenCalledWith({ ideaId });
  });
});
