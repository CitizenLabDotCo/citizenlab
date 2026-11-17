import React from 'react';

import Badge from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Badge',
  component: Badge,
  args: { children: 'Idea', icon: 'paperclip-16' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const tones = ['neutral', 'selected'] as const;

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {tones.map((tone) => (
        <div
          key={tone}
          style={{ display: 'flex', gap: 16, alignItems: 'center' }}
        >
          <Badge tone={tone} icon="paperclip-16">
            Idea
          </Badge>
          <Badge tone={tone}>Idea</Badge>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Badge use="note">Idea</Badge>
      </div>
    </div>
  ),
};
