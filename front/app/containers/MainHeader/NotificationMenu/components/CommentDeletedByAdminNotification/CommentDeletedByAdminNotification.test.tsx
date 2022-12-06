// @ts-nocheck
// libraries
import React from 'react';
import { shallow } from 'enzyme';
// mock utilities
import { getIdea } from 'services/__mocks__/ideas';
import { getNotification } from 'services/__mocks__/notifications';
// component to test
import { CommentDeletedByAdminNotification } from './';

jest.mock('utils/cl-intl');
jest.mock('utils/analytics', () => ({ trackEventByName: () => {} }));
jest.mock('modules', () => ({ streamsToReset: [] }));

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
