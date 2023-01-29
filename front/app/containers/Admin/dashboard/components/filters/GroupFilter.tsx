import React from 'react';

// resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

// components
import { Select } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import useLocalize, { Localize } from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { FormatMessage, IOption } from 'typings';
import { IGroupData } from 'services/groups';

interface DataProps {
  groups: GetGroupsChildProps;
}

interface InputProps {
  currentGroupFilter?: string | null;
  onGroupFilter: (filter: IOption) => void;
}

interface Props extends DataProps, InputProps {}

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

const GroupFilter = ({
  groups: { groupsList },
  currentGroupFilter,
  onGroupFilter,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (isNilOrError(groupsList)) return null;

  const groupFilterOptions = generateGroupOptions(
    groupsList,
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

export default (props: InputProps) => (
  <GetGroups>
    {(groups) => <GroupFilter groups={groups} {...props} />}
  </GetGroups>
);
