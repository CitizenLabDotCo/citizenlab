import React from 'react';
import { ICustomFieldInputType } from 'services/formCustomFields';
import { Locale } from 'typings';

// Components
import ConfigMultiselectWithLocaleSwitcher from './ConfigMultiselectWithLocaleSwitcher';
import LinearScaleSettings from './LinearScaleSettings';

// Function to return additional settings based on input type
export function getAdditionalSettings(
  type: ICustomFieldInputType,
  locales: Locale[],
  index: number
) {
  switch (type) {
    case 'multiselect':
      return (
        <ConfigMultiselectWithLocaleSwitcher
          name={`customFields.${index}.options`}
          locales={locales}
        />
      );
    case 'linear_scale':
      return (
        <LinearScaleSettings
          maximumName={`customFields.${index}.maximum`}
          minimumLabelName={`customFields.${index}.minimum_label_multiloc`}
          maximumLabelName={`customFields.${index}.maximum_label_multiloc`}
          locales={locales}
        />
      );
    default:
      return null;
  }
}
