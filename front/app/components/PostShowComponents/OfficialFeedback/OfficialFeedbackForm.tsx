import React, { useCallback, useEffect, useState } from 'react';

import {
  Box,
  Input,
  LocaleSwitcher,
  colors,
  fontSizes,
  Title,
} from '@citizenlab/cl2-component-library';
import { forOwn, isEmpty } from 'lodash-es';
import styled from 'styled-components';
import { Multiloc, SupportedLocale } from 'typings';

import { IOfficialFeedbackData as IIdeaOfficialFeedbackData } from 'api/idea_official_feedback/types';
import useAddIdeaOfficialFeedback from 'api/idea_official_feedback/useAddIdeaOfficialFeedback';
import useUpdateIdeaOfficialFeedback from 'api/idea_official_feedback/useUpdateIdeaOfficialFeedback';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { Section } from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import MentionsTextArea from 'components/UI/MentionsTextArea';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isPage, isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import tracks from './tracks';

const Container = styled.div``;

const FormLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  width: auto;
  flex: 1;
`;

const StyledMentionsTextArea = styled(MentionsTextArea)`
  margin-bottom: 12px;
`;

const StyledInput = styled(Input)`
  margin-bottom: 12px;
`;

const StyledError = styled(Error)`
  margin-bottom: 12px;
`;

const SuccessMessage = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.success};
  font-weight: 400;
  line-height: normal;
  margin-left: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
`;

const SubmitButton = styled(ButtonWithLink)``;

const CancelButton = styled(ButtonWithLink)`
  margin-left: 10px;
`;

export interface OfficialFeedbackFormValues {
  bodyMultiloc: Multiloc;
  authorMultiloc: Multiloc;
}

interface Props {
  postId?: string;
  formType: 'new' | 'edit';
  feedback?: IIdeaOfficialFeedbackData;
  className?: string;
  onClose?: () => void;
}

