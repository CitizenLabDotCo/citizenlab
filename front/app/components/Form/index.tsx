import React, { memo, ReactElement, useEffect, useState } from 'react';

// jsonforms
import {
  createAjv,
  JsonSchema7,
  isCategorization,
  Layout,
} from '@jsonforms/core';

// styling
import styled from 'styled-components';

// components
import {
  Box,
  fontSizes,
  media,
  Button,
} from '@citizenlab/cl2-component-library';
import Wrapper from './Components/Wrapper';
import Fields from './Components/Fields';
import ButtonBar from './Components/ButtonBar';

// hooks
import useObserveEvent from 'hooks/useObserveEvent';

// i18n
import messages from './messages';
import useLocale from 'hooks/useLocale';
import { useIntl, MessageDescriptor } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { sanitizeFormData, isValidData } from './utils';
import { parseRequiredMultilocsData } from './parseRequiredMultilocs';

// typings
import { CLErrors, Locale } from 'typings';
import { ApiErrorGetter, AjvErrorGetter, FormData } from './typings';

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

const InvisibleSubmitButton = styled.button`
  visibility: hidden;
`;

export const customAjv = createAjv({
  useDefaults: 'empty',
  removeAdditional: true,
});

interface Props {
  schema: JsonSchema7;
  uiSchema: Layout;
  onSubmit: (formData: FormData) => void | Promise<any>;
  initialFormData: FormData;
  title?: ReactElement;
  /** The event name on which the form should automatically submit, as received from the eventEmitter. If this is set, no submit button is displayed. */
  submitOnEvent?: string;
  /** A function that returns a translation message given the fieldname and the error key returned by the API */
  getApiErrorMessage?: ApiErrorGetter;
  /** A function that returns a translation message for json-schema originating errors, given tje Ajv error object */
  getAjvErrorMessage: AjvErrorGetter;
  /**
   * If you use this as a controlled form, you'll lose some extra validation and transformations as defined in the handleSubmit.
   */
  onChange?: (formData: FormData) => void;
  /**
   * Idea id for update form, used to load and udpate image and files.
   */
  inputId?: string;
  formSubmitText?: MessageDescriptor;
  config?: 'default' | 'input' | 'survey';
  layout?: 'inline' | 'fullpage';
  footer?: React.ReactNode;
}

interface InnerProps extends Props {
  locale: Locale;
}

const Form = memo(
  ({
    locale,
    schema,
    uiSchema,
    initialFormData,
    title,
    inputId,
    formSubmitText,
    submitOnEvent,
    getAjvErrorMessage,
    getApiErrorMessage,
    config,
    layout,
    footer,
    onChange,
    onSubmit,
  }: InnerProps) => {
    const { formatMessage } = useIntl();

    const [data, setData] = useState<FormData>(() => {
      return parseRequiredMultilocsData(schema, locale, initialFormData);
    });

    const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
    const [loading, setLoading] = useState(false);
    const [scrollToError, setScrollToError] = useState(false);
    const [showAllErrors, setShowAllErrors] = useState(false);

    const isSurvey = config === 'survey';
    const showSubmitButton = !isSurvey;

    useEffect(() => {
      if (scrollToError) {
        // Scroll to the first field with an error
        document
          .getElementById('error-display')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setScrollToError(false);
      }
    }, [scrollToError]);

    const layoutType = layout
      ? layout
      : isCategorization(uiSchema)
      ? 'fullpage'
      : 'inline';

    const handleChange = (data: FormData) => {
      setData(data);
      onChange?.(data);
    };

    const handleSubmit = async (formData?: any) => {
      // Any specified formData has priority over data attribute
      const submissionData = formData && formData.data ? formData.data : data;
      const sanitizedFormData = sanitizeFormData(submissionData);

      setData(sanitizedFormData);
      onChange?.(sanitizedFormData);
      setShowAllErrors(true);

      if (isValidData(schema, uiSchema, submissionData, customAjv, isSurvey)) {
        setLoading(true);
        try {
          await onSubmit(submissionData);
        } catch (e) {
          setScrollToError(true);
          setApiErrors(e.errors);
        }
        setLoading(false);
      }
      setScrollToError(true);
    };

    useObserveEvent(submitOnEvent, handleSubmit);

    return (
      <Wrapper
        id={uiSchema?.options?.formId}
        layoutType={layoutType}
        isSurvey={config === 'survey'}
      >
        <Box
          overflow={layoutType === 'inline' ? 'visible' : 'auto'}
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
            ajv={customAjv}
            getApiErrorMessage={getApiErrorMessage}
            getAjvErrorMessage={getAjvErrorMessage}
            inputId={inputId}
            formSubmitText={formSubmitText}
            config={config}
            locale={locale}
            setFormData={setData}
            onChange={handleChange}
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
                  apiErrors?.values?.length && apiErrors?.values?.length > 0
                )}
                processing={loading}
              />
            ) : submitOnEvent ? (
              <InvisibleSubmitButton onClick={handleSubmit} />
            ) : (
              <Button onClick={handleSubmit}>
                {formatMessage(messages.save)}
              </Button>
            )}
          </>
        )}
      </Wrapper>
    );
  }
);

const OuterForm = (props: Props) => {
  const locale = useLocale();
  if (isNilOrError(locale)) return null;

  return <Form locale={locale} {...props} />;
};

export default OuterForm;
