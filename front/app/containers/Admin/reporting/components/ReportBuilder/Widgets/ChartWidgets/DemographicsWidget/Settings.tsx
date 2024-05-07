import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import {
  IUserCustomFieldData,
  IUserCustomFieldInputType,
} from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import GroupFilter from 'containers/Admin/dashboard/components/filters/GroupFilter';
import groupFilterMessages from 'containers/Admin/dashboard/messages';

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
    groupId,
  } = useNode((node) => ({
    customFieldId: node.data.props.customFieldId,
    groupId: node.data.props.groupId,
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

  const setGroup = ({ value }: IOption) => {
    setProp((props: Props) => {
      props.groupId = value === '' ? undefined : value;
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
      <Box mb="20px">
        <GroupFilter
          currentGroupFilter={groupId}
          label={formatMessage(groupFilterMessages.labelGroupFilter)}
          onGroupFilter={setGroup}
        />
      </Box>
    </>
  );
};

export default Settings;
