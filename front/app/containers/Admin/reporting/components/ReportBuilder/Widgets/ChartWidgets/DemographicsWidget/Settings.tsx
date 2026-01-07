import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import {
  IUserCustomFieldData,
  IUserCustomFieldInputType,
} from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';

import GroupFilter from 'containers/Admin/dashboard/components/filters/GroupFilter';
import groupFilterMessages from 'containers/Admin/dashboard/messages';

import {
  useIntl,
  useFormatMessageWithLocale,
  MessageDescriptor,
} from 'utils/cl-intl';

import platformTemplateMessages from '../../../Templates/PlatformTemplate/messages';
import UserFieldSelect from '../../_shared/UserFieldSelect';
import { AccessibilityInputs } from '../_shared/AccessibilityInputs';
import {
  TitleInput,
  DateRangeInput,
  ProjectInput,
} from '../_shared/ChartWidgetSettings';

import messages from './messages';
import { Props } from './typings';

export const isSupportedField = (userField: IUserCustomFieldData) => {
  const { input_type, code } = userField.attributes;

  if (input_type === 'number' && code === 'birthyear') return true;
  return input_type === 'select';
};

export const INPUT_TYPES: IUserCustomFieldInputType[] = ['select', 'number'];

const Settings = () => {
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();

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

  if (!appConfigurationLocales || !formatMessageWithLocale) return null;

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

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  const processedUserFields = userFields?.data
    .filter(isSupportedField)
    .map((field) => {
      if (field.attributes.code === 'birthyear') {
        return {
          ...field,
          attributes: {
            ...field.attributes,
            title_multiloc: toMultiloc(platformTemplateMessages.age),
          },
        };
      } else {
        return field;
      }
    });

  return (
    <>
      <UserFieldSelect
        userFieldId={customFieldId}
        userFields={processedUserFields}
        label={formatMessage(messages.demographicQuestion)}
        emptyOption={false}
        onChange={setCustomFieldId}
      />
      <Box>
        <TitleInput />
        <DateRangeInput label={formatMessage(messages.registrationDateRange)} />
        <ProjectInput />
      </Box>
      <Box mb="20px">
        <GroupFilter
          currentGroupFilter={groupId}
          label={formatMessage(groupFilterMessages.labelGroupFilter)}
          onGroupFilter={setGroup}
        />
      </Box>
      <AccessibilityInputs />
    </>
  );
};

export default Settings;
