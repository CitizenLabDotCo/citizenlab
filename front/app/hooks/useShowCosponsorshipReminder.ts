import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAuthUser from 'api/me/useAuthUser';

export default function useShowCosponsorshipReminder(initiativeId: string) {
  const { data: appConfiguration } = useAppConfiguration();
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: authUser } = useAuthUser();

  if (!initiative || !authUser || !appConfiguration) return false;

  const authorId = initiative.data.relationships.author.data?.id;
  const signedInUserIsAuthor =
    typeof authorId === 'string' ? authorId === authUser.data.id : false;
  const requiredNumberOfCosponsors =
    appConfiguration.data.attributes.settings.initiatives?.cosponsors_number;
  const acceptedCosponsorships =
    initiative.data.attributes.cosponsorships.filter(
      (c) => c.status === 'accepted'
    );

  return signedInUserIsAuthor && typeof requiredNumberOfCosponsors === 'number'
    ? requiredNumberOfCosponsors > acceptedCosponsorships.length
    : false;
}
