import React from 'react';

// images
import EmptyStateImage from '../../assets/EmptyStateImage.svg';
import EmptyProjectsImageSrc from 'assets/img/landingpage/no_projects_image.svg';

// components
import { Box, Image, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// styling
import styled from 'styled-components';

const StyledImage = styled(Image)`
  filter: drop-shadow(0px 0px 12px rgba(0, 0, 0, 0.25));
`;

const EmptyState = () => {
  return (
    <Box background="white" position="absolute" mb="36px" height="578px">
      <Image alt="" src={EmptyProjectsImageSrc} width="100%" height="auto" />
      <Box position="absolute" top="0px" left="0px" width="100%">
        <Box
          ml="5%"
          width="90%"
          mt="46px"
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
          <StyledImage src={EmptyStateImage} alt="" width="516px" />
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyState;
