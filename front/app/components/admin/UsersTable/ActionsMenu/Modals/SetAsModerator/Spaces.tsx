import React, { useState } from 'react';

import { SpaceData } from 'api/spaces/types';
import useSpaces from 'api/spaces/useSpaces';
import { IUserData } from 'api/users/types';

import useLocalize, { Localize } from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';
import { ISpaceModeratorRole } from 'utils/permissions/roles';

import messages from '../messages';

import AssignButton from './AssignButton';

const getOptions = (
  localize: Localize,
  alreadyModeratorString: string,
  spaces?: SpaceData[],
  roles?: IUserData['attributes']['roles']
) => {
  if (!spaces || !roles) return undefined;

  const spacesUserModerates = new Set(
    roles
      .filter(
        (role): role is ISpaceModeratorRole => role.type === 'space_moderator'
      )
      .map((role) => role.space_id)
  );

  const options = spaces.map((space) => {
    const userIsModerator = spacesUserModerates.has(space.id);
    const spaceName = localize(space.attributes.title_multiloc);
    const label = userIsModerator
      ? `${spaceName} (${alreadyModeratorString})`
      : spaceName;

    return {
      value: space.id,
      label,
      disabled: userIsModerator,
    };
  });

  return options;
};

interface Props {
  user: IUserData;
  onClose: () => void;
  onAssign: () => Promise<void>;
  onExceedsSeats: () => void;
}

const Spaces = ({ user, onClose, onAssign, onExceedsSeats }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: spaces } = useSpaces();

  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);

  const options =
    getOptions(
      localize,
      formatMessage(messages.alreadyManager),
      spaces?.data,
      user.attributes.roles
    ) || [];

  return (
    <>
      <MultipleSelect
        value={selectedSpaces}
        options={options}
        onChange={(selectedOptions) => {
          setSelectedSpaces(selectedOptions.map((option) => option.value));
        }}
        label={formatMessage(messages.selectSpaces)}
        placeholder={formatMessage(messages.selectPlaceholder)}
      />
      <AssignButton
        disabled={selectedSpaces.length === 0}
        user={user}
        onClose={onClose}
        onAssign={onAssign}
        onExceedsSeats={onExceedsSeats}
      />
    </>
  );
};

export default Spaces;
