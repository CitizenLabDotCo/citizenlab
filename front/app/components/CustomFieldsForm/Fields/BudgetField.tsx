import React from 'react';

import { Box, colors, IconTooltip } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Input, { Props as InputProps } from 'components/HookForm/Input';
import Error, { TFieldName } from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props extends Omit<InputProps, 'onChange' | 'type'> {
  name: string;
  id?: string;
}

const BudgetField = ({ name }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();
  const { formatMessage } = useIntl();

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <FormLabel
        htmlFor={name}
        labelValue={
          <Box display="flex">
            {formatMessage(messages.budgetFieldLabel)}
            <IconTooltip
              iconColor={colors.grey800}
              marginLeft="4px"
              icon="shield-checkered"
              content={<FormattedMessage {...messages.adminFieldTooltip} />}
            />
          </Box>
        }
        optional
      />
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => (
          <Input id={name} type={'number'} {...field} />
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

export default BudgetField;
