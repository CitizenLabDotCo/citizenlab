import React from 'react';

import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import LocationInput from 'components/HookForm/LocationInput';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import TextArea from 'components/HookForm/TextArea';
import Topics from 'components/HookForm/Topics';
import { FormLabel } from 'components/UI/FormComponents';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { sanitizeForClassname } from 'utils/JSONFormUtils';

import CheckboxField from './Fields/CheckboxField';
import CosponsorsField from './Fields/CosponsorsField';
import DateField from './Fields/DateField';
import ImageField from './Fields/ImageField';
import ImageMultichoiceField from './Fields/ImageMultichoiceField';
import LinearScaleField from './Fields/LinearScale';
import MapField from './Fields/MapField';
import MatrixField from './Fields/MatrixField';
import MultiFileUploadField from './Fields/MultiFileUploadField';
import MultiSelectField from './Fields/MultiSelectField';
import RankingField from './Fields/RankingField';
import RatingField from './Fields/RatingField';
import SentimentScaleField from './Fields/SentimentScaleField';
import SingleFileUploadField from './Fields/SingleFileUploadField';
import SingleSelectField from './Fields/SingleSelectField';
import InputIQ from './InputIQ';
import messages from './messages';
import { getInstructionMessage } from './util';

const renderField = ({
  question,
  projectId,
  ideaId,
}: {
  question: IFlatCustomField;
  projectId?: string;
  ideaId?: string;
}) => {
  // Only user fields can be locked (disabled) for now due to a verification method!
  // Possible user fields are: text, number, multiline_text, select, multiselect, checkbox, date
  const disabled = question.constraints?.locked;

  switch (question.input_type) {
    case 'text_multiloc':
      return (
        <InputMultilocWithLocaleSwitcher
          name={question.key}
          hideLocaleSwitcher
          maxCharCount={question.max_characters}
          scrollErrorIntoView={true}
          disabled={disabled}
        />
      );
    case 'html_multiloc':
      return (
        <QuillMultilocWithLocaleSwitcher
          name={question.key}
          hideLocaleSwitcher
          scrollErrorIntoView={true}
          id={question.key}
          maxCharCount={question.max_characters}
          minCharCount={question.min_characters}
        />
      );
    case 'text':
    case 'number':
      return question.key === 'location_description' ? (
        <LocationInput
          name={question.key}
          scrollErrorIntoView={true}
          isDisabled={disabled}
        />
      ) : (
        <Input
          type={question.input_type === 'number' ? 'number' : 'text'}
          name={question.key}
          maxCharCount={question.max_characters}
          scrollErrorIntoView={true}
          disabled={disabled}
        />
      );
    case 'multiline_text':
      return (
        <TextArea
          name={question.key}
          maxCharCount={question.max_characters}
          scrollErrorIntoView={true}
          minRows={2}
          disabled={disabled}
        />
      );
    case 'select':
      return (
        <SingleSelectField
          question={question}
          scrollErrorIntoView={true}
          disabled={disabled}
        />
      );
    case 'multiselect':
      return (
        <MultiSelectField
          question={question}
          scrollErrorIntoView={true}
          disabled={disabled}
        />
      );
    case 'image_files':
      return (
        <ImageField
          name={question.key}
          imagePreviewRatio={135 / 298}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png'],
          }}
          ideaId={ideaId}
          scrollErrorIntoView={true}
        />
      );
    case 'files':
      return (
        <MultiFileUploadField
          name={question.key}
          ideaId={ideaId}
          scrollErrorIntoView={true}
        />
      );
    case 'topic_ids':
      return (
        <Topics
          name={question.key}
          projectId={projectId}
          scrollErrorIntoView={true}
        />
      );
    case 'linear_scale':
      return (
        <LinearScaleField question={question} scrollErrorIntoView={true} />
      );
    case 'ranking':
      return <RankingField question={question} scrollErrorIntoView={true} />;
    case 'rating':
      return <RatingField question={question} scrollErrorIntoView={true} />;
    case 'matrix_linear_scale':
      return <MatrixField question={question} scrollErrorIntoView={true} />;
    case 'sentiment_linear_scale':
      return (
        <SentimentScaleField question={question} scrollErrorIntoView={true} />
      );
    case 'cosponsor_ids':
      return <CosponsorsField question={question} scrollErrorIntoView={true} />;
    case 'multiselect_image':
      return (
        <ImageMultichoiceField question={question} scrollErrorIntoView={true} />
      );
    case 'file_upload':
    case 'shapefile_upload':
      return (
        <SingleFileUploadField
          name={question.key}
          ideaId={ideaId}
          scrollErrorIntoView={true}
        />
      );
    case 'point':
    case 'line':
    case 'polygon':
      return (
        <MapField
          question={
            question as IFlatCustomField & {
              input_type: 'point' | 'polygon' | 'line';
            }
          }
          projectId={projectId}
          scrollErrorIntoView={true}
        />
      );
    case 'checkbox':
      return (
        <CheckboxField
          name={question.key}
          scrollErrorIntoView={true}
          disabled={disabled}
        />
      );
    case 'date':
      return (
        <DateField
          name={question.key}
          scrollErrorIntoView={true}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
};

