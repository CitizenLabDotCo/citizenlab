import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeStatus from 'api/initiative_statuses/useInitiativeStatus';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAuthUser from 'api/me/useAuthUser';
import useInitiativeReviewRequired from './useInitiativeReviewRequired';
import useInitiativeCosponsorsRequired from './useInitiativeCosponsorsRequired';

function useShowCosponsorshipReminder(initiativeId: string) {
  const { data: appConfiguration } = useAppConfiguration();
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: authUser } = useAuthUser();
  const initiativeCosponsorsRequired = useInitiativeCosponsorsRequired();
  const requireReview = useInitiativeReviewRequired();
  const initiativeStatusId =
    initiative?.data.relationships.initiative_status?.data?.id;
  const { data: initiativeStatus } = useInitiativeStatus(initiativeStatusId);

  if (!initiative || !authUser || !appConfiguration || !initiativeStatus) {
    return false;
  }

  const authorId = initiative.data.relationships.author.data?.id;
  const signedInUserIsAuthor =
    typeof authorId === 'string' ? authorId === authUser.data.id : false;
  const requiredNumberOfCosponsors =
    appConfiguration.data.attributes.settings.initiatives.cosponsors_number;
  const acceptedCosponsorships =
    initiative.data.attributes.cosponsorships.filter(
      (c) => c.status === 'accepted'
    );
  const initiativeStatusCode = initiativeStatus.data.attributes.code;
  const initiativeHasBeenPublished =
    initiativeStatusCode !== 'review_pending' &&
    initiativeStatusCode !== 'changes_requested';

  return (
    initiativeCosponsorsRequired &&
    requireReview &&
    signedInUserIsAuthor &&
    typeof requiredNumberOfCosponsors === 'number' &&
    // Showing this warning only makes sense if proposal pre-approval/review
    // is enabled. Otherwise, proposals are published immediately anyway.
    requiredNumberOfCosponsors > acceptedCosponsorships.length &&
    !initiativeHasBeenPublished
  );
}

export default useShowCosponsorshipReminder;
