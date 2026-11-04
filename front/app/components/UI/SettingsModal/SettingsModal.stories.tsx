import React from 'react';

import {
  Box,
  Button,
  Input,
  Text,
  bo,
} from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from 'storybook/test';

import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import generalMessages from 'containers/Admin/projects/project/general/messages';

import { waitForText } from '../../../../.storybook/mocks/backofficeRedesign';

import SettingsModal, { SettingsModalSection } from '.';

// A wide modal with a light grey side navigation (icon and label per
// section, the selected one on a darker grey) and the section's content on
// the right. The project settings modal behind the setup panel's gear.

const Field = ({ label, value }: { label: string; value?: string }) => (
  <Input type="text" variant="bo" label={label} value={value} />
);

const sections: SettingsModalSection[] = [
  {
    name: 'general',
    label: messages.settingsGeneral,
    icon: 'settings',
    content: (
      <Box display="flex" flexDirection="column" gap="16px">
        <Text variant="boSection" m="0px">
          General
        </Text>
        <Field label="Project name" value="Renew Wonder Square" />
        <Field label="Slug" value="renew-wonder-square" />
        <Field label="Short description" />
      </Box>
    ),
  },
  {
    name: 'resources',
    label: messages.settingsResources,
    icon: 'paperclip',
    content: (
      <Text variant="boHelper" m="0px">
        Files residents can download from the project page.
      </Text>
    ),
  },
  {
    name: 'management',
    label: messages.settingsManagement,
    icon: 'user',
    content: (
      <Text variant="boHelper" m="0px">
        The people who manage this project.
      </Text>
    ),
  },
  {
    name: 'input-tags',
    label: generalMessages.inputTags,
    icon: 'label',
    content: (
      <Text variant="boHelper" m="0px">
        Tags residents can add to their inputs.
      </Text>
    ),
  },
];

const footer = (
  <Box display="flex" gap="8px">
    <Button
      buttonStyle="bo-secondary"
      height={bo.buttonMedium.height}
      fontSize={bo.buttonMedium.fontSize}
    >
      Cancel
    </Button>
    <Button
      buttonStyle="bo-primary"
      height={bo.buttonMedium.height}
      fontSize={bo.buttonMedium.fontSize}
    >
      Save changes
    </Button>
  </Box>
);

const meta = {
  title: 'Components/Redesigned/Shared pieces/Settings modal',
  tags: ['bo', 'redesigned'],
  component: SettingsModal,
  parameters: { layout: 'fullscreen' },
  args: {
    opened: true,
    close: fn(),
    header: 'Project settings',
    sections,
    footer,
  },
  render: (args) => (
    <Box height="800px">
      <SettingsModal {...args} />
    </Box>
  ),
  play: async () => {
    await waitForText(document.body, 'Project name');
  },
} satisfies Meta<typeof SettingsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open on General. */
export const Default: Story = {};

/** Opened straight on another section. */
export const OtherSection: Story = {
  args: { initialSection: 'management' },
  play: async () => {
    await waitForText(document.body, 'The people who manage');
  },
};

/** A nav item hovered. */
export const NavHover: Story = {
  play: async () => {
    await waitForText(document.body, 'Project name');
    await userEvent.hover(
      within(document.body).getByRole('tab', { name: /Resources/ })
    );
  },
};

/** Without a footer. */
export const NoFooter: Story = {
  args: { footer: undefined },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {
    await waitForText(document.body, 'Project name');
  },
};
