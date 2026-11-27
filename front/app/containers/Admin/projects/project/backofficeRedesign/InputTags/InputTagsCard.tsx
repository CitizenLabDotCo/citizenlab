import React from 'react';

import useInputTopics from 'api/input_topics/useInputTopics';
import { InputTerm } from 'api/phases/types';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import PanelField from '../Phase/BuildPanel/PanelField';

import messages from './messages';

interface Props {
  projectId: string;
  inputTerm?: InputTerm;
}

const InputTagsCard = ({ projectId, inputTerm = 'idea' }: Props) => {
  const { formatMessage } = useIntl();
  const { data: tags } = useInputTopics(projectId);
  return (
    <PanelField
      label={formatMessage(messages.tagsTitle, { inputTerm })}
      action={
        tags && (
          <SummaryPill
            label={formatMessage(messages.tagCount, {
              count: tags.data.length,
            })}
          />
        )
      }
      button={{
        icon: 'chevron-right',
        onClick: () => updateSearchParams({ input_tags: true }),
      }}
    />
  );
};
export default InputTagsCard;
