import React from 'react';

import { shallow } from 'enzyme';

jest.mock('./Form/OfficialFeedbackNew', () => 'OfficialFeedbackNew');
jest.mock('./OfficialFeedbackFeed', () => 'OfficialFeedbackFeed');

import OfficialFeedback from './';

describe('<OfficialFeedback />', () => {
  it('renders correctly for non-admin', () => {
    const wrapper = shallow(
      <OfficialFeedback
        postId="ideaId"
        postType="idea"
        permissionToPost={false}
      />
    );
    expect(wrapper.find('OfficialFeedbackNew').exists()).toBe(false);
    expect(wrapper.find('OfficialFeedbackFeed').exists()).toBe(true);
  });
  it('renders correctly for admin', () => {
    const wrapper = shallow(
      <OfficialFeedback
        postId="ideaId"
        postType="idea"
        permissionToPost={true}
      />
    );
    expect(wrapper.find('OfficialFeedbackNew').exists()).toBe(true);
    expect(wrapper.find('OfficialFeedbackFeed').exists()).toBe(true);
  });
});
