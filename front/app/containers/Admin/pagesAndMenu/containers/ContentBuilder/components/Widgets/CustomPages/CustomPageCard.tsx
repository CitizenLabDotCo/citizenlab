import React from 'react';

import { Box, Image, Title, colors } from '@citizenlab/cl2-component-library';

import { ICustomPageData } from 'api/custom_pages/types';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Emoji from 'components/UI/Emoji';

import { CARD_ICON_SIZE } from './constants';

interface Props {
  page: ICustomPageData;
  emoji?: string | null;
  imageUrl?: string | null;
}

const CustomPageCard = ({ page, emoji, imageUrl }: Props) => {
  const localize = useLocalize();

  const { slug, title_multiloc } = page.attributes;
  const title = localize(title_multiloc);
  const iconSize = `${CARD_ICON_SIZE}px`;

  // An uploaded image and an emoji are mutually exclusive, but the image takes
  // precedence if both somehow ended up being set. Either way the icon only
  // repeats what the page title already says, so it is decorative.
  const icon = imageUrl ? (
    <Image src={imageUrl} alt="" w="100%" h="100%" objectFit="contain" />
  ) : emoji ? (
    <Emoji emoji={emoji} size={iconSize} decorative />
  ) : null;

  return (
    <ButtonWithLink
      className="e2e-custom-page-card"
      linkTo={`/pages/${slug}`}
      buttonStyle="text"
      bgHoverColor={colors.grey100}
      borderColor={colors.coolGrey300}
      borderRadius="12px"
      padding="20px"
      justify="left"
      whiteSpace="normal"
      width="100%"
      height="100%"
    >
      <Box display="flex" alignItems="center" gap="16px" w="100%">
        {icon && (
          <Box
            flex="0 0 auto"
            w={iconSize}
            h={iconSize}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {icon}
          </Box>
        )}
        <Title
          variant="h5"
          as="h3"
          m="0px"
          p="0px"
          color="tenantText"
          fontWeight="semi-bold"
          style={{ lineHeight: 1 }}
        >
          {title}
        </Title>
      </Box>
    </ButtonWithLink>
  );
};

export default CustomPageCard;
