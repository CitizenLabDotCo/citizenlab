import React from 'react';

import { Box, Icon, Title, colors } from '@citizenlab/cl2-component-library';

import { ICustomPageData } from 'api/custom_pages/types';

import useLocalize from 'hooks/useLocalize';

import Emoji from 'components/UI/Emoji';

import Link, { typedStyled } from 'utils/cl-router/Link';

const Tile = typedStyled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid ${colors.coolGrey300};
  border-radius: 12px;
  position: relative;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: ${colors.grey100};
  }

  &:hover h3 {
    color: ${({ theme }) => theme.colors.tenantPrimary};
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
    <Tile scrollToTop to="/pages/$slug" params={{ slug }}>
      <Box
        flex="0 0 auto"
        w="20px"
        h="20px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {emoji ? (
          <Emoji emoji={emoji} size="20px" />
        ) : (
          <Icon
            name="page"
            width="20px"
            height="20px"
            fill={colors.coolGrey500}
          />
        )}
      </Box>
      <Title variant="h4" as="h3" m="0px" color="tenantText">
        {title}
      </Title>
    </Tile>
  );
};

export default CustomPageCard;
