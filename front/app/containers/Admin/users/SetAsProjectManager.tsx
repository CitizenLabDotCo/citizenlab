import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAddProjectFolderModerator from 'api/project_folder_moderators/useAddProjectFolderModerator';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';
import { IUserData } from 'api/users/types';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const SetAsProjectManager = ({
  user,
  onClose,
}: {
  user: IUserData;
  onClose: () => void;
}) => {
  const { mutateAsync: addProjectModerator } = useAddProjectModerator();
  const { mutateAsync: addProjectFolderModerator } =
    useAddProjectFolderModerator();
  const [isLoading, setIsLoading] = useState(false);
  const { formatMessage } = useIntl();
  const [selectedPublications, setSelectedPublications] = useState<string[]>(
    []
  );
  const localize = useLocalize();
  const { data: adminPublications } = useAdminPublications({});
  const flatAdminPublications = adminPublications?.pages.flatMap(
    (page) => page.data
  );

  const isFolder = (publication: IAdminPublicationData) =>
    publication.relationships.publication.data.type === 'folder';

  if (!flatAdminPublications) return null;

  const options = flatAdminPublications?.map((publication) => ({
    value: publication.id,
    label: isFolder(publication)
      ? `${formatMessage(messages.folder)}: ${localize(
          publication.attributes.publication_title_multiloc
        )}`
      : localize(publication.attributes.publication_title_multiloc),
  }));

  const handleAssign = async () => {
    setIsLoading(true);
    try {
      for (const publicationId of selectedPublications) {
        const publication = flatAdminPublications.find(
          (publication) => publication.id === publicationId
        );

        if (!publication) return;

        if (isFolder(publication)) {
          await addProjectFolderModerator({
            projectFolderId: publication.relationships.publication.data.id,
            moderatorId: user.id,
          });
        } else {
          await addProjectModerator({
            projectId: publication.relationships.publication.data.id,
            moderatorId: user.id,
          });
        }
      }
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div>
      <h1>SetAsProjectManager</h1>
      <MultipleSelect
        value={selectedPublications}
        options={options}
        onChange={(selectedOptions) =>
          setSelectedPublications(selectedOptions.map((option) => option.value))
        }
        placeholder="Select projects or folders"
      />
      <Button
        onClick={handleAssign}
        disabled={selectedPublications.length === 0}
        processing={isLoading}
      >
        Set as project manager
      </Button>
    </div>
  );
};

export default SetAsProjectManager;
