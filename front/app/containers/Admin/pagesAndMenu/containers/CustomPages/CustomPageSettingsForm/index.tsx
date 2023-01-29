import React from 'react';

// form
import Feedback from 'components/HookForm/Feedback';
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import { yupResolver } from '@hookform/resolvers/yup';
import { array, object, string } from 'yup';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import { slugRegEx } from 'utils/textUtils';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import SlugInput from 'components/HookForm/SlugInput';
import Tabs from 'components/HookForm/Tabs';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import Select from 'components/HookForm/Select';
import {
  Box,
  IconTooltip,
  Label,
  colors,
} from '@citizenlab/cl2-component-library';

// hooks
import useTopics from 'hooks/useTopics';
import useAreas from 'hooks/useAreas';
import useLocalize from 'hooks/useLocalize';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';

// utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

// intl
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

// types
import { Multiloc } from 'typings';
import { IAreaData } from 'services/areas';
import { ITopicData } from 'services/topics';
import { ProjectsFilterTypes } from 'services/customPages';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

export interface FormValues {
  title_multiloc: Multiloc;
  nav_bar_item_title_multiloc?: Multiloc;
  slug?: string;
  projects_filter_type: ProjectsFilterTypes;
  topic_ids?: string[];
  area_id?: string | null;
}

type TMode = 'new' | 'edit';
interface Props {
  defaultValues?: Partial<FormValues>;
  showNavBarItemTitle?: boolean;
  mode: TMode;
  onSubmit: (formValues: FormValues) => void | Promise<void>;
}

const projectsFilterTypesArray: ProjectsFilterTypes[] = [
  'no_filter',
  'topics',
  'areas',
];

const fieldMarginBottom = '40px';

const CustomPageSettingsForm = ({
  showNavBarItemTitle,
  mode,
  onSubmit,
  defaultValues,
}: Props) => {
  const localize = useLocalize();
  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });
  const areas = useAreas();
  const appConfig = useAppConfiguration();
  const locale = useLocale();
  const configuredLocales = useAppConfigurationLocales();
  const topics = useTopics();
  const { formatMessage } = useIntl();

  const hasMultipleConfiguredLocales = !isNilOrError(configuredLocales)
    ? configuredLocales.length > 1
    : false;

  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(
        hasMultipleConfiguredLocales
          ? messages.titleMultilocError
          : messages.titleSinglelocError
      )
    ),
    ...(showNavBarItemTitle && {
      nav_bar_item_title_multiloc: validateMultilocForEveryLocale(
        formatMessage(
          hasMultipleConfiguredLocales
            ? messages.titleMultilocError
            : messages.titleSinglelocError
        )
      ),
    }),
    ...(mode === 'edit' && {
      slug: string()
        .matches(slugRegEx, formatMessage(messages.slugRegexError))
        .required(formatMessage(messages.slugRequiredError)),
    }),
    projects_filter_type: string().oneOf(projectsFilterTypesArray).required(),
    topic_ids: array().when('projects_filter_type', {
      is: (value: ProjectsFilterTypes) => value === 'topics',
      then: array().of(string()).min(1, formatMessage(messages.atLeastOneTag)),
    }),
    area_id: string()
      .nullable()
      .when('projects_filter_type', {
        is: (value: ProjectsFilterTypes) => value === 'areas',
        then: string()
          .nullable()
          .required(formatMessage(messages.selectAnArea)),
      }),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const slug = methods.watch('slug');
  const slugHasChanged = slug !== defaultValues?.slug;

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const mapFilterEntityToOptions = (input: IAreaData[] | ITopicData[]) => {
    return input.map((entity) => {
      return {
        value: entity.id,
        label: localize(entity.attributes.title_multiloc),
      };
    });
  };

  const projectsFilterTabs: { name: ProjectsFilterTypes; label: string }[] = [
    {
      name: 'no_filter',
      label: formatMessage(messages.noFilter),
    },
    {
      name: 'topics',
      label: formatMessage(messages.byTagsFilter),
    },
    {
      name: 'areas',
      label: formatMessage(messages.byAreaFilter),
    },
  ];

  if (
    isNilOrError(areas) ||
    isNilOrError(topics) ||
    isNilOrError(locale) ||
    isNilOrError(appConfig)
  ) {
    return null;
  }

  const previewUrl = slug
    ? `${appConfig.attributes.host}/${locale}/pages/${slug}`
    : null;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}
        data-testid="customPageSettingsForm"
      >
        <SectionFormWrapper
          stickyMenuContents={
            <Box display="flex">
              <Button
                data-cy="e2e-submit-custom-page"
                type="submit"
                processing={methods.formState.isSubmitting}
                bgColor={colors.blue500}
              >
                {formatMessage(messages.saveButton)}
              </Button>
            </Box>
          }
          flatTopBorder
        >
          <SectionField>
            <Feedback
              successMessage={
                mode === 'edit'
                  ? formatMessage(messages.messageEditSuccess)
                  : formatMessage(messages.messageCreatedSuccess)
              }
            />
            <Box mb={fieldMarginBottom}>
              <InputMultilocWithLocaleSwitcher
                name="title_multiloc"
                label={formatMessage(messages.titleLabel)}
                type="text"
              />
            </Box>
            {showNavBarItemTitle && (
              <Box mb={fieldMarginBottom}>
                <InputMultilocWithLocaleSwitcher
                  label={formatMessage(messages.navbarItemTitle)}
                  type="text"
                  name="nav_bar_item_title_multiloc"
                />
              </Box>
            )}
            {slug && previewUrl && (
              <Box mb={fieldMarginBottom}>
                <SlugInput
                  slug={slug}
                  showWarningMessage={slugHasChanged}
                  previewUrl={previewUrl}
                />
              </Box>
            )}

            {advancedCustomPagesEnabled && (
              <Box mb={fieldMarginBottom}>
                <Box display="flex" justifyContent="flex-start">
                  <Label>
                    <span>{formatMessage(messages.linkedProjectsLabel)}</span>
                    <IconTooltip
                      ml="10px"
                      content={formatMessage(messages.linkedProjectsTooltip)}
                    />
                  </Label>
                </Box>
                <Box mb="30px">
                  <Tabs
                    name="projects_filter_type"
                    items={projectsFilterTabs}
                    minTabWidth={120}
                  />
                </Box>
                {methods.watch('projects_filter_type') === 'topics' && (
                  <Box mb="30px">
                    <MultipleSelect
                      name="topic_ids"
                      options={mapFilterEntityToOptions(topics)}
                      label={formatMessage(messages.selectedTagsLabel)}
                    />
                  </Box>
                )}
                {methods.watch('projects_filter_type') === 'areas' && (
                  <Box mb="20px">
                    <Select
                      name="area_id"
                      options={mapFilterEntityToOptions(areas)}
                      label={formatMessage(messages.selectedAreasLabel)}
                    />
                  </Box>
                )}
              </Box>
            )}
          </SectionField>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default CustomPageSettingsForm;
