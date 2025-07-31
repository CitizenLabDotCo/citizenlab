import React from 'react';

import {
  MultiSelect as MultiSelectComponent,
  MultiSelectProps,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = Omit<
  MultiSelectProps,
  'a11y_clearbuttonActionMessage' | 'a11y_clearSearchButtonActionMessage'
> & {
  a11y_clearbuttonActionMessage?: string;
  a11y_clearSearchButtonActionMessage?: string;
};

const MultiSelect = ({
  a11y_clearbuttonActionMessage,
  a11y_clearSearchButtonActionMessage,
  ...props
}: Props) => {
  const { formatMessage } = useIntl();

  const defaultClearButtonActionMessage = formatMessage(
    messages.clearButtonAction
  );
  const defaultClearSearchButtonActionMessage = formatMessage(
    messages.clearSearchButtonAction
  );

  return (
    <MultiSelectComponent
      {...props}
      a11y_clearbuttonActionMessage={
        a11y_clearbuttonActionMessage ?? defaultClearButtonActionMessage
      }
      a11y_clearSearchButtonActionMessage={
        a11y_clearSearchButtonActionMessage ??
        defaultClearSearchButtonActionMessage
      }
    />
  );
};

export default MultiSelect;
