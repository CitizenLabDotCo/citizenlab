import React from 'react';

// images
import EmptyProjectsImage from 'assets/img/landingpage/no_projects_image.svg';

// components
import { Box, Image, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Tippy from '@tippyjs/react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import sharedMessages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

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
            <FormattedMessage {...messages.emptyStateDescription} />
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
