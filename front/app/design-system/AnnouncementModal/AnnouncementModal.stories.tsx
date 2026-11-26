
import AnnouncementModal from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Overlays/Announcement modal',
  component: AnnouncementModal,
  args: {
    isOpen: true,
    media: null,
    title: 'Introducing the new project back office',
    points: [
      'Faster setup, with every setting on one screen',
      'Full control over what is set and what is missing',
      'Live preview of what participants will see',
    ],
    primaryAction: { label: 'Enable', onPress: () => {} },
    secondaryAction: { label: 'Not now', onPress: () => {} },
    note: 'You can go back to the previous version anytime.',
  },
} satisfies Meta<typeof AnnouncementModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
