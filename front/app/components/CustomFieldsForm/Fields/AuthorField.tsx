import React, { lazy, Suspense } from 'react';

import { Box, colors, IconTooltip } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import UserSelect from 'components/UI/UserSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

const AuthorComboBox = lazy(() => import('./AuthorComboBox'));

interface Props {
  name: string;
  id?: string;
  variant?: 'default' | 'panel';
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
  const apiErrorMessage = apiError && (
    <Error
      fieldName={name as TFieldName}
      apiErrors={apiError}
      marginTop="8px"
      marginBottom="8px"
      scrollIntoView={false}
    />
  );

  if (variant === 'panel') {
    return (
      <>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Suspense fallback={null}>
              <AuthorComboBox
                placeholder={formatMessage(messages.authorFieldPlaceholder)}
                value={field.value ?? null}
                errorMessage={validationError}
                onChange={(userId) => setValue(name, userId)}
              />
            </Suspense>
          )}
        />
        {apiErrorMessage}
      </>
    );
  }

  return (
    <>
      <FormLabel
        htmlFor={name}
        labelValue={
          <Box display="flex">
            {formatMessage(messages.authorFieldLabel)}
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
      {apiErrorMessage}
    </>
  );
};

export default AuthorField;
