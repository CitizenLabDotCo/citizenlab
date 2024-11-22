import React from 'react';

import { IdeaSortMethod, IPhaseData } from 'api/phases/types';

import FilterSelector from 'components/FilterSelector';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

const optionMessages: { [key in IdeaSortMethod]: MessageDescriptor } = {
  trending: messages.trending,
  random: messages.random,
  popular: messages.popular,
  comments_count: messages.mostDiscussed,
  new: messages.newest,
  '-new': messages.oldest,
};

type Props = {
  id?: string | undefined;
  alignment: 'left' | 'right';
  value: IdeaSortMethod;
  onChange: (value: string) => void;
  phase?: IPhaseData;
};

const SortFilterDropdown = ({ alignment, value, onChange, phase }: Props) => {
  const { formatMessage } = useIntl();
  const handleOnChange = (selectedValue: string[]) => {
    onChange(selectedValue[0]);
  };

  let options = Object.keys(optionMessages).map((key) => {
    return {
      text: <FormattedMessage {...optionMessages[key]} />,
      value: key,
    };
  });

  if (!isNilOrError(phase)) {
    const config = getMethodConfig(phase.attributes.participation_method);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (config?.postSortingOptions) {
      options = config.postSortingOptions;
    }
  }

  return (
    <>
      <ScreenReaderOnly aria-live="assertive">
        <FormattedMessage
          {...messages.a11y_ideasHaveBeenSorted}
          values={{
            sortOder: formatMessage(optionMessages[value]),
          }}
        />
      </ScreenReaderOnly>
      <FilterSelector
        id="e2e-ideas-sort-dropdown"
        title={<FormattedMessage {...messages.sortTitle} />}
        name="sort"
        selected={[value]}
        values={options}
        onChange={handleOnChange}
        multipleSelectionAllowed={false}
        left={alignment === 'left' ? '-5px' : undefined}
        mobileLeft={alignment === 'left' ? '-5px' : undefined}
        right={alignment === 'right' ? '-5px' : undefined}
        mobileRight={alignment === 'right' ? '-5px' : undefined}
      />
    </>
  );
};

export default SortFilterDropdown;
