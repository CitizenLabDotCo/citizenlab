import React from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

// form
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import Input from 'components/HookForm/Input';
import Feedback from 'components/HookForm/Feedback';
import { yupResolver } from '@hookform/resolvers/yup';
import { object } from 'yup';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import {
  FormSection,
  FormSectionTitle,
  FormLabel,
} from 'components/UI/FormComponents';
// components
import Button from 'components/UI/Button';
import { Box } from '@citizenlab/cl2-component-library';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

const StyledFormSection = styled(FormSection)`
  ${media.phone`
    padding-left: 18px;
    padding-right: 18px;
  `}
`;

export interface FormValues {
  title_multiloc: Multiloc | undefined | null;
  body_multiloc: Multiloc | undefined | null;
  topic_ids: string[];
  position: string | undefined | null;
  cosponsor_ids: string[];
}

type PageFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
};

const InitiativeForm = ({ onSubmit, defaultValues }: PageFormProps) => {
  const { formatMessage } = useIntl();
  const schema = object({
    // title_multiloc: validateMultilocForEveryLocale(
    //   formatMessage(messages.emptyTitleError)
    // ),
    // body_multiloc: validateMultilocForEveryLocale(
    //   formatMessage(messages.emptyTitleError)
    // ),
    // topic_ids: validateMultilocForEveryLocale(
    //   formatMessage(messages.emptyTitleError)
    // ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}
        data-testid="initiativeForm"
      >
        <StyledFormSection>
          <FormSectionTitle message={messages.formGeneralSectionTitle} />

          <SectionField id="e2e-initiative-form-title-section">
            <FormLabel
              htmlFor="e2e-initiative-title-input"
              labelMessage={messages.titleLabel}
              subtextMessage={messages.titleLabelSubtext2}
            >
              <Input
                name="title_multiloc"
                type="text"
                id="e2e-initiative-title-input"
                // onChange={handleTitleOnChange}
                // onBlur={onBlur('title_multiloc')}
                autocomplete="off"
                maxCharCount={72}
              />
              {/* {touched.title_multiloc && errors.title_multiloc ? (
                <Error
                  id="e2e-proposal-title-error"
                  text={formatMessage(errors.title_multiloc.message)}
                />
              ) : (
                apiErrors &&
                apiErrors.title_multiloc && (
                  <Error apiErrors={apiErrors.title_multiloc} />
                )
              )} */}
            </FormLabel>
            {/* {titleProfanityError && (
              <Error
                text={
                  <FormattedMessage
                    {...messages.profanityError}
                    values={{
                      guidelinesLink: (
                        <Link to="/pages/faq" target="_blank">
                          {formatMessage(messages.guidelinesLinkText)}
                        </Link>
                      ),
                    }}
                  />
                }
              />
            )} */}
          </SectionField>

          <SectionField id="e2e-initiative-form-description-section">
            <FormLabel
              id="description-label-id"
              htmlFor="body"
              labelMessage={messages.descriptionLabel}
              subtextMessage={messages.descriptionLabelSubtext}
            />
            {/* <QuillEditor
              id="body"
              value={body_multiloc?.[locale] || ''}
              locale={locale}
              noVideos={true}
              noAlign={true}
              onChange={handleBodyOnChange}
              onBlur={onBlur('body_multiloc')}
            />
            {touched.body_multiloc && errors.body_multiloc ? (
              <Error text={formatMessage(errors.body_multiloc.message)} />
            ) : (
              apiErrors &&
              apiErrors.body_multiloc && (
                <Error apiErrors={apiErrors.body_multiloc} />
              )
            )}
            {descriptionProfanityError && (
              <Error
                text={
                  <FormattedMessage
                    {...messages.profanityError}
                    values={{
                      guidelinesLink: (
                        <Link to="/pages/faq" target="_blank">
                          {formatMessage(messages.guidelinesLinkText)}
                        </Link>
                      ),
                    }}
                  />
                }
              />
            )} */}
          </SectionField>
        </StyledFormSection>
      </form>
    </FormProvider>
  );
};

export default InitiativeForm;
