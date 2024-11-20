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
  const { data: ideaStatuses } = useIdeaStatuses({});
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const methodName = {
    proposals: formatMessage(messages.ideaStatusMethodProposals),
    ideation: formatMessage(messages.ideaStatusMethodIdeation),
  };

  const generateOptions = (): IOption[] => {
    if (ideaStatuses) {
      return ideaStatuses.data.map((ideaStatus) => {
        return {
          value: ideaStatus.id,
          label: `${localize(ideaStatus.attributes.title_multiloc)} (${
            methodName[ideaStatus.attributes.participation_method]
          })`,
        };
      });
    } else {
      return [];
    }
  };

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
