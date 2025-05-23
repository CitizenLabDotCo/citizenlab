import React from 'react';

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

import ConfigOptionsWithLocaleSwitcher from './components/FormBuilderSettings/ConfigOptionsWithLocaleSwitcher';
import FieldGroupSettings from './components/FormBuilderSettings/FieldGroupSettings';
import LinearAndRatingSettings from './components/FormBuilderSettings/LinearAndRatingSettings';
import MatrixSettings from './components/FormBuilderSettings/MatrixSettings';
import MultiselectSettings from './components/FormBuilderSettings/MultiselectSettings';
import OptionsSettings from './components/FormBuilderSettings/OptionsSettings';
import PageButtonSettings from './components/FormBuilderSettings/PageButtonSettings';
import PageLayoutSettings from './components/FormBuilderSettings/PageLayoutSettings';
import PointSettings from './components/FormBuilderSettings/PointSettings';
import SentimentLinearScaleSettings from './components/FormBuilderSettings/SentimentLinearScaleSettings';
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

export type FormType = 'survey' | 'input_form';
export type FormBuilderConfig = {
  type: FormType;
  formBuilderTitle: MessageDescriptor;
  viewFormLinkCopy: MessageDescriptor;
  formSavedSuccessMessage: MessageDescriptor;
  toolboxTitle?: MessageDescriptor;
  supportArticleLink?: MessageDescriptor;
  formEndPageLogicOption?: MessageDescriptor;
  pagesLogicHelperText?: MessageDescriptor;

  toolboxFieldsToInclude: ICustomFieldInputType[];
  formCustomFields: IFlatCustomField[] | undefined | Error;

  displayBuiltInFields: boolean;
  builtInFields: BuiltInKeyType[];
  showStatusBadge: boolean;
  isLogicEnabled: boolean;
  alwaysShowCustomFields: boolean;
  /* For Ideation, when you configure the form it gets applied to ALL ideation phases within a project, 
  however when you configure the form for surveys for example, 
  each survey phase within a project can have a different form */
  isFormPhaseSpecific: boolean;

  goBackUrl?: RouteType;

  getDeletionNotice?: (projectId: string) => React.JSX.Element;
  getWarningNotice?: () => React.JSX.Element;
  getAccessRightsNotice?: (
    projectId: string | undefined,
    phaseId: string | undefined,
    handleClose: () => void
  ) => React.JSX.Element | null;
  getUserFieldsNotice?: () => void;
};

export const getIsPostingEnabled = (
  phase?: IPhaseData | Error | null | undefined
) => {
  if (!isNilOrError(phase)) {
    return phase.attributes.submission_enabled;
  }

  return false;
};

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
    case 'sentiment_linear_scale':
      return (
        <SentimentLinearScaleSettings
          platformLocale={platformLocale}
          maximumName={`customFields.${field.index}.maximum`}
          askFollowUpName={`customFields.${field.index}.ask_follow_up`}
          labelBaseName={`customFields.${field.index}`}
          locales={locales}
        />
      );
    case 'matrix_linear_scale':
      return (
        <MatrixSettings
          field={field}
          locales={locales}
          platformLocale={platformLocale}
        />
      );
    case 'multiselect_image':
    case 'multiselect':
      return (
        <>
          <ConfigOptionsWithLocaleSwitcher
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
          <OptionsSettings
            inputType={field.input_type}
            randomizeName={`customFields.${field.index}.random_option_ordering`}
            dropdownLayoutName={`customFields.${field.index}.dropdown_layout`}
          />
        </>
      );
    case 'ranking':
      return (
        <>
          <ConfigOptionsWithLocaleSwitcher
            name={`customFields.${field.index}.options`}
            locales={locales}
            platformLocale={platformLocale}
            inputType={field.input_type}
          />
          <OptionsSettings
            inputType={field.input_type}
            randomizeName={`customFields.${field.index}.random_option_ordering`}
            dropdownLayoutName={`customFields.${field.index}.dropdown_layout`}
          />
        </>
      );
    case 'select':
      return (
        <>
          <ConfigOptionsWithLocaleSwitcher
            name={`customFields.${field.index}.options`}
            locales={locales}
            platformLocale={platformLocale}
            inputType={field.input_type}
          />
          <OptionsSettings
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
          {field.key === 'form_end' && (
            <PageButtonSettings
              pageButtonLabelMultilocName={`customFields.${field.index}.page_button_label_multiloc`}
              pageButtonLinkName={`customFields.${field.index}.page_button_link`}
            />
          )}
          <PointSettings
            mapConfigIdName={`customFields.${field.index}.map_config_id`}
            pageLayoutName={`customFields.${field.index}.page_layout`}
            field={field}
          />
        </>
      );
    case 'linear_scale':
    case 'rating':
      return (
        <LinearAndRatingSettings
          platformLocale={platformLocale}
          maximumName={`customFields.${field.index}.maximum`}
          labelBaseName={`customFields.${field.index}`}
          locales={locales}
          inputType={inputType}
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
    case 'number':
      translatedStringKey = messages.number;
      break;
    case 'linear_scale':
      translatedStringKey = messages.linearScale;
      break;
    case 'rating':
      translatedStringKey = messages.rating;
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
    case 'ranking':
      translatedStringKey = messages.ranking;
      break;
    case 'matrix_linear_scale':
      translatedStringKey = messages.matrix;
      break;
    case 'sentiment_linear_scale':
      translatedStringKey = messages.sentiment;
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

export const findNextPageAfterCurrentPage = (
  allFields: IFlatCustomField[],
  fieldId: string
) => {
  const index = allFields.findIndex((item) => item.id === fieldId);
  if (index !== -1) {
    const nextPage = allFields
      .slice(index + 1)
      .find((item) => item.input_type === 'page');
    if (nextPage?.id) return nextPage.id;
  }
  return 'form_end';
};
