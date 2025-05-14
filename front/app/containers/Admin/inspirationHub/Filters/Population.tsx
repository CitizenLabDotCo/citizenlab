import React from 'react';

import { PopulationGroup } from 'api/project_library_projects/types';

import FilterSelector from 'components/FilterSelector';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { keys } from 'utils/helperUtils';

import { POPULATION_GROUP_LABELS } from '../constants';
import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';
import tracks from './tracks';

type Option = {
  value: PopulationGroup;
  text: string;
};

const OPTIONS: Option[] = keys(POPULATION_GROUP_LABELS).map((key) => ({
  value: key,
  text: POPULATION_GROUP_LABELS[key],
}));

const Population = () => {
  const { formatMessage } = useIntl();
  const populationGroups = useRansackParam('q[tenant_population_group_in]');

  return (
    <FilterSelector
      multipleSelectionAllowed
      selected={populationGroups ?? []}
      values={OPTIONS}
      onChange={(populationGroups: PopulationGroup[]) => {
        setRansackParam('q[tenant_population_group_in]', populationGroups);
        trackEventByName(tracks.setPopulationGroup, {
          population_groups: JSON.stringify(populationGroups),
        });
      }}
      title={formatMessage(messages.population)}
      name="population-select"
      mr="0px"
    />
  );
};

export default Population;
