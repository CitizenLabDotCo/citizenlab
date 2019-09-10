import React from 'react';
import { shallow } from 'enzyme';

import { AdminProjectPoll } from './';

import { getMockProject } from 'services/__mocks__/projects';
import { mockPhaseInformationData, mockPhasePollData } from 'services/__mocks__/phases';

jest.mock('./ExportPollButton', () => 'ExportPollButton');
jest.mock('./PollAdminForm', () => 'PollAdminForm');
jest.mock('components/T', () => 'T');
jest.mock('components/admin/Section', () => ({ SectionTitle: 'SectionTitle', SectionSubtitle: 'SectionSubtitle' }));
jest.mock('components/FeatureFlag', () => 'FeatureFlag');

describe('<AdminProjectPoll/>', () => {
  describe('boundaries', () => {
    it('is feature flagged under the name poll from the root', () => {
      const wrapper = shallow(<AdminProjectPoll />);

      expect(wrapper.type()).toBe('FeatureFlag');
      expect(wrapper.props().name).toBe('polls');
    });
    it('renders only the titles if phase and project are null or error', () => {
      const wrapper = shallow(<AdminProjectPoll />);

      expect(wrapper.children().length).toBe(3);
      expect(wrapper.find('SectionTitle').length).toBe(1);
      expect(wrapper.find('SectionSubtitle').length).toBe(1);
      expect(wrapper.find('poll__Container').childAt(0).length).toBe(0);
    });
    it('renders only the titles if phases is null and project is continuous', () => {
      const mockProject = getMockProject('projectId', 'timeline');

      const wrapper = shallow(<AdminProjectPoll project={mockProject} />);

      expect(wrapper.children().length).toBe(3);
      expect(wrapper.find('SectionTitle').length).toBe(1);
      expect(wrapper.find('SectionSubtitle').length).toBe(1);
      expect(wrapper.find('poll__Container').childAt(0).length).toBe(0);
    });
    it('renders only the titles if continuous project\'s PM is not poll', () => {
      const mockProject = getMockProject('projectId', 'continuous', 'survey', 'survey_monkey');
      const wrapper = shallow(<AdminProjectPoll project={mockProject} phases={null} locale={'en'} />);

      expect(wrapper.children().length).toBe(3);
      expect(wrapper.find('SectionTitle').length).toBe(1);
      expect(wrapper.find('SectionSubtitle').length).toBe(1);
      expect(wrapper.find('poll__Container').children().length).toBe(0);
    });
    it('renders only the titles if timeline project has no polling phase', () => {
      const mockProject = getMockProject('projectId', 'timeline');
      const mockPhases = [mockPhaseInformationData, mockPhaseInformationData, mockPhaseInformationData];
      const wrapper = shallow(<AdminProjectPoll project={mockProject} phases={mockPhases} locale={'en'} />);

      expect(wrapper.children().length).toBe(3);
      expect(wrapper.find('SectionTitle').length).toBe(1);
      expect(wrapper.find('SectionSubtitle').length).toBe(1);
      expect(wrapper.find('poll__Container').children().length).toBe(0);
    });
  });
  describe('Continuous project', () => {
    it('renders the right content for a continuous project with polling PM', () => {
      const mockProject = getMockProject('projectId', 'continuous', 'poll');
      const wrapper = shallow(<AdminProjectPoll project={mockProject} phases={null} locale={'en'} />);

      expect(wrapper.find('poll__Container').children().length).toBe(2);
      expect(wrapper.find('GetPollQuestions').props()).toMatchObject({ participationContextId: 'projectId', participationContextType: 'projects' });
      expect(wrapper.find('poll__StyledExportPollButton').props()).toMatchObject({ pcId: 'projectId', pcType: 'projects' });
    });
  });
  describe('Polling phases', () => {
    it('renders the right content for a timeline project with one polling phase', () => {
      const mockProject = getMockProject('projectId', 'timeline');
      const mockPhases = [mockPhaseInformationData, mockPhasePollData, mockPhaseInformationData];
      const wrapper = shallow(<AdminProjectPoll project={mockProject} phases={mockPhases} locale={'en'} />);

      expect(wrapper.find('poll__Container').children().length).toBe(3);
      expect(wrapper.find('poll__Container').childAt(0).type()).toBe('h3');
      expect(wrapper.find('GetPollQuestions').props()).toMatchObject({ participationContextId: 'MockPhasePollId', participationContextType: 'phases' });
      expect(wrapper.find('poll__StyledExportPollButton').props()).toMatchObject({ pcId: 'MockPhasePollId', pcType: 'phases' });
    });
    it('renders the right content for a timeline project with two polling phases', () => {
      const mockProject = getMockProject('projectId', 'timeline');
      const mockPhases = [mockPhaseInformationData, mockPhasePollData, mockPhasePollData];
      const wrapper = shallow(<AdminProjectPoll project={mockProject} phases={mockPhases} locale={'en'} />);

      expect(wrapper.find('poll__Container').children().length).toBe(6);
      expect(wrapper.find('poll__Container').find('h3').length).toBe(2);
      wrapper.find('GetPollQuestions').every(item => expect(item.props()).toMatchObject({ participationContextId: 'MockPhasePollId', participationContextType: 'phases' }));
      wrapper.find('poll__StyledExportPollButton').every(item => expect(item.props()).toMatchObject({ pcId: 'MockPhasePollId', pcType: 'phases' }));
    });
  });
});
