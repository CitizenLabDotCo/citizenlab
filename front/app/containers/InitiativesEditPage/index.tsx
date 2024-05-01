import React, { useEffect } from 'react';

import { Box, Spinner, colors, media } from '@citizenlab/cl2-component-library';
import { PreviousPathnameContext } from 'context';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import { IInitiative } from 'api/initiatives/types';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import PageLayout from 'components/InitiativeForm/PageLayout';
import PageNotFound from 'components/PageNotFound';
import GoBackButton from 'components/UI/GoBackButton';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import clHistory from 'utils/cl-router/history';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { usePermission } from 'utils/permissions';
import { isAdmin, isSuperAdmin, isRegularUser } from 'utils/permissions/roles';

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

interface Props {
  initiative: IInitiative;
}

const InitiativesEditPage = ({ initiative }: Props) => {
  const initiativeId = initiative.data.id;
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const { data: initiativeImages } = useInitiativeImages(initiativeId);
  const { data: authUser } = useAuthUser();
  const locale = useLocale();
  const previousPathName = React.useContext(PreviousPathnameContext);
  const canEditInitiative = usePermission({
    action: 'edit',
    item: initiative.data,
    context: initiative,
  });

  useEffect(() => {
    const isPrivilegedUser =
      isAdmin(authUser) || !isRegularUser(authUser) || isSuperAdmin(authUser);

    if (!isPrivilegedUser && authUser === null) {
      clHistory.replace(previousPathName || '/sign-up');
    }
  }, [authUser, previousPathName]);

  if (!canEditInitiative) return <Unauthorized />;

  if (!authUser) {
    return null;
  }
  const onPublished = () => {
    clHistory.push(`/initiatives/${initiative.data.attributes.slug}`);
  };

  return (
    <>
      <InitiativesEditMeta />
      <Box background={colors.background} p="32px" pb="0">
        <GoBackButton
          onClick={() => {
            clHistory.goBack();
          }}
        />
      </Box>
      <main>
        <PageLayout className="e2e-initiative-edit-page">
          <StyledInitiativesEditFormWrapper
            locale={locale}
            initiative={initiative.data}
            initiativeImage={initiativeImages?.data[0]}
            onPublished={onPublished}
            initiativeFiles={initiativeFiles}
          />
        </PageLayout>
      </main>
    </>
  );
};

export default () => {
  const { initiativeId } = useParams() as {
    initiativeId: string;
  };
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });
  const { data: initiative, status, error } = useInitiativeById(initiativeId);

  if (status === 'loading') {
    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }

  if (!initiativesEnabled) {
    return <PageNotFound />;
  }

  if (status === 'error') {
    if (isUnauthorizedRQ(error)) {
      return <Unauthorized />;
    }

    return <PageNotFound />;
  }

  return <InitiativesEditPage initiative={initiative} />;
};
