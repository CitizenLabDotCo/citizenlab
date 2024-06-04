import React, {
  FormEvent,
  memo,
  ReactElement,
  useEffect,
  useState,
} from 'react';

// jsonforms
import {
  Box,
  fontSizes,
  media,
  Button,
} from '@citizenlab/cl2-component-library';
import {
  createAjv,
  JsonSchema7,
  isCategorization,
  Layout,
} from '@jsonforms/core';
import styled from 'styled-components';
import { CLErrors } from 'typings';

import useLocale from 'hooks/useLocale';
import useObserveEvent from 'hooks/useObserveEvent';

import { useIntl } from 'utils/cl-intl';

import ButtonBar from './Components/ButtonBar';
import Fields from './Components/Fields';
import messages from './messages';
import { parseRequiredMultilocsData } from './parseRequiredMultilocs';
import { ApiErrorGetter, AjvErrorGetter, FormData } from './typings';
import { sanitizeFormData, isValidData } from './utils';

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
// The image key word is used for the image choice option
customAjv.addKeyword('image');

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
  inputId?: string | undefined;
  config?: 'default' | 'input' | 'survey';
  layout?: 'inline' | 'fullpage';
  footer?: React.ReactNode;
  onParentSubmit?: (event: FormEvent) => void;
}

const Form = memo(
  ({
    schema,
    uiSchema,
    initialFormData,
    title,
    inputId,
    submitOnEvent,
    getAjvErrorMessage,
    getApiErrorMessage,
    config,
    layout,
    footer,
    onChange,
    onSubmit,
    onParentSubmit,
  }: Props) => {
    const { formatMessage } = useIntl();
    const locale = useLocale();

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

    useEffect(() => {
      setData(parseRequiredMultilocsData(schema, locale, initialFormData));
    }, [schema, locale, initialFormData]);

    const layoutType =
      layout || (isCategorization(uiSchema) ? 'fullpage' : 'inline');

    const handleChange = (data: FormData) => {
      setData(data);
      onChange?.(data);
    };

    const handleSubmit = async (formData?: any, showErrors = true) => {
      // Any specified formData has priority over data attribute
      const submissionData = formData && formData.data ? formData.data : data;
      const sanitizedFormData = sanitizeFormData(submissionData);

      setData(sanitizedFormData);
      onChange?.(sanitizedFormData);
      setShowAllErrors(showErrors);

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

    const invisibleSubmit = (event: FormEvent) => {
      onParentSubmit ? onParentSubmit(event) : handleSubmit();
    };

    useObserveEvent(submitOnEvent, handleSubmit);

    return (
      /*
        This form should contain as few styles as possible!
        Customization should happen in places where this component is imported!
      */
      <Box
        id={uiSchema?.options?.formId}
        as="form"
        display="flex"
        flexDirection="column"
        // This is necessary for the form to grow with the content and still be scrollable
        height="100%"
      >
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
            ajv={customAjv}
            getApiErrorMessage={getApiErrorMessage}
            getAjvErrorMessage={getAjvErrorMessage}
            inputId={inputId}
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
              <InvisibleSubmitButton onClick={invisibleSubmit} />
            ) : (
              <Button onClick={handleSubmit}>
                {formatMessage(messages.save)}
              </Button>
            )}
          </>
        )}
      </Box>
    );
  }
);

export default Form;
