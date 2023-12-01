import React from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { IPhaseData } from 'api/phases/types';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';

export type Sort = 'trending' | 'random' | 'popular' | 'new' | '-new';

type Props = {
  id?: string | undefined;
  alignment: 'left' | 'right';
  value: Sort;
  onChange: (value: string) => void;
  phase?: IPhaseData;
};

const SortFilterDropdown = ({ alignment, value, onChange, phase }: Props) => {
  const handleOnChange = (selectedValue: string[]) => {
    onChange(selectedValue[0]);
  };

  let options = [
    { text: <FormattedMessage {...messages.trending} />, value: 'trending' },
    { text: <FormattedMessage {...messages.random} />, value: 'random' },
    { text: <FormattedMessage {...messages.popular} />, value: 'popular' },
    { text: <FormattedMessage {...messages.newest} />, value: 'new' },
    { text: <FormattedMessage {...messages.oldest} />, value: '-new' },
  ];

  if (!isNilOrError(phase)) {
    const config = getMethodConfig(phase.attributes.participation_method);
    if (config?.postSortingOptions) {
      options = config.postSortingOptions;
    }
  }

  return (
    <FilterSelector
      id="e2e-ideas-sort-dropdown"
      title={<FormattedMessage {...messages.sortTitle} />}
      name="sort"
      selected={[value]}
      values={options}
      onChange={handleOnChange}
      multipleSelectionAllowed={false}
      width="180px"
      left={alignment === 'left' ? '-5px' : undefined}
      mobileLeft={alignment === 'left' ? '-5px' : undefined}
      right={alignment === 'right' ? '-5px' : undefined}
      mobileRight={alignment === 'right' ? '-5px' : undefined}
    />
  );
};

export default SortFilterDropdown;
