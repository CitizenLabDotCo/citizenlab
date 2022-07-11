import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import {
  InputMultilocWithLocaleSwitcher,
  InputMultilocWithLocaleSwitcherProps,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import { Controller, useFormContext, FieldError } from 'react-hook-form';
import { Locale } from 'typings';

export interface Props
  extends Omit<
    InputMultilocWithLocaleSwitcherProps,
    'locales' | 'valueMultiloc'
  > {
  name: string;
}

const RHFInputMultilocWithLocaleSwitcher = memo<Props>((props) => {
  const {
    formState: { errors },
    control,
  } = useFormContext();
  const locales = useAppConfigurationLocales();

  if (isNilOrError(locales)) {
    return null;
  }

  const defaultValue: Partial<Record<Locale, any>> = locales.reduce(
    (acc, curr) => ((acc[curr] = ''), acc),
    {}
  );

  const errorMessage = Object.values(
    (errors[props.name] as Record<Locale, FieldError> | undefined) || {}
  )[0]?.message;

  return (
    <>
      <Controller
        name={props.name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <InputMultilocWithLocaleSwitcher
            {...field}
            {...props}
            locales={locales}
            type="text"
            valueMultiloc={field.value}
          />
        )}
      />
      {errorMessage && <Error text={errorMessage} />}
    </>
  );
});

export default RHFInputMultilocWithLocaleSwitcher;
