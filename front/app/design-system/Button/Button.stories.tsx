import React from 'react';

import Button, { ButtonVariant } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Actions/Button',
  component: Button,
  args: { children: 'Button' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const variants: ButtonVariant[] = ['primary', 'secondary', 'quiet', 'danger'];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {variants.map((variant) =>
        ([28, 32] as const).map((size) => (
          <div
            key={`${variant}-${size}`}
            style={{ display: 'flex', gap: 16, alignItems: 'center' }}
          >
            <Button variant={variant} size={size}>
              Button
            </Button>
            <Button variant={variant} size={size} hasMenu>
              Button
            </Button>
            <Button variant={variant} size={size} icon="plus-16">
              Button
            </Button>
            <Button variant={variant} size={size} isPending>
              Button
            </Button>
            <Button variant={variant} size={size} isDisabled>
              Button
            </Button>
            <Button
              variant={variant}
              size={size}
              disabledReason="Add a title first"
            >
              Button
            </Button>
          </div>
        ))
      )}
    </div>
  ),
};
