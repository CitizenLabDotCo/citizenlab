import React from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  stylingConsts,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import citySrc from './city.png';

interface Props {
  title?: string;
  description?: string;
  buttonText?: string;
}

const SpotlightProject = ({ title, description, buttonText }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');

  return (
    <Box px={isSmallerThanTablet ? DEFAULT_PADDING : '40px'} w="100%">
      <Box
        w="100%"
        maxWidth="1000px"
        display="flex"
        flexDirection={isSmallerThanTablet ? 'column' : 'row'}
        justifyContent={isSmallerThanTablet ? 'flex-start' : 'space-between'}
      >
        <Box w={isSmallerThanTablet ? undefined : '500px'}>
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
        <Box
          mt={isSmallerThanTablet ? '20px' : '0px'}
          ml={isSmallerThanTablet ? '0px' : '40px'}
        >
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
    </Box>
  );
};

export default SpotlightProject;
