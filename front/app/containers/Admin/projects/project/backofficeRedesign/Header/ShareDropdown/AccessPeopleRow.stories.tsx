import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { mockAuthUserData } from 'api/me/__mocks__/_mockServer';

import { backofficeRedesignHandlers } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  otherAdmin,
  pendingInvite,
  projectManager,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignProjectHeader';

import AccessPeopleRow from './AccessPeopleRow';

// One person in the share panel's "People with access" list: avatar, name
// (or email while the invite is pending) and their role on the project.

const meta = {
  title: 'Components/Redesigned/Project header/Access people row',
  tags: ['bo', 'redesigned'],
  component: AccessPeopleRow,
  parameters: { msw: backofficeRedesignHandlers },
  args: { user: projectManager, isAuthUser: false },
  decorators: [
    (Story) => (
      <div style={{ width: 380, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccessPeopleRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A project manager. */
export const Default: Story = {};

/** An admin: shown as owner. */
export const Owner: Story = {
  args: { user: otherAdmin },
};

/** The signed-in person: "(you)" after the name. */
export const You: Story = {
  args: { user: mockAuthUserData, isAuthUser: true },
};

/** Invited, not signed up yet: the email and "Pending". */
export const Pending: Story = {
  args: { user: pendingInvite },
};

export const RTL: Story = {
  args: { user: mockAuthUserData, isAuthUser: true },
  globals: { lang: 'ar' },
};
