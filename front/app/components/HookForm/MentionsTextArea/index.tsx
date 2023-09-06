import React from 'react';
import MentionsTextAreaComponent, {
  Props as MentionsTextAreaComponentProps,
} from 'components/UI/MentionsTextArea';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';
import { MentionItem } from 'react-mentions';

interface Props
  extends Omit<MentionsTextAreaComponentProps, 'onChange' | 'value'> {
  name: TFieldName;
  onChangeInputField?: (text: string) => void;
  displayValue: string | null;
}

const MentionsTextArea = ({
  name,
  onChangeInputField,
  displayValue,
  ...rest
}: Props) => {
  const {
    setValue,
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;

  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <MentionsTextAreaComponent
              id={name}
              {...field}
              {...rest}
              onChange={(text: string) => {
                onChangeInputField?.(text);
              }}
              onChangeMentions={(mentions: MentionItem[]) => {
                const user_ids = mentions.map((user) => user.id);
                setValue(name, user_ids);
              }}
              value={displayValue}
            />
          );
        }}
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
          fieldName={name}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={false}
        />
      )}
    </>
  );
};

export default MentionsTextArea;
