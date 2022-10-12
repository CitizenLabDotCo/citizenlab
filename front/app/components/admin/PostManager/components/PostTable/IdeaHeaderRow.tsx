import React, { ChangeEvent, useState } from 'react';

// components
import { Header, Row, HeaderCell } from 'components/admin/Table';
import { Popup } from 'semantic-ui-react';
import Checkbox from 'components/UI/Checkbox';
import { Icon } from '@citizenlab/cl2-component-library';
import FeatureFlag from 'components/FeatureFlag';
import Outlet from 'components/Outlet';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { TableHeaderCellText } from '.';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { insertConfiguration } from 'utils/moduleUtils';
import { roundPercentage } from 'utils/math';

// typings
import {
  CellConfiguration,
  InsertConfigurationOptions,
  Override,
} from 'typings';

const InfoIcon = styled(Icon)`
  fill: ${colors.teal700};
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

interface SortableTableHeaderProps {
  sortAttribute?: string | undefined;
  sortDirection?: 'ascending' | 'descending' | null | undefined;
  onChange: () => void;
  children: React.ReactNode;
}

const SortableTableHeader = ({
  sortAttribute,
  sortDirection,
  onChange,
  children,
}: SortableTableHeaderProps) => (
  <HeaderCell
    clickable
    sortDirection={
      sortAttribute === 'new' && sortDirection ? sortDirection : undefined
    }
    onClick={onChange}
  >
    {children}
  </HeaderCell>
);

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
          <HeaderCell
            clickable
            sortDirection={
              sortAttribute === 'new' && sortDirection
                ? sortDirection
                : undefined
            }
            onClick={onChange}
          >
            <TableHeaderCellText>
              <FormattedMessage {...messages.publication_date} />
            </TableHeaderCellText>
          </HeaderCell>
        );
      },
    },
    {
      name: 'up',
      cellProps: { width: 1 },
      onChange: handleSortClick('upvotes_count'),
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableTableHeader {...props}>
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
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableTableHeader {...props}>
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
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableTableHeader {...props}>
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

  const totalWidth = cells.reduce((acc, cell) => {
    if (typeof cell.cellProps?.width === 'number') {
      return cell.cellProps.width + acc;
    }

    return acc;
  }, 0);

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

    const width = `${roundPercentage(
      typeof cellProps.width === 'number' ? cellProps.width : 1,
      totalWidth
    )}%`;

    const Content = (
      <HeaderCell width={width} key={name}>
        <Component
          sortAttribute={sortAttribute}
          sortDirection={sortDirection}
          allSelected={allSelected}
          {...handlers}
        />
      </HeaderCell>
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
    setCells((cells) => insertConfiguration(insertCellOptions)(cells));
  };

  return (
    <>
      <Outlet
        id="app.components.admin.PostManager.components.PostTable.IdeaHeaderRow.cells"
        onData={handleData}
      />
      <Header background={colors.grey50}>
        <Row>
          {cells.map((cellConfiguration) => renderCell(cellConfiguration))}
        </Row>
      </Header>
    </>
  );
};
