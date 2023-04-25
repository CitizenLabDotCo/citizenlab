// @ts-nocheck
import React from 'react';

jest.mock('./FormCompleted', () => 'FormCompleted');
jest.mock('./PollForm', () => 'PollForm');
jest.mock('components/UI/Warning', () => 'Warning');
jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));
import { getProject } from 'services/__mocks__/projects';
import { mockQuestion } from 'services/__mocks__/pollQuestions';
import { render } from 'utils/testUtils/rtl';

import { Poll } from './index';
import useProject from 'hooks/useProject';

// Mocks
const mockProject = getProject('projectId', 'continuous', 'poll');
const mockPollQuestions = [
  'How are you today?',
  'What is on the menu for dinner tonight?',
  "What's your favourite ice cream flavor?",
].map((item, index) => mockQuestion(index, item));

jest.mock('hooks/useResourceFiles', () => jest.fn(() => []));
jest.mock('hooks/useProject', () => jest.fn(() => mockProject));
jest.mock('resources/GetPollQuestions', () => 'GetPollQuestions');

describe('<Poll/>', () => {
  it('renders null when project is null', () => {
    useProject.mockReturnValue(null);
    const result = render(
      <Poll
        type="project"
        projectId="projectId"
        pollQuestions={mockPollQuestions}
      />
    );
    result.debug();
  });
});

// describe('<Poll/>', () => {
//   describe('boundaries', () => {
//     it('renders null when project is null', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const wrapper = shallow(
//         <Poll
//           type="project"
//           phaseId={null}
//           projectId="projectId"
//           authUser={null}
//           project={null}
//           phase={null}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('poll-container').exists()).toBe(false);
//     });
//     it('renders null when project is undefined', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const wrapper = shallow(
//         <Poll
//           type="phase"
//           phaseId="MockPhasePollId"
//           projectId="projectId"
//           authUser={null}
//           project={undefined}
//           phase={mockPhasePollData}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('poll-container').exists()).toBe(false);
//     });
//     it('renders null when project is error', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const wrapper = shallow(
//         <Poll
//           type="phase"
//           phaseId="MockPhasePollId"
//           projectId="projectId"
//           authUser={null}
//           project={new Error()}
//           phase={mockPhasePollData}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('poll-container').exists()).toBe(false);
//     });
//     it('renders null when pollQuestions is null', () => {
//       const mockProject = getProject('projectId', 'continuous', 'poll');
//       const wrapper = shallow(
//         <Poll
//           type="phase"
//           phaseId="MockPhasePollId"
//           projectId="projectId"
//           authUser={null}
//           project={mockProject}
//           phase={mockPhasePollData}
//           pollQuestions={null}
//         />
//       );
//       expect(wrapper.find('poll-container').exists()).toBe(false);
//     });
//     it('renders null when pollQuestions is undefined', () => {
//       const wrapper = shallow(
//         <Poll
//           type="project"
//           phaseId={null}
//           projectId="projectId"
//           authUser={null}
//           project={null}
//           phase={null}
//           pollQuestions={undefined}
//         />
//       );
//       expect(wrapper.find('poll-container').exists()).toBe(false);
//     });
//     it('renders null when pollQuestions is error', () => {
//       const wrapper = shallow(
//         <Poll
//           type="project"
//           phaseId={null}
//           projectId="projectId"
//           authUser={null}
//           project={null}
//           phase={null}
//           pollQuestions={new Error()}
//         />
//       );
//       expect(wrapper.find('poll-container').exists()).toBe(false);
//     });
//     it('renders null when type is phase and phase is null', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const mockProject = getProject('projectId', 'continuous', 'poll');
//       const wrapper = shallow(
//         <Poll
//           type="phase"
//           phaseId="MockPhasePollId"
//           projectId="projectId"
//           authUser={null}
//           project={mockProject}
//           phase={null}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('poll-container').exists()).toBe(false);
//     });
//     it('renders null when type is phase and phase is undefined', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const mockProject = getProject('projectId', 'continuous', 'poll');
//       const wrapper = shallow(
//         <Poll
//           type="phase"
//           phaseId="MockPhasePollId"
//           projectId="projectId"
//           authUser={null}
//           project={mockProject}
//           phase={undefined}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('poll-container').exists()).toBe(false);
//     });
//     it('renders null when type is phase and phase is error', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const mockProject = getProject('projectId', 'continuous', 'poll');
//       const wrapper = shallow(
//         <Poll
//           type="phase"
//           phaseId="MockPhasePollId"
//           projectId="projectId"
//           authUser={null}
//           project={mockProject}
//           phase={new Error()}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('poll-container').exists()).toBe(false);
//     });
//   });
//   describe('permissions', () => {
//     it('shows maybe permitted if user is not logged in', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));

