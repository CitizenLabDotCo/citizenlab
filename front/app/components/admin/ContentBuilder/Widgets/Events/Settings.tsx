import React from 'react';

import {
  Box,
  CheckboxWithLabel,
  Label,
  Select,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

import {
  EventsLimit,
  EventsProps,
  EventsPublicationStatus,
  EventsTimeFilter,
} from '.';

const LIMIT_OPTIONS = [3, 6, 9];

const EventsSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as EventsProps }));

  const timeFilters = props.timeFilters ?? ['upcoming'];
  const limit = props.limit ?? 3;
  const statuses = props.projectPublicationStatuses ?? ['published'];

  const toggleTimeFilter = (filter: EventsTimeFilter) => {
    const next = timeFilters.includes(filter)
      ? timeFilters.filter((f) => f !== filter)
      : [...timeFilters, filter];
    // One bucket has to stay on, or the widget queries nothing and renders nothing.
    if (next.length === 0) return;
    setProp((p: EventsProps) => (p.timeFilters = next));
  };

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="20px">
      <InputMultilocWithLocaleSwitcher
        id="events_heading"
        type="text"
        label={formatMessage(messages.heading)}
        name="events_heading"
        valueMultiloc={props.titleMultiloc}
        onChange={(valueMultiloc) =>
          setProp((p: EventsProps) => (p.titleMultiloc = valueMultiloc))
        }
      />

      <Box>
        <Label>{formatMessage(messages.whichEvents)}</Label>
        <Box display="flex" flexDirection="column" gap="8px" mt="8px">
          <CheckboxWithLabel
            label={formatMessage(messages.upcomingEvents)}
            checked={timeFilters.includes('upcoming')}
            onChange={() => toggleTimeFilter('upcoming')}
          />
          <CheckboxWithLabel
            label={formatMessage(messages.pastEvents)}
            checked={timeFilters.includes('past')}
            onChange={() => toggleTimeFilter('past')}
          />
        </Box>
      </Box>

      <Select
        label={formatMessage(messages.howMany)}
        value={String(limit)}
        options={[
          ...LIMIT_OPTIONS.map((n) => ({ value: String(n), label: String(n) })),
          { value: 'all', label: formatMessage(messages.showAllPaginated) },
        ]}
        onChange={(option) => {
          const next: EventsLimit =
            option.value === 'all' ? 'all' : Number(option.value);
          setProp((p: EventsProps) => (p.limit = next));
        }}
      />

      <CheckboxWithLabel
        label={formatMessage(messages.includeArchived)}
        checked={statuses.includes('archived')}
        onChange={() => {
          const next: EventsPublicationStatus[] = statuses.includes('archived')
            ? ['published']
            : ['published', 'archived'];
          setProp((p: EventsProps) => (p.projectPublicationStatuses = next));
        }}
      />
    </Box>
  );
};

export default EventsSettings;
