import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import Breadcrumbs from '.';

// The breadcrumb of the redesigned workspace header: 13px grey crumbs, the
// current one in 500 weight near-black with an ellipsis, a small chevron or
// slash between them and a folder icon in front.

const meta = {
  title: 'Components/Redesigned/Shared pieces/Breadcrumbs',
  tags: ['bo', 'redesigned'],
  component: Breadcrumbs,
  args: {
    variant: 'backofficeRedesign',
    icon: 'folder-outline',
    separator: 'chevron',
    highlightCurrentPage: true,
    breadcrumbs: [
      { label: 'Projects', link: { to: '/admin/projects' } },
      { label: 'Renew Wonder Square' },
    ],
  },
  decorators: [
    (Story) => (
      <Box
        w="640px"
        h="48px"
        px="16px"
        display="flex"
        alignItems="center"
        background="white"
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Project page: Projects > project name, folder icon in front. */
export const Default: Story = {};

/** Phase page: project / phase with slashes and no icon. */
export const Phase: Story = {
  args: {
    icon: undefined,
    separator: 'slash',
    breadcrumbs: [
      {
        label: 'Renew Wonder Square',
        link: {
          to: '/admin/projects/$projectId',
          params: { projectId: 'p1' },
        },
      },
      { label: 'Collect ideas' },
    ],
  },
};

/** A new phase in a draft: three crumbs with chevrons. */
export const ThreeLevels: Story = {
  args: {
    icon: undefined,
    breadcrumbs: [
      {
        label: 'Renew Wonder Square',
        link: {
          to: '/admin/projects/$projectId',
          params: { projectId: 'p1' },
        },
      },
      { label: 'Timeline' },
      { label: 'New phase' },
    ],
  },
};

/** A long project name: the current crumb ends in an ellipsis. */
export const LongContent: Story = {
  args: {
    breadcrumbs: [
      { label: 'Projects', link: { to: '/admin/projects' } },
      {
        label:
          'Where should the new trees along the canal and the ring road be planted first, and which streets come next',
      },
    ],
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
