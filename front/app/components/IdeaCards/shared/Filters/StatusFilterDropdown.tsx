import React, { useMemo } from 'react';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';

import useLocalize from 'hooks/useLocalize';

import FilterSelector from 'components/FilterSelector';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { capitalize } from 'utils/textUtils';

import messages from '../../messages';

interface Props {
  selectedStatusIds: string[];
  alignment: 'left' | 'right';
  onChange: (value: string[]) => void;
  participationMethod: 'ideation' | 'proposals';
  isScreeningEnabled?: boolean;
}

const StatusFilterDropdown = ({
  selectedStatusIds,
  alignment,
  onChange,
  participationMethod,
  isScreeningEnabled,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const { data: ideaStatuses } = useIdeaStatuses({
    participation_method: participationMethod,
  });

  const options = useMemo(() => {
    return ideaStatuses
      ? [
          {
            text: formatMessage(messages.allStatuses),
            value: '',
          },
          ...ideaStatuses.data
            // Filter out the screening status from the list if screening is not enabled
            .filter((status) => {
              if (!isScreeningEnabled) {
                return status.attributes.code !== 'prescreening';
              }

              return true;
            })

            .map((status) => ({
              text: capitalize(localize(status.attributes.title_multiloc)),
              value: status.id,
            })),
        ]
      : [];
  }, [ideaStatuses, localize, formatMessage, isScreeningEnabled]);

  if (!ideaStatuses || ideaStatuses.data.length === 0) {
    return null;
  }

  return (
    <FilterSelector
      id="e2e-idea-filter-selector"
      title={
        <FormattedMessage
          {...messages.statusesTitle}
          key={`status-title-${selectedStatusIds.join('-')}`}
        />
      }
      name="statuses"
      selected={selectedStatusIds}
      values={options}
      onChange={onChange}
      multipleSelectionAllowed={false}
      last={true}
      left={alignment === 'left' ? '-5px' : undefined}
      mobileLeft={alignment === 'left' ? '-5px' : undefined}
      right={alignment === 'right' ? '-5px' : undefined}
      mobileRight={alignment === 'right' ? '-5px' : undefined}
    />
  );
};

export default StatusFilterDropdown;
