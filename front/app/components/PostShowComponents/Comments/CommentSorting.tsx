import React from 'react';
import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { CommentsSort } from 'api/comments/types';
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  onChange: (value: CommentsSort) => void;
  selectedValue: CommentsSort[];
  className?: string;
}

const CommentSorting = ({ onChange, selectedValue, className }: Props) => {
  const handleOnChange = (selectedValue: [CommentsSort]) => {
    onChange(selectedValue[0]);
  };

  const sortOptions: IFilterSelectorValue[] = [
    { text: <FormattedMessage {...messages.mostRecent} />, value: 'new' },
    {
      text: <FormattedMessage {...messages.mostUpvoted} />,
      value: '-upvotes_count',
    },
  ];

  return (
    <Box className={className}>
      <FilterSelector
        id="e2e-comments-sort-filter"
        title={<FormattedMessage {...messages.commentsSortTitle} />}
        name="sort"
        selected={selectedValue}
        values={sortOptions}
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
