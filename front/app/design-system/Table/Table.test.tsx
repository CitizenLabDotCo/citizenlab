import React, { useState } from 'react';

import { Key } from 'react-aria-components';

import { render, screen, userEvent, within } from 'utils/testUtils/rtl';

import Table, {
  Cell,
  ColumnHeader,
  ColumnMenu,
  Row,
  TableBody,
  TableHeader,
} from '.';

const inputs = [
  { id: 'a', title: 'More bike lanes' },
  { id: 'b', title: 'A new playground' },
  { id: 'c', title: 'Longer library hours' },
];

const Inputs = ({
  onAction = () => {},
  onHide,
}: {
  onAction?: () => void;
  onHide?: () => void;
}) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(new Set());

  return (
    <Table
      aria-label="Inputs"
      selection={{
        selectedKeys,
        onSelectionChange: (keys) =>
          setSelectedKeys(
            new Set(keys === 'all' ? inputs.map(({ id }) => id) : keys)
          ),
        selectAll: 'Select all inputs',
        selectRow: 'Select input',
      }}
    >
      <TableHeader>
        <ColumnHeader id="title" isRowHeader showChevron={false}>
          Input
        </ColumnHeader>
        <ColumnHeader
          id="likes"
          sortDirection="descending"
          menu={
            <ColumnMenu
              columnType="number"
              onSortChange={() => {}}
              onHide={onHide}
            />
          }
        >
          Likes
        </ColumnHeader>
      </TableHeader>
      <TableBody>
        {inputs.map(({ id, title }) => (
          <Row key={id} id={id} textValue={title} onAction={onAction}>
            <Cell>{title}</Cell>
            <Cell>1</Cell>
          </Row>
        ))}
      </TableBody>
    </Table>
  );
};

const selectedRows = () =>
  screen
    .getAllByRole('row')
    .filter((row) => row.getAttribute('aria-selected') === 'true')
    .map((row) => within(row).getByRole('rowheader').textContent);

describe('Table sort', () => {
  it('announces the sorted column and checks its order in the menu', async () => {
    const user = userEvent.setup();
    render(<Inputs />);

    expect(screen.getByRole('columnheader', { name: /Likes/ })).toHaveAttribute(
      'aria-sort',
      'descending'
    );
    expect(
      screen.getByRole('columnheader', { name: 'Input' })
    ).not.toHaveAttribute('aria-sort');

    await user.click(screen.getByRole('button', { name: /Likes/ }));
    const [ascending, descending] = screen.getAllByRole('menuitemradio');
    expect(ascending).toHaveAttribute('aria-checked', 'false');
    expect(descending).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.queryByRole('menuitem', { name: 'Hide column' })
    ).not.toBeInTheDocument();
  });

  it('offers Hide column when the column can be hidden', async () => {
    const user = userEvent.setup();
    const onHide = jest.fn();
    render(<Inputs onHide={onHide} />);

    await user.click(screen.getByRole('button', { name: /Likes/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Hide column' }));

    expect(onHide).toHaveBeenCalledTimes(1);
  });
});

describe('Table selection', () => {
  it('ticks a row by its checkbox, named by the row, without running the row action', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    render(<Inputs onAction={onAction} />);

    await user.click(
      screen.getByRole('checkbox', { name: 'Select input A new playground' })
    );

    expect(selectedRows()).toEqual(['A new playground']);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('selects and clears the page from the header checkbox', async () => {
    const user = userEvent.setup();
    render(<Inputs />);
    const selectAll = screen.getByRole('checkbox', {
      name: 'Select all inputs',
    });

    await user.click(selectAll);
    expect(selectedRows()).toHaveLength(3);

    await user.click(selectAll);
    expect(selectedRows()).toEqual([]);
  });

  it('selects a range with Shift-click from the last ticked row', async () => {
    const user = userEvent.setup();
    render(<Inputs />);

    await user.click(
      screen.getByRole('checkbox', { name: 'Select input More bike lanes' })
    );
    await user.keyboard('{Shift>}');
    await user.click(screen.getByText('Longer library hours'));
    await user.keyboard('{/Shift}');

    expect(selectedRows()).toHaveLength(3);
  });
});
