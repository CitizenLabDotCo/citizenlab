import React from 'react';

import {
  OptionList as LibraryOptionList,
  OptionListOption,
  OptionListProps,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export type Option = OptionListOption;

type Props = Omit<OptionListProps, 'searchPlaceholder' | 'noMatchesText'>;

const OptionList = (props: Props) => {
  const { formatMessage } = useIntl();

  return (
    <LibraryOptionList
      {...props}
      searchPlaceholder={formatMessage(messages.searchOptions)}
      noMatchesText={formatMessage(messages.noMatchingOptions)}
    />
  );
};

export default OptionList;