const OfficialFeedbackForm = ({
  formType,
  feedback,
  postId,
  onClose,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const { mutate: addOfficialFeedbackToIdea } = useAddIdeaOfficialFeedback();
  const { mutate: updateIdeaOfficialFeedback } =
    useUpdateIdeaOfficialFeedback();

  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale | null>(
    null
  );
  const [formValues, setFormValues] = useState<OfficialFeedbackFormValues>({
    bodyMultiloc: {},
    authorMultiloc: {},
  });
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const getEmptyFormValues = useCallback(() => {
    const formValues = {
      bodyMultiloc: {},
      authorMultiloc: {},
    };

    if (!isNilOrError(tenantLocales)) {
      tenantLocales.forEach((locale) => {
        formValues.bodyMultiloc[locale] = '';
        formValues.authorMultiloc[locale] = '';
      });
    }

    return formValues;
  }, [tenantLocales]);

  useEffect(() => {
    const getPreviouslySavedFormValues = () => {
      const formValues = {
        authorMultiloc: feedback?.attributes.author_multiloc || {},
        bodyMultiloc: {},
      };

      if (feedback) {
        forOwn(feedback.attributes.body_multiloc, (bodyText, locale) => {
          formValues.bodyMultiloc[locale] = (bodyText || '').replace(
            /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>@([\S\s]*?)<\/span>/gi,
            '@[$3]($2)'
          );
        });
      }

      return formValues;
    };
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
    setFormValues(
      formType === 'new' ? getEmptyFormValues() : getPreviouslySavedFormValues()
    );
  }, [locale, formType, feedback, getEmptyFormValues]);

  const handleOnLocaleChange = (locale: SupportedLocale) => {
    setSelectedLocale(locale);
  };

  const handleBodyOnChange = (
    body: string,
    locale: SupportedLocale | undefined
  ) => {
    if (locale) {
      setError(false);
      setSuccess(false);
      setFormValues({
        ...formValues,
        bodyMultiloc: {
          ...formValues.bodyMultiloc,
          [locale]: body,
        },
      });
    }
  };

  const handleAuthorOnChange = (
    author: string,
    locale: SupportedLocale | undefined
  ) => {
    if (locale) {
      setError(false);
      setSuccess(false);
      setFormValues({
        ...formValues,
        authorMultiloc: {
          ...formValues.authorMultiloc,
          [locale]: author,
        },
      });
    }
  };

  const validate = () => {
    let validated = false;

    if (!isNilOrError(tenantLocales)) {
      tenantLocales.forEach((locale) => {
        if (
          !isEmpty(formValues.authorMultiloc[locale]) &&
          !isEmpty(formValues.bodyMultiloc[locale])
        ) {
          validated = true;
        }
      });

      tenantLocales.forEach((locale) => {
        if (
          (!isEmpty(formValues.authorMultiloc[locale]) &&
            isEmpty(formValues.bodyMultiloc[locale])) ||
          (isEmpty(formValues.authorMultiloc[locale]) &&
            !isEmpty(formValues.bodyMultiloc[locale]))
        ) {
          validated = false;
        }
      });
    }

    return validated;
  };

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!processing && validate()) {
      setProcessing(true);
      setError(false);
      setSuccess(false);

      const feedbackValues = {
        author_multiloc: formValues.authorMultiloc,
        body_multiloc: {} as Multiloc,
      };

      forOwn(formValues.bodyMultiloc, (bodyText, locale) => {
        feedbackValues.body_multiloc[locale] = (bodyText || '').replace(
          /@\[(.*?)\]\((.*?)\)/gi,
          '@$2'
        );
      });

      const onSuccess = () => {
        setFormValues(getEmptyFormValues());
        setProcessing(false);
        setSuccess(true);

        setTimeout(() => setSuccess(false), 6000);
      };

      const onError = () => {
        setProcessing(false);
        setError(true);
        setSuccess(false);
      };

      if (formType === 'new' && postId) {
        addOfficialFeedbackToIdea(
          { ideaId: postId, ...feedbackValues },
          {
            onSuccess,
            onError,
          }
        );
        trackEventByName(tracks.officialFeedbackGiven, {
          location: isPage('admin', location.pathname)
            ? 'Admin/idea manager'
            : 'Citizen/idea page',
        });
      }

      if (formType === 'edit' && !isNilOrError(feedback) && onClose) {
        updateIdeaOfficialFeedback(
          { id: feedback.id, requestBody: feedbackValues },
          {
            onSuccess: () => {
              onSuccess();
              onClose();
            },
            onError,
          }
        );
      }
    }
  };

  const errorMessage = error ? formatMessage(messages.updateButtonError) : null;
  const successMessage = success
    ? formatMessage(messages.updateMessageSuccess)
    : null;

  if (selectedLocale && !isNilOrError(tenantLocales)) {
    return (
      <Container
        className={className || ''}
        data-testid="official-feedback-form"
      >
        <Section id="official-feedback-form">
          <FormLabel>
            <Box
              width="100%"
              display="flex"
              gap="8px"
              flexWrap="wrap"
              justifyContent="space-between"
            >
              <Box my="auto">
                {formType === 'new' && (
                  <Title variant="h2" fontSize="m" color="tenantText" m="0">
                    <FormattedMessage {...messages.addOfficalUpdate} />
                  </Title>
                )}
              </Box>
              <Box my="auto">
                <StyledLocaleSwitcher
                  locales={tenantLocales}
                  selectedLocale={selectedLocale}
                  onSelectedLocaleChange={handleOnLocaleChange}
                  values={formValues as any}
                />
              </Box>
            </Box>
          </FormLabel>

          <StyledMentionsTextArea
            name="official-feedback-form-mentions-textarea"
            locale={selectedLocale}
            ariaLabel={formatMessage(messages.officialUpdateBody)}
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            value={formValues.bodyMultiloc?.[selectedLocale] || ''}
            onChange={handleBodyOnChange}
            placeholder={formatMessage(messages.textAreaPlaceholder)}
            rows={8}
            padding="12px"
            fontSize={`${fontSizes.base}px`}
            background="#fff"
          />

          <StyledInput
            type="text"
            locale={selectedLocale}
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            value={formValues.authorMultiloc?.[selectedLocale] || ''}
            onChange={handleAuthorOnChange}
            placeholder={formatMessage(messages.officialNamePlaceholder)}
            ariaLabel={formatMessage(messages.officialUpdateAuthor)}
          />
        </Section>

        <StyledError text={errorMessage} marginTop="0px" />

        <ButtonContainer>
          <SubmitButton
            className="e2e-official-feedback-form-submit-button"
            bgColor={formType === 'edit' ? colors.primary : colors.error}
            icon="pen"
            textColor="white"
            fullWidth={formType === 'new'}
            onClick={handleOnSubmit}
            disabled={!validate()}
            processing={processing}
          >
            {formType === 'edit' ? (
              <FormattedMessage {...messages.updateButtonSaveEditForm} />
            ) : (
              <FormattedMessage {...messages.publishButtonText} />
            )}
          </SubmitButton>

          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

          {onClose && (
            <CancelButton
              buttonStyle="secondary-outlined"
              onClick={onClose}
              textColor={formType === 'edit' ? colors.primary : colors.error}
            >
              <FormattedMessage {...messages.cancel} />
            </CancelButton>
          )}
        </ButtonContainer>
      </Container>
    );
  }

  return null;
};

export default OfficialFeedbackForm;
