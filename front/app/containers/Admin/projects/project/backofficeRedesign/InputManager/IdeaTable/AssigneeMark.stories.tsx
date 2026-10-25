import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import { usersData } from 'api/users/__mocks__/_mockServer';

import { backofficeRedesignHandlers } from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import AssigneeMark from './AssigneeMark';

// The assignee cell of the input list: the assignee's avatar (their name
// in a tooltip), or a dashed circle when nobody is assigned.

const meta = {
  title: 'Components/Redesigned/Input manager/Assignee mark',
  tags: ['bo', 'redesigned'],
  component: AssigneeMark,
  parameters: { msw: backofficeRedesignHandlers },
  args: { assigneeId: usersData[0].id },
  decorators: [
    // Under its column title, as in the input list.
    (Story) => (
      <Box display="flex" flexDirection="column" gap="8px">
        <Text variant="boLabel" m="0" fontWeight="bold">
          Assignee
        </Text>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof AssigneeMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Unassigned: Story = {
  args: { assigneeId: undefined },
};
