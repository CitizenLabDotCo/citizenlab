import React from 'react';

import Badge, { BadgeTone } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Badge',
  component: Badge,
  args: { children: 'Idea', icon: 'lightbulb-14' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const tones: BadgeTone[] = ['neutral', 'selected'];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {tones.map((tone) => (
        <div
          key={tone}
          style={{ display: 'flex', gap: 16, alignItems: 'center' }}
        >
          <Badge tone={tone} icon="lightbulb-14">
            Idea
          </Badge>
          <Badge tone={tone}>Idea</Badge>
          <Badge tone={tone} use="note">
            Idea
          </Badge>
        </div>
      ))}
    </div>
  ),
};
