import React from 'react';

import {
  Box,
  Title,
  Text,
  Image,
  useBreakpoint,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import AvatarBubbles from 'components/AvatarBubbles';
import Button from 'components/UI/Button';

interface Props {
  title: string;
  imgSrc?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  avatarIds?: string[];
  userCount?: number;
}

const SpotlightProject = ({
  title,
  imgSrc,
  description,
  buttonText,
  buttonLink,
  avatarIds,
  userCount,
}: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      px={DEFAULT_PADDING}
      py={DEFAULT_PADDING}
      w="100%"
      display="flex"
      justifyContent="center"
    >
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
          {buttonText && buttonText !== '' && (
            <Box w="100%" display="flex" mt="20px">
              <Button w="auto" linkTo={buttonLink}>
                {buttonText}
              </Button>
            </Box>
          )}
          {avatarIds && avatarIds.length > 0 && userCount && (
            <Box mt="16px">
              <AvatarBubbles avatarIds={avatarIds} userCount={userCount} />
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
            <Image
              src={imgSrc}
              width="100%"
              alt="placeholder"
              borderRadius={stylingConsts.borderRadius}
            />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default SpotlightProject;
