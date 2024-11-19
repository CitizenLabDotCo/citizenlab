import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import { AvatarBubbles } from './';

jest.mock('api/avatars/useRandomAvatars');
jest.mock('api/avatars/useAvatarsWithIds');

describe('AvatarBubbles Component', () => {
  it('renders the container', () => {
    render(<AvatarBubbles avatarIds={['sample']} size={1} userCount={10} />);
    expect(screen.getByTestId('avatarBubblesContainer')).toBeInTheDocument();
  });

  it('renders the correct number of avatar images', () => {
    render(<AvatarBubbles avatarIds={['sample']} size={1} userCount={10} />);
    const avatarBubbles = screen.getAllByTestId('avatarImageBubble');
    expect(avatarBubbles).toHaveLength(4);
  });

  describe('when showParticipantText is on', () => {
    it('displays user count of 999 correctly as "995 participants"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={999}
          showParticipantText
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /995 participants/
      );
    });

    it('truncates user count of 15,500 to "15.5k participants"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={15500}
          showParticipantText
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /15.5k participants/
      );
    });

    it('truncates user count of 999,999 to "999k participants"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={999999}
          showParticipantText
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /999k participants/
      );
    });

    it('truncates user count of 1,000,003 to "1M participants"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={1000003}
          limit={3}
          showParticipantText
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /1M participants/
      );
    });

    it('truncates user count of 1,200,001 to "1.2M participants"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={1200001}
          showParticipantText
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /1.2M participants/
      );
    });
  });

  describe('when showParticipantText is off', () => {
    it('displays user count of 995 as "995"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={999}
          showParticipantText={false}
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /995/
      );
    });

    it('truncates user count of 15,500 to "15.5k"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={15500}
          showParticipantText={false}
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /15.5k/
      );
    });

    it('truncates user count of 999,999 to "999k"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={999999}
          showParticipantText={false}
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /999k/
      );
    });

    it('truncates user count of 1,000,003 to "1M"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={1000003}
          limit={3}
          showParticipantText={false}
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /1M/
      );
    });

    it('truncates user count of 1,200,001 to "1.2M"', () => {
      render(
        <AvatarBubbles
          avatarIds={['sample']}
          size={1}
          userCount={1200001}
          showParticipantText={false}
        />
      );
      expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
        /1.2M/
      );
    });
  });
});
