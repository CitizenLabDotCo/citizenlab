import React from 'react';

import AvatarStack from './AvatarStack';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Avatar stack',
  component: AvatarStack,
  args: { avatars: [{ initials: 'TB' }, { initials: 'AK' }] },
} satisfies Meta<typeof AvatarStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <AvatarStack avatars={[{ initials: 'TB' }, { initials: 'AK' }]} />
      <AvatarStack
        avatars={[{ initials: 'TB' }, { initials: 'AK' }, { initials: 'MN' }]}
      />
      <AvatarStack
        avatars={[
          { initials: 'TB' },
          { initials: 'AK' },
          { initials: 'MN' },
          { initials: 'JD' },
          { initials: 'LP' },
        ]}
      />
      <AvatarStack
        avatars={[
          { initials: 'TB' },
          { content: 'image', alt: 'Ann' },
          { content: 'empty' },
        ]}
      />
    </div>
  ),
};
