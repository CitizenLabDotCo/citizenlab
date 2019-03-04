import React from 'react';

import { shallow } from 'enzyme';

import { getMockProject } from 'services/projects';
import { mockOfficialFeedback } from 'services/officialFeedback';

// import OfficialFeedbackNew from './Form/OfficialFeedbackNew';

jest.mock('./Form/OfficialFeedbackNew', () => 'hi');
jest.mock('services/projects');
jest.mock('services/officialFeedback');
jest.mock('resources/GetPermission');

import 'jest-styled-components';

const mockProject = getMockProject('projectId', 'continuous', 'ideation');

const mockOfficialFeedbackChild = { officialFeedbackList: mockOfficialFeedback };

import { OfficialFeedback } from './';

describe('<OfficialFeedback />', () => {
  it('renders correctly for non-admin', () => {
    const wrapper = shallow(<OfficialFeedback ideaId="ideaId" project={mockProject} permission={false} officialFeedbacks={mockOfficialFeedbackChild} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly for admin', () => {
    const wrapper = shallow(<OfficialFeedback ideaId="ideaId" project={mockProject} permission={true} officialFeedbacks={mockOfficialFeedbackChild} />);
    expect(wrapper).toMatchSnapshot();
  });
});
