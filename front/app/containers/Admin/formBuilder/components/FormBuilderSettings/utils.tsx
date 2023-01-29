import React from 'react';
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';
import { Locale } from 'typings';

// Components
import ConfigSelectWithLocaleSwitcher from './ConfigSelectWithLocaleSwitcher';
import LinearScaleSettings from './LinearScaleSettings';
import PageSettings from './PageSettings';

// utils
import { uuid4 } from '@sentry/utils';

export function generateTempId() {
  return `TEMP-ID-${uuid4()}`;
}

export const surveyEndOption = 'survey_end';

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
      return <PageSettings locale={platformLocale} field={field} />;
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
