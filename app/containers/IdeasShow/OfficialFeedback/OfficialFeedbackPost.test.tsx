import React from 'react';

import { shallow, mount } from 'enzyme';

import { mockOfficialFeedback } from 'services/officialFeedback';

jest.mock('services/officialFeedback');
jest.mock('./Form/OfficialFeedbackEdit');
jest.mock('utils/cl-intl');
const Intl = require('utils/cl-intl/__mocks__/');
const { intl } = Intl;

const mockOfficialFeedbackPost = mockOfficialFeedback.data[0];

import { OfficialFeedbackPost } from './OfficialFeedbackPost';

describe('<OfficialFeedbackPost />', () => {
  it('renders correctly for non-admin', () => {
    const wrapper = shallow(
      <OfficialFeedbackPost
        editingAllowed={false}
        officialFeedbackPost={mockOfficialFeedbackPost}
        intl={intl}
      />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly for admin', () => {
    const wrapper = shallow(
      <OfficialFeedbackPost
        editingAllowed={true}
        officialFeedbackPost={mockOfficialFeedbackPost}
        intl={intl}
      />);
    expect(wrapper).toMatchSnapshot();
  });
  it('when admin clicks edit it reacts in an adequate manner', () => {
    const wrapper = mount(
      <OfficialFeedbackPost
        editingAllowed={true}
        officialFeedbackPost={mockOfficialFeedbackPost}
        intl={intl}
      />);
    wrapper.find('MoreActionsMenu').find('button').simulate('click');
    wrapper.find('.e2e-action-edit').find('button').simulate('click');
    expect(wrapper.find('OfficialFeedbackEdit').length).toEqual(1);
  });
});
