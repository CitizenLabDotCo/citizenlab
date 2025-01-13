import React, { memo, ReactElement, useEffect, useState } from 'react';

// jsonforms
import {
  Box,
  fontSizes,
  media,
  Button,
} from '@citizenlab/cl2-component-library';
import { JsonSchema7, isCategorization, Layout } from '@jsonforms/core';
import styled from 'styled-components';
import { CLErrors } from 'typings';

import useLocale from 'hooks/useLocale';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import ButtonBar from './Components/ButtonBar';
import Fields from './Components/Fields';
import FormWrapper from './Components/FormWrapper';
import messages from './messages';
import { parseRequiredMultilocsData } from './parseRequiredMultilocs';
import tracks from './tracks';
import { ApiErrorGetter, AjvErrorGetter, FormData } from './typings';
import { sanitizeFormData, isValidData, customAjv } from './utils';

// hopefully we can standardize this someday
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.tablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 34px;
  `}
`;

interface Props {
  schema: JsonSchema7;
  uiSchema: Layout;
  onSubmit: (formData: FormData) => void | Promise<any>;
  initialFormData: FormData;
  title?: ReactElement;
  /** A function that returns a translation message given the fieldname and the error key returned by the API */
  getApiErrorMessage?: ApiErrorGetter;
  /** A function that returns a translation message for json-schema originating errors, given tje Ajv error object */
  getAjvErrorMessage: AjvErrorGetter;
  /**
   * Idea id for update form, used to load and udpate image and files.
   */
  inputId?: string | undefined;
  config?: 'default' | 'input' | 'survey';
  layout?: 'inline' | 'fullpage';
  footer?: React.ReactNode;
  // Optional loading state from parent. If set, the loading state will be controlled by the parent.
  loading?: boolean;
}

const Form = memo(
  ({
    schema,
    uiSchema,
    initialFormData,
    title,
    inputId,
    getAjvErrorMessage,
    getApiErrorMessage,
    config,
    layout,
    footer,
    onSubmit,
    loading: externalLoading,
  }: Props) => {
    const { formatMessage } = useIntl();
    const locale = useLocale();

    const [data, setData] = useState<FormData>(() => {
      return parseRequiredMultilocsData(schema, locale, initialFormData);
    });
    const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
    const [internalLoading, internalSetLoading] = useState(false);
    const loading =
      externalLoading !== undefined ? externalLoading : internalLoading;

    const [scrollToError, setScrollToError] = useState(false);
    const [showAllErrors, setShowAllErrors] = useState(false);

    const isSurvey = config === 'survey';
    const showSubmitButton = !isSurvey;

    useEffect(() => {
      if (scrollToError) {
        // Scroll to the first field with an error
        document
          .querySelector('.error-display-container')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setScrollToError(false);
      }
    }, [scrollToError]);

    useEffect(() => {
      setData(parseRequiredMultilocsData(schema, locale, initialFormData));
    }, [schema, locale, initialFormData]);

    const layoutType =
      layout || (isCategorization(uiSchema) ? 'fullpage' : 'inline');

    const handleSubmit = async (formData?: any, showErrors = true) => {
      // Any specified formData has priority over data attribute
      const submissionData = formData && formData.data ? formData.data : data;
      const sanitizedFormData = sanitizeFormData(submissionData);

      setData(sanitizedFormData);
      setShowAllErrors(showErrors);

      if (isValidData(schema, uiSchema, submissionData, customAjv, isSurvey)) {
        if (externalLoading === undefined) {
          internalSetLoading(true);
        }
        try {
          await onSubmit(submissionData);
          if (isSurvey) {
            trackEventByName(tracks.surveyFormSubmitted);
          } else {
            trackEventByName(tracks.ideaFormSubmitted);
          }
        } catch (e) {
          setScrollToError(true);
          setApiErrors(e.errors);
        }
        if (externalLoading === undefined) {
          internalSetLoading(false);
        }
      }
      setScrollToError(true);
    };

    return (
      /*
        This form should contain as few styles as possible!
        Customization should happen in places where this component is imported!
      */
      <FormWrapper formId={uiSchema.options?.formId}>
        <Box
          overflow={layoutType === 'inline' ? 'visible' : 'auto'}
          /*
            Grows the content to take full height,
            so we can center the form content vertically for survey form pages with only 1 field
          */
          flex="1"
          marginBottom={
            layoutType === 'fullpage' && showSubmitButton ? '32px' : 'auto'
          }
        >
          {title && <Title>{title}</Title>}
          <Fields
            data={data}
            apiErrors={apiErrors}
            showAllErrors={showAllErrors}
            setShowAllErrors={setShowAllErrors}
            schema={schema}
            uiSchema={uiSchema}
            getApiErrorMessage={getApiErrorMessage}
            getAjvErrorMessage={getAjvErrorMessage}
            inputId={inputId}
            config={config}
            locale={locale}
            onChange={setData}
            onSubmit={handleSubmit}
          />
          {footer && (
            <Box display="flex" flexDirection="row" justifyContent="center">
              <Box w="100%" maxWidth="700px" px="20px" mt="0px" mb="40px">
                {footer}
              </Box>
            </Box>
          )}
        </Box>
        {showSubmitButton && (
          <>
            {layoutType === 'fullpage' ? (
              <ButtonBar
                onSubmit={handleSubmit}
                apiErrors={Boolean(
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  apiErrors?.values?.length && apiErrors?.values?.length > 0
                )}
                processing={loading}
              />
            ) : (
              <Button onClick={handleSubmit}>
                {formatMessage(messages.save)}
              </Button>
            )}
          </>
        )}
      </FormWrapper>
    );
  }
);

export default Form;
