// libraries
import React, { useCallback, useEffect, useState } from 'react';
import { forOwn, isEmpty } from 'lodash-es';

// components
import { Box, Input, LocaleSwitcher } from '@citizenlab/cl2-component-library';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import { Section } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Button from 'components/UI/Button';

// utils
import { isPage, isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// typings
import { Multiloc, Locale } from 'typings';

// stylings
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import useAddIdeaOfficialFeedback from 'api/idea_official_feedback/useAddIdeaOfficialFeedback';
import useAddInitiativeOfficialFeedback from 'api/initiative_official_feedback/useAddInitiativeOfficialFeedback';
import { IOfficialFeedbackData as IIdeaOfficialFeedbackData } from 'api/idea_official_feedback/types';
import { IOfficialFeedbackData as IInitiativeOfficialFeedbackData } from 'api/initiative_official_feedback/types';
import useUpdateIdeaOfficialFeedback from 'api/idea_official_feedback/useUpdateIdeaOfficialFeedback';
import useUpdateInitiativeOfficialFeedback from 'api/initiative_official_feedback/useUpdateInitiativeOfficialFeedback';

const Container = styled.div``;

const FormLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const AddOfficialUpdateTitle = styled.h2`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.m}px;
  line-height: normal;
  font-weight: 600;
  padding: 0;
  margin: 0;
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

const SubmitButton = styled(Button)``;

const CancelButton = styled(Button)`
  margin-left: 10px;
`;

export interface OfficialFeedbackFormValues {
  bodyMultiloc: Multiloc;
  authorMultiloc: Multiloc;
}

interface Props {
  locale: Locale;
  tenantLocales: Locale[];
  postId?: string;
  postType: 'idea' | 'initiative';
  formType: 'new' | 'edit';
  feedback?: IIdeaOfficialFeedbackData | IInitiativeOfficialFeedbackData;
  className?: string;
  onClose?: () => void;
}

const OfficialFeedbackForm = ({
  locale,
  formType,
  feedback,
  tenantLocales,
  postId,
  postType,
  onClose,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: addOfficialFeedbackToIdea } = useAddIdeaOfficialFeedback();
  const { mutate: addOfficialFeedbackToInitiative } =
    useAddInitiativeOfficialFeedback();
  const { mutate: updateIdeaOfficialFeedback } =
    useUpdateIdeaOfficialFeedback();
  const { mutate: updateInitiativeOfficialFeedback } =
    useUpdateInitiativeOfficialFeedback();

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
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

    tenantLocales.forEach((locale) => {
      formValues.bodyMultiloc[locale] = '';
      formValues.authorMultiloc[locale] = '';
    });

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

    setSelectedLocale(locale);
    setFormValues(
      formType === 'new' ? getEmptyFormValues() : getPreviouslySavedFormValues()
    );
  }, [locale, formType, feedback, getEmptyFormValues]);

  const handleOnLocaleChange = (locale: Locale) => {
    setSelectedLocale(locale);
  };

  const handleBodyOnChange = (body: string, locale: Locale | undefined) => {
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

  const handleAuthorOnChange = (author: string, locale: Locale | undefined) => {
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

      if (formType === 'new' && postId && postType === 'idea') {
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

      if (formType === 'new' && postId && postType === 'initiative') {
        addOfficialFeedbackToInitiative(
          { initiativeId: postId, ...feedbackValues },
          {
            onSuccess,
            onError,
          }
        );
        trackEventByName(tracks.officialFeedbackGiven, {
          location: isPage('admin', location.pathname)
            ? 'Admin/initiative manager'
            : 'Citizen/initiative page',
        });
      }

      if (
        formType === 'edit' &&
        !isNilOrError(feedback) &&
        onClose &&
        postType === 'idea'
      ) {
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

      if (
        formType === 'edit' &&
        !isNilOrError(feedback) &&
        onClose &&
        postType === 'initiative'
      ) {
        updateInitiativeOfficialFeedback(
          {
            id: feedback.id,
            requestBody: feedbackValues,
          },
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

  if (selectedLocale) {
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
                  <AddOfficialUpdateTitle>
                    <FormattedMessage {...messages.addOfficalUpdate} />
                  </AddOfficialUpdateTitle>
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
              buttonStyle="secondary"
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
