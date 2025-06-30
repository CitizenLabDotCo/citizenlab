import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { SectionField } from 'components/admin/Section';
import { getAdditionalSettings } from 'components/FormBuilder/utils';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Toggle from 'components/HookForm/Toggle';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import FieldTypeSwitcher from '../FieldTypeSwitcher';

type ContentSettingsProps = {
  field: IFlatCustomFieldWithIndex;
};

const ContentSettings = ({ field }: ContentSettingsProps) => {
  const locales = useAppConfigurationLocales();
  const { watch } = useFormContext();
  const lockedAttributes = field.constraints?.locks;
  const platformLocale = useLocale();
  const isFieldGrouping = field.input_type === 'page';

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };
  const disableTogglingRequired = ['body_multiloc', 'title_multiloc'].includes(
    field.code || ''
  );

  if (!locales) {
    return null;
  }

  return (
    <Box mt="16px">
      {!isFieldGrouping && (
        <>
          <FieldTypeSwitcher field={field} />
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
        <SectionField id="e2e-required-toggle">
          <Toggle
            name={`customFields.${field.index}.required`}
            disabled={disableTogglingRequired}
            label={
              <Text as="span" variant="bodyM" my="0px">
                <FormattedMessage {...messages.requiredToggleLabel} />
              </Text>
            }
          />
        </SectionField>
      )}
    </Box>
  );
};

export default ContentSettings;
