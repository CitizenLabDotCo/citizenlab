import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import { AvatarBubbles } from './';
import { avatarsData } from 'api/avatars/__mocks__/useRandomAvatars';

const mockAvatarsData = avatarsData;
let mockTotal = 10;
jest.mock('api/avatars/useRandomAvatars', () => () => {
  return {
    data: {
      data: mockAvatarsData,
      meta: {
        total: mockTotal,
      },
    },
  };
});
jest.mock('api/avatars/useAvatarsWithIds');

describe('AvatarBubbles', () => {
  it('Confirm container exists', () => {
    render(<AvatarBubbles avatarIds={['sample']} size={1} />);
    expect(screen.getByTestId('avatarBubblesContainer')).toBeInTheDocument();
  });
  it('Confirm avatar image is present', () => {
    render(<AvatarBubbles avatarIds={['sample']} size={1} />);
    expect(screen.getByTestId('avatarImageBubble')).toBeInTheDocument();
  });
  it('User count 999 displayed as expected', () => {
    mockTotal = 999;
    render(<AvatarBubbles avatarIds={['sample']} size={1} />);
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(/998/);
  });

  it('User count 15550 truncates as expected', () => {
    mockTotal = 15550;
    render(<AvatarBubbles avatarIds={['sample']} size={1} />);
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /15.5k/
    );
  });

  it('User count 999999 truncates as expected', () => {
    mockTotal = 999999;
    render(<AvatarBubbles avatarIds={['sample']} size={1} />);
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /999k/
    );
  });

  it('User count 1,000,001 truncates as expected', () => {
    mockTotal = 1000001;
    render(<AvatarBubbles avatarIds={['sample']} size={1} />);
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(/1M/);
  });

  it('User count 1,200,001 truncates as expected', () => {
    mockTotal = 1200001;
    render(<AvatarBubbles avatarIds={['sample']} size={1} />);
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /1.2M/
    );
  });
});