const CustomFields = ({
  questions,
  projectId,
  ideaId,
  phase,
  participationMethod,
}: {
  questions: IFlatCustomField[];
  projectId?: string;
  ideaId?: string;
  phase?: IPhaseData;
  participationMethod?: ParticipationMethod;
}) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  return (
    <>
      {questions
        .filter((question) => question.enabled)
        .map((question) => {
          // These question types render non-labelable elements (e.g. div[role="slider"], table, ul)
          // so htmlFor would create an invalid label reference. They use aria-labelledby instead.
          const nonLabelableTypes = [
            'linear_scale',
            'rating',
            'matrix_linear_scale',
            'sentiment_linear_scale',
            'ranking',
          ];
          const htmlFor = nonLabelableTypes.includes(question.input_type)
            ? undefined
            : question.key;

          const labelProps = {
            id: sanitizeForClassname(question.key),
            htmlFor,
            labelValue: localize(question.title_multiloc),
            optional: !question.required,
            subtextValue: (
              <QuillEditedContent fontWeight={400}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: localize(question.description_multiloc),
                  }}
                />
              </QuillEditedContent>
            ),
            subtextSupportsHtml: true,
          };

          const answerNotPublic =
            !question.visible_to_public &&
            participationMethod &&
            participationMethod !== 'native_survey';
          const inputIqFields = ['title_multiloc', 'body_multiloc'];

          return (
            <Box
              key={question.id}
              mb="24px"
              position="relative"
              data-question-id={question.id}
            >
              <FormLabel {...labelProps} />
              <Text mt="4px" mb={answerNotPublic ? '4px' : '8px'} fontSize="s">
                {getInstructionMessage({
                  minItems: question.minimum_select_count,
                  maxItems: question.maximum_select_count,
                  formatMessage,
                  optionsLength: question.options?.length || 0,
                })}
                {question.input_type === 'shapefile_upload' && (
                  <FormattedMessage {...messages.uploadShapefileInstructions} />
                )}
              </Text>
              {answerNotPublic && (
                <Text mt="0px" fontSize="s">
                  <FormattedMessage {...messages.notPublic} />
                </Text>
              )}
              <Box display="flex" alignItems="center" gap="8px">
                <Box w="100%">
                  {renderField({ question, projectId, ideaId })}
                </Box>
                {question.constraints?.locked && (
                  <IconTooltip
                    content={<FormattedMessage {...messages.blockedVerified} />}
                    icon="lock"
                  />
                )}
              </Box>
              {question.code && inputIqFields.includes(question.code) && (
                <InputIQ phase={phase} field={question} />
              )}
            </Box>
          );
        })}
    </>
  );
};

export default CustomFields;
