import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { FormatMessage, IOption } from 'typings';

import { IGroupData } from 'api/groups/types';
import useGroups from 'api/groups/useGroups';

import useLocalize, { Localize } from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  currentGroupFilter?: string | null;
  onGroupFilter: (filter: IOption) => void;
}

const generateGroupOptions = (
  groupsList: IGroupData[],
  localize: Localize,
  formatMessage: FormatMessage
) => {
  const groupOptions = groupsList.map((group) => ({
    value: group.id,
    label: localize(group.attributes.title_multiloc),
  }));

  return [
    { value: '', label: formatMessage(messages.allGroups) },
    ...groupOptions,
  ];
};

const GroupFilter = ({ currentGroupFilter, onGroupFilter }: Props) => {
  const { data: groups } = useGroups({});
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const groupFilterOptions = generateGroupOptions(
    groups?.data || [],
    localize,
    formatMessage
  );

  return (
    <Select
      id="groupFilter"
      onChange={onGroupFilter}
      placeholder={formatMessage(messages.labelGroupFilter)}
      value={currentGroupFilter || ''}
      options={groupFilterOptions}
    />
  );
};

export default GroupFilter;
