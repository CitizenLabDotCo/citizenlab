import React from 'react';

import {
  Box,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useAddSpace from 'api/spaces/useAddSpace';

import useFeatureFlag from 'hooks/useFeatureFlag';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isAdmin } from 'utils/permissions/roles';

import SpaceNameForm from '../_shared/SpaceNameForm';

import messages from './messages';

const goBack = () => {
  clHistory.goBack();
};

const NewSpace = () => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const { mutateAsync: addSpace } = useAddSpace();
  const { data: authUser } = useAuthUser();

  if (!spacesEnabled) return null;
  if (!isAdmin(authUser)) return null;

  const handleAddSpace = async ({ spaceName }: { spaceName: Multiloc }) => {
    const space = await addSpace({ title_multiloc: spaceName });
    clHistory.push(`/admin/projects/spaces/${space.data.id}`);
  };

  return (
    <Box px="92px" py="84px">
      <GoBackButton onClick={goBack} />
      <Box
        bgColor={colors.white}
        border={`1px solid ${colors.borderLight}`}
        borderRadius={stylingConsts.borderRadius}
        mt="20px"
        px="52px"
        py="44px"
      >
        <Title variant="h2" as="h1" color="primary" mt="0px">
          <FormattedMessage {...messages.createANewSpace} />
        </Title>
        <Box mt="80px">
          <SpaceNameForm onSubmit={handleAddSpace} />
        </Box>
      </Box>
    </Box>
  );
};

export default NewSpace;
