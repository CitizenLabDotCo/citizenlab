import React, { KeyboardEvent } from 'react';

import { Box, Label, Spinner } from '@citizenlab/cl2-component-library';
import { InfiniteData } from '@tanstack/react-query';
import ReactSelect from 'react-select';
import { IOption } from 'typings';

import {
  IAdminPublicationData,
  IAdminPublications,
} from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useLocalize from 'hooks/useLocalize';

import selectStyles from 'components/UI/MultipleSelect/styles';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  adminPublicationId?: string;
  onSelect: (adminPublication: IAdminPublicationData) => void;
}

const flattenPagesData = (
  data?: InfiniteData<IAdminPublications>
): IAdminPublicationData[] | undefined => {
  return data?.pages
    .map((page: { data: IAdminPublicationData[] }) => page.data)
    .flat();
};

const PublicationSelect = ({ adminPublicationId, onSelect }: Props) => {
  const { data: adminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'archived'],
  });
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const flattenedPublications = flattenPagesData(adminPublications);

  if (!flattenedPublications) {
    return <Spinner />;
  }

  const options: IOption[] = flattenedPublications.map(
    ({ id, attributes }) => ({
      value: id,
      label: localize(attributes.publication_title_multiloc),
    })
  );

  const selectedOption = options.find(
    (option) => option.value === adminPublicationId
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
        {formatMessage(messages.selectProject)}
      </Label>
      <ReactSelect
        inputId="project-select"
        isSearchable={true}
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        isClearable={false}
        value={selectedOption}
        placeholder=""
        options={options}
        styles={selectStyles()}
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
