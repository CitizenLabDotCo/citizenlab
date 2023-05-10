// @ts-nocheck
import React from 'react';
import WrongMaxChoiceIndicator from './WrongMaxChoiceIndicator';
import { mockOption } from 'services/__mocks__/pollOptions';
import { render, screen } from 'utils/testUtils/rtl';
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
  it('renders correctly when there is less options than maxAnswers', () => {
    render(<WrongMaxChoiceIndicator questionId="questionId" maxAnswers={10} />);

    expect(screen.getByTestId('wrongMaxChoiceIndicator')).toBeInTheDocument();
    // expect(
    //   render(Wrapper.find('StyledIconTooltip').prop('content')).prop('id')
    // ).toContain('maxOverTheMaxTooltip');
    // expect(Wrapper.find('FormattedMessage').prop('id')).toContain('wrongMax');
  });
});
