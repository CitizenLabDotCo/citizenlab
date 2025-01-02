import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { Multiloc, CLErrors } from 'typings';

import { IUpdatedProjectProperties } from 'api/projects/types';

import { SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { StyledSectionField, StyledInputMultiloc } from './styling';

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
    <StyledSectionField className="intercom-projects-new-project-name">
      <SubSectionTitle>
        <FormattedMessage {...messages.projectName} />
        <IconTooltip
          content={<FormattedMessage {...messages.titleLabelTooltip} />}
        />
      </SubSectionTitle>
      <StyledInputMultiloc
        id="project-title"
        type="text"
        valueMultiloc={titleMultiloc}
        label={<FormattedMessage {...messages.titleLabel} />}
        onChange={handleTitleMultilocOnChange}
        errorMultiloc={titleError}
      />
      <Error fieldName="title_multiloc" apiErrors={apiErrors.title_multiloc} />
    </StyledSectionField>
  );
};

export default ProjectNameInput;
