import React, { memo } from 'react';

import { IOption } from 'typings';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

export interface Props {
  value: string;
  onChange: (value: string[]) => void;
}

const IdeaStatusValuesSelector = memo(({ value, onChange }: Props) => {
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

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value) as string[];
    onChange(optionIds);
  };

  return (
    <MultipleSelect
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
});

export default IdeaStatusValuesSelector;
