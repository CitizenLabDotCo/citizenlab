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

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';
import { EventsProps, EventsSource } from './types';

const SourceSetting = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as EventsProps }));

  const { projectId, customPageId } = useParams({ strict: false });
  const advancedCustomPages = useFeatureFlag({ name: 'advanced_custom_pages' });
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const filteringEnabled = !customPageId || advancedCustomPages;

  const source = props.source ?? 'all';
  const ids = props.ids ?? [];

  const { data: areas, isLoading: areasLoading } = useAreas({});
  const { data: topics, isLoading: topicsLoading } = useGlobalTopics();
  const { data: spaces, isLoading: spacesLoading } = useSpaces();

  // A project page's events widget is about that project, so there is nothing to choose. The
  // toolbox and the EventsWidget shim both write `currentProject` for this surface.
  if (projectId) return null;

  const options: { value: EventsSource; label: string }[] = [
    { value: 'all', label: formatMessage(messages.everyProject) },
    ...(filteringEnabled
      ? [
          { value: 'areas' as const, label: formatMessage(messages.byArea) },
          {
            value: 'global_topics' as const,
            label: formatMessage(messages.byTopic),
          },
          ...(spacesEnabled
            ? [
                {
                  value: 'spaces' as const,
                  label: formatMessage(messages.bySpace),
                },
              ]
            : []),
        ]
      : []),
  ];

  const toOptions = (
    records?: { id: string; attributes: { title_multiloc: Multiloc } }[]
  ) =>
    records?.map((record) => ({
      value: record.id,
      label: localize(record.attributes.title_multiloc),
    })) ?? [];

  const selection =
    source === 'areas'
      ? {
          title: messages.selectAreas,
          isLoading: areasLoading,
          options: toOptions(areas?.data),
        }
      : source === 'global_topics'
      ? {
          title: messages.selectTopics,
          isLoading: topicsLoading,
          options: toOptions(topics?.data),
        }
      : source === 'spaces'
      ? {
          title: messages.selectSpaces,
          isLoading: spacesLoading,
          options: toOptions(spaces?.data),
        }
      : undefined;

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
