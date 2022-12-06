import React from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetInitiativeImages, {
  GetInitiativeImagesChildProps,
} from 'resources/GetInitiativeImages';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetRemoteFiles, {
  GetRemoteFilesChildProps,
} from 'resources/GetRemoteFiles';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
// services
import { isAdmin, isSuperAdmin, isModerator } from 'services/permissions/roles';
import { ITopicData } from 'services/topics';
import { PreviousPathnameContext } from 'context';
// libraries
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
// utils
import { isNilOrError, isError } from 'utils/helperUtils';
// style
import { media } from 'utils/styleUtils';
// resources
import HasPermission from 'components/HasPermission';
import PageLayout from 'components/InitiativeForm/PageLayout';
// components
import PageNotFound from 'components/PageNotFound';
import InitiativesEditFormWrapper from './InitiativesEditFormWrapper';
import InitiativesEditMeta from './InitiativesEditMeta';

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

export class InitiativesEditPage extends React.PureComponent<Props> {
  componentDidMount() {
    this.checkPageAccess();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.authUser !== this.props.authUser) {
      this.checkPageAccess();
    }
  }

  checkPageAccess = () => {
    const { authUser } = this.props;
    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) ||
        isModerator({ data: authUser }) ||
        isSuperAdmin({ data: authUser }));

    if (!isPrivilegedUser && authUser === null) {
      clHistory.replace(this.props.previousPathName || '/sign-up');
    }
  };

  onPublished = () => {
    const { initiative } = this.props;
    if (!isNilOrError(initiative)) {
      clHistory.push(`/initiatives/${initiative.attributes.slug}`);
    }
  };

  render() {
    const {
      authUser,
      locale,
      initiative,
      initiativeImages,
      initiativeFiles,
      topics,
    } = this.props;
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
            onPublished={this.onPublished}
            initiativeFiles={initiativeFiles}
            topics={initiativeTopics}
          />
        </PageLayout>
      </HasPermission>
    );
  }
}

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
