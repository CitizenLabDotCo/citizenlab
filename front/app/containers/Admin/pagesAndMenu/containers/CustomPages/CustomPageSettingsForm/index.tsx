import React from 'react';

import {
  Box,
  IconTooltip,
  Label,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { array, object, string } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IAreaData } from 'api/areas/types';
import useAreas from 'api/areas/useAreas';
import { ProjectsFilterTypes } from 'api/custom_pages/types';
import { ITopicData } from 'api/topics/types';
import useTopics from 'api/topics/useTopics';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import Select from 'components/HookForm/Select';
import SlugInput from 'components/HookForm/SlugInput';
import Tabs from 'components/HookForm/Tabs';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';
import { slugRegEx } from 'utils/textUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../messages';

const LinkedProjectContainer = styled(Box)<{ disabled: boolean }>`
  &:hover {
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  }
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const SelectContainer = styled(Box)`
  position: relative;
  z-index: 2;
`;

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
  hideSlug?: boolean;
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
  hideSlug,
  onSubmit,
  defaultValues,
}: Props) => {
  const localize = useLocalize();
  const isFeatureEnabled = useFeatureFlag({ name: 'advanced_custom_pages' });
  const isFeatureAllowed = useFeatureFlag({
    name: 'advanced_custom_pages',
    onlyCheckAllowed: true,
  });
  const showPlanUpgradeTease = !isFeatureAllowed;
  const showAdvancedCustomPages = showPlanUpgradeTease || isFeatureEnabled;
  const { data: areas } = useAreas({});
  const { data: appConfig } = useAppConfiguration();
  const locale = useLocale();
  const configuredLocales = useAppConfigurationLocales();
  const { data: topics } = useTopics();
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
    ? `${appConfig.data.attributes.host}/${locale}/pages/${slug}`
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
              <ButtonWithLink
                data-cy="e2e-submit-custom-page"
                type="submit"
                processing={methods.formState.isSubmitting}
                bgColor={colors.blue500}
              >
                {formatMessage(messages.saveButton)}
              </ButtonWithLink>
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
              />
            </Box>
            {showNavBarItemTitle && (
              <Box mb={fieldMarginBottom}>
                <InputMultilocWithLocaleSwitcher
                  label={formatMessage(messages.navbarItemTitle)}
                  name="nav_bar_item_title_multiloc"
                />
              </Box>
            )}
            {!hideSlug && (
              <Box mb={fieldMarginBottom}>
                <SlugInput
                  slug={slug}
                  showWarningMessage={slugHasChanged}
                  previewUrl={previewUrl}
                />
              </Box>
            )}

            {showAdvancedCustomPages && (
              <LinkedProjectContainer
                display="inline-flex"
                disabled={showPlanUpgradeTease}
              >
                <Tooltip
                  maxWidth="250px"
                  placement="right-end"
                  content={formatMessage(messages.contactGovSuccessToAccess)}
                  disabled={!showPlanUpgradeTease}
                  hideOnClick={false}
                >
                  <div>
                    <Box mb={fieldMarginBottom}>
                      <Box
                        display="flex"
                        justifyContent="flex-start"
                        width="100%"
                      >
                        <Label>
                          <span>
                            {formatMessage(messages.linkedProjectsLabel)}
                          </span>
                          <IconTooltip
                            ml="10px"
                            content={formatMessage(
                              messages.linkedProjectsTooltip
                            )}
                          />
                        </Label>
                      </Box>
                      <Box mb="30px">
                        <Tabs
                          name="projects_filter_type"
                          items={projectsFilterTabs}
                          minTabWidth={120}
                          disabled={showPlanUpgradeTease}
                        />
                      </Box>
                      {methods.watch('projects_filter_type') === 'topics' && (
                        <SelectContainer mb="30px">
                          <MultipleSelect
                            name="topic_ids"
                            options={mapFilterEntityToOptions(topics.data)}
                            label={formatMessage(messages.selectedTagsLabel)}
                          />
                        </SelectContainer>
                      )}
                      {methods.watch('projects_filter_type') === 'areas' && (
                        <SelectContainer mb="20px">
                          <Select
                            name="area_id"
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            options={mapFilterEntityToOptions(areas?.data)}
                            label={formatMessage(messages.selectedAreasLabel)}
                          />
                        </SelectContainer>
                      )}
                    </Box>
                  </div>
                </Tooltip>
              </LinkedProjectContainer>
            )}
          </SectionField>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default CustomPageSettingsForm;
