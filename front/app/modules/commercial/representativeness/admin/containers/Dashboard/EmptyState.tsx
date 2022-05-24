import React from 'react';

// images
import EmptyProjectsImage from 'assets/img/landingpage/no_projects_image.svg';
import EmptyStateImage from '../../assets/empty_status.svg';

// components
import { Box, Image, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

export const StyledBackgroundImage = styled(Image)`
  opacity: 0.5;
  width: 100%;
  height: 100%;
  position: absolute;
`;

const StyledImage = styled(Image)`
  filter: drop-shadow(0px 0px 12px rgba(0, 0, 0, 0.25));
`;

const EmptyState = () => {
  return (
    <Box background="white" mb="36px" position="relative">
      <StyledBackgroundImage alt="" src={EmptyProjectsImage} />
      <Box pt="46px" pb="64px">
        <Box ml="10%" width="80%" mt="0px" px="24px" pt="0px">
          <Title variant="h3" textAlign="center" color="text">
            <FormattedMessage {...messages.emptyStateTitle} />
          </Title>
          <Text textAlign="center" fontSize="base">
            <FormattedMessage {...messages.emptyStateDescription} />
          </Text>

          <Box display="flex" justifyContent="center">
            <Button
              width="164px"
              mb="16px"
              bgColor={colors.adminTextColor}
              linkTo="https://citizenlabco.typeform.com/to/wwXLjcL6"
            >
              <FormattedMessage {...messages.submitBaseDataButton} />
            </Button>
          </Box>
        </Box>

        <Box display="flex" justifyContent="center" mt="23px">
          <StyledImage
            src={EmptyStateImage}
            alt="Representativeness dashboard preview"
            width="516px"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyState;
