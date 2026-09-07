import React from 'react';

import {
  Box,
  Label,
  MultiSelect,
  Radio,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useAreas from 'api/areas/useAreas';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

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

  // Route params, as FileAttachment's panel does: `currentProject` reads them at render time,
  // so offering it anywhere else would resolve the custom page's slug as a project.
  const { projectId } = useParams({ strict: false });
  const filteringEnabled = useFeatureFlag({ name: 'advanced_custom_pages' });
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const source = props.source ?? 'all';
  const ids = props.ids ?? [];

  const { data: areas, isLoading: areasLoading } = useAreas({});
  const { data: topics, isLoading: topicsLoading } = useGlobalTopics();
  const { data: spaces, isLoading: spacesLoading } = useSpaces();

  const options: { value: EventsSource; label: string }[] = [
    { value: 'all', label: formatMessage(messages.everyProject) },
    ...(projectId
      ? [
          {
            value: 'currentProject' as const,
            label: formatMessage(messages.thisProject),
          },
        ]
      : []),
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
          a11y_clearbuttonActionMessage={formatMessage(messages.clearSelection)}
          a11y_clearSearchButtonActionMessage={formatMessage(
            messages.clearSearch
          )}
        />
      )}
    </Box>
  );
};

export default SourceSetting;
