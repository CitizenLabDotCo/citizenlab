import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { IUserCustomFieldInputType } from 'api/user_custom_fields/types';

import { useIntl } from 'utils/cl-intl';

import UserFieldSelect from '../../_shared/UserFieldSelect';
import { DateAndProjectFilter } from '../_shared/ChartWidgetSettings';

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

  const setCustomFieldId = (value?: string) => {
    setProp((props: Props) => {
      props.customFieldId = value;
    });
  };

  return (
    <Box>
      <UserFieldSelect
        userFieldId={customFieldId}
        inputTypes={INPUT_TYPES}
        label={formatMessage(messages.registrationField)}
        onChange={setCustomFieldId}
      />
      <DateAndProjectFilter />
    </Box>
  );
};

export default Settings;
