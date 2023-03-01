import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import useIdeaById from 'api/ideas/useIdeaById';
import { ideaData as mockIdeaData } from 'api/ideas/__mocks__/useIdeaById';
import Idea from './';

const viewId = '1';
const ideaId = '5';

jest.mock('api/ideas/useIdeaById', () => {
  return jest.fn(() => ({ data: { data: mockIdeaData[0] } }));
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
    expect(useIdeaById).toHaveBeenCalledWith(ideaId);
  });
});
