import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  filesHandler,
  topicsHandler,
  usersHandler,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignSetupPanel';

import ProjectSettingsModal from '.';

// The project settings modal, opened from the cog in the setup panel:
// sections on the left (general, resources, management, input tags), the
// section's form on the right, cancel and save at the bottom.

const handlers = [
  filesHandler,
  topicsHandler,
  ...backofficeRedesignHandlers,
  usersHandler,
];

const openSection =
  (index: number) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await waitForText(canvasElement, 'Save changes');
    const body = within(canvasElement.ownerDocument.body);
    const tabs = await body.findAllByRole('tab');
    await userEvent.click(tabs[index]);
  };

const meta = {
  title: 'Components/Redesigned/Setup panel/Project settings modal',
  tags: ['bo', 'redesigned'],
  component: ProjectSettingsModal,
  parameters: { layout: 'fullscreen', msw: handlers },
  args: { project: project1, opened: true, onClose: fn() },
  decorators: [
    (Story) => (
      <div style={{ height: 900 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Save changes');
  },
} satisfies Meta<typeof ProjectSettingsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** General: where the project lives, its URL, and resetting its data. */
export const Default: Story = {};

/** Resources: the project's files. */
export const Resources: Story = {
  play: openSection(1),
};

/** Management: who manages the project. */
export const Management: Story = {
  play: openSection(2),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
