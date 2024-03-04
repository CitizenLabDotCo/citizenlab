import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { trackEventByName } from 'utils/analytics';
import { isAdmin } from 'utils/permissions/roles';

import useAuthUser from 'api/me/useAuthUser';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ChartFilters from '../../components/ChartFilters';

import ChartCards from './ChartCards';
import EmptyState from './EmptyState';
import Header from './Header';
import tracks from './tracks';
import { hasReferenceData } from './utils';

// tracks

const hasAnyReferenceData = (userCustomFields: IUserCustomFieldData[]) =>
  userCustomFields.some(hasReferenceData);

const RepresentativenessDashboard = () => {
  const { data: authUser } = useAuthUser();

  const { data: userCustomFields } = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });

  const [currentProjectFilter, setCurrentProjectFilter] = useState<string>();

  const onProjectFilter = ({ value }) => {
    trackEventByName(tracks.filteredOnProject.name, {
      extra: { projectId: value },
    });

    setCurrentProjectFilter(value);
  };

  if (!userCustomFields || !authUser || !isAdmin(authUser)) {
    return null;
  }

  const anyReferenceData = hasAnyReferenceData(userCustomFields.data);

  return (
    <>
      <Box width="100%" mb="36px">
        <Header />
        <ChartFilters
          projectId={currentProjectFilter}
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
  const representativenessActive = useFeatureFlag({
    name: 'representativeness',
  });

  if (!representativenessActive) {
    return null;
  }

  return <RepresentativenessDashboard />;
};

export default RepresentativenessDashboardFeatureFlagWrapper;
