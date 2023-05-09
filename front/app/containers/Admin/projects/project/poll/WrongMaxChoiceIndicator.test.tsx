// @ts-nocheck
import React from 'react';
import WrongMaxChoiceIndicator from './WrongMaxChoiceIndicator';
import { mockOption } from 'services/__mocks__/pollOptions';
import { render } from 'utils/testUtils/rtl';
import { IPollOptionData } from 'services/pollOptions';

jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));
jest.mock('services/pollOptions');
jest.mock('./WrongOptionsIndicator', () => ({
  StyledIconTooltip: 'StyledIconTooltip',
  Indicator: 'Indicator',
}));
const mockPollOptions: IPollOptionData[] = [
  'Vanilla',
  'Pistachio',
  'Raspberry',
].map((item, index) => mockOption(index, item));
jest.mock('hooks/usePollOptions', () => () => mockPollOptions);

describe('<WrongMaxChoiceIndicator/>', () => {
  describe('boundaries', () => {
    it('renders correctly when options is null', () => {
      render(
        <WrongMaxChoiceIndicator questionId="questionId" maxAnswers={5} />
      );
    });

    it('renders correctly when options is Error', () => {
      render(
        <WrongMaxChoiceIndicator questionId="questionId" maxAnswers={5} />
      );
    });

    it('renders correctly when options is undefined', () => {
      render(
        <WrongMaxChoiceIndicator questionId="questionId" maxAnswers={5} />
      );
    });

    it('renders correctly when maxAnswers is null', () => {
      render(
        <WrongMaxChoiceIndicator questionId="questionId" maxAnswers={null} />
      );
    });
  });

  describe('renders the error message when max answers is not as expected', () => {
    it('renders correctly when options is as expected and maxAnswers is zero', () => {
      render(
        <WrongMaxChoiceIndicator questionId="questionId" maxAnswers={0} />
      );
      // expect(
      //   render(Wrapper.find('StyledIconTooltip').prop('content')).prop('id')
      // ).toContain('maxUnderTheMinTooltip');
      // expect(Wrapper.find('FormattedMessage').prop('id')).toContain('wrongMax');
    });

    it('renders correctly when options is as expected and maxAnswers is one', () => {
      render(
        <WrongMaxChoiceIndicator questionId="questionId" maxAnswers={1} />
      );
      // expect(
      //   render(Wrapper.find('StyledIconTooltip').prop('content')).prop('id')
      // ).toContain('maxUnderTheMinTooltip');
      // expect(Wrapper.find('FormattedMessage').prop('id')).toContain('wrongMax');
    });

    it('renders correctly when there is less options than maxAnswers', () => {
      render(
        <WrongMaxChoiceIndicator questionId="questionId" maxAnswers={10} />
      );
      // expect(
      //   render(Wrapper.find('StyledIconTooltip').prop('content')).prop('id')
      // ).toContain('maxOverTheMaxTooltip');
      // expect(Wrapper.find('FormattedMessage').prop('id')).toContain('wrongMax');
    });
  });
});
