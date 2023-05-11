import React from 'react';

import { shallow } from 'enzyme';

import { mockQuestion } from 'services/__mocks__/pollQuestions';

const Intl = require('utils/cl-intl/__mocks__/');
const { intl } = Intl;

jest.mock('components/UI/Button', () => 'Button');
jest.mock('@citizenlab/cl2-component-library', () => ({
  Input: 'Input',
  Select: 'Select',
}));
jest.mock('./WrongMaxChoiceIndicator', () => 'WrongMaxChoiceIndicator');
jest.mock('components/admin/ResourceList', () => ({ Row: 'Row' }));

jest.mock('services/pollQuestions', () => ({
  updatePollQuestion: jest.fn(() => {
    return new Promise((resolve) => resolve);
  }),
}));
import * as pollQuestionsService from 'services/pollQuestions';
const updatePollQuestionSpy = jest.spyOn(
  pollQuestionsService,
  'updatePollQuestion'
);

import { QuestionDetailsForm } from './QuestionDetailsForm';

const getSelect = (Wrapper) => Wrapper.find('Select');
const getInput = (Wrapper) => Wrapper.find('QuestionDetailsForm__StyledInput');
const getWarningIndicator = (Wrapper) =>
  Wrapper.find('WrongMaxChoiceIndicator');
const getSaveButton = (Wrapper) =>
  Wrapper.find('.e2e-form-question-settings-save');

const singleOptionQuestion = mockQuestion(
  'questionId',
  'What is your favourite ice cream flavour ?'
);
const multipleOptionsQuestion = mockQuestion(
  'questionId',
  'What is your favourite ice cream flavour ?',
  'multiple_options',
  2
);

describe('<QuestionDetailsForm/>', () => {
  describe('display', () => {
    it('displays correctly for a multiple choice question', () => {
      const Wrapper = shallow(
        <QuestionDetailsForm question={multipleOptionsQuestion} intl={intl} />
      );
      const Select = getSelect(Wrapper);
      expect(Select.prop('value')).toBe('multiple_options');
      expect(getInput(Wrapper).prop('value')).toBe('2');

      const WarningIndicator = getWarningIndicator(Wrapper);
      expect(WarningIndicator.prop('questionId')).toBe('questionId');
      expect(WarningIndicator.prop('maxAnswers')).toBe(2);

      const SaveButton = getSaveButton(Wrapper);
      expect(SaveButton.exists()).toBe(true);
      expect(SaveButton.prop('disabled')).toBe(true);
    });
  });
  describe('change and save', () => {
    it('a multiple choice question has two maximum answers by default', () => {
      const Wrapper = shallow(
        <QuestionDetailsForm question={singleOptionQuestion} intl={intl} />
      );
      getSelect(Wrapper).prop('onChange')({
        value: 'multiple_options',
        label: 'Multiple Option',
      });
      expect(getSelect(Wrapper).prop('value')).toBe('multiple_options');
      expect(getInput(Wrapper).prop('value')).toBe('2');
    });
    it('can change and save a single choice question to a multiple choice', () => {
      const Wrapper = shallow(
        <QuestionDetailsForm question={singleOptionQuestion} intl={intl} />
      );
      getSelect(Wrapper).prop('onChange')({
        value: 'multiple_options',
        label: 'Multiple Option',
      });
      expect(getSelect(Wrapper).prop('value')).toBe('multiple_options');
      expect(getSaveButton(Wrapper).prop('disabled')).toBe(false);

      getSaveButton(Wrapper).simulate('click');

      expect(updatePollQuestionSpy).toHaveBeenCalledTimes(1);
      expect(updatePollQuestionSpy).toHaveBeenCalledWith('questionId', {
        max_options: 2,
        question_type: 'multiple_options',
      });
    });
    it('can change and save a multiple choice question to a single choice', () => {
      const Wrapper = shallow(
        <QuestionDetailsForm question={multipleOptionsQuestion} intl={intl} />
      );
      getSelect(Wrapper).prop('onChange')({
        value: 'single_option',
        label: 'Single Option',
      });
      expect(getSelect(Wrapper).prop('value')).toBe('single_option');
      expect(getSaveButton(Wrapper).prop('disabled')).toBe(false);

      getSaveButton(Wrapper).simulate('click');

      expect(updatePollQuestionSpy).toHaveBeenCalledTimes(1);
      expect(updatePollQuestionSpy).toHaveBeenCalledWith('questionId', {
        max_options: null,
        question_type: 'single_option',
      });
    });
    it('can change and save the maximum number of choices', () => {
      const Wrapper = shallow(
        <QuestionDetailsForm question={multipleOptionsQuestion} intl={intl} />
      );
      getInput(Wrapper).prop('onChange')('10');
      expect(getInput(Wrapper).prop('value')).toBe('10');
      expect(getSaveButton(Wrapper).prop('disabled')).toBe(false);

      getSaveButton(Wrapper).simulate('click');

      expect(updatePollQuestionSpy).toHaveBeenCalledTimes(1);
      expect(updatePollQuestionSpy).toHaveBeenCalledWith('questionId', {
        max_options: 10,
      });
    });
    describe('validations', () => {
      it('cannot save multiple choice question with less than two options', () => {
        const Wrapper = shallow(
          <QuestionDetailsForm question={multipleOptionsQuestion} intl={intl} />
        );
        getInput(Wrapper).prop('onChange')('0');
        expect(getInput(Wrapper).prop('value')).toBe('0');
        expect(getSaveButton(Wrapper).prop('disabled')).toBe(true);
      });
    });
  });
});
