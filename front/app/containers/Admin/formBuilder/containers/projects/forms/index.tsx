import React, { Fragment } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { useLocation, useParams } from 'react-router-dom';

// components
import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import FormActions from 'containers/Admin/formBuilder/components/FormActions';
import FormResults from 'containers/Admin/formBuilder/components/FormResults';

// i18n
import messages from './messages';

// hooks
import usePhases from 'hooks/usePhases';
import useProject from 'hooks/useProject';

// Utils
import { getFormActionsConfig } from 'containers/Admin/formBuilder/utils';
import { isNilOrError } from 'utils/helperUtils';

// Styles
import { colors } from 'utils/styleUtils';

const Forms = ({ intl: { formatMessage } }: WrappedComponentProps) => {
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
              <Fragment key={index}>
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
              </Fragment>
            );
          }
        )}
      </Box>
    </>
  );
};

export default injectIntl(Forms);
