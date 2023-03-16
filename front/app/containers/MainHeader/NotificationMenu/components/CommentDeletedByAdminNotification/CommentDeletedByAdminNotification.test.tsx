// @ts-nocheck
// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { CommentDeletedByAdminNotification } from './';

// mock utilities
import { getIdea } from 'api/ideas/__mocks__/useIdeaById';

jest.mock('utils/analytics', () => ({ trackEventByName: () => {} }));

import { getNotification } from 'services/__mocks__/notifications';

describe('<CommentDeletedByAdminNotification />', () => {
  it('renders correctly with an empty idea', () => {
    const wrapper = shallow(
      <CommentDeletedByAdminNotification
        notification={getNotification(
          'commentDeletedByAdmin',
          'comment_deleted_by_admin'
        )}
        idea={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly with a non empty idea', () => {
    const wrapper = shallow(
      <CommentDeletedByAdminNotification
        notification={getNotification(
          'commentDeletedByAdmin',
          'comment_deleted_by_admin'
        )}
        idea={getIdea('ideaId', 'ideaTitle')}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
