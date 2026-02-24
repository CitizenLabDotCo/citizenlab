import React, { KeyboardEvent } from 'react';

import { Box, Label, Spinner } from '@citizenlab/cl2-component-library';
import ReactSelect from 'react-select';
import { useParams } from 'utils/router';
import { useTheme } from 'styled-components';
import { IOption } from 'typings';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useLocalize from 'hooks/useLocalize';

import selectStyles from 'components/UI/MultipleSelect/styles';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { flattenPagesData, getLabel } from './utils';

interface Props {
  publicationId?: string;
  onSelect: (adminPublication: IAdminPublicationData) => void;
}

const PublicationSelect = ({ publicationId, onSelect }: Props) => {
  const { folderId } = useParams({ strict: false }) as {
    folderId: string; // We only return projects from the folder if folderId is defined
  };
  const { data: adminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'archived'],
    childrenOfId: folderId,
  });
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const flattenedPublications = flattenPagesData(adminPublications);

  if (!flattenedPublications) {
    return <Spinner />;
  }

  const options: IOption[] = flattenedPublications.map((adminPublication) => ({
    value: adminPublication.id,
    label: getLabel(adminPublication, localize, formatMessage),
  }));

  const selectedPublication = flattenedPublications.find(
    ({ relationships }) => relationships.publication.data.id === publicationId
  );

  const selectedOption = options.find(
    (option) => option.value === selectedPublication?.id
  );

  const handleChange = (value: IOption) => {
    const adminPublicationId = value.value;
    const adminPublication = flattenedPublications.find(
      (publication) => publication.id === adminPublicationId
    );
    if (!adminPublication) return;
    onSelect(adminPublication);
  };

  return (
    <Box>
      <Label htmlFor="project-select">
        {formatMessage(messages.selectProjectOrFolder)}
      </Label>
      <ReactSelect
        id="e2e-publication-select"
        inputId="project-select"
        isSearchable={true}
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        isClearable={false}
        value={selectedOption}
        placeholder=""
        options={options}
        styles={selectStyles(theme)}
        menuPosition="fixed"
        menuPlacement="auto"
        hideSelectedOptions
        onKeyDown={preventModalCloseOnEscape}
        onChange={handleChange}
      />
    </Box>
  );
};

const preventModalCloseOnEscape = (event: KeyboardEvent) => {
  if (event.code === 'Escape') event.stopPropagation();
};

export default PublicationSelect;
