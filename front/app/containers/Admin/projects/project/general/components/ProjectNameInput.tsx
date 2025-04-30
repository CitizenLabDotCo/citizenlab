import React from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { Multiloc, CLErrors } from 'typings';

import { IUpdatedProjectProperties } from 'api/projects/types';

import { SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { StyledInputMultiloc } from './styling';

interface Props {
  titleMultiloc: IUpdatedProjectProperties['title_multiloc'];
  titleError: Multiloc | null;
  apiErrors: CLErrors;
  handleTitleMultilocOnChange: (titleMultiloc: Multiloc) => void;
}

const ProjectNameInput = ({
  titleMultiloc,
  titleError,
  apiErrors,
  handleTitleMultilocOnChange,
}: Props) => {
  return (
    <Box mb="20px" className="intercom-projects-new-project-name">
      <SubSectionTitle>
        <FormattedMessage {...messages.projectName} />
        <IconTooltip
          content={<FormattedMessage {...messages.titleLabelTooltip} />}
        />
      </SubSectionTitle>
      <StyledInputMultiloc
        id="e2e-project-title-setting-field"
        type="text"
        valueMultiloc={titleMultiloc}
        label={<FormattedMessage {...messages.titleLabel} />}
        onChange={handleTitleMultilocOnChange}
        errorMultiloc={titleError}
      />
      <Error fieldName="title_multiloc" apiErrors={apiErrors.title_multiloc} />
    </Box>
  );
};

export default ProjectNameInput;
