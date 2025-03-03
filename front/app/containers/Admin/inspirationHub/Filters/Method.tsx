import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';

import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';

type Option = {
  value: RansackParams['q[phases_participation_method_eq]'];
  label: string;
};

const OPTIONS_UNTRANSLATED = [
  { value: 'ideation', labelMessage: messages.ideation },
  { value: 'information', labelMessage: messages.information },
  { value: 'native_survey', labelMessage: messages.survey },
  { value: 'survey', labelMessage: messages.externalSurvey },
  { value: 'voting', labelMessage: messages.voting },
  { value: 'poll', labelMessage: messages.poll },
  { value: 'volunteering', labelMessage: messages.volunteering },
  { value: 'document_annotation', labelMessage: messages.documentAnnotation },
  { value: 'proposals', labelMessage: messages.proposals },
];

const Method = () => {
  const value = useRansackParam('q[phases_participation_method_eq]');
  const { formatMessage } = useIntl();

  const options = OPTIONS_UNTRANSLATED.map(({ value, labelMessage }) => ({
    value,
    label: formatMessage(labelMessage),
  }));

  return (
    <Select
      value={value}
      options={options}
      canBeEmpty
      onChange={(option: Option) =>
        setRansackParam('q[phases_participation_method_eq]', option.value)
      }
      placeholder={formatMessage(messages.method)}
      mr="28px"
    />
  );
};

export default Method;
