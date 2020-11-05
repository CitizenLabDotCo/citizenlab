import React from 'react';

// libraries
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

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
import GetResourceFileObjects, {
  GetResourceFileObjectsChildProps,
} from 'resources/GetResourceFileObjects';
import { PreviousPathnameContext } from 'context';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isError } from 'util';

// components
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
  ${media.smallerThanMaxTablet`
    min-width: 230px;
  `}
`;

interface DataProps {
  initiative: GetInitiativeChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
  initiativeFiles: GetResourceFileObjectsChildProps;
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
  topics: <GetTopics exclude_code={'custom'} />,
  initiative: ({ params, render }) => (
    <GetInitiative id={params.initiativeId}>{render}</GetInitiative>
  ),
  initiativeImages: ({ params, render }) => (
    <GetInitiativeImages initiativeId={params.initiativeId}>
      {render}
    </GetInitiativeImages>
  ),
  initiativeFiles: ({ params, render }) => (
    <GetResourceFileObjects
      resourceId={params.initiativeId}
      resourceType="initiative"
    >
      {render}
    </GetResourceFileObjects>
  ),
  previousPathName: ({ render }) => (
    <PreviousPathnameContext.Consumer>
      {render as any}
    </PreviousPathnameContext.Consumer>
  ),
});

export default withRouter((withRouterProps: WithRouterProps) => (
  <Data {...withRouterProps}>
    {(dataProps) => <InitiativesEditPage {...dataProps} />}
  </Data>
));