//       const result = render(<Poll
//         type="project"
//         phaseId={null}
//         projectId="projectId"
//         authUser={null}
//         phase={null}
//         pollQuestions={pollQuestions}
//       />);

//       result.debug();

//       const splitMessageId = wrapper
//         .find('poll__StyledWarning')
//         .find('FormattedMessage')
//         .prop('id')
//         .split('.');
//       expect(splitMessageId[splitMessageId.length - 1]).toBe(
//         'pollDisabledMaybeNotPermitted'
//       );
//     });
//     it('is enabled if user can anwser', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const mockProjectGeneric = getProject('projectId', 'continuous', 'poll');
//       const mockProject = {
//         ...mockProjectGeneric,
//         attributes: { action_descriptor: { taking_poll: { enabled: true } } },
//       };
//       const mockUser = makeUser();
//       const wrapper = shallow(
//         <Poll
//           type="project"
//           phaseId={null}
//           projectId="projectId"
//           authUser={mockUser}
//           project={mockProject}
//           phase={null}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('PollForm').prop('disabled')).toBe(false);
//       expect(wrapper.find('poll__StyledWarning').length).toBe(0);
//     });
//     it('shows already responded if user already responded', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const mockProjectGeneric = getProject('projectId', 'continuous', 'poll');
//       const mockProject = {
//         ...mockProjectGeneric,
//         attributes: {
//           action_descriptor: {
//             taking_poll: {
//               enabled: false,
//               disabled_reason: 'already_responded',
//             },
//           },
//         },
//       };
//       const mockUser = makeUser();
//       const wrapper = shallow(
//         <Poll
//           type="project"
//           phaseId={null}
//           projectId="projectId"
//           authUser={mockUser}
//           project={mockProject}
//           phase={null}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('PollForm').exists()).toBe(false);
//       expect(wrapper.find('poll__StyledWarning').exists()).toBe(false);
//       expect(wrapper.find('FormCompleted').exists()).toBe(true);
//     });
//     it('shows a matching explicative message if the phase is not active', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const mockProjectGeneric = getProject('projectId', 'continuous', 'poll');
//       const mockProject = {
//         ...mockProjectGeneric,
//         attributes: { action_descriptor: { taking_poll: { enabled: true } } },
//       };
//       const mockUser = makeUser();
//       const mockPastPollPhase = {
//         ...mockPhasePollData,
//         attributes: { start_at: '2019-05-10', end_at: '2019-05-30' },
//       };
//       const wrapper = shallow(
//         <Poll
//           type="phase"
//           phaseId={null}
//           projectId="projectId"
//           authUser={mockUser}
//           project={mockProject}
//           phase={mockPastPollPhase}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('PollForm').prop('disabled')).toBe(true);
//       const splitMessageId = wrapper
//         .find('poll__StyledWarning')
//         .find('FormattedMessage')
//         .prop('id')
//         .split('.');
//       expect(splitMessageId[splitMessageId.length - 1]).toBe(
//         'pollDisabledNotActivePhase'
//       );
//     });
//     it('shows a matching explicative message if the project is not active', () => {
//       const pollQuestions = [
//         'How are you today?',
//         'What is on the menu for dinner tonight?',
//         "What's your favourite ice cream flavor?",
//       ].map((item, index) => mockQuestion(index, item));
//       const mockProjectGeneric = getProject('projectId', 'continuous', 'poll');
//       const mockProject = {
//         ...mockProjectGeneric,
//         attributes: {
//           action_descriptor: {
//             taking_poll: {
//               enabled: false,
//               disabled_reason: 'project_inactive',
//             },
//           },
//         },
//       };
//       const mockUser = makeUser();
//       const wrapper = shallow(
//         <Poll
//           type="project"
//           phaseId={null}
//           projectId="projectId"
//           authUser={mockUser}
//           project={mockProject}
//           phase={null}
//           pollQuestions={pollQuestions}
//         />
//       );
//       expect(wrapper.find('PollForm').prop('disabled')).toBe(true);
//       const splitMessageId = wrapper
//         .find('poll__StyledWarning')
//         .find('FormattedMessage')
//         .prop('id')
//         .split('.');
//       expect(splitMessageId[splitMessageId.length - 1]).toBe(
//         'pollDisabledProjectInactive'
//       );
//     });
//     // this is not exhaustive
//   });
// });
