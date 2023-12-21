import React, { useEffect } from 'react';

// libraries
import clHistory from 'utils/cl-router/history';

// services
import { isAdmin, isSuperAdmin, isRegularUser } from 'utils/permissions/roles';

// resources
import HasPermission from 'components/HasPermission';
import { PreviousPathnameContext } from 'context';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useParams } from 'react-router-dom';
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import useInitiativeById from 'api/initiatives/useInitiativeById';

// components
import PageNotFound from 'components/PageNotFound';
import InitiativesEditMeta from './InitiativesEditMeta';
import InitiativesEditFormWrapper from './InitiativesEditFormWrapper';
import PageLayout from 'components/InitiativeForm/PageLayout';

// style
import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import useAuthUser from 'api/me/useAuthUser';
import useLocale from 'hooks/useLocale';

const StyledInitiativesEditFormWrapper = styled(InitiativesEditFormWrapper)`
  width: 100%;
  min-width: 530px;
  height: 900px;
  ${media.tablet`
    min-width: 230px;
  `}
`;

const InitiativesEditPage = () => {
  const { initiativeId } = useParams() as {
    initiativeId: string;
  };
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const { data: initiativeImages } = useInitiativeImages(initiativeId);
  const { data: authUser } = useAuthUser();
  const locale = useLocale();
  const previousPathName = React.useContext(PreviousPathnameContext);

  useEffect(() => {
    const isPrivilegedUser =
      authUser &&
      (isAdmin({ data: authUser.data }) ||
        !isRegularUser({ data: authUser.data }) ||
        isSuperAdmin({ data: authUser.data }));

    if (!isPrivilegedUser && authUser === null) {
      clHistory.replace(previousPathName || '/sign-up');
    }
  }, [authUser, previousPathName]);

  if (!authUser || !initiative) {
    return null;
  }

  const onPublished = () => {
    clHistory.push(`/initiatives/${initiative.data.attributes.slug}`);
  };

  return (
    <HasPermission item={initiative.data} action="edit" context={initiative}>
      <InitiativesEditMeta />
      <PageLayout
        isAdmin={isAdmin({ data: authUser.data })}
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

export default () => {
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });

  if (!initiativesEnabled) {
    return <PageNotFound />;
  }

  return <InitiativesEditPage />;
};
