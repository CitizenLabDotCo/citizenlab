import React, { useEffect } from 'react';

// libraries
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// services
import { isAdmin, isSuperAdmin, isRegularUser } from 'utils/permissions/roles';

// resources
import HasPermission from 'components/HasPermission';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { PreviousPathnameContext } from 'context';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useParams } from 'react-router-dom';
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import useInitiativeById from 'api/initiatives/useInitiativeById';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
  previousPathName: string | null;
}

interface Props extends DataProps {}

const InitiativesEditPage = ({ previousPathName, authUser, locale }: Props) => {
  const { initiativeId } = useParams() as {
    initiativeId: string;
  };
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const { data: initiativeImages } = useInitiativeImages(initiativeId);

  useEffect(() => {
    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) ||
        !isRegularUser({ data: authUser }) ||
        isSuperAdmin({ data: authUser }));

    if (!isPrivilegedUser && authUser === null) {
      clHistory.replace(previousPathName || '/sign-up');
    }
  }, [authUser, previousPathName]);

  if (isNilOrError(authUser) || isNilOrError(locale) || !initiative) {
    return null;
  }

  const onPublished = () => {
    if (!isNilOrError(initiative)) {
      clHistory.push(`/initiatives/${initiative.data.attributes.slug}`);
    }
  };

  return (
    <HasPermission item={initiative.data} action="edit" context={initiative}>
      <InitiativesEditMeta />
      <PageLayout
        isAdmin={isAdmin({ data: authUser })}
        className="e2e-initiative-edit-page"
      >
        <StyledInitiativesEditFormWrapper
          locale={locale}
          initiative={initiative.data}
          initiativeImage={initiativeImages?.data[0]}
          onPublished={onPublished}
          initiativeFiles={initiativeFiles}
        />
      </PageLayout>
    </HasPermission>
  );
};

const Data = adopt<DataProps, WithRouterProps>({
  authUser: <GetAuthUser />,
  locale: <GetLocale />,
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
