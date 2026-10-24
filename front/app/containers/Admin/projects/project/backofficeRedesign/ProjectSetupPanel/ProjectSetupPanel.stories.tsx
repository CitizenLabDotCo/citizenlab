import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';
import { IProjectData } from 'api/projects/types';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';

import ProjectSetupPanel from '.';

// The left-hand panel of project setup: next actions once the project is
// live, or the get started checklist while it is a draft, then the listing
// and topic tags cards.

const draftProject: IProjectData = {
  ...project1,
  attributes: {
    ...project1.attributes,
    publication_status: 'draft',
    first_published_at: null,
    participants_count: 0,
    completed_setup_steps: ['settings'],
  },
};

const meta = {
  title: 'Components/Redesigned/Project setup panel',
  tags: ['bo'],
  component: ProjectSetupPanel,
  parameters: { msw: backofficeRedesignHandlers },
  args: { project: project1, onOpenDropdown: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 332, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Next actions');
    await waitForText(canvasElement, 'Topic tags');
  },
} satisfies Meta<typeof ProjectSetupPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A live project: next actions with the participants graph. */
export const Default: Story = {};

/** A draft project: the get started checklist, two steps done. */
export const Draft: Story = {
  args: { project: draftProject },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Get started');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '31');
  },
};
