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

import eventsMessages from 'components/LandingPages/citizen/messages';
import SectionBackgroundSetting from 'components/ProjectPageBuilder/Widgets/SectionBackgroundSetting';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { EventsByProjectsProps, EventsSelectionMode } from './types';

const MODES: EventsSelectionMode[] = [
  'all',
  'projects',
  'global_topics',
  'areas',
  'spaces',
];

const Settings = () => {
  const {
    actions: { setProp },
    mode = 'all',
    ids = [],
    titleMultiloc,
  } = useNode((node) => ({
    mode: node.data.props.mode,
    ids: node.data.props.ids,
    titleMultiloc: node.data.props.titleMultiloc,
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

  const modeLabels: Record<EventsSelectionMode, string> = {
    all: formatMessage(messages.modeAll),
    projects: formatMessage(messages.modeProjects),
    global_topics: formatMessage(messages.modeTags),
    areas: formatMessage(messages.modeAreas),
    spaces: formatMessage(messages.modeSpaces),
  };

  // Filtering is the advanced_custom_pages capability; an unfiltered list is not, so every
  // tenant keeps the 'all' mode.
  const isAvailable = (mode: EventsSelectionMode) => {
    if (mode === 'all') return true;
    if (!advancedCustomPagesEnabled) return false;
    return mode !== 'spaces' || spacesEnabled;
  };

  const modeOptions = MODES.filter(isAvailable).map((mode) => ({
    value: mode,
    label: modeLabels[mode],
  }));

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
      <InputMultilocWithLocaleSwitcher
        id="events-by-projects-title"
        type="text"
        name="titleMultiloc"
        label={formatMessage(messages.titleLabel)}
        // The widget keeps its own heading until an admin writes one, so show that rather
        // than leaving the field looking like it failed to load.
        placeholder={formatMessage(eventsMessages.upcomingEventsWidgetTitle)}
        valueMultiloc={titleMultiloc}
        onChange={(valueMultiloc) => {
          setProp((props: EventsByProjectsProps) => {
            props.titleMultiloc = valueMultiloc;
          });
        }}
      />
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
