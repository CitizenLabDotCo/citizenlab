import React from 'react';

import {
  Box,
  colors,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import formMessages from 'components/UI/FormComponents/messages';
import UserSelect, { Props as UserSelectProps } from 'components/UI/UserSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props extends Omit<UserSelectProps, 'onChange' | 'selectedUserId'> {
  name: string;
  id?: string;
}

const AuthorField = ({ name, id, variant }: Props) => {
  const {
    setValue,
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();
  const { formatMessage } = useIntl();
  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);
  const adminTooltip = (
    <IconTooltip
      iconColor={colors.grey800}
      marginLeft="4px"
      icon="shield-checkered"
      content={<FormattedMessage {...messages.adminFieldTooltip} />}
    />
  );

  return (
    <>
      <FormLabel
        htmlFor={name}
        labelValue={
          variant === 'bo' ? (
            <Box display="flex" alignItems="center" gap="4px">
              <Text as="span" variant="boHelper" fontSize="xs" m="0">
                {formatMessage(messages.authorFieldLabel)}
              </Text>
              {adminTooltip}
              <Text as="span" variant="boHelper" fontSize="xs" m="0">
                ({formatMessage(formMessages.optional)})
              </Text>
            </Box>
          ) : (
            <Box display="flex">
              {formatMessage(messages.authorFieldLabel)}
              {adminTooltip}
            </Box>
          )
        }
        // The back-office label carries its own optional hint, in its type size.
        optional={variant !== 'bo'}
      />
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <UserSelect
              id={id}
              inputId={name}
              selectedUserId={field.value}
              onChange={(userOption) => {
                setValue(name, userOption?.id || null);
              }}
              placeholder={formatMessage(messages.authorFieldPlaceholder)}
              variant={variant}
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

export default AuthorField;
