import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import FormActions from 'containers/Admin/formBuilder/components/FormActions';

// i18n
import messages from './messages';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

// Utils
import { isNilOrError } from 'utils/helperUtils';
import { getFormActionsConfig } from './utils';

const Forms = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const { projectId } = useParams() as { projectId: string };
  const project = useProject({ projectId });
  const phases = usePhases(projectId);

  if (isNilOrError(project)) {
    return null;
  }

  const formActionsConfigs = getFormActionsConfig(project, phases);

  return (
    <>
      <Box width="100%">
        <Box width="100%">
          <Title>{formatMessage(messages.survey)}</Title>
          <Text>{formatMessage(messages.surveyDescription)}</Text>
        </Box>
        {formActionsConfigs.map(
          (
            { editFormLink, heading, postingEnabled, togglePostingEnabled },
            index
          ) => {
            return (
              <>
                <FormActions
                  editFormLink={editFormLink}
                  viewFormLink={`/projects/${project?.attributes.slug}/ideas/new`}
                  heading={heading}
                  postingEnabled={postingEnabled}
                  togglePostingEnabled={togglePostingEnabled}
                />
                {index !== formActionsConfigs.length - 1 && (
                  <Box height="1px" border="1px solid #E0E0E0" />
                )}
              </>
            );
          }
        )}
      </Box>
    </>
  );
};

export default injectIntl(Forms);
