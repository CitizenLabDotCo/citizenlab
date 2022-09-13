import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { useParams, useLocation } from 'react-router-dom';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import FormActions from 'containers/Admin/formBuilder/components/FormActions';
import FormResults from 'containers/Admin/formBuilder/components/FormResults';

// i18n
import messages from './messages';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

// Utils
import { isNilOrError } from 'utils/helperUtils';
import { getFormActionsConfig } from 'containers/Admin/formBuilder/utils';

// Styles
import { colors } from 'utils/styleUtils';

const Forms = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const { projectId } = useParams() as { projectId: string };
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const { pathname } = useLocation();

  if (isNilOrError(project)) {
    return null;
  }

  const showResults = pathname.includes(
    `/admin/projects/${project.id}/native-survey/results`
  );

  const formActionsConfigs = getFormActionsConfig(project, phases);

  return showResults ? (
    <FormResults />
  ) : (
    <>
      <Box width="100%">
        <Box width="100%">
          <Title>{formatMessage(messages.survey)}</Title>
          <Text>{formatMessage(messages.surveyDescription)}</Text>
        </Box>
        {formActionsConfigs.map(
          (
            {
              editFormLink,
              viewFormLink,
              viewFormResults,
              heading,
              postingEnabled,
              togglePostingEnabled,
            },
            index
          ) => {
            return (
              <>
                <FormActions
                  editFormLink={editFormLink}
                  viewFormLink={viewFormLink}
                  viewFormResults={viewFormResults}
                  heading={heading}
                  postingEnabled={postingEnabled}
                  togglePostingEnabled={togglePostingEnabled}
                />
                {index !== formActionsConfigs.length - 1 && (
                  <Box height="1px" border={`1px solid ${colors.separation}`} />
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
