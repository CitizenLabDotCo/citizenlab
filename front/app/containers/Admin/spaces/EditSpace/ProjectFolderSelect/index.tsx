import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { isFolder } from 'api/admin_publications/utils';

import useLocalize from 'hooks/useLocalize';

import messages from 'containers/Admin/users/messages';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

const ProjectFolderSelect = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPublications, setSelectedPublications] = useState<string[]>(
    []
  );

  const { data: adminPublications } = useAdminPublications({
    rootLevelOnly: true,
  });

  const flatAdminPublications = adminPublications?.pages.flatMap(
    (page) => page.data
  );

  if (!flatAdminPublications) return null;

  const options = flatAdminPublications.map((publication) => ({
    value: publication.id,
    label: isFolder(publication)
      ? `${formatMessage(messages.folder)}: ${localize(
          publication.attributes.publication_title_multiloc
        )}`
      : localize(publication.attributes.publication_title_multiloc),
  }));

  const handleAssign = async () => {
    setIsLoading(true);

    for (const publicationId of selectedPublications) {
      const publication = flatAdminPublications.find(
        (publication) => publication.id === publicationId
      );

      if (!publication) return;

      if (isFolder(publication)) {
        // TODO
      } else {
        // TODO
      }
    }
  };

  return (
    <Box maxWidth="500px">
      <MultipleSelect
        value={selectedPublications}
        options={options}
        onChange={(selectedOptions) =>
          setSelectedPublications(selectedOptions.map((option) => option.value))
        }
        label={formatMessage(messages.selectPublications)}
        placeholder={formatMessage(messages.selectPublicationsPlaceholder)}
      />
    </Box>
  );
};

export default ProjectFolderSelect;
