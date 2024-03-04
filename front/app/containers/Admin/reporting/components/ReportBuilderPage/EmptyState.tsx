import React from 'react';

// images

import {
  Box,
  Image,
  Title,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import EmptyProjectsImage from 'assets/img/landingpage/no_projects_image.svg';
import styled from 'styled-components';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import useFeatureFlag from 'hooks/useFeatureFlag';

import sharedMessages from '../../messages';

import messages from './messages';

const StyledBackgroundImage = styled(Image)`
  opacity: 0.5;
  width: 100%;
  height: 100%;
  position: absolute;
`;

interface Props {
  onOpenModal: () => void;
}

const EmptyState = ({ onOpenModal }: Props) => {
  const isReportBuilderAllowed = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed: true,
  });

  return (
    <Box background="white" mb="36px" position="relative" height="460px">
      <StyledBackgroundImage alt="" src={EmptyProjectsImage} />
      <Box
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Title variant="h3" mb="0px">
            <FormattedMessage {...messages.emptyStateTitle} />
          </Title>
          <Text>
            <FormattedMessage {...messages.customizeReport} />
          </Text>
          <Tippy
            maxWidth="250px"
            placement="right-start"
            content={<FormattedMessage {...sharedMessages.contactToAccess} />}
            hideOnClick
            disabled={isReportBuilderAllowed}
          >
            <div>
              <Button
                mt="8px"
                py="6px"
                bgColor={colors.primary}
                onClick={onOpenModal}
                disabled={!isReportBuilderAllowed}
                id="e2e-create-report-button"
              >
                <FormattedMessage {...messages.emptyStateButtonText} />
              </Button>
            </div>
          </Tippy>
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyState;
