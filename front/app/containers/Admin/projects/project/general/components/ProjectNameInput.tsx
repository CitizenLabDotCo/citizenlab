import React from 'react';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import { StyledSectionField, StyledInputMultiloc } from './styling';
import { SubSectionTitle } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { IUpdatedProjectProperties } from 'api/projects/types';
import { Multiloc, CLErrors } from 'typings';

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
    <StyledSectionField>
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
