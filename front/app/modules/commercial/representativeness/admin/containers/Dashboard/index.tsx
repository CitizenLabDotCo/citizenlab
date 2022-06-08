import React, { useState } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useUserCustomFields from 'modules/commercial/user_custom_fields/hooks/useUserCustomFields';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

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

const hasAnyReferenceData = (customFields: IUserCustomFieldData[]) =>
  customFields.some(
    ({ relationships }) =>
      relationships && relationships.current_ref_distribution.data.length > 0
  );

const RepresentativenessDashboard = () => {
  const customFields = useUserCustomFields({ inputTypes: ['select'] });

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

  const anyReferenceData = hasAnyReferenceData(customFields);

  return (
    <>
      <Box width="100%" mb="36px">
        <Header />
        <ChartFilters
          currentProjectFilter={currentProjectFilter}
          onProjectFilter={onProjectFilter}
          noData={!anyReferenceData}
        />
      </Box>

      <Box>
        {anyReferenceData ? (
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
