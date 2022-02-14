import React from 'react';
import { IAvatarData } from 'services/avatars';
import { render, screen } from 'utils/testUtils/rtl';
import { AvatarBubbles } from './';
import { getDummyIntlObject } from 'utils/testUtils/mockedIntl';

jest.mock('services/locale');
jest.mock('services/avatars');
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('utils/cl-router/history');

const dummyIntl = getDummyIntlObject();

// Avatar data mock
const avatarData = {
  id: 'avatarSample',
  type: 'project',
  intl: 'sample',
  attributes: {
    avatar: {
      small: 'small',
      medium: 'med',
      large: 'large',
    },
  },
} as IAvatarData;

describe('AvatarBubbles', () => {
  it('Confirm container exists', () => {
    render(
      <AvatarBubbles
        avatarIds={['sample']}
        size={1}
        avatars={[avatarData]}
        userCount={10}
        intl={dummyIntl}
      />
    );
    expect(screen.getByTestId('avatarBubblesContainer')).toBeInTheDocument();
  });
  it('Confirm avatar image is present', () => {
    render(
      <AvatarBubbles
        avatarIds={['sample']}
        size={1}
        avatars={[avatarData]}
        userCount={10}
        intl={dummyIntl}
      />
    );
    expect(screen.getByTestId('avatarImageBubble')).toBeInTheDocument();
  });
  it('User count 999 displayed as expected', () => {
    render(
      <AvatarBubbles
        avatarIds={['sample']}
        size={1}
        avatars={[avatarData]}
        userCount={999}
        intl={dummyIntl}
      />
    );
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(/998/);
  });

  it('User count 15550 truncates as expected', () => {
    render(
      <AvatarBubbles
        avatarIds={['sample']}
        size={1}
        avatars={[avatarData]}
        userCount={15500}
        intl={dummyIntl}
      />
    );
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /15.5k/
    );
  });

  it('User count 999999 truncates as expected', () => {
    render(
      <AvatarBubbles
        avatarIds={['sample']}
        size={1}
        avatars={[avatarData]}
        userCount={999999}
        intl={dummyIntl}
      />
    );
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /999k/
    );
  });

  it('User count 1,000,001 truncates as expected', () => {
    render(
      <AvatarBubbles
        avatarIds={['sample']}
        size={1}
        avatars={[avatarData]}
        userCount={1000001}
        intl={dummyIntl}
      />
    );
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(/1M/);
  });

  it('User count 1,200,001 truncates as expected', () => {
    render(
      <AvatarBubbles
        avatarIds={['sample']}
        size={1}
        avatars={[avatarData]}
        userCount={1200001}
        intl={dummyIntl}
      />
    );
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /1.2M/
    );
  });
});
