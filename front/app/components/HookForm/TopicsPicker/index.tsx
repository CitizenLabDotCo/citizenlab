import React from 'react';

import Error, { TFieldName } from 'components/UI/Error';
import { Controller, get, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import TopicsPickerComponent, {
  Props as TopicsPickerComponentProps,
} from 'components/UI/TopicsPicker';

interface Props
  extends Omit<
    TopicsPickerComponentProps,
    'id' | 'onChange' | 'selectedTopicIds' | 'onClick'
  > {
  name: string;
}

const TopicsPicker = ({ name, ...rest }: Props) => {
  const {
    setValue,
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => (
          <TopicsPickerComponent
            {...field}
            {...rest}
            selectedTopicIds={field.value || []}
            onClick={(newValue) => {
              setValue(name, newValue);
            }}
          />
        )}
      />
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={false}
        />
      )}
      {apiError && (
        <Error
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={false}
        />
      )}
    </>
  );
};

export default TopicsPicker;
