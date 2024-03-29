import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { useFormContext } from 'react-hook-form';
import { CLLocale } from 'typings';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import useLocale from 'hooks/useLocale';

import { SectionField } from 'components/admin/Section';
import { getAdditionalSettings } from 'components/FormBuilder/utils';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Toggle from 'components/HookForm/Toggle';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

type ContentSettingsProps = {
  field: IFlatCustomFieldWithIndex;
  locales: CLLocale[];
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
                  <Text as="span" variant="bodyM" my="0px">
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
