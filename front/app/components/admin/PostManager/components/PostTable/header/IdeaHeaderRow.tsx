import React, { ChangeEvent, useState } from 'react';

// components
import {
  Thead,
  Tr,
  Th,
  Text,
  Checkbox,
} from '@citizenlab/cl2-component-library';
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
import { SortAttribute as IdeasSortAttribute } from 'resources/GetIdeas';
import { SortDirection } from 'utils/paginationUtils';

interface SortableHeaderCellProps {
  sortAttribute?: IdeasSortAttribute;
  sortAttributeName: IdeasSortAttribute;
  sortDirection?: 'ascending' | 'descending' | null;
  infoTooltip?: React.ReactChild;
  width: string;
  onChange: () => void;
  children: React.ReactNode;
}

export const SortableHeaderCell = ({
  sortAttribute,
  sortDirection,
  sortAttributeName,
  width,
  infoTooltip,
  onChange,
  children,
}: SortableHeaderCellProps) => {
  return (
    <Th
      clickable
      width={width}
      sortDirection={
        sortAttribute === sortAttributeName && sortDirection
          ? sortDirection
          : undefined
      }
      background={
        sortAttribute === sortAttributeName ? colors.grey200 : undefined
      }
      infoTooltip={infoTooltip}
      onClick={onChange}
    >
      {children}
    </Th>
  );
};

export type IdeaHeaderCellComponentProps = {
  sortAttribute?: IdeasSortAttribute;
  sortDirection?: 'ascending' | 'descending' | null;
  allSelected?: boolean;
  width: string;
  onChange?: (event: unknown) => void;
  onClick?: (event: unknown) => void;
};

interface Props {
  sortAttribute?: IdeasSortAttribute;
  sortDirection?: SortDirection;
  allSelected: boolean;
  toggleSelectAll: () => void;
  handleSortClick: (newSortAttribute: IdeasSortAttribute) => () => void;
}

export default ({
  sortAttribute,
  sortDirection,
  allSelected,
  toggleSelectAll,
  handleSortClick,
}: Props) => {
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
          <Th>
            <Checkbox checked={!!allSelected} onChange={onChange} size="21px" />
          </Th>
        );
      },
    },
    {
      name: 'title',
      cellProps: { width: 4 },
      Component: () => {
        return (
          <Th>
            <FormattedMessage {...messages.title} />
          </Th>
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
          <SortableHeaderCell {...props} sortAttributeName="new">
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
          <SortableHeaderCell {...props} sortAttributeName="upvotes_count">
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
          <SortableHeaderCell {...props} sortAttributeName="downvotes_count">
            <FormattedMessage {...messages.down} />
          </SortableHeaderCell>
        );
      },
    },
    {
      name: 'picks',
      featureFlag: 'participatory_budgeting',
      cellProps: { width: 1 },
      Component: ({ width }) => {
        return (
          <Th
            width={width}
            infoTooltip={
              <Text mb="0px" mt="0px" fontSize="s">
                <FormattedMessage {...messages.pbItemCountTooltip} />
              </Text>
            }
          >
            <FormattedMessage {...messages.participatoryBudgettingPicks} />
          </Th>
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
      <Thead>
        <Tr background={colors.grey50}>
          {cells.map((cellConfiguration) => renderCell(cellConfiguration))}
        </Tr>
      </Thead>
    </>
  );
};
