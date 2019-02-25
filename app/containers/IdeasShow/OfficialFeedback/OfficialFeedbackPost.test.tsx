import React from 'react';

import { shallow, mount } from 'enzyme';
//
// import { getMockProject } from 'services/projects';
import { mockOfficialFeedback } from 'services/officialFeedback';
//
// // import OfficialFeedbackNew from './Form/OfficialFeedbackNew';

// jest.mock('./Form/OfficialFeedbackNew', () => 'hi');
// jest.mock('services/projects');
jest.mock('services/officialFeedback');
jest.mock('utils/cl-intl');
const Intl = require('utils/cl-intl/__mocks__/');
const { intl } = Intl;

const mockOfficialFeedbackPost = mockOfficialFeedback.data[0];

import { OfficialFeedbackPost } from './OfficialFeedbackPost';

describe('<OfficialFeedbackPost />', () => {
  let showForm: jest.Mock;
  beforeEach(() => {
    showForm = jest.fn(() => {});
  });
  it('renders correctly for non-admin', () => {
    const wrapper = shallow(
      <OfficialFeedbackPost
        editingPost="new"
        editingAllowed={false}
        officialFeedbackPost={mockOfficialFeedbackPost}
        showForm={showForm}
        intl={intl}
      />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly for admin', () => {
    const wrapper = shallow(
      <OfficialFeedbackPost
        editingPost="new"
        editingAllowed={true}
        officialFeedbackPost={mockOfficialFeedbackPost}
        showForm={showForm}
        intl={intl}
      />);
    expect(wrapper).toMatchSnapshot();
  });
  it('when admin clicks edit it reacts in an adequate manner', () => {
    const wrapper = mount(
      <OfficialFeedbackPost
        editingPost="new"
        editingAllowed={true}
        officialFeedbackPost={mockOfficialFeedbackPost}
        showForm={showForm}
        intl={intl}
      />);
    wrapper.find('MoreActionsMenu').find('button').simulate('click');
    wrapper.find('.e2e-action-edit').find('button').simulate('click');
    expect(showForm).toHaveBeenCalledWith(mockOfficialFeedbackPost.id);
  });
  it('shows the form when editing', () => {
    const wrapper = shallow(
      <OfficialFeedbackPost
        editingPost={mockOfficialFeedbackPost.id}
        editingAllowed={true}
        officialFeedbackPost={mockOfficialFeedbackPost}
        showForm={showForm}
      />);
    expect(wrapper.find('OfficialFeedbackEdit').length).toEqual(1);
  });
});
