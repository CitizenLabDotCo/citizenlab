import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import Attendees from './Attendees';

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale');
jest.mock('hooks/useAuthUser', () => jest.fn(() => ({ id: '123' })));
jest.mock('hooks/useAttendances', () => jest.fn(() => [{ id: '456' }]));
jest.mock('components/AvatarBubbles', () => ({
  __esModule: true,
  default: () => <></>,
}));

describe('<Attendees />', () => {
  it('renders Button', () => {
    render(<Attendees eventId="111" />);
    expect(screen.getByText('Attend')).toBeInTheDocument();
  });
});
