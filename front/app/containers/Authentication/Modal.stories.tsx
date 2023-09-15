import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import mockEndpoints from 'utils/storybook/mockEndpoints';
import { loggedOutHandler } from 'api/me/__mocks__/_mockServer';
import { triggerAuthenticationFlow } from './events';

import Modal from './Modal';

const meta = {
  title: 'Example/AuthenticationModal',
  // component: Modal,
  render: () => {
    return (
      <>
        <button onClick={() => triggerAuthenticationFlow()}>Open modal</button>
        <Modal />
      </>
    );
  },
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visiting: Story = {
  parameters: {
    msw: mockEndpoints({
      'GET users/me': loggedOutHandler,
    }),
  },
};
