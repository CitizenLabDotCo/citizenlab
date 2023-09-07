import React from 'react';
import { Title } from '@citizenlab/cl2-component-library';
import ListOfCosponsors from './ListOfCosponsors';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import BorderContainer from '../BorderContainer';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import useAuthUser from 'api/me/useAuthUser';
import { isAdmin } from 'services/permissions/roles';

interface Props {
  initiativeId: string;
}

const Cosponsors = ({ initiativeId }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  if (!initiative) return null;

  const authorId = initiative.data.relationships.author.data?.id;
  const authUserId = authUser?.data.id;
  const authUserIsAuthor =
    typeof authUserId === 'string' ? authUserId === authorId : false;
  const showPendingInvites =
    authUserIsAuthor || (authUser && isAdmin({ data: authUser.data }));

  const show = () => {
    if (showPendingInvites) {
      // Any cosponsorhips (accepted or pending)
      return initiative.data.attributes.cosponsorships.length > 0;
    } else {
      // only accepted
      return (
        initiative.data.attributes.cosponsorships.filter(
          (c) => c.status === 'accepted'
        ).length > 0
      );
    }
  };

  if (!show()) {
    return null;
  }

  return (
    <BorderContainer>
      <Title variant="h5" as="h2">
        {formatMessage(messages.titleCosponsorsTile)}
      </Title>
      <ListOfCosponsors
        cosponsorships={
          showPendingInvites
            ? initiative.data.attributes.cosponsorships
            : initiative.data.attributes.cosponsorships.filter(
                (c) => c.status === 'accepted'
              )
        }
      />
    </BorderContainer>
  );
};

export default Cosponsors;
