import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import AvatarBubbles from './';

jest.mock('services/locale');
jest.mock('services/avatars');
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('utils/cl-router/history');
jest.mock('resources/GetAvatars', () => 'GetAvatars');

describe('AvatarBubbles', () => {
  it('User count truncates as expected', () => {
    render(<AvatarBubbles avatarIds={['test']}></AvatarBubbles>);
    expect(screen.getAllByRole('log')[0]).toBeInTheDocument();
    screen.debug();
  });
});
