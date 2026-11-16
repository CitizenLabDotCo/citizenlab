import React from 'react';

import Link, { LinkVariant } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Actions/Link',
  component: Link,
  args: { children: 'See all projects', href: '#' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const variants: LinkVariant[] = ['inline', 'standalone'];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {variants.map((variant) => (
        <div
          key={variant}
          style={{ display: 'flex', gap: 24, alignItems: 'center' }}
        >
          <Link variant={variant} href="#">
            See all projects
          </Link>
          <Link variant={variant} href="#" isDisabled>
            See all projects
          </Link>
        </div>
      ))}
    </div>
  ),
};
