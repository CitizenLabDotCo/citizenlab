import React from 'react';
import { shallow } from 'enzyme';

import { AdminProjectPoll } from './';

import { getProject } from 'services/__mocks__/projects';
import {
  mockPhaseInformationData,
  mockPhasePollData,
} from 'services/__mocks__/phases';

jest.mock('./ExportPollButton', () => 'ExportPollButton');
jest.mock('./PollAdminForm', () => 'PollAdminForm');
jest.mock('components/T', () => 'T');
jest.mock('components/admin/Section', () => ({
  SectionTitle: 'SectionTitle',
  SectionDescription: 'SectionDescription',
}));
jest.mock('components/FeatureFlag', () => 'FeatureFlag');

describe('<AdminProjectPoll/>', () => {
  describe('boundaries', () => {
    it('is feature flagged under the name poll from the root', () => {
      const mockProject = getProject('projectId', 'continuous', 'poll');
      const wrapper = shallow(
        <AdminProjectPoll project={mockProject} phases={null} locale={'en'} />
      );
      expect(wrapper.type()).toBe('FeatureFlag');
      expect(wrapper.props().name).toBe('polls');
    });
    it('renders null if phase and project are null or error', () => {
      const wrapper = shallow(<AdminProjectPoll />);
      expect(wrapper.type()).toBeNull();
    });
    it('renders null if phases is null and project is continuous', () => {
      const mockProject = getProject('projectId', 'timeline');

      const wrapper = shallow(<AdminProjectPoll project={mockProject} />);

      expect(wrapper.type()).toBeNull();
    });
    it("renders null if continuous project's PM is not poll", () => {
      const mockProject = getProject(
        'projectId',
        'continuous',
        'survey',
        'survey_monkey'
      );
      const wrapper = shallow(
        <AdminProjectPoll project={mockProject} phases={null} locale={'en'} />
      );
      expect(wrapper.type()).toBeNull();
    });
    it('renders null if timeline project has no polling phase', () => {
      const mockProject = getProject('projectId', 'timeline');
      const mockPhases = [
        mockPhaseInformationData,
        mockPhaseInformationData,
        mockPhaseInformationData,
      ];
      const wrapper = shallow(
        <AdminProjectPoll
          project={mockProject}
          phases={mockPhases}
          locale={'en'}
        />
      );
      expect(wrapper.type()).toBeNull();
    });
  });
  describe('Continuous project', () => {
    it('renders the right content for a continuous project with polling PM', () => {
      const mockProject = getProject('projectId', 'continuous', 'poll');
      const wrapper = shallow(
        <AdminProjectPoll project={mockProject} phases={null} locale={'en'} />
      );
      expect(wrapper.find('GetPollQuestions').props()).toMatchObject({
        participationContextId: 'projectId',
        participationContextType: 'project',
      });
      expect(wrapper.find('ExportPollButton').props()).toMatchObject({
        participationContextId: 'projectId',
        participationContextType: 'project',
      });
    });
  });
  describe('Polling phases', () => {
    it('renders the right content for a timeline project with one polling phase', () => {
      const mockProject = getProject('projectId', 'timeline');
      const mockPhases = [
        mockPhaseInformationData,
        mockPhasePollData,
        mockPhaseInformationData,
      ];
      const wrapper = shallow(
        <AdminProjectPoll
          project={mockProject}
          phases={mockPhases}
          locale={'en'}
        />
      );
      expect(wrapper.find('GetPollQuestions').props()).toMatchObject({
        participationContextId: 'MockPhasePollId',
        participationContextType: 'phase',
      });
      expect(wrapper.find('ExportPollButton').props()).toMatchObject({
        participationContextId: 'MockPhasePollId',
        participationContextType: 'phase',
      });
    });
    it('renders the right content for a timeline project with two polling phases', () => {
      const mockProject = getProject('projectId', 'timeline');
      const mockPhases = [
        mockPhaseInformationData,
        mockPhasePollData,
        mockPhasePollData,
      ];
      const wrapper = shallow(
        <AdminProjectPoll
          project={mockProject}
          phases={mockPhases}
          locale={'en'}
        />
      );
      wrapper.find('GetPollQuestions').every((item) =>
        expect(item.props()).toMatchObject({
          participationContextId: 'MockPhasePollId',
          participationContextType: 'phase',
        })
      );
      wrapper.find('ExportPollButton').every((item) =>
        expect(item.props()).toMatchObject({
          participationContextId: 'MockPhasePollId',
          participationContextType: 'phase',
        })
      );
    });
  });
});
