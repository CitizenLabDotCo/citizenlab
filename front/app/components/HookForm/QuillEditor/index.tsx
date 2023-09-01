import React from 'react';

import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

// components
import QuillEditorComponent, {
  Props as QuillEditorProps,
} from 'components/UI/QuillEditor';
import { get } from 'lodash-es';

type Props = {
  name: string;
  labelTooltipText?: string | JSX.Element | null;
  label?: string | JSX.Element | null;
  withCTAButton?: boolean;
} & Omit<QuillEditorProps, 'onChange' | 'valueMultiloc' | 'id'>;

const QuillEditor = ({ name, ...rest }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();
  const defaultValue = '';

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => (
          <QuillEditorComponent
            {...field}
            {...rest}
            id={name.replace(/\./g, '_')}
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

export default QuillEditor;
