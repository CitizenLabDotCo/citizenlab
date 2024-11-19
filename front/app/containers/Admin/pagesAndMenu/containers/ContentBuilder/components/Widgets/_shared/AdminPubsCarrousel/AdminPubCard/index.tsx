import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import Link from 'utils/cl-router/Link';
import { truncate } from 'utils/textUtils';

import { CardContainer, CardImage } from '../../BaseCard';

const CARD_WIDTH = 376;

interface Props {
  publicationUrl: RouteType;
  publicationTitle: string;
  imageUrl?: string;
  ml?: string;
  mr?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLAnchorElement> &
    React.KeyboardEventHandler<HTMLDivElement>;
}

const AdminPubCard = ({
  publicationUrl,
  publicationTitle,
  imageUrl,
  ml,
  mr,
  onKeyDown,
}: Props) => {
  return (
    <CardContainer
      as={Link}
      tabIndex={0}
      w={`${CARD_WIDTH}px`}
      ml={ml}
      mr={mr}
      to={publicationUrl}
      display="block"
      onKeyDown={onKeyDown}
    >
      <CardImage imageUrl={imageUrl} />
      <Title variant="h4" as="h3" mt="8px" mb="0px">
        {truncate(publicationTitle, 50)}
      </Title>
    </CardContainer>
  );
};

export default AdminPubCard;
