import React, { useState } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useUserCustomFields from 'modules/commercial/user_custom_fields/hooks/useUserCustomFields';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import ChartFilters from '../../components/ChartFilters';
import EmptyState from './EmptyState';
import ChartCards from './ChartCards';

// utils
import { isNilOrError } from 'utils/helperUtils';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

const RepresentativenessDashboard = () => {
  const customFields = useUserCustomFields({ inputTypes: ['select'] });
  const anyReferenceDataUploaded =
    !isNilOrError(customFields) &&
    customFields.some(
      ({ relationships }) =>
        relationships && relationships.current_ref_distribution.data.length > 0
    );

  const [currentProjectFilter, setCurrentProjectFilter] = useState<string>();

  const onProjectFilter = ({ value }) => {
    trackEventByName(tracks.filteredOnProject.name, {
      extra: { projectId: value },
    });
    setCurrentProjectFilter(value);
  };

  if (isNilOrError(customFields)) {
    return null;
  }

  return (
    <>
      <Box width="100%" mb="36px">
        <Header />
        <ChartFilters
          currentProjectFilter={currentProjectFilter}
          onProjectFilter={onProjectFilter}
          noData={!anyReferenceDataUploaded}
        />
      </Box>

      <Box>
        {anyReferenceDataUploaded ? (
          <ChartCards projectFilter={currentProjectFilter} />
        ) : (
          <EmptyState />
        )}
      </Box>
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
