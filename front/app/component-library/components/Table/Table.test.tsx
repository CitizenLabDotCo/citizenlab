import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import { Table, Thead, Tbody, Tr, Th, Td } from '.';

describe('<Table />', () => {
  it('renders', () => {
    render(
      <Table>
        <Tbody>
          <Tr>
            <Td>Test table</Td>
          </Tr>
        </Tbody>
      </Table>
    );
    expect(screen.getByText('Test table')).toBeInTheDocument();
  });

  it('renders sortDirection icon in Th', () => {
    const { container } = render(
      <Table>
        <Thead>
          <Tr>
            <Th sortDirection="ascending">Test header cell</Th>
          </Tr>
        </Thead>
      </Table>
    );

    expect(screen.getByText('Test header cell')).toBeInTheDocument();
    expect(container.querySelector('.cl-icon')).toBeInTheDocument();
  });

  it('does not give Th cursor: pointer if not clickable', () => {
    render(
      <Table>
        <Thead>
          <Tr>
            <Th>Test header cell</Th>
          </Tr>
        </Thead>
      </Table>
    );

    const headerCell = screen.getByText('Test header cell');
    expect(headerCell).toBeInTheDocument();
    expect(headerCell).not.toHaveStyle('cursor: pointer;');
  });

  it('gives Th cursor: pointer if clickable', () => {
    render(
      <Table>
        <Thead>
          <Tr>
            <Th clickable>Test header cell</Th>
          </Tr>
        </Thead>
      </Table>
    );

    const headerCell = screen.getByText('Test header cell');
    expect(headerCell).toBeInTheDocument();
    expect(headerCell).toHaveStyle('cursor: pointer;');
  });

  it('renders correct background color of Tr', () => {
    const { container } = render(
      <Table>
        <Thead>
          <Tr background="green">
            <Th>Test header cell</Th>
          </Tr>
        </Thead>
      </Table>
    );

    const row = container.querySelector('tr');
    expect(row).toBeInTheDocument();
    expect(row).toHaveStyle('background: green;');
  });
});
