// @ts-nocheck
import React from 'react';

import { shallow } from 'enzyme';

import { WrongMaxChoiceIndicator } from './WrongMaxChoiceIndicator';

import { mockOption } from 'services/__mocks__/pollOptions';

jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));
jest.mock('services/pollOptions');
jest.mock('./WrongOptionsIndicator', () => ({
  StyledIconTooltip: 'StyledIconTooltip',
  Indicator: 'Indicator',
}));
jest.mock('modules', () => ({ streamsToReset: [] }));

const pollOptions = ['Vanilla', 'Pistachio', 'Raspberry'].map((item, index) =>
  mockOption(index, item)
);

describe('<WrongMaxChoiceIndicator/>', () => {
  describe('boundaries', () => {
    it('renders correctly when options is null', () => {
      const Wrapper = shallow(
        <WrongMaxChoiceIndicator
          questionId="questionId"
          maxAnswers={5}
          options={null}
        />
      );
      expect(Wrapper).toMatchSnapshot();
    });
    it('renders correctly when options is Error', () => {
      const Wrapper = shallow(
        <WrongMaxChoiceIndicator
          questionId="questionId"
          maxAnswers={5}
          options={new Error()}
        />
      );
      expect(Wrapper).toMatchSnapshot();
    });
    it('renders correctly when options is undefined', () => {
      const Wrapper = shallow(
        <WrongMaxChoiceIndicator
          questionId="questionId"
          maxAnswers={5}
          options={undefined}
        />
      );
      expect(Wrapper).toMatchSnapshot();
    });
    it('renders correctly when maxAnswers is null', () => {
      const Wrapper = shallow(
        <WrongMaxChoiceIndicator
          questionId="questionId"
          maxAnswers={null}
          options={pollOptions}
        />
      );
      expect(Wrapper).toMatchSnapshot();
    });
  });
  describe('renders the error message when max answers is not as expected', () => {
    it('renders correctly when options is as expected and maxAnswers is zero', () => {
      const Wrapper = shallow(
        <WrongMaxChoiceIndicator
          questionId="questionId"
          maxAnswers={0}
          options={pollOptions}
        />
      );
      expect(
        shallow(Wrapper.find('StyledIconTooltip').prop('content')).prop('id')
      ).toContain('maxUnderTheMinTooltip');
      expect(Wrapper.find('FormattedMessage').prop('id')).toContain('wrongMax');
    });
    it('renders correctly when options is as expected and maxAnswers is one', () => {
      const Wrapper = shallow(
        <WrongMaxChoiceIndicator
          questionId="questionId"
          maxAnswers={1}
          options={pollOptions}
        />
      );
      expect(
        shallow(Wrapper.find('StyledIconTooltip').prop('content')).prop('id')
      ).toContain('maxUnderTheMinTooltip');
      expect(Wrapper.find('FormattedMessage').prop('id')).toContain('wrongMax');
    });
    it('renders correctly when there is less options than maxAnswers', () => {
      const Wrapper = shallow(
        <WrongMaxChoiceIndicator
          questionId="questionId"
          maxAnswers={10}
          options={pollOptions}
        />
      );
      expect(
        shallow(Wrapper.find('StyledIconTooltip').prop('content')).prop('id')
      ).toContain('maxOverTheMaxTooltip');
      expect(Wrapper.find('FormattedMessage').prop('id')).toContain('wrongMax');
    });
  });
  describe('renders nothing when max answers is as expected', () => {
    it('renders correclty when 2 <= maxAnswers <= pollOptions.length', () => {
      const Wrapper = shallow(
        <WrongMaxChoiceIndicator
          questionId="questionId"
          maxAnswers={2}
          options={pollOptions}
        />
      );
      expect(Wrapper).toMatchSnapshot();
    });
  });
});
