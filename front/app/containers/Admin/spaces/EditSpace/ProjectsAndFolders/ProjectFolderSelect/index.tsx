import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { isFolder } from 'api/admin_publications/utils';
import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';
import useUpdateProject from 'api/projects/useUpdateProject';

import useLocalize from 'hooks/useLocalize';

import userMessages from 'containers/Admin/users/messages';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

const ProjectFolderSelect = () => {
  const { spaceId } = useParams();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPublications, setSelectedPublications] = useState<string[]>(
    []
  );
  const { data: adminPublications } = useAdminPublications({
    rootLevelOnly: true,
  });
  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: updateFolder } = useUpdateProjectFolder();

  const flatAdminPublications = adminPublications?.pages.flatMap(
    (page) => page.data
  );

  if (!flatAdminPublications || !spaceId) return null;

  const options = flatAdminPublications.map((publication) => ({
    value: publication.id,
    label: isFolder(publication)
      ? `${formatMessage(userMessages.folder)}: ${localize(
          publication.attributes.publication_title_multiloc
        )}`
      : localize(publication.attributes.publication_title_multiloc),
  }));

  const handleAssign = async () => {
    setIsLoading(true);
    const promises: Promise<any>[] = [];

    for (const publicationId of selectedPublications) {
      const publication = flatAdminPublications.find(
        (publication) => publication.id === publicationId
      );

      if (!publication) return;

      if (isFolder(publication)) {
        const projectFolderId = publication.relationships.publication.data.id;
        promises.push(updateFolder({ projectFolderId, space_id: spaceId }));
      } else {
        const projectId = publication.relationships.publication.data.id;
        promises.push(updateProject({ projectId, space_id: spaceId }));
      }
    }

    try {
      await Promise.all(promises);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxWidth="500px" mt="32px">
      <MultipleSelect
        value={selectedPublications}
        options={options}
        onChange={(selectedOptions) =>
          setSelectedPublications(selectedOptions.map((option) => option.value))
        }
        label={formatMessage(userMessages.selectPublications)}
        placeholder={formatMessage(userMessages.selectPublicationsPlaceholder)}
      />
      <Box display="flex" mt="12px">
        <Button
          onClick={handleAssign}
          disabled={selectedPublications.length === 0}
          processing={isLoading}
          buttonStyle="admin-dark"
        >
          {formatMessage(messages.add)}
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectFolderSelect;
