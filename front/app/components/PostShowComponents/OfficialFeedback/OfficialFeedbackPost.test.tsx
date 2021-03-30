import React from 'react';
import { shallow } from 'enzyme';
import { IAction } from 'components/UI/MoreActionsMenu';
import * as officialFeedbackSerivce from 'services/officialFeedback';
import { mockOfficialFeedback } from 'services/__mocks__/officialFeedback';
import { OfficialFeedbackPost } from './OfficialFeedbackPost';

jest.mock('services/officialFeedback', () => ({
  deleteOfficialFeedbackFromIdea: jest.fn(),
  deleteOfficialFeedbackFromInitiative: jest.fn(),
}));
jest.mock('./OfficialFeedbackForm', () => 'OfficialFeedbackForm');
jest.mock('components/UI/MoreActionsMenu', () => 'MoreActionsMenu');
jest.mock('components/UI/QuillEditedContent', () => 'QuillEditedContent');
jest.mock('components/T');
jest.mock('utils/cl-intl');
jest.mock('modules', () => ({ streamsToReset: [] }));

const Intl = require('utils/cl-intl/__mocks__/');
const { intl } = Intl;
const mockOfficialFeedbackPost = mockOfficialFeedback.data[0];

describe('<OfficialFeedbackPost />', () => {
  it('renders correctly for non-admin', () => {
    const wrapper = shallow(
      <OfficialFeedbackPost
        editingAllowed={false}
        officialFeedbackPost={mockOfficialFeedbackPost}
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
        locale="en"
        tenantLocales={['en', 'nl-BE']}
        intl={intl}
        postType="initiative"
      />
    );
    const actions = wrapper
      .find('OfficialFeedbackPost__StyledMoreActionsMenu')
      .prop('actions') as IAction[];
    actions.forEach((action) => action.handler());
    expect(
      officialFeedbackSerivce.deleteOfficialFeedbackFromIdea
    ).toHaveBeenCalledTimes(0);
    expect(
      officialFeedbackSerivce.deleteOfficialFeedbackFromInitiative
    ).toHaveBeenCalledTimes(1);
    expect(wrapper.find('OfficialFeedbackForm'));
  });
});
