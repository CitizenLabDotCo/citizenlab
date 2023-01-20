import React from 'react';
import { useFormContext } from 'react-hook-form';
import { get } from 'lodash-es';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Toggle from 'components/HookForm/Toggle';

// Typings
import { Locale } from 'typings';

// intl
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { getAdditionalSettings } from '../utils';
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { builtInFieldKeys } from 'components/FormBuilder/utils';

type ContentSettingsProps = {
  field: IFlatCustomFieldWithIndex;
  onDelete: (fieldIndex: number) => void;
  onClose: () => void;
  isDeleteDisabled?: boolean;
  locales: Locale[];
};

export const ContentSettings = ({
  field,
  locales,
  onClose,
  isDeleteDisabled,
  onDelete,
}: ContentSettingsProps) => {
  const { watch, trigger, setValue } = useFormContext();
  const logic = watch(`customFields.${field.index}.logic`);
  const platformLocale = useLocale();
  const hasRules = logic && logic.rules && logic.rules.length > 0;
  const isFieldGrouping = ['page', 'section'].includes(field.input_type);
  const isDeleteEnabled = get(field, 'isDeleteEnabled', true);
  const handleDelete = () => {
    if (builtInFieldKeys.includes(field.key)) {
      const newField = { ...field, enabled: false };
      setValue(`customFields.${field.index}`, newField);
      trigger();
      onClose();
    } else {
      onDelete(field.index);
    }
  };

  if (!isNilOrError(platformLocale)) {
    return (
      <Box mt="16px">
        {!isFieldGrouping && (
          <>
            {!isNilOrError(field.isTitleEditable)
              ? field.isTitleEditable
              : true && (
                  <SectionField>
                    <InputMultilocWithLocaleSwitcher
                      initiallySelectedLocale={platformLocale}
                      id="e2e-title-multiloc"
                      name={`customFields.${field.index}.title_multiloc`}
                      label={<FormattedMessage {...messages.questionTitle} />}
                      type="text"
                    />
                  </SectionField>
                )}
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                initiallySelectedLocale={platformLocale}
                name={`customFields.${field.index}.description_multiloc`}
                label={
                  <FormattedMessage {...messages.questionDescriptionOptional} />
                }
                type="text"
              />
            </SectionField>
          </>
        )}
        {getAdditionalSettings(field, locales, platformLocale)}
        {!isFieldGrouping && (
          <>
            <SectionField id="e2e-required-toggle">
              <Toggle
                name={`customFields.${field.index}.required`}
                disabled={
                  !isNilOrError(field.isRequiredEditable)
                    ? !field.isRequiredEditable
                    : hasRules
                }
                label={
                  <Text as="span" color="primary" variant="bodyM" my="0px">
                    <FormattedMessage {...messages.requiredToggleLabel} />
                  </Text>
                }
              />
            </SectionField>
          </>
        )}
        <Box
          display="flex"
          justifyContent="space-between"
          gap="16px"
          borderTop={`1px solid ${colors.divider}`}
          pt="36px"
        >
          <Button
            id="e2e-settings-done-button"
            buttonStyle="secondary"
            onClick={onClose}
            minWidth="160px"
            width={isDeleteEnabled ? '100%' : '100%'}
          >
            <FormattedMessage {...messages.done} />
          </Button>
          {isDeleteEnabled && (
            <Button
              px="28px"
              icon="delete"
              buttonStyle="primary-outlined"
              borderColor={colors.error}
              textColor={colors.error}
              iconColor={colors.error}
              onClick={handleDelete}
              data-cy="e2e-delete-field"
              disabled={isDeleteDisabled}
            />
          )}
        </Box>
      </Box>
    );
  }
  return null;
};
