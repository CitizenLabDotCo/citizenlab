import React from 'react';
import { useFormContext } from 'react-hook-form';

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
  const { watch } = useFormContext();
  const logic = watch(`customFields.${field.index}.logic`);
  const platformLocale = useLocale();
  const hasRules = logic && logic.rules && logic.rules.length > 0;

  if (!isNilOrError(platformLocale)) {
    return (
      <Box mt="16px">
        {field.input_type !== 'page' && (
          <>
            <SectionField id="e2e-required-toggle">
              <Toggle
                name={`customFields.${field.index}.required`}
                disabled={hasRules}
                label={
                  <Text as="span" color="primary" variant="bodyM" my="0px">
                    <FormattedMessage {...messages.requiredToggleLabel} />
                  </Text>
                }
              />
            </SectionField>
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                initiallySelectedLocale={platformLocale}
                id="e2e-title-multiloc"
                name={`customFields.${field.index}.title_multiloc`}
                label={<FormattedMessage {...messages.questionTitle} />}
                type="text"
              />
            </SectionField>
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
    );
  }
  return null;
};
