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

  // EventsWidget only ever asks for published projects' events, so an archived one would be
  // selectable and then show nothing.
  const { data: projects } = useProjects({
    publicationStatuses: ['published'],
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

  const isAvailable = (mode: EventsSelectionMode) => {
    if (mode === 'all') return true;
    if (!advancedCustomPagesEnabled) return false;
    return mode !== 'spaces' || spacesEnabled;
  };

  // A stored filtered mode outlives the feature it needed, so the panel has to explain
  // itself rather than offer controls that change nothing.
  const filteringUnavailable = !advancedCustomPagesEnabled && mode !== 'all';

  // A stored mode whose feature the tenant lost stays listed: dropping it would read as
  // unset while the widget still filters by it. Only while filtering is available at all.
  const visibleModes = MODES.filter(
    (option) =>
      isAvailable(option) || (advancedCustomPagesEnabled && option === mode)
  );

  const modeOptions = visibleModes.map((option) => ({
    value: option,
    label: isAvailable(option)
      ? modeLabels[option]
      : formatMessage(messages.modeUnavailable, {
          mode: modeLabels[option],
        }),
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
        {formatMessage(
          filteringUnavailable
            ? messages.notAvailable
            : mode === 'all'
            ? messages.descriptionAll
            : messages.descriptionFiltered
        )}
      </Text>
      <InputMultilocWithLocaleSwitcher
        id="events-by-projects-title"
        type="text"
        name="titleMultiloc"
        label={formatMessage(messages.titleLabel)}
        // Shown as a placeholder, not a value: prefilling would freeze today's wording into
        // the page and stop it falling back per locale.
        placeholder={formatMessage(eventsMessages.upcomingEventsWidgetTitle)}
        valueMultiloc={titleMultiloc}
        onChange={(valueMultiloc) => {
          setProp((props: EventsByProjectsProps) => {
            props.titleMultiloc = valueMultiloc;
          });
        }}
      />
      {/* Without advanced_custom_pages only 'all' is on offer, and a one-option dropdown
          reads as broken. */}
      {modeOptions.length > 1 && (
        <Select
          value={mode}
          options={modeOptions}
          label={formatMessage(messages.modeLabel)}
          onChange={(option) => {
            setProp((props: EventsByProjectsProps) => {
              props.mode = option.value;
              // Ids only mean something within their own dimension.
              props.ids = [];
            });
          }}
        />
      )}
      {/* Only the selector waits on its entity list; the rest of the panel stays usable. */}
      {mode !== 'all' &&
        !filteringUnavailable &&
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
    </Box>
  );
};

export default Settings;
