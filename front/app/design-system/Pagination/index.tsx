import React from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './Pagination.module.css';
import PaginationItem from './PaginationItem';

import '../tokens.css';

type Slot = number | 'ellipsis';

// Five slots between Previous and Next, so the pager keeps its width while paging.
const getSlots = (page: number, pageCount: number): Slot[] => {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  if (page <= 2) return [1, 2, 3, 'ellipsis', pageCount];
  if (page >= pageCount - 1) {
    return [1, 'ellipsis', pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, 'ellipsis', page, 'ellipsis', pageCount];
};

type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

const Pagination = ({ page, pageCount, onChange }: PaginationProps) => {
  const { formatMessage } = useIntl();

  return (
    <nav
      className={styles.pagination}
      aria-label={formatMessage(messages.pagination)}
    >
      <PaginationItem
        kind="previous"
        isDisabled={page <= 1}
        onPress={() => onChange(page - 1)}
      />
      {getSlots(page, pageCount).map((slot, index) =>
        slot === 'ellipsis' ? (
          <PaginationItem key={`ellipsis-${index}`} kind="ellipsis" />
        ) : (
          <PaginationItem
            key={slot}
            number={slot}
            isSelected={slot === page}
            onPress={() => onChange(slot)}
          />
        )
      )}
      <PaginationItem
        kind="next"
        isDisabled={page >= pageCount}
        onPress={() => onChange(page + 1)}
      />
    </nav>
  );
};

export default Pagination;
