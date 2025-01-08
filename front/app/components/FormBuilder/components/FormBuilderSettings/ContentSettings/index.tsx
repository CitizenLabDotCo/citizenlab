import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import { SupportedLocale } from 'typings';

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
import FieldTypeSwitcher from '../FieldTypeSwitcher';

type ContentSettingsProps = {
  field: IFlatCustomFieldWithIndex;
  locales: SupportedLocale[];
  formHasSubmissions: boolean;
};

export const ContentSettings = ({
  field,
  locales,
  formHasSubmissions,
}: ContentSettingsProps) => {
  const { watch } = useFormContext();
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const lockedAttributes = field?.constraints?.locks;
  const platformLocale = useLocale();
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
            <FieldTypeSwitcher
              field={field}
              formHasSubmissions={formHasSubmissions}
            />
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
        {getAdditionalSettings(
          field,
          watch(`customFields.${field.index}.input_type`),
          locales,
          platformLocale
        )}
        {!isFieldGrouping && (
          <>
            <SectionField id="e2e-required-toggle">
              <Toggle
                name={`customFields.${field.index}.required`}
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
