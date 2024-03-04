import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import CloseIconButton from 'components/UI/CloseIconButton';
import { LogicSettings } from './LogicSettings';
import { ContentSettings } from './ContentSettings';

import messages from '../messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { useFormContext } from 'react-hook-form';

import { isNilOrError } from 'utils/helperUtils';
import { getFieldNumbers } from '../utils';
import {
  formEndOption,
  getTranslatedStringKey,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';

interface Props {
  field: IFlatCustomFieldWithIndex;
  closeSettings: () => void;
  builderConfig: FormBuilderConfig;
}

const FormBuilderSettings = ({
  field,
  closeSettings,
  builderConfig,
}: Props) => {
  const locales = useAppConfigurationLocales();
  const [currentTab, setCurrentTab] = useState<'content' | 'logic'>('content');
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  if (isNilOrError(locales)) {
    return null;
  }

  const getPageList = () => {
    const fieldNumbers = getFieldNumbers(formCustomFields);
    const pageArray: { value: string; label: string }[] = [];

    formCustomFields?.forEach((field) => {
      if (field.input_type === 'page') {
        pageArray.push({
          value: field.temp_id || field.id,
          label: `${formatMessage(messages.page)} ${fieldNumbers[field.id]}`,
        });
      }
    });
    pageArray.push({
      value: formEndOption,
      label: `${formatMessage(
        builderConfig.formEndPageLogicOption || messages.formEnd
      )}`,
    });
    return pageArray;
  };

  const translatedStringKey = getTranslatedStringKey(
    field.input_type,
    field.key
  );
  const tabNotActiveBorder = `1px solid ${colors.grey400}`;
  const tabActiveBorder = `4px solid ${colors.primary}`;
  const fieldType = watch(`customFields.${field.index}.input_type`);
  const showTabbedSettings = ['linear_scale', 'select', 'page'].includes(
    fieldType
  );

  return (
    <Box
      right="0"
      top={`${stylingConsts.menuHeight}px`}
      bottom="0"
      zIndex="99999"
      p="20px"
      w="100%"
      background="white"
      boxShadow="-2px 0px 1px 0px rgba(0, 0, 0, 0.06)"
      overflowY="auto"
      overflowX="hidden"
      height={`calc(100vh - ${stylingConsts.menuHeight}px)`}
    >
      <Box
        position="absolute"
        right="10px"
        data-cy="e2e-form-builder-close-settings"
      >
        <CloseIconButton
          a11y_buttonActionMessage={messages.close}
          onClick={closeSettings}
          iconColor={colors.textSecondary}
          iconColorOnHover={'#000'}
        />
      </Box>
      {translatedStringKey && (
        <Title variant="h4" as="h2" mb="8px">
          <FormattedMessage {...translatedStringKey} />
        </Title>
      )}
      {showTabbedSettings && builderConfig.isLogicEnabled && (
        <Box display="flex" width="100%" mb="40px">
          <Box
            flexGrow={1}
            borderBottom={
              currentTab === 'content' ? tabActiveBorder : tabNotActiveBorder
            }
            onClick={() => {
              setCurrentTab('content');
            }}
            style={{ cursor: 'pointer' }}
          >
            <Text mb="12px" textAlign="center" color="coolGrey600">
              <FormattedMessage {...messages.content} />
            </Text>
          </Box>
          <Box
            flexGrow={1}
            borderBottom={
              currentTab === 'logic' ? tabActiveBorder : tabNotActiveBorder
            }
            onClick={() => {
              setCurrentTab('logic');
            }}
            style={{ cursor: 'pointer' }}
            data-cy="e2e-form-builder-logic-tab"
          >
            <Text mb="12px" textAlign="center" color="coolGrey600">
              <FormattedMessage {...messages.logic} />
            </Text>
          </Box>
        </Box>
      )}
      {(!showTabbedSettings ||
        !builderConfig.isLogicEnabled ||
        (showTabbedSettings && currentTab === 'content')) && (
        <ContentSettings field={field} locales={locales} />
      )}
      {showTabbedSettings && currentTab === 'logic' && (
        <LogicSettings
          pageOptions={getPageList()}
          field={field}
          key={field.index}
          builderConfig={builderConfig}
        />
      )}
    </Box>
  );
};

export default FormBuilderSettings;
