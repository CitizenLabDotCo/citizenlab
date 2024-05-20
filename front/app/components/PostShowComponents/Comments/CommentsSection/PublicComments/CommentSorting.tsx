import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { CommentsSort } from 'api/comments/types';

import FilterSelector from 'components/FilterSelector';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  onChange: (value: CommentsSort) => void;
  selectedCommentSort: CommentsSort;
  className?: string;
}

const CommentSorting = ({
  onChange,
  selectedCommentSort,
  className,
}: Props) => {
  const { formatMessage } = useIntl();

  const handleOnChange = (selectedValue: [CommentsSort]) => {
    onChange(selectedValue[0]);
  };

  const sortOptionsMessages: { [key in CommentsSort]: MessageDescriptor } = {
    // '-new' = least recent (date posted, descending)
    // is the default value we get from the parent
    '-new': messages.leastRecent,
    // 'new' = most recent (date posted, ascending)
    new: messages.mostRecent,
    // '-likes_count' = most reactions (reactions, descending)
    '-likes_count': messages.mostLiked,
  };

  const getSortOptions = () => {
    const sortOptions: CommentsSort[] = ['-new', 'new', '-likes_count'];
    return sortOptions.map((sortOption) => {
      return {
        text: <FormattedMessage {...sortOptionsMessages[sortOption]} />,
        value: sortOption,
      };
    });
  };

  return (
    <Box className={className}>
      <ScreenReaderOnly aria-live="assertive">
        <FormattedMessage
          {...messages.a11y_commentsHaveChanged}
          values={{
            sortOder: formatMessage(sortOptionsMessages[selectedCommentSort]),
          }}
        />
      </ScreenReaderOnly>
      <FilterSelector
        id="e2e-comments-sort-filter"
        title={<FormattedMessage {...messages.commentsSortTitle} />}
        name="sort"
        selected={[selectedCommentSort]}
        values={getSortOptions()}
        onChange={handleOnChange}
        multipleSelectionAllowed={false}
        width="180px"
        right="-10px"
        mobileRight="0"
      />
    </Box>
  );
};

export default CommentSorting;
