import React from 'react';

import {
  InputMultilocWithLocaleSwitcher as InputMultilocWithLocaleSwitcherComponent,
  InputMultilocWithLocaleSwitcherProps,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext, FieldError } from 'react-hook-form';
import { SupportedLocale, RHFErrors } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { getSubtextElement } from 'components/Form/Components/Controls/controlUtils';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';

import { isNilOrError } from 'utils/helperUtils';

interface Props
  extends Omit<
    InputMultilocWithLocaleSwitcherProps,
    'locales' | 'valueMultiloc' | 'type'
  > {
  question: IFlatCustomField;
}

const InputMultilocWithLocaleSwitcher = ({ question, ...rest }: Props) => {
  const name = question.key;
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();
  const locales = useAppConfigurationLocales();
  const locale = useLocale();
  const localize = useLocalize();

  if (isNilOrError(locales)) {
    return null;
  }

  const defaultValue: Partial<Record<SupportedLocale, any>> = locales.reduce(
    (acc, curr) => ((acc[curr] = ''), acc),
    {}
  );

  // Select the first error messages from the field's multiloc validation error
  const errors = get(formContextErrors, name) as RHFErrors;

  const validationError = Object.values(
    (errors as Record<SupportedLocale, FieldError> | undefined) || {}
  )[0]?.message;

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <>
              <FormLabel
                htmlFor={name}
                labelValue={localize(question.title_multiloc)}
                optional={!question.required}
                subtextValue={getSubtextElement(
                  localize(question.description_multiloc)
                )}
                subtextSupportsHtml
              />
              <InputMultilocWithLocaleSwitcherComponent
                id={name}
                {...field}
                {...rest}
                locales={locales}
                initiallySelectedLocale={locale}
                type="text"
                valueMultiloc={{ ...defaultValue, ...field.value }}
                hideLocaleSwitcher
                maxCharCount={120}
              />
            </>
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
    </>
  );
};

export default InputMultilocWithLocaleSwitcher;
