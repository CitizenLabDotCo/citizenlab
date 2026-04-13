import React, { useState } from 'react';

import useAddSpaceModerator from 'api/space_moderators/useAddSpaceModerator';
import { SpaceData } from 'api/spaces/types';
import useSpaces from 'api/spaces/useSpaces';
import { IUser, IUserData } from 'api/users/types';

import useLocalize, { Localize } from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';
import { ISpaceModeratorRole } from 'utils/permissions/roles';

import messages from '../messages';

import AssignButton from './AssignButton';

interface Props {
  user: IUserData;
  onClose: () => void;
}

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

const Spaces = ({ user, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: spaces } = useSpaces();
  const { mutateAsync: addSpaceModerator } = useAddSpaceModerator();

  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);

  const options =
    getOptions(
      localize,
      formatMessage(messages.alreadyManager),
      spaces?.data,
      user.attributes.roles
    ) || [];
  const assignSMs = async () => {
    const promises: Promise<IUser>[] = [];

    for (const spaceId of selectedSpaces) {
      promises.push(
        addSpaceModerator({
          spaceId,
          user_id: user.id,
        })
      );
    }

    await Promise.all(promises);
  };

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
        onAssign={assignSMs}
      />
    </>
  );
};

export default Spaces;
