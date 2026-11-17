import React, { ReactNode } from 'react';

import { Controller } from 'react-hook-form';

import { TFieldName } from 'components/UI/Error';

import MultilocRichTextField from './MultilocRichTextField';
import useFormMultilocField from './useFormMultilocField';

interface Props {
  name: TFieldName;
  label?: ReactNode;
  'aria-label': string;
  placeholder?: string;
  noImages?: boolean;
  noVideos?: boolean;
  noLinks?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
}

// A MultilocRichTextField bound to the surrounding react-hook-form form.
const FormMultilocRichTextField = ({
  name,
  label,
  'aria-label': ariaLabel,
  placeholder,
  noImages,
  noVideos,
  noLinks,
  noAlign,
  limitedTextFormatting,
}: Props) => {
  const { control, emptyMultiloc, errorMessage } = useFormMultilocField(name);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={emptyMultiloc}
      render={({ field }) => (
        <MultilocRichTextField
          id={name}
          label={label}
          aria-label={ariaLabel}
          placeholder={placeholder}
          valueMultiloc={{ ...emptyMultiloc, ...field.value }}
          onChange={field.onChange}
          onBlur={field.onBlur}
          editorRef={field.ref}
          errorMessage={errorMessage}
          noImages={noImages}
          noVideos={noVideos}
          noLinks={noLinks}
          noAlign={noAlign}
          limitedTextFormatting={limitedTextFormatting}
        />
      )}
    />
  );
};

export default FormMultilocRichTextField;
