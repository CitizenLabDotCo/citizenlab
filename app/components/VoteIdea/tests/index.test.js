import React from 'react';
import { mountWithIntl } from 'utils/testing/intl';
import { arrayMock, jestFn, stringMock } from 'utils/testing/constants';

import VoteIdea from '../index';

describe('<VoteIdea />', () => {
  it('should display vote buttons if userId is provided', () => {
    const wrapper = mountWithIntl(<VoteIdea
      ideaId={{ stringMock }}
      userId={{ stringMock }}
      upVotes={arrayMock}
      downVotes={arrayMock}
      onVoteIdeaClick={jestFn}
      submittingVote={false}
      ideaVoteSubmitError={false}
    />);
    expect(wrapper.find('Button').length).toEqual(2);
  });

  it('should not display vote buttons if userId is not provided', () => {
    const wrapper = mountWithIntl(<VoteIdea
      ideaId={{ stringMock }}
      upVotes={arrayMock}
      downVotes={arrayMock}
      onVoteIdeaClick={jestFn}
      submittingVote={false}
      ideaVoteSubmitError={false}
    />);
    expect(wrapper.find('Button').length).toEqual(0);
  });

  it('should not display vote buttons if submittingVote is not provided', () => {
    const wrapper = mountWithIntl(<VoteIdea
      ideaId={{ stringMock }}
      userId={{ stringMock }}
      upVotes={arrayMock}
      downVotes={arrayMock}
      onVoteIdeaClick={jestFn}
      submittingVote
      ideaVoteSubmitError={false}
    />);
    expect(wrapper.find('Button').length).toEqual(0);
  });
});
