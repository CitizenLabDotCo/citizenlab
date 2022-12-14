import React, { useState } from 'react';

// components
import {
  Box,
  Title,
  Text,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import CloseIconButton from 'components/UI/CloseIconButton';
import { getIndexForTitle } from '../../components/FormFields/utils';
import { LogicSettings } from './LogicSettings';
import { ContentSettings } from './ContentSettings';

// intl
import messages from '../messages';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

// types
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { useFormContext } from 'react-hook-form';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { surveyEndOption } from './utils';

interface Props {
  field: IFlatCustomFieldWithIndex;
  onDelete: (fieldIndex: number) => void;
  onClose: () => void;
  isDeleteDisabled?: boolean;
}

const FormBuilderSettings = ({
  field,
  onDelete,
  onClose,
  isDeleteDisabled = false,
}: Props) => {
  const locales = useAppConfigurationLocales();
  const [currentTab, setCurrentTab] = useState<'content' | 'logic'>('content');
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();

  if (isNilOrError(locales)) {
    return null;
  }

  const getPageList = () => {
    // TODO: Only select pages which come after the question. For this iteration though, we are not
    // validating against cyclical form flows, so to not have an error state here,
    // all pages should be available in the list.
    const formCustomFields: IFlatCustomField[] = watch('customFields');
    const pageArray: { value: string; label: string }[] = [];

    formCustomFields?.map((field) => {
      if (field.input_type === 'page') {
        pageArray.push({
          value: field.temp_id || field.id,
          label: `${formatMessage(messages.page)} ${getIndexForTitle(
            formCustomFields,
            field
          )}`,
        });
      }
    });
    pageArray.push({
      value: surveyEndOption,
      label: `${formatMessage(messages.surveyEnd)}`,
    });
    return pageArray;
  };

  let translatedStringKey: MessageDescriptor | null = null;
  switch (field.input_type) {
    case 'text':
      translatedStringKey = messages.shortAnswer;
      break;
    case 'multiselect':
    case 'select':
      translatedStringKey = messages.multipleChoice;
      break;
    case 'page':
      translatedStringKey = messages.page;
      break;
    case 'number':
      translatedStringKey = messages.number;
      break;
    case 'linear_scale':
      translatedStringKey = messages.linearScale;
      break;
  }

  const tabNotActiveBorder = `1px solid ${colors.grey400}`;
  const tabActiveBorder = `4px solid ${colors.primary}`;
  const fieldType = watch(`customFields.${field.index}.input_type`);
  const showTabbedSettings =
    fieldType === 'linear_scale' || fieldType === 'select';

  return (
    <>
      <Box
        position="fixed"
        right="0"
        top={`${stylingConsts.menuHeight}px`}
        bottom="0"
        zIndex="99999"
        p="20px"
        w="400px"
        background="white"
        boxShadow="-2px 0px 1px 0px rgba(0, 0, 0, 0.06)"
        overflowY="auto"
        overflowX="hidden"
      >
        <Box position="absolute" right="10px">
          <CloseIconButton
            a11y_buttonActionMessage={messages.close}
            onClick={onClose}
            iconColor={colors.textSecondary}
            iconColorOnHover={'#000'}
          />
        </Box>
        {translatedStringKey && (
          <Title variant="h4" as="h2" mb="8px">
            <FormattedMessage {...translatedStringKey} />
          </Title>
        )}
        {showTabbedSettings && (
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
          (showTabbedSettings && currentTab === 'content')) && (
          <ContentSettings
            field={field}
            locales={locales}
            onClose={onClose}
            isDeleteDisabled={isDeleteDisabled}
            onDelete={onDelete}
          />
        )}
        {showTabbedSettings && currentTab === 'logic' && (
          <LogicSettings pageOptions={getPageList()} field={field} />
        )}
      </Box>
    </>
  );
};

export default FormBuilderSettings;
