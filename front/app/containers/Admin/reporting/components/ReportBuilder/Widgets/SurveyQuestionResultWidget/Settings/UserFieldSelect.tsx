import React from 'react';

import { useIntl } from 'utils/cl-intl';

import { SLICE_REGISTRATION_FIELD_INPUT_TYPES } from '../../../constants';
import BaseUserFieldSelect from '../../_shared/UserFieldSelect';

import messages from './messages';

interface Props {
  userFieldId?: string;
  onChange: (userFieldId?: string) => void;
}

const UserFieldSelect = ({ userFieldId, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <BaseUserFieldSelect
      userFieldId={userFieldId}
      inputTypes={SLICE_REGISTRATION_FIELD_INPUT_TYPES}
      label={formatMessage(messages.groupByRegistrationField)}
      onChange={onChange}
    />
  );
};

export default UserFieldSelect;
