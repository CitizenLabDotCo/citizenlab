import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  mockIdeas,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import SidePanel from '.';

// The panel that slides in over the input manager when an input is opened:
// its overview, properties, quick actions and content.

const meta = {
  title: 'Components/Redesigned/Input manager/Idea side panel',
  tags: ['bo', 'redesigned'],
  component: SidePanel,
  parameters: { layout: 'fullscreen', msw: backofficeRedesignHandlers },
  args: {
    ideaId: mockIdeas[0].id,
    mode: 'view',
    type: 'ProjectIdeas',
    context: 'Collect ideas',
    listedPhase: ideationPhase,
    navigation: undefined,
    onChangeMode: fn(),
    onClose: fn(),
  },
  play: async () => {
    await waitForText(document.body, 'Plant oaks along the canal');
  },
} satisfies Meta<typeof SidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
