import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { setRansackParam, useRansackParam } from './utils';

type Option = {
  value: RansackParams['q[phases_participation_method_eq]'];
  label: string;
};

const OPTIONS: Option[] = [
  { value: 'ideation', label: 'Ideation' },
  { value: 'information', label: 'Information' },
  { value: 'native_survey', label: 'Native survey' },
  { value: 'survey', label: 'Survey' },
  { value: 'voting', label: 'Voting' },
  { value: 'poll', label: 'Poll' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'document_annotation', label: 'Document annotation' },
  { value: 'proposals', label: 'Proposals' },
];

const ParticipationMethod = () => {
  const value = useRansackParam('q[phases_participation_method_eq]');

  return (
    <Select
      value={value}
      options={OPTIONS}
      onChange={(option: Option) =>
        setRansackParam('q[phases_participation_method_eq]', option.value)
      }
      label="Participation method"
    />
  );
};

export default ParticipationMethod;
