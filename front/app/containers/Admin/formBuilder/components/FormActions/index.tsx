import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// components
import { Toggle, Box, Title } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import T from 'components/T';

// routing
import clHistory from 'utils/cl-router/history';

// i18n
import messages from '../messages';
import { Multiloc } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import { useParams } from 'react-router-dom';
import useProject from 'hooks/useProject';
import useFormSubmissionCount from 'hooks/useFormSubmissionCount';

type FormActionsProps = {
  phaseId?: string;
  editFormLink: string;
  viewFormLink: string;
  viewFormResults: string;
  postingEnabled: boolean;
  heading?: Multiloc;
  togglePostingEnabled: () => void;
} & InjectedIntlProps;

const FormActions = ({
  phaseId,
  intl: { formatMessage },
  viewFormLink,
  editFormLink,
  viewFormResults,
  heading,
  postingEnabled,
  togglePostingEnabled,
}: FormActionsProps) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const project = useProject({ projectId });

  const submissionCount = useFormSubmissionCount({
    projectId,
    phaseId,
    projectType: project?.attributes.process_type,
  });

  if (!isNilOrError(submissionCount)) {
    return (
      <Box width="100%" my="60px">
        <Box display="flex" flexDirection="row" width="100%" mb="48px">
          <Box width="100%">
            <Title variant="h4">
              <T value={heading} />
            </Title>
          </Box>
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
          >
            <Toggle
              checked={postingEnabled}
              label={formatMessage(messages.openForSubmissions)}
              onChange={() => {
                togglePostingEnabled();
              }}
            />
          </Box>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
        >
          <Button
            icon="charts"
            buttonStyle="primary"
            width="auto"
            minWidth="312px"
            onClick={() => {
              clHistory.push(viewFormResults);
            }}
          >
            {formatMessage(messages.viewSurveyResults, {
              count: submissionCount.totalSubmissions,
            })}
          </Button>
          <Button
            icon="edit"
            buttonStyle="primary"
            width="auto"
            minWidth="312px"
            onClick={() => {
              clHistory.push(editFormLink);
            }}
          >
            {formatMessage(messages.editSurveyContent)}
          </Button>
          <Button
            linkTo={viewFormLink}
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
  }
  return null;
};

export default injectIntl(FormActions);
