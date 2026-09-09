import React from 'react';

import {
  Box,
  colors,
  Label,
  Radio,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import useAreas from 'api/areas/useAreas';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import MultiSelect from 'components/UI/MultiSelect';

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
  // The whole widget is the paid capability, so with it off nothing here is worth offering.
  const unavailable = !useFeatureFlag({ name: 'advanced_custom_pages' });

  const { data: topics, isLoading: topicsLoading } = useGlobalTopics();
  const { data: areas, isLoading: areasLoading } = useAreas({});
  const { data: spaces, isLoading: spacesLoading } = useSpaces();

  // A stored dimension stays listed even once its feature is off: the widget still filters by
  // it, so dropping it would read as unset, and picking another discards the selection.
  const spacesOption = spacesEnabled || filterType === 'spaces';

  const filterTypeOptions: { value: ProjectsFilterType; label: string }[] = [
    { value: 'global_topics', label: formatMessage(messages.filterByTags) },
    { value: 'areas', label: formatMessage(messages.filterByAreas) },
    ...(spacesOption
      ? [
          {
            value: 'spaces' as const,
            label: formatMessage(messages.filterBySpaces),
          },
        ]
      : []),
  ];

  const { entities, isLoading } = {
    global_topics: { entities: topics?.data, isLoading: topicsLoading },
    areas: { entities: areas?.data, isLoading: areasLoading },
    spaces: { entities: spaces?.data, isLoading: spacesLoading },
  }[filterType];

  const options = (entities ?? []).map((entity) => ({
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
      <Text m="0px" color="textSecondary">
        {formatMessage(
          unavailable ? messages.notAvailable : messages.description
        )}
      </Text>
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
      {!unavailable && (
        <>
          <Box>
            <Label>{formatMessage(messages.filterByLabel)}</Label>
            {filterTypeOptions.map((option) => (
              <Radio
                key={option.value}
                onChange={() =>
                  setProp((props: ProjectsByFilterProps) => {
                    props.filterType = option.value;
                    // Ids only mean something within their own dimension.
                    props.ids = [];
                  })
                }
                currentValue={filterType}
                id={`projects-filter-${option.value}`}
                name="projects-filter"
                value={option.value}
                label={option.label}
              />
            ))}
          </Box>
          {/* Only the selector waits on its entity list; the rest of the panel stays usable. */}
          <MultiSelect
            title={formatMessage(messages.selectionLabel)}
            selected={ids}
            isLoading={isLoading}
            options={options}
            onChange={(values) =>
              setProp((props: ProjectsByFilterProps) => (props.ids = values))
            }
          />
        </>
      )}
    </Box>
  );
};

export default Settings;
