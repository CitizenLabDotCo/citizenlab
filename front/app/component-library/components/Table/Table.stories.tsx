import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { Table, Thead, Tbody, Tr, Th, Td } from './';

const meta = {
  title: 'Components/Table',
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
