import React from 'react';

// images
import EmptyProjectsImageSrc from 'assets/img/landingpage/no_projects_image.svg';
import EmptyStateImage from '../../assets/EmptyStateImage.svg';

// components
import { Box, Image, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// styling
import styled from 'styled-components';

const StyledBackgroundImage = styled(Image)`
  opacity: 0.5;
`;

const StyledImage = styled(Image)`
  filter: drop-shadow(0px 0px 12px rgba(0, 0, 0, 0.25));
`;

const EmptyState = () => {
  return (
    <Box background="white" mb="36px" position="relative">
      <StyledBackgroundImage
        alt=""
        src={EmptyProjectsImageSrc}
        width="100%"
        height="100%"
        position="absolute"
      />
      <Box pt="46px" pb="64px">
        <Box
          ml="5%"
          width="90%"
          mt="0px"
          background="rgba(255, 12, 12, 0.12)"
          border="1px solid #CF4040"
          px="24px"
          pt="0px"
        >
          <Title variant="h3" textAlign="center">
            Please provide a base dataset.
          </Title>
          <Text textAlign="center" fontSize="base">
            This base dataset is required to calculate the representativeness of
            platform users compared to the total population.
          </Text>

          <Box display="flex" justifyContent="center">
            <Button width="164px" text="Submit base data" mb="16px" />
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
