import React, { ChangeEvent } from 'react';

// components
import {
  Thead,
  Tr,
  Th,
  Checkbox,
  colors,
} from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

// utils
import { roundPercentage } from 'utils/math';

// typings
import { CellConfiguration, Override } from 'typings';
import { Sort as IdeasSort } from 'api/ideas/types';
import { SortDirection } from 'utils/paginationUtils';

// hooks
import usePostManagerColumnFilter from 'hooks/usePostManagerColumnFilter';
import SortableHeaderCell from './SortableHeaderCell';

type IdeaHeaderCellComponentProps = {
  sortAttribute?: IdeasSort;
  sortDirection?: 'ascending' | 'descending' | null;
  allSelected?: boolean;
  width: string;
  onChange?: (event: unknown) => void;
};

interface Props {
  selectedProjectId?: string | null;
  selectedPhaseId?: string | null;
  sortAttribute?: IdeasSort;
  sortDirection?: SortDirection;
  allSelected: boolean;
  toggleSelectAll: () => void;
  handleSortClick: (newSortAttribute: string) => () => void;
}

const IdeaHeaderRow = ({
  selectedPhaseId,
  sortAttribute,
  sortDirection,
  allSelected,
  toggleSelectAll,
  handleSortClick,
}: Props) => {
  const cells = [
    {
      name: 'selection',
      width: 1,
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
      width: 4,
      Component: () => {
        return (
          <Th>
            <FormattedMessage {...messages.title} />
          </Th>
        );
      },
    },
    {
      name: 'assignee',
      width: 2,
      Component: ({ width }) => {
        return (
          <Th width={width}>
            <FormattedMessage {...messages.assignee} />
          </Th>
        );
      },
    },
    {
      name: 'votes',
      width: 1,
      onChange: handleSortClick('votes_count'),
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableHeaderCell {...props} sortAttributeName="votes_count">
            <FormattedMessage {...messages.votes} />
          </SortableHeaderCell>
        );
      },
    },
    {
      name: 'picks',
      width: 1,
      onChange: handleSortClick('baskets_count'),
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableHeaderCell {...props} sortAttributeName="baskets_count">
            <FormattedMessage {...messages.participatoryBudgettingPicks} />
          </SortableHeaderCell>
        );
      },
    },
    {
      name: 'participants',
      width: 1,
      onChange: handleSortClick('baskets_count'),
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableHeaderCell {...props} sortAttributeName="baskets_count">
            <FormattedMessage {...messages.participants} />
          </SortableHeaderCell>
        );
      },
    },
    {
      name: 'budget',
      width: 1,
      onChange: handleSortClick('budget'),
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableHeaderCell {...props} sortAttributeName="budget">
            <FormattedMessage {...messages.cost} />
          </SortableHeaderCell>
        );
      },
    },
    {
      name: 'comments',
      width: 1,
      onChange: handleSortClick('comments_count'),
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableHeaderCell {...props} sortAttributeName="comments_count">
            <FormattedMessage {...messages.comments} />
          </SortableHeaderCell>
        );
      },
    },
    {
      name: 'up',
      width: 1,
      onChange: handleSortClick('likes_count'),
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableHeaderCell {...props} sortAttributeName="likes_count">
            <FormattedMessage {...messages.likes} />
          </SortableHeaderCell>
        );
      },
    },
    {
      name: 'down',
      width: 1,
      onChange: handleSortClick('dislikes_count'),
      Component: (
        props: Override<IdeaHeaderCellComponentProps, { onChange: () => void }>
      ) => {
        return (
          <SortableHeaderCell {...props} sortAttributeName="dislikes_count">
            <FormattedMessage {...messages.dislikes} />
          </SortableHeaderCell>
        );
      },
    },
    {
      name: 'published_on',
      width: 2,
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
  ];

  const displayColumns = usePostManagerColumnFilter(selectedPhaseId);

  const totalWidth = cells.reduce((acc, cell) => {
    return cell.width + acc;
  }, 0);

  const renderCell = ({
    width,
    name,
    Component,
    onChange,
  }: CellConfiguration<IdeaHeaderCellComponentProps>) => {
    return displayColumns.has(name) ? (
      <Component
        sortAttribute={sortAttribute}
        sortDirection={sortDirection}
        allSelected={allSelected}
        width={`${roundPercentage(
          typeof width === 'number' ? width : 1,
          totalWidth
        )}%`}
        onChange={onChange}
        key={name}
      />
    ) : null;
  };

  return (
    <Thead>
      <Tr background={colors.grey50}>
        {cells.map((cellConfiguration) => renderCell(cellConfiguration))}
      </Tr>
    </Thead>
  );
};

export default IdeaHeaderRow;
