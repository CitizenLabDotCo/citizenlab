import React, { useState } from 'react';

// components
import {
  Box,
  Title,
  Text,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import CloseIconButton from 'components/UI/CloseIconButton';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Toggle from 'components/HookForm/Toggle';

// intl
import messages from '../messages';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

// types
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';

// utils
import { getAdditionalSettings } from './utils';
import Warning from 'components/UI/Warning';
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
  const { formatMessage } = useIntl();
  const [currentTab, setCurrentTab] = useState<'content' | 'logic'>('content');

  if (isNilOrError(locales)) {
    return null;
  }

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

  const showTabbedSettings =
    field.input_type === 'linear_scale' ||
    field.input_type === 'multiselect' ||
    field.input_type === 'select';

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
        {!showTabbedSettings && (
          <Box mt="30px">
            {field.input_type !== 'page' && (
              <>
                <SectionField id="e2e-required-toggle">
                  <Toggle
                    name={`customFields.${field.index}.required`}
                    label={
                      <Text as="span" color="primary" variant="bodyM" my="0px">
                        <FormattedMessage {...messages.requiredToggleLabel} />
                      </Text>
                    }
                  />
                </SectionField>
                <SectionField>
                  <InputMultilocWithLocaleSwitcher
                    id="e2e-title-multiloc"
                    name={`customFields.${field.index}.title_multiloc`}
                    label={<FormattedMessage {...messages.questionTitle} />}
                    type="text"
                  />
                </SectionField>
                <SectionField>
                  <InputMultilocWithLocaleSwitcher
                    name={`customFields.${field.index}.description_multiloc`}
                    label={
                      <FormattedMessage
                        {...messages.questionDescriptionOptional}
                      />
                    }
                    type="text"
                  />
                </SectionField>
              </>
            )}
            {getAdditionalSettings(field, locales)}
            <Box
              display="flex"
              justifyContent="space-between"
              borderTop={`1px solid ${colors.divider}`}
              pt="36px"
            >
              <Button
                id="e2e-settings-done-button"
                buttonStyle="secondary"
                onClick={onClose}
                minWidth="160px"
              >
                <FormattedMessage {...messages.done} />
              </Button>
              <Button
                icon="delete"
                buttonStyle="primary-outlined"
                borderColor={colors.error}
                textColor={colors.error}
                iconColor={colors.error}
                onClick={() => onDelete(field.index)}
                minWidth="160px"
                data-cy="e2e-delete-field"
                disabled={isDeleteDisabled}
              >
                <FormattedMessage {...messages.delete} />
              </Button>
            </Box>
          </Box>
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
                Content
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
            >
              <Text mb="12px" textAlign="center" color="coolGrey600">
                Logic
              </Text>
            </Box>
          </Box>
        )}
        {showTabbedSettings && currentTab === 'content' && (
          <Box mt="16px">
            {field.input_type !== 'page' && (
              <>
                <SectionField id="e2e-required-toggle">
                  <Toggle
                    name={`customFields.${field.index}.required`}
                    label={
                      <Text as="span" color="primary" variant="bodyM" my="0px">
                        <FormattedMessage {...messages.requiredToggleLabel} />
                      </Text>
                    }
                  />
                </SectionField>
                <SectionField>
                  <InputMultilocWithLocaleSwitcher
                    id="e2e-title-multiloc"
                    name={`customFields.${field.index}.title_multiloc`}
                    label={<FormattedMessage {...messages.questionTitle} />}
                    type="text"
                  />
                </SectionField>
                <SectionField>
                  <InputMultilocWithLocaleSwitcher
                    name={`customFields.${field.index}.description_multiloc`}
                    label={
                      <FormattedMessage
                        {...messages.questionDescriptionOptional}
                      />
                    }
                    type="text"
                  />
                </SectionField>
              </>
            )}
            {getAdditionalSettings(field, locales)}
            <Box
              display="flex"
              justifyContent="space-between"
              borderTop={`1px solid ${colors.divider}`}
              pt="36px"
            >
              <Button
                id="e2e-settings-done-button"
                buttonStyle="secondary"
                onClick={onClose}
                minWidth="160px"
              >
                <FormattedMessage {...messages.done} />
              </Button>
              <Button
                icon="delete"
                buttonStyle="primary-outlined"
                borderColor={colors.error}
                textColor={colors.error}
                iconColor={colors.error}
                onClick={() => onDelete(field.index)}
                minWidth="160px"
                data-cy="e2e-delete-field"
                disabled={isDeleteDisabled}
              >
                <FormattedMessage {...messages.delete} />
              </Button>
            </Box>
          </Box>
        )}
        {showTabbedSettings && currentTab === 'logic' && (
          <Warning text={formatMessage(messages.logicWarning)} />
        )}
      </Box>
    </>
  );
};

export default FormBuilderSettings;
