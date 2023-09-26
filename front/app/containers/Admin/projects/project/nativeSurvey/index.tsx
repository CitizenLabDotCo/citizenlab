import React, { Fragment, useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { useParams, useLocation } from 'react-router-dom';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import FormActions from './FormActions';
import FormResults from './FormResults';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useLocale from 'hooks/useLocale';

// Utils
import { isNilOrError } from 'utils/helperUtils';
import { getFormActionsConfig } from './utils';

// Styles
import { colors } from 'utils/styleUtils';

// Services
import { downloadSurveyResults } from 'api/survey_results/utils';
import useUpdatePhase from 'api/phases/useUpdatePhase';

const Forms = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const { projectId } = useParams() as { projectId: string };
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const locale = useLocale();
  const { pathname } = useLocation();
  const { mutate: updatePhase } = useUpdatePhase();

  if (!project || isNilOrError(locale)) {
    return null;
  }

  const showResults = pathname.includes(
    `/admin/projects/${project.data.id}/native-survey/results`
  );

  const formActionsConfigs = getFormActionsConfig(
    project.data,
    updatePhase,
    phases?.data
  );

  const handleDownloadResults = async () => {
    try {
      setIsDownloading(true);
      await downloadSurveyResults(project.data, locale);
    } catch (error) {
      // Not handling errors for now
    } finally {
      setIsDownloading(false);
    }
  };

  return showResults ? (
    <FormResults />
  ) : (
    <>
      <Box width="100%">
        <Box
          width="100%"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box width="100%">
            <Title>{formatMessage(messages.survey2)}</Title>
            <Text>{formatMessage(messages.surveyDescription2)}</Text>
          </Box>
          {project.data.attributes.process_type === 'timeline' && (
            <Box>
              <Button
                icon="download"
                buttonStyle="secondary"
                width="auto"
                minWidth="312px"
                onClick={handleDownloadResults}
                processing={isDownloading}
              >
                {formatMessage(messages.downloadAllResults2)}
              </Button>
            </Box>
          )}
        </Box>
        {formActionsConfigs.map(
          (
            {
              phaseId,
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
                  phaseId={phaseId}
                  editFormLink={editFormLink}
                  viewFormLink={viewFormLink}
                  viewFormResults={viewFormResults}
                  heading={heading}
                  postingEnabled={postingEnabled}
                  togglePostingEnabled={togglePostingEnabled}
                />
                {index !== formActionsConfigs.length - 1 && (
                  <Box height="1px" border={`1px solid ${colors.divider}`} />
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
