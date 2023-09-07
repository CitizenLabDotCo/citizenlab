import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import { IInitiativeCosponsorship } from 'api/initiatives/types';
import UserName from 'components/UI/UserName';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  cosponsorships: IInitiativeCosponsorship[];
}

const ListOfCosponsors = ({ cosponsorships }: Props) => {
  const { formatMessage } = useIntl();
  const acceptedCosponsorships = cosponsorships.filter(
    (c) => c.status === 'accepted'
  );
  const pendingCosponsorships = cosponsorships.filter(
    (c) => c.status === 'pending'
  );
  return (
    <>
      {acceptedCosponsorships.map((cosponsorship, index) => {
        return (
          <Box key={index} display="flex" alignItems="center">
            <Box mr="4px">
              <Avatar userId={cosponsorship.user_id} size={32} />
            </Box>
            <Box mr="4px">
              <UserName userId={cosponsorship.user_id} isLinkToProfile />
            </Box>
          </Box>
        );
      })}
      {pendingCosponsorships.map((cosponsorship, index) => {
        return (
          <Box key={index} display="flex" alignItems="center">
            <Box mr="4px">
              <Avatar userId={cosponsorship.user_id} size={32} />
            </Box>
            <Box mr="4px">
              <UserName userId={cosponsorship.user_id} isLinkToProfile italic />
            </Box>
            {cosponsorship.status === 'pending' && (
              <>
                <Text fontStyle="italic">
                  ({formatMessage(messages.pending)})
                </Text>
              </>
            )}
          </Box>
        );
      })}
    </>
  );
};

export default ListOfCosponsors;
