import React, { useEffect } from 'react';

// libraries
import { media } from '@citizenlab/cl2-component-library';
import { PreviousPathnameContext } from 'context';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import HasPermission from 'components/HasPermission';
import PageLayout from 'components/InitiativeForm/PageLayout';
import PageNotFound from 'components/PageNotFound';

import clHistory from 'utils/cl-router/history';
import { isAdmin, isSuperAdmin, isRegularUser } from 'utils/permissions/roles';

// resources

import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import InitiativesEditFormWrapper from './InitiativesEditFormWrapper';
import InitiativesEditMeta from './InitiativesEditMeta';

// style

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
