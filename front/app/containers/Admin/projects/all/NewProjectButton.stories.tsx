import React from 'react';

// Load the app's route tree first: the modal imports the admin project
// routes, which reach back into it, and loaded the other way round the
// admin routes are read before they exist.
import 'routes';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../.storybook/mocks/backofficeRedesign';
import { sharedPiecesHandlers } from '../../../../../.storybook/mocks/backofficeRedesignSharedPieces';

import NewProjectButton from './NewProjectButton';

// The New project button of the projects list. With the redesign on it
// opens a small 200px menu (8px radius, 13px items with a grey icon):
// "From scratch" opens the New project modal, "Use a template" the
// template picker.

const openMenu = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  // Until the configuration loads the old link shows with the same text, so
  // wait for the redesign's menu button itself.
  await userEvent.click(
    await within(canvasElement).findByRole(
      'button',
      { name: /New project/ },
      { timeout: 10000 }
    )
  );
  await waitForText(canvasElement, 'From scratch');
};

const meta = {
  title: 'Components/Redesigned/New project/New project button',
  tags: ['bo', 'redesigned'],
  component: NewProjectButton,
  parameters: { msw: sharedPiecesHandlers },
  decorators: [
    (Story) => (
      <Box w="520px" h="200px" p="24px" display="flex" justifyContent="flex-end">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof NewProjectButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The menu open under the button. */
export const Default: Story = {
  play: openMenu,
};

/** Closed. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'New project');
  },
};

/** A menu item hovered. */
export const ItemHover: Story = {
  play: async (context) => {
    await openMenu(context);
    await userEvent.hover(
      within(context.canvasElement).getByRole('menuitem', {
        name: /From scratch/,
      })
    );
  },
};

/** "From scratch" picked: the New project modal opens. */
export const ModalOpen: Story = {
  parameters: { layout: 'fullscreen' },
  play: async (context) => {
    await openMenu(context);
    await userEvent.click(
      within(context.canvasElement).getByRole('menuitem', {
        name: /From scratch/,
      })
    );
    await waitForText(document.body, 'Who can find it');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    const [button] = await within(canvasElement).findAllByRole(
      'button',
      {},
      { timeout: 10000 }
    );
    await userEvent.click(button);
  },
};
