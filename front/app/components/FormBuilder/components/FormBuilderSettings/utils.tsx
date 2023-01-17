import React from 'react';
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';
import { Locale } from 'typings';

// Components
import ConfigSelectWithLocaleSwitcher from './ConfigSelectWithLocaleSwitcher';
import LinearScaleSettings from './LinearScaleSettings';
import FieldGroupSettings from './FieldGroupSettings';

// utils
import { uuid4 } from '@sentry/utils';

export function generateTempId() {
  return `TEMP-ID-${uuid4()}`;
}

// TODO: BE key for survey end options should be replaced with form_end, then we can update this value.
export const formEndOption = 'survey_end';

// Function to return additional settings based on input type
export function getAdditionalSettings(
  field: IFlatCustomFieldWithIndex,
  locales: Locale[],
  platformLocale: Locale
) {
  switch (field.input_type) {
    case 'multiselect':
    case 'select':
      return (
        <ConfigSelectWithLocaleSwitcher
          name={`customFields.${field.index}.options`}
          locales={locales}
          platformLocale={platformLocale}
        />
      );
    case 'page':
    case 'section':
      return <FieldGroupSettings locale={platformLocale} field={field} />;
    case 'linear_scale':
      return (
        <LinearScaleSettings
          platformLocale={platformLocale}
          maximumName={`customFields.${field.index}.maximum`}
          minimumLabelName={`customFields.${field.index}.minimum_label_multiloc`}
          maximumLabelName={`customFields.${field.index}.maximum_label_multiloc`}
          locales={locales}
        />
      );
    default:
      return null;
  }
}
