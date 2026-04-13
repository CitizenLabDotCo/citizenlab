import React, { useState } from 'react';

import useAddSpaceModerator from 'api/space_moderators/useAddSpaceModerator';
import useSpaces from 'api/spaces/useSpaces';
import { IUser, IUserData } from 'api/users/types';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import AssignButton from './AssignButton';

interface Props {
  user: IUserData;
  onClose: () => void;
}

const Spaces = ({ user, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: spaces } = useSpaces();
  const { mutateAsync: addSpaceModerator } = useAddSpaceModerator();

  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);

  const options =
    spaces?.data.map((space) => ({
      value: space.id,
      label: localize(space.attributes.title_multiloc),
    })) ?? [];

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
