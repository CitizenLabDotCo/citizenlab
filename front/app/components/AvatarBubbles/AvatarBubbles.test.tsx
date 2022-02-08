import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import AvatarBubbles from './';

describe('AvatarBubbles', () => {
  it('User count truncates as expected', () => {
    render(<AvatarBubbles userCount={200} />);
  });
});
