import React from 'react';
import { Title } from '@citizenlab/cl2-component-library';
import ListOfCosponsors from './ListOfCosponsors';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import BorderContainer from '../BorderContainer';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import useAuthUser from 'api/me/useAuthUser';

interface Props {
  initiativeId: string;
}

const Cosponsors = ({ initiativeId }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  if (!initiative || !authUser) return null;

  const authorId = initiative.data.relationships.author.data?.id;
  const signedInUserIsAuthor = authorId === authUser.data.id;
  const acceptedCosponsorships =
    initiative.data.attributes.cosponsorships.filter(
      (c) => c.status === 'accepted'
    );

  const show = () => {
    if (signedInUserIsAuthor) {
      return initiative.data.attributes.cosponsorships.length > 0;
    } else {
      return acceptedCosponsorships.length > 0;
    }
  };

  const proposalsToDisplay = () => {
    if (signedInUserIsAuthor) {
      return initiative.data.attributes.cosponsorships;
    } else {
      return acceptedCosponsorships;
    }
  };

  const showComponent = show();

  if (!showComponent) {
    return null;
  }

  return (
    <BorderContainer>
      <Title variant="h5" as="h2">
        {formatMessage(messages.titleCosponsorsTile)}
      </Title>
      <ListOfCosponsors cosponsorships={proposalsToDisplay()} />
    </BorderContainer>
  );
};

export default Cosponsors;
