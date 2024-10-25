import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import { AvatarBubbles } from './';

jest.mock('api/avatars/useRandomAvatars');
jest.mock('api/avatars/useAvatarsWithIds');

describe('AvatarBubbles', () => {
  it('Confirm container exists', () => {
    render(<AvatarBubbles avatarIds={['sample']} size={1} userCount={10} />);
    expect(screen.getByTestId('avatarBubblesContainer')).toBeInTheDocument();
  });
  it('Confirm avatar images are present', () => {
    render(<AvatarBubbles avatarIds={['sample']} size={1} userCount={10} />);
    const avatarBubbles = screen.getAllByTestId('avatarImageBubble');
    expect(avatarBubbles).toHaveLength(4);
  });
  it('User count 999 displayed as expected', () => {
    render(<AvatarBubbles avatarIds={['sample']} size={1} userCount={999} />);
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /995 participants/
    );
  });

  it('User count 15550 truncates as expected', () => {
    render(<AvatarBubbles avatarIds={['sample']} size={1} userCount={15500} />);
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /15.5k participants/
    );
  });

  it('User count 999999 truncates as expected', () => {
    render(
      <AvatarBubbles avatarIds={['sample']} size={1} userCount={999999} />
    );
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /999k participants/
    );
  });

  it('User count 1,000,001 truncates as expected', () => {
    render(
      <AvatarBubbles
        avatarIds={['sample']}
        size={1}
        userCount={1000003}
        limit={3}
      />
    );
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /1M participants/
    );
  });

  it('User count 1,200,001 truncates as expected', () => {
    render(
      <AvatarBubbles avatarIds={['sample']} size={1} userCount={1200001} />
    );
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /1.2M participants/
    );
  });
});
