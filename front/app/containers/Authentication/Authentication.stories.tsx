import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// mocking
import mockEndpoints from 'utils/storybook/mockEndpoints';
import { loggedOutHandler } from 'api/me/__mocks__/_mockServer';

// component
import Authentication from '.';
import { triggerAuthenticationFlow } from './events';

const noop = () => {};

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Example/Authentication',
  render: (props) => {
    return (
      <>
        <button
          style={{
            backgroundColor: '#d3d3d3',
            padding: '12px',
            cursor: 'pointer',
          }}
          data-testid="open-modal-button"
          onClick={() => triggerAuthenticationFlow()}
        >
          Open auth modal
        </button>
        <Authentication {...props} />
      </>
    );
  },
  parameters: {
    layout: 'centered',
  },
  args: {
    setModalOpen: noop,
  },
} satisfies Meta<typeof Authentication>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignUp: Story = {
  parameters: {
    msw: mockEndpoints({
      'GET users/me': loggedOutHandler,
    }),
  },
};
