import React from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  Image,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import AvatarBubbles from 'components/AvatarBubbles';

interface Props {
  title: string;
  imgSrc?: string;
  description?: string;
  buttonText?: string;
  avatarIds?: string[];
}

const SpotlightProject = ({
  title,
  imgSrc,
  description,
  buttonText,
  avatarIds,
}: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Box px={isSmallerThanPhone ? DEFAULT_PADDING : '40px'} w="100%">
      <Box
        w="100%"
        maxWidth="1200px"
        display="flex"
        flexDirection={isSmallerThanPhone ? 'column' : 'row'}
        justifyContent={isSmallerThanPhone ? 'flex-start' : 'space-between'}
      >
        <Box w={isSmallerThanPhone ? undefined : '50%'}>
          <Title variant="h2" fontSize="xxxxl" mt="0px" lineHeight="1">
            {title}
          </Title>
          {description && <Text>{description}</Text>}
          {buttonText && (
            <Box w="100%" display="flex" mt="20px">
              <Button w="auto">{buttonText}</Button>
            </Box>
          )}
          {avatarIds && (
            <Box mt="16px">
              <AvatarBubbles
                avatarIds={avatarIds}
                userCount={avatarIds.length}
              />
            </Box>
          )}
        </Box>
        <Box
          mt={isSmallerThanPhone ? '20px' : '0px'}
          ml={isSmallerThanPhone ? '0px' : '40px'}
          w={isSmallerThanPhone ? '100%' : '50%'}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {imgSrc ? (
            <Image src={imgSrc} width="100%" alt="placeholder" />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default SpotlightProject;
