import React from 'react';

import { uuid4 } from '@sentry/utils';
import { MessageDescriptor } from 'react-intl';
import { RouteType } from 'routes';
import { SupportedLocale } from 'typings';

import {
  ICustomFieldInputType,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';
import { IPhaseData } from 'api/phases/types';

import { isNilOrError } from 'utils/helperUtils';

import ConfigSelectWithLocaleSwitcher from './components/FormBuilderSettings/ConfigSelectWithLocaleSwitcher';
import FieldGroupSettings from './components/FormBuilderSettings/FieldGroupSettings';
import LinearScaleSettings from './components/FormBuilderSettings/LinearScaleSettings';
import MultiselectSettings from './components/FormBuilderSettings/MultiselectSettings';
import PageLayoutSettings from './components/FormBuilderSettings/PageLayoutSettings';
import PointSettings from './components/FormBuilderSettings/PointSettings';
import SelectSettings from './components/FormBuilderSettings/SelectSettings';
import messages from './components/messages';

export const builtInFieldKeys = [
  'title_multiloc',
  'body_multiloc',
  'proposed_budget',
  'topic_ids',
  'location_description',
  'idea_images_attributes',
  'idea_files_attributes',
  'cosponsor_ids',
];

export type BuiltInKeyType = (typeof builtInFieldKeys)[number];

export type FormBuilderConfig = {
  formBuilderTitle: MessageDescriptor;
  viewFormLinkCopy: MessageDescriptor;
  formSavedSuccessMessage: MessageDescriptor;
  toolboxTitle?: MessageDescriptor;
  supportArticleLink?: MessageDescriptor;
  formEndPageLogicOption?: MessageDescriptor;
  questionLogicHelperText?: MessageDescriptor;
  pagesLogicHelperText?: MessageDescriptor;

  toolboxFieldsToExclude: ICustomFieldInputType[];
  formCustomFields: IFlatCustomField[] | undefined | Error;

  displayBuiltInFields: boolean;
  builtInFields: BuiltInKeyType[];
  showStatusBadge: boolean;
  isLogicEnabled: boolean;
  alwaysShowCustomFields: boolean;
  isFormPhaseSpecific: boolean;

  goBackUrl?: RouteType;

  getDeletionNotice?: (projectId: string) => void;
  getWarningNotice?: () => void;
  getAccessRightsNotice?: (
    projectId: string | undefined,
    phaseId: string | undefined,
    handleClose: () => void
  ) => void;

  groupingType: 'page' | 'section';

  onDownloadPDF?: () => void;
};

export const getIsPostingEnabled = (
  phase?: IPhaseData | Error | null | undefined
) => {
  if (!isNilOrError(phase)) {
    return phase.attributes.submission_enabled;
  }

  return false;
};

export function generateTempId() {
  return `TEMP-ID-${uuid4()}`;
}

// TODO: BE key for survey end options should be replaced with form_end, then we can update this value.
export const formEndOption = 'survey_end';

// TODO: Clean this up and make it an actual component
// Function to return additional settings based on input type
export function getAdditionalSettings(
  field: IFlatCustomFieldWithIndex,
  inputType: ICustomFieldInputType,
  locales: SupportedLocale[],
  platformLocale: SupportedLocale
) {
  if (builtInFieldKeys.includes(field.key)) {
    return null;
  }

  switch (inputType) {
    case 'multiselect_image':
    case 'multiselect':
      return (
        <>
          <ConfigSelectWithLocaleSwitcher
            name={`customFields.${field.index}.options`}
            locales={locales}
            platformLocale={platformLocale}
            inputType={field.input_type}
          />
          <MultiselectSettings
            selectOptionsName={`customFields.${field.index}.options`}
            minimumSelectCountName={`customFields.${field.index}.minimum_select_count`}
            maximumSelectCountName={`customFields.${field.index}.maximum_select_count`}
            selectCountToggleName={`customFields.${field.index}.select_count_enabled`}
          />
          <SelectSettings
            inputType={field.input_type}
            randomizeName={`customFields.${field.index}.random_option_ordering`}
            dropdownLayoutName={`customFields.${field.index}.dropdown_layout`}
          />
        </>
      );
    case 'select':
      return (
        <>
          <ConfigSelectWithLocaleSwitcher
            name={`customFields.${field.index}.options`}
            locales={locales}
            platformLocale={platformLocale}
            inputType={field.input_type}
          />
          <SelectSettings
            inputType={field.input_type}
            randomizeName={`customFields.${field.index}.random_option_ordering`}
            dropdownLayoutName={`customFields.${field.index}.dropdown_layout`}
          />
        </>
      );
    case 'page':
      return (
        <>
          <PageLayoutSettings
            field={field}
            pageLayoutName={`customFields.${field.index}.page_layout`}
          />
          <FieldGroupSettings locale={platformLocale} field={field} />
          <PointSettings
            mapConfigIdName={`customFields.${field.index}.map_config_id`}
            pageLayoutName={`customFields.${field.index}.page_layout`}
            field={field}
          />
        </>
      );
    case 'section':
      return <FieldGroupSettings locale={platformLocale} field={field} />;
    case 'linear_scale':
      return (
        <LinearScaleSettings
          platformLocale={platformLocale}
          maximumName={`customFields.${field.index}.maximum`}
          labelBaseName={`customFields.${field.index}`}
          locales={locales}
        />
      );
    case 'point':
    case 'line':
    case 'polygon':
      return (
        <PointSettings
          mapConfigIdName={`customFields.${field.index}.map_config_id`}
          field={field}
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
    case 'cosponsor_ids':
      translatedStringKey = messages.cosponsors;
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
    case 'multiselect_image':
      translatedStringKey = messages.multipleChoiceImage;
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
    case 'shapefile_upload':
      translatedStringKey = messages.shapefileUpload;
      break;
    case 'point':
      translatedStringKey = messages.dropPin;
      break;
    case 'line':
      translatedStringKey = messages.drawRoute;
      break;
    case 'polygon':
      translatedStringKey = messages.drawArea;
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
