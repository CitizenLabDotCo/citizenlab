import React from 'react';

import {
  Box,
  CheckboxWithLabel,
  Input,
  Label,
  Radio,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import defaultHeadingMessage from './defaultHeading';
import messages from './messages';
import SourceSetting from './SourceSetting';
import {
  EventsProps,
  EventsPublicationStatus,
  EventsTimeFilter,
} from './types';

const EventsSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as EventsProps }));

  const timeFilters = props.timeFilters ?? ['upcoming'];
  const limit = props.limit ?? 3;
  const paginated = limit === 'all';
  const lastNumericLimit = typeof limit === 'number' ? limit : 3;
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
      <SourceSetting />

      <InputMultilocWithLocaleSwitcher
        id="events_heading"
        type="text"
        label={formatMessage(messages.heading)}
        placeholder={formatMessage(
          defaultHeadingMessage(props.source ?? 'all')
        )}
        name="events_heading"
        valueMultiloc={props.titleMultiloc}
        onChange={(valueMultiloc) =>
          setProp((p: EventsProps) => (p.titleMultiloc = valueMultiloc))
        }
      />

      <Box>
        <Label>{formatMessage(messages.whichEvents2)}</Label>
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

      <Box>
        <Label>{formatMessage(messages.howMany)}</Label>
        <Radio
          onChange={() => setProp((p: EventsProps) => (p.limit = 'all'))}
          currentValue={paginated ? 'all' : 'limited'}
          id="events-limit-all"
          name="events-limit"
          value="all"
          label={formatMessage(messages.showAllPaginated2)}
        />
        <Radio
          onChange={() =>
            setProp((p: EventsProps) => (p.limit = lastNumericLimit))
          }
          currentValue={paginated ? 'all' : 'limited'}
          id="events-limit-limited"
          name="events-limit"
          value="limited"
          label={formatMessage(messages.showLimited)}
        />
        {!paginated && (
          <Input
            type="number"
            label={formatMessage(messages.howManyAtMost)}
            value={String(lastNumericLimit)}
            onChange={(value) =>
              setProp((p: EventsProps) => (p.limit = parseInt(value, 10) || 1))
            }
          />
        )}
      </Box>

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
