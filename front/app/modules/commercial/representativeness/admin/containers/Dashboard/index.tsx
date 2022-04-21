import React, { useState } from 'react';
import moment, { Moment } from 'moment';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { GraphsContainer } from 'components/admin/GraphWrappers';
import Header from './Header';
import ChartFilters from '../../components/ChartFilters';

// tracks
// import tracks from './tracks';
// import { trackEventByName } from 'utils/analytics';

const RepresentativenessDashboard = () => {
  const [startAtMoment, setStartAtMoment] = useState<Moment | null>();
  const [endAtMoment, setEndAtMoment] = useState<Moment | null>(moment());
  const [currentProjectFilter, setCurrentProjectFilter] = useState<string>();
  const [currentGroupFilter, setCurrentGroupFilter] = useState<string>();

  const onChangeTimeRange = (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => {
    setStartAtMoment(startAtMoment);
    setEndAtMoment(endAtMoment);
  };

  const onProjectFilter = ({ value }) => {
    setCurrentProjectFilter(value);
  };

  const onGroupFilter = ({ value }) => {
    setCurrentGroupFilter(value);
  };

  return (
    <>
      <Box width="100%">
        <Header />
        <ChartFilters
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          currentProjectFilter={currentProjectFilter}
          currentGroupFilter={currentGroupFilter}
          onChangeTimeRange={onChangeTimeRange}
          onProjectFilter={onProjectFilter}
          onGroupFilter={onGroupFilter}
        />
      </Box>

      <GraphsContainer>{/* TODO */}</GraphsContainer>
    </>
  );
};

const RepresentativenessDashboardFeatureFlagWrapper = () => {
  const customFieldsActive = useFeatureFlag({ name: 'user_custom_fields' });
  const representativenessActive = useFeatureFlag({
    name: 'representativeness',
  });

  if (!customFieldsActive || !representativenessActive) {
    return null;
  }

  return <RepresentativenessDashboard />;
};

export default RepresentativenessDashboardFeatureFlagWrapper;
