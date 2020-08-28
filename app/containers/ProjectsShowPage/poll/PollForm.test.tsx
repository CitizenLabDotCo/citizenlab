// PollForm save method uses .flat() which is es6, importing corejs here lets jest use save.
import 'core-js';
import React from 'react';
import { shallow } from 'enzyme';

import { PollForm } from './PollForm';

import { mockQuestion } from 'services/__mocks__/pollQuestions';

jest.mock('services/pollResponses', () => ({
  addPollResponse: jest.fn(() => {
    return new Promise((resolve) => resolve);
  }),
}));
import * as responseServices from 'services/pollResponses';
const addPollResponseSpy = jest.spyOn(responseServices, 'addPollResponse');

jest.mock('utils/cl-intl', () => ({
  FormattedMessage: () => 'FormattedMessage',
}));
jest.mock('./PollSingleChoice', () => 'PollSingleChoice');
jest.mock('./PollMultipleChoice', () => 'PollMultipleChoice');
jest.mock('components/UI/Button', () => 'Button');

const singleOptionQuestion = mockQuestion(
  'questionSId',
  'What is your favourite ice cream flavour ?'
);
const multipleOptionsQuestion = mockQuestion(
  'questionMId',
  'What is your favourite ice cream flavour ?',
  'multiple_options',
  2
);

const getSingleChoiceForm = (Wrapper) => Wrapper.find('PollSingleChoice');
const getMultipleChoiceForm = (Wrapper) => Wrapper.find('PollMultipleChoice');
const getSaveButton = (Wrapper) => Wrapper.find('.e2e-send-poll');

