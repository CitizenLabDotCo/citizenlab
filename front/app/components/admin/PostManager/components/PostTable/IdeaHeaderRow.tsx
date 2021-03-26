import React, { ChangeEvent, useState } from 'react';
import { Table, Popup } from 'semantic-ui-react';
import Checkbox from 'components/UI/Checkbox';
import { FormattedMessage } from 'utils/cl-intl';
import SortableTableHeader from 'components/admin/SortableTableHeader';
import { Icon } from 'cl2-component-library';
import FeatureFlag from 'components/FeatureFlag';
import messages from '../../messages';
import { TableHeaderCellText } from '.';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import {
  CellConfiguration,
  InsertConfigurationOptions,
  Override,
} from 'typings';
import Outlet from 'components/Outlet';
import { insertConfiguration } from 'utils/moduleUtils';

const InfoIcon = styled(Icon)`
  fill: ${colors.clBlueDarker};
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

export type IdeaHeaderCellComponentProps = {
  sortAttribute?: string;
  sortDirection?: 'ascending' | 'descending' | null;
  allSelected?: boolean;
  onChange?: (event: unknown) => void;
  onClick?: (event: unknown) => void;
};

export default ({
  sortAttribute,
  sortDirection,
  allSelected,
  toggleSelectAll,
  handleSortClick,
}) => {
  const [cells, setCells] = useState<
    CellConfiguration<IdeaHeaderCellComponentProps>[]
  >([
    {
      name: 'selection',
      cellProps: { width: 1 },
      onChange: toggleSelectAll,
      Component: ({
        allSelected,
        onChange,
      }: Override<
        IdeaHeaderCellComponentProps,
        { onChange: (event: ChangeEvent<HTMLInputElement>) => void }
      >) => {
        return (
          <Checkbox checked={!!allSelected} onChange={onChange} size="21px" />
        );
      },
    },
    {
      name: 'title',
      cellProps: { width: 4 },
      Component: () => {
        return (
          <TableHeaderCellText>
            <FormattedMessage {...messages.title} />
          </TableHeaderCellText>
        );
      },
    },
    {
      name: 'published_on',
      cellProps: { width: 2 },
      onChange: handleSortClick('new'),
      Component: ({
        sortAttribute,
        sortDirection,
        onChange,
      }: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>) => {
        return (
          <SortableTableHeader
            direction={sortAttribute === 'new' ? sortDirection : null}
            onToggle={onChange}
          >
            <TableHeaderCellText>
              <FormattedMessage {...messages.publication_date} />
            </TableHeaderCellText>
          </SortableTableHeader>
        );
      },
    },
    {
      name: 'up',
      cellProps: { width: 1 },
      onChange: handleSortClick('upvotes_count'),
      Component: ({
        sortAttribute,
        sortDirection,
        onChange,
      }: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>) => {
        return (
          <SortableTableHeader
            direction={sortAttribute === 'upvotes_count' ? sortDirection : null}
            onToggle={onChange}
          >
            <TableHeaderCellText>
              <FormattedMessage {...messages.up} />
            </TableHeaderCellText>
          </SortableTableHeader>
        );
      },
    },
    {
      name: 'down',
      cellProps: { width: 1 },
      onChange: handleSortClick('downvotes_count'),
      Component: ({
        sortAttribute,
        sortDirection,
        onChange,
      }: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>) => {
        return (
          <SortableTableHeader
            direction={
              sortAttribute === 'downvotes_count' ? sortDirection : null
            }
            onToggle={onChange}
          >
            <TableHeaderCellText>
              <FormattedMessage {...messages.down} />
            </TableHeaderCellText>
          </SortableTableHeader>
        );
      },
    },
    {
      name: 'picks',
      featureFlag: 'participatory_budgeting',
      cellProps: { width: 1 },
      Component: ({
        sortAttribute,
        sortDirection,
        onChange,
      }: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>) => {
        return (
          <SortableTableHeader
            direction={sortAttribute === 'baskets_count' ? sortDirection : null}
            onToggle={onChange}
          >
            <TableHeaderCellText>
              <FormattedMessage {...messages.participatoryBudgettingPicks} />
            </TableHeaderCellText>
            <Popup
              content={<FormattedMessage {...messages.pbItemCountTooltip} />}
              trigger={
                <button>
                  <InfoIcon name="info3" />
                </button>
              }
            />
          </SortableTableHeader>
        );
      },
    },
  ]);

  const renderCell = ({
    cellProps = {},
    name,
    Component,
    onChange,
    onClick,
    featureFlag,
  }: CellConfiguration<IdeaHeaderCellComponentProps>) => {
    const handlers = {
      ...(onChange ? { onChange } : {}),
      ...(onClick ? { onClick } : {}),
    };

    const Content = (
      <Table.HeaderCell {...cellProps} key={name}>
        <Component
          sortAttribute={sortAttribute}
          sortDirection={sortDirection}
          allSelected={allSelected}
          {...handlers}
        />
      </Table.HeaderCell>
    );

    if (!featureFlag) return Content;
    return (
      <FeatureFlag name={featureFlag} key={name}>
        {Content}
      </FeatureFlag>
    );
  };

  const handleData = (
    insertCellOptions: InsertConfigurationOptions<
      CellConfiguration<IdeaHeaderCellComponentProps>
    >
  ) => {
    setCells(insertConfiguration(insertCellOptions)(cells));
  };

  return (
    <>
      <Outlet
        id="app.components.admin.PostManager.components.PostTable.IdeaHeaderRow.cells"
        onData={handleData}
      />
      <Table.Header>
        <Table.Row>
          {cells.map((cellConfiguration) => renderCell(cellConfiguration))}
        </Table.Row>
      </Table.Header>
    </>
  );
};
