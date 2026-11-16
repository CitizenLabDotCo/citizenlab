import React from 'react';

import Breadcrumbs, { Breadcrumb, BreadcrumbSeparator } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Navigation/Breadcrumbs',
  component: Breadcrumbs,
  args: { children: null },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumb href="#projects">Projects</Breadcrumb>
      <Breadcrumb href="#project">Untitled project</Breadcrumb>
      <Breadcrumb>Collect ideas</Breadcrumb>
    </Breadcrumbs>
  ),
};

const separators: BreadcrumbSeparator[] = ['chevron', 'slash'];

// Each row: a link level (Default; hover, press and focus it to see the states),
// a disabled level, then the current level.
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {separators.map((separator) => (
        <Breadcrumbs key={separator} separator={separator}>
          <Breadcrumb href="#project">Untitled project</Breadcrumb>
          <Breadcrumb href="#project" isDisabled>
            Untitled project
          </Breadcrumb>
          <Breadcrumb>Untitled project</Breadcrumb>
        </Breadcrumbs>
      ))}
      <div style={{ width: 200 }}>
        <Breadcrumbs>
          <Breadcrumb href="#projects">Projects</Breadcrumb>
          <Breadcrumb href="#project">A very long project name</Breadcrumb>
          <Breadcrumb>Collect ideas</Breadcrumb>
        </Breadcrumbs>
      </div>
    </div>
  ),
};
