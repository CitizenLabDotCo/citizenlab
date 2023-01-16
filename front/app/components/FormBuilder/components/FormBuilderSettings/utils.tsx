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

export function isRequiredToggleAllowed(field: IFlatCustomFieldWithIndex) {
  const keysAlwaysRequired: string[] = ['title_multiloc', 'body_multiloc'];
  return keysAlwaysRequired.includes(field.key);
}

export function isResponseToggleAllowed(field: IFlatCustomFieldWithIndex) {
  const keysResponsesAlwaysShown: string[] = [
    'title_multiloc',
    'body_multiloc',
    'idea_images_attributes',
  ];
  return keysResponsesAlwaysShown.includes(field.key);
}

export function isEnabledToggleAllowed(field: IFlatCustomFieldWithIndex) {
  const keysAlwaysEnabled: string[] = [
    'title_multiloc',
    'body_multiloc',
    'idea_images_attributes',
  ];
  return keysAlwaysEnabled.includes(field.key);
}

export function isTitleConfigurable(field: IFlatCustomFieldWithIndex) {
  const keysWithoutConfigurableTitle: string[] = [
    'title_multiloc',
    'body_multiloc',
    'idea_images_attributes',
  ];
  return !keysWithoutConfigurableTitle.includes(field.key);
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
