import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import { isProjectModerator } from 'utils/permissions/roles';

import Inner from './Inner';
import messages from './messages';
import { Props, FormSituation } from './types';

const ProjectContextSection = (
  props: Props & {
    formSituation: FormSituation;
  }
) => {
  const { data: authUser } = useAuthUser();

  if (!authUser) return null;
  if (isProjectModerator(authUser)) return null;

  return (
    <Box mb="40px">
      <SubSectionTitle>
        <FormattedMessage {...messages.projectContext} />
      </SubSectionTitle>
      <Inner {...props} />
    </Box>
  );
};

export default ProjectContextSection;
