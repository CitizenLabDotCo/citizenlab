import React from 'react';

import { MessageDescriptor } from 'react-intl';
import { SupportedLocale } from 'typings';

import {
  ICustomFieldInputType,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';
import { IPhaseData } from 'api/phases/types';

import { isNilOrError } from 'utils/helperUtils';

import CharacterLimitSettings from './components/FormBuilderSettings/CharacterLimitSettings';
import ConfigOptionsWithLocaleSwitcher from './components/FormBuilderSettings/ConfigOptionsWithLocaleSwitcher';
import FieldGroupSettings from './components/FormBuilderSettings/FieldGroupSettings';
import LinearAndRatingSettings from './components/FormBuilderSettings/LinearAndRatingSettings';
import MatrixSettings from './components/FormBuilderSettings/MatrixSettings';
import MultiselectSettings from './components/FormBuilderSettings/MultiselectSettings';
import OptionsSettings from './components/FormBuilderSettings/OptionsSettings';
import PageButtonSettings from './components/FormBuilderSettings/PageButtonSettings';
import PageLayoutSettings from './components/FormBuilderSettings/PageLayoutSettings';
import PinCountSettings from './components/FormBuilderSettings/PinCountSettings';
import PointSettings from './components/FormBuilderSettings/PointSettings';
import SentimentLinearScaleSettings from './components/FormBuilderSettings/SentimentLinearScaleSettings';
import TopicsSettings from './components/FormBuilderSettings/TopicsSettings';
import { BuiltInKeyType } from './fieldLabels';

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

  displayBuiltInFields: boolean;
  builtInFields: BuiltInKeyType[];
  showStatusBadge: boolean;

  getDeletionNotice?: (projectId: string) => React.JSX.Element;
  getWarningNotice?: () => React.JSX.Element;
  getAccessRightsNotice?: (
    projectId: string | undefined,
    phaseId: string | undefined,
    handleClose: () => void
  ) => React.JSX.Element | null;
  getUserFieldsNotice?: () => React.ReactNode;
};

// A FormBuilderConfig is a constant per builder, written before any data is
// loaded. These values depend on the phase, which the backend decides per
// participation method, so they are only known once the phase has loaded.
export type ResolvedFormBuilderConfig = FormBuilderConfig & {
  goBackUrl: string;
  isLogicEnabled: boolean;
  isParticipationPublic: boolean;
};

export const resolveFormBuilderConfig = (
  config: FormBuilderConfig,
  phase: IPhaseData,
  goBackUrl: string
): ResolvedFormBuilderConfig => ({
  ...config,
  goBackUrl,
  isLogicEnabled: phase.attributes.supports_form_logic,
  isParticipationPublic: phase.attributes.supports_public_visibility,
});

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
            selectOptionsName={`customFields.${field.index}.options`}
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
            selectOptionsName={`customFields.${field.index}.options`}
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
            selectOptionsName={`customFields.${field.index}.options`}
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
    case 'multipoint':
      return (
        <>
          <PointSettings
            mapConfigIdName={`customFields.${field.index}.map_config_id`}
            field={field}
          />
          <PinCountSettings
            minimumSelectCountName={`customFields.${field.index}.minimum_select_count`}
            maximumSelectCountName={`customFields.${field.index}.maximum_select_count`}
            selectCountToggleName={`customFields.${field.index}.select_count_enabled`}
          />
        </>
      );
    case 'text':
    case 'multiline_text':
    case 'text_multiloc':
    case 'html_multiloc':
      return (
        <CharacterLimitSettings
          minCharactersName={`customFields.${field.index}.min_characters`}
          maxCharactersName={`customFields.${field.index}.max_characters`}
        />
      );
    case 'topic_ids':
      return (
        <TopicsSettings
          minimumSelectCountName={`customFields.${field.index}.minimum_select_count`}
          maximumSelectCountName={`customFields.${field.index}.maximum_select_count`}
          selectCountToggleName={`customFields.${field.index}.select_count_enabled`}
        />
      );
    default:
      return null;
  }
}

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
