import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

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

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const SignUp: Story = {
  play: () => {},
};
