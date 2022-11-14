import React, { useState } from 'react';

// form
import Feedback from 'components/HookForm/Feedback';
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string } from 'yup';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import { slugRegEx } from 'utils/textUtils';
// import { handleHookFormSubmissionError } from 'utils/errorUtils';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import SlugInput from 'components/HookForm/SlugInput';
import Tabs from 'components/HookForm/Tabs';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import Select from 'components/HookForm/Select';
import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';

// hooks
import useTopics from 'hooks/useTopics';
import useAreas from 'hooks/useAreas';

// utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';

// intl
import messages from '../messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// types
import { Multiloc } from 'typings';
import { IAreaData } from 'services/areas';
import { ProjectsFilterTypes } from 'services/customPages';

export interface FormValues {
  title_multiloc: Multiloc;
  nav_bar_item_title_multiloc?: Multiloc;
  slug?: string;
  projects_filter_type: ProjectsFilterTypes;
}

type TMode = 'new' | 'edit';
interface Props {
  defaultValues?: FormValues;
  showNavBarItemTitle?: boolean;
  mode: TMode;
  onSubmit: (formValues: FormValues) => void | Promise<void>;
}

const projectsFilterTabs: { name: ProjectsFilterTypes; label: string }[] = [
  {
    name: 'no_filter',
    label: 'None',
  },
  {
    name: 'topics',
    label: 'By Tag',
  },
  {
    name: 'areas',
    label: 'By Area',
  },
];

const CustomPageSettingsForm = ({
  showNavBarItemTitle,
  intl: { formatMessage },
  mode,
  onSubmit,
  defaultValues,
}: Props & WrappedComponentProps) => {
  const [_titleErrors, _setTitleErrors] = useState<Multiloc>({});
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
    projects_filter_type: string().required(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });
  const slug = methods.watch('slug');

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const mapAreasToOptions = (areas: IAreaData[]) => {
    return areas.map((area) => {
      return {
        value: area.id,
        label: area.attributes.title_multiloc.en || 'test',
      };
    });
  };

  const mapTopicsToOptions = (topics) => {
    return topics.map((topic) => {
      return {
        value: topic.id,
        label: topic.attributes.title_multiloc.en || 'test',
      };
    });
  };

  const areas = useAreas();
  const topics = useTopics();

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}
        data-testid="customPageSettingsForm"
      >
        <SectionFormWrapper flatTopBorder>
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
              <SlugInput slug={slug} pathnameWithoutSlug="pages" />
            )}
            {/* // should be behind a feature flag */}
            <Box>
              <Box display="flex" justifyContent="flex-start">
                <Text>Linked Projects</Text>
                <IconTooltip ml="40px" content="Link some projects" />
              </Box>
              <Box mb="30px">
                <Tabs name="projects_filter_type" items={projectsFilterTabs} />
              </Box>
              {methods.getValues('projects_filter_type') === 'topics' && (
                <Box mb="30px">
                  <MultipleSelect
                    name="tag_ids"
                    placeholder={'add tags'}
                    options={mapTopicsToOptions(topics)}
                    label={
                      <>
                        Add some tags
                        <IconTooltip content={'add some tags'} />
                      </>
                    }
                  />
                </Box>
              )}
              {methods.getValues('projects_filter_type') === 'areas' && (
                <Box mb="20px">
                  <Select
                    name="selected_area"
                    options={mapAreasToOptions(areas)}
                    label={
                      <>
                        select area
                        <IconTooltip content={'choose an area'} />
                      </>
                    }
                  />
                </Box>
              )}
            </Box>
            <Box display="flex">
              <Button
                data-cy="e2e-submit-custom-page"
                type="submit"
                processing={methods.formState.isSubmitting}
              >
                {formatMessage(messages.saveButton)}
              </Button>
            </Box>
          </SectionField>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default injectIntl(CustomPageSettingsForm);
