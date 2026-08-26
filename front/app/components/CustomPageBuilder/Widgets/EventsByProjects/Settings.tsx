import React from 'react';

import {
  Box,
  colors,
  Select,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import useAreas from 'api/areas/useAreas';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import useProjects from 'api/projects/useProjects';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import SectionBackgroundSetting from 'components/ProjectPageBuilder/Widgets/SectionBackgroundSetting';
import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { EventsByProjectsProps, EventsSelectionMode } from './types';

const Settings = () => {
  const {
    actions: { setProp },
    mode = 'all',
    ids = [],
  } = useNode((node) => ({
    mode: node.data.props.mode,
    ids: node.data.props.ids,
  }));

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });

  const { data: projects } = useProjects({
    publicationStatuses: ['published', 'archived'],
  });
  const { data: topics } = useGlobalTopics();
  const { data: areas } = useAreas({});
  const { data: spaces } = useSpaces();

  // Filtering is the advanced_custom_pages capability; an unfiltered events list is not.
  const modeOptions: { value: EventsSelectionMode; label: string }[] = [
    { value: 'all', label: formatMessage(messages.modeAll) },
    ...(advancedCustomPagesEnabled
      ? ([
          { value: 'projects', label: formatMessage(messages.modeProjects) },
          { value: 'global_topics', label: formatMessage(messages.modeTags) },
          { value: 'areas', label: formatMessage(messages.modeAreas) },
          ...(spacesEnabled
            ? [{ value: 'spaces', label: formatMessage(messages.modeSpaces) }]
            : []),
        ] as { value: EventsSelectionMode; label: string }[])
      : []),
  ];

  const entities = {
    all: [],
    projects: projects?.data,
    global_topics: topics?.data,
    areas: areas?.data,
    spaces: spaces?.data,
  }[mode];

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
      <Text m="0px" color="textSecondary">
        {formatMessage(messages.description)}
      </Text>
      <Select
        value={mode}
        options={modeOptions}
        label={formatMessage(messages.modeLabel)}
        onChange={(option) => {
          setProp((props: EventsByProjectsProps) => {
            props.mode = option.value;
            // A selection only means anything within its own dimension.
            props.ids = [];
          });
        }}
      />
      {/* Only the selector waits on its entity list; the rest of the panel stays usable. */}
      {mode !== 'all' &&
        (options ? (
          <MultipleSelect
            value={options.filter((option) => ids.includes(option.value))}
            options={options}
            label={formatMessage(messages.selectionLabel)}
            onChange={(selected) => {
              setProp((props: EventsByProjectsProps) => {
                props.ids = selected.map((option) => option.value);
              });
            }}
          />
        ) : (
          <Spinner />
        ))}
      <SectionBackgroundSetting defaultValue="white" />
    </Box>
  );
};

export default Settings;
