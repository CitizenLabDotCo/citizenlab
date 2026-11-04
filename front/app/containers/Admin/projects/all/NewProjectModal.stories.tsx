import React from 'react';

// Load the app's route tree first: the modal imports the admin project
// routes, which reach back into it, and loaded the other way round the
// admin routes are read before they exist.
import 'routes';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../.storybook/mocks/backofficeRedesign';
import { sharedPiecesHandlers } from '../../../../../.storybook/mocks/backofficeRedesignSharedPieces';

import NewProjectModal from './NewProjectModal';

// The New project modal (bo modal, 560px): the title with its locale tabs,
// the context pickers (space and folder), who can find and who can open the
// project as radio choices, and a 32px Create button in the footer.

const body = () => within(document.body);

const meta = {
  title: 'Components/Redesigned/New project/New project modal',
  tags: ['bo', 'redesigned'],
  component: NewProjectModal,
  parameters: { msw: sharedPiecesHandlers, layout: 'fullscreen' },
  args: { mode: 'scratch', onClose: fn() },
  render: (args) => (
    <Box h="900px">
      <NewProjectModal {...args} />
    </Box>
  ),
  play: async () => {
    await waitForText(document.body, 'Who can find it');
    await waitForText(document.body, 'Folder');
  },
} satisfies Meta<typeof NewProjectModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open and empty. */
export const Default: Story = {};

/** "Selected groups" picked: the groups pill picker shows. */
export const Groups: Story = {
  play: async () => {
    await waitForText(document.body, 'Selected groups');
    await userEvent.click(body().getByText('Selected groups'));
    await waitForText(document.body, 'Choose groups');
  },
};

/** The folder picker open. */
export const FolderPickerOpen: Story = {
  play: async () => {
    await waitForText(document.body, 'No folder');
    await userEvent.click(body().getByRole('button', { name: /No folder/ }));
    await waitForText(document.body, 'Youth council');
  },
};

/** Create pressed without a title: the errors show. */
export const Errors: Story = {
  play: async () => {
    await waitForText(document.body, 'Who can find it');
    await userEvent.click(body().getByText('Selected groups'));
    await userEvent.click(body().getByRole('button', { name: 'Create' }));
    await waitForText(document.body, 'Choose at least one group');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => undefined,
};