describe('<PollForm/>', () => {
  it('renders correclty', () => {
    const Wrapper = shallow(
      <PollForm
        questions={[singleOptionQuestion, multipleOptionsQuestion]}
        projectId="projectId"
        id="projectId"
        type="project"
        disabled={false}
      />
    );

    const SingleChoiceForm = getSingleChoiceForm(Wrapper);
    expect(SingleChoiceForm.prop('index')).toBe(0);
    expect(SingleChoiceForm.prop('question')).toEqual(singleOptionQuestion);

    const MultipleChoiceForm = getMultipleChoiceForm(Wrapper);
    expect(MultipleChoiceForm.prop('index')).toBe(1);
    expect(MultipleChoiceForm.prop('question')).toEqual(
      multipleOptionsQuestion
    );

    const SaveButton = getSaveButton(Wrapper);
    expect(SaveButton.prop('disabled')).toBe(true);
    expect(Wrapper.find('FormattedMessage').prop('id')).toContain('sendAnswer');
  });
  describe('boundaries', () => {
    it('renders correctly when questions is []', () => {
      const Wrapper = shallow(
        <PollForm
          questions={[]}
          projectId="projectId"
          id="projectId"
          type="project"
          disabled={false}
        />
      );
      expect(Wrapper).toMatchSnapshot();
    });
  });
  describe('change', () => {
    it('lets users change a single option question', () => {
      const Wrapper = shallow(
        <PollForm
          questions={[singleOptionQuestion, multipleOptionsQuestion]}
          projectId="projectId"
          id="projectId"
          type="project"
          disabled={false}
        />
      );

      expect(getSingleChoiceForm(Wrapper).prop('value')).toBe(undefined);

      getSingleChoiceForm(Wrapper).prop('onChange')('questionSId', 'option1')();

      expect(getSingleChoiceForm(Wrapper).prop('value')).toBe('option1');

      getSingleChoiceForm(Wrapper).prop('onChange')('questionSId', 'option2')();

      expect(getSingleChoiceForm(Wrapper).prop('value')).toBe('option2');
    });
    it('lets users change a multiple option question', () => {
      const Wrapper = shallow(
        <PollForm
          questions={[singleOptionQuestion, multipleOptionsQuestion]}
          projectId="projectId"
          id="projectId"
          type="project"
          disabled={false}
        />
      );

      expect(getMultipleChoiceForm(Wrapper).prop('value')).toBe(undefined);

      getMultipleChoiceForm(Wrapper).prop('onChange')(
        'questionMId',
        'option1'
      )();

      expect(getMultipleChoiceForm(Wrapper).prop('value')).toStrictEqual([
        'option1',
      ]);

      getMultipleChoiceForm(Wrapper).prop('onChange')(
        'questionMId',
        'option2'
      )();

      expect(getMultipleChoiceForm(Wrapper).prop('value')).toStrictEqual([
        'option1',
        'option2',
      ]);

      getMultipleChoiceForm(Wrapper).prop('onChange')(
        'questionMId',
        'option2'
      )();

      expect(getMultipleChoiceForm(Wrapper).prop('value')).toStrictEqual([
        'option1',
      ]);
    });
  });
  describe('validate', () => {
    it('is not valid when there is an unanswered single option question', () => {
      const Wrapper = shallow(
        <PollForm
          questions={[singleOptionQuestion, multipleOptionsQuestion]}
          projectId="projectId"
          id="projectId"
          type="project"
          disabled={false}
        />
      );

      getMultipleChoiceForm(Wrapper).prop('onChange')(
        'questionMId',
        'option1'
      )();
      expect(getSaveButton(Wrapper).prop('disabled')).toBe(true);
    });
    it('is not valid when there is an unanswered multiple option question', () => {
      const Wrapper = shallow(
        <PollForm
          questions={[singleOptionQuestion, multipleOptionsQuestion]}
          projectId="projectId"
          id="projectId"
          type="project"
          disabled={false}
        />
      );

      getSingleChoiceForm(Wrapper).prop('onChange')('questionSId', 'option1')();
      expect(getSaveButton(Wrapper).prop('disabled')).toBe(true);
    });
    it('is not valid when a multiple answers question maximum is not respected', () => {
      const Wrapper = shallow(
        <PollForm
          questions={[singleOptionQuestion, multipleOptionsQuestion]}
          projectId="projectId"
          id="projectId"
          type="project"
          disabled={false}
        />
      );

      getMultipleChoiceForm(Wrapper).prop('onChange')(
        'questionMId',
        'option1'
      )();
      getMultipleChoiceForm(Wrapper).prop('onChange')(
        'questionMId',
        'option2'
      )();
      getMultipleChoiceForm(Wrapper).prop('onChange')(
        'questionMId',
        'option3'
      )();
      expect(getSaveButton(Wrapper).prop('disabled')).toBe(true);
    });
    it('is valid with one answer to each question', () => {
      const Wrapper = shallow(
        <PollForm
          questions={[singleOptionQuestion, multipleOptionsQuestion]}
          projectId="projectId"
          id="projectId"
          type="project"
          disabled={false}
        />
      );

      getMultipleChoiceForm(Wrapper).prop('onChange')(
        'questionMId',
        'option1'
      )();
      getSingleChoiceForm(Wrapper).prop('onChange')('questionSId', 'option1')();

      expect(getSaveButton(Wrapper).prop('disabled')).toBe(false);
    });
  });

  describe('save', () => {
    it('saves as expected', () => {
      const Wrapper = shallow(
        <PollForm
          questions={[singleOptionQuestion, multipleOptionsQuestion]}
          projectId="projectId"
          id="projectId"
          type="project"
          disabled={false}
        />
      );

      getMultipleChoiceForm(Wrapper).prop('onChange')(
        'questionMId',
        'option1'
      )();
      getSingleChoiceForm(Wrapper).prop('onChange')('questionSId', 'option2')();

      expect(getSaveButton(Wrapper).prop('disabled')).toBe(false);

      getSaveButton(Wrapper).prop('onClick')();

      expect(addPollResponseSpy).toHaveBeenCalledTimes(1);
      expect(addPollResponseSpy).toHaveBeenCalledWith(
        'projectId',
        'project',
        ['option1', 'option2'],
        'projectId'
      );
    });
  });
});
