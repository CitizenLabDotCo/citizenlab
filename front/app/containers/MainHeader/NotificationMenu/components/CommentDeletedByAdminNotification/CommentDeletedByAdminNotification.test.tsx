// @ts-nocheck
// libraries
import { shallow } from 'enzyme';
import React from 'react';

// component to test
import { CommentDeletedByAdminNotification } from './';

// mock utilities
import { getIdea } from 'services/__mocks__/ideas';

jest.mock('utils/cl-intl');
jest.mock('utils/analytics', () => ({ trackEventByName: () => {} }));
jest.mock('modules', () => ({ streamsToReset: [] }));

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
