import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { Table, Thead, Tbody, Tr, Th, Td } from './';

const meta = {
  title: 'Components/Data display/Table',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: '800px',
    children: (
      <>
        <Thead>
          <Tr>
            <Th>107 ideas</Th>
            <Th>Tags</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Some title</Td>
            <Td>Some tag</Td>
          </Tr>
          <Tr>
            <Td>Idea title</Td>
            <Td>Another tag</Td>
          </Tr>
        </Tbody>
      </>
    ),
  },
};

export const WithInnerBorders: Story = {
  args: {
    ...Default.args,
    innerBorders: {
      headerCells: true,
      bodyRows: true,
    },
  },
};

export const WithSortableAndTooltipIcons: Story = {
  args: {
    width: '800px',
    children: (
      <>
        <Thead>
          <Tr>
            <Th sortDirection="ascending" clickable>
              107 ideas
            </Th>
            <Th infoTooltip="Some info">Tags</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Some title</Td>
            <Td>Some tag</Td>
          </Tr>
          <Tr>
            <Td>Idea title</Td>
            <Td>Another tag</Td>
          </Tr>
        </Tbody>
      </>
    ),
  },
};

export const WithTrBackgrounds: Story = {
  args: {
    width: '800px',
    children: (
      <>
        <Thead>
          <Tr background="lightGrey">
            <Th>107 ideas</Th>
            <Th>Tags</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr background="yellow">
            <Td>Some title</Td>
            <Td>Some tag</Td>
          </Tr>
          <Tr background="pink">
            <Td>Idea title</Td>
            <Td>Another tag</Td>
          </Tr>
        </Tbody>
      </>
    ),
  },
};

export const Hover: Story = {
  ...WithSortableAndTooltipIcons,
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  ...WithSortableAndTooltipIcons,
  parameters: { pseudo: { focus: true, focusVisible: true } },
};

export const Empty: Story = {
  args: {
    width: '800px',
    children: (
      <>
        <Thead>
          <Tr>
            <Th>0 ideas</Th>
            <Th>Tags</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td colSpan={2}>No ideas match the current filters.</Td>
          </Tr>
        </Tbody>
      </>
    ),
  },
};

export const LongContent: Story = {
  args: {
    width: '480px',
    children: (
      <>
        <Thead>
          <Tr>
            <Th>Idea title</Th>
            <Th>Tags</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              Replace the parking spaces along the main street with a wide cycle
              lane, benches and trees for the whole neighbourhood
            </Td>
            <Td>Mobility, public space, climate adaptation, safety</Td>
          </Tr>
          <Tr>
            <Td>Idea_title_without_any_break_that_keeps_going_and_going</Td>
            <Td>Tag</Td>
          </Tr>
        </Tbody>
      </>
    ),
  },
};

export const RTL: Story = {
  args: {
    width: '800px',
    children: (
      <>
        <Thead>
          <Tr>
            <Th>١٠٧ فكرة</Th>
            <Th>الوسوم</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>عنوان الفكرة</Td>
            <Td>وسم</Td>
          </Tr>
        </Tbody>
      </>
    ),
  },
  render: (args) => (
    <div dir="rtl">
      <Table {...args} />
    </div>
  ),
};
