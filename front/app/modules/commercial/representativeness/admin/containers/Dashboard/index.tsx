import React, { useState } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useUserCustomFields from 'modules/commercial/user_custom_fields/hooks/useUserCustomFields';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ChartFilters from '../../components/ChartFilters';
import ChartCards from './ChartCards';
import EmptyState from './EmptyState';
import Header from './Header';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { hasReferenceData } from './utils';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

const hasAnyReferenceData = (userCustomFields: IUserCustomFieldData[]) =>
  userCustomFields.some(hasReferenceData);

const RepresentativenessDashboard = () => {
  const userCustomFields = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });

  const [currentProjectFilter, setCurrentProjectFilter] = useState<string>();

  const onProjectFilter = ({ value }) => {
    trackEventByName(tracks.filteredOnProject.name, {
      extra: { projectId: value },
    });

    setCurrentProjectFilter(value);
  };

  if (isNilOrError(userCustomFields)) {
    return null;
  }

  const anyReferenceData = hasAnyReferenceData(userCustomFields);

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
  const userCustomFieldsActive = useFeatureFlag({ name: 'user_custom_fields' });
  const representativenessActive = useFeatureFlag({
    name: 'representativeness',
  });

  if (!userCustomFieldsActive || !representativenessActive) {
    return null;
  }

  return <RepresentativenessDashboard />;
};

export default RepresentativenessDashboardFeatureFlagWrapper;
