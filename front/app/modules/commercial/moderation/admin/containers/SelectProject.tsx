import React, { memo, useCallback } from 'react';

// api
import useProjects from 'api/projects/useProjects';

// components
import FilterSelector from 'components/FilterSelector';
import useLocalize from 'hooks/useLocalize';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { PublicationStatus } from 'api/projects/types';

interface Props {
  onChange: (projectIds: string[]) => void;
  selectedProjectIds: string[];
}

const PUBLICATION_STATUSES: PublicationStatus[] = [
  'published',
  'archived',
  'draft',
];

const SelectProject = memo(({ onChange, selectedProjectIds }: Props) => {
  const localize = useLocalize();
  const { data: projects } = useProjects({
    publicationStatuses: PUBLICATION_STATUSES,
    canModerate: true,
  });

  const handleOnChange = useCallback((newProjectIds: string[]) => {
    onChange(newProjectIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isNilOrError(projects) && projects.data.length > 0) {
    const values = projects.data.map((project) => {
      return {
        text: localize(project.attributes.title_multiloc),
        value: project.id,
      };
    });

    return (
      <FilterSelector
        title={<FormattedMessage {...messages.project} />}
        name="building"
        selected={selectedProjectIds}
        values={values}
        onChange={handleOnChange}
        multipleSelectionAllowed={true}
      />
    );
  }

  return null;
});

export default SelectProject;
