import React from 'react';

import { Table, Thead, Tbody, Tr, Th, Td } from './';

export default {
  title: 'Components/Table',
  component: Table,
};

export const Default = {
  render: () => (
    <Table>
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
    </Table>
  ),
};

export const WithInnerBorders = {
  render: () => (
    <Table
      innerBorders={{
        headerCells: true,
        bodyRows: true,
      }}
    >
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
    </Table>
  ),
  name: 'With inner borders',
};

export const WithSortableAndTooltipIcons = {
  render: () => (
    <Table>
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
    </Table>
  ),

  name: 'With sortable and tooltip icons',
};

export const WithTrBackgrounds = {
  render: () => (
    <Table>
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
    </Table>
  ),

  name: 'With Tr backgrounds',
};
