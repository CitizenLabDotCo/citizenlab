import React from 'react';

import {
  Box,
  Text,
  Image,
  useBreakpoint,
  stylingConsts,
  Title,
  colors,
  Shimmer,
} from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import AvatarBubbles from 'components/AvatarBubbles';
import Button from 'components/UI/Button';
import QuillEditedContent from 'components/UI/QuillEditedContent';

interface Props {
  title: string;
  imgSrc?: string;
  imageLoading: boolean;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  avatarIds?: string[];
  userCount?: number;
}

const Spotlight = ({
  title,
  imgSrc,
  imageLoading,
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
      py="56px"
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
        <Box
          w={isSmallerThanPhone ? undefined : '50%'}
          maxWidth={isSmallerThanPhone ? undefined : '400px'}
        >
          <Title mt="0px" color="tenantText">
            {title}
          </Title>
          {description && (
            <Text>
              <QuillEditedContent textColor={colors.textSecondary}>
                <div dangerouslySetInnerHTML={{ __html: description }} />
              </QuillEditedContent>
            </Text>
          )}
          {buttonText && buttonText !== '' && (
            <Box w="100%" display="flex" mt="20px">
              <Button
                w={isSmallerThanPhone ? '100%' : 'auto'}
                linkTo={buttonLink}
              >
                {buttonText}
              </Button>
            </Box>
          )}
          {typeof userCount === 'number' && userCount > 0 && (
            <Box
              mt="16px"
              w="100%"
              display="flex"
              justifyContent={isSmallerThanPhone ? 'center' : 'flex-start'}
            >
              <AvatarBubbles avatarIds={avatarIds} userCount={userCount} />
            </Box>
          )}
        </Box>
        <Box
          mt={isSmallerThanPhone ? '20px' : '0px'}
          w={isSmallerThanPhone ? '100%' : 'calc(100% - 400px)'}
          display="flex"
          justifyContent={isSmallerThanPhone ? 'center' : 'flex-end'}
          alignItems="center"
        >
          {imgSrc ? (
            <Image
              src={imgSrc}
              width="100%"
              maxWidth="630px"
              height={isSmallerThanPhone ? '188px' : '350px'}
              alt="placeholder"
              borderRadius={stylingConsts.borderRadius}
              objectFit="cover"
            />
          ) : (
            <>
              {imageLoading && (
                <Shimmer
                  w="100%"
                  maxWidth="630px"
                  height={isSmallerThanPhone ? '188px' : '350px'}
                  borderRadius={stylingConsts.borderRadius}
                  bgColor={colors.grey300}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Spotlight;
