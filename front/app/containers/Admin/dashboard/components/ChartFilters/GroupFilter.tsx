import React from 'react';

// resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

// hooks
import useLocalize, { Localize } from 'hooks/useLocalize';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';
import { HiddenLabel } from 'utils/a11y';

// typings
import { IOption } from 'typings';
import { IGroupData } from 'services/groups';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  groups: GetGroupsChildProps;
}

interface InputProps {
  currentGroupFilter?: string | null;
  onlyModerator?: boolean;
  onGroupFilter: (filter: IOption) => void;
}

interface Props extends DataProps, InputProps {}

const generateGroupOptions = (
  groupsList: IGroupData[],
  localize: Localize,
  formatMessage: InjectedIntlProps['intl']['formatMessage']
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
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const localize = useLocalize();

  if (isNilOrError(groupsList)) return null;

  const groupFilterOptions = generateGroupOptions(
    groupsList,
    localize,
    formatMessage
  );

  return (
    <Box width="32%">
      <HiddenLabel>
        {formatMessage(messages.hiddenLabelGroupFilter)}
        <Select
          id="groupFilter"
          onChange={onGroupFilter}
          value={currentGroupFilter || ''}
          options={groupFilterOptions}
        />
      </HiddenLabel>
    </Box>
  );
};

const GroupFilterWithIntl = injectIntl(GroupFilter);

export default (props: InputProps) => (
  <GetGroups>
    {(groups) => <GroupFilterWithIntl groups={groups} {...props} />}
  </GetGroups>
);
