import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { Multiloc, CLErrors } from 'typings';

import { IUpdatedProjectProperties } from 'api/projects/types';

import { SubSectionTitle } from 'components/admin/Section';
import ErrorPOC from 'components/UI/ErrorPOC';
import { dedupApiErrors } from 'components/UI/ErrorPOC/utils';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

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
  const { formatMessage } = useIntl();
  const dedupedErrors = dedupApiErrors(apiErrors.title_multiloc);
  const errorMessages = dedupedErrors.map((error) => {
    if (!error) {
      return {
        error: formatMessage(messages.genericErrorMessage),
      };
    }

    switch (error.error) {
      case 'blank':
        return {
          error: formatMessage(messages.blankTitleError),
        };
      default:
        return {
          error: formatMessage(messages.genericErrorMessage),
        };
    }
  });

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
      <ErrorPOC errors={errorMessages} />
    </StyledSectionField>
  );
};

export default ProjectNameInput;
