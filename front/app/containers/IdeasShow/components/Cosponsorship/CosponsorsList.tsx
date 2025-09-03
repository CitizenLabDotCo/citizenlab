import React from 'react';

import { Title, Box, Text } from '@citizenlab/cl2-component-library';

import useCosponsorships from 'api/cosponsorship/useCosponsorships';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import { BorderContainer } from './RequestToCosponsor';

const CosponsorsList = ({ ideaId }: { ideaId: string }) => {
  const isCosponsorshipEnabled = useFeatureFlag({
    name: 'input_cosponsorship',
  });
  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const { formatMessage } = useIntl();

  const { data: cosponsors } = useCosponsorships({
    ideaId,
  });

  if (!isCosponsorshipEnabled) {
    return null;
  }

  const viewPendingCosponsors =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    authUser?.data?.id === idea?.data?.relationships?.author?.data?.id ||
    isAdmin(authUser);

  const relevantCosponsors =
    cosponsors?.data.filter(
      (cosponsor) =>
        cosponsor.attributes.status === 'accepted' || // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (viewPendingCosponsors && cosponsor.attributes.status === 'pending')
    ) || [];

  if (relevantCosponsors.length === 0) {
    return null;
  }

  return (
    <BorderContainer>
      <Title variant="h3" mt="0px">
        {formatMessage(messages.cosponsors)}
      </Title>
      {relevantCosponsors.map((cosponsor) => (
        <Box
          display="flex"
          alignItems="center"
          key={cosponsor.id}
          gap="4px"
          mb="4px"
        >
          <Avatar userId={cosponsor.relationships.user.data.id} size={32} />
          <Box display="flex" flexWrap="wrap" gap="4px" alignItems="center">
            <UserName
              userId={cosponsor.relationships.user.data.id}
              isLinkToProfile
            />
            {cosponsor.attributes.status === 'pending' && (
              <Text m="0px">{`(${formatMessage(messages.pending)})`}</Text>
            )}
          </Box>
        </Box>
      ))}
    </BorderContainer>
  );
};

export default CosponsorsList;
