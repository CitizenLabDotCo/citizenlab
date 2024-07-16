import React from 'react';

import styled from 'styled-components';

import useGroups from 'api/groups/useGroups';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const StyledMultipleSelect = styled(MultipleSelect)`
  width: 300px;
`;

interface Props {
  groupIds?: string[];
  disabled?: boolean;
  onChange: (groups: string[]) => void;
}

const GroupSelect = ({ groupIds, disabled = false, onChange }: Props) => {
  const { data: groups } = useGroups({});
  const localize = useLocalize();

  const groupsOptions = () => {
    if (!groups) {
      return [];
    } else {
      return groups.data.map((group) => ({
        label: localize(group.attributes.title_multiloc),
        value: group.id,
      }));
    }
  };

  return (
    <StyledMultipleSelect
      value={groupIds ?? []}
      disabled={disabled}
      options={groupsOptions()}
      onChange={(options) => onChange(options.map((o) => o.value))}
      placeholder={<FormattedMessage {...messages.selectGroups} />}
      id="e2e-select-user-group"
      bgColor={disabled ? '#f9f9f9' : undefined}
    />
  );
};

export default GroupSelect;
