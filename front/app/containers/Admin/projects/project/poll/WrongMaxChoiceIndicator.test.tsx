import React from 'react';
import WrongMaxChoiceIndicator from './WrongMaxChoiceIndicator';
import { mockOption } from 'services/__mocks__/pollOptions';
import { render, screen } from 'utils/testUtils/rtl';
import { IPollOptionData } from 'services/pollOptions';

const mockPollOptions: IPollOptionData[] = [
  'Vanilla',
  'Pistachio',
  'Raspberry',
].map((item, index) => mockOption(index.toString(), item, index));

jest.mock('hooks/usePollOptions', () => () => mockPollOptions);

describe('<WrongMaxChoiceIndicator/>', () => {
  it('indicates when there are fewer poll answer options than maximum number of answers participant can give', () => {
    render(<WrongMaxChoiceIndicator questionId="questionId" maxAnswers={10} />);

    expect(screen.getByTestId('wrongMaxChoiceIndicator')).toBeInTheDocument();
  });

  it('does not show when there are enough (equal number or more) poll answer options than maximum number of answers participant can give', () => {
    render(<WrongMaxChoiceIndicator questionId="questionId" maxAnswers={3} />);

    expect(
      screen.queryByTestId('wrongMaxChoiceIndicator')
    ).not.toBeInTheDocument();
  });
});
