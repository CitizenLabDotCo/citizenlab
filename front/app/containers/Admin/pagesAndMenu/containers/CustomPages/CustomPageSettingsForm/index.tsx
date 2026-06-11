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
import { IGlobalTopicData } from 'api/global_topics/types';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import { SpaceData } from 'api/spaces/types';
import useSpaces from 'api/spaces/useSpaces';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import RadioGroup from 'components/HookForm/RadioGroup';
import Radio from 'components/HookForm/RadioGroup/Radio';
import Select from 'components/HookForm/Select';
import SlugInput from 'components/HookForm/SlugInput';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import NewLabel from 'components/UI/NewLabel';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
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
  global_topic_ids?: string[];
  area_id?: string | null;
  space_ids?: string[];
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
  'global_topics',
  'areas',
  'spaces',
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
  const isSpacesEnabled = useFeatureFlag({ name: 'spaces' });
  const showPlanUpgradeTease = !isFeatureAllowed;
  const showAdvancedCustomPages = showPlanUpgradeTease || isFeatureEnabled;
  const { data: areas } = useAreas({});
  const { data: appConfig } = useAppConfiguration();
  const locale = useLocale();
  const configuredLocales = useAppConfigurationLocales();
  const { data: topics } = useGlobalTopics();
  const { data: spaces } = useSpaces();
  const { formatMessage } = useIntl();

  const hasMultipleConfiguredLocales = configuredLocales
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

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema) as any,
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

  const mapFilterEntityToOptions = (
    input: IAreaData[] | IGlobalTopicData[] | SpaceData[]
  ) => {
    return input.map((entity) => {
      return {
        value: entity.id,
        label: localize(entity.attributes.title_multiloc),
      };
    });
  };

  const projectsFilterOptions: {
    value: ProjectsFilterTypes;
    label: string;
    isNew?: boolean;
  }[] = [
    {
      value: 'no_filter',
      label: formatMessage(messages.noFilter),
    },
    {
      value: 'global_topics',
      label: formatMessage(messages.byTagsFilter),
    },
    {
      value: 'areas',
      label: formatMessage(messages.byAreaFilter),
    },
    ...(isSpacesEnabled
      ? [
          {
            value: 'spaces' as const,
            label: formatMessage(messages.bySpaceFilter),
            isNew: true,
          },
        ]
      : []),
  ];

  if (!areas || !topics || !appConfig || (isSpacesEnabled && !spaces)) {
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
              <Tooltip
                placement="top-start"
                content={formatMessage(messages.contactGovSuccessToAccess)}
                disabled={!showPlanUpgradeTease}
                hideOnClick={false}
              >
                <div>
                  <LinkedProjectContainer disabled={showPlanUpgradeTease}>
                    <Box mb={fieldMarginBottom}>
                      <Box
                        display="flex"
                        justifyContent="flex-start"
                        width="100%"
                      >
                        <Label>
                          <span>{formatMessage(messages.linkedItems)}</span>
                          <IconTooltip
                            ml="10px"
                            content={formatMessage(messages.linkedItemsTooltip)}
                          />
                        </Label>
                      </Box>
                      <Box mb="30px">
                        <RadioGroup name="projects_filter_type" padding="0px">
                          <Box display="flex" flexDirection="column" gap="8px">
                            {projectsFilterOptions.map((option) => (
                              <Radio
                                key={option.value}
                                name="projects_filter_type"
                                id={`projects_filter_type_${option.value}`}
                                value={option.value}
                                disabled={showPlanUpgradeTease}
                                label={
                                  <Box
                                    display="inline-flex"
                                    alignItems="center"
                                    gap="8px"
                                  >
                                    <span>{option.label}</span>
                                    {option.isNew && (
                                      <NewLabel
                                        expiryDate={new Date('2026-12-04')}
                                      />
                                    )}
                                  </Box>
                                }
                              />
                            ))}
                          </Box>
                        </RadioGroup>
                      </Box>
                    </Box>
                  </LinkedProjectContainer>
                </div>
              </Tooltip>
            )}
            {methods.watch('projects_filter_type') === 'global_topics' && (
              <SelectContainer mb="30px">
                <MultipleSelect
                  name="global_topic_ids"
                  options={mapFilterEntityToOptions(topics.data)}
                  label={formatMessage(messages.selectedTagsLabel)}
                />
              </SelectContainer>
            )}
            {methods.watch('projects_filter_type') === 'areas' && (
              <SelectContainer mb="20px">
                <Select
                  name="area_id"
                  options={mapFilterEntityToOptions(areas.data)}
                  label={formatMessage(messages.selectedAreasLabel)}
                />
              </SelectContainer>
            )}
            {isSpacesEnabled &&
              methods.watch('projects_filter_type') === 'spaces' &&
              spaces && (
                <SelectContainer mb="30px">
                  <MultipleSelect
                    name="space_ids"
                    options={mapFilterEntityToOptions(spaces.data)}
                    label={formatMessage(messages.selectedSpacesLabel)}
                  />
                </SelectContainer>
              )}
          </SectionField>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default CustomPageSettingsForm;
