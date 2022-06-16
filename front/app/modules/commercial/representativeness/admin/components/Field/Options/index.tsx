import React from 'react';
import { Formik, FormikProps, FormikActions, FormikErrors } from 'formik';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import OptionToggle from './OptionToggle';
import OptionInput from './OptionInput';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  fieldId: string;
}

export interface OptionValue {
  enabled: boolean;
  population?: number;
}

type FormValues = Record<string, OptionValue>;

const validateForm = (values: FormValues): FormikErrors<FormValues> => {
  console.log(values);
  // TODO
  return {};
};

const handleSubmit = (
  values: FormValues,
  { setSubmitting, setStatus }: FormikActions<FormValues>
) => {
  console.log(values);
  console.log(setSubmitting);
  console.log(setStatus);
  // TODO
};

const Options = ({ fieldId }: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(fieldId);
  const localize = useLocalize();

  if (isNilOrError(userCustomFieldOptions)) return null;

  const renderFn = ({
    isSubmitting,
    touched,
    status,
    handleSubmit,
  }: FormikProps<FormValues>) => (
    <form onSubmit={handleSubmit}>
      {userCustomFieldOptions.map(({ id, attributes }) => (
        <>
          <Box pl="8px" display="flex" alignItems="center" width="50%">
            <OptionToggle optionId={id} />

            <Text ml="12px" variant="bodyM" color="adminTextColor">
              {localize(attributes.title_multiloc)}
            </Text>
          </Box>

          <Box ml="-20px" display="flex" alignItems="center" width="50%">
            <OptionInput optionId={id} />
          </Box>
        </>
      ))}

      <FormikSubmitWrapper
        isSubmitting={isSubmitting}
        status={status}
        touched={touched}
      />
    </form>
  );

  return (
    <Formik
      initialValues={{}}
      render={renderFn}
      validate={validateForm}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={handleSubmit}
    />
  );
};

export default Options;
