import React, { memo } from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

export interface Props {
  value: string;
  onChange: (value: string) => void;
}

const IdeaStatusValueSelector = memo(({ value, onChange }: Props) => {
  const { data: proposalInputStatuses } = useIdeaStatuses({
    queryParams: { participation_method: 'proposals' },
  });
  const { data: ideationInputStatuses } = useIdeaStatuses({
    queryParams: { participation_method: 'ideation' },
  });
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!ideationInputStatuses || !proposalInputStatuses) return null;

  const generateOptions = (): IOption[] => [
    ...ideationInputStatuses.data.map((status) => ({
      value: status.id,
      label: `${localize(status.attributes.title_multiloc)} (${formatMessage(
        messages.ideaStatusMethodIdeation
      )})`,
    })),
    ...proposalInputStatuses.data.map((status) => ({
      value: status.id,
      label: `${localize(status.attributes.title_multiloc)} (${formatMessage(
        messages.ideaStatusMethodProposals
      )})`,
    })),
  ];

  const handleOnChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Select
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
});

export default IdeaStatusValueSelector;
