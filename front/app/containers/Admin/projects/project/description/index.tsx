import React, { memo, useEffect, useCallback, useState } from 'react';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// Hooks
import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

// Components
import {
  Section,
  SectionField,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Success } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';

// Styling
import styled from 'styled-components';

// Typing
import { Multiloc, Locale } from 'typings';
import Outlet from 'components/Outlet';

const Container = styled.div``;

const ButtonContainer = styled.div`
  display: flex;
`;

interface Props {
  className?: string;
}

interface IFormValues {
  description_preview_multiloc: Multiloc | null;
  description_multiloc: Multiloc | null;
}

const ProjectDescription = memo<
  Props & WrappedComponentProps & WithRouterProps
>((props) => {
  const {
    intl: { formatMessage },
  } = props;

  const { mutate: updateProject, isLoading, error } = useUpdateProject();
  const [moduleActive, setModuleActive] = useState(false);
  const [touched, setTouched] = useState(false);

  const [success, setSuccess] = useState(false);
  const [formValues, setFormValues] = useState<IFormValues>({
    description_preview_multiloc: null,
    description_multiloc: null,
  });

  const setModuleToActive = () => setModuleActive(true);
  const { data: project } = useProjectById(props.params.projectId);

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
    (description_preview_multiloc: Multiloc, _locale: Locale) => {
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
    (description_multiloc: Multiloc, _locale: Locale) => {
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

  if (!isNilOrError(project)) {
    return (
      <Container>
        <SectionTitle>
          <FormattedMessage {...messages.titleDescription} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleDescription} />
        </SectionDescription>

        <Section>
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
              apiErrors={apiError?.description_preview_multiloc}
            />
          </SectionField>

          <SectionField>
            {!moduleActive && (
              <QuillMultilocWithLocaleSwitcher
                id="project-description"
                valueMultiloc={formValues.description_multiloc}
                onChange={handleDescriptionOnChange}
                label={formatMessage(messages.descriptionLabel)}
                labelTooltipText={formatMessage(messages.descriptionTooltip)}
                withCTAButton
              />
            )}
            <Outlet
              id="app.containers.Admin.projects.edit.description.projectDescriptionBuilder"
              onMount={setModuleToActive}
              valueMultiloc={formValues.description_multiloc}
              onChange={handleDescriptionOnChange}
              label={formatMessage(messages.descriptionLabel)}
              labelTooltipText={formatMessage(messages.descriptionTooltip)}
            />
            <Error
              fieldName="description_multiloc"
              apiErrors={apiError?.description_multiloc}
            />
          </SectionField>
        </Section>

        <ButtonContainer>
          <Button
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
          </Button>

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
        </ButtonContainer>
      </Container>
    );
  }

  return null;
});

export default withRouter(injectIntl(ProjectDescription));
