import React, { Fragment, useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'utils/cl-intl';

// components
import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import FormActions from 'containers/Admin/formBuilder/components/FormActions';
import FormResults from 'containers/Admin/formBuilder/components/FormResults';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';

// hooks
import usePhases from 'hooks/usePhases';
import useLocale from 'hooks/useLocale';

// Utils
import { getFormActionsConfig } from 'containers/Admin/formBuilder/utils';
import { isNilOrError } from 'utils/helperUtils';

// Styles
import { colors } from 'utils/styleUtils';

// Services
import { downloadSurveyResults } from 'services/formCustomFields';

const Forms = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const { projectId } = useParams() as { projectId: string };
  const [isDownloading, setIsDownloading] = useState(false);
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const locale = useLocale();
  const { pathname } = useLocation();

  if (isNilOrError(project) || isNilOrError(locale)) {
    return null;
  }

  const showResults = pathname.includes(
    `/admin/projects/${project.id}/native-survey/results`
  );

  const formActionsConfigs = getFormActionsConfig(project, phases);

  const handleDownloadResults = async () => {
    try {
      setIsDownloading(true);
      await downloadSurveyResults(project, locale);
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
            <Title>{formatMessage(messages.survey)}</Title>
            <Text>{formatMessage(messages.surveyDescription)}</Text>
          </Box>
          {project.attributes.process_type === 'timeline' && (
            <Box>
              <Button
                icon="download"
                buttonStyle="secondary"
                width="auto"
                minWidth="312px"
                onClick={handleDownloadResults}
                processing={isDownloading}
              >
                {formatMessage(messages.downloadAllResults)}
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
