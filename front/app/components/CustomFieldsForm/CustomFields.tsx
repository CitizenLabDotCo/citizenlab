import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize, { Localize } from 'hooks/useLocalize';

import { getSubtextElement } from 'components/Form/Components/Controls/controlUtils';
import CheckboxMultiSelect from 'components/HookForm/CheckboxMultiSelect';
import FileUploader from 'components/HookForm/FileUploader';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';
import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import LocationInput from 'components/HookForm/LocationInput';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import RadioGroup from 'components/HookForm/RadioGroup';
import Radio from 'components/HookForm/RadioGroup/Radio';
import Select from 'components/HookForm/Select';
import TextArea from 'components/HookForm/TextArea';
import Topics from 'components/HookForm/Topics';
import { FormLabel } from 'components/UI/FormComponents';

const extractOptions = (
  question: IFlatCustomField,
  localize: Localize,
  randomize = false
): IOption[] => {
  let result: IOption[] = [];
  if (question.options) {
    result = question.options.map((selectOption) => {
      return {
        value: selectOption.key,
        label: localize(selectOption.title_multiloc),
      } as IOption;
    });

    if (randomize) {
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    }
  }
  return result;
};

const renderField = (
  question: IFlatCustomField,
  localize: Localize,
  projectId?: string
) => {
  switch (question.input_type) {
    case 'text_multiloc':
      return (
        <InputMultilocWithLocaleSwitcher
          name={question.key}
          hideLocaleSwitcher
          maxCharCount={question.key === 'title_multiloc' ? 120 : undefined}
        />
      );
    case 'html_multiloc':
      return (
        <QuillMultilocWithLocaleSwitcher
          name={question.key}
          hideLocaleSwitcher
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
      return question.dropdown_layout ? (
        <Select
          name={question.key}
          options={extractOptions(
            question,
            localize,
            question.random_option_ordering
          )}
        />
      ) : (
        <RadioGroup name={question.key}>
          {extractOptions(
            question,
            localize,
            question.random_option_ordering
          ).map((option) => (
            <Radio
              name={question.key}
              id={option.value}
              key={option.value}
              value={option.value}
              label={option.label}
            />
          ))}
        </RadioGroup>
      );
    case 'multiselect':
      return question.dropdown_layout ? (
        <MultipleSelect
          name={question.key}
          options={extractOptions(question, localize)}
        />
      ) : (
        <CheckboxMultiSelect
          name={question.key}
          options={extractOptions(question, localize)}
        />
      );
    case 'image_files':
      return (
        <ImagesDropzone
          name={question.key}
          imagePreviewRatio={135 / 298}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png'],
          }}
        />
      );
    case 'files':
      return <FileUploader name={question.key} />;
    case 'topic_ids':
      return <Topics name={question.key} projectId={projectId} />;
    default:
      return null;
  }
};

const CustomFields = ({
  questions,
  projectId,
}: {
  questions: IFlatCustomField[];
  projectId?: string;
}) => {
  const localize = useLocalize();
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

          return (
            <Box key={question.id} mb="24px">
              <FormLabel {...labelProps} />
              {renderField(question, localize, projectId)}
            </Box>
          );
        })}
    </>
  );
};

export default CustomFields;
