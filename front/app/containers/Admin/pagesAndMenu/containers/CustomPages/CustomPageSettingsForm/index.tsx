import React, { useState } from 'react';

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

// utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

// intl
import messages from '../messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// types
import { Multiloc } from 'typings';
import { IAreaData } from 'services/areas';
import { ITopicData } from 'services/topics';
import { ProjectsFilterTypes } from 'services/customPages';

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

const CustomPageSettingsForm = ({
  showNavBarItemTitle,
  intl: { formatMessage },
  mode,
  onSubmit,
  defaultValues,
}: Props & WrappedComponentProps) => {
  const localize = useLocalize();
  const [_titleErrors, _setTitleErrors] = useState<Multiloc>({});
  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });
  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.titleMultilocError)
    ),
    ...(showNavBarItemTitle && {
      nav_bar_item_title_multiloc: validateMultilocForEveryLocale(
        formatMessage(messages.titleMultilocError)
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

  const areas = useAreas();
  const topics = useTopics();

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

  if (isNilOrError(areas) || isNilOrError(topics)) {
    return null;
  }

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
            <Box mb="30px">
              <InputMultilocWithLocaleSwitcher
                name="title_multiloc"
                label={formatMessage(messages.titleLabel)}
                type="text"
              />
            </Box>
            {showNavBarItemTitle && (
              <Box mb="30px">
                <InputMultilocWithLocaleSwitcher
                  label={formatMessage(messages.navbarItemTitle)}
                  type="text"
                  name="nav_bar_item_title_multiloc"
                />
              </Box>
            )}
            {mode === 'edit' && (
              <SlugInput
                slug={slug}
                pathnameWithoutSlug="pages"
                showWarningMessage={slugHasChanged}
              />
            )}
            {advancedCustomPagesEnabled && (
              <Box>
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
                      label={
                        <>
                          {formatMessage(messages.selectedTagsLabel)}
                          <IconTooltip content={'add some tags'} />
                        </>
                      }
                    />
                  </Box>
                )}
                {methods.watch('projects_filter_type') === 'areas' && (
                  <Box mb="20px">
                    <Select
                      name="area_id"
                      options={mapFilterEntityToOptions(areas)}
                      label={formatMessage(messages.selectedAreasLabel)}
                      labelTooltipText="choose an area"
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

export default injectIntl(CustomPageSettingsForm);
