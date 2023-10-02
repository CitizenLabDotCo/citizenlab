import React from 'react';
import {
  ICustomFieldInputType,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';
import { Locale } from 'typings';
import messages from '../messages';

// Components
import ConfigSelectWithLocaleSwitcher from './ConfigSelectWithLocaleSwitcher';
import LinearScaleSettings from './LinearScaleSettings';
import FieldGroupSettings from './FieldGroupSettings';
import MultiselectSettings from './MultiselectSettings';

// utils
import { uuid4 } from '@sentry/utils';
import { MessageDescriptor } from 'react-intl';
import { builtInFieldKeys } from 'components/FormBuilder/utils';

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
  if (builtInFieldKeys.includes(field.key)) {
    return null;
  }

  switch (field.input_type) {
    case 'multiselect':
      return (
        <>
          <ConfigSelectWithLocaleSwitcher
            name={`customFields.${field.index}.options`}
            locales={locales}
            platformLocale={platformLocale}
          />
          <MultiselectSettings
            selectOptionsName={`customFields.${field.index}.options`}
            minimumSelectCountName={`customFields.${field.index}.minimum_select_count`}
            maximumSelectCountName={`customFields.${field.index}.maximum_select_count`}
            selectCountToggleName={`customFields.${field.index}.select_count_enabled`}
          />
        </>
      );
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

const getBuiltInFieldStringKey = (
  key: string
): MessageDescriptor | undefined => {
  let translatedStringKey: MessageDescriptor | undefined;
  switch (key) {
    case 'title_multiloc':
      translatedStringKey = messages.title;
      break;
    case 'body_multiloc':
      translatedStringKey = messages.description;
      break;
    case 'location_description':
      translatedStringKey = messages.locationDescription;
      break;
    case 'idea_images_attributes':
      translatedStringKey = messages.imageFileUpload;
      break;
    case 'idea_files_attributes':
      translatedStringKey = messages.fileUpload;
      break;
    case 'topic_ids':
      translatedStringKey = messages.tags;
      break;
    case 'proposed_budget':
      translatedStringKey = messages.proposedBudget;
      break;
  }

  return translatedStringKey;
};

const getInputTypeStringKey = (
  inputType: ICustomFieldInputType
): MessageDescriptor | undefined => {
  let translatedStringKey: MessageDescriptor | undefined;
  switch (inputType) {
    case 'title_multiloc':
      translatedStringKey = messages.title;
      break;
    case 'text':
      translatedStringKey = messages.shortAnswer;
      break;
    case 'multiline_text':
      translatedStringKey = messages.longAnswer;
      break;
    case 'select':
      translatedStringKey = messages.singleChoice;
      break;
    case 'multiselect':
      translatedStringKey = messages.multipleChoice;
      break;
    case 'page':
      translatedStringKey = messages.page;
      break;
    case 'section':
      translatedStringKey = messages.section;
      break;
    case 'number':
      translatedStringKey = messages.number;
      break;
    case 'linear_scale':
      translatedStringKey = messages.linearScale;
      break;
    case 'file_upload':
      translatedStringKey = messages.fileUpload;
      break;
  }

  return translatedStringKey;
};

export const getTranslatedStringKey = (
  inputType: ICustomFieldInputType,
  key: string
): MessageDescriptor | undefined => {
  return builtInFieldKeys.includes(key)
    ? getBuiltInFieldStringKey(key)
    : getInputTypeStringKey(inputType);
};
