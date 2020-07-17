// libraries
import React from 'react';
import { shallow } from 'enzyme';

import { theme } from 'utils/testUtils/withTheme';

// component to test
import { UserComments, reducer } from './UserComments';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/comments');
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
  it('renders correctly with actual comments and more', () => {
    const loadMore = jest.fn();
    const commentsAsReturned = {
      loadMore,
      hasMore: true,
      commentsList: makeComments([{ ideaId: 'idea1' }]).data,
    };
    const Wrapper = shallow(
      <UserComments comments={commentsAsReturned} theme={theme} />
    );
    Wrapper.find('WithTheme(Button)').prop('onClick')();
    expect(Wrapper.find('WithTheme(Button)')).toMatchSnapshot();
    expect(loadMore).toHaveBeenCalledTimes(1);
  });
});
