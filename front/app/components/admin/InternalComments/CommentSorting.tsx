import React from 'react';
import FilterSelector from 'components/FilterSelector';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import commentsMessages from 'components/PostShowComponents/Comments/messages';
import { CommentsSort } from 'api/comments/types';
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  onChange: (value: InternalCommentSort) => void;
  selectedCommentSort: InternalCommentSort;
  className?: string;
}

export type InternalCommentSort = '-new' | 'new';

const CommentSorting = ({
  onChange,
  selectedCommentSort,
  className,
}: Props) => {
  const handleOnChange = (selectedValue: [InternalCommentSort]) => {
    onChange(selectedValue[0]);
  };

  const sortOptionsMessages: {
    [key in InternalCommentSort]: MessageDescriptor;
  } = {
    // '-new' = least recent (date posted, descending)
    // is the default value we get from the parent
    '-new': commentsMessages.leastRecent,
    // 'new' = most recent (date posted, ascending)
    new: commentsMessages.mostRecent,
  };

  const getSortOptions = () => {
    const sortOptions: CommentsSort[] = ['-new', 'new'];
    return sortOptions.map((sortOption) => {
      return {
        text: <FormattedMessage {...sortOptionsMessages[sortOption]} />,
        value: sortOption,
      };
    });
  };

  return (
    <Box className={className}>
      <FilterSelector
        id="e2e-comments-sort-filter"
        title={<FormattedMessage {...commentsMessages.commentsSortTitle} />}
        name="sort"
        selected={[selectedCommentSort]}
        values={getSortOptions()}
        onChange={handleOnChange}
        multipleSelectionAllowed={false}
        width="180px"
        right="-10px"
        mobileLeft="-5px"
      />
    </Box>
  );
};

export default CommentSorting;
