import React from 'react';

// libraries
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// resources
import HasPermission from 'components/HasPermission';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetInitiativeImages, { GetInitiativeImagesChildProps } from 'resources/GetInitiativeImages';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends DataProps { }

export class InitiativesEditPage extends React.PureComponent<Props> {
  redirectToSignUpPage = () => {
    clHistory.push('/sign-up');
  }
  componentDidMount() {
    const { authUser } = this.props;

    if (authUser === null) {
      this.redirectToSignUpPage();
    }
  }
  componentDidUpdate(prevProps: Props) {
    if (prevProps.authUser !== this.props.authUser && this.props.authUser === null) {
      this.redirectToSignUpPage();
    }
  }

  onPublished = () => {
    const { initiative } = this.props;
    if (!isNilOrError(initiative)) {
      clHistory.push(`/initiatives/${initiative.attributes.slug}`);
    }
  }

  render() {
    const { authUser, locale, initiative, initiativeImages } = this.props;
    if (isNilOrError(authUser) || isNilOrError(locale) || isNilOrError(initiative) || initiativeImages === undefined) return null;

    return (
      <HasPermission item={initiative} action="edit" context={initiative}>
        <InitiativesEditMeta />
        <PageLayout className="e2e-initiative-edit-page">
          <StyledInitiativesEditFormWrapper
            locale={locale}
            initiative={initiative}
            initiativeImage={isNilOrError(initiativeImages) || initiativeImages.length === 0 ? null : initiativeImages[0]}
            onPublished={this.onPublished}
          />
        </PageLayout>
      </HasPermission>
    );
  }
}

const Data = adopt<DataProps, WithRouterProps>({
  authUser: <GetAuthUser />,
  locale: <GetLocale />,
  initiative: ({ params, render }) => <GetInitiative id={params.initiativeId}>{render}</GetInitiative>,
  initiativeImages: ({ params, render }) => (
    <GetInitiativeImages initiativeId={params.initiativeId}>{render}</GetInitiativeImages>
  )
});

export default withRouter((withRouterProps: WithRouterProps) => (
  <Data {...withRouterProps}>
    {dataProps => <InitiativesEditPage {...dataProps} />}
  </Data>
));
