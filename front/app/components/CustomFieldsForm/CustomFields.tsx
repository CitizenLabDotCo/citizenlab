import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import { getSubtextElement } from 'components/Form/Components/Controls/controlUtils';
import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import LocationInput from 'components/HookForm/LocationInput';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import TextArea from 'components/HookForm/TextArea';
import Topics from 'components/HookForm/Topics';
import { FormLabel } from 'components/UI/FormComponents';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import FileUploaderField from './Fields/FileUploadField';
import ImageField from './Fields/ImageField';
import LinearScaleField from './Fields/LinearScale';
import MatrixField from './Fields/MatrixField';
import MultiSelectField from './Fields/MultiSelectField';
import RankingField from './Fields/RankingField';
import RatingField from './Fields/RatingField';
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
  switch (question.input_type) {
    case 'text_multiloc':
      return (
        <InputMultilocWithLocaleSwitcher
          name={question.key}
          hideLocaleSwitcher
          maxCharCount={question.key === 'title_multiloc' ? 120 : undefined}
          id="e2e-idea-title-input"
        />
      );
    case 'html_multiloc':
      return (
        <QuillMultilocWithLocaleSwitcher
          name={question.key}
          hideLocaleSwitcher
          id="e2e-idea-description-input"
        />
      );
    case 'text':
    case 'number':
      return question.key === 'location_description' ? (
        <LocationInput name={question.key} />
      ) : (
        <Input
          type={question.input_type === 'number' ? 'number' : 'text'}
          name={question.key}
        />
      );
    case 'multiline_text':
      return <TextArea name={question.key} />;
    case 'select':
      return <SingleSelectField question={question} />;
    case 'multiselect':
      return <MultiSelectField question={question} />;
    case 'image_files':
      return (
        <ImageField
          name={question.key}
          imagePreviewRatio={135 / 298}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png'],
          }}
          ideaId={ideaId}
        />
      );
    case 'files':
      return <FileUploaderField name={question.key} ideaId={ideaId} />;
    case 'topic_ids':
      return <Topics name={question.key} projectId={projectId} />;
    case 'linear_scale':
      return <LinearScaleField question={question} />;
    case 'ranking':
      return <RankingField question={question} />;
    case 'rating':
      return <RatingField question={question} />;
    case 'matrix_linear_scale':
      return <MatrixField question={question} />;
    default:
      return null;
  }
};

const CustomFields = ({
  questions,
  projectId,
  ideaId,
  phase,
}: {
  questions: IFlatCustomField[];
  projectId?: string;
  ideaId?: string;
  phase?: IPhaseData;
}) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  return (
    <>
      {questions
        .filter((question) => question.enabled)
        .map((question) => {
          const labelProps = {
            htmlFor: question.key,
            labelValue: localize(question.title_multiloc),
            optional: !question.required,
            subtextValue: getSubtextElement(
              localize(question.description_multiloc)
            ),
            subtextSupportsHtml: true,
          };

          const answerNotPublic = !question.visible_to_public;

          return (
            <Box key={question.id} mb="24px">
              <FormLabel {...labelProps} />
              <Text mt="4px" mb={answerNotPublic ? '4px' : '8px'} fontSize="s">
                {getInstructionMessage({
                  minItems: question.minimum_select_count,
                  maxItems: question.maximum_select_count,
                  formatMessage,
                  optionsLength: question.options?.length || 0,
                })}
              </Text>
              {answerNotPublic && (
                <Text mt="0px" fontSize="s">
                  <FormattedMessage {...messages.notPublic} />
                </Text>
              )}
              {renderField({ question, projectId, ideaId })}
              {(question.key === 'title_multiloc' ||
                question.key === 'body_multiloc') && <InputIQ phase={phase} />}
            </Box>
          );
        })}
    </>
  );
};

export default CustomFields;
