import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { sharedPiecesHandlers } from '../../../../../../../.storybook/mocks/backofficeRedesignSharedPieces';

import NewProjectForm from '.';

// The form inside the New project modal: the title with bo locale tabs,
// then three small-caption sections: context (space and folder pickers),
// who can find it and who can open it (bo radio choices with a grey
// description), and a groups pill picker for "Selected groups".

const meta = {
  title: 'Components/Redesigned/New project/New project form',
  tags: ['bo', 'redesigned'],
  component: NewProjectForm,
  parameters: { msw: sharedPiecesHandlers },
  args: { id: 'new-project-form', failed: false, apiErrors: {}, onSubmit: fn() },
  decorators: [
    (Story) => (
      <Box w="560px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Who can find it');
    await waitForText(canvasElement, 'Folder');
  },
} satisfies Meta<typeof NewProjectForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** "Selected groups" picked, two groups chosen. */
export const WithGroups: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForText(canvasElement, 'Selected groups');
    await userEvent.click(canvas.getByText('Selected groups'));
    await waitForText(canvasElement, 'Choose groups');
    await userEvent.click(canvas.getByRole('button', { name: /Choose groups/ }));
    await waitForText(canvasElement, 'City staff');
    await userEvent.click(canvas.getByText('City staff'));
    await userEvent.click(canvas.getByText('Youth council members'));
    await userEvent.keyboard('{Escape}');
  },
};

/** The create call failed: the error line shows at the bottom. */
export const Failed: Story = {
  args: { failed: true },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => undefined,
};
