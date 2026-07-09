import React from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';

import { ICustomPageData } from 'api/custom_pages/types';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Emoji from 'components/UI/Emoji';

import { typedStyled } from 'utils/cl-router/Link';

const Tile = typedStyled(ButtonWithLink)`
   .button {
    align-items: flex-start;
  }
`;

interface Props {
  page: ICustomPageData;
  emoji?: string | null;
}

const CustomPageCard = ({ page, emoji }: Props) => {
  const localize = useLocalize();

  const { slug, title_multiloc } = page.attributes;
  const title = localize(title_multiloc);

  return (
    <Tile
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
      <Box display="flex" alignItems="flex-start" gap="16px" w="100%">
        <Box
          flex="0 0 auto"
          w="20px"
          h="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {emoji && <Emoji emoji={emoji} size="20px" />}
        </Box>
        <Title
          variant="h5"
          as="h3"
          m="0px"
          color="tenantText"
          fontWeight="semi-bold"
        >
          {title}
        </Title>
      </Box>
    </Tile>
  );
};

export default CustomPageCard;
