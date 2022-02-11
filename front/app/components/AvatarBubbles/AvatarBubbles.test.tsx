import React from 'react';
import { IntlProvider } from 'react-intl';
import { IAvatarData } from 'services/avatars';
import { FormattedMessage } from 'utils/cl-intl';
import { render, screen } from 'utils/testUtils/rtl';
import { AvatarBubbles } from './';

jest.mock('services/locale');
jest.mock('services/avatars');
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('utils/cl-router/history');

// Avatar data mock
let avatarData = {
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

// Internalization mock
const Intl = jest.requireActual('react-intl');

const defaultProps = {
  locale: 'en',
  defaultLocale: 'en',
};

Intl.FormattedMessage = (props) => (
  <IntlProvider {...defaultProps}>
    <FormattedMessage {...props} />
  </IntlProvider>
);

describe('AvatarBubbles', () => {
  it('User count of 999 displayed as expected', () => {
    render(
      <AvatarBubbles
        avatarIds={['sample']}
        size={1}
        avatars={[avatarData]}
        userCount={999}
        intl={Intl.intl}
      ></AvatarBubbles>
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
        intl={Intl.intl}
      ></AvatarBubbles>
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
        intl={Intl.intl}
      ></AvatarBubbles>
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
        intl={Intl.intl}
      ></AvatarBubbles>
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
        intl={Intl.intl}
      ></AvatarBubbles>
    );
    expect(screen.getByTestId('userCountBubbleInner')).toHaveTextContent(
      /1.2M/
    );
  });
});
