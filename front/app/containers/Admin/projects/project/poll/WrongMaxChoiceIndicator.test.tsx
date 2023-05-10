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
  it('renders correctly when there is less options than maxAnswers', () => {
    render(<WrongMaxChoiceIndicator questionId="questionId" maxAnswers={10} />);

    expect(screen.getByTestId('wrongMaxChoiceIndicator')).toBeInTheDocument();
  });
});
