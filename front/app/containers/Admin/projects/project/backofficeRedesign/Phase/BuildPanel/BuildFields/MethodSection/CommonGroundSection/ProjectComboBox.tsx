import React, { useState } from 'react';

import ComboBox from 'design-system/ComboBox';
import { ListBoxOption } from 'design-system/ListBox';

import { PublicationStatus } from 'api/projects/types';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import useDebouncedValue from 'hooks/useDebouncedValue';
import useLocalize from 'hooks/useLocalize';

import 'design-system/tokens.css';

const PUBLICATION_STATUSES: PublicationStatus[] = [
  'published',
  'archived',
  'draft',
];

// The empty id is the "no project" option.
const NO_PROJECT = '';

interface ProjectOption {
  id: string;
  label: string;
}

interface Props {
  label: string;
  placeholder: string;
  noProjectLabel: string;
  value: string | undefined;
  onChange: (projectId: string | undefined) => void;
}

const ProjectComboBox = ({
  label,
  placeholder,
  noProjectLabel,
  value,
  onChange,
}: Props) => {
  const localize = useLocalize();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [selected, setSelected] = useState<ProjectOption>();

  const { data: projectsData } = useInfiniteProjectsMiniAdmin(
    {
      status: PUBLICATION_STATUSES,
      sort: 'alphabetically_asc',
      search: debouncedSearch,
      discoverability: ['listed'],
    },
    1000 // Large page size to get all projects
  );

  const projectOptions = (projectsData?.pages ?? [])
    .flatMap((page) => page.data)
    .map((project) => ({
      id: project.id,
      label: localize(project.attributes.title_multiloc),
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
    );
  const options = [
    { id: NO_PROJECT, label: noProjectLabel },
    ...projectOptions,
  ];
  // The selected project has to be in the list for its name to show in the input.
  const items =
    selected && !options.some((option) => option.id === selected.id)
      ? [selected, ...options]
      : options;

  return (
    <ComboBox
      label={label}
      placeholder={placeholder}
      items={items}
      value={value ?? null}
      onChange={(key) => {
        const option = items.find((item) => item.id === key);
        setSelected(option);
        onChange(option?.id);
      }}
      onInputChange={(text) => {
        // Picking a project writes its name into the input; that is not a search.
        if (selected && text === selected.label) return;
        setSearch(text);
      }}
    >
      {(option: ProjectOption) => (
        <ListBoxOption id={option.id}>{option.label}</ListBoxOption>
      )}
    </ComboBox>
  );
};

export default ProjectComboBox;
