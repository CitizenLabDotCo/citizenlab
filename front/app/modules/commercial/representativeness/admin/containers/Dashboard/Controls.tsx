import React from 'react';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Controls = () => {
  const localize = useLocalize();

  const { list: projects } = useAdminPublications({
    publicationStatusFilter: ['published', 'archived'],
    rootLevelOnly: true,
  });

  if (isNilOrError(projects)) return null;

  const projectOptions = projects.map((project) => ({
    value: project.publicationId,
    label: localize(project.attributes.publication_title_multiloc),
  }));

  const onChange = () => {};

  return (
    <Box display="flex" flexDirection="row" mt="36px">
      <Box mr="12px">
        <Select
          options={projectOptions}
          label={<FormattedMessage {...messages.projectSelectLabel} />}
          onChange={onChange}
        />
      </Box>
      <Select
        options={projectOptions}
        label={<FormattedMessage {...messages.userGroupSelectLabel} />}
        onChange={onChange}
      />
    </Box>
  );
};

export default Controls;
