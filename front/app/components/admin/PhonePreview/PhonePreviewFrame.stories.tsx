import React from 'react';

import {
  Box,
  Icon,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import PhonePreviewFrame from './PhonePreviewFrame';

// A white phone outline with a thin grey border and 22px corners, scaled to
// fit its box, on the light grey backdrop of the centre panel. The event
// workspace previews the event page inside it.

const Screen = ({ long = false }: { long?: boolean }) => (
  <Box h="100%" display="flex" flexDirection="column" background={colors.white}>
    <Box
      flex="0 0 56px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px="16px"
      borderBottom={`1px solid ${colors.divider}`}
    >
      <Text m="0" fontWeight="bold">
        Wonderville
      </Text>
      <Icon name="menu" fill={colors.textPrimary} />
    </Box>
    <Box p="20px 16px" display="flex" flexDirection="column" gap="12px">
      <Title variant="h2" m="0">
        {long
          ? 'Second neighbourhood workshop on where the new trees along the canal should go'
          : 'Neighbourhood workshop'}
      </Title>
      <Text m="0" color="coolGrey600">
        Saturday 14 November, 10:00 - 12:00
      </Text>
      <Text m="0">
        Join us to decide where the new trees go. Bring a map of your street.
      </Text>
    </Box>
  </Box>
);

const meta = {
  title: 'Components/Redesigned/Shared pieces/Phone preview frame',
  tags: ['bo', 'redesigned'],
  component: PhonePreviewFrame,
  parameters: { layout: 'fullscreen' },
  args: { screen: <Screen /> },
  decorators: [
    (Story) => (
      <Box h="720px" w="100%" background={colors.grey100}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PhonePreviewFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The phone centred on the backdrop. */
export const Default: Story = {};

/** Aligned to the top, as when the panel scrolls. */
export const AlignTop: Story = {
  args: { alignTop: true },
};

/** A small box: the phone scales down. */
export const Small: Story = {
  decorators: [
    (Story) => (
      <Box h="420px" w="360px" background={colors.grey100}>
        <Story />
      </Box>
    ),
  ],
};

export const LongContent: Story = {
  args: { screen: <Screen long /> },
};
