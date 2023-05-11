import React, { useEffect, useState } from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import {
  IdeaDefaultSortMethod,
  ideaDefaultSortMethodFallback,
} from 'services/participationContexts';
import { IProjectData } from 'api/projects/types';
import { TPhase } from 'hooks/usePhase';
import { getMethodConfig } from 'utils/participationMethodUtils';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  id?: string | undefined;
  alignment: 'left' | 'right';
  onChange: (value: string) => void;
  defaultSortingMethod?: IdeaDefaultSortMethod;
  phase?: TPhase | null;
  project?: Error | IProjectData | null;
};

const SortFilterDropdown = ({
  alignment,
  onChange,
  defaultSortingMethod,
  phase,
  project,
}: Props) => {
  const [selectedValue, setSelectedValue] = useState<string[]>([
    defaultSortingMethod || ideaDefaultSortMethodFallback,
  ]);

  useEffect(() => {
    if (defaultSortingMethod) {
      setSelectedValue([defaultSortingMethod]);
    }
  }, [defaultSortingMethod]);

  const handleOnChange = (selectedValue: string[]) => {
    setSelectedValue([selectedValue[0]]);
    onChange(selectedValue[0]);
  };

  const sortTitle = <FormattedMessage {...messages.sortTitle} />;

  let options = [
    { text: <FormattedMessage {...messages.trending} />, value: 'trending' },
    { text: <FormattedMessage {...messages.random} />, value: 'random' },
    { text: <FormattedMessage {...messages.popular} />, value: 'popular' },
    { text: <FormattedMessage {...messages.newest} />, value: 'new' },
    { text: <FormattedMessage {...messages.oldest} />, value: '-new' },
  ];

  if (!isNilOrError(project)) {
    const config = getMethodConfig(
      !isNilOrError(phase)
        ? phase.attributes.participation_method
        : project.attributes.participation_method
    );
    if (config?.postSortingOptions) {
      options = config.postSortingOptions;
    }
  }

  return (
    <FilterSelector
      id="e2e-ideas-sort-dropdown"
      title={sortTitle}
      name="sort"
      selected={selectedValue}
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
