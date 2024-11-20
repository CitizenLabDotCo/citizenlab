import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';
import { useParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';

import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

type Props = {
  customFieldId: string;
};

const ViewSingleSubmissionNotice = ({ customFieldId }: Props) => {
  const { formatMessage } = useIntl();

  const { mutate: addAnalysis } = useAddAnalysis();

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: analyses } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });

  const relevantAnalysis =
    analyses?.data &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    analyses?.data?.find(
      (analysis) =>
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        analysis.relationships.main_custom_field?.data?.id === customFieldId
    );

  const goToAnalysis = () => {
    if (relevantAnalysis?.id) {
      clHistory.push(
        `/admin/projects/${projectId}/analysis/${
          relevantAnalysis.id
        }?${stringify({
          phase_id: phaseId,
        })}`
      );
    } else {
      addAnalysis(
        {
          projectId: phaseId ? undefined : projectId,
          phaseId,
          mainCustomField: customFieldId,
        },
        {
          onSuccess: (response) => {
            clHistory.push(
              `/admin/projects/${projectId}/analysis/${
                response.data.id
              }?${stringify({ phase_id: phaseId })}`
            );
          },
        }
      );
    }
  };

  return (
    <Box
      display="flex"
      width="720px"
      border={`1px solid ${colors.primary}`}
      p="12px"
      mb="16px"
    >
      <Icon
        width="32px"
        height="32px"
        mr="12px"
        my="auto"
        name="info-outline"
        fill={colors.primary}
      />
      <Box display="flex" gap="16px">
        <Text color="primary" fontSize="s" m="0px" mt="4px">
          {formatMessage(messages.viewIndividualSubmissions)}
        </Text>
        <Button
          onClick={goToAnalysis}
          fontSize="14px"
          buttonStyle="admin-dark-outlined"
        >
          {formatMessage(messages.aiAnalysis)}
        </Button>
      </Box>
    </Box>
  );
};

export default ViewSingleSubmissionNotice;
