import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import useInputTopics from 'api/input_topics/useInputTopics';

import Error, { TFieldName } from 'components/UI/Error';
import TopicsPicker, {
  Props as TopicPickerProps,
} from 'components/UI/TopicsPicker';

interface Props
  extends Omit<
    TopicPickerProps,
    'onClick' | 'availableTopics' | 'selectedTopicIds' | 'value'
  > {
  name: string;
  projectId?: string;
  scrollErrorIntoView?: boolean;
}

const Topics = ({ name, projectId, scrollErrorIntoView, ...rest }: Props) => {
  const {
    setValue,
    formState: { errors: formContextErrors },
    control,
    getValues,
    trigger,
  } = useFormContext();

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;

  const apiError = errors?.error && ([errors] as CLError[]);

  const { data: inputTopics } = useInputTopics(projectId || '');

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <TopicsPicker
              {...field}
              {...rest}
              selectedTopicIds={getValues(name) || []}
              availableTopics={inputTopics?.data || []}
              onClick={(topicIds: string[]) => {
                setValue(name, topicIds);
                trigger(name);
              }}
            />
          );
        }}
      />
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={scrollErrorIntoView}
        />
      )}
      {apiError && (
        <Error
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </>
  );
};

export default Topics;
