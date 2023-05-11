// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';

import { PollAdminForm } from './PollAdminForm';

import { mockQuestion } from 'services/__mocks__/pollQuestions';

jest.mock('components/admin/ResourceList', () => ({ List: 'List' }));
jest.mock('components/UI/Button', () => 'Button');
jest.mock('./QuestionRow', () => 'QuestionRow');
jest.mock('./FormQuestionRow', () => 'FormQuestionRow');
jest.mock('./OptionForm', () => 'OptionForm');

jest.mock('services/pollQuestions', () => ({
  addPollQuestion: jest.fn((_id, _type, title) => {
    return new Promise((resolve) =>
      resolve({ data: mockQuestion('newQuestion', title) })
    );
  }),
  updatePollQuestion: jest.fn(() => {
    return new Promise((resolve) => resolve);
  }),
  reorderPollQuestion: jest.fn(() => {
    return new Promise((resolve) => resolve);
  }),
  deletePollQuestion: jest.fn(),
}));
import * as pollQuestionsService from 'services/pollQuestions';
const addPollQuestionSpy = jest.spyOn(pollQuestionsService, 'addPollQuestion');
const updatePollQuestionSpy = jest.spyOn(
  pollQuestionsService,
  'updatePollQuestion'
);
const deletePollQuestionSpy = jest.spyOn(
  pollQuestionsService,
  'deletePollQuestion'
);
const reorderPollQuestionSpy = jest.spyOn(
  pollQuestionsService,
  'reorderPollQuestion'
);

