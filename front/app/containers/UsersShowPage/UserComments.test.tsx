// @ts-nocheck
// libraries
import React from 'react';
import { shallow } from 'enzyme';

import { theme } from 'utils/testUtils/theme';

// component to test
import { UserComments } from './UserComments';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/comments');
jest.mock('modules', () => ({ streamsToReset: [] }));
jest.mock('components/Outlet', () => 'Outlet');

import { makeComments } from 'services/comments';

describe('<UserComments />', () => {
  it('renders correctly when empty', () => {
    const commentsAsReturned = { commentsList: [] };
    const Wrapper = shallow(<UserComments comments={commentsAsReturned} />);
    expect(Wrapper).toMatchSnapshot();
  });
  it('renders correctly when empty and own profile', () => {
    const commentsAsReturned = { commentsList: [] };
    const Wrapper = shallow(
      <UserComments
        comments={commentsAsReturned}
        userId="someUser"
        authUser={{ id: 'someUser' }}
      />
    );
    expect(Wrapper).toMatchSnapshot();
  });
  it('renders correctly when error', () => {
    const commentsAsReturned = { commentsList: new Error() };
    const Wrapper = shallow(<UserComments comments={commentsAsReturned} />);
    expect(Wrapper).toMatchSnapshot();
  });
  it('renders correctly with actual comments', () => {
    const commentsAsReturned = {
      commentsList: makeComments([
        { ideaId: 'idea1' },
        { ideaId: 'idea2' },
        { ideaId: 'idea2' },
      ]).data,
    };
    const Wrapper = shallow(<UserComments comments={commentsAsReturned} />);
    expect(Wrapper).toMatchSnapshot();
  });
  it('renders correctly with actual comments and load more button', () => {
    const loadMore = jest.fn();
    const commentsAsReturned = {
      loadMore,
      hasMore: true,
      commentsList: makeComments([{ ideaId: 'idea1' }]).data,
    };
    const Wrapper = shallow(
      <UserComments comments={commentsAsReturned} theme={theme} />
    );
    expect(Wrapper).toMatchSnapshot();
  });
  it('loads more comments when the load more button is clicked', () => {
    const loadMore = jest.fn();
    const commentsAsReturned = {
      loadMore,
      hasMore: true,
      commentsList: makeComments([{ ideaId: 'idea1' }]).data,
    };
    const Wrapper = shallow(
      <UserComments comments={commentsAsReturned} theme={theme} />
    );
    Wrapper.find('UserComments__LoadMoreButton').simulate('click');
    expect(loadMore).toHaveBeenCalledTimes(1);
  });
});
