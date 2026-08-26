import React from 'react';

import {
  Box,
  colors,
  Select,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import useAreas from 'api/areas/useAreas';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { ProjectsByFilterProps, ProjectsFilterType } from './types';

const Settings = () => {
  const {
    actions: { setProp },
    filterType = 'global_topics',
    ids = [],
    titleMultiloc,
  } = useNode((node) => ({
    filterType: node.data.props.filterType,
    ids: node.data.props.ids,
    titleMultiloc: node.data.props.titleMultiloc,
  }));

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const { data: topics } = useGlobalTopics();
  const { data: areas } = useAreas({});
  const { data: spaces } = useSpaces();

  const filterTypeOptions: { value: ProjectsFilterType; label: string }[] = [
    { value: 'global_topics', label: formatMessage(messages.filterByTags) },
    { value: 'areas', label: formatMessage(messages.filterByAreas) },
    ...(spacesEnabled
      ? [
          {
            value: 'spaces' as const,
            label: formatMessage(messages.filterBySpaces),
          },
        ]
      : []),
  ];

  const entities = {
    global_topics: topics?.data,
    areas: areas?.data,
    spaces: spaces?.data,
  }[filterType];

  const options: IOption[] | undefined = entities?.map((entity) => ({
    value: entity.id,
    label: localize(entity.attributes.title_multiloc),
  }));

  return (
    <Box
      background={colors.white}
      my="32px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <InputMultilocWithLocaleSwitcher
        id="projects-by-filter-title"
        type="text"
        name="titleMultiloc"
        label={formatMessage(messages.titleLabel)}
        valueMultiloc={titleMultiloc}
        onChange={(valueMultiloc) => {
          setProp((props: ProjectsByFilterProps) => {
            props.titleMultiloc = valueMultiloc;
          });
        }}
      />
      <Select
        value={filterType}
        options={filterTypeOptions}
        label={formatMessage(messages.filterByLabel)}
        onChange={(option) => {
          setProp((props: ProjectsByFilterProps) => {
            props.filterType = option.value;
            // A selection only means anything within its own dimension.
            props.ids = [];
          });
        }}
      />
      {/* Only the selector waits on its entity list; the rest of the panel stays usable. */}
      {options ? (
        <MultipleSelect
          value={options.filter((option) => ids.includes(option.value))}
          options={options}
          label={formatMessage(messages.selectionLabel)}
          onChange={(selected) => {
            setProp((props: ProjectsByFilterProps) => {
              props.ids = selected.map((option) => option.value);
            });
          }}
        />
      ) : (
        <Spinner />
      )}
    </Box>
  );
};

export default Settings;
