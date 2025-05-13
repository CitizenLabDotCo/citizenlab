import React from 'react';

import {
  Box,
  Image,
  Title,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import EmptyStateImage from 'assets/img/empty_status.svg';
import EmptyProjectsImage from 'assets/img/landingpage/no_projects_image.svg';
import styled from 'styled-components';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export const StyledBackgroundImage = styled(Image)`
  opacity: 0.5;
  width: 100%;
  height: 100%;
  position: absolute;
`;

const StyledImage = styled(Image)`
  filter: drop-shadow(0px 0px 12px rgba(0, 0, 0, 0.25));
`;

const EmptyState = () => (
  <Box background="white" mb="36px" position="relative">
    <StyledBackgroundImage alt="" src={EmptyProjectsImage} />
    <Box pt="46px" pb="64px">
      <Box ml="10%" width="80%" mt="0px" px="24px" pt="0px">
        <Title variant="h3" textAlign="center" color="textPrimary">
          <FormattedMessage {...messages.emptyStateTitle} />
        </Title>
        <Text textAlign="center" fontSize="base">
          <FormattedMessage {...messages.emptyStateDescription} />
        </Text>

        <Box display="flex" justifyContent="center">
          <Button
            width="auto"
            mb="16px"
            bgColor={colors.primary}
            linkTo="/admin/dashboard/representation/edit-base-data"
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

export default EmptyState;
