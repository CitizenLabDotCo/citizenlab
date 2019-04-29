// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { UserComments, reducer } from './UserComments';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/comments');
import { makeComments } from 'services/comments';

describe('<ConsentManager />', () => {

  it('reducer splits the array returned  by the back-end into arrays of comments belonging to the same idea', () => {
    const commentsAsReturned = makeComments([{ ideaId: 'idea1' }, { ideaId: 'idea1' }, { ideaId: 'idea1' }, { ideaId: 'idea2' }, { ideaId: 'idea2' }]);
    expect(commentsAsReturned.data.reduce(reducer, [[]]).map(arr => arr.map(comment => comment.relationships.idea.data.id))).toMatchSnapshot();
  });
});
