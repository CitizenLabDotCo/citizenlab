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

import { CARD_IMAGE_ASPECT_RATIO_STR } from 'api/project_images/useProjectImages';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import AvatarBubbles from 'components/AvatarBubbles';
import Skeleton from 'components/AvatarBubbles/Skeleton';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { DEFAULT_Y_PADDING } from '../constants';

interface Props {
  title: string;
  imgSrc?: string;
  loading: boolean;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  avatarIds?: string[];
  hideAvatars?: boolean;
  userCount?: number;
}

const Spotlight = ({
  title,
  imgSrc,
  loading,
  description,
  buttonText,
  buttonLink,
  avatarIds,
  hideAvatars,
  userCount,
}: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      px={DEFAULT_PADDING}
      pt={isSmallerThanPhone ? DEFAULT_Y_PADDING : '56px'}
      pb="56px"
      w="100%"
      display="flex"
      justifyContent="center"
      className="e2e-spotlight-widget"
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
            <Text as="span">
              <QuillEditedContent textColor={colors.textSecondary}>
                <div dangerouslySetInnerHTML={{ __html: description }} />
              </QuillEditedContent>
            </Text>
          )}
          {buttonText && buttonText !== '' && (
            <Box w="100%" display="flex" mt="20px">
              <ButtonWithLink
                w={isSmallerThanPhone ? '100%' : 'auto'}
                linkTo={buttonLink}
              >
                {buttonText}
              </ButtonWithLink>
            </Box>
          )}

          {!hideAvatars && (
            <Box
              mt="16px"
              w="100%"
              display="flex"
              justifyContent={isSmallerThanPhone ? 'center' : 'flex-start'}
            >
              {loading ? (
                <Skeleton avatarImagesCount={userCount ?? 4} />
              ) : (
                <AvatarBubbles
                  avatarIds={avatarIds}
                  userCount={userCount ?? 4}
                />
              )}
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
            <Box
              width="100%"
              maxWidth="630px"
              aspectRatio={CARD_IMAGE_ASPECT_RATIO_STR}
            >
              <Image
                src={imgSrc}
                alt="placeholder"
                borderRadius={stylingConsts.borderRadius}
                objectFit="cover"
                w="100%"
              />
            </Box>
          ) : (
            <>
              {loading && (
                <Shimmer
                  w="100%"
                  maxWidth="630px"
                  aspectRatio={CARD_IMAGE_ASPECT_RATIO_STR}
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
