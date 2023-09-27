import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import Konveio from './Konveio';
import { IUserData } from 'api/users/types';

const mockAuthUserData: IUserData = {
  id: 'userId',
  type: 'user',
  attributes: {
    first_name: 'Stewie',
    last_name: 'McKenzie',
    locale: 'en',
    slug: 'stewie-mckenzie',
    highest_role: 'admin',
    bio_multiloc: {},
    roles: [{ type: 'admin' }],
    registration_completed_at: '',
    created_at: '',
    updated_at: '',
    unread_notifications: 0,
    invite_status: null,
    confirmation_required: false,
    email: 'test@mail.com',
    followings_count: 2,
  },
};

jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockAuthUserData },
}));

describe('Konveio', () => {
  it('should render', () => {
    render(
      <Konveio documentUrl={'https://demo.konveio.com/node/93?iframe=true'} />
    );
    expect(screen.getByTestId('konveiosurvey')).toBeInTheDocument();
  });

  it('appends the integration and email to the documentUrl', () => {
    render(
      <Konveio documentUrl={'https://demo.konveio.com/node/93?iframe=true'} />
    );
    const displayedIframe = screen.getByTestId('konveiosurvey');
    expect(displayedIframe).toHaveAttribute(
      'src',
      'https://demo.konveio.com/node/93?iframe=true&integration=CitizenLab&cemail=test%40mail.com&username=Stewie%20McKenzie'
    );
  });
});
