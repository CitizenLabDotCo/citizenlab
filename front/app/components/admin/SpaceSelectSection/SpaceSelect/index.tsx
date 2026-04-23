import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import { SpaceData } from 'api/spaces/types';
import useSpace from 'api/spaces/useSpace';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  spaceId?: string | null;
  spaces: SpaceData[];
  folderId?: string | null;
  role: 'admin' | 'space_moderator';
  onChange: (spaceId: string | null) => void;
}

// This cannot be an empty string
// because that already has a different meaning
// inside of the Select component
const NO_SPACE_ID = '/';

const SpaceSelect = ({ spaceId, spaces, folderId, role, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: folder } = useProjectFolderById(folderId);
  const associatedSpaceId = folder?.data.attributes.space_id;
  const { data: spaceAssociatedWithFolder } = useSpace(associatedSpaceId);

  const getNoSpaceLabel = () => {
    if (folderId) {
      if (associatedSpaceId) {
        if (spaceAssociatedWithFolder) {
          return localize(
            spaceAssociatedWithFolder.data.attributes.title_multiloc
          );
        } else {
          // Fallback message while space is loading
          return formatMessage(messages.sameSpaceAsFolder);
        }
      }

      return formatMessage(messages.noSpaceBecauseOfFolder);
    }

    if (role === 'space_moderator') {
      return formatMessage(messages.pleaseSelectASpace);
    }

    return formatMessage(messages.noSpaceLabel);
  };

  const noSpaceLabel = getNoSpaceLabel();

  const noSpaceOption = { value: NO_SPACE_ID, label: noSpaceLabel };

  const spaceOptions = [
    noSpaceOption,
    ...spaces.map((space) => ({
      value: space.id,
      label: localize(space.attributes.title_multiloc),
    })),
  ];

  const value = spaceId ?? NO_SPACE_ID;

  return (
    <Select
      value={value}
      options={spaceOptions}
      onChange={(option) => {
        const { value } = option;
        const nilValue = value === '' || value === NO_SPACE_ID;
        onChange(nilValue ? null : value);
      }}
      disabled={!!folderId}
    />
  );
};

export default SpaceSelect;
