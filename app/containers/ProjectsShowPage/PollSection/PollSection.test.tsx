import React from 'react';

import { shallow } from 'enzyme';

jest.mock('./FormCompleted', () => 'FormCompleted');
jest.mock('./PollForm', () => 'PollForm');
jest.mock('components/UI/Warning', () => 'Warning');
jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));

import { makeUser } from 'services/__mocks__/users';
import { mockQuestion } from 'services/__mocks__/pollQuestions';
import { getMockProject } from 'services/__mocks__/projects';
import { mockPhaseInformationData, mockPhasePollData } from 'services/__mocks__/phases';

import { PollSection } from './';

it('renders', () => {
  const mockProject = getMockProject('projectId', 'continuous', 'poll');
  const wrapper = shallow(
    <PollSection
      type="projects"
      phaseId={null}
      projectId="projectId"
      authUser={null}
      project={mockProject}
      phase={null}
    />
  );
  expect(wrapper).toMatchSnapshot();
});

describe('<PollSection/>', () => {
  describe('boundaries', () => {
    it('renders null when project is null', () => {
      const pollQuestions = ['How are you today?', 'What is on the menu for dinner tonight?', 'What\'s your favourite ice cream flavor?']
        .map((item, index) => mockQuestion(index, item));
      const wrapper = shallow(
        <PollSection
          type="projects"
          phaseId={null}
          projectId="projectId"
          authUser={null}
          project={null}
          phase={null}
          pollQuestions={pollQuestions}
        />
      );
      expect(wrapper.type()).toBe(null);
    });
    it('renders null when project is undefined', () => {
      const pollQuestions = ['How are you today?', 'What is on the menu for dinner tonight?', 'What\'s your favourite ice cream flavor?']
        .map((item, index) => mockQuestion(index, item));
      const wrapper = shallow(
        <PollSection
          type="phases"
          phaseId="MockPhasePollId"
          projectId="projectId"
          authUser={null}
          project={undefined}
          phase={mockPhasePollData}
          pollQuestions={pollQuestions}
        />
      );
      expect(wrapper.type()).toBe(null);
    });
    it('renders null when project is error', () => {
      const pollQuestions = ['How are you today?', 'What is on the menu for dinner tonight?', 'What\'s your favourite ice cream flavor?']
        .map((item, index) => mockQuestion(index, item));
      const wrapper = shallow(
        <PollSection
          type="phases"
          phaseId="MockPhasePollId"
          projectId="projectId"
          authUser={null}
          project={new Error}
          phase={mockPhasePollData}
          pollQuestions={pollQuestions}
        />
      );
      expect(wrapper.type()).toBe(null);
    });
    it('renders null when pollQuestions is null', () => {
      const mockProject = getMockProject('projectId', 'continuous', 'poll');
      const wrapper = shallow(
        <PollSection
          type="phases"
          phaseId="MockPhasePollId"
          projectId="projectId"
          authUser={null}
          project={mockProject}
          phase={mockPhasePollData}
          pollQuestions={null}
        />
      );
      expect(wrapper.type()).toBe(null);
    });
    it('renders null when pollQuestions is undefined', () => {
      const wrapper = shallow(
        <PollSection
          type="projects"
          phaseId={null}
          projectId="projectId"
          authUser={null}
          project={null}
          phase={null}
          pollQuestions={undefined}
        />
      );
      expect(wrapper.type()).toBe(null);
    });
    it('renders null when pollQuestions is error', () => {
      const wrapper = shallow(
        <PollSection
          type="projects"
          phaseId={null}
          projectId="projectId"
          authUser={null}
          project={null}
          phase={null}
          pollQuestions={new Error}
        />
      );
      expect(wrapper.type()).toBe(null);
    });
    it('renders null when type is phases and phase is null', () => {
      const pollQuestions = ['How are you today?', 'What is on the menu for dinner tonight?', 'What\'s your favourite ice cream flavor?']
        .map((item, index) => mockQuestion(index, item));
      const mockProject = getMockProject('projectId', 'continuous', 'poll');
      const wrapper = shallow(
        <PollSection
          type="phases"
          phaseId="MockPhasePollId"
          projectId="projectId"
          authUser={null}
          project={mockProject}
          phase={null}
          pollQuestions={pollQuestions}
        />
      );
      expect(wrapper.type()).toBe(null);
    });
    it('renders null when type is phases and phase is undefined', () => {
      const pollQuestions = ['How are you today?', 'What is on the menu for dinner tonight?', 'What\'s your favourite ice cream flavor?']
        .map((item, index) => mockQuestion(index, item));
      const mockProject = getMockProject('projectId', 'continuous', 'poll');
      const wrapper = shallow(
        <PollSection
          type="phases"
          phaseId="MockPhasePollId"
          projectId="projectId"
          authUser={null}
          project={mockProject}
          phase={undefined}
          pollQuestions={pollQuestions}
        />
      );
      expect(wrapper.type()).toBe(null);
    });
    it('renders null when type is phases and phase is error', () => {
      const pollQuestions = ['How are you today?', 'What is on the menu for dinner tonight?', 'What\'s your favourite ice cream flavor?']
        .map((item, index) => mockQuestion(index, item));
      const mockProject = getMockProject('projectId', 'continuous', 'poll');
      const wrapper = shallow(
        <PollSection
          type="phases"
          phaseId="MockPhasePollId"
          projectId="projectId"
          authUser={null}
          project={mockProject}
          phase={new Error}
          pollQuestions={pollQuestions}
        />
      );
      expect(wrapper.type()).toBe(null);
    });
  });
});
// type: 'phases' | 'projects';
// phaseId: string | null;
// projectId: string;
// authUser: GetAuthUserChildProps;
// pollQuestions: GetPollQuestionsChildProps;
// project: GetProjectChildProps;
// phase: GetPhaseChildProps;
