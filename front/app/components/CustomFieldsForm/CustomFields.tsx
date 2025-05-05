import React, { Fragment } from 'react';

import { IOption } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize, { Localize } from 'hooks/useLocalize';

import { getSubtextElement } from 'components/Form/Components/Controls/controlUtils';
import FileUploader from 'components/HookForm/FileUploader';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';
import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import LocationInput from 'components/HookForm/LocationInput';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import TextArea from 'components/HookForm/TextArea';
import Topics from 'components/HookForm/Topics';
import { FormLabel } from 'components/UI/FormComponents';
import RadioSingleSelect from 'components/HookForm/RadioSingleSelect';

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
    case 'text':
    case 'number':
      return (
        <Input
          type={question.input_type === 'number' ? 'number' : 'text'}
          name={question.key}
        />
      );
    case 'multiline_text':
      return <TextArea name={question.key} />;
    case 'select': {
      let selectOptions: IOption[] = [];
      if (question.options) {
        selectOptions = question.options.map((selectOption) => {
          return {
            value: selectOption.key,
            label: localize(selectOption.title_multiloc),
          } as IOption;
        });
      }
      return (
        <RadioSingleSelect
          name={question.key}
          options={selectOptions}
          required={question.required}
        />
      ); // <Select name={question.key} options={selectOptions} />; // There seems to be an issue with the style?
    }
    case 'image_files':
      return (
        <ImagesDropzone name={question.key} imagePreviewRatio={135 / 298} />
      );
    case 'files':
      return <FileUploader name={question.key} />;
    case 'topic_ids':
      return <Topics name={question.key} projectId={projectId} />;
    default:
      // Special cases by key
      if (question.key === 'location_description') {
        return <LocationInput name={question.key} />;
      } else if (question.key === 'body_multiloc') {
        return (
          <QuillMultilocWithLocaleSwitcher
            name={question.key}
            hideLocaleSwitcher
          />
        );
      }
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
  console.log(questions);
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
            <Fragment key={question.id}>
              <FormLabel {...labelProps} />
              {renderField(question, localize, projectId)}
            </Fragment>
          );
        })}
    </>
  );
};

export default CustomFields;
