import React from 'react';

import { Box, Label, Radio, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useAreas from 'api/areas/useAreas';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import MultiSelect from 'components/UI/MultiSelect';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';
import { EventsProps, EventsSource } from './types';

const SourceSetting = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  // craft stores props as untyped JSON; this widget is their only writer.
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as EventsProps }));

  const { customPageId } = useParams({ strict: false });
  const advancedCustomPages = useFeatureFlag({ name: 'advanced_custom_pages' });
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const source = props.source ?? 'all';
  const ids = props.ids ?? [];

  const { data: areas, isLoading: areasLoading } = useAreas({});
  const { data: topics, isLoading: topicsLoading } = useGlobalTopics();
  const { data: spaces, isLoading: spacesLoading } = useSpaces();

  // A widget about its own project, on a project page or a project's static page, has nothing to
  // choose. The toolboxes and the EventsWidget shim write `currentProject` for these surfaces.
  if (source === 'currentProject') return null;

  // The homepage lists events from every project; filtering is for custom pages. A homepage
  // widget that already filters still shows its filter, so it can be read and reset.
  if (!customPageId && source === 'all') return null;

  const filteringOffered = !!customPageId && advancedCustomPages;

  // A stored dimension stays listed once its feature is off: the widget still filters by it, so
  // dropping it would read as unset, and picking another discards the ids.
  const offers = (dimension: EventsSource, featureOn: boolean) =>
    featureOn || source === dimension;

  const options: { value: EventsSource; label: string }[] = [
    { value: 'all', label: formatMessage(messages.everyProject) },
    ...(offers('areas', filteringOffered)
      ? [{ value: 'areas' as const, label: formatMessage(messages.byArea) }]
      : []),
    ...(offers('global_topics', filteringOffered)
      ? [
          {
            value: 'global_topics' as const,
            label: formatMessage(messages.byTopic),
          },
        ]
      : []),
    ...(offers('spaces', filteringOffered && spacesEnabled)
      ? [{ value: 'spaces' as const, label: formatMessage(messages.bySpace) }]
      : []),
  ];

  const toOptions = (
    records?: { id: string; attributes: { title_multiloc: Multiloc } }[]
  ) =>
    records?.map((record) => ({
      value: record.id,
      label: localize(record.attributes.title_multiloc),
    })) ?? [];

  const selections: Partial<
    Record<
      EventsSource,
      {
        title: MessageDescriptor;
        isLoading: boolean;
        options: { value: string; label: string }[];
      }
    >
  > = {
    areas: {
      title: messages.selectAreas,
      isLoading: areasLoading,
      options: toOptions(areas?.data),
    },
    global_topics: {
      title: messages.selectTopics,
      isLoading: topicsLoading,
      options: toOptions(topics?.data),
    },
    spaces: {
      title: messages.selectSpaces,
      isLoading: spacesLoading,
      options: toOptions(spaces?.data),
    },
  };

  const selection = selections[source];

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {options.length > 1 ? (
        <Box>
          <Label>{formatMessage(messages.whichProjects)}</Label>
          {options.map((option) => (
            <Radio
              key={option.value}
              onChange={() =>
                setProp((p: EventsProps) => {
                  p.source = option.value;
                  // An area id read as a tag id filters silently and wrongly.
                  p.ids = [];
                })
              }
              currentValue={source}
              id={`events-source-${option.value}`}
              name="events-source"
              value={option.value}
              label={option.label}
            />
          ))}
        </Box>
      ) : (
        <Text m="0px" color="textSecondary" fontSize="s">
          {formatMessage(messages.everyProjectOnly)}
        </Text>
      )}

      {selection && (
        <MultiSelect
          title={formatMessage(selection.title)}
          selected={ids}
          isLoading={selection.isLoading}
          options={selection.options}
          onChange={(values) => setProp((p: EventsProps) => (p.ids = values))}
        />
      )}
    </Box>
  );
};

export default SourceSetting;
