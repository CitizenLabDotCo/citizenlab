import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import Inner from './Inner';
import messages from './messages';
import { Props } from './types';
import { useCanEditProjectContext } from './utils';

const ProjectContextSection = (props: Props) => {
  const canEditProjectContext = useCanEditProjectContext();

  if (!canEditProjectContext) return null;

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
