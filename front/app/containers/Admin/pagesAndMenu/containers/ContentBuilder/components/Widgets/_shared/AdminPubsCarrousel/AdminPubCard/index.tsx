import React from 'react';

import { Box, Text, Icon, Title } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import AvatarBubbles from 'components/AvatarBubbles';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { truncate } from 'utils/textUtils';

import { CardContainer, CardImage } from '../../BaseCard';
import { CARD_WIDTH } from '../constants';

import messages from './messages';

interface Props {
  publicationUrl: RouteType;
  imageUrl?: string;
  publicationTitle: string;
  projectCount?: number;
  avatarIds?: string[];
  description: string;
  ml?: string;
  mr?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLAnchorElement> &
    React.KeyboardEventHandler<HTMLDivElement>;
}

const AdminPubCard = ({
  publicationUrl,
  imageUrl,
  publicationTitle,
  projectCount,
  avatarIds,
  description,
  ml,
  mr,
  onKeyDown,
}: Props) => {
  const { formatMessage } = useIntl();

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
      <Box display="flex" flexDirection="row" alignItems="center" mt="8px">
        {projectCount && (
          <>
            <Icon
              name="folder-solid"
              height="20px"
              ml="-4px"
              mr="4px"
              mt="0px"
            />
            <Text m="0px" mr="12px">
              {formatMessage(messages.xProjects, {
                numberOfProjects: projectCount,
              })}
            </Text>
          </>
        )}
        <AvatarBubbles
          avatarIds={avatarIds}
          size={16}
          limit={3}
          userCount={10}
        />
      </Box>
      <Text mt="8px">{description}</Text>
    </CardContainer>
  );
};

export default AdminPubCard;
