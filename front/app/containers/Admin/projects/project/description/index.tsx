import React, { useEffect, useCallback, useState } from 'react';

import { Success, Box, colors } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useParams } from 'react-router-dom';
import { Multiloc, SupportedLocale } from 'typings';

import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useFeatureFlag from 'hooks/useFeatureFlag';

import {
  Section,
  SectionField,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import Highlighter from 'components/Highlighter';
import ProjectDescriptionBuilderToggle from 'components/ProjectDescriptionBuilder/ProjectDescriptionBuilderToggle';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import { fragmentId } from '../projectHeader/ProjectDescriptionPreview';

import messages from './messages';

interface IFormValues {
  description_preview_multiloc: Multiloc | null;
  description_multiloc: Multiloc | null;
}
const submitBarHeight = '62px';

const ProjectDescription = () => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams();
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject, isLoading, error } = useUpdateProject();
  const showProjectDescriptionBuilder = useFeatureFlag({
    name: 'project_description_builder',
  });
  const [touched, setTouched] = useState(false);
  const { width, containerRef } = useContainerWidthAndHeight();

  const [success, setSuccess] = useState(false);
  const [formValues, setFormValues] = useState<IFormValues>({
    description_preview_multiloc: null,
    description_multiloc: null,
  });

  useEffect(() => {
    if (project) {
      setFormValues({
        description_preview_multiloc:
          project.data.attributes.description_preview_multiloc,
        description_multiloc: project.data.attributes.description_multiloc,
      });
    }
  }, [project]);

  const handleDescriptionPreviewOnChange = useCallback(
    (description_preview_multiloc: Multiloc, _locale: SupportedLocale) => {
      setTouched(true);
      setSuccess(false);
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        description_preview_multiloc,
      }));
    },
    []
  );

  const handleDescriptionOnChange = useCallback(
    (description_multiloc: Multiloc, _locale: SupportedLocale) => {
      setTouched(true);
      setSuccess(false);
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        description_multiloc,
      }));
    },
    []
  );

  const handleOnSubmit = useCallback(async () => {
    const { description_preview_multiloc, description_multiloc } = formValues;

    if (project && description_preview_multiloc && description_multiloc) {
      setSuccess(false);

      updateProject(
        {
          projectId: project.data.id,
          description_multiloc,
          description_preview_multiloc,
        },
        {
          onSuccess: () => {
            setTouched(false);
            setSuccess(true);
          },
          onError: () => {
            setSuccess(false);
          },
        }
      );
    }
  }, [project, formValues, updateProject]);

  const apiError = error?.errors || {};

  return (
    <Box
      ref={containerRef}
      // Temporary fix to ensure the submit bar does
      // not overlap the content. Submit bar should be standardized
      pb={submitBarHeight}
    >
      <SectionTitle>
        <FormattedMessage {...messages.titleDescription} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitleDescription} />
      </SectionDescription>

      <Section>
        <SectionField>
          {!showProjectDescriptionBuilder && (
            <QuillMultilocWithLocaleSwitcher
              id="e2e-project-description-module-inactive"
              valueMultiloc={formValues.description_multiloc}
              onChange={handleDescriptionOnChange}
              label={formatMessage(messages.descriptionLabel)}
              labelTooltipText={formatMessage(messages.descriptionTooltip)}
              withCTAButton
            />
          )}
          <Highlighter fragmentId={fragmentId}>
            <ProjectDescriptionBuilderToggle
              valueMultiloc={formValues.description_multiloc}
              onChange={handleDescriptionOnChange}
              label={formatMessage(messages.descriptionLabel)}
              labelTooltipText={formatMessage(messages.descriptionTooltip)}
            />
          </Highlighter>

          <Error
            fieldName="description_multiloc"
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            apiErrors={apiError?.description_multiloc}
          />
        </SectionField>

        <Box mb="40px">
          <SectionField>
            <TextAreaMultilocWithLocaleSwitcher
              id="project-description-preview"
              valueMultiloc={formValues.description_preview_multiloc}
              onChange={handleDescriptionPreviewOnChange}
              label={formatMessage(messages.descriptionPreviewLabel)}
              labelTooltipText={formatMessage(
                messages.descriptionPreviewTooltip
              )}
              rows={5}
              maxCharCount={280}
            />
            <Error
              fieldName="description_preview_multiloc"
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              apiErrors={apiError?.description_preview_multiloc}
            />
          </SectionField>
        </Box>
      </Section>

      <Box
        position="fixed"
        borderTop={`1px solid ${colors.divider}`}
        bottom="0"
        w={`calc(${width}px + ${defaultAdminCardPadding * 2}px)`}
        ml={`-${defaultAdminCardPadding}px`}
        background={colors.white}
        display="flex"
        justifyContent="flex-start"
      >
        <Box py="8px" px={`${defaultAdminCardPadding}px`} display="flex">
          <ButtonWithLink
            buttonStyle="admin-dark"
            onClick={handleOnSubmit}
            processing={isLoading}
            disabled={!touched}
          >
            {success ? (
              <FormattedMessage {...messages.saved} />
            ) : (
              <FormattedMessage {...messages.save} />
            )}
          </ButtonWithLink>

          {success && (
            <Success
              text={formatMessage(messages.saveSuccessMessage)}
              showBackground={false}
              showIcon={false}
            />
          )}

          {!isEmpty(apiError) && (
            <Error
              text={formatMessage(messages.errorMessage)}
              showBackground={false}
              showIcon={false}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDescription;