describe('<PollAdminForm/>', () => {
  describe('boundaries', () => {
    it('renders correctly with when pollQuestion is null', () => {
      const wrapper = shallow(<PollAdminForm />);
      expect(wrapper.find('.e2e-add-question-btn').exists()).toBe(true);
    });
    it('renders correctly with when pollQuestion is []', () => {
      const wrapper = shallow(<PollAdminForm pollQuestions={[]} />);
      expect(wrapper.find('.e2e-add-question-btn').exists()).toBe(true);
    });
  });
  describe('displays passed in questions', () => {
    it('shows the right amount', () => {
      const pollQuestions = [
        'How are you today?',
        'What is on the menu for dinner tonight?',
        "What's your favourite ice cream flavor?",
      ].map((item, index) => mockQuestion(index, item));
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={pollQuestions}
          locale="en"
        />
      );
      expect(wrapper.find('QuestionRow').length).toBe(3);
    });
    it('passes down questions', () => {
      const pollQuestions = [
        mockQuestion('questionId', "What's your favourite ice cream flavor?"),
      ];
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={pollQuestions}
          locale="en"
        />
      );
      expect(wrapper.find('QuestionRow').prop('question')).toEqual(
        pollQuestions[0]
      );
    });
  });
  describe('handles the new question form', () => {
    it('opens it', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[]}
          locale="en"
        />
      );
      expect(wrapper.find('FormQuestionRow').exists()).toBe(false);
      wrapper.find('.e2e-add-question-btn').simulate('click');
      const getFormQuestionRow = () => wrapper.find('FormQuestionRow');
      expect(getFormQuestionRow().exists()).toBe(true);
    });
    it('hides the add button while new form is open', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[]}
          locale="en"
        />
      );
      wrapper.find('.e2e-add-question-btn').simulate('click');
      expect(wrapper.find('.e2e-add-question-btn').exists()).toBe(false);
    });
    it('holds its value and let the child controlled form change it', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[]}
          locale="en"
        />
      );
      wrapper.find('.e2e-add-question-btn').simulate('click');
      const getFormQuestionRow = () => wrapper.find('FormQuestionRow');

      getFormQuestionRow().props().onChange({ en: 'How are you?' });
      expect(getFormQuestionRow().props().titleMultiloc).toEqual({
        en: 'How are you?',
      });
    });
    it('handles saving it', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[]}
          locale="en"
        />
      );
      wrapper.find('.e2e-add-question-btn').simulate('click');
      const getFormQuestionRow = () => wrapper.find('FormQuestionRow');
      getFormQuestionRow().props().onChange({ en: 'How are you?' });

      getFormQuestionRow().props().onSave();
      expect(addPollQuestionSpy).toHaveBeenCalledTimes(1);
      expect(addPollQuestionSpy).toHaveBeenCalledWith('id', 'project', {
        en: 'How are you?',
      });
    });
    it('handles closing it', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[]}
          locale="en"
        />
      );
      wrapper.find('.e2e-add-question-btn').simulate('click');
      const getFormQuestionRow = () => wrapper.find('FormQuestionRow');
      getFormQuestionRow().props().onCancel();
      expect(getFormQuestionRow().exists()).toBe(false);
    });
  });
  describe('handles question deletion', () => {
    it('handles deleting an existing question', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[
            mockQuestion(
              'questionId',
              "What's your favourite ice cream flavor?"
            ),
          ]}
          locale="en"
        />
      );
      wrapper.find('QuestionRow').props().onDelete();
      expect(deletePollQuestionSpy).toHaveBeenCalledTimes(1);
      expect(deletePollQuestionSpy).toHaveBeenCalledWith(
        'questionId',
        'id',
        'project'
      );
    });
  });
  describe('handles the edit question form', () => {
    it('opens it, replacing the display row', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[
            mockQuestion(
              'questionId',
              "What's your favourite ice cream flavor?"
            ),
          ]}
          locale="en"
        />
      );
      expect(wrapper.find('FormQuestionRow').exists()).toBe(false);
      wrapper.find('QuestionRow').props().onEdit();

      const getFormQuestionRow = () => wrapper.find('FormQuestionRow');
      expect(wrapper.find('QuestionRow').exists()).toBe(false);
      expect(getFormQuestionRow().exists()).toBe(true);
    });
    it('holds its value and let the child controlled form change it', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[
            mockQuestion(
              'questionId',
              "What's your favourite ice cream flavor?"
            ),
          ]}
          locale="en"
        />
      );
      wrapper.find('QuestionRow').props().onEdit();
      const getFormQuestionRow = () => wrapper.find('FormQuestionRow');

      getFormQuestionRow().props().onChange({ en: 'How are you?' });
      expect(getFormQuestionRow().props().titleMultiloc).toEqual({
        en: 'How are you?',
      });
    });
    it('handles saving it', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[
            mockQuestion(
              'questionId',
              "What's your favourite ice cream flavor?"
            ),
          ]}
          locale="en"
        />
      );
      wrapper.find('QuestionRow').props().onEdit();
      const getFormQuestionRow = () => wrapper.find('FormQuestionRow');
      getFormQuestionRow().props().onChange({ en: 'How are you?' });

      getFormQuestionRow().props().onSave();
      expect(updatePollQuestionSpy).toHaveBeenCalledTimes(1);
      expect(updatePollQuestionSpy).toHaveBeenCalledWith('questionId', {
        title_multiloc: { en: 'How are you?' },
      });
    });
    it('handles closing it', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[
            mockQuestion(
              'questionId',
              "What's your favourite ice cream flavor?"
            ),
          ]}
          locale="en"
        />
      );
      wrapper.find('QuestionRow').props().onEdit();
      const getFormQuestionRow = () => wrapper.find('FormQuestionRow');
      getFormQuestionRow().props().onCancel();
      expect(getFormQuestionRow().exists()).toBe(false);
    });
  });
  describe('handles showing option edition form', () => {
    it('handles opening it, replacing the display row', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[
            mockQuestion(
              'questionId',
              "What's your favourite ice cream flavor?"
            ),
          ]}
          locale="en"
        />
      );
      wrapper.find('QuestionRow').props().onEditOptions();
      expect(wrapper.find('QuestionRow').exists()).toBe(false);
      expect(wrapper.find('OptionForm').exists()).toBe(true);
    });
  });
  describe('handles drag and drop', () => {
    it('lets the user reorder a field by dropping it', () => {
      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={[
            mockQuestion(
              'questionId',
              "What's your favourite ice cream flavor?"
            ),
          ]}
          locale="en"
        />
      );
      wrapper.find('QuestionRow').props().handleDropRow('questionId', 1);

      expect(reorderPollQuestionSpy).toHaveBeenCalledTimes(1);
      expect(reorderPollQuestionSpy).toHaveBeenCalledWith('questionId', 1);
    });
    it('shuffles the items in the list to show expected update while dragging', () => {
      const pollQuestions = [
        'How are you today?',
        'What is on the menu for dinner tonight?',
        "What's your favourite ice cream flavor?",
      ].map((item, index) => mockQuestion(index, item));

      const wrapper = shallow(
        <PollAdminForm
          participationContextId="id"
          participationContextType="project"
          pollQuestions={pollQuestions}
          locale="en"
        />
      );

      const getQuestionOrder = () =>
        wrapper
          .find('QuestionRow')
          .map((QuestionRow) => QuestionRow.props().question.id);
      expect(getQuestionOrder()).toStrictEqual([0, 1, 2]);
      wrapper.find('QuestionRow').at(2).props().handleDragRow(2, 1);
      expect(getQuestionOrder()).toStrictEqual([0, 2, 1]);
    });
  });
});
