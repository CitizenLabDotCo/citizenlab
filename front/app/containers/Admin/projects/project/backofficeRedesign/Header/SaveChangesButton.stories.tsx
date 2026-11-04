import React, { useEffect } from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import {
  PageSaveProvider,
  useRegisterPageSaver,
} from '../_shared/PageSaveContext';

import SaveChangesButton from './SaveChangesButton';

// The Save button in the header of a phase or event: it saves every panel
// with unsaved changes at once, greyed out while there is nothing to save.

type Mode = 'clean' | 'dirty' | 'saving' | 'saved';

// A stand-in for a panel with unsaved changes. 'saving' never finishes its
// save; 'saved' finishes and reports the panel clean again.
const FakePanel = ({ mode }: { mode: Mode }) => {
  const [dirty, setDirty] = React.useState(mode !== 'clean');
  useRegisterPageSaver('story-panel', {
    dirty,
    save: () =>
      mode === 'saving'
        ? new Promise<void>(() => {})
        : Promise.resolve().then(() => setDirty(false)),
  });
  useEffect(() => setDirty(mode !== 'clean'), [mode]);
  return null;
};

const SaveChangesButtonStory = ({
  mode,
  label,
}: {
  mode: Mode;
  label?: string;
}) => (
  <PageSaveProvider>
    <FakePanel mode={mode} />
    <SaveChangesButton label={label} />
  </PageSaveProvider>
);

const clickSave = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const button = await within(canvasElement).findByRole('button');
  await userEvent.click(button);
};

const meta = {
  title: 'Components/Redesigned/Project header/Save changes button',
  tags: ['bo', 'redesigned'],
  component: SaveChangesButtonStory,
  args: { mode: 'dirty' },
  argTypes: {
    mode: { control: 'inline-radio', options: ['clean', 'dirty', 'saving', 'saved'] },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 8 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SaveChangesButtonStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unsaved changes on the page: the button is active. */
export const Default: Story = {};

/** Nothing to save yet: greyed out. */
export const Disabled: Story = {
  args: { mode: 'clean' },
};

/** Saving: the spinner while the panels save. */
export const Loading: Story = {
  args: { mode: 'saving' },
  play: clickSave,
};

/** Just saved: a tick and "Saved" until the next edit. */
export const Saved: Story = {
  args: { mode: 'saved' },
  play: clickSave,
};

/** A new phase: the button creates it. */
export const CustomLabel: Story = {
  args: { label: 'Create phase' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
