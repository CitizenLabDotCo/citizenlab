import React from 'react';
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';
import { Locale } from 'typings';

// Components
import ConfigMultiselectWithLocaleSwitcher from './ConfigMultiselectWithLocaleSwitcher';
import LinearScaleSettings from './LinearScaleSettings';
import PageSettings from './PageSettings';

// Function to return additional settings based on input type
export function getAdditionalSettings(
  field: IFlatCustomFieldWithIndex,
  locales: Locale[]
) {
  switch (field.input_type) {
    case 'multiselect':
    case 'select':
      return (
        <ConfigMultiselectWithLocaleSwitcher
          nameInputType={`customFields.${field.index}.input_type`}
          name={`customFields.${field.index}.options`}
          locales={locales}
        />
      );
    case 'page':
      return <PageSettings field={field} />;
    case 'linear_scale':
      return (
        <LinearScaleSettings
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
