import React, { Fragment } from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { getSubtextElement } from 'components/Form/Components/Controls/controlUtils';
import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import LocationInput from 'components/HookForm/LocationInput';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import { FormLabel } from 'components/UI/FormComponents';

const CustomFields = ({ questions }: { questions: IFlatCustomField[] }) => {
  const localize = useLocalize();
  console.log(questions);
  return (
    <>
      {questions.map((question) => {
        if (!question.enabled) {
          return null;
        }
        if (question.input_type === 'text_multiloc') {
          return (
            <Fragment key={question.id}>
              <FormLabel
                labelValue={localize(question.title_multiloc)}
                optional={!question.required}
                subtextValue={getSubtextElement(
                  localize(question.description_multiloc)
                )}
                subtextSupportsHtml
              />
              <InputMultilocWithLocaleSwitcher
                key={question.id}
                name={question.key}
                hideLocaleSwitcher
                maxCharCount={
                  question.key === 'title_multiloc' ? 120 : undefined
                }
              />
            </Fragment>
          );
        } else if (question.key === 'location_description') {
          return (
            <Fragment key={question.id}>
              <FormLabel
                labelValue={localize(question.title_multiloc)}
                optional={!question.required}
                subtextValue={getSubtextElement(
                  localize(question.description_multiloc)
                )}
                subtextSupportsHtml
              />
              <LocationInput key={question.id} name={question.key} />
            </Fragment>
          );
        } else if (
          question.input_type === 'text' ||
          question.input_type === 'number'
        ) {
          return (
            <>
              <FormLabel
                htmlFor={question.key}
                labelValue={localize(question.title_multiloc)}
                optional={!question.required}
                subtextValue={getSubtextElement(
                  localize(question.description_multiloc)
                )}
                subtextSupportsHtml
              />
              <Input
                type={question.type === 'number' ? 'number' : 'text'}
                key={question.id}
                name={question.key}
                required={question.required}
              />
            </>
          );
        } else if (question.key === 'body_multiloc') {
          return (
            <Fragment key={question.id}>
              <FormLabel
                labelValue={localize(question.title_multiloc)}
                optional={!question.required}
                subtextValue={getSubtextElement(
                  localize(question.description_multiloc)
                )}
                subtextSupportsHtml
              />
              <QuillMultilocWithLocaleSwitcher
                name={question.key}
                hideLocaleSwitcher
              />
            </Fragment>
          );
        }
        return null;
      })}
    </>
  );
};

export default CustomFields;
