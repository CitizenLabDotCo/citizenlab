import React from 'react';

import {
  Box,
  Button,
  Text,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import PageContainer from 'components/UI/PageContainer';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

type Props = {
  project: IProjectData;
};

const SurveySubmittedNotice = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const isMobileOrSmaller = useBreakpoint('phone');

  return (
    <main>
      <PageContainer>
        <Box mx="auto">
          <Title mt={isMobileOrSmaller ? '80px' : '160px'} textAlign="center">
            {formatMessage(messages.surveySubmittedTitle)}
          </Title>
          <Text m="0px" textAlign="center">
            {formatMessage(messages.surveySubmittedDescription)}
          </Text>
          <Text mt="4px" mb="24px" textAlign="center">
            {formatMessage(messages.thanksForResponse)}
          </Text>
          <Box display="flex" justifyContent="center">
            <Button
              icon="arrow-left"
              pl="12px"
              onClick={() => {
                clHistory.push(`/projects/${project.attributes.slug}`);
              }}
            >
              {formatMessage(messages.returnToProject)}
            </Button>
          </Box>
        </Box>
      </PageContainer>
    </main>
  );
};

export default SurveySubmittedNotice;
