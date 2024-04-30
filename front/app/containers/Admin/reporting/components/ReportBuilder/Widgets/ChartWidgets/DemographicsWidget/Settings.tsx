import React from 'react';

import { useNode } from '@craftjs/core';

import {
  IUserCustomFieldData,
  IUserCustomFieldInputType,
} from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import { useIntl } from 'utils/cl-intl';

import UserFieldSelect from '../../_shared/UserFieldSelect';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

import messages from './messages';
import { Props } from './typings';

const isSupportedField = (userField: IUserCustomFieldData) => {
  const { input_type, code } = userField.attributes;

  if (input_type === 'number' && code === 'birthyear') return true;
  return input_type === 'select';
};

const INPUT_TYPES: IUserCustomFieldInputType[] = ['select', 'number'];

const Settings = () => {
  const { formatMessage } = useIntl();

  const { data: userFields } = useUserCustomFields({
    inputTypes: INPUT_TYPES,
  });

  const {
    actions: { setProp },
    customFieldId,
  } = useNode((node) => ({
    customFieldId: node.data.props.customFieldId,
  }));

  const setCustomFieldId = (
    value?: string,
    fieldData?: IUserCustomFieldData
  ) => {
    setProp((props: Props) => {
      props.customFieldId = value;
      props.title = fieldData?.attributes.title_multiloc;
    });
  };

  return (
    <>
      <UserFieldSelect
        userFieldId={customFieldId}
        userFields={userFields?.data.filter(isSupportedField)}
        label={formatMessage(messages.registrationField)}
        emptyOption={false}
        onChange={setCustomFieldId}
      />
      <ChartWidgetSettings />
    </>
  );
};

export default Settings;
