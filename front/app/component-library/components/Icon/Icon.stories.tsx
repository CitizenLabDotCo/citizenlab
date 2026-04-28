import React from 'react';

import Box from '../Box';

import Icon, { icons, IconNames } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Icon',
  component: Icon,
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IdeaIcon: Story = {
  args: {
    name: 'idea',
  },
};

interface IconWithNameProps {
  name: IconNames;
}

const IconWithName = ({ name }: IconWithNameProps) => {
  return (
    <Box display="flex">
      <Box width="200px">{name}</Box>
      <Box>
        <Icon name={name} width="20px" height="20px" />
      </Box>
    </Box>
  );
};

export const AllIcons: Story = {
  args: {
    name: 'idea',
  },
  render: () => (
    <Box
      display="flex"
      flexDirection="column"
      gap="16px"
      height="100%"
      position="absolute"
      top="40px"
      bottom="0px"
    >
      {Object.keys(icons)
        .sort()
        .map((iconName) => (
          <IconWithName key={iconName} name={iconName as IconNames} />
        ))}
      <Box bgColor="red">End</Box>
    </Box>
  ),
};
