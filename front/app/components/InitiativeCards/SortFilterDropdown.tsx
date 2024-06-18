import React, { useState, useEffect } from 'react';

import FilterSelector from 'components/FilterSelector';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

export type Sort = 'random' | 'likes_count' | 'new' | '-new';

const optionMessages: { [key in Sort]: MessageDescriptor } = {
  random: messages.random,
  likes_count: messages.popular,
  new: messages.newest,
  '-new': messages.oldest,
};

type Props = {
  alignment: 'left' | 'right';
  defaultSortingMethod?: Sort;
  onChange: (value: Sort) => void;
};

const SortFilterDropdown = ({
  alignment,
  defaultSortingMethod = 'new',
  onChange,
}: Props) => {
  const [sortingMethod, setSortingMethod] = useState<Sort[]>([
    defaultSortingMethod,
  ]);
  const { formatMessage } = useIntl();

  const handleOnChange = (value: Sort[]) => {
    setSortingMethod(value);
    onChange(value[0]);
  };

  const options = Object.keys(optionMessages).map((key) => {
    return {
      text: <FormattedMessage {...optionMessages[key]} />,
      value: key,
    };
  });

  useEffect(() => {
    setSortingMethod([defaultSortingMethod]);
  }, [defaultSortingMethod]);

  return (
    <>
      <ScreenReaderOnly aria-live="assertive">
        <FormattedMessage
          {...messages.a11y_itemsHaveChanged}
          values={{
            sortOder: formatMessage(optionMessages[sortingMethod[0]]),
          }}
        />
      </ScreenReaderOnly>
      <FilterSelector
        id="e2e-initiatives-sort-dropdown"
        title={<FormattedMessage {...messages.sortTitle} />}
        name="sort"
        selected={sortingMethod}
        values={options}
        onChange={handleOnChange}
        multipleSelectionAllowed={false}
        width="180px"
        left={alignment === 'left' ? '-5px' : undefined}
        mobileLeft={alignment === 'left' ? '-5px' : undefined}
        right={alignment === 'right' ? '-5px' : undefined}
        mobileRight={alignment === 'right' ? '-5px' : undefined}
      />
    </>
  );
};

export default SortFilterDropdown;
