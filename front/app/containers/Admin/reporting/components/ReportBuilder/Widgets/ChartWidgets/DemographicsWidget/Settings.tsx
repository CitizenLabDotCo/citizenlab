import React from 'react';

import { useNode } from '@craftjs/core';

import {
  IUserCustomFieldData,
  IUserCustomFieldInputType,
} from 'api/user_custom_fields/types';

import { useIntl } from 'utils/cl-intl';

import UserFieldSelect from '../../_shared/UserFieldSelect';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

import messages from './messages';
import { Props } from './typings';

const INPUT_TYPES: IUserCustomFieldInputType[] = ['select'];

const Settings = () => {
  const { formatMessage } = useIntl();

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
        inputTypes={INPUT_TYPES}
        label={formatMessage(messages.registrationField)}
        onChange={setCustomFieldId}
      />
      <ChartWidgetSettings />
    </>
  );
};

export default Settings;
