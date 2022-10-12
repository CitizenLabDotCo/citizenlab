import React, { ChangeEvent, useState } from 'react';

// components
import { Header, Row, HeaderCell } from 'components/admin/Table';
import Checkbox from 'components/UI/Checkbox';
import { Text } from '@citizenlab/cl2-component-library';
import FeatureFlag from 'components/FeatureFlag';
import Outlet from 'components/Outlet';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

// styling
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

interface SortableHeaderCellProps {
  sortAttribute?: string;
  sortDirection?: 'ascending' | 'descending' | null;
  type: string;
  infoTooltip?: React.ReactChild;
  onChange: () => void;
  children: React.ReactNode;
}

const SortableHeaderCell = ({
  sortAttribute,
  sortDirection,
  type,
  infoTooltip,
  onChange,
  children,
}: SortableHeaderCellProps) => (
  <HeaderCell
    clickable
    sortDirection={
      sortAttribute === type && sortDirection ? sortDirection : undefined
    }
    infoTooltip={infoTooltip}
    onClick={onChange}
  >
    {children}
  </HeaderCell>
);

export type IdeaHeaderCellComponentProps = {
  sortAttribute?: string;
  sortDirection?: 'ascending' | 'descending' | null;
  allSelected?: boolean;
  width: string;
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
          <HeaderCell>
            <Checkbox checked={!!allSelected} onChange={onChange} size="21px" />
          </HeaderCell>
        );
      },
    },
    {
      name: 'title',
      cellProps: { width: 4 },
      Component: () => {
        return (
          <HeaderCell>
            <FormattedMessage {...messages.title} />
          </HeaderCell>
        );
      },
    },
    {
      name: 'published_on',
      cellProps: { width: 2 },
      onChange: handleSortClick('new'),
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableHeaderCell {...props} type="new">
            <FormattedMessage {...messages.publication_date} />
          </SortableHeaderCell>
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
          <SortableHeaderCell {...props} type="upvotes_count">
            <FormattedMessage {...messages.up} />
          </SortableHeaderCell>
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
          <SortableHeaderCell {...props} type="downvotes_count">
            <FormattedMessage {...messages.down} />
          </SortableHeaderCell>
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
          <SortableHeaderCell
            {...props}
            type="baskets_count"
            infoTooltip={
              <Text mb="0px" mt="0px" fontSize="s">
                <FormattedMessage {...messages.pbItemCountTooltip} />
              </Text>
            }
          >
            <FormattedMessage {...messages.participatoryBudgettingPicks} />
          </SortableHeaderCell>
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
      <Component
        sortAttribute={sortAttribute}
        sortDirection={sortDirection}
        allSelected={allSelected}
        width={width}
        {...handlers}
        key={name}
      />
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
