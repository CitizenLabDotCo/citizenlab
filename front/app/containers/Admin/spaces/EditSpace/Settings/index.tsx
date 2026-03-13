import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { Multiloc } from 'typings';

import useSpace from 'api/spaces/useSpace';
import useUpdateSpace from 'api/spaces/useUpdateSpace';

import { FormattedMessage } from 'utils/cl-intl';

import SpaceNameForm from '../../_shared/SpaceNameForm';
import messages from '../messages';

const Settings = () => {
  const { spaceId } = useParams();
  const { data: space } = useSpace(spaceId);
  const { mutateAsync: updateSpace } = useUpdateSpace();

  if (!space) return null;

  const handleEditSpace = ({ spaceName }: { spaceName: Multiloc }) => {
    return updateSpace({ id: space.data.id, title_multiloc: spaceName });
  };

  return (
    <Box>
      <Title variant="h2" mt="0px" mb="36px" color="primary">
        <FormattedMessage {...messages.settings} />
      </Title>
      <SpaceNameForm
        spaceName={space.data.attributes.title_multiloc}
        onSubmit={handleEditSpace}
      />
    </Box>
  );
};

export default Settings;
