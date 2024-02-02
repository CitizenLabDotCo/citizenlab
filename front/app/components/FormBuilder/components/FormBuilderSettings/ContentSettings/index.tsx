import React from 'react';
import { useFormContext } from 'react-hook-form';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
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
import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import { get } from 'lodash-es';

type ContentSettingsProps = {
  field: IFlatCustomFieldWithIndex;
  locales: Locale[];
};

export const ContentSettings = ({ field, locales }: ContentSettingsProps) => {
  const { watch } = useFormContext();
  const logic = watch(`customFields.${field.index}.logic`);
  const lockedAttributes = field?.constraints?.locks;
  const platformLocale = useLocale();
  const hasRules = logic && logic.rules && logic.rules.length > 0;
  const isFieldGrouping = ['page', 'section'].includes(field.input_type);

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  if (!isNilOrError(platformLocale)) {
    return (
      <Box mt="16px">
        {!isFieldGrouping && (
          <>
            {!lockedAttributes?.title_multiloc && (
              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  initiallySelectedLocale={platformLocale}
                  id="e2e-title-multiloc"
                  name={`customFields.${field.index}.title_multiloc`}
                  label={<FormattedMessage {...messages.questionTitle} />}
                  onKeyDown={handleKeyDown}
                />
              </SectionField>
            )}
            <SectionField>
              <QuillMultilocWithLocaleSwitcher
                name={`customFields.${field.index}.description_multiloc`}
                label={
                  <FormattedMessage {...messages.questionDescriptionOptional} />
                }
                noAlign={true}
                maxHeight="150px"
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
                disabled={get(lockedAttributes, 'required', hasRules)}
                label={
                  <Text as="span" color="primary" variant="bodyM" my="0px">
                    <FormattedMessage {...messages.requiredToggleLabel} />
                  </Text>
                }
              />
            </SectionField>
          </>
        )}
      </Box>
    );
  }
  return null;
};
