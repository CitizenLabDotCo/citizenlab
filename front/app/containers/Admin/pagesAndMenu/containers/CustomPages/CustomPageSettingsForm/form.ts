import { FormatMessage } from 'typings';
import { array, object, string } from 'yup';

import { ProjectsFilterTypes } from 'api/custom_pages/types';

import { slugRegEx } from 'utils/textUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../messages';

const projectsFilterTypes: ProjectsFilterTypes[] = [
  'no_filter',
  'global_topics',
  'areas',
  'spaces',
];

const getLinkedItemsSchema = (formatMessage: FormatMessage) => ({
  global_topic_ids: array()
    .nullable()
    .when('projects_filter_type', ([value]) => {
      if (value === 'global_topics') {
        return array()
          .of(string())
          .min(1, formatMessage(messages.atLeastOneTag));
      }

      return array();
    }),
  area_id: string()
    .nullable()
    .when('projects_filter_type', ([value]) => {
      if (value === 'areas') {
        return string().required(formatMessage(messages.selectAnArea));
      }

      return string().nullable();
    }),
  space_ids: array()
    .nullable()
    .when('projects_filter_type', ([value]) => {
      if (value === 'spaces') {
        return array()
          .of(string())
          .min(1, formatMessage(messages.selectASpace));
      }

      return array();
    }),
});

interface SchemaOptions {
  hasMultipleConfiguredLocales: boolean;
  showNavBarItemTitle?: boolean;
  mode: 'new' | 'edit';
  hideLinkedItems?: boolean;
}

export const getSchema = (
  formatMessage: FormatMessage,
  {
    hasMultipleConfiguredLocales,
    showNavBarItemTitle,
    mode,
    hideLinkedItems,
  }: SchemaOptions
) => {
  const titleError = formatMessage(
    hasMultipleConfiguredLocales
      ? messages.titleMultilocError
      : messages.titleSinglelocError
  );

  return object({
    title_multiloc: validateMultilocForEveryLocale(titleError),
    ...(showNavBarItemTitle && {
      nav_bar_item_title_multiloc: validateMultilocForEveryLocale(titleError),
    }),
    ...(mode === 'edit' && {
      slug: string()
        .matches(slugRegEx, formatMessage(messages.slugRegexError))
        .required(formatMessage(messages.slugRequiredError)),
    }),
    projects_filter_type: string().oneOf(projectsFilterTypes).required(),
    // Hidden fields keep the page's stored values, which can no longer be valid (a deleted
    // area, say). Checking them would block the save with an error the admin cannot see.
    ...(!hideLinkedItems && getLinkedItemsSchema(formatMessage)),
  });
};
