import React, { memo, useEffect, useCallback, useState } from 'react';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// Hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useProject from 'hooks/useProject';

// Services
import { updateProject } from 'services/projects';

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
import { Success } from 'cl2-component-library';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// Styling
import styled from 'styled-components';

// Typing
import { Multiloc, Locale } from 'typings';

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

const ProjectDescription = memo<Props & InjectedIntlProps & WithRouterProps>(
  (props) => {
    const {
      intl: { formatMessage },
    } = props;

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      description_preview_multiloc: null,
      description_multiloc: null,
    });

    const tenantLocales = useAppConfigurationLocales();
    const project = useProject({ projectId: props.params.projectId });

    useEffect(() => {
      if (!isNilOrError(project)) {
        setFormValues({
          description_preview_multiloc:
            project.attributes.description_preview_multiloc,
          description_multiloc: project.attributes.description_multiloc,
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

    const validate = useCallback(() => {
      // if (!isNilOrError(tenantLocales)) {
      //   // check that all fields have content for all tenant locales
      //   const { description_preview_multiloc, description_multiloc } = formValues;
      //   return tenantLocales.every(locale => !isEmpty(description_preview_multiloc?.[locale]) && !isEmpty(description_multiloc?.[locale]));
      // }

      // return false;
      return true;
    }, [tenantLocales, formValues]);

    const handleOnSubmit = useCallback(() => {
      const { description_preview_multiloc, description_multiloc } = formValues;

      if (
        !processing &&
        validate() &&
        !isNilOrError(project) &&
        description_preview_multiloc &&
        description_multiloc
      ) {
        setProcessing(true);
        setErrors({});
        setSuccess(false);

        updateProject(project.id, {
          description_multiloc,
          description_preview_multiloc,
        })
          .then(() => {
            setProcessing(false);
            setErrors({});
            setTouched(false);
            setSuccess(true);
          })
          .catch((errorResponse) => {
            setProcessing(false);
            setErrors(errorResponse?.json?.errors || {});
            setSuccess(false);
          });
      }
    }, [project, formValues, processing, validate]);

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
                apiErrors={errors?.description_preview_multiloc}
              />
            </SectionField>

            <SectionField>
              <QuillMultilocWithLocaleSwitcher
                id="project-description"
                valueMultiloc={formValues.description_multiloc}
                onChange={handleDescriptionOnChange}
                label={formatMessage(messages.descriptionLabel)}
                labelTooltipText={formatMessage(messages.descriptionTooltip)}
                withCTAButton
              />
              <Error
                fieldName="description_multiloc"
                apiErrors={errors?.description_multiloc}
              />
            </SectionField>
          </Section>

          <ButtonContainer>
            <Button
              buttonStyle="admin-dark"
              onClick={handleOnSubmit}
              processing={processing}
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

            {!isEmpty(errors) && (
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
  }
);

export default withRouter(injectIntl(ProjectDescription));
