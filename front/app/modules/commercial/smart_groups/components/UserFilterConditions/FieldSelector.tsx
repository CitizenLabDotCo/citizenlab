import React, { memo } from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { keys } from 'lodash-es';
import { MessageDescriptor, WrappedComponentProps } from 'react-intl';
import { IOption } from 'typings';

import {
  IUserCustomFieldData,
  IUserCustomFieldInputType,
} from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { injectIntl } from 'utils/cl-intl';

import messages from './messages';
import {
  TRule,
  TStaticRuleType,
  TCustomRuleType,
  ruleTypeConstraints,
} from './rules';

export interface FieldDescriptor {
  ruleType?: TRule['ruleType'];
  customFieldId?: string;
}

interface Props {
  field: FieldDescriptor;
  onChange: (FieldDescriptor: FieldDescriptor) => void;
  fieldName?: string;
}

const FieldSelector = memo(
  ({
    intl: { formatMessage },
    onChange,
    field,
    fieldName,
  }: Props & WrappedComponentProps) => {
    const localize = useLocalize();
    const { data: userCustomFields } = useUserCustomFields({});
    const isCommunityMonitorEnabled = useFeatureFlag({
      name: 'community_monitor',
    });

    const generateOptions = (
      userCustomFields: IUserCustomFieldData[]
    ): IOption[] => {
      const labelMessages: {
        [key in TStaticRuleType]: MessageDescriptor;
      } = {
        email: messages.field_email,
        event_attendances: messages.field_event_attendances,
        lives_in: messages.field_lives_in,
        registration_completed_at: messages.field_registration_completed_at,
        role: messages.field_role,
        participated_in_project: messages.field_participated_in_project,
        participated_in_community_monitor:
          messages.field_participated_in_community_monitor,
        participated_in_topic: messages.field_participated_in_topic,
        participated_in_idea_status:
          messages.field_participated_in_input_status,
        follow: messages.field_follow,
        verified: messages.field_verified,
      };

      const staticOptions = keys(ruleTypeConstraints)
        .filter((ruleType) => !/^custom_field_.*$/.test(ruleType))
        .filter((ruleType) => {
          // Remove the community monitor rule type if the feature flag is not enabled
          return (
            isCommunityMonitorEnabled ||
            ruleType !== 'participated_in_community_monitor'
          );
        })
        .map((ruleType) => {
          return {
            value: descriptorToOptionValue({
              ruleType: ruleType as TRule['ruleType'],
            }),
            label: formatMessage(labelMessages[ruleType]),
          };
        });

      const customFieldOptions = userCustomFields
        .filter(
          (userCustomField) => userCustomField.attributes.code !== 'domicile'
        )
        .map((userCustomField) => ({
          value: descriptorToOptionValue(
            customFieldToDescriptor(userCustomField)
          ),
          label: localize(userCustomField.attributes.title_multiloc),
        }));

      return staticOptions.concat(customFieldOptions);
    };

    const handleOnChange = (option: IOption) => {
      onChange(optionValueToDescriptor(option.value));
    };

    const customFieldToDescriptor = (customField: IUserCustomFieldData) => {
      const inputType = customField.attributes.input_type;
      const ruleTypes: {
        [key in IUserCustomFieldInputType]: TCustomRuleType;
      } = {
        text: 'custom_field_text',
        number: 'custom_field_number',
        multiline_text: 'custom_field_text',
        select: 'custom_field_select',
        multiselect: 'custom_field_select',
        checkbox: 'custom_field_checkbox',
        date: 'custom_field_date',
      };
      const ruleType = ruleTypes[inputType];

      return {
        ruleType,
        customFieldId: customField.id,
      };
    };

    const descriptorToOptionValue = (fieldDescriptor: FieldDescriptor) => {
      return JSON.stringify(fieldDescriptor);
    };

    const optionValueToDescriptor = (value) => {
      return JSON.parse(value);
    };

    if (userCustomFields) {
      return (
        <Select
          options={generateOptions(userCustomFields.data)}
          onChange={handleOnChange}
          value={descriptorToOptionValue(field)}
          id={`${fieldName}-e2e`}
        />
      );
    }

    return null;
  }
);

export default injectIntl(FieldSelector);
