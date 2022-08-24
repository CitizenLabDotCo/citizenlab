import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';

// components
import { Toggle, Box, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// routing
import clHistory from 'utils/cl-router/history';

// i18n
import messages from './messages';

// hooks
import useProject from 'hooks/useProject';
import { updateProject } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';

const Forms = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const { projectId } = useParams() as { projectId: string };
  const project = useProject({ projectId });

  const toggleSubmissionsEnabled = () => {
    if (!isNilOrError(project)) {
      updateProject(projectId, {
        posting_enabled: !project?.attributes.posting_enabled,
      });
    }
  };

  return (
    <Box width="100%">
      <Box display="flex" flexDirection="row" width="100%" mb="48px">
        <Box width="100%">
          <Title>{formatMessage(messages.survey)}</Title>
          <Text>{formatMessage(messages.surveyDescription)}</Text>
        </Box>
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {project?.attributes.posting_enabled !== undefined && (
            <Toggle
              checked={project?.attributes.posting_enabled}
              label={formatMessage(messages.openForSubmissions)}
              onChange={() => {
                toggleSubmissionsEnabled();
              }}
            />
          )}
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        width="100%"
        justifyContent="space-between"
      >
        <Button
          icon="download"
          buttonStyle="primary"
          width="auto"
          minWidth="312px"
        >
          {formatMessage(messages.downloadSurveyResults, {
            count: 956, // TODO: Get this from the API
          })}
        </Button>
        <Button
          icon="edit"
          buttonStyle="primary"
          width="auto"
          minWidth="312px"
          onClick={() => {
            clHistory.push(`/admin/projects/${projectId}/native-survey/edit`);
          }}
        >
          {formatMessage(messages.editSurveyContent)}
        </Button>
        <Button
          linkTo={`/projects/${project?.attributes.slug}/ideas/new`}
          icon="eye"
          openLinkInNewTab
          buttonStyle="primary"
          width="auto"
          minWidth="312px"
        >
          {formatMessage(messages.viewSurveyText)}
        </Button>
      </Box>
    </Box>
  );
};

export default injectIntl(Forms);
