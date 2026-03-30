import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { Multiloc } from 'typings';

import useAddSpaceModerator from 'api/space_moderators/useAddSpaceModerator';
import useSpace from 'api/spaces/useSpace';
import useUpdateSpace from 'api/spaces/useUpdateSpace';

import AddModerator from 'components/admin/AddModerator';
import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import SpaceNameForm from '../../_shared/SpaceNameForm';
import messages from '../messages';

const Settings = () => {
  const { spaceId } = useParams();
  const { data: space } = useSpace(spaceId);
  const { mutateAsync: updateSpace } = useUpdateSpace();
  const { mutateAsync: addSpaceModerator } = useAddSpaceModerator();

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
      <Box mt="48px">
        <SubSectionTitle>
          <FormattedMessage {...messages.spaceManagers} />
        </SubSectionTitle>
        <AddModerator
          spaceId={space.data.id}
          onAddModerator={async (params) => {
            await addSpaceModerator({ spaceId: space.data.id, ...params });
          }}
        />
      </Box>
    </Box>
  );
};

export default Settings;
