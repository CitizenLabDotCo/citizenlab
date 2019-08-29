import React from 'react';
import { shallow } from 'enzyme';
import * as officialFeedbackSerivce from 'services/officialFeedback';
jest.mock('services/officialFeedback', () => ({
     deleteOfficialFeedbackFromIdea: jest.fn(),
     deleteOfficialFeedbackFromInitiative: jest.fn()
}));

jest.mock('./Form/OfficialFeedbackEdit', () => 'OfficialFeedbackEdit');
jest.mock('components/UI/MoreActionsMenu', () => 'MoreActionsMenu');
jest.mock('components/UI/QuillEditedContent', () => 'QuillEditedContent');
jest.mock('components/T');
jest.mock('utils/cl-intl');
const Intl = require('utils/cl-intl/__mocks__/');
const { intl } = Intl;

import { mockOfficialFeedback } from 'services/__mocks__/officialFeedback';
const mockOfficialFeedbackPost = mockOfficialFeedback.data[0];

import { OfficialFeedbackPost } from './OfficialFeedbackPost';

describe('<OfficialFeedbackPost />', () => {
  it('renders correctly for non-admin', () => {
    const wrapper = shallow(
      <OfficialFeedbackPost
        editingAllowed={false}
        officialFeedbackPost={mockOfficialFeedbackPost}
        last={false}
        locale="en"
        tenantLocales={['en', 'nl-BE']}
        intl={intl}
        postType="initiative"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly for admin', () => {
    const wrapper = shallow(
      <OfficialFeedbackPost
        editingAllowed={true}
        officialFeedbackPost={mockOfficialFeedbackPost}
        last={false}
        locale="en"
        tenantLocales={['en', 'nl-BE']}
        intl={intl}
        postType="initiative"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('intanciates MoreActionsMenu correctly', () => {
    window.confirm = jest.fn(() => true);

    const wrapper = shallow(
      <OfficialFeedbackPost
        editingAllowed={true}
        officialFeedbackPost={mockOfficialFeedbackPost}
        last={false}
        locale="en"
        tenantLocales={['en', 'nl-BE']}
        intl={intl}
        postType="initiative"
      />
    );
    const actions = wrapper.find('OfficialFeedbackPost__StyledMoreActionsMenu').prop('actions');
    actions.forEach(action => action.handler());
    expect(officialFeedbackSerivce.deleteOfficialFeedbackFromIdea).toHaveBeenCalledTimes(0);
    expect(officialFeedbackSerivce.deleteOfficialFeedbackFromInitiative).toHaveBeenCalledTimes(1);
    expect(wrapper.find('OfficialFeedbackEdit'));
  });
});