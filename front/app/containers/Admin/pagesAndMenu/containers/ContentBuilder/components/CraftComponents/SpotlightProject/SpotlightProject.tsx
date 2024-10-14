import React from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import citySrc from './city.png';

interface Props {
  title?: string;
  description?: string;
  buttonText?: string;
}

const SpotlightProject = ({ title, description, buttonText }: Props) => {
  return (
    <Box px="40px" w="100%">
      <Box
        w="100%"
        maxWidth="1000px"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box w="500px">
          <Title variant="h2" fontSize="xxxxl" mt="0">
            {title ?? 'TODO'}
          </Title>
          {description && <Text>{description}</Text>}
          {buttonText && (
            <Box w="100%" display="flex" mt="20px">
              <Button w="auto">{buttonText}</Button>
            </Box>
          )}
        </Box>
        <img
          src={citySrc}
          width="100%"
          height="100%"
          alt="placeholder"
          style={{
            borderRadius: stylingConsts.borderRadius,
            maxHeight: '300px',
          }}
        />
      </Box>
    </Box>
  );
};

export default SpotlightProject;
