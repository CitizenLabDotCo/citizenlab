import React from 'react';

import {
  Box,
  Button,
  Icon,
  Title,
  Image,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import usePhase from 'api/phases/usePhase';

import useInputSchema from 'hooks/useInputSchema';
import useLocalize from 'hooks/useLocalize';

import { PageCategorization } from 'components/Form/typings';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { calculateEstimatedSurveyTime } from 'utils/surveyUtils';

import SentimentQuestionPreview from './assets/SentimentQuestionPreview.png';
import messages from './messages';
import Settings from './Settings';
interface Props {
  title: Multiloc;
  description: Multiloc;
  surveyButtonText: Multiloc;
}

const CommunityMonitorCTA = ({
  title,
  description,
  surveyButtonText,
}: Props) => {
  const theme = useTheme();
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const isTabletOrSmaller = useBreakpoint('tablet');
  const isMobileOrSmaller = useBreakpoint('phone');

  const { data: project } = useCommunityMonitorProject({});
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  // Get the community monitor phase & check if the survey is currently open
  const { data: phase } = usePhase(phaseId);

  const isSurveyLive = phase?.data.attributes.submission_enabled;

  // Get the survey UI schema
  const { uiSchema } = useInputSchema({
    phaseId,
  });

  // Calculate estimated time to complete survey
  const estimatedMinutesToComplete = calculateEstimatedSurveyTime(
    uiSchema as PageCategorization
  );

  const goToCommunityMonitorSurvey = () => {
    if (phaseId) {
      clHistory.push(
        `/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phaseId}`
      );
    }
  };

  if (!isSurveyLive) {
    return null;
  }

  return (
    <Box
      mx="auto"
      w="100%"
      maxWidth="1200px"
      px={isTabletOrSmaller ? '16px' : undefined}
    >
      <Box
        background={theme.colors.tenantPrimaryLighten90}
        w="100%"
        borderRadius="16px"
        p="32px"
        display="flex"
        flexDirection={isTabletOrSmaller ? 'column' : 'row'}
        gap="16px"
      >
        <Box maxWidth={isTabletOrSmaller ? '100%' : '40%'}>
          <Title mt="0px" color="grey800" variant="h2">
            {localize(title)}
          </Title>
          <Text mb="0px">{localize(description)}</Text>
        </Box>

        <Box
          my="auto"
          ml={isTabletOrSmaller ? undefined : 'auto'}
          mx={isMobileOrSmaller ? 'auto' : undefined}
        >
          <Image
            src={SentimentQuestionPreview}
            alt={formatMessage(messages.sentimentQuestionPreviewAltText)}
          />
        </Box>

        <Box
          my="auto"
          ml={isTabletOrSmaller ? undefined : 'auto'}
          mx={isMobileOrSmaller ? 'auto' : undefined}
          width={isMobileOrSmaller ? '100%' : undefined}
        >
          <Box
            display={isMobileOrSmaller ? undefined : 'flex'}
            justifyContent={
              isMobileOrSmaller || !isTabletOrSmaller ? 'center' : undefined
            }
          >
            <Button onClick={goToCommunityMonitorSurvey}>
              {localize(surveyButtonText)}
            </Button>
          </Box>
          <Box
            display="flex"
            justifyContent={
              isMobileOrSmaller || !isTabletOrSmaller ? 'center' : undefined
            }
            mt="8px"
          >
            <Icon
              width="14px"
              fill={theme.colors.tenantPrimary}
              name="clock-circle"
              mr="4px"
            />
            <Text color="tenantPrimary" m="0px" mt="2px" fontSize="s">
              {formatMessage(messages.xMinutesToComplete, {
                minutes: estimatedMinutesToComplete,
              })}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

CommunityMonitorCTA.craft = {
  related: {
    settings: Settings,
  },
};

export const communityMonitorCTATitle = messages.communityMonitorCTATitle;

export default CommunityMonitorCTA;
