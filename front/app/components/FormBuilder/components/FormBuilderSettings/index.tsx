import React, { useState } from 'react';

// components
import {
  Box,
  Title,
  Text,
  stylingConsts,
  colors,
  Button,
} from '@citizenlab/cl2-component-library';
import CloseIconButton from 'components/UI/CloseIconButton';
import { getIndexForTitle } from '../FormFields/utils';
import { LogicSettings } from './LogicSettings';
import { ContentSettings } from './ContentSettings';
import Modal from 'components/UI/Modal';

// intl
import messages from '../messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// types
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { useFormContext } from 'react-hook-form';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { formEndOption, getTranslatedStringKey } from './utils';
import { FormBuilderConfig } from 'components/FormBuilder/utils';

interface Props {
  field: IFlatCustomFieldWithIndex;
  onDelete: (fieldIndex: number) => void;
  onClose: () => void;
  isDeleteDisabled?: boolean;
  builderConfig: FormBuilderConfig;
}

const FormBuilderSettings = ({
  field,
  onDelete,
  onClose,
  isDeleteDisabled = false,
  builderConfig,
}: Props) => {
  const locales = useAppConfigurationLocales();
  const [currentTab, setCurrentTab] = useState<'content' | 'logic'>('content');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fieldIndexToDelete, setFieldIndexToDelete] = useState<number>();
  const { formatMessage } = useIntl();
  const { watch, setValue } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  const closeModal = () => {
    setShowDeleteModal(false);
  };
  const openModal = () => {
    setShowDeleteModal(true);
  };

  if (isNilOrError(locales)) {
    return null;
  }

  const deleteField = (fieldIndex: number) => {
    setFieldIndexToDelete(fieldIndex);

    // Check if deleted field has linked logic
    const doesPageHaveLinkedLogic = formCustomFields.some((formField) => {
      if (formField.logic && formField.logic.rules) {
        return formField.logic.rules.some(
          (rule) =>
            rule.goto_page_id === field.id ||
            rule.goto_page_id === field.temp_id
        );
      } else if (formField.logic && formField.logic?.next_page_id) {
        return (
          formField.logic?.next_page_id === field.id ||
          formField.logic?.next_page_id === field.temp_id
        );
      }
      return false;
    });

    if (doesPageHaveLinkedLogic) {
      openModal();
    } else {
      onDelete(fieldIndex);
    }
  };

  const removeLogicAndDelete = () => {
    if (fieldIndexToDelete !== undefined) {
      formCustomFields.map((formField, i) => {
        if (formField.logic && formField.logic.rules) {
          const updatedRules = formField.logic.rules.filter(
            (rule) =>
              rule.goto_page_id !== field.id &&
              rule.goto_page_id !== field.temp_id
          );
          setValue(`customFields.${i}.logic.rules`, updatedRules);
        } else if (formField.logic && formField.logic.next_page_id) {
          if (
            formField.logic.next_page_id === field.id ||
            formField.logic.next_page_id === field.temp_id
          ) {
            setValue(`customFields.${i}.logic`, {});
          }
        }
      });
      onDelete(fieldIndexToDelete);
    }
    setFieldIndexToDelete(undefined);
  };

  const getPageList = () => {
    const pageArray: { value: string; label: string }[] = [];

    formCustomFields?.forEach((field) => {
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
          <ContentSettings
            field={field}
            locales={locales}
            onClose={onClose}
            isDeleteDisabled={isDeleteDisabled}
            onDelete={deleteField}
          />
        )}
        {showTabbedSettings && currentTab === 'logic' && (
          <LogicSettings
            pageOptions={getPageList()}
            field={field}
            key={field.index}
            builderConfig={builderConfig}
          />
        )}
        <Modal opened={showDeleteModal} close={closeModal}>
          <Box display="flex" flexDirection="column" width="100%" p="20px">
            <Box mb="40px">
              <Title variant="h3" color="primary">
                {formatMessage(
                  messages.deleteFieldWithLogicConfirmationQuestion
                )}
              </Title>
              <Text color="primary" fontSize="l">
                {formatMessage(messages.deleteResultsInfo)}
              </Text>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              width="100%"
              alignItems="center"
            >
              <Button
                icon="delete"
                data-cy="e2e-confirm-delete-page-and-logic"
                buttonStyle="delete"
                width="auto"
                mr="20px"
                onClick={removeLogicAndDelete}
              >
                {formatMessage(messages.confirmDeleteFieldWithLogicButtonText)}
              </Button>
              <Button buttonStyle="secondary" width="auto" onClick={closeModal}>
                {formatMessage(messages.cancelDeleteButtonText)}
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default FormBuilderSettings;
