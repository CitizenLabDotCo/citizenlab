import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { sharedPiecesHandlers } from '../../../../../../../.storybook/mocks/backofficeRedesignSharedPieces';

import ProjectContextPickers from '.';

// Where a new project goes: a Space and a Folder label, each with an option
// picker pill. Picking a folder fills in its space. Used in the New project
// form and the template "use" modal.

const Controlled = (args: React.ComponentProps<typeof ProjectContextPickers>) => {
  const [context, setContext] = useState({
    space_id: args.spaceId,
    folder_id: args.folderId,
  });
  return (
    <ProjectContextPickers
      {...args}
      spaceId={context.space_id}
      folderId={context.folder_id}
      onChange={(next) => {
        setContext(next);
        args.onChange(next);
      }}
    />
  );
};

const meta = {
  title: 'Components/Redesigned/New project/Project context pickers',
  tags: ['bo', 'redesigned'],
  component: ProjectContextPickers,
  parameters: { msw: sharedPiecesHandlers },
  args: { spaceId: null, folderId: null, projectInRoot: true, onChange: fn() },
  render: (args) => <Controlled {...args} />,
  decorators: [
    (Story) => (
      <Box w="560px" h="440px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'No folder');
  },
} satisfies Meta<typeof ProjectContextPickers>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No space and no folder yet. */
export const Default: Story = {};

/** A folder picked: its space is filled in. */
export const Filled: Story = {
  args: { spaceId: 'bo-space-north', folderId: 'bo-folder-parks' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Parks and green spaces');
  },
};

/** The space picker open. */
export const SpaceOpen: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'No space');
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /No space/ })
    );
    await waitForText(canvasElement, 'North district');
  },
};

/** The folder picker open, folders named with their space. */
export const FolderOpen: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'No folder');
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /No folder/ })
    );
    await waitForText(canvasElement, 'Youth council');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => undefined,
};
