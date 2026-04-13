import React, { useState } from 'react';

import useAddProjectFolderModerator from 'api/project_folder_moderators/useAddProjectFolderModerator';
import useProjectFolders from 'api/project_folders/useProjectFolders';
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

const Folders = ({ user, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: folders } = useProjectFolders({});
  const { mutateAsync: addFolderModerator } = useAddProjectFolderModerator();

  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  const options =
    folders?.data.map((folders) => ({
      value: folders.id,
      label: localize(folders.attributes.title_multiloc),
    })) ?? [];

  const assignFMs = async () => {
    const promises: Promise<IUser>[] = [];

    for (const folderId of selectedFolders) {
      promises.push(
        addFolderModerator({
          projectFolderId: folderId,
          user_id: user.id,
        })
      );
    }

    await Promise.all(promises);
  };

  return (
    <>
      <MultipleSelect
        value={selectedFolders}
        options={options}
        onChange={(selectedOptions) => {
          setSelectedFolders(selectedOptions.map((option) => option.value));
        }}
        label={formatMessage(messages.selectFolders)}
        placeholder={formatMessage(messages.selectPlaceholder)}
      />
      <AssignButton
        disabled={selectedFolders.length === 0}
        user={user}
        onClose={onClose}
        onAssign={assignFMs}
      />
    </>
  );
};

export default Folders;
