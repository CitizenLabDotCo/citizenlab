import React from 'react';

// components
import {
  Box,
  Button,
  Text,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

// intl
import ContentContainer from 'components/ContentContainer';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

// util

// types

type Props = {
  project: IProjectData;
};

const SurveyNotActiveNotice = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const isMobileOrSmaller = useBreakpoint('phone');

  return (
    <main>
      <ContentContainer>
        <Title mt={isMobileOrSmaller ? '80px' : '160px'} textAlign="center">
          {formatMessage(messages.surveyNotActiveTitle)}
        </Title>
        <Text mb="30px" textAlign="center">
          {formatMessage(messages.surveyNotActiveDescription)}
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
      </ContentContainer>
    </main>
  );
};

export default SurveyNotActiveNotice;
