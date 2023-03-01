import React, { useEffect } from 'react';

// libraries
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// services
import { isAdmin, isSuperAdmin, isModerator } from 'services/permissions/roles';
import { ITopicData } from 'services/topics';

// resources
import HasPermission from 'components/HasPermission';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetInitiativeImages, {
  GetInitiativeImagesChildProps,
} from 'resources/GetInitiativeImages';
import GetRemoteFiles, {
  GetRemoteFilesChildProps,
} from 'resources/GetRemoteFiles';
import { PreviousPathnameContext } from 'context';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import { isNilOrError, isError } from 'utils/helperUtils';

// components
import PageNotFound from 'components/PageNotFound';
import InitiativesEditMeta from './InitiativesEditMeta';
import InitiativesEditFormWrapper from './InitiativesEditFormWrapper';
import PageLayout from 'components/InitiativeForm/PageLayout';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

const StyledInitiativesEditFormWrapper = styled(InitiativesEditFormWrapper)`
  width: 100%;
  min-width: 530px;
  height: 900px;
  ${media.tablet`
    min-width: 230px;
  `}
`;

interface DataProps {
  initiative: GetInitiativeChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
  initiativeFiles: GetRemoteFilesChildProps;
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
  previousPathName: string | null;
  topics: GetTopicsChildProps;
}

interface Props extends DataProps {}

const InitiativesEditPage = ({
  previousPathName,
  initiative,
  authUser,
  locale,
  initiativeImages,
  initiativeFiles,
  topics,
}: Props) => {
  useEffect(() => {
    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) ||
        isModerator({ data: authUser }) ||
        isSuperAdmin({ data: authUser }));

    if (!isPrivilegedUser && authUser === null) {
      clHistory.replace(previousPathName || '/sign-up');
    }
  }, [authUser]);

  if (
    isNilOrError(authUser) ||
    isNilOrError(locale) ||
    isNilOrError(initiative) ||
    initiativeImages === undefined ||
    initiativeFiles === undefined ||
    isError(initiativeFiles) ||
    isNilOrError(topics)
  ) {
    return null;
  }

  const onPublished = () => {
    if (!isNilOrError(initiative)) {
      clHistory.push(`/initiatives/${initiative.attributes.slug}`);
    }
  };

  const initiativeTopics = topics.filter(
    (topic) => !isNilOrError(topic)
  ) as ITopicData[];
  return (
    <HasPermission item={initiative} action="edit" context={initiative}>
      <InitiativesEditMeta />
      <PageLayout
        isAdmin={isAdmin({ data: authUser })}
        className="e2e-initiative-edit-page"
      >
        <StyledInitiativesEditFormWrapper
          locale={locale}
          initiative={initiative}
          initiativeImage={
            isNilOrError(initiativeImages) || initiativeImages.length === 0
              ? null
              : initiativeImages[0]
          }
          onPublished={onPublished}
          initiativeFiles={initiativeFiles}
          topics={initiativeTopics}
        />
      </PageLayout>
    </HasPermission>
  );
};

const Data = adopt<DataProps, WithRouterProps>({
  authUser: <GetAuthUser />,
  locale: <GetLocale />,
  topics: <GetTopics excludeCode={'custom'} />,
  initiative: ({ params, render }) => (
    <GetInitiative id={params.initiativeId}>{render}</GetInitiative>
  ),
  initiativeImages: ({ params, render }) => (
    <GetInitiativeImages initiativeId={params.initiativeId}>
      {render}
    </GetInitiativeImages>
  ),
  initiativeFiles: ({ params, render }) => (
    <GetRemoteFiles resourceId={params.initiativeId} resourceType="initiative">
      {render}
    </GetRemoteFiles>
  ),
  previousPathName: ({ render }) => (
    <PreviousPathnameContext.Consumer>
      {render as any}
    </PreviousPathnameContext.Consumer>
  ),
});

export default withRouter((withRouterProps: WithRouterProps) => {
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });

  if (!initiativesEnabled) {
    return <PageNotFound />;
  }

  return (
    <Data {...withRouterProps}>
      {(dataProps) => <InitiativesEditPage {...dataProps} />}
    </Data>
  );
});
